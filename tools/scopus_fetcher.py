# tools/scopus_fetcher.py
from __future__ import annotations
import argparse, csv, json, os, re, time, logging
from datetime import datetime, timezone
from typing import Dict, List, Tuple
import requests

SEARCH  = "https://api.elsevier.com/content/search/scopus"
ABSTRACT= "https://api.elsevier.com/content/abstract/eid/{}"
AUTHOR  = "https://api.elsevier.com/content/author/author_id/{}"
FIELDS  = ("dc:title,eid,prism:doi,citedby-count,prism:coverDate,subtype,subtypeDescription,"
           "prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,dc:creator")
PAGE, TIMEOUT = 25, 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("scopus")

def _parse_api_keys(envval: str) -> List[str]:
    if not envval: return []
    cleaned = envval.strip().strip("[](){}")
    parts = re.split(r"[,\s]+", cleaned)
    out=[]
    for p in parts:
        k = p.strip().strip("'").strip('"')
        if re.fullmatch(r"[0-9a-fA-F]{32}", k): out.append(k.lower())
    return out

API_KEYS=_parse_api_keys(os.getenv("SCOPUS_API_KEYS",""))
if not API_KEYS: raise SystemExit("Set SCOPUS_API_KEYS=key1,key2 (comma-separated, no quotes).")

def ensure(p): os.makedirs(p, exist_ok=True)
def scopus_link(eid): return f"https://www.scopus.com/record/display.uri?eid={eid}&origin=recordpage"
def iso_now(): return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def _key(i:int)->str: return API_KEYS[i % len(API_KEYS)]

def req(url, headers, params):
    r=requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

def iter_search(query):
    i=start=0; total=None
    while True:
        headers={"Accept":"application/json","X-ELS-APIKey":_key(i)}
        params={"query":query,"field":FIELDS,"count":PAGE,"start":start}
        try:
            data=req(SEARCH, headers, params)
        except Exception as e:
            log.warning("search error (rotate key): %s", e); i+=1; time.sleep(0.4); continue
        root=data.get("search-results",{}); entries=root.get("entry",[]) or []
        if total is None:
            tr=root.get("opensearch:totalResults")
            total=int(tr) if tr and str(tr).isdigit() else None
        for e in entries: yield e
        start+=PAGE
        if total is None and len(entries)<PAGE: break
        if total is not None and (start>=total or not entries): break
        time.sleep(0.25)

def fetch_authors(eid):
    headers={"Accept":"application/json","X-ELS-APIKey":_key(0)}
    for _ in range(4):
        try:
            j=req(ABSTRACT.format(eid), headers, {"view":"FULL"})
            authors=j.get("abstracts-retrieval-response",{}).get("authors",{}).get("author",[])
            if isinstance(authors, dict): authors=[authors]
            names=[]
            for a in authors:
                nm=a.get("ce:indexed-name") or a.get("preferred-name",{}).get("ce:indexed-name") or a.get("authname")
                if nm: names.append(nm)
            return names
        except Exception:
            time.sleep(0.5)
    return []

def _author_profile_call(author_id: str, view: str) -> Dict | None:
    headers={"Accept":"application/json","X-ELS-APIKey":_key(0)}
    try:
        j=req(AUTHOR.format(author_id), headers, {"view": view})
        core=(j.get("author-retrieval-response") or [{}])[0]
        name=core.get("coredata",{}).get("preferred-name",{})
        author_name=" ".join(filter(None,[name.get("given-name"), name.get("surname")])) or None
        h = int(core.get("h-index",0) or 0)
        total_cites = int(core.get("coredata",{}).get("citation-count",0) or 0)
        total_docs  = int(core.get("coredata",{}).get("document-count",0) or 0)
        return {
            "author_id": author_id,
            "author_name": author_name,
            "h_index": h,
            "total_citations": total_cites,
            "total_documents": total_docs,
            "source": f"scopus:{view.lower()}",
            "last_updated": iso_now(),
        }
    except Exception as e:
        log.warning("author profile (%s) failed: %s", view, e)
        return None

def fetch_author_profile(author_id:str)->Dict | None:
    # try ENHANCED first; fall back to STANDARD (no insttoken required)
    return _author_profile_call(author_id, "ENHANCED") or _author_profile_call(author_id, "STANDARD")

def parts(date):
    y=m=d=None
    if date:
        sp=date.split("-"); y=sp[0] if len(sp)>0 else None
        m=(sp[1].zfill(2) if len(sp)>1 and sp[1] else None)
        d=(sp[2].zfill(2) if len(sp)>2 and sp[2] else None)
    return y,m,d

