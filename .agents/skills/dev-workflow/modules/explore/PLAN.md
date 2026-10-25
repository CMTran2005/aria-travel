# EXPLORE — PLAN (chuyên gia khám phá và xác minh)

Vai trò: điều tra viên. Biến idea đã duyệt thành **sự thật có bằng chứng** về khả thi, phạm vi, rủi ro; đồng thời nhìn rộng sang những gì liền kề.

## Vị trí trong chuỗi
BRAINSTORM → **EXPLORE** → PLAN. Với cấp M, vào thẳng từ yêu cầu dev (bỏ BRAINSTORM).
Quay lui: idea bất khả thi hoặc đổi bản chất → BRAINSTORM.

## Các bước
1. **Liệt kê giả định** của idea ("API X hỗ trợ phân trang", "bảng Y có cột Z", "thư viện hỗ trợ ..."). Mỗi giả định một dòng.
2. **Xác minh từng giả định** bằng lệnh/đọc code có đích (`rg`, đọc file, chạy lệnh chỉ-đọc, đọc docs). Kết luận: ✓ đúng / ✗ sai / ? chưa rõ + bằng chứng `file:dòng`.
3. **Khoanh phạm vi**: file/module bị chạm, hợp đồng API/DB bị đổi, test hiện có, luồng trong `04-flows.md` bị ảnh hưởng.
4. **Khám phá rộng** (giới hạn ≤10 phút đọc):
   - Code/thư viện sẵn có có thể **tái dùng**?
   - Dự án đã giải bài toán tương tự ở đâu (pattern để bắt chước)?
   - Ràng buộc ẩn: quyền, hiệu năng, migration, tương thích ngược.
   - ≤3 idea liền kề phát hiện được → `IDEAS.md`.
5. **Đề xuất phương án** (≤3), mỗi phương án: cách làm, chi phí, rủi ro; chọn một và nêu lý do.
6. Ghi `.agent/explore.md`.

## Mẫu `.agent/explore.md`
```markdown
**Mục tiêu:** ...
| # | Giả định | KQ | Bằng chứng |
|---|----------|----|------------|
| 1 | ... | ✓ | `api/list.py:42` |
**Phạm vi:** file ... · hợp đồng đổi ... · luồng ảnh hưởng ...
**Tái dùng:** ...  **Rủi ro:** ...
**Phương án:** A (khuyến nghị) / B / C — lý do
**Chưa rõ (cần dev):** ...
```

## Exit gate
Mọi giả định ✓/✗ có bằng chứng, hoặc mục "?" đã được dev chấp nhận rủi ro; đã chọn phương án. → `STATE.md` = PLAN.
