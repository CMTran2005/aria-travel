import os
import json
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.services.osm_fetcher import CURATED_HOI_AN_POIS, CURATED_DALAT_POIS, CURATED_DANANG_POIS

# Local JSON storage directory for offline persistent trips
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "fallback_trips"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# In-memory cache synced with disk
FALLBACK_TRIPS: Dict[str, Dict[str, Any]] = {}

def _load_persisted_trips():
    try:
        for file in DATA_DIR.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and "id" in data:
                        FALLBACK_TRIPS[data["id"]] = data
            except Exception:
                pass
    except Exception:
        pass

# Initialize cache on import
_load_persisted_trips()

def save_fallback_trip(trip_id: str, trip_data: Dict[str, Any]):
    FALLBACK_TRIPS[trip_id] = trip_data
    try:
        filepath = DATA_DIR / f"{trip_id}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(trip_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[FallbackStore] Failed to write trip {trip_id} to disk: {e}")

def get_fallback_trip(trip_id: str) -> Optional[Dict[str, Any]]:
    if trip_id in FALLBACK_TRIPS:
        return FALLBACK_TRIPS[trip_id]
    
    # Try reading directly from disk if not in memory
    try:
        filepath = DATA_DIR / f"{trip_id}.json"
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data:
                    FALLBACK_TRIPS[trip_id] = data
                    return data
    except Exception:
        pass

    return None

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



