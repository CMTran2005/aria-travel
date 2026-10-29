import requests
import time
from typing import List, Dict, Any

CITY_BOUNDS = {
    "Hội An": {"lat": 15.8800, "lon": 108.3300, "bbox": "15.85,108.30,15.91,108.37"},
    "Đà Lạt": {"lat": 11.9404, "lon": 108.4583, "bbox": "11.91,108.40,11.97,108.47"},
    "Đà Nẵng": {"lat": 16.0544, "lon": 108.2022, "bbox": "15.95,108.15,16.15,108.30"},
}

CURATED_DALAT_POIS = [
    {
        "external_id": "manual_dl_01",
        "name": "Quảng trường Lâm Viên",
        "category": "tourism",
        "city": "Đà Lạt",
        "address": "Đường Trần Quốc Toản, Phường 10, TP. Đà Lạt",
        "latitude": 11.9366,
        "longitude": 108.4452,
        "avg_duration_minutes": 60,
        "avg_cost_usd": 0.0,
        "rating": 4.7,
        "tags": ["landmark", "square", "photo", "outdoor"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_02",
        "name": "Chợ đêm Đà Lạt",
        "category": "amenity=marketplace",
        "city": "Đà Lạt",
        "address": "Nguyễn Thị Minh Khai, Phường 1, TP. Đà Lạt",
        "latitude": 11.9424,
        "longitude": 108.4373,
        "avg_duration_minutes": 90,
        "avg_cost_usd": 4.0,
        "rating": 4.6,
        "tags": ["street_food", "shopping", "nightlife"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_03",
        "name": "Ga Đà Lạt",
        "category": "tourism",
        "city": "Đà Lạt",
        "address": "1 Quang Trung, Phường 10, TP. Đà Lạt",
        "latitude": 11.9419,
        "longitude": 108.4542,
        "avg_duration_minutes": 50,
        "avg_cost_usd": 1.0,
        "rating": 4.5,
        "tags": ["historic", "train", "heritage", "architecture"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_04",
        "name": "Hồ Tuyền Lâm & Thiền Viện Trúc Lâm",
        "category": "tourism",
        "city": "Đà Lạt",
        "address": "Phường 3, TP. Đà Lạt",
        "latitude": 11.9028,
        "longitude": 108.4362,
        "avg_duration_minutes": 100,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["nature", "lake", "pagoda", "peaceful"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_05",
        "name": "Dinh III Bảo Đại",
        "category": "tourism",
        "city": "Đà Lạt",
        "address": "1 Triệu Việt Vương, Phường 4, TP. Đà Lạt",
        "latitude": 11.9298,
        "longitude": 108.4294,
        "avg_duration_minutes": 60,
        "avg_cost_usd": 2.0,
        "rating": 4.4,
        "tags": ["history", "palace", "museum"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_06",
        "name": "Tiệm Cafe Túi Mơ To",
        "category": "amenity=cafe",
        "city": "Đà Lạt",
        "address": "Hẻm 31 Sào Nam, Phường 11, TP. Đà Lạt",
        "latitude": 11.9567,
        "longitude": 108.4812,
        "avg_duration_minutes": 75,
        "avg_cost_usd": 3.0,
        "rating": 4.7,
        "tags": ["cafe", "sunset", "valley_view", "flowers"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_07",
        "name": "Lẩu gà lá é Tao Ngộ",
        "category": "amenity=restaurant",
        "city": "Đà Lạt",
        "address": "Số 5 Đường 3/4, Phường 3, TP. Đà Lạt",
        "latitude": 11.9332,
        "longitude": 108.4418,
        "avg_duration_minutes": 60,
        "avg_cost_usd": 6.0,
        "rating": 4.6,
        "tags": ["food", "specialty", "hotpot"],
        "source": "curated"
    },
    {
        "external_id": "manual_dl_08",
        "name": "Thung Lũng Tình Yêu",
        "category": "leisure",
        "city": "Đà Lạt",
        "address": "3-5-7 Đường Mai Anh Đào, Phường 8, TP. Đà Lạt",
        "latitude": 11.9792,
        "longitude": 108.4497,
        "avg_duration_minutes": 120,
        "avg_cost_usd": 10.0,
        "rating": 4.5,
        "tags": ["park", "romance", "nature", "scenery"],
        "source": "curated"
    }
]

CURATED_DANANG_POIS = [
    {
        "external_id": "manual_dn_01",
        "name": "Cầu Rồng Đà Nẵng",
        "category": "tourism",
        "city": "Đà Nẵng",
        "address": "Đường Nguyễn Văn Linh, Phước Ninh, Hải Châu",
        "latitude": 16.0611,
        "longitude": 108.2269,
        "avg_duration_minutes": 45,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["bridge", "iconic", "night_view", "landmark"],
        "source": "curated"
    },
    {
        "external_id": "manual_dn_02",
        "name": "Bán đảo Sơn Trà & Chùa Linh Ứng",
        "category": "tourism",
        "city": "Đà Nẵng",
        "address": "Bán đảo Sơn Trà, Thọ Quang, Sơn Trà",
        "latitude": 16.1001,
        "longitude": 108.2778,
        "avg_duration_minutes": 90,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["pagoda", "sea_view", "nature", "statue"],
        "source": "curated"
    },
    {
        "external_id": "manual_dn_03",
        "name": "Danh thắng Ngũ Hành Sơn",
        "category": "tourism",
        "city": "Đà Nẵng",
        "address": "81 Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn",
        "latitude": 16.0041,
        "longitude": 108.2618,
        "avg_duration_minutes": 100,
        "avg_cost_usd": 2.0,
        "rating": 4.6,
        "tags": ["mountain", "cave", "heritage", "viewpoint"],
        "source": "curated"
    },
    {
        "external_id": "manual_dn_04",
        "name": "Bãi biển Mỹ Khê",
        "category": "leisure",
        "city": "Đà Nẵng",
        "address": "Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà",
        "latitude": 16.0602,
        "longitude": 108.2464,
        "avg_duration_minutes": 120,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["beach", "swimming", "sea", "sunrise"],
        "source": "curated"
    },
    {
        "external_id": "manual_dn_05",
        "name": "Chợ Hàn Đà Nẵng",
        "category": "amenity=marketplace",
        "city": "Đà Nẵng",
        "address": "119 Trần Phú, Hải Châu 1, Hải Châu",
        "latitude": 16.0683,
        "longitude": 108.2244,
        "avg_duration_minutes": 60,
        "avg_cost_usd": 3.0,
        "rating": 4.4,
        "tags": ["shopping", "specialty", "souvenirs", "market"],
        "source": "curated"
    },
    {
        "external_id": "manual_dn_06",
        "name": "Mì Quảng Bà Mua",
        "category": "amenity=restaurant",
        "city": "Đà Nẵng",
        "address": "19 Trần Bình Trọng, Hải Châu",
        "latitude": 16.0635,
        "longitude": 108.2195,
        "avg_duration_minutes": 45,
        "avg_cost_usd": 3.0,
        "rating": 4.6,
        "tags": ["food", "noodles", "local_cuisine"],
        "source": "curated"
    }
]

# Rich curated POIs for Hoi An demo (ensures app is robust even if public OSM Overpass servers are overloaded)
CURATED_HOI_AN_POIS = [
    {
        "external_id": "manual_ha_01",
        "name": "Chùa Cầu (Lai Viễn Kiều)",
        "category": "tourism",
        "city": "Hội An",
        "address": "Nguyễn Thị Minh Khai, Phường Minh An",
        "latitude": 15.8771,
        "longitude": 108.3263,
        "avg_duration_minutes": 45,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["historic", "bridge", "iconic", "japanese"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_02",
        "name": "Nhà cổ Tấn Ký",
        "category": "tourism",
        "city": "Hội An",
        "address": "101 Nguyễn Thái Học, Minh An",
        "latitude": 15.8767,
        "longitude": 108.3274,
        "avg_duration_minutes": 40,
        "avg_cost_usd": 1.5,
        "rating": 4.6,
        "tags": ["historic", "heritage", "museum"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_03",
        "name": "Hội quán Phúc Kiến",
        "category": "tourism",
        "city": "Hội An",
        "address": "46 Trần Phú, Cẩm Châu",
        "latitude": 15.8780,
        "longitude": 108.3302,
        "avg_duration_minutes": 50,
        "avg_cost_usd": 2.0,
        "rating": 4.7,
        "tags": ["culture", "temple", "chinese"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_04",
        "name": "Chợ đêm Hội An",
        "category": "amenity=marketplace",
        "city": "Hội An",
        "address": "Nguyễn Hoàng, Phường Minh An",
        "latitude": 15.8760,
        "longitude": 108.3245,
        "avg_duration_minutes": 90,
        "avg_cost_usd": 5.0,
        "rating": 4.5,
        "tags": ["nightlife", "food", "street_market"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_05",
        "name": "Bánh Mì Phượng",
        "category": "amenity=restaurant",
        "city": "Hội An",
        "address": "2B Phan Chu Trinh, Cẩm Châu",
        "latitude": 15.8793,
        "longitude": 108.3325,
        "avg_duration_minutes": 35,
        "avg_cost_usd": 1.5,
        "rating": 4.7,
        "tags": ["food", "culinary", "banh_mi"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_06",
        "name": "Cơm gà Bà Buội",
        "category": "amenity=restaurant",
        "city": "Hội An",
        "address": "22 Phan Chu Trinh, Minh An",
        "latitude": 15.8788,
        "longitude": 108.3298,
        "avg_duration_minutes": 45,
        "avg_cost_usd": 3.0,
        "rating": 4.6,
        "tags": ["food", "vietnamese", "chicken_rice"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_07",
        "name": "Làng gốm Thanh Hà",
        "category": "tourism",
        "city": "Hội An",
        "address": "Khu phố 5, Phường Thanh Hà",
        "latitude": 15.8812,
        "longitude": 108.3005,
        "avg_duration_minutes": 75,
        "avg_cost_usd": 2.5,
        "rating": 4.4,
        "tags": ["pottery", "craft_village", "experience"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_08",
        "name": "Rừng dừa Bảy Mẫu",
        "category": "leisure",
        "city": "Hội An",
        "address": "Xã Cẩm Thanh, Hội An",
        "latitude": 15.8690,
        "longitude": 108.3650,
        "avg_duration_minutes": 90,
        "avg_cost_usd": 6.0,
        "rating": 4.7,
        "tags": ["nature", "boat", "basket_boat"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_09",
        "name": "Bãi biển An Bàng",
        "category": "leisure",
        "city": "Hội An",
        "address": "Đường Hai Bà Trưng, Cẩm An",
        "latitude": 15.9080,
        "longitude": 108.3450,
        "avg_duration_minutes": 120,
        "avg_cost_usd": 0.0,
        "rating": 4.8,
        "tags": ["beach", "sea", "relax"],
        "source": "curated"
    },
    {
        "external_id": "manual_ha_10",
        "name": "Faifo Coffee (Rooftop View)",
        "category": "amenity=cafe",
        "city": "Hội An",
        "address": "130 Trần Phú, Minh An",
        "latitude": 15.8778,
        "longitude": 108.3292,
        "avg_duration_minutes": 50,
        "avg_cost_usd": 2.5,
        "rating": 4.5,
        "tags": ["cafe", "rooftop", "photography", "views"],
        "source": "curated"
    }
]

def fetch_pois_osm(city: str = "Hội An", category: str = "tourism") -> List[Dict[str, Any]]:
    """
    Fetch POIs using Overpass API with multi-endpoint fallback, Nominatim search, and curated backup.
    """
    city_info = CITY_BOUNDS.get(city, CITY_BOUNDS["Hội An"])
    bbox = city_info["bbox"]
    
    # 1. Try Overpass API with short timeout
    query = f"""
    [out:json][timeout:15];
    (
      node["{category}"]({bbox});
      way["{category}"]({bbox});
    );
    out body center 30;
    """
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter"
    ]
    headers = {"User-Agent": "AriaTravelApp/1.0 (academic research)"}
    
    for url in endpoints:
        try:
            r = requests.post(url, data={"data": query}, headers=headers, timeout=8)
            if r.status_code == 200:
                elements = r.json().get("elements", [])
                results = []
                for el in elements:
                    tags = el.get("tags", {})
                    name = tags.get("name")
                    if not name:
                        continue
                    lat = el.get("lat") or el.get("center", {}).get("lat")
                    lon = el.get("lon") or el.get("center", {}).get("lon")
                    if not lat or not lon:
                        continue
                    results.append({
                        "external_id": f"osm_{el.get('type')}_{el.get('id')}",
                        "name": name,
                        "category": category,
                        "city": city,
                        "address": tags.get("addr:street") or "",
                        "latitude": float(lat),
                        "longitude": float(lon),
                        "tags": list(tags.keys())[:5],
                        "source": "osm",
                        "avg_duration_minutes": 45,
                        "avg_cost_usd": 3.0,
                        "rating": 4.5
                    })
                if results:
                    return results
        except Exception:
            continue

    # 2. Try Nominatim Search API (OSM standard search)
    try:
        nom_url = f"https://nominatim.openstreetmap.org/search?q={city}+tourism&format=json&limit=15"
        r = requests.get(nom_url, headers=headers, timeout=8)
        if r.status_code == 200:
            items = r.json()
            nom_results = []
            for it in items:
                name = it.get("name") or it.get("display_name", "").split(",")[0]
                if not name:
                    continue
                nom_results.append({
                    "external_id": f"osm_nom_{it.get('place_id')}",
                    "name": name,
                    "category": category,
                    "city": city,
                    "address": it.get("display_name", ""),
                    "latitude": float(it.get("lat")),
                    "longitude": float(it.get("lon")),
                    "tags": [it.get("type", "tourism")],
                    "source": "osm_nominatim",
                    "avg_duration_minutes": 45,
                    "avg_cost_usd": 2.0,
                    "rating": 4.6
                })
            if nom_results:
                return nom_results
    except Exception:
        pass

    # 3. Fallback to Curated verified POIs
    if city == "Hội An":
        return CURATED_HOI_AN_POIS
    if city == "Đà Lạt":
        return CURATED_DALAT_POIS
    if city == "Đà Nẵng":
        return CURATED_DANANG_POIS
        
    return []

