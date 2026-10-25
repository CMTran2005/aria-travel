# Hướng Dẫn Deploy ARIA Travel Lên Môi Trường Production (Sprint 7)

Tài liệu này hướng dẫn cách deploy hoàn chỉnh hệ thống **ARIA (Adaptive Route Intelligence Assistant)** miễn phí 100% với:
- **Backend (FastAPI)**: Deploy lên **Render** (Free tier, Web Service).
- **Frontend (Next.js 14)**: Deploy lên **Vercel** (Free tier).
- **Database (PostGIS)**: Đã chạy sẵn trên **Supabase Cloud**.

---

## 1. Deploy Backend Lên Render

### Bước 1: Tạo Web Service mới trên Render
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
2. Bấm **New +** $\to$ Chọn **Web Service**.
3. Chọn liên kết với GitHub repository: `https://github.com/CMTran2005/aria-travel`.

### Bước 2: Cấu hình thông số Service
* **Name**: `aria-backend`
* **Region**: `Singapore (Southeast Asia)` (tối ưu độ trễ cho người dùng Việt Nam)
* **Root Directory**: `backend` (Rất quan trọng!)
* **Environment**: `Python 3`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Plan Type**: `Free`

### Bước 3: Cấu hình Biến Môi Trường (Environment Variables trên Render)
Tại tab **Environment**, thêm các biến sau:

| Tên biến (Key) | Giá trị mẫu / Ghi chú |
|---|---|
| `PYTHON_VERSION` | `3.12.0` |
| `SUPABASE_URL` | URL Supabase project của bạn (vd: `https://xyz.supabase.co`) |
| `SUPABASE_KEY` | `service_role` key (hoặc secret key) của Supabase |
| `GROQ_API_KEY` | Groq API Key (`gsk_...`) |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key |

### Bước 4: Kiểm tra Deploy Backend
Sau khi Render build xong, truy cập:
`https://aria-backend-xxxx.onrender.com/health`

Nếu kết quả trả về:
```json
{
  "status": "ok",
  "service": "ARIA Backend",
  "database": "connected"
}
```
$\to$ **Backend đã sẵn sàng 100%!**

---

## 2. Deploy Frontend Lên Vercel

### Bước 1: Import Project vào Vercel
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com).
2. Bấm **Add New...** $\to$ Chọn **Project**.
3. Chọn repository `aria-travel` từ GitHub.

### Bước 2: Cấu hình Project trên Vercel
* **Framework Preset**: `Next.js`
* **Root Directory**: Bấm Edit và chọn thư mục `frontend` (Rất quan trọng!)
* **Build Command**: `next build` (mặc định)
* **Output Directory**: `.next` (mặc định)

### Bước 3: Cấu hình Biến Môi Trường (Environment Variables trên Vercel)
Thêm các biến môi trường sau:

| Tên biến (Key) | Giá trị |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL Backend vừa deploy trên Render (ví dụ: `https://aria-backend-xxxx.onrender.com/api`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project của bạn |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key |

### Bước 4: Bấm Deploy
Vercel sẽ tự động build production bundle trong ~1-2 phút và cung cấp cho bạn một domain trực tiếp (ví dụ: `https://aria-travel.vercel.app`).

---

## 3. Checklist Sau Khi Deploy (Testing E2E Live)

1. [ ] Mở URL Vercel trên trình duyệt (và điện thoại).
2. [ ] Thử tạo một kế hoạch du lịch mới tại trang `/plan`.
3. [ ] Kiểm tra xem AI có trích xuất ý định và OR-Tools có tối ưu lộ trình thành công không.
4. [ ] Thử bấm nút **"Thời tiết xấu (Mưa to)"** trên thanh Re-plan để xem lộ trình có tự động cập nhật không.
5. [ ] Thử bấm nút **Chia sẻ** để kiểm tra Toast thông báo.
