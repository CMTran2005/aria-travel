from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.core.supabase import get_supabase_client
from app.core.geo import parse_wkb_point
from app.services.osm_fetcher import CURATED_HOI_AN_POIS

router = APIRouter(prefix="/pois", tags=["POIs"])

@router.get("/")
def get_pois(
    city: Optional[str] = Query(None, description="City name (e.g. Hội An, Đà Lạt)"),
    category: Optional[str] = Query(None, description="Category filter"),
    limit: int = Query(100, ge=1, le=200)
):
    """
    Get list of POIs from Supabase with decoded latitude and longitude.
    """
    try:
        client = get_supabase_client()
        query = client.table("pois").select("*")
        if city:
            query = query.eq("city", city)
        if category:
            query = query.eq("category", category)
        
        res = query.limit(limit).execute()
        pois = []
        for row in res.data:
            lat_lon = parse_wkb_point(row.get("location"))
            lat, lon = lat_lon if lat_lon else (15.8800, 108.3300)
            pois.append({
                **row,
                "latitude": lat,
                "longitude": lon
            })
        return {"data": pois, "count": len(pois)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seed-hoian")
def seed_hoian_pois():
    """
    Directly insert verified Hội An POIs into Supabase.
    """
    client = get_supabase_client()
    inserted = 0
    errors = []

    # Check existing to avoid duplicates by external_id
    existing_res = client.table("pois").select("external_id").execute()
    existing_ids = {row["external_id"] for row in existing_res.data if row.get("external_id")}

    for item in CURATED_HOI_AN_POIS:
        if item["external_id"] in existing_ids:
            continue

        wkt_location = f"SRID=4326;POINT({item['longitude']} {item['latitude']})"
        record = {
            "name": item["name"],
            "category": item["category"],
            "location": wkt_location,
            "address": item["address"],
            "city": item["city"],
            "avg_duration_minutes": item["avg_duration_minutes"],
            "avg_cost_usd": item["avg_cost_usd"],
            "rating": item["rating"],
            "tags": item["tags"],
            "source": item["source"],
            "external_id": item["external_id"]
        }
        try:
            client.table("pois").insert(record).execute()
            inserted += 1
        except Exception as err:
            errors.append(f"{item['name']}: {str(err)}")

    return {
        "status": "success",
        "inserted": inserted,
        "total_curated": len(CURATED_HOI_AN_POIS),
        "errors": errors
    }
