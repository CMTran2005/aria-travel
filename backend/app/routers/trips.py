from fastapi import APIRouter

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("/")
def list_trips():
    return {"message": "Trips endpoint ready"}
