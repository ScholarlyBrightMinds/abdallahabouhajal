#!/usr/bin/env python3
"""
serpapi_fetcher.py - Fetches your Google Scholar profile via SerpApi.
Saves data for your static site.
"""

import requests
import json
import os
from datetime import datetime, timezone

# ========== CONFIGURATION ==========
SERPAPI_KEY = "1c00b5be91e4b1f5948198b20e90d52251df53b81af96dfac1bd6c172d020af4"  # Your trial key
SCHOLAR_AUTHOR_ID = "1I8SvsQAAAAJ"  # Your Google Scholar ID
OUTPUT_DIR = "data/serpapi"
# ===================================

API_URL = "https://serpapi.com/search.json"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_serpapi_data():
    """Fetches author profile and publications from SerpApi."""
    print(f"Fetching data for author {SCHOLAR_AUTHOR_ID}...")
    params = {
        "engine": "google_scholar_author",
        "author_id": SCHOLAR_AUTHOR_ID,
        "api_key": SERPAPI_KEY,
        "hl": "en"
    }
    try:
        response = requests.get(API_URL, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"SerpApi request failed: {e}")
        return None

def normalize_data(serpapi_data):
    """Converts SerpApi's format to match our website's expected structure."""
    if not serpapi_data:
        return [], {}
    
    author_info = serpapi_data.get("author", {})
    articles_list = serpapi_data.get("articles", [])
    
    # 1. Normalize publications
    publications = []
    for art in articles_list:
        pub = {
            "title": art.get("title", ""),
            "authors": art.get("authors", ""),
            "venue": art.get("publication", ""),
            "year": art.get("year", ""),
            "cited_by": art.get("cited_by", {}).get("value", 0),
            "link": art.get("link", "#"),
            "author_id": SCHOLAR_AUTHOR_ID
        }
        publications.append(pub)
    
    # 2. Normalize metrics
    cited_by_table = serpapi_data.get("cited_by", {}).get("table", [])
    metrics = {
        "total_documents": len(articles_list),
        "total_citations": cited_by_table[0].get("citations", {}).get("all", 0) if cited_by_table else 0,
        "h_index": cited_by_table[1].get("indice_h", {}).get("all", 0) if len(cited_by_table) > 1 else 0,
        "author_id": SCHOLAR_AUTHOR_ID,
        "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
    }
    return publications, metrics

def main():
    """Main function to run the fetch and save data."""
    print("=== Starting SerpApi Data Fetch ===")
    raw_data = fetch_serpapi_data()
    publications, metrics = normalize_data(raw_data)
    
    if publications:
        # Save publications
        pubs_path = os.path.join(OUTPUT_DIR, "serpapi.json")
        with open(pubs_path, 'w', encoding='utf-8') as f:
            json.dump(publications, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(publications)} publications to {pubs_path}")
        
        # Save metrics
        metrics_path = os.path.join(OUTPUT_DIR, "metrics.json")
        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2)
        print(f"✓ Saved metrics to {metrics_path}")
        
        print("=== Data Fetch Complete ===")
        print("Next: Commit and push the 'data/serpapi/' folder to GitHub.")
    else:
        print("❌ Failed to fetch or process data.")

if __name__ == "__main__":
    main()