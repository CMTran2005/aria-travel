import uuid
from typing import Dict, Any, List, Optional
from app.services.osm_fetcher import CURATED_HOI_AN_POIS, CURATED_DALAT_POIS, CURATED_DANANG_POIS

# In-memory store for fallback trips when external database is unreachable
FALLBACK_TRIPS: Dict[str, Dict[str, Any]] = {}

def get_curated_pois_for_city(city: Optional[str]) -> List[Dict[str, Any]]:
    all_curated = list(CURATED_HOI_AN_POIS) + list(CURATED_DALAT_POIS) + list(CURATED_DANANG_POIS)
    target = (city or "").strip().lower()
    matched = []
    for idx, p in enumerate(all_curated):
        if not target or p.get("city", "").lower() == target:
            matched.append({
                "id": idx + 1,
                "name": p.get("name"),
                "category": p.get("category"),
                "city": p.get("city"),
                "address": p.get("address", ""),
                "latitude": p.get("latitude"),
                "longitude": p.get("longitude"),
                "avg_duration_minutes": p.get("avg_duration_minutes", 60),
                "avg_cost_usd": p.get("avg_cost_usd", 0.0),
                "rating": p.get("rating", 4.5),
                "tags": p.get("tags", []),
                "source": "curated"
            })
    return matched or [
        {
            "id": idx + 1,
            "name": p.get("name"),
            "category": p.get("category"),
            "city": p.get("city"),
            "address": p.get("address", ""),
            "latitude": p.get("latitude"),
            "longitude": p.get("longitude"),
            "avg_duration_minutes": p.get("avg_duration_minutes", 60),
            "avg_cost_usd": p.get("avg_cost_usd", 0.0),
            "rating": p.get("rating", 4.5),
            "tags": p.get("tags", []),
            "source": "curated"
        }
        for idx, p in enumerate(CURATED_HOI_AN_POIS)
    ]

def save_fallback_trip(trip_id: str, trip_data: Dict[str, Any]):
    FALLBACK_TRIPS[trip_id] = trip_data

def get_fallback_trip(trip_id: str) -> Optional[Dict[str, Any]]:
    return FALLBACK_TRIPS.get(trip_id)

