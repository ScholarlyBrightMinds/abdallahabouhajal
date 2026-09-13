#!/usr/bin/env python3
"""Bake the JavaScript rendered parts of about.html and research.html into the
static HTML.

Everything on these two pages that a reader sees comes from `theme.config.js`
through the `[data-bind]` renderers in `scripts.js`. That is fine for a browser
and thin for a crawler: research.html carried 74 words of static text and none
of the paper titles. This writes the same markup those renderers produce into
the files, so the pages read without JavaScript. scripts.js still renders over
them on load with identical markup, so nothing changes for a browser.

The renderers this mirrors are `bindWork`, `bindAbout` and `bindBlog` in
scripts.js. If you change one of them, change it here too and re-run, then
compare with `--check`, which prints any block whose baked markup no longer
matches what the renderer would produce for the current config.

Run: python3 build_static_html.py [--check]
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent
CONFIG = REPO / "theme.config.js"

# node is only used to read the config, which is a JavaScript object literal
NODE_SHIM = """
global.window = {};
global.document = { documentElement: { style: { setProperty() {} } } };
require(process.argv[1]);
process.stdout.write(JSON.stringify(global.window.SITE_CONFIG));
"""


def load_config() -> dict:
    out = subprocess.run(
        ["node", "-e", NODE_SHIM, str(CONFIG)],
        capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


# ── the renderers, mirrored from scripts.js ──────────────────────────────
def work_item(p: dict) -> str:
    kind = (p.get("statusKind") or "").lower()
    title = (f'<a href="https://doi.org/{p["doi"]}" target="_blank" rel="noopener">{p["title"]}</a>'
             if p.get("doi") else p["title"])
    year_match = re.search(r"\b(?:19|20)\d{2}\b", p.get("status") or "")
    year = year_match.group(0) if year_match else ""
    meta = ""
    if kind == "published" and p.get("venue"):
        meta = f'<p class="work-meta">{p["venue"]}{" · " + year if year else ""}</p>'
    elif kind == "review" and p.get("status"):
        meta = f'<p class="work-meta">{p["status"]}</p>'
    ask = (f'<p class="work-ask"><strong>Looking for:</strong> {p["needs"]}</p>'
           if kind not in ("published",) and p.get("needs") else "")
    return f'<li class="work-item"><h3>{title}</h3><p>{p["desc"]}</p>{meta}{ask}</li>'


def blog_card(post: dict, i: int) -> str:
    cover_key = post.get("cover") or "default"
    tag = f'<span class="blog-cover-tag">{post["tag"]}</span>' if post.get("tag") else ""
    cover = (f'<div class="blog-cover blog-cover--{cover_key}" aria-hidden="true">'
             f'<span class="blog-cover-num">{i + 1:02d}</span>{tag}</div>')
    excerpt = f'<p class="blog-excerpt">{post["excerpt"]}</p>' if post.get("excerpt") else ""
    read_time = (f'<span class="blog-readtime">{post["readingTime"]}</span>'
                 if post.get("readingTime") else "")
    return (
        f'<a href="{post["file"]}" class="blog-item reveal reveal-d{(i % 3) + 1}">'
        f'{cover}'
        f'<div class="blog-body">'
        f'<h3 class="blog-title">{post["title"]}</h3>'
        f'{excerpt}'
        f'<div class="blog-meta">'
        f'<span class="blog-date">{post["date"]}</span>'
        f'{read_time}'
        f'<span class="blog-read">Read <span class="arrow">→</span></span>'
        f'</div></div></a>'
    )


def blocks(cfg: dict) -> dict[str, dict[str, str]]:
    """page file -> {data-bind name: inner HTML}"""
    projects = cfg.get("projects") or []
    kind = lambda p: (p.get("statusKind") or "").lower()
    about = cfg.get("about") or {}
    ledes = cfg.get("ledes") or {}
    return {
        "research.html": {
            "workReview": "".join(work_item(p) for p in projects if kind(p) == "review"),
            "workDone": "".join(work_item(p) for p in projects if kind(p) == "published"),
            "workNow": "".join(work_item(p) for p in projects
                               if kind(p) not in ("review", "published")),
        },
        "about.html": {
            "aboutLede": ledes.get("about", ""),
            "aboutParagraphs": "".join(f"<p>{p}</p>" for p in about.get("paragraphs", [])),
            "awards": "".join(
                f'<li class="award-item"><p class="a-title">{a["title"]}</p>'
                f'<p class="a-venue">{a["venue"]}</p></li>'
                for a in about.get("awards", [])
            ),
            "blogLede": ledes.get("blog", ""),
            "blogList": "".join(blog_card(p, i) for i, p in enumerate(cfg.get("blog") or [])),
        },
    }


# ── putting it into the file ─────────────────────────────────────────────
def find_element(html: str, name: str) -> tuple[int, int] | None:
    """Return (start, end) of the inner HTML of the element carrying
    data-bind="name", counting nested tags of the same name."""
    m = re.search(r'<(\w+)[^>]*\bdata-bind="' + re.escape(name) + r'"[^>]*>', html)
    if not m:
        return None
    tag = m.group(1)
    inner_start = m.end()
    depth, pos = 1, inner_start
    pattern = re.compile(rf"<(/?){tag}\b", re.I)
    while depth:
        nxt = pattern.search(html, pos)
        if not nxt:
            return None
        depth += -1 if nxt.group(1) else 1
        pos = nxt.end()
        if depth == 0:
            return inner_start, nxt.start()
    return None


def main() -> int:
    check = "--check" in sys.argv
    try:
        cfg = load_config()
    except FileNotFoundError:
        print("[FAIL] node is needed to read theme.config.js")
        return 1
    except subprocess.CalledProcessError as e:
        print(f"[FAIL] theme.config.js did not evaluate: {e.stderr.strip()[:200]}")
        return 1

    rc, changed = 0, 0
    for page, wanted in blocks(cfg).items():
        path = REPO / page
        html = path.read_text(encoding="utf-8")
        orig = html
        counts = []
        for name, inner in wanted.items():
            span = find_element(html, name)
            if not span:
                print(f"[FAIL] {page}: no element with data-bind=\"{name}\"")
                rc = 1
                continue
            start, end = span
            if html[start:end] == inner:
                counts.append(f"{name} ok")
                continue
            if check:
                print(f"[FAIL] {page}: {name} is stale, re-run without --check")
                rc = 1
                continue
            html = html[:start] + inner + html[end:]
            counts.append(f"{name} written")
        if html != orig:
            path.write_text(html, encoding="utf-8")
            changed += 1
        words = len(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<style.*?</style>", "",
                                                   html, flags=re.S)).split())
        print(f"[OK] {page}: {', '.join(counts)} ({words} words without JavaScript)")
    if not check and not changed:
        print("[OK] nothing to write, the static HTML already matches the config")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
