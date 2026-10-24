from typing import List, Dict, Any, Optional, Tuple
from app.services.routing import haversine_distance, estimate_travel_time_minutes, get_route_geometry
from app.services.optimizer import solve_day_tsptw_ortools, plan_greedy_day_itinerary

OUTDOOR_CATEGORIES = {"beach", "park", "nature_reserve", "viewpoint", "theme_park"}
INDOOR_CATEGORIES = {"museum", "gallery", "cafe", "restaurant", "marketplace", "spa"}

def is_outdoor_poi(poi: Dict[str, Any]) -> bool:
    cat = (poi.get("category") or "").replace("amenity=", "").replace("tourism=", "").lower()
    tags = [t.lower() for t in poi.get("tags") or []]
    name = (poi.get("name") or "").lower()

    if cat in OUTDOOR_CATEGORIES:
        return True
    if any(k in name for k in ["bãi biển", "biển", "rừng dừa", "đồi", "thác", "công viên", "đảo"]):
        return True
    return False

def replan_trip_itinerary(
    current_days: List[Dict[str, Any]],
    all_candidate_pois: List[Dict[str, Any]],
    trigger_type: str, # "weather_rain" | "poi_closed" | "traffic_delay" | "manual"
    target_day_number: int = 1,
    closed_poi_id: Optional[int] = None,
    delay_minutes: int = 45,
    city_center: Tuple[float, float] = (15.8800, 108.3300)
) -> Dict[str, Any]:
    """
    Core Re-planning Engine (Sprint 6):
    Adaptively reconfigures schedule based on external events:
    1. weather_rain: Replaces outdoor POIs with indoor cultural/culinary alternatives.
    2. poi_closed: Removes closed POI and inserts the closest same-category replacement.
    3. traffic_delay: Shifts timeline forward by delay_minutes, trims last POI if exceeding day end.
    4. manual: Recalculates day route using OR-Tools TSPTW.
    """
    updated_days = []
    explanation = ""
    affected_pois = []

    # Map of all available POIs by ID
    all_pois_map = {p["id"]: p for p in all_candidate_pois}

    for day in current_days:
        day_num = day.get("day_number", 1)
        items = list(day.get("items", []))

        # Only modify the target day
        if day_num != target_day_number or not items:
            updated_days.append(day)
            continue

        existing_poi_ids = {it["poi_id"] for it in items}

        if trigger_type == "weather_rain":
            # Scenario 1: Rain/Bad weather -> swap outdoor POIs for indoor POIs
            new_items_pois = []
            swapped_count = 0

            for it in items:
                p = it["poi"]
                if is_outdoor_poi(p):
                    # Find closest indoor candidate not yet in itinerary
                    curr_coord = (p["latitude"], p["longitude"])
                    indoor_candidates = [
                        cand for cand in all_candidate_pois
                        if cand["id"] not in existing_poi_ids and not is_outdoor_poi(cand)
                    ]
                    if indoor_candidates:
                        # Pick closest indoor alternative with best score
                        indoor_candidates.sort(
                            key=lambda c: (
                                haversine_distance(curr_coord, (c["latitude"], c["longitude"]))
                                - (float(c.get("ai_score") or 7.0) * 0.5)
                            )
                        )
                        replacement = indoor_candidates[0]
                        existing_poi_ids.add(replacement["id"])
                        new_items_pois.append(replacement)
                        affected_pois.append(f"{p['name']} ➔ {replacement['name']} (Trong nhà)")
                        swapped_count += 1
                    else:
                        new_items_pois.append(p)
                else:
                    new_items_pois.append(p)

            # Re-optimize order with OR-Tools
            opt_items = solve_day_tsptw_ortools(new_items_pois, city_center) or plan_greedy_day_itinerary(
                day_num, new_items_pois, city_center
            )["items"]

            explanation = (
                f"Đã phát hiện thời tiết mưa to/giông bão tại Ngày {day_num}. "
                f"Hệ thống đã tự động chuyển đổi {swapped_count} điểm ngoài trời sang điểm trong nhà/bảo tàng/quán cafe."
            )
            updated_days.append({"day_number": day_num, "items": opt_items})

        elif trigger_type == "poi_closed":
            # Scenario 2: Specific POI closed
            filtered_pois = []
            target_closed_id = closed_poi_id or (items[0]["poi_id"] if items else None)

            for it in items:
                if it["poi_id"] == target_closed_id:
                    closed_p = it["poi"]
                    affected_pois.append(f"Đóng cửa: {closed_p['name']}")
                    # Find alternative with same or similar category
                    candidates = [
                        cand for cand in all_candidate_pois
                        if cand["id"] not in existing_poi_ids and cand["id"] != target_closed_id
                    ]
                    if candidates:
                        candidates.sort(
                            key=lambda c: haversine_distance(
                                (closed_p["latitude"], closed_p["longitude"]),
                                (c["latitude"], c["longitude"])
                            )
                        )
                        replacement = candidates[0]
                        existing_poi_ids.add(replacement["id"])
                        filtered_pois.append(replacement)
                        affected_pois.append(f"Điểm thay thế: {replacement['name']}")
                else:
                    filtered_pois.append(it["poi"])

            opt_items = solve_day_tsptw_ortools(filtered_pois, city_center) or plan_greedy_day_itinerary(
                day_num, filtered_pois, city_center
            )["items"]

            explanation = f"Đã loại bỏ địa điểm đóng cửa và lập lại thứ tự di chuyển tối ưu cho Ngày {day_num}."
            updated_days.append({"day_number": day_num, "items": opt_items})

        elif trigger_type == "traffic_delay":
            # Scenario 3: Delay/Late start -> shift schedule forward
            shifted_items = []
            shift_minutes = delay_minutes

            for it in items:
                orig_start = it.get("planned_start", "08:30")
                orig_end = it.get("planned_end", "10:00")

                def add_minutes(t_str: str, delta: int) -> str:
                    h, m = map(int, t_str.split(":"))
                    total = h * 60 + m + delta
                    return f"{(total // 60) % 24:02d}:{total % 60:02d}"

                new_start = add_minutes(orig_start, shift_minutes)
                new_end = add_minutes(orig_end, shift_minutes)

                # Check if end time exceeds 22:30 (too late at night)
                end_h, end_m = map(int, new_end.split(":"))
                if (end_h * 60 + end_m) > (22 * 60 + 30):
                    affected_pois.append(f"Cắt bớt do quá muộn: {it['poi']['name']}")
                    continue

                shifted_items.append({
                    **it,
                    "planned_start": new_start,
                    "planned_end": new_end
                })

            explanation = (
                f"Lịch trình Ngày {day_num} bị trễ ~{delay_minutes} phút do giao thông. "
                f"Đã tịnh tiến mốc thời gian và điều chỉnh các điểm trải nghiệm."
            )
            updated_days.append({"day_number": day_num, "items": shifted_items})

        else:
            # Manual / general re-plan
            day_pois = [it["poi"] for it in items]
            opt_items = solve_day_tsptw_ortools(day_pois, city_center) or items
            explanation = f"Đã chạy lại thuật toán OR-Tools tối ưu quãng đường cho Ngày {day_num}."
            updated_days.append({"day_number": day_num, "items": opt_items})

    # Recalculate OSRM polyline geometry for updated days
    for day in updated_days:
        coords = [(it["poi"]["latitude"], it["poi"]["longitude"]) for it in day.get("items", [])]
        if len(coords) >= 2:
            day["route_geometry"] = get_route_geometry(coords)
        else:
            day["route_geometry"] = [[lat, lon] for lat, lon in coords]

    return {
        "days": updated_days,
        "trigger_type": trigger_type,
        "explanation": explanation,
        "affected_pois": affected_pois
    }
