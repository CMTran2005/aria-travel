# WIKI — PLAN (chuyên gia tài liệu dự án)

Vai trò: biến codebase thành bộ wiki ngắn, đúng, truy vết được — để các module sau đọc wiki thay vì quét lại code.

## Chế độ
- **Generate**: chưa có wiki hoặc dev chọn ghi đè.
- **Sync**: wiki đã có, cập nhật theo thay đổi code (mặc định ở pha SYNC).
- **Cancel**: dev hủy.

## Generate
1. Đọc `CONFIG.md` (thư mục wiki, stack, luồng trọng tâm, thư mục bỏ qua). **Không hỏi lại** các câu đã trả lời.
2. Thư mục wiki đã có file? Hỏi một lần: `A) Regenerate (sao lưu ra <wiki>.bak trước)  B) Sync  C) Hủy`.
3. Quét theo thứ tự ưu tiên, có đích, bằng `rg` và đọc file tập trung; chỉ đọc file lớn theo đoạn:
   config (`package.json`, `requirements.txt`, `pyproject.toml`, `docker-compose.yml`, `.env.example`, `Dockerfile`) → entrypoint (`main.py`, `app.py`, `index.ts`, `server.ts`, `App.tsx`, `_layout.tsx`) → router/API → model/schema → service lõi → module của luồng trọng tâm.
   Repo lớn/monorepo: giới hạn ~40 file đọc sâu mỗi lượt; phần chưa quét ghi rõ vào `README.md` mục "Chưa quét".
4. Viết 9 file theo `SPEC.md`, mỗi file tự đứng được.
5. Ghi `synced_commit: <git rev-parse HEAD>` vào `README.md` (không có git → ghi ngày + danh sách file đã quét).
6. Chạy `python scripts/check_wiki.py <wiki-dir> --root .`, sửa tới khi sạch.
7. Ghi dòng đầu tiên vào `07-changelog.md`.

## Sync
1. Lấy thay đổi: `git diff --name-only <synced_commit>..HEAD` (không có git → dùng danh sách file từ `handoff.md`).
2. Map file đổi → mục wiki cần cập nhật bằng bảng trong `SPEC.md`.
3. Đọc **chỉ mục wiki liên quan**; sửa tại chỗ; giữ phần trong `<!-- manual -->…<!-- /manual -->`.
4. Code mâu thuẫn wiki cũ → sửa ngay, tóm tắt có tiền tố `[DRIFT FIX]`.
5. Cập nhật `synced_commit`, chạy `check_wiki.py`, ghi **một dòng** changelog cho cả phiên.

## Exit gate
`check_wiki.py` không báo lỗi · `synced_commit` mới · changelog đã ghi.
