---
name: dev-workflow
description: Bộ điều phối phát triển phần mềm end-to-end gồm các chuyên gia - wiki, brainstorm, explore, plan, code, verify (test/review/fix bug), ledger (log bug + nhớ idea). Dùng khi dev muốn khởi tạo hoặc quét dự án, tạo/đồng bộ wiki, brainstorm mở rộng idea, khám phá khả thi, lập kế hoạch, code tính năng, sửa bug, kiểm thử/rà soát lỗi (kể cả bug phát hiện qua UI), hoặc hỏi "còn idea nào chưa làm". Use whenever the user wants to build, extend, test, debug or document a software project, or continues previous work tracked in .agent/. Luôn trả lời tiếng Việt trừ khi dev yêu cầu tiếng Anh.
---

# Dev Workflow — bộ não điều phối

File này chỉ là **router + state machine**. Mọi chuyên môn nằm trong `modules/<tên>/` (mỗi module có `PLAN.md` quy trình + `RULES.md` luật riêng). Chỉ nạp module của pha đang chạy để tiết kiệm token.

## 1. Ngôn ngữ và ngân sách output

Mọi câu hỏi, tiến độ, báo cáo, artifact: **tiếng Việt**. Giữ nguyên tên file, identifier, thuật ngữ kỹ thuật. Chỉ đổi sang tiếng Anh khi dev nói rõ.

| Tình huống | Mức | Dạng |
|---|---|---|
| Tiến độ, xác nhận | Ngắn | ≤3 dòng |
| Xong một pha | Vừa | Kết luận → ≤5 gạch đầu dòng → đường dẫn artifact |
| Lỗi, rủi ro, quyết định kiến trúc, cần dev chọn, quay lui pha | Chi tiết | Lý do → phương án → khuyến nghị |

Kết luận nói trước. Trỏ đường dẫn thay vì dán lại nội dung đã có trong file. Không nhắc lại câu hỏi của dev. Không bao giờ ghi giá trị secret/`.env` ra bất cứ đâu, chỉ ghi tên biến.

## 2. Bộ nhớ làm việc (`.agent/` trong repo dự án)

| File | Vai trò | Ghi bởi |
|---|---|---|
| `CONFIG.md` | cấu hình dự án: wiki ở đâu, stack, luồng trọng tâm, thư mục bỏ qua | INIT |
| `STATE.md` | pha hiện tại, task, artifact đã có (≤10 dòng, ghi đè) | orchestrator |
| `BUGS.md` | mỗi bug một dòng, tick tại chỗ | verify, ledger |
| `IDEAS.md` | mỗi idea một dòng, có `touches`/trigger | brainstorm và mọi pha |
| `brainstorm.md` `explore.md` `tasks.md` `handoff.md` `verify-report.md` | artifact từng pha, ghi đè | module tương ứng |

Mẫu ở `templates/`. Việc xác định (id, khớp idea, nén log, kiểm wiki) giao cho `scripts/`, không tốn token suy luận. `scripts/` và `modules/` nằm trong thư mục skill: chạy script bằng đường dẫn tới skill, còn thư mục làm việc (cwd) là repo của dự án.

## 3. Khởi động (INIT)

Chưa có `.agent/` thì hỏi **một tin nhắn duy nhất**, mỗi câu có mặc định, dev trả lời "ok" là chạy:

```text
Trước khi bắt đầu, mình cần chốt (trả lời "ok" để dùng mặc định):
1. Wiki lưu ở đâu? (mặc định: ./docs/wiki)
2. Công nghệ chính? (mặc định: tự phát hiện từ package.json/requirements/go.mod...)
3. Luồng nghiệp vụ quan trọng nhất cần mô tả? (mặc định: tự suy ra từ entrypoint/router)
4. Thư mục cần bỏ qua? (mặc định: node_modules .git __pycache__ .next dist build venv .venv)
```

Sau đó: tạo `.agent/` từ `templates/`, ghi `CONFIG.md`, đặt `STATE.md`. Đã có `.agent/` thì **đọc `STATE.md` và tiếp tục**, không hỏi lại.

## 4. Chọn cấp độ công việc (nêu 1 dòng, dev có thể đổi)

