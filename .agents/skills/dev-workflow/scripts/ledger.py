#!/usr/bin/env python3
"""Quản lý .agent/BUGS.md và .agent/IDEAS.md: mỗi mục một dòng, cập nhật tại chỗ.

Dùng:  python scripts/ledger.py --root .agent <lệnh> [...]
Lệnh:  add-bug | add-idea | fix | set | recall | sweep | compact
"""
import argparse
import datetime as dt
import fnmatch
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

ENTRY = re.compile(r"^- \[(.)\] ([BI])(\d+) \|")
DATE = re.compile(r"(\d{4}-\d{2}-\d{2})\s*$")
VALUE_RANK = {"cao": 0, "vừa": 1, "vua": 1, "thấp": 2, "thap": 2}
BUG_MAX, IDEA_MAX, KEEP_DONE, DONE_LIMIT = 160, 200, 5, 30


def read(path):
    return path.read_text(encoding="utf-8").splitlines() if path.exists() else []


def write(path, lines):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")


def clip(text, limit):
    text = " ".join(text.split())
    return text if len(text) <= limit else text[: limit - 1] + "…"


def next_id(prefix, root):
    nums = [0]
    for name in ("BUGS.md", "BUGS.archive.md", "IDEAS.md"):
        for line in read(root / name):
            m = ENTRY.match(line)
            if m and m.group(2) == prefix:
                nums.append(int(m.group(3)))
    return f"{prefix}{max(nums) + 1:03d}"


def find(lines, item_id):
    for i, line in enumerate(lines):
        m = ENTRY.match(line)
        if m and f"{m.group(2)}{m.group(3)}" == item_id:
            return i
    return -1


def file_for(item_id):
    return "BUGS.md" if item_id.startswith("B") else "IDEAS.md"


def glob_match(pattern, path):
    pattern = pattern.strip().lstrip("./")
    path = path.lstrip("./")
    if not pattern:
        return False
    regex = re.escape(pattern).replace(r"\*\*", ".*").replace(r"\*", "[^/]*")
    return bool(re.fullmatch(regex, path)) or fnmatch.fnmatch(path, pattern)


def field(line, key):
    m = re.search(rf"\b{re.escape(key)}:\s*([^|]*)", line)
    return m.group(1).strip() if m else ""


def cmd_add_bug(a, root):
    path = root / "BUGS.md"
    lines = read(path)
    bug_id = next_id("B", root)
    parts = [f"- [ ] {bug_id}", a.kind, clip(a.title, 70)]
    if a.file:
        parts.append(f"file: {a.file}")
    if a.repro:
        parts.append(f"repro: {clip(a.repro, 50)}")
    parts.append(f"sev: {a.sev}")
    line = clip(" | ".join(parts), BUG_MAX)
    lines.append(line)
    write(path, lines)
    open_n = sum(1 for l in lines if l.startswith("- [ ] B"))
    print(f"Ghi {bug_id} ({a.sev}, {a.kind}). Bug mở: {open_n}.")


def cmd_add_idea(a, root):
    if not (a.touches or a.trigger):
        sys.exit("Lỗi: idea cần --touches hoặc --trigger, nếu không sẽ không bao giờ được nhắc lại.")
    path = root / "IDEAS.md"
    lines = read(path)
    idea_id = next_id("I", root)
    parts = [f"- [ ] {idea_id}"]
    if a.touches:
        parts.append(f"touches: {a.touches}")
    if a.trigger:
        parts.append(f"trigger: {clip(a.trigger, 40)}")
    parts += [f"giá trị: {a.value}", clip(a.title, 70),
              f"nguồn: {a.source} {dt.date.today().isoformat()}"]
    lines.append(clip(" | ".join(parts), IDEA_MAX))
    write(path, lines)
    open_n = sum(1 for l in lines if l.startswith("- [ ] I"))
    print(f"Ghi {idea_id} ({a.value}). Idea chờ: {open_n}.")


def cmd_fix(a, root):
    path = root / "BUGS.md"
    lines = read(path)
    i = find(lines, a.id)
    if i < 0:
        sys.exit(f"Không thấy {a.id} trong BUGS.md")
    cols = [c.strip() for c in lines[i].split("|")]
    cols[0] = cols[0].replace("[ ]", "[x]", 1)
    cols = [c for c in cols if not c.startswith(("repro:", "sev:"))]
    cols += [f"fix: {a.fix}", f"verified: {a.verified}", f"escaped: {a.escaped}"]
    lines[i] = clip(" | ".join(cols), BUG_MAX + 20)
    write(path, lines)
    print(f"Đã tick {a.id}.")


def cmd_set(a, root):
    mark = {"hoan": "~", "bo": "-", "xong": "x"}[a.state]
    path = root / file_for(a.id)
    lines = read(path)
    i = find(lines, a.id)
    if i < 0:
        sys.exit(f"Không thấy {a.id}")
    lines[i] = re.sub(r"^- \[.\]", f"- [{mark}]", lines[i], count=1)
    if a.reason:
        lines[i] = clip(lines[i] + f" | lý do: {a.reason}", IDEA_MAX + 40)
    write(path, lines)
    print(f"{a.id} → [{mark}].")


