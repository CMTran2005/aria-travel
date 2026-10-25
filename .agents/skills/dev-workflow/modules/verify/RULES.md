# VERIFY — RULES (luật riêng của module)

## Nguyên tắc cốt lõi
1. **Pass ≠ xong.** Luôn báo hai mục: *Đã kiểm chứng* / *Chưa kiểm chứng*. Cấm tuyên bố "hoạt động tốt" nếu L3 chưa chạy.
2. **Mọi kết luận có bằng chứng**: lệnh đã chạy + kết quả, hoặc `file:dòng`.
3. **Bug dev báo từ UI luôn đúng cho tới khi chứng minh khác.** Không bác bỏ chỉ vì test xanh.

## ĐƯỢC làm
- Chạy lệnh test/lint/build/browser tool.
- Viết thêm test/regression check.
- Sửa lỗi trong phạm vi bug đã ghi.

## CẤM
- Sửa test cho khớp code sai; skip/xóa test để xanh; nới assertion.
- Fix khi chưa có nguyên nhân gốc (đoán mò, thử-sai nhiều lần).
- Fix kéo theo thay đổi >3 file hoặc đổi hợp đồng API/DB → dừng, về PLAN.
- Thêm tính năng/refactor "tiện thể".
- Ghi dòng mới cho bug cũ; ghi log dài dòng (xem định dạng).
- Che "Chưa kiểm chứng" để báo cáo trông đẹp.

## Ghi bug: luôn qua `scripts/ledger.py` (1 bug = 1 dòng, tick tại chỗ)
```
python scripts/ledger.py --root .agent add-bug "Nút Lưu không phản hồi" --kind UI --file ui/Settings.tsx --repro "đổi tên → Lưu" --sev H
python scripts/ledger.py --root .agent fix B012 --fix ui/Settings.tsx:48 --verified UI --escaped unit
```
Kết quả trong `BUGS.md`:
```markdown
- [ ] B012 | UI | Nút Lưu không phản hồi | file: ui/Settings.tsx | repro: đổi tên → Lưu | sev: H
- [x] B011 | UI | Modal không đóng | file: ui/Modal.tsx | fix: ui/Modal.tsx:48 | verified: UI | escaped: unit
```
- Không tự sửa id, không thêm dòng mới cho bug cũ, không viết đoạn dài (stack trace → file riêng, trỏ đường dẫn).
- `escaped:` = loại test đã để lọt (unit/integration/none) → biết dự án thiếu loại test nào.
- SYNC chạy `ledger.py compact` (>30 bug đã sửa thì nén vào `BUGS.archive.md`).
- Mỗi bug UI phải có regression check, hoặc ghi lý do không thể.

## Mức độ nghiêm trọng
H: mất dữ liệu/bảo mật/luồng chính hỏng → chặn cổng ra. M: luồng phụ hỏng → báo dev quyết. L: thẩm mỹ → để `[ ]`, không chặn.

## Quay lui
| Phát hiện | Về |
|---|---|
| Bug cài đặt | CODE (hoặc tự FIX nếu nhỏ) |
| Yêu cầu mơ hồ / task thiếu | PLAN |
| Giả định/thiết kế sai | EXPLORE |

## Giới hạn output (tiếng Việt)
- Đang chạy: ≤3 dòng/bước. Báo cáo cuối: theo mẫu 4 dòng ở PLAN.
- Chi tiết đầy đủ chỉ cho: FAIL, bug mức H, quyết định cần dev chọn.
- Không dán log test dài; trích tối đa 10 dòng lỗi đầu + đường dẫn file log.
