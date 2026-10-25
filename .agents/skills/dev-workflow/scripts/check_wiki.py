#!/usr/bin/env python3
"""Kiểm wiki: đủ 9 file, có synced_commit, đường dẫn trong `...` tồn tại, mermaid không rỗng.

Dùng:  python scripts/check_wiki.py <wiki-dir> [--root .]
Thoát 0 nếu sạch, 1 nếu có lỗi.
"""
import argparse
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

REQUIRED = ["README.md", "00-overview.md", "01-architecture.md", "02-database.md",
            "03-api.md", "04-flows.md", "05-modules.md", "06-conventions.md", "07-changelog.md"]
MERMAID_START = ("graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram",
                 "erDiagram", "gantt", "pie", "journey", "gitGraph", "mindmap", "timeline",
                 "C4Context", "quadrantChart", "requirementDiagram")
EXT = re.compile(r"\.[A-Za-z0-9]{1,8}$")
SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".next", "dist", "build", "venv", ".venv"}
NOT_FILES = {"node.js", "next.js", "vue.js", "nuxt.js", "express.js", "three.js", "d3.js",
             "react.js", "nest.js", "alpine.js", "chart.js", "p5.js", "e.g.", "i.e."}
SKIP_CHARS = set("*<>[]{}$|=,;()!?")
MAX_REPORT = 30


def looks_like_path(token):
    if token.startswith(("http://", "https://", "/api", "-", "~")) or " " in token:
        return False
    if any(c in token for c in SKIP_CHARS):
        return False
    return "/" in token or bool(EXT.search(token))


def clean(token):
    token = re.sub(r":\d+(-\d+)?$", "", token)  # bỏ :dòng
    return token[2:] if token.startswith("./") else token


def basenames(root):
    import os
    names = set()
    for _, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        names.update(files)
    return names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wiki_dir")
    ap.add_argument("--root", default=".")
    a = ap.parse_args()
    wiki, root = Path(a.wiki_dir), Path(a.root)
    errors = []

    if not wiki.is_dir():
        sys.exit(f"Không thấy thư mục wiki: {wiki}")

    for name in REQUIRED:
        if not (wiki / name).exists():
            errors.append(f"THIẾU FILE: {name}")

    readme = wiki / "README.md"
    if readme.exists() and "synced_commit" not in readme.read_text(encoding="utf-8"):
        errors.append("README.md thiếu 'synced_commit'")

    missing = {}
    names = None
    for md in sorted(wiki.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        # mermaid
        for m in re.finditer(r"```mermaid\n(.*?)```", text, re.S):
            body = m.group(1).strip()
            if not body or not body.startswith(MERMAID_START):
                errors.append(f"{md.name}: khối mermaid rỗng hoặc sai từ khóa đầu")
        # đường dẫn (bỏ qua khối code để tránh lệnh shell)
        prose = re.sub(r"```.*?```", "", text, flags=re.S)
        for token in re.findall(r"`([^`\n]+)`", prose):
            if not looks_like_path(token):
                continue
            path = clean(token)
            if path.lower() in NOT_FILES:
                continue
            if (root / path).exists() or (wiki / path).exists():
                continue
            if "/" not in path:  # tên file trơn: tìm ở bất kỳ đâu trong repo
                names = names if names is not None else basenames(root)
                if path in names:
                    continue
            missing.setdefault(path, set()).add(md.name)

    for path, where in sorted(missing.items())[:MAX_REPORT]:
        errors.append(f"ĐƯỜNG DẪN KHÔNG TỒN TẠI: {path} (trong {', '.join(sorted(where))})")
    if len(missing) > MAX_REPORT:
        errors.append(f"... và {len(missing) - MAX_REPORT} đường dẫn khác")

    if errors:
        print(f"check_wiki: {len(errors)} vấn đề")
        print("\n".join(f"- {e}" for e in errors))
        sys.exit(1)
    print("check_wiki: sạch")


if __name__ == "__main__":
    main()
