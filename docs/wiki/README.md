# ARIA Wiki — Tài liệu kỹ thuật dự án

Tài liệu nội bộ dự án ARIA (Adaptive Route Intelligence Assistant) — hệ thống gợi ý và tái lập lịch trình du lịch thông minh thích ứng theo thời gian thực kết hợp tối ưu hóa đa mục tiêu.

synced_commit: 6eb2e358a816df40e7c71277e87149bc0aad691d

---

## 1. Mục lục Wiki

| Thứ tự | Tài liệu | Nội dung chính |
|:---:|---|---|
| 00 | [`00-overview.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/00-overview.md) | Tổng quan dự án, phát hiện công nghệ, cấu trúc thư mục, hướng dẫn khởi chạy local, biến môi trường |
| 01 | [`01-architecture.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/01-architecture.md) | Kiến trúc tổng thể hệ thống, sơ đồ các tầng, mô hình giao tiếp, dịch vụ bên thứ ba & hạ tầng |
| 02 | [`02-database.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/02-database.md) | Cơ sở dữ liệu Supabase PostGIS, 6 bảng quan hệ, kiểu dữ liệu EWKB, chỉ mục GIST & seed data |
| 03 | [`03-api.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/03-api.md) | Danh mục chi tiết 9 REST API endpoint, tham số request/response, mã trạng thái lỗi và rate limit |
| 04 | [`04-flows.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/04-flows.md) | 4 luồng nghiệp vụ cốt lõi: AI Planning, Real-time Replanning, Tương tác bản đồ & Supabase Realtime |
| 05 | [`05-modules.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/05-modules.md) | Phân tích chi tiết từng module/service lõi: Optimizer, Replanner, AI Agent, Routing, MapView, Timeline |
| 06 | [`06-conventions.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/06-conventions.md) | Quy ước viết mã (Python/TypeScript), xử lý lỗi, logging, cách thêm tính năng và quy trình kiểm thử |
| 07 | [`07-changelog.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/07-changelog.md) | Nhật ký thay đổi và đồng bộ wiki theo từng phiên làm việc |

---

## 2. Thứ tự đọc đề nghị

1. **Người mới gia nhập dự án**: Đọc [`00-overview.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/00-overview.md) $\to$ [`01-architecture.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/01-architecture.md) $\to$ [`04-flows.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/04-flows.md) để nắm bức tranh tổng thể và nghiệp vụ sản phẩm.
2. **Backend Developer**: Đọc [`02-database.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/02-database.md) $\to$ [`03-api.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/03-api.md) $\to$ [`05-modules.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/05-modules.md) để hiểu sâu về thuật toán Google OR-Tools TSPTW, LangChain Intent Extraction và PostGIS EWKB.
3. **Frontend Developer**: Đọc [`03-api.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/03-api.md) $\to$ [`04-flows.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/04-flows.md) $\to$ [`05-modules.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/05-modules.md) để tích hợp Leaflet MapView, Supabase Realtime WebSocket và giao diện lập kế hoạch đa bước.
4. **DevOps & QA**: Đọc [`00-overview.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/00-overview.md), [`06-conventions.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/wiki/06-conventions.md) kết hợp [`docs/deployment-guide.md`](file:///d:/Study/School_Project/DACN2_DM&CM/aria-travel/docs/deployment-guide.md).

---

## 3. Chưa quét

- Không có — toàn bộ 28 file mã nguồn chính thuộc `backend/`, `frontend/`, `supabase/` và `docs/` đã được rà soát và đối chiếu đầy đủ.
