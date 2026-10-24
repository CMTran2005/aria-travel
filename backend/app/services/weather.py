import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

# Mapping of cities to approximate coordinates for fallback/weather lookup
CITY_COORDINATES: Dict[str, Dict[str, float]] = {
    "Hội An": {"lat": 15.8800, "lon": 108.3300},
    "Đà Nẵng": {"lat": 16.0544, "lon": 108.2022},
    "Huế": {"lat": 16.4637, "lon": 107.5909},
    "Hà Nội": {"lat": 21.0285, "lon": 105.8542},
    "TP. Hồ Chí Minh": {"lat": 10.8231, "lon": 106.6297},
    "Đà Lạt": {"lat": 11.9404, "lon": 108.4583},
    "Nha Trang": {"lat": 12.2388, "lon": 109.1967},
    "Sa Pa": {"lat": 22.3364, "lon": 103.8438},
    "Ninh Bình": {"lat": 20.2506, "lon": 105.9745},
    "Phú Quốc": {"lat": 10.2899, "lon": 103.9840},
}

def get_current_weather(city: str) -> Dict[str, Any]:
    """
    Fetch weather from OpenWeatherMap API.
    If API key is missing or request fails, returns realistic fallback data.
    """
    api_key = settings.OPENWEATHER_API_KEY
    coords = CITY_COORDINATES.get(city, {"lat": 15.8800, "lon": 108.3300})

    if api_key and api_key != "your-openweather-api-key":
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": coords["lat"],
                "lon": coords["lon"],
                "appid": api_key,
                "units": "metric",
                "lang": "vi"
            }
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    weather_desc = data.get("weather", [{}])[0].get("description", "Quang đãng")
                    main_cond = data.get("weather", [{}])[0].get("main", "Clear")
                    temp = round(data.get("main", {}).get("temp", 28.0), 1)
                    humidity = data.get("main", {}).get("humidity", 70)
                    wind_speed = data.get("wind", {}).get("speed", 3.0)

                    is_bad_weather = main_cond.lower() in ["rain", "thunderstorm", "drizzle", "snow"] or "mưa" in weather_desc.lower()

                    return {
                        "city": city,
                        "temperature_c": temp,
                        "condition": main_cond,
                        "description": weather_desc.capitalize(),
                        "humidity_percent": humidity,
                        "wind_speed_ms": wind_speed,
                        "is_bad_weather": is_bad_weather,
                        "source": "openweathermap"
                    }
        except Exception:
            pass

    # Realistic fallback (clear & pleasant tropical weather)
    return {
        "city": city,
        "temperature_c": 27.5,
        "condition": "Clear",
        "description": "Trời nắng đẹp, thoáng đãng",
        "humidity_percent": 68,
        "wind_speed_ms": 3.2,
        "is_bad_weather": False,
        "source": "fallback"
    }
