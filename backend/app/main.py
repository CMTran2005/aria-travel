from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trips, pois
from app.core.supabase import get_supabase_client

app = FastAPI(
    title="ARIA API",
    description="Adaptive Route Intelligence Assistant API",
    version="0.1.0"
)

# CORS setup for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(trips.router, prefix="/api")
app.include_router(pois.router, prefix="/api")

@app.get("/health")
def health_check():
    supabase_status = "untested"
    try:
        client = get_supabase_client()
        # Ping table profiles or pois
        res = client.table("pois").select("id").limit(1).execute()
        supabase_status = "connected"
    except Exception as e:
        supabase_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "service": "ARIA Backend",
        "database": supabase_status
    }
