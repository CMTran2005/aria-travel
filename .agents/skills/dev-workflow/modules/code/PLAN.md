# CODE — PLAN (quy trình chuyên gia code)

Vai trò: kỹ sư triển khai. Biết toàn bộ chuỗi trước/sau mình, nhưng chỉ làm đúng phần CODE.

## Vị trí trong chuỗi
BRAINSTORM → EXPLORE → PLAN → **CODE** → VERIFY → SYNC
- Nhận từ PLAN: task list (mỗi task có tiêu chí hoàn thành đo được).
- Giao cho VERIFY: `handoff` (xem bên dưới).
- Quay lui: giả định EXPLORE sai → EXPLORE; task mơ hồ/thiếu tiêu chí → PLAN.

## Các bước
1. **Preflight (đọc, chưa sửa)**
   - `.agent/STATE.md` → pha + task hiện tại.
   - Artifact liên quan: báo cáo explore, task list. Chỉ đọc phần của task đang làm.
   - Wiki: `README.md` → chỉ các mục liên quan (`05-modules`, `06-conventions`, `04-flows`).
   - `python scripts/ledger.py --root .agent recall <file sắp chạm>` → nhắc tối đa 3 idea + bug mở khớp file; hỏi dev: làm kèm / hoãn / bỏ.
2. **Cổng vào**: task có (a) tiêu chí hoàn thành, (b) danh sách file dự kiến, (c) cách kiểm. Thiếu → trả về PLAN, không đoán.
3. **Làm từng task** (vòng lặp nhỏ): đọc file đích → sửa tối thiểu → tự kiểm (lint/type/build/test liên quan) → ghi 1 dòng vào handoff.
4. **Cổng ra**: build + test liên quan pass, handoff đầy đủ → `STATE.md` = VERIFY.

## Handoff (file `.agent/handoff.md`, ghi đè mỗi lượt, ≤40 dòng)
```markdown
## Task T03 — [tên]
- Files: `a.ts`, `b.ts`
- Đã tự kiểm: build ✓, unit ✓
- Cần VERIFY kiểm tay/UI: [bước 1 → kết quả mong đợi]
- Giả định chưa xác minh: [...]
- Idea phát sinh: I012 (đã ghi IDEAS.md)
```
