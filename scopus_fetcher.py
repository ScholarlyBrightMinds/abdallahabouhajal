#!/usr/bin/env python3
"""
Scopus Data Fetcher for GitHub Pages
Fetches publications and metrics for a single author.
"""

import os
import sys
import json
import time
import csv
import requests
from datetime import datetime, timezone

# ========== CONFIG ==========
API_KEY   = os.getenv("SCOPUS_API_KEY", "").strip()
AUTHOR_ID = os.getenv("SCOPUS_AUTHOR_ID", "58094444100").strip()
# =============================

SEARCH_URL = "https://api.elsevier.com/content/search/scopus"
AUTHOR_URL = f"https://api.elsevier.com/content/author/author_id/{AUTHOR_ID}"
OUTPUT_DIR = "data/scopus"

HEADERS = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}


def utc_now() -> str:
    """Return current UTC time as a clean ISO-8601 string ending in Z."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _get(url: str, params: dict, retries: int = 3, backoff: float = 5.0) -> dict:
    """GET with simple retry/backoff. Raises on final failure."""
    for attempt in range(1, retries + 1):
        try:
            r = requests.get(url, headers=HEADERS, params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else 0
            if status == 401:
                raise RuntimeError(
                    "401 Unauthorized — check that SCOPUS_API_KEY is set correctly "
                    "and has permissions for the endpoint you are calling."
                ) from e
            if status == 429:
                wait = backoff * attempt
                print(f"  Rate-limited (429). Waiting {wait}s before retry {attempt}/{retries}...")
                time.sleep(wait)
                continue
            raise
        except Exception as e:
            if attempt == retries:
                raise
            print(f"  Request error (attempt {attempt}/{retries}): {e}. Retrying in {backoff}s...")
            time.sleep(backoff)
    raise RuntimeError(f"All {retries} attempts failed for {url}")


def parse_authors(creator) -> list:
    """
    Robustly parse the dc:creator field into a list of author name strings.

    The Scopus API returns 'Last A., Last B., Last C.' — splitting on ', '
    gives clean tokens without dropping the final entry.
    """
    if not creator:
        return []
    if isinstance(creator, list):
        return [str(a).strip() for a in creator if a]
    raw = str(creator).strip()
    parts = [p.strip() for p in raw.split(", ") if p.strip()]
    return parts


def fetch_publications() -> list:
    """Fetch all publications for the author from the Scopus Search API."""
    publications = []
    start = 0
    count = 25

    print(f"Fetching publications for author {AUTHOR_ID}...")

    while True:
        params = {
            "query": f"AU-ID({AUTHOR_ID})",
            "start": start,
            "count": count,
            # Use STANDARD view — COMPLETE requires a special API entitlement
            "field": (
                "title,creator,publicationName,coverDate,"
                "doi,citedby-count,subtype,subtypeDescription"
            ),
            "sort": "-coverDate",
        }

        data = _get(SEARCH_URL, params)
        results = data.get("search-results", {})
        entries = results.get("entry", [])

        # The API may return a single-entry dict instead of a list
        if isinstance(entries, dict):
            entries = [entries]

        for entry in entries:
            doi = entry.get("prism:doi")
            cover_date = entry.get("prism:coverDate", "")
            authors = parse_authors(entry.get("dc:creator", ""))

            publication = {
                "title":              (entry.get("dc:title") or "").strip(),
                "authors":            authors,
                "first_author":       authors[0] if authors else "",
                "venue":              (entry.get("prism:publicationName") or "").strip(),
                "year":               cover_date[:4] if cover_date else "",
                "month":              cover_date[5:7] if len(cover_date) >= 7 else "",
                "cover_date":         cover_date,
                "doi":                doi,
                "doi_url":            f"https://doi.org/{doi}" if doi else None,
                "cited_by":           int(entry.get("citedby-count") or 0),
                "subtype":            entry.get("subtype", ""),
                "subtypeDescription": entry.get("subtypeDescription", ""),
                "author_id":          AUTHOR_ID,
            }
            publications.append(publication)

        total = int(results.get("opensearch:totalResults", 0))
        start += count
        print(f"  Fetched {len(publications)} / {total} publications...")

        if start >= total or not entries:
            break

        # Be polite to the API
        time.sleep(0.5)

    return publications


def fetch_metrics(publications: list) -> dict:
    """
    Fetch author metrics from the Scopus Author API.
    Falls back to values computed from the publications list if the API
    call fails (e.g. key lacks author-retrieval entitlement).
    """
    print(f"Fetching metrics for author {AUTHOR_ID}...")

    try:
        data = _get(AUTHOR_URL, {"view": "METRICS"})
        author_data = data.get("author-retrieval-response", [{}])[0]
        core = author_data.get("coredata", {})

        return {
            "total_documents": int(core.get("document-count") or 0),
            "total_citations": int(core.get("cited-by-count") or 0),
            "h_index":         int(core.get("h-index") or 0),
            "author_id":       AUTHOR_ID,
            "source":          "scopus_api",
            "last_updated":    utc_now(),
        }

    except Exception as e:
        print(f"  Warning: Could not fetch official metrics ({e}). Computing from publications...")
        return _compute_metrics(publications)


def _compute_metrics(publications: list) -> dict:
    """Derive h-index and citation count directly from the publications list."""
    citations = sorted(
        [int(p.get("cited_by") or 0) for p in publications],
        reverse=True
    )
    h = sum(1 for i, c in enumerate(citations, 1) if c >= i)

    return {
        "total_documents": len(publications),
        "total_citations": sum(citations),
        "h_index":         h,
        "author_id":       AUTHOR_ID,
        "source":          "computed_from_publications",
        "last_updated":    utc_now(),
    }


def save_csv(publications: list) -> None:
    """Save a human-readable CSV alongside the JSON for easy inspection."""
    csv_path = os.path.join(OUTPUT_DIR, "publications.csv")
    fields = ["year", "title", "first_author", "venue", "cited_by", "subtype", "doi"]

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(publications)

    print(f"  Saved CSV to {csv_path}")


def main() -> None:
    if not API_KEY:
        print("ERROR: SCOPUS_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    if not AUTHOR_ID:
        print("ERROR: SCOPUS_AUTHOR_ID environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=== Starting Scopus Data Fetch ===")

    # --- Publications ---
    try:
        publications = fetch_publications()
    except Exception as e:
        print(f"FATAL: Could not fetch publications: {e}", file=sys.stderr)
        sys.exit(1)

    if not publications:
        print("WARNING: No publications returned. Check your AUTHOR_ID.", file=sys.stderr)

    pubs_path = os.path.join(OUTPUT_DIR, "scopus.json")
    with open(pubs_path, "w", encoding="utf-8") as f:
        json.dump(publications, f, indent=2, ensure_ascii=False)
    print(f"  Saved {len(publications)} publications to {pubs_path}")

    save_csv(publications)

    # --- Metrics ---
    metrics = fetch_metrics(publications)

    metrics_path = os.path.join(OUTPUT_DIR, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"  Saved metrics to {metrics_path}")

    # --- Summary ---
    summary = {
        "total_publications": len(publications),
        "last_run":           utc_now(),
        "author_id":          AUTHOR_ID,
        "metrics_source":     metrics.get("source", "unknown"),
    }
    summary_path = os.path.join(OUTPUT_DIR, "summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("=== Data Fetch Complete ===")
    print(f"  Publications : {len(publications)}")
    print(f"  Citations    : {metrics['total_citations']}")
    print(f"  h-index      : {metrics['h_index']}")
    print(f"  Metrics from : {metrics['source']}")


if __name__ == "__main__":
    main()
