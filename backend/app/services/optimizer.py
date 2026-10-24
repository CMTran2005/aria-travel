from typing import List, Dict, Any, Optional, Tuple
import math
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
from app.services.routing import haversine_distance, estimate_travel_time_minutes
from app.services.clusterer import cluster_pois_by_day

def parse_time_to_minutes(time_str: Optional[str]) -> int:
    """Parse '08:30' or '08:30:00' to minutes from midnight."""
    if not time_str:
        return 0
    try:
        parts = time_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def format_minutes_to_time(minutes: int) -> str:
    """Format minutes from midnight back to 'HH:MM'."""
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def solve_day_tsptw_ortools(
    pois: List[Dict[str, Any]],
    start_pos: Tuple[float, float],
    day_start_minutes: int = 510,  # 08:30 AM
    day_end_minutes: int = 1290,    # 21:30 PM
    time_limit_seconds: int = 5
) -> Optional[List[Dict[str, Any]]]:
    """
    Solves TSP with Time Windows (TSPTW) for a single day using Google OR-Tools:
    Node 0 is the starting Depot (Hotel / City Center).
    Nodes 1..N are the POIs to visit.
    
    Returns ordered list of itinerary item dictionaries, or None if no feasible solution.
    """
    if not pois:
        return []

    # Node 0 = Depot (start_pos), Nodes 1..N = POIs
    locations = [start_pos] + [(p["latitude"], p["longitude"]) for p in pois]
    num_nodes = len(locations)

    # Durations at each node (Depot has 0 duration)
    service_times = [0] + [int(p.get("avg_duration_minutes") or 60) for p in pois]

    # Time windows for each node in minutes from midnight
    # Depot: [day_start_minutes, day_end_minutes]
    time_windows = [(day_start_minutes, day_end_minutes)]
    for p in pois:
        op = p.get("opening_hours")
        if isinstance(op, dict) and op:
            first_slot = next(iter(op.values()), None)
            if isinstance(first_slot, list) and len(first_slot) == 2:
                o_min = max(day_start_minutes, parse_time_to_minutes(first_slot[0]))
                c_min = min(day_end_minutes, parse_time_to_minutes(first_slot[1]))
                if c_min > o_min:
                    time_windows.append((o_min, c_min))
                    continue
        # Default opening window for POI
        time_windows.append((day_start_minutes, day_end_minutes))

    # Compute travel time matrix (in minutes)
    transit_matrix = []
    dist_matrix_meters = []
    for i in range(num_nodes):
        row_time = []
        row_dist = []
        for j in range(num_nodes):
            if i == j:
                row_time.append(0)
                row_dist.append(0)
            else:
                dist_km = haversine_distance(locations[i], locations[j])
                dist_m = int(dist_km * 1000)
                t_min = estimate_travel_time_minutes(dist_km)
                row_time.append(t_min)
                row_dist.append(dist_m)
        transit_matrix.append(row_time)
        dist_matrix_meters.append(row_dist)

    # Setup OR-Tools Routing Model
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    # Distance callback for arc cost evaluator (minimizes total distance traveled)
    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(dist_matrix_meters[from_node][to_node])

    dist_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(dist_callback_index)

    # Time callback for time window dimension (travel time + service time)
    def time_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(transit_matrix[from_node][to_node] + service_times[from_node])

    time_callback_index = routing.RegisterTransitCallback(time_callback)

    # Time Dimension: max wait 60 mins, horizon 1440 mins
    time_dim_name = "Time"
    routing.AddDimension(
        time_callback_index,
        60,    # Max waiting slack time
        1440,  # Max horizon
        False, # Don't force start cumul to zero
        time_dim_name
    )
    time_dimension = routing.GetDimensionOrDie(time_dim_name)

    # Add Time Windows constraints
    for node_idx, (start_w, end_w) in enumerate(time_windows):
        index = manager.NodeToIndex(node_idx)
        time_dimension.CumulVar(index).SetRange(start_w, end_w)

    # Allow dropping POIs with penalty ONLY if time window genuinely cannot fit
    for node_idx in range(1, num_nodes):
        # High penalty ensures OR-Tools prefers visiting POI over dropping
        penalty = 50000
        routing.AddDisjunction([manager.NodeToIndex(node_idx)], penalty)

    # Search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = time_limit_seconds

    # Solve
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return None

    # Extract solution route
    ordered_items = []
    index = routing.Start(0)
    prev_node = 0
    visit_order = 1

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node != 0:
            poi = pois[node - 1]
            time_var = time_dimension.CumulVar(index)
            start_m = solution.Min(time_var)
            duration_m = service_times[node]
            end_m = start_m + duration_m

            travel_m = transit_matrix[prev_node][node]
            travel_d = dist_matrix_meters[prev_node][node]

            ordered_items.append({
                "poi_id": poi["id"],
                "poi": poi,
                "visit_order": visit_order,
                "planned_start": format_minutes_to_time(start_m),
                "planned_end": format_minutes_to_time(end_m),
                "travel_time_to_prev_minutes": travel_m,
                "travel_distance_meters": travel_d,
                "status": "planned"
            })
            visit_order += 1
            prev_node = node

        index = solution.Value(routing.NextVar(index))

    return ordered_items

