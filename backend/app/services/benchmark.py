import time
from typing import List, Dict, Any, Tuple
from app.services.optimizer import (
    plan_greedy_day_itinerary,
    solve_day_tsptw_ortools
)
from app.services.clusterer import cluster_pois_by_day
from app.services.routing import haversine_distance

def compute_total_route_metrics(items: List[Dict[str, Any]], start_pos: Tuple[float, float]) -> Tuple[float, int]:
    """
    Computes total travel distance (km) and total travel time (minutes) for a route.
    """
    if not items:
        return 0.0, 0

    total_dist_km = 0.0
    total_travel_minutes = 0
    curr = start_pos

    for it in items:
        p_lat = it["poi"]["latitude"]
        p_lon = it["poi"]["longitude"]
        dist = haversine_distance(curr, (p_lat, p_lon))
        total_dist_km += dist
        total_travel_minutes += it.get("travel_time_to_prev_minutes", 0)
        curr = (p_lat, p_lon)

    return round(total_dist_km, 2), total_travel_minutes

def benchmark_greedy_vs_ortools(
    pois: List[Dict[str, Any]],
    num_days: int = 2,
    city_center: Tuple[float, float] = (15.8800, 108.3300)
) -> Dict[str, Any]:
    """
    Sprint 5 Benchmark: Compares Greedy Baseline vs OR-Tools TSPTW + K-Means
    Returns performance metrics, distance reduction %, and computation times.
    """
    # 1. Run Greedy Baseline
    start_time_g = time.perf_counter()
    greedy_days = []
    unvisited_g = pois.copy()
    curr_pos_g = city_center

    for day in range(1, num_days + 1):
        if not unvisited_g:
            break
        g_plan = plan_greedy_day_itinerary(
            day_number=day,
            candidate_pois=unvisited_g,
            start_pos=curr_pos_g,
            day_start_minutes=510,
            day_end_minutes=1290,
            max_pois_per_day=5
        )
        greedy_days.append(g_plan["items"])
        unvisited_g = g_plan["remaining_unvisited"]
        if g_plan["items"]:
            last_p = g_plan["items"][-1]["poi"]
            curr_pos_g = (last_p["latitude"], last_p["longitude"])

    greedy_calc_time_ms = round((time.perf_counter() - start_time_g) * 1000, 2)

    # 2. Run OR-Tools + K-Means
    start_time_opt = time.perf_counter()
    clusters = cluster_pois_by_day(pois, num_days)
    ortools_days = []
    curr_pos_opt = city_center

    for day_idx in range(num_days):
        day_number = day_idx + 1
        day_pois = clusters.get(day_idx, [])[:6]
        items = None
        if len(day_pois) >= 2:
            try:
                items = solve_day_tsptw_ortools(
                    pois=day_pois,
                    start_pos=curr_pos_opt,
                    day_start_minutes=510,
                    day_end_minutes=1290,
                    time_limit_seconds=3
                )
            except Exception:
                items = None

        if not items:
            fb = plan_greedy_day_itinerary(
                day_number=day_number,
                candidate_pois=day_pois,
                start_pos=curr_pos_opt,
                day_start_minutes=510,
                day_end_minutes=1290,
                max_pois_per_day=5
            )
            items = fb["items"]

        ortools_days.append(items or [])
        if items:
            last_p = items[-1]["poi"]
            curr_pos_opt = (last_p["latitude"], last_p["longitude"])

    ortools_calc_time_ms = round((time.perf_counter() - start_time_opt) * 1000, 2)

    # 3. Aggregate totals
    greedy_total_km = 0.0
    greedy_total_minutes = 0
    greedy_poi_count = sum(len(d) for d in greedy_days)
    for day_items in greedy_days:
        d_km, d_min = compute_total_route_metrics(day_items, city_center)
        greedy_total_km += d_km
        greedy_total_minutes += d_min

    ortools_total_km = 0.0
    ortools_total_minutes = 0
    ortools_poi_count = sum(len(d) for d in ortools_days)
    for day_items in ortools_days:
        d_km, d_min = compute_total_route_metrics(day_items, city_center)
        ortools_total_km += d_km
        ortools_total_minutes += d_min

    distance_improvement_pct = 0.0
    if greedy_total_km > 0:
        distance_improvement_pct = round(
            ((greedy_total_km - ortools_total_km) / greedy_total_km) * 100, 1
        )

    return {
        "num_days": num_days,
        "input_pois_count": len(pois),
        "greedy_baseline": {
            "total_distance_km": round(greedy_total_km, 2),
            "total_travel_minutes": greedy_total_minutes,
            "pois_visited": greedy_poi_count,
            "runtime_ms": greedy_calc_time_ms
        },
        "ortools_optimization": {
            "total_distance_km": round(ortools_total_km, 2),
            "total_travel_minutes": ortools_total_minutes,
            "pois_visited": ortools_poi_count,
            "runtime_ms": ortools_calc_time_ms
        },
        "distance_improvement_percent": distance_improvement_pct,
        "time_saving_minutes": max(0, greedy_total_minutes - ortools_total_minutes)
    }
