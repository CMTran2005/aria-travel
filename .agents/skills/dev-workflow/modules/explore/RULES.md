# EXPLORE — RULES

## Mục tiêu
Loại bỏ đoán mò trước khi code: biết chắc cái gì đúng, cái gì chạm, cái gì rủi ro.

## Input bắt buộc
Idea/yêu cầu đã duyệt (hoặc yêu cầu rõ của dev ở cấp M).

## ĐƯỢC làm
- Đọc code, chạy lệnh **chỉ-đọc** (`rg`, `git log/diff`, `--help`, dry-run), đọc docs, tìm web.
- Chạy thử nghiệm trong thư mục tạm ngoài repo để kiểm chứng giả định kỹ thuật.
- Ghi `IDEAS.md` cho idea liền kề.

## CẤM
- Sửa file trong repo (chỉ được ghi `.agent/`).
- Ghi "có vẻ", "chắc là" mà không đánh dấu `?`. Giả định không xác minh được phải ghi `?` + ai/việc gì cần để xác minh.
- Đọc cả repo: đọc có đích, theo giả định đang kiểm.
- Chọn phương án rủi ro cao mà không báo dev.
- Mở rộng phạm vi yêu cầu: phát hiện thêm thì đưa vào `IDEAS.md`, không nhét vào phương án.

## Chất lượng
- Mỗi kết luận ✓/✗ phải có `file:dòng` hoặc lệnh + kết quả.
- Phạm vi nêu cả **file không được chạm** nhưng dễ bị ảnh hưởng (consumer của hàm/API đổi) — dùng `rg` tìm nơi gọi.
- Nếu ≥30% giả định ✗ → đề nghị quay BRAINSTORM.

## Exit gate
Bảng giả định đầy đủ, phương án đã chọn, danh sách file dự kiến đủ để PLAN chia task.

## Giới hạn output
Tiến độ ≤3 dòng. Báo cáo: kết luận (khả thi/không) → ≤5 gạch đầu dòng → đường dẫn `explore.md`. Chi tiết đầy đủ chỉ khi có giả định ✗, rủi ro cao, hoặc cần dev chọn phương án.
