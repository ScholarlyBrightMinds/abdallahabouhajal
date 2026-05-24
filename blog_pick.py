#!/usr/bin/env python3
"""Read an `issues` event and decide what blog-draft.yml should do.

Emits to GITHUB_OUTPUT:
  mode    - "draft" | "refresh" | "none"
  source  - "menu" | "issue"   (when mode=draft)
  title, tag, angle            (when mode=draft)
  issue   - the issue number

Triggers handled:
  - a "blog-idea" issue opened  -> draft that title (your own idea)
  - a "blog-menu" title box ticked -> draft that title (menu pick)
  - the "fresh set" box ticked  -> refresh the menu
Stdlib only, no deps.
"""
import json
import os
import re
import sys

ev = json.load(open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8"))
action = ev.get("action", "")
issue = ev.get("issue", {}) or {}
labels = {l.get("name", "") for l in issue.get("labels", [])}
body = issue.get("body") or ""
title = issue.get("title") or ""
sender = (ev.get("sender") or {}).get("login", "")
number = issue.get("number", "")

out = {"mode": "none", "issue": str(number)}


def emit(d):
    gh = os.environ.get("GITHUB_OUTPUT")
    if gh:
        with open(gh, "a", encoding="utf-8") as f:
            for k, v in d.items():
                f.write(f"{k}={str(v).replace(chr(10), ' ').strip()}\n")
    print(json.dumps(d))
    sys.exit(0)


# Never act on the bot's own activity, to avoid loops.
if sender.endswith("[bot]"):
    emit(out)

if action == "opened" and "blog-idea" in labels:
    t = re.sub(r"^\[Blog idea\]\s*", "", title).strip()
    if t:
        out.update(mode="draft", source="issue", title=t, tag="", angle=body.strip())
    emit(out)

if action == "edited" and "blog-menu" in labels:
    # "fresh set" box ticked?
    for line in body.splitlines():
        if re.match(r"^\s*-\s*\[x\]", line, re.I) and "fresh set" in line.lower():
            out.update(mode="refresh")
            emit(out)
    # a title box ticked?
    picked = None
    for line in body.splitlines():
        m = re.match(r"^\s*-\s*\[x\]\s*\*\*(.+?)\*\*", line, re.I)
        if m:
            picked = m.group(1).strip()
            break
    if picked:
        tag, angle = "", ""
        meta = re.search(r"<!--\s*PICKDATA\s*(\[.*?\])\s*-->", body, re.S)
        if meta:
            for item in json.loads(meta.group(1)):
                if item.get("title", "").strip().lower() == picked.lower():
                    tag, angle = item.get("tag", ""), item.get("angle", "")
                    break
        out.update(mode="draft", source="menu", title=picked, tag=tag, angle=angle)
    emit(out)

emit(out)
