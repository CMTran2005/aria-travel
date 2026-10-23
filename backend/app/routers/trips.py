from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client
from app.core.geo import parse_wkb_point
from app.services.ai_agent import extract_user_intent, score_pois_with_ai

router = APIRouter(prefix="/trips", tags=["Trips"])

class PlanTripRequest(BaseModel):
    user_prompt: str
    city: Optional[str] = "Hội An"
    user_id: Optional[str] = None

class PlanTripResponse(BaseModel):
    trip_id: Optional[str] = None
    city: str
    num_days: int
    intent: Dict[str, Any]
    recommended_pois: List[Dict[str, Any]]

@router.post("/plan", response_model=PlanTripResponse)
def plan_trip_with_ai(payload: PlanTripRequest):
    """
    Core Sprint 3 Endpoint:
    1. Extract user intent with Groq Llama 3.3 70B
    2. Fetch candidate POIs from Supabase
    3. Score POIs based on intent
    4. Save initial trip draft to Supabase
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

    # Step 2: Fetch POIs for this city from Supabase
    try:
        db_res = client.table("pois").select("*").eq("city", target_city).execute()
        raw_pois = db_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn Database POI: {str(e)}")

    if not raw_pois:
        # Fallback to any POIs
        db_res = client.table("pois").select("*").limit(20).execute()
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
        # If AI scoring fails, return sorted by rating
        scored_pois = [
            {**p, "ai_score": p.get("rating", 4.5) * 2, "ai_reason": "Địa điểm nổi bật"}
            for p in sorted(pois, key=lambda x: x.get("rating", 0), reverse=True)
        ]

    # Step 4: Save trip draft to Supabase
    trip_id = None
    try:
        trip_record = {
            "title": f"Chuyến đi {target_city} ({intent.get('num_days', 2)} ngày)",
            "city": target_city,
            "budget_usd": intent.get("budget_usd", 100),
            "preferences": intent,
            "status": "draft"
        }
        if payload.user_id:
            trip_record["user_id"] = payload.user_id

        created_trip = client.table("trips").insert(trip_record).execute()
        if created_trip.data:
            trip_id = created_trip.data[0]["id"]
    except Exception as e:
        print(f"Warning: Could not save trip draft: {e}")

    return PlanTripResponse(
        trip_id=str(trip_id) if trip_id else None,
        city=target_city,
        num_days=intent.get("num_days", 2),
        intent=intent,
        recommended_pois=scored_pois[:12] # Top 12 best scored POIs
    )
