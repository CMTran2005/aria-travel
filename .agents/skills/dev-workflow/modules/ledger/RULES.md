# LEDGER — RULES

## Định dạng bắt buộc
```markdown
# BUGS.md
- [ ] B012 | UI | Nút Lưu /settings không phản hồi | file: ui/Settings.tsx | repro: đổi tên → Lưu | sev: H
- [x] B011 | UI | Modal không đóng | file: ui/Modal.tsx | fix: ui/Modal.tsx:48 | verified: UI | escaped: unit
# IDEAS.md
- [ ] I007 | touches: auth/**, api/login | trigger: chạm auth | giá trị: cao | Thêm rate limit login | nguồn: brainstorm 2026-10-25
```

## CẤM
- Thêm dòng thứ hai cho một bug/idea đã có: chỉ sửa dòng cũ.
- Dòng bug >160 ký tự, dòng idea >200 ký tự: rút gọn, chi tiết đặt trong file artifact và trỏ đường dẫn.
- Đoạn văn, log dài, stack trace trong BUGS/IDEAS (stack trace → file riêng, trỏ đường dẫn).
- Tự tạo id: luôn dùng `ledger.py` để id không trùng.
- Xóa mục chưa `[x]`/`[-]`. Bỏ phải có lý do một cụm từ.
- Ghi secret hoặc dữ liệu cá nhân.

## Chất lượng
- Bug UI mà test code đã pass: ghi `escaped:` đúng loại test đã để lọt (unit/integration/none) — đây là dữ liệu để biết thiếu loại test nào.
- Idea phải có `touches` (glob) hoặc `trigger` (điều kiện bằng lời); không có cả hai thì idea không thể nhắc lại → không ghi.
- Recall tối đa 3 mục/lần, ưu tiên giá trị cao rồi cũ nhất.

## Giới hạn output
Báo ledger bằng 1 dòng: "Ghi B013 (H, UI). Idea chờ: 4." Không liệt kê lại toàn bộ file.
