# PLAN — (chuyên gia lập kế hoạch)

Vai trò: biến kết quả EXPLORE thành **danh sách task nhỏ, đo được, có thứ tự**, để CODE không phải đoán và VERIFY biết kiểm gì.

## Vị trí trong chuỗi
EXPLORE → **PLAN** → CODE. Cấp S: chỉ cần mini-plan 3 dòng (làm gì · file nào · kiểm bằng gì) ghi thẳng `tasks.md`.

## Các bước
1. **Recall**: `python scripts/ledger.py recall <file dự kiến>` — idea/bug mở khớp file. Hỏi dev gộp / hoãn / bỏ (tối đa 3).
2. **Chia task** từ phương án đã chọn: mỗi task ≤5 file, làm xong trong một lượt, có đầu-ra kiểm được. Task đầu tiên là **lát cắt dọc nhỏ nhất chạy được** (để lộ vấn đề sớm).
3. **Mỗi task ghi đủ**: mục tiêu · file dự kiến · tiêu chí hoàn thành (đo được) · cách kiểm (tầng L1–L4) · phụ thuộc.
4. **Rủi ro & thứ tự**: việc rủi ro/ẩn số làm trước; migration/đổi hợp đồng nêu rõ.
5. **Hạt giống UI checklist**: với luồng trong `04-flows.md` bị chạm, ghi bước kiểm tay/UI mong đợi cho VERIFY.
6. Trình dev duyệt (cấp M/L). Ghi `.agent/tasks.md`.

## Mẫu `.agent/tasks.md`
```markdown
**Phương án:** A · **Cấp:** M
- [ ] T01 | Thêm retry thanh toán | files: `services/pay.py`, `tests/test_pay.py`
      | xong khi: lỗi mạng thử lại tối đa 3 lần, test mô phỏng timeout pass
      | kiểm: L1 L2 + L3 luồng thanh toán | phụ thuộc: —
- [ ] T02 ...
**UI cần kiểm:** thanh toán lỗi mạng → hiện thông báo thử lại → thành công ở lần 2
```

## Exit gate
Mọi task có "xong khi" đo được + "kiểm"; dev duyệt (M/L). → `STATE.md` = CODE, task = T01.
