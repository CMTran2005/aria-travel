import math
import httpx
from typing import List, Tuple, Dict, Any

def haversine_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate the great circle distance between two points on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    coord = (latitude, longitude)
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Earth radius in kilometers
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def estimate_travel_time_minutes(distance_km: float, avg_speed_kmh: float = 25.0) -> int:
    """
    Estimate city travel time (including urban traffic & parking buffers).
    Default 25 km/h for urban areas (Hoi An / Da Nang / etc.).
    Minimum 5 minutes buffer.
    """
    travel_hours = distance_km / max(avg_speed_kmh, 5.0)
    minutes = int(math.ceil(travel_hours * 60)) + 3 # +3 mins for parking / walking
    return max(5, minutes)

def get_distance_and_duration_matrix(coords: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Computes NxN distance (meters) and duration (seconds) matrices for a list of coordinates [(lat, lon), ...].
    Uses public OSRM (Open Source Routing Machine) API with automatic Haversine fallback.
    """
    n = len(coords)
    if n == 0:
        return {"distances": [], "durations": []}
    if n == 1:
        return {"distances": [[0.0]], "durations": [[0.0]]}

    # Format for OSRM: lon,lat;lon,lat;...
    coordinates_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in coords])
    osrm_url = f"http://router.project-osrm.org/table/v1/driving/{coordinates_str}?annotations=distance,duration"

    try:
        with httpx.Client(timeout=4.0) as client:
            response = client.get(osrm_url)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok":
                    return {
                        "distances": data.get("distances", []),
                        "durations": data.get("durations", [])
                    }
    except Exception as e:
        print(f"[Routing] OSRM table request failed ({e}), falling back to Haversine calculation.")

    # Fallback: Haversine distance matrix + estimated duration
    distances = [[0.0] * n for _ in range(n)]
    durations = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i != j:
                dist_km = haversine_distance(coords[i], coords[j])
                distances[i][j] = dist_km * 1000.0 # meters
                durations[i][j] = estimate_travel_time_minutes(dist_km) * 60.0 # seconds
            else:
                distances[i][j] = 0.0
                durations[i][j] = 0.0

    return {
        "distances": distances,
        "durations": durations
    }

def get_route_geometry(coords: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
    """
    Fetch road-following polyline coordinates between a sequence of waypoints via OSRM.
    Returns list of [latitude, longitude] points for Leaflet polyline.
    If OSRM fails, returns the waypoints directly.
    """
    if len(coords) < 2:
        return coords

    coordinates_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in coords])
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{coordinates_str}?overview=full&geometries=geojson"

    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(osrm_url)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    geojson_coords = data["routes"][0]["geometry"]["coordinates"]
                    # GeoJSON coordinates are [lon, lat] -> convert to [lat, lon]
                    return [[lat, lon] for lon, lat in geojson_coords]
    except Exception as e:
        print(f"[Routing] OSRM route request failed ({e}), using direct waypoints.")

    return [[lat, lon] for lat, lon in coords]