def normalize(it, authors):
    y,m,d=parts(it.get("prism:coverDate") or ""); doi=it.get("prism:doi")
    return {
        "title": it.get("dc:title") or "",
        "eid": it.get("eid") or "",
        "scopus_url": scopus_link(it.get("eid","")),
        "doi": doi, "doi_url": f"https://doi.org/{doi}" if doi else None,
        "cited_by": int(it.get("citedby-count",0) or 0),
        "cover_date": it.get("prism:coverDate") or "",
        "year": y, "month": m, "day": d,
        "venue": it.get("prism:publicationName"),
        "type": it.get("subtypeDescription"), "subtype": it.get("subtype"),
        "volume": it.get("prism:volume"), "issue": it.get("prism:issueIdentifier"),
        "pages": it.get("prism:pageRange"),
        "first_author": it.get("dc:creator"),
        "authors": authors
    }

def _fallback_metrics(author_id: str, author_name: str, rows: List[Dict]) -> Dict:
    # why: guarantee metrics.json exists even if Author API fails
    cites = sum(int(r.get("cited_by") or 0) for r in rows)
    years = [int(r["year"]) for r in rows if r.get("year") and str(r["year"]).isdigit()]
    return {
        "author_id": author_id,
        "author_name": author_name,
        "h_index": 0,                     # unknown without per-item cites distribution; front-end shows anyway
        "total_citations": cites,         # may differ from Scopus 'by documents', but better than missing file
        "total_documents": len(rows),
        "source": "fallback",
        "last_updated": iso_now(),
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--authors-file", default="data/authors.csv")
    ap.add_argument("--out",      default="data/scopus")
    ap.add_argument("--combined", default="data/scopus/scopus.json")
    ap.add_argument("--metrics",  default="data/scopus/metrics.json")
    ap.add_argument("--details", action="store_true")
    ap.add_argument("--types",  default="Article,Review,Editorial,Conference Paper")  # set "*" to include all
    args=ap.parse_args()

    ensure(args.out)
    keep_all = args.types.strip() == "*"
    include=[t.strip().lower() for t in args.types.split(",") if t.strip()]

    combined: List[Dict] = []
    metrics_to_write: Dict | None = None

    with open(args.authors_file, newline="", encoding="utf-8") as f:
        authors=[(str(r["author_id"]).strip(), str(r["name"]).strip()) for r in csv.DictReader(f) if r.get("author_id") and r.get("name")]
    if not authors: raise SystemExit("authors.csv has no rows.")

    for i,(aid,nm) in enumerate(authors,1):
        log.info("Author %d/%d %s (%s)", i, len(authors), nm, aid)
        q=f"AU-ID({aid})"
        rows=[]
        for it in iter_search(q):
            desc=(it.get("subtypeDescription") or it.get("subtype") or "").lower()
            keep = keep_all or any(t in desc for t in include) or it.get("subtype","").lower()=="cp"
            if not keep: continue
            a = fetch_authors(it.get("eid","")) if (args.details and it.get("eid")) else []
            row=normalize(it, a)
            row["author_id"]=aid; row["author_name"]=nm
            rows.append(row)

        rows.sort(key=lambda r: (
            int(r["year"]) if (r.get("year") and str(r["year"]).isdigit()) else -1,
            r.get("month") or "", r.get("title") or ""
        ), reverse=True)

        # per-author CSV (export)
        csvp=os.path.join(args.out, f"{nm.replace(' ','_')}_articles.csv")
        with open(csvp,"w",newline="",encoding="utf-8") as fcsv:
            w=csv.DictWriter(fcsv, fieldnames=["title","scopus_url","doi_url","cited_by","cover_date","venue","volume","issue","pages"])
            w.writeheader()
            for r in rows: w.writerow({k:r.get(k) for k in w.fieldnames})
        log.info("Saved %d item(s) → %s", len(rows), csvp)

        combined.extend(rows); time.sleep(0.1)

        # Author metrics (try API, then fallback)
        prof = fetch_author_profile(aid)
        if prof:
            metrics_to_write = prof
        else:
            log.warning("Falling back to computed metrics for %s", aid)
            metrics_to_write = _fallback_metrics(aid, nm, rows)

    with open(args.combined,"w",encoding="utf-8") as fjson:
        json.dump(combined,fjson,ensure_ascii=False,indent=2)
    log.info("Combined JSON: %s (total %d)", args.combined, len(combined))

    # ALWAYS write metrics.json
    if metrics_to_write:
        with open(args.metrics,"w",encoding="utf-8") as fm:
            json.dump(metrics_to_write,fm,ensure_ascii=False,indent=2)
        log.info("Metrics JSON: %s (%s)", args.metrics, metrics_to_write.get("source","n/a"))

    if not combined and not metrics_to_write:
        raise SystemExit("No publications and no metrics retrieved.")

if __name__=="__main__":
    main()
