#!/usr/bin/env python3
"""scholar_merge.py · fold Google Scholar's numbers into the baked data.

Google Scholar counts citations the open indexes miss, which is why his
profile reads higher than OpenAlex, Crossref and Semantic Scholar do. Scholar
has no API and blocks anything that is not a real browser on a real network,
so `scholar_fetch.py` reads it from his own machine and leaves the result in
`data/scholar/scholar.json`. This module is what both that script and the
weekly `citations_fetcher.py` call, so whichever ran last, the site says the
same thing.

Rules, so nothing here can quietly invent a number:
  * the headline citation count and h index come from Scholar when the file is
    present and fresh, and from the open indexes otherwise
  * a paper keeps the highest count any source reports for it, Scholar
    included, matched on title
  * the paper count stays with the open indexes, because Scholar lists
    preprints and duplicates his CV does not
"""

from __future__ import annotations

import json
import re
from difflib import SequenceMatcher
from pathlib import Path

FRESH_DAYS = 45          # older than this and Scholar is ignored as stale


def norm(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (title or "").lower()).strip()


def load_scholar(repo: Path) -> dict | None:
    path = repo / "data" / "scholar" / "scholar.json"
    if not path.exists():
        return None
    try:
        d = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    if not d.get("citations") or not d.get("fetched_at"):
        return None
    return d


def age_days(stamp: str) -> float:
    from datetime import datetime, timezone
    try:
        when = datetime.strptime(stamp, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except Exception:
        return 1e6
    return (datetime.now(timezone.utc) - when).total_seconds() / 86400


def match(scholar_title: str, rows: list[dict]) -> int:
    """Index of the paper this Scholar row is, or -1. Scholar truncates long
    titles with an ellipsis, so a prefix counts as a match."""
    s = norm(scholar_title)
    if not s:
        return -1
    trimmed = scholar_title.rstrip().endswith(("…", "..."))
    best, score = -1, 0.0
    for i, r in enumerate(rows):
        t = norm(r.get("title", ""))
        if not t:
            continue
        if t == s or (trimmed and t.startswith(s[:max(20, len(s) - 2)])):
            return i
        ratio = SequenceMatcher(None, s, t).ratio()
        if ratio > score:
            best, score = i, ratio
    return best if score >= 0.9 else -1


def apply(repo: Path, quiet: bool = False) -> dict:
    """Rewrite metrics.json and serpapi.json with Scholar's numbers folded in.
    Returns a short report. Safe to call when there is no Scholar file."""
    out = {"used": False, "reason": "", "citations": None, "papers_lifted": 0}
    sch = load_scholar(repo)
    if not sch:
        out["reason"] = "no scholar.json"
        return out
    old = age_days(sch["fetched_at"])
    if old > FRESH_DAYS:
        out["reason"] = f"scholar.json is {old:.0f} days old, older than {FRESH_DAYS}"
        return out

    mpath = repo / "data" / "serpapi" / "metrics.json"
    ppath = repo / "data" / "serpapi" / "serpapi.json"
    if not mpath.exists() or not ppath.exists():
        out["reason"] = "the open index files are missing"
        return out
    metrics = json.loads(mpath.read_text(encoding="utf-8"))
    rows = json.loads(ppath.read_text(encoding="utf-8"))

    open_cites = int(metrics.get("sources", {}).get("openalex", {}).get("citations") or 0)
    if not open_cites:
        open_cites = int(metrics.get("total_citations") or 0)
    if int(sch["citations"]) < open_cites * 0.8:
        out["reason"] = (f"Scholar reports {sch['citations']}, which is below the "
                         f"{open_cites} the open indexes already show, so it is not used")
        return out

    metrics["total_citations"] = int(sch["citations"])
    if sch.get("h_index"):
        metrics["h_index"] = int(sch["h_index"])
    metrics.setdefault("sources", {})["google_scholar"] = {
        "citations": int(sch["citations"]),
        "h_index": int(sch.get("h_index") or 0),
        "i10_index": int(sch.get("i10_index") or 0),
        "articles": len(sch.get("articles") or []),
        "fetched_at": sch["fetched_at"],
    }
    metrics["source"] = "google_scholar totals, open indexes per paper"

    lifted = 0
    for art in sch.get("articles") or []:
        i = match(art.get("title", ""), rows)
        if i < 0:
            continue
        cur = int(rows[i].get("cited_by") or 0)
        if int(art.get("cited_by") or 0) > cur:
            rows[i]["cited_by"] = int(art["cited_by"])
            lifted += 1

    mpath.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ppath.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    out.update(used=True, citations=int(sch["citations"]), papers_lifted=lifted,
               h_index=metrics.get("h_index"))
    if not quiet:
        print(f"[OK] Google Scholar: {sch['citations']} citations, h {metrics.get('h_index')}, "
              f"{lifted} papers raised to their Scholar count "
              f"(read {old:.1f} days ago)")
    return out


if __name__ == "__main__":
    apply(Path(__file__).resolve().parent)
