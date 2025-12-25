# tools/scopus_fetcher.py
from __future__ import annotations
import argparse
import csv
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Tuple

import requests

# ----------------- constants -----------------
SEARCH = "https://api.elsevier.com/content/search/scopus"
ABSTRACT = "https://api.elsevier.com/content/abstract/eid/{}"
AUTHOR = "https://api.elsevier.com/content/author/author_id/{}"
FIELDS = (
    "dc:title,eid,prism:doi,citedby-count,prism:coverDate,subtype,subtypeDescription,"
    "prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,dc:creator"
)
PAGE = 25
TIMEOUT = 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("scopus")

# ----------------- helpers -----------------
def _parse_api_keys(envval: str) -> List[str]:
    """Tolerant parser: allows commas, whitespace, stray quotes/brackets; returns only 32-hex keys."""
    if not envval:
        return []
    cleaned = envval.strip().strip("[](){}")
    parts = re.split(r"[,\s]+", cleaned)
    out: List[str] = []
    for p in parts:
        k = p.strip().strip("'").strip('"')
        if re.fullmatch(r"[0-9a-fA-F]{32}", k):
            out.append(k.lower())
    return out


API_KEYS = _parse_api_keys(os.getenv("SCOPUS_API_KEYS", ""))
if not API_KEYS:
    raise SystemExit("Set SCOPUS_API_KEYS=key1,key2 (comma-separated, no quotes).")

