from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.core.supabase import get_supabase_client
from app.core.geo import parse_wkb_point
from app.services.osm_fetcher import CURATED_HOI_AN_POIS, CURATED_DALAT_POIS, CURATED_DANANG_POIS

router = APIRouter(prefix="/pois", tags=["POIs"])

class UpdateLocationRequest(BaseModel):
    latitude: float
    longitude: float

class CreatePOIRequest(BaseModel):
    name: str
    category: str = "tourism"
    city: str
    address: Optional[str] = ""
    latitude: float
    longitude: float
    avg_duration_minutes: Optional[int] = 60
    avg_cost_usd: Optional[float] = 0.0
    rating: Optional[float] = 4.5
    tags: Optional[List[str]] = []
    source: Optional[str] = "manual"
    external_id: Optional[str] = None

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
        
        res = query.order("id").limit(limit).execute()
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

@router.patch("/{poi_id}/location")
def update_poi_location(poi_id: int, payload: UpdateLocationRequest):
    """
    Update POI location coordinates directly from Map interaction.
    """
    try:
        client = get_supabase_client()
        wkt_location = f"SRID=4326;POINT({payload.longitude} {payload.latitude})"
        res = client.table("pois").update({"location": wkt_location}).eq("id", poi_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="POI not found")
        return {
            "status": "success",
            "message": f"Updated location for POI #{poi_id}",
            "latitude": payload.latitude,
            "longitude": payload.longitude
        }
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

@router.post("/seed-dalat")
def seed_dalat_pois():
    """
    Directly insert verified Đà Lạt POIs into Supabase.
    """
    client = get_supabase_client()
    inserted = 0
    errors = []

    existing_res = client.table("pois").select("external_id").execute()
    existing_ids = {row["external_id"] for row in existing_res.data if row.get("external_id")}

    for item in CURATED_DALAT_POIS:
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
        "total_curated": len(CURATED_DALAT_POIS),
        "errors": errors
    }

@router.post("/seed-danang")
def seed_danang_pois():
    """
    Directly insert verified Đà Nẵng POIs into Supabase.
    """
    client = get_supabase_client()
    inserted = 0
    errors = []

    existing_res = client.table("pois").select("external_id").execute()
    existing_ids = {row["external_id"] for row in existing_res.data if row.get("external_id")}

    for item in CURATED_DANANG_POIS:
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
        "total_curated": len(CURATED_DANANG_POIS),
        "errors": errors
    }


@router.post("/", status_code=201)
def create_single_poi(payload: CreatePOIRequest):
    """
    Tạo hoặc thêm một POI mới vào cơ sở dữ liệu Supabase PostGIS.
    """
    client = get_supabase_client()
    wkt_location = f"SRID=4326;POINT({payload.longitude} {payload.latitude})"
    ext_id = payload.external_id or f"manual_{payload.city.lower().replace(' ', '_')}_{int(payload.latitude*1000)}"

    record = {
        "name": payload.name,
        "category": payload.category,
        "location": wkt_location,
        "address": payload.address or "",
        "city": payload.city,
        "avg_duration_minutes": payload.avg_duration_minutes,
        "avg_cost_usd": payload.avg_cost_usd,
        "rating": payload.rating,
        "tags": payload.tags,
        "source": payload.source,
        "external_id": ext_id
    }

    try:
        res = client.table("pois").insert(record).execute()
        return {
            "status": "success",
            "message": f"Đã thêm POI '{payload.name}' thành công.",
            "data": res.data
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Lỗi khi thêm POI: {str(err)}")

@router.post("/batch", status_code=201)
def create_batch_pois(pois: List[CreatePOIRequest]):
    """
    Thêm danh sách nhiều POI cùng lúc vào cơ sở dữ liệu.
    """
    client = get_supabase_client()
    inserted = 0
    errors = []

    for item in pois:
        wkt_location = f"SRID=4326;POINT({item.longitude} {item.latitude})"
        ext_id = item.external_id or f"manual_{item.city.lower().replace(' ', '_')}_{int(item.latitude*1000)}"
        record = {
            "name": item.name,
            "category": item.category,
            "location": wkt_location,
            "address": item.address or "",
            "city": item.city,
            "avg_duration_minutes": item.avg_duration_minutes,
            "avg_cost_usd": item.avg_cost_usd,
            "rating": item.rating,
            "tags": item.tags,
            "source": item.source,
            "external_id": ext_id
        }
        try:
            client.table("pois").insert(record).execute()
            inserted += 1
        except Exception as err:
            errors.append(f"{item.name}: {str(err)}")

    return {
        "status": "success",
        "inserted": inserted,
        "total": len(pois),
        "errors": errors
    }

