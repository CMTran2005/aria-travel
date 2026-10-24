from fastapi import APIRouter, HTTPException
from app.services.weather import get_current_weather

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/{city}")
def fetch_city_weather(city: str):
    """
    Sprint 6: Fetch real-time weather and forecast for city.
    """
    try:
        return get_current_weather(city)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy thông tin thời tiết: {str(e)}")
