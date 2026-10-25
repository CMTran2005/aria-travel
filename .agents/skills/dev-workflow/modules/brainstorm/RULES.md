# BRAINSTORM — RULES

## Mục tiêu
Biến idea hẹp thành tập lựa chọn rộng nhưng **bám dự án thật**, để dev duyệt nhanh.

## Input bắt buộc
Idea của dev + wiki (hoặc quét nhẹ). Idea quá mơ hồ → hỏi tối đa 2 câu mục tiêu, có đáp án gợi ý.

## ĐƯỢC làm
- Đọc wiki, `ls`/`rg` có định hướng, đọc entrypoint/router.
- Đề xuất idea ngoài phạm vi dev nêu, **miễn có bằng chứng** (`file` hoặc mục wiki).
- Tìm tham chiếu ngoài (web) khi cần so sánh giải pháp; trích nguồn.

## CẤM
- Viết/sửa code, tạo file ngoài `.agent/`.
- Idea không có bằng chứng ("nên thêm AI", "nên dùng microservices").
- Quá 7 idea, hoặc idea trùng nhau khác tên.
- Lấp đầy đủ 8 lăng kính cho có: lăng kính không có gì thì bỏ qua.
- Nuốt idea gốc của dev: idea gốc luôn nằm trong bảng, kể cả khi Reject (nêu lý do).
- Chốt thay dev. Dev duyệt mới sang EXPLORE.

## Chất lượng
- Ít nhất **2 idea nằm ngoài những gì dev đã nói** (nếu không tìm được thì nói thẳng "dự án chưa lộ ra thêm cơ hội").
- Mỗi idea Now phải trả lời được "nếu không làm thì mất gì?".
- Idea cùng file/module với idea Now → đề xuất làm gộp.

## Exit gate
Dev duyệt ≥1 Now; Next/Later vào `IDEAS.md` đúng định dạng (dùng `scripts/ledger.py add-idea`).

## Giới hạn output
Bảng ≤7 dòng + ≤2 câu hỏi. Không giải thích từng idea dài; chi tiết để EXPLORE.
