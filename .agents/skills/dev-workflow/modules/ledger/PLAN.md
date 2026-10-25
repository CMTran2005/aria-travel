# LEDGER — PLAN (chuyên gia log bug + nhớ idea)

Vai trò: thủ thư của dự án. Giữ `BUGS.md` và `IDEAS.md` **ngắn, đúng, tự cập nhật**, và làm idea không bị bỏ sót.

## Nguyên tắc
- 1 bug = 1 dòng, 1 idea = 1 dòng. Cập nhật **tại chỗ**, không thêm dòng mới cho mục cũ.
- Việc cơ học (cấp id, khớp idea, nén log) giao `scripts/ledger.py`, không tự làm bằng suy luận.

## Lệnh (`python scripts/ledger.py --root .agent <lệnh>`)
| Lệnh | Dùng khi |
|---|---|
| `add-idea "tiêu đề" --touches "auth/**,api/login" --trigger "chạm auth" --value cao --source "brainstorm"` | nảy ra idea ở bất kỳ pha nào |
| `add-bug "tiêu đề" --kind UI --file ui/Settings.tsx --repro "đổi tên → Lưu" --sev H` | dev báo bug / VERIFY phát hiện |
| `recall <file...>` | đầu PLAN, đầu mỗi task CODE: ra tối đa 3 idea + bug mở khớp file |
| `sweep --days 14` | SYNC: liệt kê idea mở quá hạn để hỏi dev |
| `fix B012 --fix "ui/Modal.tsx:48" --verified UI --escaped unit` | VERIFY sửa xong: tick `[x]` tại chỗ |
| `set I007 hoan\|bo\|xong` | dev quyết định idea: `[~]` hoãn · `[-]` bỏ · `[x]` đã làm |
| `compact` | SYNC: >30 bug `[x]` → nén vào `BUGS.archive.md` |

## Ba điểm kích hoạt (chống bỏ sót)
1. **Capture**: ghi ngay 1 dòng rồi làm tiếp; không giải thích dài.
2. **Recall**: tại PLAN và đầu task CODE, nhắc idea có `touches` khớp file sắp chạm. Mỗi idea nhắc kèm một câu hỏi: *làm kèm / hoãn / bỏ?* và cập nhật theo câu trả lời.
3. **Sweep**: cuối chu kỳ, idea mở quá `--days` hoặc có `trigger` đã xảy ra → hỏi dev.

## Trạng thái
`[ ]` mở · `[x]` xong · `[~]` hoãn (giữ trigger) · `[-]` bỏ (kèm lý do ngắn).
