# 04 — Các luồng nghiệp vụ chính (Core Workflows)

Tài liệu này mô tả chi tiết các luồng nghiệp vụ ưu tiên của ARIA, chỉ rõ chuỗi thực thi qua từng tệp nguồn/hàm, sơ đồ tuần tự và danh mục kiểm thử giao diện (UI Checklist) phục vụ pha VERIFY.

---

## 1. Luồng 1: Lập kế hoạch lộ trình du lịch mới bằng AI (AI Planning Flow)

### Mô tả
Người dùng nhập nhu cầu du lịch bằng ngôn ngữ tự nhiên (hoặc chọn các tùy chọn nhanh: số ngày, phong cách du lịch, ngân sách). Hệ thống phân tích, tối ưu hóa và xuất bản lộ trình hoàn chỉnh trong thời gian thực.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Plan Page (frontend/src/app/plan/page.tsx)
    participant API as Trips Router (backend/app/routers/trips.py)
    participant AI as AI Agent (backend/app/services/ai_agent.py)
    participant Opt as Optimizer (backend/app/services/optimizer.py)
    participant OSRM as Routing Service (backend/app/services/routing.py)
    participant DB as Supabase Database

    User->>UI: Nhập mô tả chuyến đi & bấm "Khởi tạo lộ trình"
    UI->>API: POST /api/trips/plan
    API->>AI: extract_user_intent(user_prompt)
    AI-->>API: Trả về JSON Intent (thành phố, số ngày, phong cách)
    API->>DB: Truy vấn POIs của thành phố từ bảng pois
    DB-->>API: Danh sách bản ghi POIs (PostGIS EWKB)
    API->>AI: score_pois_with_ai(pois, intent)
    AI-->>API: Danh sách POIs kèm ai_score
    API->>Opt: schedule_multi_day_trip(candidate_pois, num_days)
    Opt-->>API: Lịch trình phân bổ các ngày (TSPTW OR-Tools)
    API->>OSRM: get_route_geometry(day_coords)
    OSRM-->>API: Tọa độ Polyline đường đi
    API->>DB: Lưu trips, itinerary_days, itinerary_items
    DB-->>API: Xác nhận bản ghi đã lưu thành công
    API-->>UI: Trả về PlanTripResponse kèm trip_id
    UI->>User: Chuyển hướng tới trang chi tiết /trips/[id]
