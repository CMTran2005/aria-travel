from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import KMeans

def cluster_pois_by_day(
    pois: List[Dict[str, Any]],
    num_days: int
) -> Dict[int, List[Dict[str, Any]]]:
    """
    K-Means Geographic Clustering for Multi-day Trips (Sprint 5):
    Groups candidate POIs by spatial proximity so that each day's travel
    is geographically coherent and minimizes transit across the entire city.
    
    Args:
        pois: List of candidate POI dictionaries (with 'latitude' and 'longitude')
        num_days: Number of days in the itinerary
        
    Returns:
        Dictionary mapping day_index (0 to num_days-1) to list of POIs for that day.
    """
    if not pois:
        return {d: [] for d in range(num_days)}

    # If number of days is 1 or POIs count is smaller than num_days, no clustering needed
    if num_days <= 1 or len(pois) <= num_days:
        clusters = {d: [] for d in range(num_days)}
        for idx, poi in enumerate(pois):
            clusters[idx % num_days].append(poi)
        return clusters

    # Extract coordinates
    coords = np.array([[p["latitude"], p["longitude"]] for p in pois])

    # Run K-Means with deterministic random_state
    n_clusters = min(num_days, len(pois))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords)

    clusters: Dict[int, List[Dict[str, Any]]] = {d: [] for d in range(num_days)}
    for poi, label in zip(pois, labels):
        clusters[int(label)].append(poi)

    # Sort each cluster's POIs primarily by AI score / rating
    for d in clusters:
        clusters[d].sort(
            key=lambda p: float(p.get("ai_score") or (p.get("rating", 4.0) * 2)),
            reverse=True
        )

    return clusters
