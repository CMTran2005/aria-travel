import { ItineraryDay } from "@/components/timeline/DayTimeline";
import { DINING_CATEGORIES, calculateRoadDistanceKm, calculatePolylineDistanceKm } from "@/lib/formatters";

export interface DayBudgetSummary {
  ticketCostVnd: number;
  diningCostMinVnd: number;
  diningCostMaxVnd: number;
  transitCostVnd: number;
  totalKm: number;
  totalMinVnd: number;
  totalMaxVnd: number;
}

/**
 * Calculates transparent budget breakdown (Tickets, Dining range, Transit fare)
 * for a specific day in an itinerary.
 */
export function calculateDayCostSummary(currentDay: ItineraryDay | null): DayBudgetSummary | null {
  if (!currentDay || !currentDay.items || currentDay.items.length === 0) return null;

  let ticketCostUsd = 0;
  let diningCostMinUsd = 0;
  let diningCostMaxUsd = 0;
  let rawMeters = 0;

  currentDay.items.forEach((item) => {
    const rawCost = item.poi?.avg_cost_usd || 0;
    // Normalize cost: if >= 1000, it's VND; otherwise USD
    const costUsd = rawCost >= 1000 ? rawCost / 25000 : rawCost;
    const cat = (item.poi?.category || "")
      .toLowerCase()
      .replace(/^(amenity=|tourism=|historic=|leisure=)/, "")
      .trim();

    if (DINING_CATEGORIES.has(cat)) {
      diningCostMinUsd += costUsd;
      diningCostMaxUsd += costUsd * 1.6;
    } else {
      ticketCostUsd += costUsd;
    }

    if (item.travel_distance_meters) {
      rawMeters += item.travel_distance_meters;
    }
  });

  // 1. Calculate actual travel distance (km)
  // First try: from OSRM route polyline (exact driving path)
  let totalKm = calculatePolylineDistanceKm(currentDay.route_geometry);

  // Second try: from consecutive POI coordinates (Haversine * 1.35 road factor)
  if (totalKm <= 0 && currentDay.items.length > 1) {
    for (let i = 1; i < currentDay.items.length; i++) {
      const prev = currentDay.items[i - 1]?.poi;
      const curr = currentDay.items[i]?.poi;
      if (prev?.latitude && prev?.longitude && curr?.latitude && curr?.longitude) {
        totalKm += calculateRoadDistanceKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
      } else if (currentDay.items[i]?.travel_time_to_prev_minutes) {
        totalKm += (currentDay.items[i].travel_time_to_prev_minutes || 10) * 0.4;
      }
    }
  }

  // Third try: from raw meters if present
  if (totalKm <= 0 && rawMeters > 0) {
    totalKm = rawMeters / 1000;
  }

  // Fallback: if multiple stops exist but totalKm still 0, estimate ~3.5 km per stop
  const numTrips = Math.max(0, currentDay.items.length - 1);
  if (totalKm <= 0 && numTrips > 0) {
    totalKm = numTrips * 3.5;
  }

  // Realistic transit fare (Grab / Taxi in Vietnam):
  // Base flag-fall fare: ~15,000 VND / trip + ~11,000 VND / km, rounded to nearest 1,000 VND
  const transitCostVnd = numTrips > 0 ? Math.round((numTrips * 15000 + totalKm * 11000) / 1000) * 1000 : 0;
  const transitCostUsd = transitCostVnd / 25000;

  const totalMinUsd = ticketCostUsd + diningCostMinUsd + transitCostUsd;
  const totalMaxUsd = ticketCostUsd + diningCostMaxUsd + transitCostUsd * 1.15;

  return {
    ticketCostVnd: Math.round((ticketCostUsd * 25000) / 1000) * 1000,
    diningCostMinVnd: Math.round((diningCostMinUsd * 25000) / 1000) * 1000,
    diningCostMaxVnd: Math.round((diningCostMaxUsd * 25000) / 1000) * 1000,
    transitCostVnd,
    totalKm,
    totalMinVnd: Math.round((totalMinUsd * 25000) / 1000) * 1000,
    totalMaxVnd: Math.round((totalMaxUsd * 25000) / 1000) * 1000,
  };
}
