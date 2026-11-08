export interface SavedTrip {
  id: string;
  title: string;
  city: string;
  num_days: number;
  created_at: number; // timestamp
  data?: any; // cached full trip object (for instant offline recovery / fallback)
}

const STORAGE_KEY = "aria_recent_trips";
const FULL_TRIPS_PREFIX = "aria_trip_data_";

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

export function saveCachedTripData(tripId: string, fullData: any) {
  if (typeof window === "undefined" || !tripId || !fullData) return;
  try {
    localStorage.setItem(`${FULL_TRIPS_PREFIX}${tripId}`, JSON.stringify(fullData));
  } catch {
    // quota exceeded or private browsing
  }
}

export function getCachedTripData(tripId: string): any | null {
  if (typeof window === "undefined" || !tripId) return null;
  try {
    const raw = localStorage.getItem(`${FULL_TRIPS_PREFIX}${tripId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTripToHistory(trip: {
  id: string;
  title?: string;
  city?: string;
  num_days?: number;
  data?: any;
}): SavedTrip[] {
  if (typeof window === "undefined" || !trip.id) return [];
  try {
    if (trip.data) {
      saveCachedTripData(trip.id, trip.data);
    }

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

/**
 * Fetch trips owned by the user from Supabase and merge with local history
 */
export async function syncCloudTrips(supabaseClient: any, userId: string): Promise<SavedTrip[]> {
  if (typeof window === "undefined" || !userId || !supabaseClient) return getSavedTrips();
  try {
    const { data, error } = await supabaseClient
      .from("trips")
      .select("id, title, city, days, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error || !data) return getSavedTrips();

    const localTrips = getSavedTrips();
    const cloudTrips: SavedTrip[] = data.map((t: any) => ({
      id: t.id,
      title: t.title || `Chuyến đi ${t.city || "Việt Nam"}`,
      city: t.city || "Việt Nam",
      num_days: Array.isArray(t.days) ? t.days.length : 1,
      created_at: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
    }));

    // Merge: prioritize cloud trips, append unique local trips
    const combinedMap = new Map<string, SavedTrip>();
    cloudTrips.forEach((t) => combinedMap.set(t.id, t));
    localTrips.forEach((t) => {
      if (!combinedMap.has(t.id)) combinedMap.set(t.id, t);
    });

    const merged = Array.from(combinedMap.values()).slice(0, 15);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("aria_trips_updated"));
    return merged;
  } catch {
    return getSavedTrips();
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


