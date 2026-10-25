# BRAINSTORM — PLAN (chuyên gia mở rộng idea)

Vai trò: đối tác tư duy sản phẩm. Idea của dev thường hẹp; việc của module này là **mở rộng có căn cứ**, không phải gật đầu và cũng không phải bịa viển vông.

## Vị trí trong chuỗi
(WIKI) → **BRAINSTORM** → EXPLORE. Quay lui tới đây khi EXPLORE kết luận idea bất khả thi.

## Các bước
1. **Nắm hiện trạng** (rẻ): đọc `<wiki>/README.md` + `00-overview`, `05-modules`, `04-flows`. Chưa có wiki thì quét nhẹ entrypoint + cấu trúc 2 cấp. Không đọc sâu code ở pha này.
2. **Tóm tắt idea gốc** của dev trong ≤3 dòng, rồi nêu "ý định thật" suy ra được (vấn đề dev muốn giải, không phải giải pháp dev nghĩ).
3. **Mở rộng bằng 8 lăng kính** — duyệt lần lượt, mỗi lăng kính chỉ giữ idea nếu có bằng chứng từ code/wiki:
   người dùng cuối · vận hành/giám sát · dữ liệu · bảo mật · hiệu năng · DX/bảo trì · tích hợp · lỗi và edge case.
4. **Chấm và phân loại** tối đa 7 idea (kể cả idea gốc): Fit / Impact / Effort (T-V-C: thấp-vừa-cao) → **Now / Next / Later / Reject** kèm lý do một dòng.
5. **Trình dev** bảng ngắn, dev chỉ duyệt/sửa chứ không phải tự nghĩ. Ghi `.agent/brainstorm.md`.
6. **Lưu phần còn lại**: Next/Later → `IDEAS.md` (có `touches` + `trigger`), Reject → ghi lý do ngay trong `brainstorm.md`, không vào IDEAS.

## Mẫu `.agent/brainstorm.md`
```markdown
**Idea gốc:** ... · **Ý định thật:** ...
| ID | Idea | Lăng kính | Bằng chứng (file) | Fit | Impact | Effort | Loại |
|----|------|-----------|-------------------|-----|--------|--------|------|
| B1 | ... | dữ liệu | `services/pay.py` chưa retry | C | C | V | Now |
**Đề xuất làm trước:** B1 (+B3 vì cùng file)  ·  **Câu hỏi cho dev:** (≤2)
```

## Exit gate
Dev duyệt ≥1 idea loại Now. Idea Next/Later đã nằm trong `IDEAS.md`. → `STATE.md` = EXPLORE.
