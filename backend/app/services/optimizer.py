from typing import List, Dict, Any, Optional, Tuple
import math
from datetime import time
from app.services.routing import haversine_distance, estimate_travel_time_minutes, get_distance_and_duration_matrix

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

def is_within_opening_hours(current_minutes: int, duration_minutes: int, opening_hours: Optional[Dict[str, Any]]) -> bool:
    """
    Check if visit fits in opening hours if provided.
    Default opening 07:30 to 22:00 if no data.
    """
    if not opening_hours or not isinstance(opening_hours, dict):
        return 450 <= current_minutes <= 1320 # 07:30 - 22:00
    
    # Try finding today's hours or a generic key
    first_slot = next(iter(opening_hours.values()), None)
    if isinstance(first_slot, list) and len(first_slot) == 2:
        open_m = parse_time_to_minutes(first_slot[0])
        close_m = parse_time_to_minutes(first_slot[1])
        if close_m <= open_m:
            close_m += 1440
        return open_m <= current_minutes and (current_minutes + duration_minutes) <= close_m

    return True

def plan_greedy_day_itinerary(
    day_number: int,
    candidate_pois: List[Dict[str, Any]],
    start_pos: Optional[Tuple[float, float]] = None,
    day_start_minutes: int = 510, # 08:30 AM
    day_end_minutes: int = 1290,   # 21:30 PM
    max_pois_per_day: int = 5
) -> Dict[str, Any]:
    """
    Greedy Nearest Neighbor with Time Window (Sprint 4 Baseline):
    Selects the next POI that maximizes:
        Utility = (AI_Score * 10) - (Distance_KM * 1.5) - (Wait_Time_Penalty)
    and fits in remaining daytime schedule.
    """
    unvisited = candidate_pois.copy()
    current_time = day_start_minutes
    current_pos = start_pos
    itinerary_items = []
    
    # If no start pos provided, start from highest rated/scored POI
    if not current_pos and unvisited:
        # Choose the best rated or highest scored POI as anchor
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
            
            # Check if exceeds day limit
            if departure_time > day_end_minutes:
                continue
                
            ai_score = float(p.get("ai_score") or (p.get("rating", 4.0) * 2))
            
            # Category variety bonus: if previous POI was food and this is attraction, give bonus
            prev_poi = itinerary_items[-1]["poi"] if itinerary_items else None
            variety_bonus = 0.0
            if prev_poi and prev_poi.get("category") != p.get("category"):
                variety_bonus = 3.0
                
            # Score formula balancing Quality vs Travel Effort
            utility = (ai_score * 4.0) - (dist_km * 2.5) + variety_bonus
            
            if utility > best_score:
                best_score = utility
                best_poi = p
                best_travel_time = travel_m
                best_dist_m = int(dist_km * 1000)
                
        if not best_poi:
            # No more feasible POIs fit today's time window
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
    city_center: Tuple[float, float] = (15.8800, 108.3300)
) -> List[Dict[str, Any]]:
    """
    Distributes and schedules candidate POIs across multi-day trip using Greedy Baseline.
    Returns list of days with scheduled items.
    """
    days = []
    unvisited = candidate_pois.copy()
    
    # Sort initially by AI score or rating
    unvisited.sort(key=lambda x: (x.get("ai_score") or x.get("rating", 4.0)), reverse=True)
    
    start_pos = city_center
    
    for day in range(1, num_days + 1):
        if not unvisited:
            break
            
        day_plan = plan_greedy_day_itinerary(
            day_number=day,
            candidate_pois=unvisited,
            start_pos=start_pos,
            day_start_minutes=510, # 08:30
            day_end_minutes=1290,  # 21:30
            max_pois_per_day=5
        )
        
        days.append({
            "day_number": day,
            "items": day_plan["items"]
        })
        
        unvisited = day_plan["remaining_unvisited"]
        
        # Next day starts near where previous day ended or center
        if day_plan["items"]:
            last_item = day_plan["items"][-1]["poi"]
            start_pos = (last_item["latitude"], last_item["longitude"])
        else:
            start_pos = city_center

    return days
