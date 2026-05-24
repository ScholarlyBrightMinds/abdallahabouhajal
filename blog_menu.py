#!/usr/bin/env python3
"""Build the weekly "pick this week's post" issue body from the idea bank.

Prints Markdown (checkbox menu + a hidden PICKDATA JSON map) to stdout. The
blog-menu workflow pipes this into `gh issue create`. Stdlib only, no deps.
"""
import json
import os
import random
import sys

REPO = os.path.dirname(os.path.abspath(__file__))
IDEAS_PATH = os.path.join(REPO, "data", "blog", "ideas.json")
USER = os.environ.get("MENU_MENTION", "AbdallahAbouHajal")
COUNT = int(os.environ.get("MENU_COUNT", "5"))

data = json.load(open(IDEAS_PATH, encoding="utf-8"))
unused = [i for i in data["ideas"] if not i.get("used")]
random.shuffle(unused)
picks = (unused or data["ideas"])[:COUNT]

lines = [
    "Pick this week's post. **Tick one box** and I will draft it into a pull "
    "request for you to review. Nothing publishes until you merge it.",
    "",
]
for p in picks:
    lines.append(f"- [ ] **{p['title']}**")
    angle = (p.get("angle") or "").strip()
    if angle:
        lines.append(f"      {angle}")
lines += [
    "",
    "Not feeling these?",
    "- [ ] None of these. Give me a fresh set.",
    "",
    "Want your own topic instead? Open a "
    "[Blog idea issue](../../issues/new?template=blog-idea.yml) and type a title.",
    "",
    f"@{USER}",
    "",
    "<!-- PICKDATA " + json.dumps(
        [{"title": p["title"], "tag": p.get("tag", "Culture"),
          "angle": p.get("angle", "")} for p in picks]
    ) + " -->",
]
sys.stdout.write("\n".join(lines) + "\n")
