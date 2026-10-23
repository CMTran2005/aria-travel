# ARIA — Adaptive Route Intelligence Assistant

> Hệ thống gợi ý và tái lập lịch trình du lịch thông minh thích ứng theo thời gian thực kết hợp tối ưu hóa đa mục tiêu.

## Cấu trúc Repository
- `backend/`: Python FastAPI + LangChain + OR-Tools
- `frontend/`: Next.js 14 (App Router) + Tailwind CSS
- `supabase/`: Migrations & Schema definition cho PostGIS
- `docs/`: Tài liệu kiến trúc & benchmarks

## Quickstart

### 1. Database (Supabase)
Chạy script trong `supabase/migrations/20261023000000_init_schema.sql` trên Supabase SQL Editor.

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
