#!/usr/bin/env python3
"""
build_html.py — Server-side renderer for SEO.

Runs after serpapi_fetcher.py inside the GitHub Actions workflow. Reads the
freshly-fetched data/serpapi/{serpapi,metrics}.json and bakes the publication
list + headline metrics into the static HTML files BEFORE git commit. Result:
Google's first crawl pass sees real publication titles and citation counts in
the served HTML, instead of empty divs that get filled by JS after page load.

What it touches (idempotent — safe to re-run):
  - publications.html
      * Replaces the inner content of <section id="list-articles">…</section>
        with real <article> blocks per publication.
      * Updates the <span id="m-total"> / m-cites / m-h text content.
      * Replaces the entire <script id="publications-jsonld"> block with the
        full Schema.org CollectionPage + ItemList of ScholarlyArticle JSON-LD.
  - index.html
      * Updates the first chip in the hero (the one with the publication +
        citation count) so the static HTML shows current metrics.

Markers / IDs the script looks for (do not rename without updating here):
  - <section id="list-articles" …>…</section>
  - <span id="m-total">, <span id="m-cites">, <span id="m-h">
  - <script type="application/ld+json" id="publications-jsonld">…</script>
  - In index.html: chips: [ { label: "<N> Publications · <M> Citations" }, …

Run locally:  python build_html.py
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from html import escape
from pathlib import Path

REPO_ROOT  = Path(__file__).resolve().parent
DATA_PUBS  = REPO_ROOT / "data" / "serpapi" / "serpapi.json"
DATA_METR  = REPO_ROOT / "data" / "serpapi" / "metrics.json"
PUBS_HTML  = REPO_ROOT / "publications.html"
INDEX_HTML = REPO_ROOT / "index.html"

SITE_BASE  = "https://scholarlybrightminds.github.io/abdallahabouhajal"


# ─────────────────────────────────────────────────────────────────────────
# Load
# ─────────────────────────────────────────────────────────────────────────
def load_publications() -> list[dict]:
    if not DATA_PUBS.exists():
        print(f"[WARN] {DATA_PUBS} missing — nothing to render.")
        return []
    with DATA_PUBS.open(encoding="utf-8") as f:
        pubs = json.load(f)
    pubs.sort(key=lambda p: int(p.get("year") or 0), reverse=True)
    return pubs


def load_metrics() -> dict:
    if not DATA_METR.exists():
        return {}
    with DATA_METR.open(encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────────────────
# Render: per-publication <article> blocks (for #list-articles section)
# ─────────────────────────────────────────────────────────────────────────
def _journal_name_from_venue(venue: str) -> str:
    """SerpAPI's `venue` is the full citation string, e.g.
        'Journal of Medical Economics 27 (1), 304-308, 2024'
    Strip everything from the first volume-like token onward to get just the
    journal name. Fall back to the original venue if no pattern matches.
    """
    if not venue:
        return ""
    # First numeric token (volume) — drop it and everything after
    m = re.split(r'\s+\d+\s*[(,]', venue, maxsplit=1)
    name = m[0].strip().rstrip(",")
    return name or venue.strip()


def render_article(p: dict) -> str:
    title    = escape(p.get("title", "").strip() or "Untitled")
    authors  = escape(p.get("authors", "").strip())
    venue    = (p.get("venue") or p.get("publication") or "").strip()
    venue_e  = escape(venue)
    year     = escape(str(p.get("year") or "").strip())
    cites    = int(p.get("cited_by") or 0)
    link     = p.get("link") or ""
    if link and not link.startswith(("http://", "https://")):
        link = ""
    link_attr = f' href="{escape(link)}" target="_blank" rel="noopener noreferrer"' if link else ""

    cites_block = (
        f'<span class="pub-cites">{cites} citation{"s" if cites != 1 else ""}</span>'
        if cites else ""
    )
    venue_block = f'<p class="pub-venue">{venue_e}</p>' if venue_e else ""

    return f"""        <article class="pub-item">
            <h3 class="pub-title"><a{link_attr}>{title}</a></h3>
            <p class="pub-authors">{authors}</p>
            {venue_block}
            <div class="pub-meta">{cites_block}</div>
        </article>"""


def render_articles_block(pubs: list[dict]) -> str:
    if not pubs:
        return '        <p class="pub-loading">No publications found.</p>'
    return "\n".join(render_article(p) for p in pubs)


# ─────────────────────────────────────────────────────────────────────────
# Render: Schema.org JSON-LD block for publications.html
# ─────────────────────────────────────────────────────────────────────────
def render_jsonld(pubs: list[dict]) -> str:
    items = []
    for i, p in enumerate(pubs, start=1):
        venue_raw = (p.get("venue") or p.get("publication") or "").strip()
        journal   = _journal_name_from_venue(venue_raw)
        article = {
            "@type": "ScholarlyArticle",
            "name": p.get("title", "").strip(),
            "headline": p.get("title", "").strip(),
            "datePublished": str(p.get("year") or ""),
            "author": [{"@type": "Person", "name": a.strip()}
                          for a in (p.get("authors") or "").split(",")
                          if a.strip()],
        }
        if journal:
            article["isPartOf"] = {"@type": "Periodical", "name": journal}
        if p.get("link"):
            article["url"] = p["link"]
        cites = int(p.get("cited_by") or 0)
        if cites:
            article["interactionStatistic"] = {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/CitationAction",
                "userInteractionCount": cites
            }
        items.append({"@type": "ListItem", "position": i, "item": article})

    payload = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "url": f"{SITE_BASE}/publications.html",
        "name": "Publications — Abdallah Abou Hajal",
        "isPartOf": {
            "@type": "WebSite",
            "url": f"{SITE_BASE}/"
        },
        "about": {
            "@type": "Person",
            "@id": f"{SITE_BASE}/#person",
            "name": "Abdallah Abou Hajal",
            "sameAs": [
                "https://scholar.google.com/citations?user=1I8SvsQAAAAJ&hl=en",
                "https://orcid.org/0009-0006-1807-2178"
            ]
        },
        "mainEntity": {
            "@type": "ItemList",
            "name": "Peer-reviewed publications by Abdallah Abou Hajal",
            "itemListOrder": "https://schema.org/ItemListOrderDescending",
            "numberOfItems": len(items),
            "itemListElement": items
        }
    }
    return ('<script type="application/ld+json" id="publications-jsonld">\n'
            + json.dumps(payload, indent=2, ensure_ascii=False)
            + "\n</script>")


# ─────────────────────────────────────────────────────────────────────────
# Patch: publications.html
# ─────────────────────────────────────────────────────────────────────────
def patch_publications_html(pubs: list[dict], metrics: dict) -> None:
    if not PUBS_HTML.exists():
        print(f"[FAIL] {PUBS_HTML} missing")
        sys.exit(1)
    html = PUBS_HTML.read_text(encoding="utf-8")
    orig = html

    # 1. Replace article list inner content
    articles = render_articles_block(pubs)
    pattern = re.compile(
        r'(<section id="list-articles"[^>]*>)(.*?)(</section>)',
        re.DOTALL
    )
    html = pattern.sub(rf'\1\n{articles}\n        \3', html)

    # 2. Replace metrics span text content
    total = str(metrics.get("total_documents") or len(pubs) or "—")
    cites = str(metrics.get("total_citations")
                  or sum(int(p.get("cited_by") or 0) for p in pubs) or "—")
    hidx  = str(metrics.get("h_index") or "—")
    html = re.sub(r'(<span id="m-total">)[^<]*(</span>)',  rf'\g<1>{total}\g<2>', html)
    html = re.sub(r'(<span id="m-cites">)[^<]*(</span>)',  rf'\g<1>{cites}\g<2>', html)
    html = re.sub(r'(<span id="m-h">)[^<]*(</span>)',      rf'\g<1>{hidx}\g<2>',  html)

    # 3. Replace JSON-LD script block (idempotent — match by id)
    new_jsonld = render_jsonld(pubs)
    jsonld_pattern = re.compile(
        r'<script type="application/ld\+json" id="publications-jsonld">.*?</script>',
        re.DOTALL
    )
    html = jsonld_pattern.sub(new_jsonld, html)

    if html != orig:
        PUBS_HTML.write_text(html, encoding="utf-8")
        print(f"[OK] publications.html: {len(pubs)} articles, "
              f"{total} pubs, {cites} cites, h={hidx}")
    else:
        print("[OK] publications.html: no changes (already up to date)")


# ─────────────────────────────────────────────────────────────────────────
# Patch: index.html — first chip in theme.config.js gets live metrics
# ─────────────────────────────────────────────────────────────────────────
def patch_index_chip(pubs: list[dict], metrics: dict) -> None:
    cfg = REPO_ROOT / "theme.config.js"
    if not cfg.exists():
        return
    text = cfg.read_text(encoding="utf-8")
    orig = text

    total = metrics.get("total_documents") or len(pubs)
    cites = metrics.get("total_citations") or sum(int(p.get("cited_by") or 0) for p in pubs)
    if not total:
        return

    new_label = f"{total} Publications · {cites} Citations"
    # Match the first chip label specifically (… Publications · … Citations)
    pattern = re.compile(
        r'(\{\s*label:\s*")(\d+\s+Publications\s+·\s+\d+\s+Citations)(")',
    )
    text = pattern.sub(rf'\g<1>{new_label}\g<3>', text, count=1)

    if text != orig:
        cfg.write_text(text, encoding="utf-8")
        print(f"[OK] theme.config.js chip: '{new_label}'")
    else:
        print(f"[OK] theme.config.js chip: no change")


# ─────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────
def main() -> int:
    print(f"[build_html] starting at {datetime.now(timezone.utc).isoformat()}")
    pubs = load_publications()
    metrics = load_metrics()
    print(f"[build_html] loaded {len(pubs)} publications, "
          f"metrics keys: {list(metrics.keys())}")
    patch_publications_html(pubs, metrics)
    patch_index_chip(pubs, metrics)
    print("[build_html] done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
