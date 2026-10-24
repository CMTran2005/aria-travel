const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchHealth() {
  const res = await fetch(`${BACKEND_URL}/health`);
  return res.json();
}

export async function fetchPOIs(city: string = "Hội An", category?: string) {
  let url = `${BACKEND_URL}/api/pois/?city=${encodeURIComponent(city)}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch POIs: ${res.statusText}`);
  }
  return res.json();
}

export async function updatePOILocation(poiId: number, latitude: number, longitude: number) {
  const res = await fetch(`${BACKEND_URL}/api/pois/${poiId}/location`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ latitude, longitude }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update location: ${res.statusText}`);
  }
  return res.json();
}

export async function planTripWithAI(prompt: string, city: string = "Hội An", userId?: string) {
  const res = await fetch(`${BACKEND_URL}/api/trips/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_prompt: prompt,
      city: city,
      user_id: userId,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to plan trip: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTripDetail(tripId: string) {
  const res = await fetch(`${BACKEND_URL}/api/trips/${tripId}`, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch trip: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchWeather(city: string = "Hội An") {
  const res = await fetch(`${BACKEND_URL}/api/weather/${encodeURIComponent(city)}`, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch weather: ${res.statusText}`);
  }
  return res.json();
}

export async function replanTrip(
  tripId: string,
  triggerType: "weather_rain" | "poi_closed" | "traffic_delay" | "manual",
  dayNumber: number = 1,
  closedPoiId?: number,
  delayMinutes?: number
) {
  const res = await fetch(`${BACKEND_URL}/api/trips/${tripId}/replan`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trigger_type: triggerType,
      day_number: dayNumber,
      closed_poi_id: closedPoiId,
      delay_minutes: delayMinutes,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to replan trip: ${res.statusText}`);
  }
  return res.json();
}


