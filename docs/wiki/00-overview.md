# 00 — Tổng quan dự án (Overview)

## 1. Tên và Mục đích dự án

- **Tên dự án**: ARIA — Adaptive Route Intelligence Assistant (được định nghĩa trong [`README.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/README.md) và tiêu đề FastAPI tại [`backend/app/main.py:6-10`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L6-L10)).
- **Mục đích**: Hệ thống hỗ trợ lập lịch trình du lịch thông minh, kết hợp trích xuất ý định ngôn ngữ tự nhiên bằng mô hình ngôn ngữ lớn (LLM), tối ưu hóa lộ trình đa ngày đa mục tiêu với ràng buộc khung giờ (TSPTW qua Google OR-Tools) và tái lập lịch trình thích ứng theo thời gian thực (Adaptive Real-Time Replanning) khi phát sinh biến đổi thời tiết, địa điểm đóng cửa hoặc ùn tắc giao thông.

---

## 2. Công nghệ phát hiện (Tech Stack)

### Backend
- **Ngôn ngữ & Runtime**: Python 3.12 (khuyến nghị trong [`backend/render.yaml`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/render.yaml) và [`backend/Procfile`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/Procfile)).
- **Web Framework**: FastAPI 0.111+ với Uvicorn ASGI server ([`backend/requirements.txt`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/requirements.txt)).
- **Trí tuệ nhân tạo (AI/LLM)**: LangChain Groq (mô hình openai/gpt-oss-120b), LangChain OpenAI với OpenRouter fallback ([`backend/app/services/ai_agent.py:8-41`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/ai_agent.py#L8-L41)).
- **Tối ưu hóa toán học**: Google OR-Tools (Constraint Solver / RoutingModel cho bài toán TSPTW) kết hợp thuật toán phân cụm K-Means Scikit-learn ([`backend/app/services/optimizer.py:23-175`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/optimizer.py#L23-L175), [`backend/app/services/clusterer.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/clusterer.py)).
- **Định tuyến & Không gian**: OSRM API công cộng cho route geometry và giải mã PostGIS EWKB chuẩn SRID 4326 ([`backend/app/core/geo.py:4-26`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/core/geo.py#L4-L26), [`backend/app/services/routing.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/routing.py)).
- **Thời tiết**: OpenWeatherMap API với HTTPX ([`backend/app/services/weather.py:19-72`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/weather.py#L19-L72)).

### Frontend
- **Framework**: Next.js 14.2.24 (App Router) với React 18.3.1 và TypeScript 5.4.5 ([`frontend/package.json:11-30`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/package.json#L11-L30)).
- **Styling**: Tailwind CSS 3.4.4, PostCSS, Autoprefixer ([`frontend/tailwind.config.js`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/tailwind.config.js), [`frontend/postcss.config.js`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/postcss.config.js)).
- **Bản đồ trực quan**: Leaflet 1.9.4 và React-Leaflet 4.2.1 ([`frontend/src/components/map/MapView.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/map/MapView.tsx)).
- **Icons & UI**: Lucide React ([`frontend/package.json:14`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/package.json#L14)).

### Database & Cloud
- **Cơ sở dữ liệu**: Supabase (PostgreSQL 15+) kích hoạt extension PostGIS ([`supabase/migrations/20261023000000_init_schema.sql:1-3`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/migrations/20261023000000_init_schema.sql#L1-L3)).
- **Giao tiếp Realtime**: Supabase Realtime qua WebSocket kênh `realtime:trips` ([`frontend/src/app/trips/[id]/page.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/app/trips/[id]/page.tsx)).
- **Triển khai**: Render (Backend Web Service) và Vercel (Frontend Next.js) theo hướng dẫn tại [`docs/deployment-guide.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/deployment-guide.md).

---

## 3. Cây thư mục (2 cấp)

```text
aria-travel/
├── .agent/              # Bộ nhớ tiến trình workflow (.agent/CONFIG.md, .agent/STATE.md, .agent/BUGS.md, .agent/IDEAS.md)
├── .agents/             # Định nghĩa skill mở rộng (.agents/skills/dev-workflow/)
├── backend/             # Mã nguồn dịch vụ backend FastAPI
│   ├── app/             # Core logic, routers, và services
│   ├── requirements.txt # Danh mục thư viện Python
│   ├── render.yaml      # Cấu hình deployment Render
│   └── Procfile         # Lệnh chạy production Uvicorn
├── frontend/            # Ứng dụng Next.js 14 App Router
│   ├── src/             # Giao diện, components bản đồ/timeline, và thư viện gọi API
│   ├── package.json     # Quản lý dependencies npm
│   └── tsconfig.json    # Cấu hình TypeScript
├── supabase/            # Định nghĩa cơ sở dữ liệu và dữ liệu mẫu
│   ├── migrations/      # Các file SQL schema PostGIS
│   └── seed.sql         # Dữ liệu mẫu ban đầu cho POIs và địa điểm
└── docs/                # Tài liệu kỹ thuật và báo cáo thử nghiệm
    ├── wiki/            # Bộ wiki 9 file quản lý mã nguồn
    ├── benchmark-results.md # Báo cáo đo lường OR-Tools vs Greedy
    └── deployment-guide.md  # Hướng dẫn deploy Vercel và Render
```

---

## 4. Lệnh chạy Local

### Backend (FastAPI)
Thực thi tại thư mục `backend/`:
```powershell
# 1. Khởi tạo và kích hoạt virtual environment Python 3.12
py -3.12 -m venv venv
.\venv\Scripts\activate

# 2. Cài đặt phụ thuộc
pip install -r requirements.txt

# 3. Tạo file cấu hình môi trường
copy .env.example .env

# 4. Khởi chạy server phát triển
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Endpoint kiểm tra sức khỏe: `http://127.0.0.1:8000/health`
- Tài liệu API tương tác Swagger: `http://127.0.0.1:8000/docs`

### Frontend (Next.js 14)
Thực thi tại thư mục `frontend/`:
```powershell
# 1. Cài đặt các gói npm
npm install

# 2. Tạo file cấu hình môi trường
copy .env.example .env.local

# 3. Chạy môi trường phát triển
npm run dev
```
- Truy cập ứng dụng: `http://localhost:3000`
- Giao diện lập kế hoạch lộ trình: `http://localhost:3000/plan`

---

## 5. Biến môi trường quan trọng (Chỉ ghi tên biến)

Theo quy ước an toàn trong [`backend/app/core/config.py:3-9`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/core/config.py#L3-L9) và [`frontend/.env.example`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/.env.example), hệ thống sử dụng các biến môi trường sau:

| Tên biến | Phạm vi | Mô tả ý nghĩa |
|---|---|---|
| `SUPABASE_URL` | Backend | URL trỏ tới dự án Supabase PostgreSQL |
| `SUPABASE_SERVICE_KEY` | Backend | Khóa đặc quyền service_role của Supabase để đọc/ghi DB |
| `GROQ_API_KEY` | Backend | API Key dịch vụ Groq Cloud để chạy mô hình suy luận Intent |
| `OPENROUTER_API_KEY` | Backend | API Key OpenRouter dự phòng khi Groq hết quota hoặc quá tải |
| `OPENWEATHER_API_KEY` | Backend | API Key OpenWeatherMap để tra cứu thời tiết và cảnh báo mưa bão |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | URL công khai của Supabase kết nối client và realtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Khóa công khai anon cho Supabase client ở trình duyệt |
| `NEXT_PUBLIC_API_URL` | Frontend | Địa chỉ gốc của backend API (mặc định: `http://localhost:8000/api`) |
| `PYTHON_VERSION` | Triển khai | Phiên bản Python cố định trên Render (khuyến nghị: 3.12.0) |
| `PORT` | Triển khai | Cổng lắng nghe động do nhà cung cấp Cloud (Render) cấp phát |
