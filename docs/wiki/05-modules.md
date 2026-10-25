# 05 — Các module và dịch vụ lõi (Core Modules)

Tài liệu này phân tích chi tiết các module nghiệp vụ quan trọng nhất của ARIA, bao gồm vị trí tệp tin, trách nhiệm, interface công khai, thành phần phụ thuộc và những lưu ý kỹ thuật khi sửa đổi mã nguồn.

---

## 1. Module `optimizer`

- **Vị trí**: [`backend/app/services/optimizer.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/optimizer.py)
- **Trách nhiệm**: Lập lịch trình đa ngày tối ưu hóa bài toán Traveling Salesperson Problem with Time Windows (TSPTW). Tối thiểu hóa tổng quãng đường di chuyển và thời gian chờ đợi giữa các điểm đến, đồng thời tuân thủ khung giờ hoạt động của từng địa điểm.
- **Interface công khai**:
  - `solve_day_tsptw_ortools(pois, start_pos, day_start_minutes, day_end_minutes, time_limit_seconds)`: Giải TSPTW cho 1 ngày bằng Google OR-Tools. Trả về danh sách điểm kèm khung giờ `planned_start` và `planned_end` (`backend/app/services/optimizer.py:23-175`).
  - `plan_greedy_day_itinerary(...)`: Thuật toán tham lam Heuristic Baseline sắp xếp theo tỷ lệ Utility / Distance (`backend/app/services/optimizer.py:176-269`).
  - `schedule_multi_day_trip(candidate_pois, num_days, city_center)`: Điều phối phân cụm địa lý đa ngày và áp dụng giải thuật tối ưu theo từng cụm (`backend/app/services/optimizer.py:272-332`).
- **Phụ thuộc**: `ortools.constraint_solver`, `scikit-learn` (qua `clusterer`), [`backend/app/services/routing.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/routing.py), [`backend/app/services/clusterer.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/clusterer.py).
- **Lưu ý khi sửa**:
  - Depot (điểm xuất phát và kết thúc) được mặc định là Node 0 (khách sạn hoặc trung tâm thành phố).
  - Ràng buộc Disjunction Penalty (`50000`) được thêm vào để OR-Tools không bị dừng vô nghiệm khi một điểm không thể khớp khung giờ (`backend/app/services/optimizer.py:122`).
  - Cần chạy với Python 3.12/3.11 vì thư viện Google OR-Tools chưa tương thích hoàn toàn với Python 3.13+.

---

## 2. Module `replanner`

- **Vị trí**: [`backend/app/services/replanner.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/replanner.py)
- **Trách nhiệm**: Động cơ thích ứng thời gian thực xử lý biến động thực tế trong chuyến đi theo 4 kịch bản: thời tiết xấu/mưa to, địa điểm đóng cửa đột xuất, trễ giờ do tắc đường, hoặc người dùng yêu cầu tính toán lại thủ công.
- **Interface công khai**:
  - `is_outdoor_poi(poi)`: Hàm phân loại điểm tham quan ngoài trời dựa vào danh mục và nhãn (`backend/app/services/replanner.py:8-17`).
  - `replan_trip_itinerary(current_days, all_candidate_pois, trigger_type, target_day_number, closed_poi_id, delay_minutes, city_center)`: Động cơ chính tái lập lịch trình, trả về lịch trình cập nhật, lời giải thích và danh sách điểm bị đổi (`backend/app/services/replanner.py:19-187`).
- **Phụ thuộc**: [`backend/app/services/optimizer.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/optimizer.py), [`backend/app/services/routing.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/routing.py).
- **Lưu ý khi sửa**:
  - Chỉ thay đổi lịch trình của ngày được chọn (`target_day_number`), không xáo trộn lịch trình của các ngày khác.
  - Phải loại trừ các POI đã có trong lịch trình (`existing_poi_ids`) để tránh trùng lặp điểm đến.

---

## 3. Module `ai_agent`

