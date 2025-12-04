# tools/scopus_fetcher.py  (adds metrics.json; tolerant key parsing)
from __future__ import annotations
import argparse, csv, json, os, time, logging, requests, re
from datetime import datetime, timezone

SEARCH  = "https://api.elsevier.com/content/search/scopus"
ABSTRACT= "https://api.elsevier.com/content/abstract/eid/{}"
AUTHOR  = "https://api.elsevier.com/content/author/author_id/{}"
FIELDS  = "dc:title,eid,prism:doi,citedby-count,prism:coverDate,subtype,subtypeDescription,prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,dc:creator"
PAGE, TIMEOUT = 25, 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("scopus")

def _parse_api_keys(envval: str) -> list[str]:
    if not envval: return []
    cleaned = envval.strip().strip("[](){}")
    parts = re.split(r"[,\s]+", cleaned)
    out=[]
    for p in parts:
      k=p.strip().strip("'").strip('"')
      if re.fullmatch(r"[0-9a-fA-F]{32}", k): out.append(k.lower())
    return out

API_KEYS=_parse_api_keys(os.getenv("SCOPUS_API_KEYS",""))
if not API_KEYS: raise SystemExit("Set SCOPUS_API_KEYS=key1,key2 (comma-separated, no quotes).")

def ensure(p): os.makedirs(p, exist_ok=True)
def scopus_link(eid): return f"https://www.scopus.com/record/display.uri?eid={eid}&origin=recordpage"
def iso_now(): return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def req(url, headers, params):
    r=requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
    r.raise_for_status(); return r.json()

def _key(i:int)->str: return API_KEYS[i % len(API_KEYS)]

def iter_search(query):
    i=start=0; total=None
    while True:
        headers={"Accept":"application/json","X-ELS-APIKey":_key(i)}
        params={"query":query,"field":FIELDS,"count":PAGE,"start":start}
        try: data=req(SEARCH, headers, params)
        except Exception: i+=1; time.sleep(0.4); continue
        root=data.get("search-results",{}); entries=root.get("entry",[]) or []
        if total is None:
            tr=root.get("opensearch:totalResults"); total=int(tr) if tr and str(tr).isdigit() else None
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
        except Exception: time.sleep(0.5)
    return []

def fetch_author_profile(author_id:str)->dict:
    headers={"Accept":"application/json","X-ELS-APIKey":_key(0)}
    j=req(AUTHOR.format(author_id), headers, {"view":"ENHANCED"})
    core=(j.get("author-retrieval-response") or [{}])[0]
    name=core.get("coredata",{}).get("preferred-name",{})
    author_name=" ".join(filter(None,[name.get("given-name"), name.get("surname")])) or None
    return {
        "author_id": author_id,
        "author_name": author_name,
        "h_index": int(core.get("h-index",0) or 0),
        "total_citations": int(core.get("coredata",{}).get("citation-count",0) or 0),
        "total_documents": int(core.get("coredata",{}).get("document-count",0) or 0),
        "source": "scopus",
        "last_updated": iso_now(),
    }

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

    rows_all=[]; metrics_first=None
    with open(args.authors_file, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            aid=str(r.get("author_id","")).strip(); nm=str(r.get("name","")).strip()
            if not (aid and nm): continue
            log.info("Author %s (%s)", nm, aid)
            q=f"AU-ID({aid})"
            rows=[]
            for it in iter_search(q):
                desc=(it.get("subtypeDescription") or it.get("subtype") or "").lower()
                keep = keep_all or any(t in desc for t in include) or it.get("subtype","").lower()=="cp"
                if not keep: continue
                a = fetch_authors(it.get("eid","")) if (args.details and it.get("eid")) else []
                rnorm=normalize(it,a); rnorm["author_id"]=aid; rnorm["author_name"]=nm
                rows.append(rnorm)

            rows.sort(key=lambda r: (int(r["year"]) if (r["year"] and str(r["year"]).isdigit()) else -1, r.get("month") or "", r.get("title") or ""), reverse=True)
            rows_all.extend(rows); time.sleep(0.1)

            try:
                m=fetch_author_profile(aid)
                if not metrics_first: metrics_first=m
            except Exception as e:
                log.warning("Metrics fetch failed for %s: %s", aid, e)

    with open(args.combined,"w",encoding="utf-8") as f: json.dump(rows_all,f,ensure_ascii=False,indent=2)
    log.info("Combined JSON: %s (total %d)", args.combined, len(rows_all))
    if metrics_first:
        with open(args.metrics,"w",encoding="utf-8") as f: json.dump(metrics_first,f,ensure_ascii=False,indent=2)
        log.info("Metrics JSON: %s", args.metrics)

if __name__=="__main__": main()
