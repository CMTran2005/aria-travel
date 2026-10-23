from fastapi import APIRouter

router = APIRouter(prefix="/pois", tags=["POIs"])

@router.get("/")
def list_pois():
    return {"message": "POIs endpoint ready"}
