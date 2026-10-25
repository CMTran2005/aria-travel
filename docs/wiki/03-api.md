# 03 — Giao diện lập trình ứng dụng (API Specification)

## 1. Thông tin chung & Xác thực

- **Base URL (Local)**: `http://127.0.0.1:8000` (được cấu hình trong [`backend/app/main.py:6-10`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L6-L10)).
- **Base URL (Production Render)**: `https://aria-backend.onrender.com` (theo hướng dẫn tại [`docs/deployment-guide.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/deployment-guide.md)).
- **Tiền tố API**: Tất cả endpoint nghiệp vụ sử dụng tiền tố `/api` (được định tuyến tại [`backend/app/main.py:22-24`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L22-L24)).
- **Xác thực (Authentication)**: Các endpoint tạo và truy vấn dữ liệu cá nhân chấp nhận `user_id` liên kết với hồ sơ người dùng Supabase Auth (`supabase/migrations/20261023000000_init_schema.sql:5-10`). Khách vãng lai có thể tạo và xem lịch trình mà không bắt buộc đăng nhập.
- **CORS**: Được cấu hình mở cho phép tất cả các nguồn truy cập từ frontend (`allow_origins=["*"]`) tại [`backend/app/main.py:13-19`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L13-L19).

---

## 2. Bảng tổng hợp các Endpoint

| Phương thức | Đường dẫn Endpoint | Tệp định nghĩa | Mô tả tóm tắt |
|---|---|---|---|
| `GET` | /health | `backend/app/main.py:26-41` | Kiểm tra trạng thái máy chủ backend và kết nối tới Supabase Database |
| `GET` | `/api/pois` | `backend/app/routers/pois.py:14-44` | Lấy danh sách địa điểm theo thành phố/danh mục kèm tọa độ (lat, lon) |
| `PATCH` | `/api/pois/{poi_id}/location` | `backend/app/routers/pois.py:45-64` | Cập nhật trực tiếp tọa độ PostGIS của một địa điểm từ giao diện bản đồ |
| `POST` | `/api/pois/seed-hoian` | `backend/app/routers/pois.py:65-107` | Nạp tập dữ liệu địa điểm du lịch văn hóa chuẩn hóa tại Hội An vào Database |
| `POST` | `/api/trips/plan` | `backend/app/routers/trips.py:50-178` | Pipeline AI & OR-Tools: trích xuất ý định, tối ưu lộ trình đa ngày và lưu DB |
| `GET` | `/api/trips/{trip_id}` | `backend/app/routers/trips.py:179-232` | Lấy toàn bộ thông tin chi tiết của một chuyến đi, danh sách ngày và điểm dừng |
| `GET` | `/api/trips/benchmark/compare` | `backend/app/routers/trips.py:233-268` | Chạy đo lường so sánh thuật toán Greedy Baseline với Google OR-Tools TSPTW |
| `PUT` | `/api/trips/{trip_id}/replan` | `backend/app/routers/trips.py:269-395` | Tái lập lịch trình thích ứng thời gian thực và ghi log sự kiện thay đổi |
| `GET` | `/api/weather/{city}` | `backend/app/routers/weather.py:6-14` | Tra cứu thông tin thời tiết thời gian thực và nhận diện cảnh báo thời tiết xấu |

---

## 3. Chi tiết các Endpoint nghiệp vụ

### 3.1. `GET /health`
- **Mục đích**: Kiểm tra liveness và readiness của backend.
- **Phản hồi mẫu**:
```json
{
  "status": "ok",
  "service": "ARIA Backend",
  "database": "connected"
}
```

### 3.2. `GET /api/pois`
- **Query Parameters**:
  - `city` (string, tùy chọn): Tên thành phố cần lọc (vd: `Hội An`, `Đà Nẵng`).
  - `category` (string, tùy chọn): Danh mục địa điểm (vd: `attraction`, `restaurant`).
  - `limit` (integer, mặc định `100`, khoảng từ `1` đến `200`).
- **Phản hồi**: Trả về mảng các đối tượng POI với tọa độ `latitude` và `longitude` đã được giải mã từ EWKB binary (`backend/app/routers/pois.py:34-40`).

### 3.3. `PATCH /api/pois/{poi_id}/location`
- **Mục đích**: Hỗ trợ người dùng kéo thả ghim trên bản đồ để cập nhật vị trí chính xác của địa điểm.
- **Request Body**:
```json
{
  "latitude": 15.8772,
  "longitude": 108.3285
}
```
- **Xử lý**: Chuyển đổi sang định dạng WKT `SRID=4326;POINT(lon lat)` và cập nhật vào cột `location` (`backend/app/routers/pois.py:52-53`).

### 3.4. `POST /api/trips/plan`
- **Mục đích**: Khởi tạo chuyến đi thông minh end-to-end từ mô tả ngôn ngữ tự nhiên.
- **Request Body**:
```json
{
  "user_prompt": "Mình muốn đi Hội An 2 ngày cùng bạn gái, thích ẩm thực và phố cổ, ngân sách vừa phải.",
  "city": "Hội An",
  "user_id": null
}
```
- **Quy trình 6 bước xử lý nội bộ** (`backend/app/routers/trips.py:53-60`):
  1. Trích xuất ý định (Intent Extraction) qua mô hình Groq LLM.
  2. Truy vấn danh sách ứng viên POI của thành phố từ bảng `pois`.
  3. AI chấm điểm phù hợp của từng địa điểm dựa trên sở thích người dùng.
  4. Google OR-Tools tối ưu hóa phân bổ lịch trình đa ngày có ràng buộc khung giờ mở cửa.
  5. Gọi OSRM Routing API để lấy danh sách tọa độ polyline lộ trình chi tiết.
  6. Lưu chuyến đi vào bảng `trips`, `itinerary_days` và `itinerary_items` trên Supabase.

### 3.5. `PUT /api/trips/{trip_id}/replan`
- **Mục đích**: Tái lập lịch trình thích ứng khi xảy ra sự cố đột xuất trong chuyến đi.
- **Request Body**:
```json
{
  "trigger_type": "weather_rain",
  "day_number": 1,
  "closed_poi_id": null,
  "delay_minutes": 45
}
```
- **Các giá trị `trigger_type` hỗ trợ**:
  - `weather_rain`: Thay thế các điểm tham quan ngoài trời thành các điểm trong nhà/bảo tàng/quán cà phê văn hóa.
  - `poi_closed`: Xóa địa điểm bị đóng cửa bất ngờ và bổ sung điểm thay thế gần nhất cùng loại.
  - `traffic_delay`: Lùi toàn bộ khung giờ các điểm tiếp theo thêm số phút trễ (`delay_minutes`), tự động cắt bớt điểm cuối ngày nếu vượt quá 22:30.
  - `manual`: Giải lại bài toán TSPTW trên tập điểm hiện tại bằng Google OR-Tools.

### 3.6. `GET /api/weather/{city}`
- **Mục đích**: Trả về nhiệt độ hiện tại, độ ẩm, sức gió và cờ boolean `is_bad_weather`.
- **Logic phát hiện thời tiết xấu** (`backend/app/services/weather.py:47`): Đánh dấu `true` khi điều kiện thời tiết rơi vào các nhóm `rain`, `thunderstorm`, `drizzle`, `snow` hoặc chuỗi mô tả có chứa từ "mưa".

---

## 4. Định dạng Lỗi (Error Handling)

Khi xảy ra lỗi, backend trả về mã trạng thái HTTP tiêu chuẩn kèm cấu trúc JSON chi tiết theo chuẩn FastAPI:

```json
{
  "detail": "Thông điệp mô tả nguyên nhân lỗi cụ thể"
}
```

Các mã lỗi thường gặp:
- `400 Bad Request`: Thiếu tham số bắt buộc (vd: người dùng không nhập mô tả yêu cầu chuyến đi tại [`backend/app/routers/trips.py:61-63`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L61-L63)).
- `404 Not Found`: Không tìm thấy bản ghi chuyến đi (`backend/app/routers/trips.py:188`) hoặc địa điểm POI (`backend/app/routers/pois.py:55`).
- `500 Internal Server Error`: Lỗi kết nối Supabase, lỗi gọi API bên ngoài (Groq, OpenWeatherMap) hoặc lỗi cú pháp giải mã không gian.

---

## 5. Rate Limits & Quota dịch vụ bên ngoài

1. **Groq Cloud API**: Tùy thuộc vào gói tài khoản (Tier 1/Free thường giới hạn 30 requests/phút). Khi vượt hạn ngạch, hàm `get_llm()` tại [`backend/app/services/ai_agent.py:26-35`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/ai_agent.py#L26-L35) sẽ tự động kích hoạt fallback chuyển hướng sang OpenRouter API.
2. **OpenWeatherMap API**: Giới hạn 60 calls/phút đối với tài khoản miễn phí. Nếu gặp lỗi hoặc chưa cấu hình API Key, service tự động trả về dữ liệu thời tiết fallback an toàn tại [`backend/app/services/weather.py:62-72`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/weather.py#L62-L72).
3. **OSRM Public Routing API**: Phục vụ nhu cầu kiểm thử định tuyến công cộng. Trong trường hợp timeout hoặc kết nối mạng gián đoạn, hệ thống tự động suy thoái về đường thẳng nối tọa độ các điểm (`backend/app/routers/trips.py:124`).
