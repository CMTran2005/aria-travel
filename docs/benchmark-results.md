# Báo cáo Benchmark: Thuật toán Tối ưu hóa Lộ trình ARIA (Sprint 5)

## 1. Giới thiệu bài toán
Bài toán lập lịch trình du lịch cho hệ thống ARIA được mô hình hóa thành **TSPTW (Traveling Salesperson Problem with Time Windows)** kết hợp phân cụm đa ngày:
- **Time Windows:** Giờ mở cửa và đóng cửa của từng POI (hoặc khung giờ du lịch thực tế 08:30 – 21:30).
- **Service Time:** Thời lượng trải nghiệm trung bình tại mỗi điểm (`avg_duration_minutes`).
- **Transit Cost:** Thời gian và khoảng cách di chuyển giữa các điểm theo OSRM / Haversine.

---

## 2. Các thuật toán so sánh

| Thuật toán | Loại thuật toán | Đặc điểm thực thi |
|---|---|---|
| **Greedy Nearest Neighbor** *(Sprint 4 Baseline)* | Heuristic cục bộ | Tại mỗi bước, chọn POI tiếp theo gần nhất và có điểm AI Score cao nhất thoả mãn khung giờ. Độ phức tạp $O(N^2)$, chạy cực nhanh nhưng dễ rơi vào tối ưu cục bộ. |
| **Google OR-Tools TSPTW + K-Means** *(Sprint 5 Main)* | Metaheuristic toàn cục | 1. Phân cụm vị trí địa lý theo từng ngày bằng **K-Means Clustering**.<br>2. Thiết lập bài toán tối ưu hoá với **Guided Local Search** và ràng buộc Time Windows cứng.<br>3. Tối ưu hoá tổng quãng đường di chuyển và thời gian chờ. |

---

## 3. Kết quả thử nghiệm thực tế (Thành phố Hội An)

Thử nghiệm trên tập dữ liệu POI thực tế tại Hội An:

```
[KẾT QUẢ ĐO ĐẠC TRÊN CÙNG TẬP POI THỬ NGHIỆM]
-----------------------------------------------------------------------------------
Thuật toán                      | Số POI ghé thăm | Tổng quãng đường | Cải thiện (%)
-----------------------------------------------------------------------------------
Greedy Baseline (Sprint 4)      | 5 POIs          | 1.48 km          | Baseline
Google OR-Tools TSPTW (Sprint 5)| 5 POIs          | 1.25 km          | +15.5% quãng đường ngắn hơn
-----------------------------------------------------------------------------------
```

### Nhận xét & Đánh giá:
1. **Quãng đường di chuyển ngắn hơn 15.5%**: OR-Tools tìm ra thứ tự đi vòng qua các điểm tối ưu hơn, tránh tình trạng "đi ngược vòng lặp" mà thuật toán tham lam (Greedy) thường mắc phải.
2. **K-Means Clustering**: Giúp phân tách các điểm nằm ở vùng ngoại ô (như Rừng dừa Bảy Mẫu, Biển An Bàng, Làng gốm Thanh Hà) sang các ngày khác nhau, không bị trộn lẫn gây phân tán lộ trình.
3. **Thời gian tính toán**: OR-Tools giải quyết trong khoảng 10–50ms trên tập POI mỗi ngày, hoàn toàn đáp ứng yêu cầu phản hồi thời gian thực dưới 3 giây của web app.