def ensure(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def scopus_link(eid: str) -> str:
    return f"https://www.scopus.com/record/display.uri?eid={eid}&origin=recordpage"

def iso_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def parts(date: str | None) -> Tuple[str | None, str | None, str | None]:
    y = m = d = None
    if date:
        sp = date.split("-")
        y = sp[0] if len(sp) > 0 else None
        m = (sp[1].zfill(2) if len(sp) > 1 and sp[1] else None)
        d = (sp[2].zfill(2) if len(sp) > 2 and sp[2] else None)
    return y, m, d

def _key(i: int) -> str:
    return API_KEYS[i % len(API_KEYS)]

def req(url: str, headers: Dict[str, str], params: Dict[str, str] | None) -> Dict:
    r = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
    # why: bubble up API errors to fail the job and surface logs
    r.raise_for_status()
    return r.json()

# ----------------- API calls -----------------
def iter_search(query: str):
    """Generator over Scopus search results with simple key rotation + pagination."""
    i = start = 0
    total = None
    while True:
        headers = {"Accept": "application/json", "X-ELS-APIKey": _key(i)}
        params = {"query": query, "field": FIELDS, "count": PAGE, "start": start}
        try:
            data = req(SEARCH, headers, params)
        except Exception as e:
            log.warning("search error (key rotate): %s", e)
            i += 1
            time.sleep(0.4)
            continue
        root = data.get("search-results", {})
        entries = root.get("entry", []) or []
        if total is None:
            tr = root.get("opensearch:totalResults")
            total = int(tr) if tr and str(tr).isdigit() else None
        for e in entries:
            yield e
        start += PAGE
        if total is None and len(entries) < PAGE:
            break
        if total is not None and (start >= total or not entries):
            break
        time.sleep(0.25)

def fetch_authors(eid: str) -> List[str]:
    """Get full author list for an EID (optional; retried a few times)."""
    headers = {"Accept": "application/json", "X-ELS-APIKey": _key(0)}
    for _ in range(4):
        try:
            j = req(ABSTRACT.format(eid), headers, {"view": "FULL"})
            authors = j.get("abstracts-retrieval-response", {}).get("authors", {}).get("author", [])
            if isinstance(authors, dict):
                authors = [authors]
            names: List[str] = []
            for a in authors:
                nm = a.get("ce:indexed-name") or a.get("preferred-name", {}).get("ce:indexed-name") or a.get("authname")
                if nm:
                    names.append(nm)
            return names
        except Exception:
            time.sleep(0.5)
    return []

def fetch_author_profile(author_id: str) -> Dict:
    """Official Scopus totals (matches UI)."""
    headers = {"Accept": "application/json", "X-ELS-APIKey": _key(0)}
    j = req(AUTHOR.format(author_id), headers, {"view": "ENHANCED"})
    core = (j.get("author-retrieval-response") or [{}])[0]
    name = core.get("coredata", {}).get("preferred-name", {})
    author_name = " ".join(filter(None, [name.get("given-name"), name.get("surname")])) or None
    metrics = {
        "author_id": author_id,
        "author_name": author_name,
        "h_index": int(core.get("h-index", 0) or 0),
        "total_citations": int(core.get("coredata", {}).get("citation-count", 0) or 0),
        "total_documents": int(core.get("coredata", {}).get("document-count", 0) or 0),
        "source": "scopus",
        "last_updated": iso_now(),
    }
    return metrics

# ----------------- normalize -----------------
def normalize(it: Dict, authors: List[str]) -> Dict:
    y, m, d = parts(it.get("prism:coverDate") or "")
    doi = it.get("prism:doi")
    return {
        "title": it.get("dc:title") or "",
        "eid": it.get("eid") or "",
        "scopus_url": scopus_link(it.get("eid", "")),
        "doi": doi,
        "doi_url": f"https://doi.org/{doi}" if doi else None,
        "cited_by": int(it.get("citedby-count", 0) or 0),
        "cover_date": it.get("prism:coverDate") or "",
        "year": y,
        "month": m,
        "day": d,
        "venue": it.get("prism:publicationName"),
        "type": it.get("subtypeDescription"),
        "subtype": it.get("subtype"),  # 'ar'/'re'/'ed'/'cp'/...
        "volume": it.get("prism:volume"),
        "issue": it.get("prism:issueIdentifier"),
        "pages": it.get("prism:pageRange"),
        "first_author": it.get("dc:creator"),
        "authors": authors,
    }

# ----------------- main -----------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--authors-file", default="data/authors.csv")
    ap.add_argument("--out", default="data/scopus")
    ap.add_argument("--combined", default="data/scopus/scopus.json")
    ap.add_argument("--metrics", default="data/scopus/metrics.json")
    ap.add_argument("--details", action="store_true")
    ap.add_argument("--types", default="Article,Review,Editorial,Conference Paper")  # set "*" to include all
    args = ap.parse_args()

    ensure(args.out)

    keep_all = args.types.strip() == "*"
    include = [t.strip().lower() for t in args.types.split(",") if t.strip()]

    authors: List[Tuple[str, str]] = []
    with open(args.authors_file, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            aid = str(r.get("author_id", "")).strip()
            nm = str(r.get("name", "")).strip()
            if aid and nm:
                authors.append((aid, nm))
    if not authors:
        raise SystemExit("authors.csv has no rows.")

    combined: List[Dict] = []
    first_metrics: Dict | None = None

    for idx, (aid, nm) in enumerate(authors, 1):
        log.info("Author %d/%d %s (%s)", idx, len(authors), nm, aid)
        query = f"AU-ID({aid})"
        rows: List[Dict] = []

        for it in iter_search(query):
            desc = (it.get("subtypeDescription") or it.get("subtype") or "").lower()
            keep = keep_all or any(t in desc for t in include) or it.get("subtype", "").lower() == "cp"
            if not keep:
                continue
            auth_list = fetch_authors(it.get("eid", "")) if (args.details and it.get("eid")) else []
            row = normalize(it, auth_list)
            row["author_id"] = aid
            row["author_name"] = nm
            rows.append(row)

        rows.sort(
            key=lambda r: (
                int(r["year"]) if (r.get("year") and str(r["year"]).isdigit()) else -1,
                r.get("month") or "",
                r.get("title") or "",
            ),
            reverse=True,
        )

        # Per-author CSV (handy export)
        csvp = os.path.join(args.out, f"{nm.replace(' ', '_')}_articles.csv")
        with open(csvp, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(
                f,
                fieldnames=[
                    "title",
                    "scopus_url",
                    "doi_url",
                    "cited_by",
                    "cover_date",
                    "venue",
                    "volume",
                    "issue",
                    "pages",
                ],
            )
            w.writeheader()
            for r in rows:
                w.writerow({k: r.get(k) for k in w.fieldnames})
        log.info("Saved %d item(s) → %s", len(rows), csvp)

        combined.extend(rows)
        time.sleep(0.1)

        # Official totals (match Scopus UI)
        try:
            m = fetch_author_profile(aid)
            if not first_metrics:
                first_metrics = m
        except Exception as e:
            log.warning("Metrics fetch failed for %s: %s", aid, e)

    # Write combined publications
    with open(args.combined, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    log.info("Combined JSON: %s (total %d)", args.combined, len(combined))

    # Write metrics (if available)
    if first_metrics:
        with open(args.metrics, "w", encoding="utf-8") as f:
            json.dump(first_metrics, f, ensure_ascii=False, indent=2)
        log.info("Metrics JSON: %s", args.metrics)
    else:
        log.warning("No metrics were written (Author Retrieval failed).")

    # Fail CI if absolutely nothing was retrieved
    if not combined and not first_metrics:
        raise SystemExit("No publications and no metrics retrieved.")


if __name__ == "__main__":
    main()
