# WIKI — RULES

## Nguyên tắc viết
- Ngắn gọn: mô tả logic, quyết định thiết kế, edge case; không chép code. Code trích tối đa 10 dòng/khối và chỉ khi cần.
- Bảng cho danh sách dài; mermaid cho kiến trúc/sequence phức tạp.
- Mỗi file tự đứng được; không giải thích điều tên đã nói rõ.
- **Mọi khẳng định về hành vi phải kèm đường dẫn file cụ thể** (`path/file.ext` hoặc `path/file.ext:dòng`).
- Điều không xác minh được từ code ghi `[chưa xác minh]`, không bịa.
- Phần dự án không có (không DB, không API...): ghi `N/A: không phát hiện <X>` + đã tìm ở đâu. Không tạo nội dung giả.
- Ngày trong changelog là ngày thật `YYYY-MM-DD`.

## CẤM
- Ghi giá trị biến môi trường, token, mật khẩu, connection string có mật khẩu: chỉ ghi **tên** biến + ý nghĩa.
- Ghi đè nội dung trong `<!-- manual -->…<!-- /manual -->`.
- Đọc cả repo hoặc đọc lại toàn bộ wiki khi Sync chỉ cần một mục.
- Đoán bảng/cột/endpoint từ tên; phải thấy trong code/migration/schema.
- Thêm nhiều dòng changelog cho một phiên.

## Chất lượng (kiểm tự động bằng `scripts/check_wiki.py`)
- Đủ 9 file; `README.md` có `synced_commit`.
- Mọi đường dẫn trong `` `...` `` phải tồn tại.
- Khối mermaid không rỗng, bắt đầu bằng từ khóa hợp lệ.

## Giới hạn output
Báo cáo hoàn tất ≤8 dòng: thư mục wiki, file đã tạo/cập nhật, mục `[chưa xác minh]`/"Chưa quét" còn lại, kết quả `check_wiki.py`.
