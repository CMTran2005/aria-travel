export interface SavedTrip {
  id: string;
  title: string;
  city: string;
  num_days: number;
  created_at: number; // timestamp
}

const STORAGE_KEY = "aria_recent_trips";

export function getSavedTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTripToHistory(trip: {
  id: string;
  title?: string;
  city?: string;
  num_days?: number;
}): SavedTrip[] {
  if (typeof window === "undefined" || !trip.id) return [];
  try {
    const existing = getSavedTrips();
    // Filter out if already exists, then prepend to top
    const filtered = existing.filter((t) => t.id !== trip.id);
    const newEntry: SavedTrip = {
      id: trip.id,
      title: trip.title || `Chuyến đi ${trip.city || "Việt Nam"}`,
      city: trip.city || "Việt Nam",
      num_days: trip.num_days || 1,
      created_at: Date.now(),
    };
    // Keep maximum 15 most recent trips
    const updated = [newEntry, ...filtered].slice(0, 15);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event so all open header components sync instantly
    window.dispatchEvent(new Event("aria_trips_updated"));
    return updated;
  } catch {
    return [];
  }
}

export function removeTripFromHistory(id: string): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getSavedTrips();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("aria_trips_updated"));
    return updated;
  } catch {
    return [];
  }
}

