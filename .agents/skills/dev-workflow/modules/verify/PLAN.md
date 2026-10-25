# VERIFY — PLAN (chuyên gia kiểm thử · rà soát · sửa lỗi)

Vai trò: một module, ba chế độ nối tiếp: **TEST → REVIEW → FIX**. Mục tiêu không phải "test xanh" mà là "chạy đúng trong tay người dùng".

## Vị trí trong chuỗi
CODE → **VERIFY** → SYNC. Fail → quay CODE (bug) hoặc EXPLORE/PLAN (lỗi thiết kế).
Cũng được gọi độc lập khi dev báo bug từ UI.

## Chế độ 1 — TEST (4 tầng, chạy từ rẻ đến đắt)
| Tầng | Nội dung | Công cụ |
|---|---|---|
| L1 Tĩnh | lint, type, build | lệnh sẵn có của dự án |
| L2 Code | unit + integration liên quan diff | test runner của dự án |
| L3 Luồng | checklist sinh từ `04-flows.md` cho luồng bị diff chạm | Playwright/browser tool nếu có; không có → checklist cụ thể giao dev |
| L4 Biên | rỗng, lỗi mạng, quyền, dữ liệu lớn, double-click, refresh giữa chừng | như L3 |
Nguồn kiểm: `handoff.md` ("Cần VERIFY kiểm tay/UI") + `BUGS.md` bug mở liên quan.

## Chế độ 2 — REVIEW (đọc diff, không chạy)
Rà theo rubric: đúng yêu cầu · bảo mật · xử lý lỗi · edge case · hồi quy file lân cận · đúng convention · test có thật sự kiểm hành vi (không chỉ gọi hàm).

## Chế độ 3 — FIX (vòng sửa có kỷ luật)
1. Ghi bug: `ledger.py add-bug` (1 dòng `[ ]` trong `BUGS.md`).
2. Tái hiện (hoặc ghi rõ không tái hiện được).
3. Tìm **nguyên nhân gốc** (nêu bằng chứng `file:dòng`), không vá triệu chứng.
4. Sửa tối thiểu.
5. Tạo regression check (test hoặc bước UI cố định), chạy lại L1–L3 liên quan.
6. `ledger.py fix <id> ...` để tick **chính dòng đó** thành `[x]`. Không thêm dòng mới.
Tối đa 3 vòng/bug → vượt: dừng, báo dev, đề xuất quay EXPLORE/PLAN.

## Báo cáo (`.agent/verify-report.md`, ghi đè)
```markdown
**Kết luận:** PASS / PASS CÓ ĐIỀU KIỆN / FAIL
**Đã kiểm chứng:** L1 ✓ · L2 12/12 ✓ · L3 luồng đăng nhập ✓
**Chưa kiểm chứng:** [mục] — lý do — dev cần làm: [bước]
**Bug:** mở B012 · đã tick B011
```
Cổng ra: không có bug mở mức cao + mục "Chưa kiểm chứng" đã được dev biết → `STATE.md` = SYNC.
