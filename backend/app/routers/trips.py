from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client
from app.core.geo import parse_wkb_point
from app.services.ai_agent import extract_user_intent, score_pois_with_ai
from app.services.optimizer import schedule_multi_day_trip
from app.services.routing import get_route_geometry
from app.services.benchmark import benchmark_greedy_vs_ortools
from app.services.replanner import replan_trip_itinerary

router = APIRouter(prefix="/trips", tags=["Trips"])

class ReplanTripRequest(BaseModel):
    trigger_type: str  # "weather_rain" | "poi_closed" | "traffic_delay" | "manual"
    day_number: Optional[int] = 1
    closed_poi_id: Optional[int] = None
    delay_minutes: Optional[int] = 45

class PlanTripRequest(BaseModel):
    user_prompt: str
    city: Optional[str] = "Hội An"
    user_id: Optional[str] = None

class ItineraryItemResponse(BaseModel):
    id: Optional[int] = None
    poi_id: int
    poi: Dict[str, Any]
    visit_order: int
    planned_start: str
    planned_end: str
    travel_time_to_prev_minutes: int
    travel_distance_meters: Optional[int] = 0
    status: str = "planned"

class ItineraryDayResponse(BaseModel):
    id: Optional[int] = None
    day_number: int
    items: List[ItineraryItemResponse]
    route_geometry: Optional[List[List[float]]] = None

class PlanTripResponse(BaseModel):
    trip_id: Optional[str] = None
    city: str
    num_days: int
    intent: Dict[str, Any]
    days: List[ItineraryDayResponse]
    recommended_pois: List[Dict[str, Any]]

