#!/usr/bin/env python3
"""
SIMPLIFIED Scopus Data Fetcher for GitHub Pages
Fetches publications and metrics for a single author.
"""

import os
import json
import requests
from datetime import datetime, timezone

# ========== CONFIG ==========
# These will be set via GitHub Secrets in the workflow
API_KEY = os.getenv("SCOPUS_API_KEY", "")
AUTHOR_ID = os.getenv("SCOPUS_AUTHOR_ID", "58094444100")
# =============================

SEARCH_URL = "https://api.elsevier.com/content/search/scopus"
AUTHOR_URL = f"https://api.elsevier.com/content/author/author_id/{AUTHOR_ID}"
OUTPUT_DIR = "data/scopus"

def fetch_publications():
    """Fetch all publications for the author."""
    headers = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
    publications = []
    start = 0
    count = 25
    
    print(f"Fetching publications for author {AUTHOR_ID}...")
    
    while True:
        params = {
            "query": f"AU-ID({AUTHOR_ID})",
            "start": start,
            "count": count,
            "field": "title,creator,publicationName,coverDate,doi,citedby-count,subtype,subtypeDescription",
            "sort": "-coverDate",
            "view": "COMPLETE"
        }
        
        try:
            response = requests.get(SEARCH_URL, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"Error fetching publications: {e}")
            break
        
        entries = data.get("search-results", {}).get("entry", [])
        
        for entry in entries:
            # Extract DOI
            doi = entry.get("prism:doi")
            doi_url = f"https://doi.org/{doi}" if doi else None
            
            # Extract authors
            creator = entry.get("dc:creator", "")
            if isinstance(creator, str):
                authors = [a.strip() + "." for a in creator.split("., ")]
            else:
                authors = []
            
            publication = {
                "title": entry.get("dc:title", "").strip(),
                "authors": authors,
                "first_author": authors[0] if authors else "",
                "venue": entry.get("prism:publicationName", "").strip(),
                "year": entry.get("prism:coverDate", "")[:4],
                "month": entry.get("prism:coverDate", "")[5:7] if entry.get("prism:coverDate") else "",
                "cover_date": entry.get("prism:coverDate", ""),
                "doi": doi,
                "doi_url": doi_url,
                "cited_by": int(entry.get("citedby-count", 0)),
                "subtype": entry.get("subtype", ""),
                "subtypeDescription": entry.get("subtypeDescription", ""),
                "author_id": AUTHOR_ID
            }
            publications.append(publication)
        
        total = int(data.get("search-results", {}).get("opensearch:totalResults", 0))
        start += count
        
        print(f"  Fetched {len(publications)} of {total} publications...")
        
        if start >= total:
            break
    
    return publications

def fetch_metrics():
    """Fetch author metrics (h-index, citations)."""
    headers = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
    
    print(f"Fetching metrics for author {AUTHOR_ID}...")
    
    try:
        response = requests.get(AUTHOR_URL, headers=headers, params={"view": "METRICS"}, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        author_data = data.get("author-retrieval-response", [{}])[0]
        metrics = author_data.get("coredata", {})
        
        return {
            "total_documents": metrics.get("document-count", 0),
            "total_citations": metrics.get("cited-by-count", 0),
            "h_index": metrics.get("h-index", 0),
            "author_id": AUTHOR_ID,
            "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
        }
    except Exception as e:
        print(f"Error fetching metrics: {e}")
        return {
            "total_documents": 0,
            "total_citations": 0,
            "h_index": 0,
            "author_id": AUTHOR_ID,
            "last_updated": datetime.now(timezone.utc).isoformat() + "Z",
            "error": str(e)
        }

def main():
    """Main function to run the fetcher."""
    if not API_KEY:
        print("ERROR: SCOPUS_API_KEY environment variable not set!")
        return
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=== Starting Scopus Data Fetch ===")
    
    # Fetch data
    publications = fetch_publications()
    metrics = fetch_metrics()
    
    # Save publications
    pubs_path = os.path.join(OUTPUT_DIR, "scopus.json")
    with open(pubs_path, 'w', encoding='utf-8') as f:
        json.dump(publications, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved {len(publications)} publications to {pubs_path}")
    
    # Save metrics
    metrics_path = os.path.join(OUTPUT_DIR, "metrics.json")
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
    print(f"✓ Saved metrics to {metrics_path}")
    
    # Create a summary
    summary = {
        "total_publications": len(publications),
        "last_run": datetime.now(timezone.utc).isoformat() + "Z",
        "author_id": AUTHOR_ID
    }
    
    summary_path = os.path.join(OUTPUT_DIR, "summary.json")
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print("=== Data Fetch Complete ===")

if __name__ == "__main__":
    main()
