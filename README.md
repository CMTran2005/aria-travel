# ARIA — Adaptive Route Intelligence Assistant

> Hệ thống gợi ý và tái lập lịch trình du lịch thông minh thích ứng theo thời gian thực kết hợp tối ưu hóa đa mục tiêu.

---

## 📁 Cấu trúc Repository
- `backend/`: Python FastAPI + LangChain + OR-Tools + Supabase
- `frontend/`: Next.js 14 (App Router) + React 18 + Tailwind CSS + Leaflet
- `supabase/`: Migrations & Schema definition cho PostGIS
- `docs/`: Tài liệu kiến trúc & benchmarks

---

## 🚀 Hướng dẫn khởi chạy chi tiết

### 1. Database (Supabase)
1. Tạo một dự án trên [Supabase](https://supabase.com).
2. Vào **SQL Editor** trên Supabase Dashboard, copy và chạy toàn bộ nội dung file [supabase/migrations/20261023000000_init_schema.sql](file:///d:/Files/aria-travel/supabase/migrations/20261023000000_init_schema.sql).

---

### 2. Backend (FastAPI)

> [!IMPORTANT]
> **Yêu cầu phiên bản Python:** Bắt buộc sử dụng **Python 3.12** (hoặc 3.11). Tuyệt đối **không** dùng Python 3.14/3.15 vì thư viện Google OR-Tools và AnyIO chưa hỗ trợ.

Mở Terminal tại thư mục `aria-travel/backend`:

```powershell
# 1. Di chuyển vào thư mục backend
cd d:\Files\aria-travel\backend

# 2. Tạo môi trường ảo với Python 3.12 (dùng py launcher)
py -3.12 -m venv venv

# 3. Kích hoạt môi trường ảo (Windows PowerShell)
.\venv\Scripts\activate

# 4. Cài đặt các thư viện
pip install --upgrade pip
pip install -r requirements.txt

# 5. Cấu hình biến môi trường
# Tạo file .env từ .env.example và điền các API Key (Supabase, Groq, OpenWeatherMap):
cp .env.example .env

# 6. Khởi chạy Backend Server (Khuyên dùng python -m uvicorn để tránh lỗi đường dẫn Windows)
python -m uvicorn app.main:app --reload
```

- Server chạy tại: **http://127.0.0.1:8000**
- Kiểm tra trạng thái: **http://127.0.0.1:8000/health**
- Tài liệu Swagger API: **http://127.0.0.1:8000/docs**

> **💡 Lưu ý khi chạy lần sau:** Mỗi khi mở lại Terminal, bạn chỉ cần chạy:
> ```powershell
> cd d:\Files\aria-travel\backend
> .\venv\Scripts\activate
> python -m uvicorn app.main:app --reload
> ```

---

### 3. Frontend (Next.js 14)

Mở một tab Terminal riêng tại thư mục `aria-travel/frontend`:

```powershell
# 1. Di chuyển vào thư mục frontend
cd d:\Files\aria-travel\frontend

# 2. Cài đặt các gói npm
npm install

# 3. Cấu hình biến môi trường
# Đảm bảo file .env hoặc .env.local có đủ NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY:
cp .env.example .env.local

# 4. Khởi chạy Frontend Dev Server
npm run dev
```

- Truy cập ứng dụng tại: **http://localhost:3000**
- Wizard lập kế hoạch AI: **http://localhost:3000/plan**