@router.post("/plan", response_model=PlanTripResponse)
def plan_trip_with_ai_and_optimizer(payload: PlanTripRequest):
    """
    Sprint 3 + 4 End-to-End Pipeline:
    1. Extract user intent with Groq LLM
    2. Fetch candidate POIs from Supabase
    3. Score POIs based on preferences & intent
    4. Run Greedy TSPTW optimization to schedule day-by-day itinerary
    5. Calculate route geometries via OSRM
    6. Persist Trip, Itinerary Days & Itinerary Items to Supabase
    """
    if not payload.user_prompt or not payload.user_prompt.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập mô tả yêu cầu chuyến đi.")

    client = get_supabase_client()

    # Step 1: Groq AI Intent Extraction
    try:
        intent = extract_user_intent(payload.user_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi AI Intent Extraction: {str(e)}")

    target_city = intent.get("city") or payload.city or "Hội An"
    num_days = max(1, min(int(intent.get("num_days", 2)), 7))

    # Step 2: Fetch POIs for this city from Supabase
    try:
        db_res = client.table("pois").select("*").eq("city", target_city).execute()
        raw_pois = db_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn Database POI: {str(e)}")

    if not raw_pois:
        # Fallback to any POIs
        db_res = client.table("pois").select("*").limit(25).execute()
        raw_pois = db_res.data or []

    # Decode PostGIS coordinates
    pois = []
    for row in raw_pois:
        lat_lon = parse_wkb_point(row.get("location"))
        lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
        pois.append({
            **row,
            "latitude": lat,
            "longitude": lon
        })

    # Step 3: AI POI Scoring
    try:
        scored_pois = score_pois_with_ai(pois, intent)
    except Exception as e:
        scored_pois = [
            {**p, "ai_score": p.get("rating", 4.5) * 2, "ai_reason": "Địa điểm nổi bật"}
            for p in sorted(pois, key=lambda x: x.get("rating", 0), reverse=True)
        ]

    # Step 4: Sprint 4 Optimization — Schedule Multi-Day Itinerary
    city_center = (pois[0]["latitude"], pois[0]["longitude"]) if pois else (15.8800, 108.3300)
    scheduled_days = schedule_multi_day_trip(
        candidate_pois=scored_pois[:18], # top candidate pool
        num_days=num_days,
        city_center=city_center
    )

    # Step 5: Calculate OSRM route geometry for each day
    for day in scheduled_days:
        day_coords = [
            (it["poi"]["latitude"], it["poi"]["longitude"])
            for it in day["items"]
        ]
        if len(day_coords) >= 2:
            day["route_geometry"] = get_route_geometry(day_coords)
        else:
            day["route_geometry"] = [[lat, lon] for lat, lon in day_coords]

    # Step 6: Save Trip, Days, and Items into Supabase
    trip_id = None
    try:
        trip_record = {
            "title": f"Chuyến đi {target_city} ({num_days} ngày)",
            "city": target_city,
            "budget_usd": intent.get("budget_usd", 100),
            "preferences": intent,
            "status": "planned"
        }
        if payload.user_id:
            trip_record["user_id"] = payload.user_id

        created_trip = client.table("trips").insert(trip_record).execute()
        if created_trip.data:
            trip_id = created_trip.data[0]["id"]

            # Save days & items
            for day in scheduled_days:
                day_record = {
                    "trip_id": trip_id,
                    "day_number": day["day_number"]
                }
                created_day = client.table("itinerary_days").insert(day_record).execute()
                if created_day.data:
                    day_id = created_day.data[0]["id"]
                    day["id"] = day_id

                    items_to_insert = []
                    for it in day["items"]:
                        items_to_insert.append({
                            "day_id": day_id,
                            "poi_id": it["poi_id"],
                            "visit_order": it["visit_order"],
                            "planned_start": it["planned_start"],
                            "planned_end": it["planned_end"],
                            "travel_time_to_prev_minutes": it["travel_time_to_prev_minutes"],
                            "status": "planned"
                        })
                    if items_to_insert:
                        client.table("itinerary_items").insert(items_to_insert).execute()
    except Exception as e:
        print(f"Warning: Could not save complete itinerary to Supabase: {e}")

    return PlanTripResponse(
        trip_id=str(trip_id) if trip_id else None,
        city=target_city,
        num_days=num_days,
        intent=intent,
        days=scheduled_days,
        recommended_pois=scored_pois[:12]
    )

@router.get("/{trip_id}")
def get_trip_detail(trip_id: str):
    """
    Fetch a complete trip with its scheduled days, items and POI details.
    """
    client = get_supabase_client()
    try:
        trip_res = client.table("trips").select("*").eq("id", trip_id).execute()
        if not trip_res.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy chuyến đi.")
        trip = trip_res.data[0]

        # Fetch days
        days_res = client.table("itinerary_days").select("*").eq("trip_id", trip_id).order("day_number").execute()
        days = days_res.data or []

        for day in days:
            items_res = client.table("itinerary_items").select("*, pois(*)").eq("day_id", day["id"]).order("visit_order").execute()
            items = []
            coords = []
            for row in (items_res.data or []):
                poi_data = row.get("pois") or {}
                if poi_data.get("location"):
                    lat_lon = parse_wkb_point(poi_data.get("location"))
                    lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
                else:
                    lat, lon = (15.8800, 108.3300)
                poi_data["latitude"] = lat
                poi_data["longitude"] = lon
                coords.append((lat, lon))

                items.append({
                    "id": row["id"],
                    "poi_id": row["poi_id"],
                    "poi": poi_data,
                    "visit_order": row["visit_order"],
                    "planned_start": str(row["planned_start"])[:5] if row.get("planned_start") else "08:30",
                    "planned_end": str(row["planned_end"])[:5] if row.get("planned_end") else "10:00",
                    "travel_time_to_prev_minutes": row.get("travel_time_to_prev_minutes") or 0,
                    "status": row.get("status", "planned")
                })
            day["items"] = items
            if len(coords) >= 2:
                day["route_geometry"] = get_route_geometry(coords)
            else:
                day["route_geometry"] = [[lat, lon] for lat, lon in coords]

        trip["days"] = days
        return trip
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn chuyến đi: {str(e)}")

@router.get("/benchmark/compare")
def compare_optimization_algorithms(city: str = "Hội An", num_days: int = 2):
    """
    Sprint 5 Deliverable: Benchmark Greedy Baseline vs Google OR-Tools TSPTW + K-Means
    """
    client = get_supabase_client()
    try:
        db_res = client.table("pois").select("*").eq("city", city).execute()
        raw_pois = db_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn POI: {str(e)}")

    if not raw_pois:
        db_res = client.table("pois").select("*").limit(20).execute()
        raw_pois = db_res.data or []

    pois = []
    for row in raw_pois:
        lat_lon = parse_wkb_point(row.get("location"))
        lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
        pois.append({
            **row,
            "latitude": lat,
            "longitude": lon,
            "ai_score": (row.get("rating") or 4.5) * 2
        })

    center = (pois[0]["latitude"], pois[0]["longitude"]) if pois else (15.8800, 108.3300)
    result = benchmark_greedy_vs_ortools(
        pois=pois[:16],
        num_days=num_days,
        city_center=center
    )
    result["city"] = city
    return result

@router.put("/{trip_id}/replan")
def replan_existing_trip(trip_id: str, payload: ReplanTripRequest):
    """
    Sprint 6: Dynamic Real-time Re-planning Endpoint
    Triggers adaptive itinerary adjustment on weather, closure, or traffic delays.
    Updates database and logs the replanning event.
    """
    client = get_supabase_client()
    try:
        # 1. Fetch trip and existing days
        trip_res = client.table("trips").select("*").eq("id", trip_id).single().execute()
        trip = trip_res.data
        if not trip:
            raise HTTPException(status_code=404, detail="Chuyến đi không tồn tại")

        target_city = trip.get("city", "Hội An")

        # 2. Get existing full itinerary
        days_res = client.table("itinerary_days").select("*, itinerary_items(*, pois(*))").eq("trip_id", trip_id).order("day_number").execute()
        existing_days_raw = days_res.data or []

        existing_days = []
        for day_row in existing_days_raw:
            sorted_items_raw = sorted(day_row.get("itinerary_items", []), key=lambda x: x.get("visit_order", 0))
            items = []
            for item_row in sorted_items_raw:
                poi_row = item_row.get("pois", {})
                lat_lon = parse_wkb_point(poi_row.get("location")) if poi_row.get("location") else None
                lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
                poi_obj = {**poi_row, "latitude": lat, "longitude": lon}
                items.append({
                    "id": item_row.get("id"),
                    "poi_id": item_row.get("poi_id"),
                    "poi": poi_obj,
                    "visit_order": item_row.get("visit_order"),
                    "planned_start": str(item_row.get("planned_start", "08:30"))[:5],
                    "planned_end": str(item_row.get("planned_end", "10:00"))[:5],
                    "travel_time_to_prev_minutes": item_row.get("travel_time_to_prev_minutes", 0),
                    "status": item_row.get("status", "planned")
                })
            existing_days.append({
                "id": day_row["id"],
                "day_number": day_row["day_number"],
                "items": items
            })

        # 3. Fetch candidate POIs for replacement
        pois_res = client.table("pois").select("*").eq("city", target_city).execute()
        raw_pois = pois_res.data or []
        all_candidate_pois = []
        for row in raw_pois:
            lat_lon = parse_wkb_point(row.get("location")) if row.get("location") else None
            lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
            all_candidate_pois.append({
                **row,
                "latitude": lat,
                "longitude": lon,
                "ai_score": (row.get("rating") or 4.5) * 2
            })

        # 4. Run Replanner Engine
        city_center = (all_candidate_pois[0]["latitude"], all_candidate_pois[0]["longitude"]) if all_candidate_pois else (15.8800, 108.3300)
        replan_result = replan_trip_itinerary(
            current_days=existing_days,
            all_candidate_pois=all_candidate_pois,
            trigger_type=payload.trigger_type,
            target_day_number=payload.day_number or 1,
            closed_poi_id=payload.closed_poi_id,
            delay_minutes=payload.delay_minutes or 45,
            city_center=city_center
        )

        updated_days = replan_result["days"]

        # 5. Update itinerary_items in database
        for day in updated_days:
            day_id = day.get("id")
            if not day_id:
                # Find day_id from existing
                match_d = next((d for d in existing_days if d["day_number"] == day["day_number"]), None)
                day_id = match_d["id"] if match_d else None

            if day_id:
                # Delete existing items of that day and insert updated items
                client.table("itinerary_items").delete().eq("day_id", day_id).execute()
                new_items_records = [
                    {
                        "day_id": day_id,
                        "poi_id": it["poi_id"],
                        "visit_order": it["visit_order"],
                        "planned_start": it["planned_start"],
                        "planned_end": it["planned_end"],
                        "travel_time_to_prev_minutes": it.get("travel_time_to_prev_minutes", 0),
                        "status": it.get("status", "planned")
                    }
                    for it in day.get("items", [])
                ]
                if new_items_records:
                    client.table("itinerary_items").insert(new_items_records).execute()

        # 6. Log replanning event in replanning_events table
        try:
            event_record = {
                "trip_id": trip_id,
                "trigger_type": payload.trigger_type,
                "trigger_data": {"explanation": replan_result["explanation"], "affected": replan_result["affected_pois"]},
                "old_itinerary": existing_days,
                "new_itinerary": updated_days
            }
            client.table("replanning_events").insert(event_record).execute()
        except Exception:
            pass

        return {
            "status": "success",
            "trip_id": trip_id,
            "trigger_type": payload.trigger_type,
            "explanation": replan_result["explanation"],
            "affected_pois": replan_result["affected_pois"],
            "days": updated_days
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tái lập lịch trình: {str(e)}")


