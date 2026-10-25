# WIKI — SPEC (nội dung từng file + bảng Sync)

| File | Nội dung |
|---|---|
| `README.md` | mục lục, thứ tự đọc đề nghị, `synced_commit`, mục "Chưa quét" |
| `00-overview.md` | tên + mục đích dự án, stack phát hiện, cây thư mục 2 cấp, lệnh chạy local, biến môi trường quan trọng (chỉ tên) |
| `01-architecture.md` | sơ đồ tầng, service/module, cách giao tiếp, kiến trúc dữ liệu, dịch vụ ngoài, hạ tầng |
| `02-database.md` | bảng, cột quan trọng, quan hệ, index đáng chú ý, enum, công cụ + lệnh migration |
| `03-api.md` | base URL, xác thực, bảng endpoint, định dạng lỗi, rate limit |
| `04-flows.md` | luồng nghiệp vụ ưu tiên: các bước, file/hàm tham chiếu, sơ đồ, edge case (**VERIFY dùng file này sinh UI checklist**) |
| `05-modules.md` | module/service lõi: vị trí, trách nhiệm, interface công khai, phụ thuộc, lưu ý khi sửa |
| `06-conventions.md` | style, đặt tên, xử lý lỗi, logging, cách thêm model/endpoint/migration, quy ước test |
| `07-changelog.md` | mỗi phiên cập nhật một dòng, gồm lần tạo đầu |

## Bảng Sync: thay đổi code → mục wiki
| Thay đổi | Cập nhật |
|---|---|
| Endpoint mới / đổi request-response | `03-api.md` bảng endpoint |
| Bảng/cột mới, migration mới | `02-database.md` |
| Service/module mới | `05-modules.md` |
| Logic luồng đổi | `04-flows.md` luồng liên quan |
| Dịch vụ ngoài mới | `01-architecture.md` |
| Biến môi trường mới | `00-overview.md` (chỉ tên) |
| Pattern/quy ước mới | `06-conventions.md` |

## Định dạng changelog (1 dòng/phiên)
```markdown
| Date | Trigger | Files Updated | Sections Changed | Summary |
|------|---------|---------------|------------------|---------|
| 2026-10-25 | Initial wiki generation | all | all | Tạo wiki từ codebase hiện tại |
| 2026-10-26 | T01-T03 retry thanh toán | 03-api, 04-flows | endpoint /pay, luồng thanh toán | [DRIFT FIX] cập nhật retry |
```