def plan_greedy_day_itinerary(
    day_number: int,
    candidate_pois: List[Dict[str, Any]],
    start_pos: Optional[Tuple[float, float]] = None,
    day_start_minutes: int = 510,
    day_end_minutes: int = 1290,
    max_pois_per_day: int = 5
) -> Dict[str, Any]:
    """Greedy Nearest Neighbor with Utility score (Sprint 4 Baseline)"""
    unvisited = candidate_pois.copy()
    current_time = day_start_minutes
    current_pos = start_pos
    itinerary_items = []

    if not current_pos and unvisited:
        unvisited.sort(key=lambda p: (p.get("ai_score") or p.get("rating", 4.0)), reverse=True)
        first_poi = unvisited.pop(0)
        current_pos = (first_poi["latitude"], first_poi["longitude"])

        duration = first_poi.get("avg_duration_minutes") or 90
        start_t = current_time
        end_t = start_t + duration

        itinerary_items.append({
            "poi_id": first_poi["id"],
            "poi": first_poi,
            "visit_order": 1,
            "planned_start": format_minutes_to_time(start_t),
            "planned_end": format_minutes_to_time(end_t),
            "travel_time_to_prev_minutes": 0,
            "travel_distance_meters": 0,
            "status": "planned"
        })
        current_time = end_t

    order = len(itinerary_items) + 1

    while unvisited and order <= max_pois_per_day:
        best_poi = None
        best_score = -999999.0
        best_travel_time = 0
        best_dist_m = 0

        for p in unvisited:
            p_pos = (p["latitude"], p["longitude"])
            dist_km = haversine_distance(current_pos, p_pos)
            travel_m = estimate_travel_time_minutes(dist_km)

            p_duration = p.get("avg_duration_minutes") or 75
            arrival_time = current_time + travel_m
            departure_time = arrival_time + p_duration

            if departure_time > day_end_minutes:
                continue

            ai_score = float(p.get("ai_score") or (p.get("rating", 4.0) * 2))
            prev_poi = itinerary_items[-1]["poi"] if itinerary_items else None
            variety_bonus = 3.0 if prev_poi and prev_poi.get("category") != p.get("category") else 0.0

            utility = (ai_score * 4.0) - (dist_km * 2.5) + variety_bonus

            if utility > best_score:
                best_score = utility
                best_poi = p
                best_travel_time = travel_m
                best_dist_m = int(dist_km * 1000)

        if not best_poi:
            break

        p_duration = best_poi.get("avg_duration_minutes") or 75
        arrival_time = current_time + best_travel_time
        departure_time = arrival_time + p_duration

        itinerary_items.append({
            "poi_id": best_poi["id"],
            "poi": best_poi,
            "visit_order": order,
            "planned_start": format_minutes_to_time(arrival_time),
            "planned_end": format_minutes_to_time(departure_time),
            "travel_time_to_prev_minutes": best_travel_time,
            "travel_distance_meters": best_dist_m,
            "status": "planned"
        })

        current_time = departure_time
        current_pos = (best_poi["latitude"], best_poi["longitude"])
        unvisited.remove(best_poi)
        order += 1

    return {
        "day_number": day_number,
        "items": itinerary_items,
        "remaining_unvisited": unvisited
    }

def schedule_multi_day_trip(
    candidate_pois: List[Dict[str, Any]],
    num_days: int = 2,
    city_center: Tuple[float, float] = (15.8800, 108.3300),
    use_ortools: bool = True
) -> List[Dict[str, Any]]:
    """
    Sprint 5 Multi-Day Itinerary Scheduler:
    1. Clusters candidate POIs geographically using K-Means.
    2. Solves each day's optimal route using Google OR-Tools TSPTW.
    3. Falls back gracefully to Greedy Nearest Neighbor if OR-Tools yields no solution.
    """
    days = []

    # Step 1: Spatial K-Means Clustering by Day
    clusters = cluster_pois_by_day(candidate_pois, num_days)

    current_start_pos = city_center

    for day_idx in range(num_days):
        day_number = day_idx + 1
        day_pois = clusters.get(day_idx, [])[:6] # Up to 6 POIs per day

        day_items = None
        if use_ortools and len(day_pois) >= 2:
            try:
                day_items = solve_day_tsptw_ortools(
                    pois=day_pois,
                    start_pos=current_start_pos,
                    day_start_minutes=510, # 08:30 AM
                    day_end_minutes=1290,  # 21:30 PM
                    time_limit_seconds=3
                )
            except Exception:
                day_items = None

        # Fallback to Greedy if OR-Tools is disabled or produced empty/infeasible result
        if not day_items:
            fallback = plan_greedy_day_itinerary(
                day_number=day_number,
                candidate_pois=day_pois if day_pois else candidate_pois,
                start_pos=current_start_pos,
                day_start_minutes=510,
                day_end_minutes=1290,
                max_pois_per_day=5
            )
            day_items = fallback["items"]

        days.append({
            "day_number": day_number,
            "items": day_items or []
        })

        # Update anchor location for next day
        if day_items:
            last_poi = day_items[-1]["poi"]
            current_start_pos = (last_poi["latitude"], last_poi["longitude"])
        else:
            current_start_pos = city_center

    return days