```

### Các bước thực thi và hàm tham chiếu
1. **Thu thập dữ liệu**: [`frontend/src/app/plan/page.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/app/plan/page.tsx) thu thập `user_prompt` và gọi `planTrip` trong [`frontend/src/lib/api.ts`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/lib/api.ts).
2. **Trích xuất ý định**: [`backend/app/routers/trips.py:68`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L68) gọi `extract_user_intent` tại [`backend/app/services/ai_agent.py:42-93`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/ai_agent.py#L42-L93).
3. **Chấm điểm địa điểm**: [`backend/app/services/ai_agent.py:94-161`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/ai_agent.py#L94-L161) chấm điểm mức độ phù hợp với sở thích của người dùng (`ai_score` từ 0-10).
4. **Phân cụm & Tối ưu hóa**: [`backend/app/services/optimizer.py:272-332`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/optimizer.py#L272-L332) chia cụm K-Means theo ngày và giải bài toán TSPTW bằng `solve_day_tsptw_ortools`.
5. **Định tuyến hình học**: [`backend/app/services/routing.py:43-75`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/routing.py#L43-L75) truy vấn OSRM API lấy mảng tọa độ vẽ lộ trình trên bản đồ.
6. **Lưu trữ**: Lưu dữ liệu phân cấp vào Supabase tại [`backend/app/routers/trips.py:127-169`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L127-L169).

### Edge Cases
- Người dùng không nhập văn bản: Báo lỗi HTTP 400 yêu cầu nhập mô tả (`backend/app/routers/trips.py:61-63`).
- Thành phố chưa có dữ liệu trong DB: Fallback lấy các địa điểm khả dụng gần nhất (`backend/app/routers/trips.py:83-85`).
- Groq LLM bị lỗi mạng: Tự động fallback sang chấm điểm mặc định theo rating địa điểm (`backend/app/routers/trips.py:101-105`).

---

## 2. Luồng 2: Tái lập lịch trình thích ứng thời gian thực (Adaptive Replanning)

### Mô tả
Khi đang thực hiện chuyến đi, nếu gặp thời tiết mưa bão, một địa điểm bất ngờ đóng cửa, hoặc tắc đường trễ giờ, người dùng nhấn nút kích hoạt kịch bản. Động cơ Replanner tự động tính toán lại lộ trình thay thế tối ưu mà không làm xáo trộn các ngày khác.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Trip Page (frontend/src/app/trips/[id]/page.tsx)
    participant API as Trips Router (backend/app/routers/trips.py)
    participant Replan as Replanner (backend/app/services/replanner.py)
    participant Opt as Optimizer (backend/app/services/optimizer.py)
    participant DB as Supabase Database

    User->>UI: Bấm nút "Mưa to" / "Địa điểm đóng cửa" / "Kẹt xe"
    UI->>API: PUT /api/trips/{trip_id}/replan
    API->>DB: Lấy lịch trình hiện tại và ứng viên thay thế
    API->>Replan: replan_trip_itinerary(current_days, trigger_type)
    alt Thời tiết xấu (weather_rain)
        Replan->>Replan: Đổi điểm ngoài trời sang điểm trong nhà
    else Địa điểm đóng cửa (poi_closed)
        Replan->>Replan: Tìm điểm thay thế cùng category gần nhất
    else Kẹt xe (traffic_delay)
        Replan->>Replan: Dịch chuyển khung giờ và cắt bớt điểm quá muộn
    end
    Replan->>Opt: solve_day_tsptw_ortools(new_items)
    Opt-->>Replan: Thứ tự tham quan mới tối ưu
    API->>DB: Cập nhật lại itinerary_items của ngày bị ảnh hưởng
    API->>DB: Ghi log vào bảng replanning_events
    API-->>UI: Trả về lịch trình mới và lời giải thích (explanation)
    UI->>User: Cập nhật giao diện Timeline, Map và hiển thị Toast
```

### Các bước thực thi và hàm tham chiếu
1. **Gửi yêu cầu**: Giao diện [`frontend/src/app/trips/[id]/page.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/app/trips/[id]/page.tsx) gọi `replanTrip` qua [`frontend/src/lib/api.ts`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/lib/api.ts).
2. **Phân loại kịch bản**: [`backend/app/services/replanner.py:19-187`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/services/replanner.py#L19-L187) phân biệt theo `trigger_type`:
   - `weather_rain`: Dùng hàm `is_outdoor_poi` (`backend/app/services/replanner.py:8-17`) lọc các điểm ngoài trời và thay bằng điểm trong nhà lân cận.
   - `poi_closed`: Lọc bỏ địa điểm bị đóng cửa, tìm điểm cùng phân loại gần nhất (`backend/app/services/replanner.py:98-144`).
   - `traffic_delay`: Lùi giờ ghé thăm và tự động cắt bỏ điểm cuối nếu kết thúc sau 22:30 (`backend/app/services/replanner.py:145-177`).
3. **Cập nhật dữ liệu & Ghi nhật ký**: Xóa và ghi lại các mục trong ngày tại [`backend/app/routers/trips.py:344-368`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/trips.py#L344-L368), lưu lịch sử sự kiện vào bảng `replanning_events` (`backend/app/routers/trips.py:371-380`).

---

## 3. Luồng 3: Tương tác bản đồ & Điều chỉnh tọa độ POI (Map Interaction)

1. Thành phần [`frontend/src/components/map/MapView.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/map/MapView.tsx) hiển thị các Marker điểm đến theo màu sắc riêng của từng ngày và Polyline đường nối giữa các điểm.
2. Khi người dùng click vào một điểm trên bản đồ hoặc kích hoạt chế độ chỉnh sửa tọa độ, frontend gọi hàm `updatePoiLocation` trong [`frontend/src/lib/api.ts`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/lib/api.ts).
3. Backend tiếp nhận tại endpoint `PATCH /api/pois/{poi_id}/location` ([`backend/app/routers/pois.py:45-64`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/backend/app/routers/pois.py#L45-L64)), chuyển đổi tọa độ sang WKT PostGIS và cập nhật bản ghi trong cơ sở dữ liệu.

---

## 4. Luồng 4: Đồng bộ tức thời đa thiết bị qua Supabase Realtime

1. Tại [`frontend/src/app/trips/[id]/page.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/app/trips/[id]/page.tsx), hook `useEffect` thiết lập kết nối tới Supabase Realtime Channel với filter `trip_id=eq.{id}`.
2. Khi có bất kỳ thay đổi nào từ phía backend (do cronjob thời tiết hoặc người dùng khác cùng nhóm kích hoạt Re-plan), Supabase phát thông điệp CDC qua kênh WebSocket.
3. Trình duyệt client nhận sự kiện và tự động gọi lại hàm nạp dữ liệu để cập nhật lại giao diện ngay tức thì mà không cần người dùng phải bấm F5 tải lại trang.

---

## 5. UI Checklist cho VERIFY (Danh mục kiểm thử giao diện)

Dành cho module `verify` rà soát chất lượng hệ thống:

- [ ] **Khởi tạo kế hoạch (/plan)**:
  - [ ] Nhập mô tả tiếng Việt có dấu $\to$ Bấm Submit $\to$ Nút bấm hiển thị trạng thái loading $\to$ Chuyển trang thành công sang `/trips/[id]`.
  - [ ] Chọn ngân sách bằng thanh trượt [`frontend/src/components/ui/DualThumbRangeSlider.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/ui/DualThumbRangeSlider.tsx) hoạt động trơn tru.
  - [ ] Chọn số ngày bằng [`frontend/src/components/ui/CustomSelect.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/ui/CustomSelect.tsx) phản hồi đúng giá trị.
- [ ] **Trang chi tiết hành trình (`/trips/[id]`)**:
  - [ ] Timeline hiển thị đầy đủ danh sách ngày (Tabs Ngày 1, Ngày 2...).
  - [ ] Bản đồ Leaflet phóng to vừa khớp vùng bao (fitBounds) của toàn bộ các điểm dừng.
  - [ ] Bấm nút **Thời tiết xấu (Mưa to)**: Hệ thống hiển thị Toast thông báo [`frontend/src/components/ui/Toast.tsx`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/frontend/src/components/ui/Toast.tsx), các điểm ngoài trời được thay thế bằng điểm trong nhà và Polyline bản đồ vẽ lại lộ trình mới.
  - [ ] Bấm nút **Điểm tham quan đóng cửa**: Địa điểm đầu tiên được thay thế bằng địa điểm cùng loại khác.
  - [ ] Bấm nút **Kẹt xe (Trễ 45 phút)**: Khung giờ các điểm tiếp theo tự động lùi 45 phút.
  - [ ] Bấm nút **Chia sẻ lộ trình**: Toast thông báo "Đã sao chép liên kết vào clipboard" xuất hiện và tự biến mất sau 3 giây.
