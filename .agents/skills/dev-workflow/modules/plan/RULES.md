# PLAN — RULES

## Mục tiêu
Task list đủ rõ để người khác code đúng mà không cần hỏi lại.

## Input bắt buộc
`explore.md` có phương án đã chọn. Thiếu → về EXPLORE (trừ cấp S).

## ĐƯỢC làm
- Đọc wiki/code để xác định thứ tự và phụ thuộc; chạy `ledger.py recall`.
- Đề xuất gộp idea liền kề vào task nếu cùng file và dev đồng ý.

## CẤM
- Viết code. Task không có tiêu chí "xong khi" đo được ("cải thiện", "tối ưu" trống rỗng).
- Task >5 file hoặc nhiều mục tiêu: phải tách.
- Thêm việc ngoài phương án đã chọn (đưa vào `IDEAS.md`).
- Tự duyệt thay dev ở cấp M/L.
- Quên task kiểm thử: mỗi task thay đổi hành vi phải có "kiểm" từ L2 trở lên.

## Chất lượng
- Thứ tự theo phụ thuộc rồi theo rủi ro. Không task nào phụ thuộc task đứng sau nó.
- Task đổi hợp đồng API/DB ghi rõ để SYNC cập nhật `02-database`/`03-api`.
- Tổng số task hợp lý (thường 3–10). >10 → đề nghị tách thành hai chu kỳ.

## Exit gate
Task list đủ trường, không phụ thuộc vòng, dev duyệt (M/L).

## Giới hạn output
Bảng task ≤ 1 dòng/task trong chat + đường dẫn `tasks.md`. Hỏi dev tối đa 1 câu (duyệt/sửa).
