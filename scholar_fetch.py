#!/usr/bin/env python3
"""scholar_fetch.py · read his Google Scholar profile, from his own machine.

Scholar has no API and blocks datacentre traffic, which is why the weekly
GitHub Action cannot do this and why the site's numbers came from OpenAlex
alone. From his own network one request a week is ordinary traffic and comes
back fine, so this runs on the Mac, writes `data/scholar/scholar.json`, folds
the numbers into the baked data through scholar_merge, and rebuilds the pages.

It refuses to write anything it cannot trust: a page that is a captcha, a
profile whose name is not his, a citation count that fell, or a parse that
found no articles. When it refuses, last week's numbers stay up.

    python3 scholar_fetch.py              read, merge, rebuild
    python3 scholar_fetch.py --dry-run    read and print, write nothing
    python3 scholar_fetch.py --from FILE  parse a saved page, for testing
"""

from __future__ import annotations

import html
import json
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import scholar_merge

REPO = Path(__file__).resolve().parent
OUT = REPO / "data" / "scholar" / "scholar.json"
AUTHOR = "1I8SvsQAAAAJ"
EXPECT_NAME = "abdallah"          # the profile has to be his
URL = ("https://scholar.google.com/citations?user={id}&hl=en&cstart=0&pagesize=100")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
DROP_GUARD = 0.9                  # a fall below this fraction is treated as a bad read


def fetch(author: str) -> str:
    req = urllib.request.Request(URL.format(id=author), headers={
        "User-Agent": UA,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml",
    })
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "replace")


def parse(page: str) -> dict:
    if re.search(r"unusual traffic|not a robot|/sorry/index", page, re.I):
        raise ValueError("Scholar returned a captcha page, not the profile")
    name = re.search(r'id="gsc_prf_in">([^<]+)', page)
    if not name:
        raise ValueError("no profile name on the page, so the parse cannot be trusted")
    name = html.unescape(name.group(1)).strip()

    # the summary table reads: citations all / since, h index all / since, i10 all / since
    nums = [int(n) for n in re.findall(r'class="gsc_rsb_std">(\d+)</td>', page)]
    if len(nums) < 6:
        raise ValueError(f"the summary table had {len(nums)} numbers, expected six")

    articles = []
    for block in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        title = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', block, re.S)
        cited = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(\d*)</a>', block)
        year = re.search(r'class="gsc_a_h[^"]*">(\d{4})</span>', block)
        if not title:
            continue
        articles.append({
            "title": html.unescape(re.sub(r"<[^>]+>", "", title.group(1))).strip(),
            "cited_by": int(cited.group(1)) if cited and cited.group(1) else 0,
            "year": year.group(1) if year else "",
        })
    if not articles:
        raise ValueError("no article rows found, so the parse cannot be trusted")

    return {
        "name": name,
        "author_id": AUTHOR,
        "citations": nums[0],
        "h_index": nums[2],
        "i10_index": nums[4],
        "articles": articles,
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "https://scholar.google.com/citations?user=" + AUTHOR,
    }


def main() -> int:
    args = sys.argv[1:]
    dry = "--dry-run" in args
    saved = None
    if "--from" in args:
        saved = Path(args[args.index("--from") + 1])

    try:
        page = saved.read_text(encoding="utf-8", errors="replace") if saved else fetch(AUTHOR)
        data = parse(page)
    except Exception as e:
        print(f"[FAIL] {e}")
        print("       nothing written, the numbers already on the site stay up")
        return 1

    if EXPECT_NAME not in data["name"].lower():
        print(f"[FAIL] the profile is called {data['name']!r}, which is not his")
        return 1

    before = None
    if OUT.exists():
        try:
            before = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            before = None
    if before and data["citations"] < int(before.get("citations") or 0) * DROP_GUARD:
        print(f"[FAIL] Scholar now says {data['citations']} citations against "
              f"{before['citations']} last time, which looks like a bad read")
        return 1

    print(f"[OK] {data['name']}: {data['citations']} citations, h {data['h_index']}, "
          f"i10 {data['i10_index']}, {len(data['articles'])} articles"
          + (f" (was {before['citations']})" if before else ""))
    if dry:
        for a in data["articles"][:5]:
            print(f"     {a['cited_by']:>4}  {a['year']}  {a['title'][:64]}")
        print("     dry run, nothing written")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    scholar_merge.apply(REPO)

    for builder in ("build_html.py",):
        r = subprocess.run([sys.executable, str(REPO / builder)], cwd=REPO,
                           capture_output=True, text=True)
        for line in (r.stdout or "").strip().splitlines():
            print("     " + line)
        if r.returncode:
            print(f"[FAIL] {builder}: {(r.stderr or '').strip()[:200]}")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
