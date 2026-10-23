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
