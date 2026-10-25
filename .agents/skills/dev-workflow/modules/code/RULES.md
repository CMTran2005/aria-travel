# CODE — RULES (luật riêng của module, độc lập với luật orchestrator)

## Mục tiêu
Hiện thực đúng task đã duyệt, nhỏ nhất có thể, theo convention của dự án.

## Input bắt buộc
Task có tiêu chí hoàn thành + danh sách file dự kiến. Thiếu → trả về PLAN.

## ĐƯỢC làm
- Sửa file nằm trong danh sách dự kiến của task.
- Thêm test cho code mới (cùng thư mục/convention test sẵn có).
- Ghi idea phát sinh vào `IDEAS.md` (1 dòng) rồi làm tiếp.
- Đọc `06-conventions.md` và bắt chước pattern code lân cận.

## CẤM
- Mở rộng phạm vi: không refactor, đổi tên, format lại file ngoài task.
- Sửa file ngoài danh sách mà không ghi lý do vào handoff (>3 file ngoài danh sách → dừng, về PLAN).
- Thêm dependency mới khi chưa hỏi dev.
- Ghi secret/giá trị `.env` vào code, log, wiki.
- Nuốt lỗi (`catch {}` rỗng), hardcode để test pass, xóa/skip test để xanh.
- Tuyên bố "xong" khi chưa chạy build/test liên quan.
- Tự quyết kiến trúc: gặp ngã rẽ lớn → hỏi dev (nêu 2 phương án + khuyến nghị).

## Chất lượng tối thiểu mỗi thay đổi
- Xử lý lỗi + trạng thái rỗng/loading/lỗi cho mọi chỗ UI gọi API.
- Input từ ngoài (request, form, file) phải được validate.
- Không đổi hợp đồng API/DB công khai mà không ghi vào handoff (để SYNC cập nhật wiki).

## Phát hiện giữa chừng
| Gặp | Làm |
|---|---|
| Idea hay ngoài phạm vi | `ledger.py add-idea` (1 dòng), không làm |
| Bug có sẵn không liên quan | `ledger.py add-bug` (1 dòng), không sửa |
| Giả định explore sai | Dừng, `STATE.md` → EXPLORE, nêu bằng chứng |
| Task mơ hồ | Dừng, `STATE.md` → PLAN |

## Exit gate
build ✓ · test liên quan ✓ · handoff đủ · không file ngoài phạm vi chưa giải trình.

## Giới hạn output (tiếng Việt)
- Tiến độ: ≤3 dòng. Xong 1 task: kết luận + ≤5 gạch đầu dòng + đường dẫn handoff.
- Không dán lại code đã nằm trong file; chỉ trỏ `file:dòng`.
- Chi tiết đầy đủ chỉ khi: gặp rủi ro, cần dev chọn, hoặc quay lui pha.