def rank(line):
    v = field(line, "giá trị").lower()
    return VALUE_RANK.get(v, 1)


def cmd_recall(a, root):
    files = [f.replace("\\", "/") for f in a.files]
    ideas, bugs = [], []
    for line in read(root / "IDEAS.md"):
        m = ENTRY.match(line)
        if not m or m.group(1) not in (" ", "~"):
            continue
        globs = field(line, "touches").split(",")
        if any(glob_match(g, f) for g in globs for f in files):
            ideas.append(line)
    for line in read(root / "BUGS.md"):
        m = ENTRY.match(line)
        if not m or m.group(1) != " ":
            continue
        bf = field(line, "file")
        if bf and any(f == bf or f.endswith(bf) or bf.endswith(f) for f in files):
            bugs.append(line)
    ideas.sort(key=lambda l: (rank(l), ENTRY.match(l).group(3)))
    if not ideas and not bugs:
        print("Không có idea/bug mở khớp các file này.")
        return
    for line in ideas[:3]:
        print("IDEA  " + line[6:])
    for line in bugs[:3]:
        print("BUG   " + line[6:])
    extra = max(0, len(ideas) - 3) + max(0, len(bugs) - 3)
    if extra:
        print(f"(+{extra} mục khớp khác, chưa hiển thị)")


def cmd_sweep(a, root):
    today, rows, deferred = dt.date.today(), [], 0
    for line in read(root / "IDEAS.md"):
        m = ENTRY.match(line)
        if not m:
            continue
        if m.group(1) == "~":
            deferred += 1
        if m.group(1) != " ":
            continue
        d = DATE.search(line.split("| nguồn:")[-1]) if "| nguồn:" in line else None
        age = (today - dt.date.fromisoformat(d.group(1))).days if d else 999
        if age >= a.days:
            rows.append((age, line))
    if not rows:
        print(f"Không có idea mở quá {a.days} ngày. Đang hoãn: {deferred}.")
        return
    for age, line in sorted(rows, reverse=True):
        print(f"[{age if age != 999 else '?'} ngày] {line[6:]}")
    print(f"→ Hỏi dev từng mục: làm / hoãn / bỏ. Đang hoãn: {deferred}.")


def cmd_compact(a, root):
    path = root / "BUGS.md"
    lines = read(path)
    done_idx = [i for i, l in enumerate(lines)
                if (m := ENTRY.match(l)) and m.group(1) == "x" and m.group(2) == "B"]
    if len(done_idx) <= DONE_LIMIT:
        print(f"Chưa cần nén ({len(done_idx)}/{DONE_LIMIT} bug đã sửa).")
        return
    move = set(done_idx[:-KEEP_DONE])
    archive = root / "BUGS.archive.md"
    write(archive, read(archive) + [lines[i] for i in sorted(move)])
    prior = 0
    kept = []
    for i, l in enumerate(lines):
        m = re.match(r"- ✔ (\d+) bug đã sửa", l)
        if m:
            prior += int(m.group(1))
        elif i not in move:
            kept.append(l)
    summary = f"- ✔ {prior + len(move)} bug đã sửa (archive: BUGS.archive.md)"
    first = next((i for i, l in enumerate(kept) if ENTRY.match(l)), len(kept))
    kept.insert(first, summary)
    write(path, kept)
    print(f"Nén {len(move)} bug vào BUGS.archive.md. Giữ {KEEP_DONE} bug gần nhất.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--root", default=".agent")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("add-bug")
    s.add_argument("title")
    s.add_argument("--kind", default="UI", help="UI | API | DATA | LOGIC | OTHER")
    s.add_argument("--file", default="")
    s.add_argument("--repro", default="")
    s.add_argument("--sev", default="M", choices=["H", "M", "L"])
    s.set_defaults(fn=cmd_add_bug)

    s = sub.add_parser("add-idea")
    s.add_argument("title")
    s.add_argument("--touches", default="", help="glob, cách nhau dấu phẩy")
    s.add_argument("--trigger", default="")
    s.add_argument("--value", default="vừa", choices=["cao", "vừa", "thấp"])
    s.add_argument("--source", default="dev")
    s.set_defaults(fn=cmd_add_idea)

    s = sub.add_parser("fix")
    s.add_argument("id")
    s.add_argument("--fix", required=True, help="file:dòng")
    s.add_argument("--verified", default="UI", help="UI | integration | unit | manual")
    s.add_argument("--escaped", default="none", help="loại test đã để lọt: unit | integration | none")
    s.set_defaults(fn=cmd_fix)

    s = sub.add_parser("set")
    s.add_argument("id")
    s.add_argument("state", choices=["hoan", "bo", "xong"])
    s.add_argument("--reason", default="")
    s.set_defaults(fn=cmd_set)

    s = sub.add_parser("recall")
    s.add_argument("files", nargs="+")
    s.set_defaults(fn=cmd_recall)

    s = sub.add_parser("sweep")
    s.add_argument("--days", type=int, default=14)
    s.set_defaults(fn=cmd_sweep)

    s = sub.add_parser("compact")
    s.set_defaults(fn=cmd_compact)

    a = p.parse_args()
    a.fn(a, Path(a.root))


if __name__ == "__main__":
    main()
