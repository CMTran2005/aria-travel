from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase configuration missing in .env")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