- **Vị trí**: [`backend/app/services/ai_agent.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/ai_agent.py)
- **Trách nhiệm**: Giao tiếp với các mô hình ngôn ngữ lớn (LLM) để trích xuất ý định du lịch từ văn bản người dùng nhập và chấm điểm mức độ phù hợp của từng địa điểm trong cơ sở dữ liệu.
- **Interface công khai**:
  - `get_llm()`: Khởi tạo đối tượng Chat Model với chuỗi dự phòng (Primary: Groq Cloud openai/gpt-oss-120b, Fallback: OpenRouter meta-llama/llama-3.1-8b-instruct:free) (`backend/app/services/ai_agent.py:8-41`).
  - `extract_user_intent(user_input)`: Trích xuất thông tin có cấu trúc (thành phố, số ngày, ngân sách, phong cách du lịch) từ câu nói người dùng (`backend/app/services/ai_agent.py:42-93`).
  - `score_pois_with_ai(pois, intent)`: Đánh giá và trả về điểm số từ 0 đến 10 kèm lý do gợi ý cho từng địa điểm (`backend/app/services/ai_agent.py:94-161`).
- **Phụ thuộc**: `langchain-groq`, `langchain-openai`, `langchain-core`, [`backend/app/core/config.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/core/config.py).
- **Lưu ý khi sửa**:
  - Luôn bọc phản hồi trong khối `try-except` để trả về JSON fallback an toàn khi API bên ngoài bị nghẽn mạng hoặc hết hạn mức token.
  - Prompt hệ thống yêu cầu trả về JSON thuần túy, nhưng hàm xử lý vẫn có bước bóc tách markdown codeblock phòng trường hợp mô hình tự thêm định dạng.

---

## 4. Module `routing`

- **Vị trí**: [`backend/app/services/routing.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/routing.py)
- **Trách nhiệm**: Tính toán khoảng cách địa lý, ước lượng thời gian di chuyển và lấy đường đi thực tế chi tiết từ OSRM.
- **Interface công khai**:
  - `haversine_distance(coord1, coord2)`: Tính khoảng cách đường chim bay giữa hai cặp tọa độ theo công thức Haversine (đơn vị: km).
  - `estimate_travel_time_minutes(distance_km, avg_speed_kmh=25.0)`: Tính thời gian di chuyển dự kiến giữa hai điểm trong đô thị du lịch với vận tốc trung bình 25 km/h.
  - `get_route_geometry(coordinates)`: Gửi yêu cầu tới OSRM Driving API để lấy chuỗi tọa độ chi tiết biểu diễn đường đi thực tế (`backend/app/services/routing.py:43-75`).
- **Phụ thuộc**: `httpx`, thư viện toán học `math`.
- **Lưu ý khi sửa**:
  - OSRM nhận tham số theo thứ tự `lon,lat`, trong khi Leaflet và PostGIS thường biểu diễn `lat,lon`. Cần chú ý đảo chiều tọa độ chính xác trước khi gửi và sau khi nhận kết quả.

---

## 5. Module `geo`

- **Vị trí**: [`backend/app/core/geo.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/core/geo.py)
- **Trách nhiệm**: Giải mã dữ liệu không gian PostGIS EWKB (Extended Well-Known Binary) hex string sang cặp số thực `(latitude, longitude)`.
- **Interface công khai**:
  - `parse_wkb_point(wkb_hex)`: Đọc byte order, geometry type (kiểm tra cờ SRID 4326 qua mặt nạ `0x20000000`), giải mã byte nhị phân IEEE 754 và làm tròn 6 chữ số thập phân (`backend/app/core/geo.py:4-26`).
- **Phụ thuộc**: Thư viện chuẩn `struct`.
- **Lưu ý khi sửa**:
  - Không sử dụng các thư viện C/C++ nặng nề như GDAL hay Shapely để tránh lỗi biên dịch phức tạp trên hệ điều hành Windows và môi trường serverless.

---

## 6. Module `weather`

- **Vị trí**: [`backend/app/services/weather.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/weather.py)
- **Trách nhiệm**: Lấy thông tin thời tiết trực tiếp từ OpenWeatherMap API và phân tích cảnh báo thời tiết bất lợi.
- **Interface công khai**:
  - `get_current_weather(city)`: Trả về nhiệt độ, độ ẩm, sức gió và cờ `is_bad_weather`. Khi không có kết nối hoặc thiếu API Key, tự động trả về dữ liệu mô phỏng chuẩn mực thời tiết nhiệt đới (`backend/app/services/weather.py:19-72`).
- **Phụ thuộc**: `httpx`, [`backend/app/core/config.py`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/core/config.py).

---

## 7. Frontend Map Module (`MapView`)

- **Vị trí**: [`frontend/src/components/map/MapView.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/map/MapView.tsx)
- **Trách nhiệm**: Hiển thị bản đồ Leaflet tương tác, vẽ Marker đánh số thứ tự ghé thăm, vẽ đường Polyline nối các điểm theo ngày và hỗ trợ cập nhật tọa độ.
- **Phụ thuộc**: `leaflet`, `react-leaflet`, OpenStreetMap Tile Layer.
- **Lưu ý khi sửa**:
  - Leaflet yêu cầu chỉ chạy ở phía Client (CSR). Cần sử dụng dynamic import next/dynamic với tùy chọn `{ ssr: false }` khi nhúng vào trang Next.js để tránh lỗi `window is not defined`.
