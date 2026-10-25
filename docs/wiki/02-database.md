# 02 — Cơ sở dữ liệu (Database Schema)

## 1. Tổng quan cơ sở dữ liệu

Dự án ARIA sử dụng cơ sở dữ liệu **Supabase PostgreSQL 15+** với tiện ích mở rộng không gian **PostGIS** được kích hoạt (`CREATE EXTENSION IF NOT EXISTS postgis;`). Toàn bộ cấu trúc cơ sở dữ liệu được định nghĩa tập trung trong tệp [`supabase/migrations/20261023000000_init_schema.sql`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/migrations/20261023000000_init_schema.sql) và dữ liệu hạt giống ban đầu tại [`supabase/seed.sql`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/seed.sql).

---

## 2. Chi tiết 6 Bảng dữ liệu

### 1. Bảng `profiles`
Lưu thông tin hồ sơ người dùng đồng bộ từ Supabase Auth (`supabase/migrations/20261023000000_init_schema.sql:5-10`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users` | Định danh người dùng từ hệ thống Auth |
| `display_name` | `TEXT` | Có thể null | Tên hiển thị của người dùng |
| `preferences` | `JSONB` | Mặc định null | Lưu sở thích du lịch mặc định của người dùng |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo tài khoản |

### 2. Bảng `pois` (Points of Interest)
Lưu trữ danh mục các địa điểm tham quan, ẩm thực, văn hóa và giải trí (`supabase/migrations/20261023000000_init_schema.sql:13-28`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Khóa chính tự tăng |
| `name` | `TEXT` | `NOT NULL` | Tên địa điểm du lịch |
| `category` | `TEXT` | Nullable | Danh mục (vd: `tourism=attraction`, `amenity=cafe`, `beach`) |
| `location` | `GEOGRAPHY(POINT, 4326)` | GiST Index | Tọa độ không gian địa lý WGS 84 PostGIS |
| `address` | `TEXT` | Nullable | Địa chỉ đường phố hiển thị |
| `city` | `TEXT` | Nullable | Thành phố (vd: `Hội An`, `Đà Nẵng`, `Đà Lạt`) |
| `opening_hours` | `JSONB` | Nullable | Cấu trúc giờ mở cửa JSON (vd: `{"Mon": ["08:00", "17:00"]}`) |
| `avg_duration_minutes` | `INT` | Nullable | Thời gian tham quan trải nghiệm trung bình (phút) |
| `avg_cost_usd` | `DECIMAL(8,2)` | Nullable | Chi phí dự kiến cho mỗi lượt ghé thăm (USD) |
| `rating` | `DECIMAL(3,2)` | Nullable | Điểm đánh giá chất lượng (thang điểm 1.00 - 5.00) |
| `tags` | `TEXT[]` | Nullable | Mảng nhãn phân loại (vd: `['heritage', 'culture', 'photo']`) |
| `source` | `TEXT` | Nullable | Nguồn dữ liệu (`osm` hoặc `manual`) |
| `external_id` | `TEXT` | Nullable | Mã định danh từ OpenStreetMap hoặc hệ thống ngoài |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm thêm địa điểm vào cơ sở dữ liệu |

### 3. Bảng `trips`
Lưu trữ thông tin tổng quát về chuyến đi do người dùng tạo hoặc AI gợi ý (`supabase/migrations/20261023000000_init_schema.sql:33-45`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Khóa chính chuyến đi dạng UUID |
| `user_id` | `UUID` | `REFERENCES profiles(id)` | Khóa ngoại liên kết hồ sơ người dùng (có thể null nếu khách vãng lai) |
| `title` | `TEXT` | Nullable | Tiêu đề chuyến đi (vd: "Chuyến đi Hội An (2 ngày)") |
| `city` | `TEXT` | Nullable | Điểm đến chính của chuyến đi |
| `start_date` | `DATE` | Nullable | Ngày bắt đầu hành trình |
| `end_date` | `DATE` | Nullable | Ngày kết thúc hành trình |
| `budget_usd` | `DECIMAL(10,2)` | Nullable | Tổng ngân sách dự kiến (USD) |
| `preferences` | `JSONB` | Nullable | Cấu trúc ý định trích xuất từ AI (`travel_style`, `group_type`...) |
| `status` | `TEXT` | `DEFAULT 'draft'` | Trạng thái vòng đời: `draft`, `active`, hoặc `completed` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm tạo chuyến đi |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm cập nhật lịch trình gần nhất |

### 4. Bảng `itinerary_days`
Chia nhỏ chuyến đi thành từng ngày cụ thể (`supabase/migrations/20261023000000_init_schema.sql:48-53`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Khóa chính tự tăng của ngày |
| `trip_id` | `UUID` | `REFERENCES trips(id) ON DELETE CASCADE` | Khóa ngoại tới bảng `trips`, xóa dây chuyền khi xóa chuyến đi |
| `day_number` | `INT` | Nullable | Số thứ tự ngày trong lịch trình (Ngày 1, Ngày 2...) |
| `date` | `DATE` | Nullable | Ngày dương lịch cụ thể (nếu có xác định) |

### 5. Bảng `itinerary_items`
Lưu trữ các điểm dừng tham quan theo từng ngày đã được tối ưu thứ tự (`supabase/migrations/20261023000000_init_schema.sql:56-65`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Khóa chính mục lịch trình |
| `day_id` | `INT` | `REFERENCES itinerary_days(id) ON DELETE CASCADE` | Khóa ngoại tới ngày, xóa dây chuyền khi tái lập lịch ngày |
| `poi_id` | `INT` | `REFERENCES pois(id)` | Khóa ngoại liên kết địa điểm du lịch |
| `visit_order` | `INT` | Nullable | Thứ tự ghé thăm trong ngày (1, 2, 3...) do OR-Tools tối ưu |
| `planned_start` | `TIME` | Nullable | Giờ bắt đầu ghé thăm dự kiến (vd: `08:30:00`) |
| `planned_end` | `TIME` | Nullable | Giờ kết thúc ghé thăm dự kiến (vd: `10:00:00`) |
| `travel_time_to_prev_minutes` | `INT` | Nullable | Thời gian di chuyển từ điểm trước đó sang điểm này (phút) |
| `status` | `TEXT` | `DEFAULT 'planned'` | Trạng thái thực tế: `planned`, `visited`, hoặc `skipped` |

### 6. Bảng `replanning_events`
Lưu vết nhật ký các sự kiện tái lập lịch trình thích ứng thời gian thực (`supabase/migrations/20261023000000_init_schema.sql:68-76`).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Khóa chính sự kiện |
| `trip_id` | `UUID` | `REFERENCES trips(id)` | Khóa ngoại tới chuyến đi bị ảnh hưởng |
| `trigger_type` | `TEXT` | Nullable | Nguyên nhân kích hoạt: `weather_rain`, `poi_closed`, `traffic_delay`, hoặc `manual` |
| `trigger_data` | `JSONB` | Nullable | Dữ liệu chi tiết về sự kiện (lời giải thích, danh sách điểm bị đổi) |
| `old_itinerary` | `JSONB` | Nullable | Snapshot cấu trúc lịch trình cũ trước khi tái lập |
| `new_itinerary` | `JSONB` | Nullable | Snapshot cấu trúc lịch trình mới sau khi tối ưu lại |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Thời điểm ghi nhận sự kiện tái lập |

---

## 3. Chỉ mục không gian (Spatial Indexes) & Ràng buộc quan hệ

- **Chỉ mục GiST**:
  `CREATE INDEX IF NOT EXISTS pois_location_idx ON pois USING GIST(location);`
  Được khai báo tại [`supabase/migrations/20261023000000_init_schema.sql:30`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/migrations/20261023000000_init_schema.sql#L30). Giúp tăng tốc vượt trội các câu lệnh tính khoảng cách `ST_DWithin` hoặc sắp xếp theo khoảng cách `ORDER BY location <-> ST_SetSRID(ST_Point(...), 4326)`.
- **Ràng buộc toàn vẹn xóa (ON DELETE CASCADE)**:
  - Khi một bản ghi trong `trips` bị xóa, toàn bộ các ngày liên kết trong `itinerary_days` sẽ tự động bị xóa.
  - Khi một ngày trong `itinerary_days` bị xóa (thực hiện khi tái lập lịch tại [`backend/app/routers/trips.py:353`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L353)), toàn bộ các `itinerary_items` của ngày đó sẽ tự động bị dọn sạch.

---

## 4. Công cụ & Hướng dẫn chạy Migration / Seed

1. **Khởi tạo Schema ban đầu**:
   - Mở Supabase Dashboard $\to$ Chọn **SQL Editor**.
   - Mở tệp [`supabase/migrations/20261023000000_init_schema.sql`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/migrations/20261023000000_init_schema.sql) và nhấn **Run** để khởi tạo các bảng và chỉ mục không gian.
2. **Nạp dữ liệu mẫu (Seed Data)**:
   - Trong SQL Editor, mở tệp [`supabase/seed.sql`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/seed.sql) và nhấn **Run** để nạp sẵn dữ liệu địa điểm du lịch văn hóa, bảo tàng, ẩm thực và danh lam thắng cảnh tại Hội An, Đà Nẵng, Đà Lạt.
   - Hoặc gọi trực tiếp API tiện ích từ backend:
     `POST /api/pois/seed-hoian` (được định nghĩa trong [`backend/app/routers/pois.py:65-107`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/pois.py#L65-L107)).
