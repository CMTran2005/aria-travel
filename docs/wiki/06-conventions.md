# 06 — Quy ước phát triển (Engineering Conventions)

Tài liệu này quy định các tiêu chuẩn viết mã, quy ước đặt tên, xử lý lỗi, cách thêm endpoint/migration mới và quy trình kiểm thử cho toàn bộ dự án ARIA.

---

## 1. Phong cách lập trình (Code Style) & Quy ước đặt tên

### Backend (Python / FastAPI)
- **Chuẩn phong cách**: Tuân thủ chuẩn PEP 8.
- **Quy ước đặt tên**:
  - Tên tệp tin, hàm, biến và tham số: `snake_case` (vd: `extract_user_intent`, `solve_day_tsptw_ortools`, `target_day_number`).
  - Lớp (Class), Pydantic Schemas, Exceptions: `PascalCase` (vd: `PlanTripRequest`, `PlanTripResponse`, `Settings`).
  - Hằng số: `UPPER_SNAKE_CASE` (vd: `CITY_COORDINATES`, `OUTDOOR_CATEGORIES`).
- **Ép kiểu dữ liệu (Type Annotations)**:
  - Bắt buộc khai báo kiểu dữ liệu cho toàn bộ tham số và giá trị trả về của hàm bằng module `typing` (`List`, `Dict`, `Any`, `Optional`, `Tuple`) như trong [`backend/app/services/optimizer.py:1-6`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/optimizer.py#L1-L6).
  - Sử dụng Pydantic `BaseModel` để định nghĩa cấu trúc dữ liệu cho request body và response model như trong [`backend/app/routers/trips.py:14-49`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L14-L49).

### Frontend (TypeScript / React / Next.js 14)
- **Chuẩn phong cách**: TypeScript nghiêm ngặt được cấu hình tại [`frontend/tsconfig.json`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/tsconfig.json).
- **Quy ước đặt tên**:
  - Tên Component và tệp Component: `PascalCase` (vd: [`frontend/src/components/map/MapView.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/map/MapView.tsx), [`frontend/src/components/ui/Toast.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/ui/Toast.tsx)).
  - Hàm tiện ích, hooks và biến: `camelCase` (vd: `planTrip`, `formatVND`, `haversineDistance`).
  - Định dạng kiểu dữ liệu (Interface / Type): `PascalCase` (vd: `TripData`, `ItineraryItem`).
- **Giao diện**: Ưu tiên sử dụng utility classes của Tailwind CSS cấu hình tại [`frontend/tailwind.config.js`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/tailwind.config.js), không viết CSS inline trừ trường hợp tính toán kích thước động.

---

## 2. Xử lý lỗi (Error Handling) & Logging

1. **FastAPI HTTP Exceptions**:
   - Sử dụng `HTTPException` từ `fastapi` kèm mã trạng thái rõ ràng (400 cho bad input, 404 cho not found, 500 cho server/external API error) tại [`backend/app/routers/trips.py:62`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L62).
   - Nội dung thông báo lỗi trong `detail` phải viết bằng tiếng Việt tự nhiên, nêu rõ nguyên nhân để hiển thị trực tiếp lên Toast thông báo phía frontend.
2. **Chiến lược Phục hồi / Suy thoái mềm (Graceful Degradation)**:
   - Các dịch vụ gọi bên ngoài (Groq, OpenWeatherMap, OSRM) không được phép làm dừng toàn bộ ứng dụng khi gặp sự cố. Luôn cài đặt phương án fallback:
     - Groq LLM lỗi $\to$ Fallback sang OpenRouter $\to$ Fallback sang thuật toán xếp hạng theo rating (`backend/app/routers/trips.py:101-105`).
     - OpenWeatherMap lỗi $\to$ Trả về thời tiết nắng đẹp tiêu chuẩn (`backend/app/services/weather.py:62-72`).
     - OSRM lỗi $\to$ Vẽ đường thẳng nối trực tiếp tọa độ các điểm (`backend/app/routers/trips.py:124`).
3. **An toàn dữ liệu bảo mật**:
   - Tuyệt đối không ghi giá trị biến môi trường, API Key, service role secret hoặc chuỗi kết nối cơ sở dữ liệu ra log hoặc console.

---

## 3. Cách thêm Endpoint mới

1. Định nghĩa logic xử lý trong router phù hợp tại thư mục `backend/app/routers/`.
2. Khai báo Pydantic schemas cho Request Body và Response Model.
3. Nếu tạo router mới, import và đăng ký router vào ứng dụng trong [`backend/app/main.py:22-24`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L22-L24):
   ```python
   app.include_router(new_router.router, prefix="/api")
   ```
4. Bổ sung hàm gọi tương ứng vào client [`frontend/src/lib/api.ts`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/lib/api.ts) để các component frontend sử dụng thống nhất.

---

## 4. Cách thêm Migration cơ sở dữ liệu mới

1. Đặt tên tệp migration theo chuẩn thời gian dạng `supabase/migrations/<timestamp>_ten_mo_ta.sql` (ví dụ: [`supabase/migrations/20261023000000_init_schema.sql`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/supabase/migrations/20261023000000_init_schema.sql)).
2. Viết câu lệnh SQL có kiểm tra tính an toàn (`IF NOT EXISTS`, `ON DELETE CASCADE`).
3. Thực thi câu lệnh trong Supabase SQL Editor.
4. Cập nhật tài liệu [`docs/wiki/02-database.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/02-database.md) để phản ánh bảng/cột mới được thêm.

---

## 5. Quy ước kiểm thử (Testing Conventions)

1. **Kiểm tra trạng thái hệ thống**:
   - Chạy endpoint `GET /health` ([`backend/app/main.py:26-41`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/main.py#L26-L41)) để kiểm tra kết nối Supabase và FastAPI.
2. **Benchmark thuật toán tối ưu**:
   - Gọi endpoint `GET /api/trips/benchmark/compare` ([`backend/app/routers/trips.py:233-268`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L233-L268)) để đánh giá độ cải thiện quãng đường của Google OR-Tools TSPTW so với Greedy Baseline (kết quả lưu trong [`docs/benchmark-results.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/benchmark-results.md)).
3. **Quy trình kiểm thử giao diện**:
   - Sử dụng bảng kiểm thử giao diện chi tiết trong [`docs/wiki/04-flows.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/04-flows.md) mục 5 để rà soát toàn bộ các kịch bản người dùng trước khi bàn giao.