| Cấp | Khi nào | Chuỗi pha |
|---|---|---|
| **S** | bug, chỉnh nhỏ ≤3 file, yêu cầu rõ | mini-plan 3 dòng → CODE → VERIFY → SYNC-lite |
| **M** | tính năng vừa, yêu cầu rõ nhưng chưa biết chạm đâu | EXPLORE → PLAN → CODE → VERIFY → SYNC |
| **L** | dự án mới, tính năng lớn, idea mơ hồ | WIKI* → BRAINSTORM → EXPLORE → PLAN → CODE → VERIFY → SYNC |

\*WIKI chạy một lần khi chưa có wiki (cấp M/L): đề xuất tạo, mặc định đồng ý, vì mọi module sau đọc wiki thay vì quét lại code.

## 5. Bảng pha, đầu vào và cổng ra

| Pha | Module | Input bắt buộc | Artifact | Exit gate |
|---|---|---|---|---|
| WIKI | `wiki` | CONFIG | wiki suite | `scripts/check_wiki.py` sạch |
| BRAINSTORM | `brainstorm` | idea dev + wiki | `brainstorm.md` | dev duyệt ≥1 idea |
| EXPLORE | `explore` | idea đã duyệt | `explore.md` | mọi giả định đã xác minh, hoặc dev chấp nhận rủi ro |
| PLAN | `plan` | `explore.md` | `tasks.md` | mỗi task đo được; dev duyệt (M/L) |
| CODE | `code` | `tasks.md` | diff + `handoff.md` | build + test liên quan ✓ |
| VERIFY | `verify` | diff + handoff | `verify-report.md` | không bug mở mức H; "Chưa kiểm chứng" đã báo dev |
| SYNC | `wiki` + `ledger` | diff đã verify | wiki + ledger cập nhật | changelog đã ghi |

**Luật chuyển pha**
1. Đầu mỗi pha: đọc `STATE.md`, nạp `modules/<pha>/PLAN.md` + `RULES.md`, không nạp module khác.
2. Không vào pha khi artifact đầu vào còn thiếu. Không rời pha khi exit gate chưa đạt.
3. Cổng đạt thì **tự chuyển pha**, cập nhật `STATE.md`, không xin phép.
4. Chỉ dừng hỏi dev ở: duyệt idea, duyệt plan (M/L), ngã rẽ kiến trúc, bug fix thất bại 3 vòng, mục "Chưa kiểm chứng". Sau khi dev duyệt plan, vòng CODE ↔ VERIFY chạy liên tục hết task list.

**Quay lui** (ghi lý do + bằng chứng vào `STATE.md`):
EXPLORE thấy idea bất khả thi → BRAINSTORM · CODE thấy giả định sai → EXPLORE · task mơ hồ → PLAN · VERIFY FAIL → CODE · lỗi thiết kế → EXPLORE.

## 6. Hook xuyên pha (chống bỏ sót idea)

| Thời điểm | Hành động |
|---|---|
| Đầu PLAN và đầu mỗi task CODE | `python scripts/ledger.py recall <file sắp chạm>` → nhắc tối đa 3 idea + bug mở khớp |
| Bất kỳ lúc nào nảy ra idea | `ledger.py add-idea ...` (1 dòng), làm tiếp, không bẻ luồng |
| Dev báo bug (kể cả giữa pha khác) | chạy VERIFY chế độ FIX, xong trả về pha cũ |
| SYNC | `ledger.py sweep` → hỏi dev idea quá hạn: làm / hoãn / bỏ; `ledger.py compact` |

## 7. SYNC (cuối mỗi chu kỳ)

1. `modules/wiki` chế độ Sync: chỉ cập nhật mục bị ảnh hưởng theo `git diff <synced_commit>..HEAD`.
2. Ledger sweep + compact (mục 6).
3. Thêm đúng **một dòng** vào `07-changelog.md` cho cả phiên.
4. `STATE.md` → `IDLE`.

## 8. Báo cáo cuối chu kỳ (tối đa 8 dòng)

```text
Xong: [tính năng/bug] — cấp [S/M/L]
Đã kiểm chứng: [L1..L4]   Chưa kiểm chứng: [mục + việc dev cần làm]
Bug: mở [n] · đã sửa [n]   Idea chờ: [n] (khớp tiếp theo: [I-id])
Wiki: [file đã cập nhật]   Chi tiết: .agent/verify-report.md
```

Dùng wiki cho skill khác: thêm vào prompt "đọc `<wiki>/README.md`, chỉ đọc phần liên quan; sau khi xong cập nhật wiki và `07-changelog.md`."
