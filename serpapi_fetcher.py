#!/usr/bin/env python3
"""
serpapi_fetcher.py - Fetches your Google Scholar AUTHOR profile via SerpApi.
Uses the correct 'google_scholar_author' endpoint.
"""

import requests
import json
import os
from datetime import datetime, timezone

# ========== CONFIGURATION ==========
SERPAPI_KEY = "1c00b5be91e4b1f5948198b20e90d52251df53b81af96dfac1bd6c172d020af4"  # <- YOUR KEY
SCHOLAR_AUTHOR_ID = "1I8SvsQAAAAJ"  # Your Google Scholar Author ID
OUTPUT_DIR = "data/serpapi"
# ===================================

API_URL = "https://serpapi.com/search.json"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_author_data():
    """Fetches author profile and publications using the correct author API."""
    print(f"Fetching author data for ID: {SCHOLAR_AUTHOR_ID}")
    params = {
        "engine": "google_scholar_author",  # CORRECT ENDPOINT
        "author_id": SCHOLAR_AUTHOR_ID,      # CORRECT PARAMETER
        "api_key": SERPAPI_KEY,
        "hl": "en"
    }
    try:
        response = requests.get(API_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Check for API errors in the response
        if data.get("error"):
            print(f"SerpApi returned an error: {data.get('error')}")
            return None
        print("API call successful.")
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"SerpApi request failed: {e}")
        return None

def normalize_author_data(raw_data):
    """Converts the CORRECT SerpApi author response to our website's format."""
    if not raw_data:
        return [], {}
    
    # 1. Extract and normalize PUBLICATIONS from the "articles" key
    articles_list = raw_data.get("articles", [])
    publications = []
    
    for article in articles_list:
        # The 'cited_by' value is nested inside a dictionary
        cited_by_value = article.get("cited_by", {}).get("value")
        
        pub = {
            "title": article.get("title", ""),
            "authors": article.get("authors", ""),
            "venue": article.get("publication", ""),
            "year": article.get("year", ""),
            "cited_by": int(cited_by_value) if cited_by_value else 0,
            # Use the direct link from the API for "Read"
            "link": article.get("link", "#"),
            "author_id": SCHOLAR_AUTHOR_ID
        }
        publications.append(pub)
    
    # 2. Extract and normalize METRICS from the "cited_by" -> "table" key
    # The structure is: "cited_by": { "table": [ {"citations": {"all": X}}, {"indice_h": {"all": Y}} ] }
    cited_by_table = raw_data.get("cited_by", {}).get("table", [])
    
    total_citations = 0
    h_index = 0
    # Loop through the table to find the citation and h-index objects
    for item in cited_by_table:
        if "citations" in item:
            total_citations = item.get("citations", {}).get("all", 0)
        if "indice_h" in item:
            h_index = item.get("indice_h", {}).get("all", 0)
    
    metrics = {
        "total_documents": len(articles_list),
        "total_citations": total_citations,
        "h_index": h_index,
        "author_id": SCHOLAR_AUTHOR_ID,
        "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
    }
    
    return publications, metrics

def main():
    print("=== Starting CORRECT SerpApi Author Data Fetch ===")
    
    # Step 1: Fetch raw data from the correct API
    raw_data = fetch_author_data()
    
    if not raw_data:
        print("❌ Failed to fetch data. Check your API key and internet connection.")
        return
    
    # Step 2: Convert the data to our format
    publications, metrics = normalize_author_data(raw_data)
    
    if publications:
        # Step 3: Save publications
        pubs_path = os.path.join(OUTPUT_DIR, "serpapi.json")
        with open(pubs_path, 'w', encoding='utf-8') as f:
            json.dump(publications, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(publications)} publications to {pubs_path}")
        
        # Step 4: Save metrics
        metrics_path = os.path.join(OUTPUT_DIR, "metrics.json")
        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2)
        print(f"✓ Saved metrics to {metrics_path}")
        print(f"   - Total Citations: {metrics['total_citations']}")
        print(f"   - h-index: {metrics['h_index']}")
        
        print("=== Data Fetch Complete ===")
        print("Next: Commit and push the 'data/serpapi/' folder to GitHub.")
    else:
        print("❌ No publications were found in the API response.")
        print("   Debug: The raw data keys are:", list(raw_data.keys()) if raw_data else "No data")

if __name__ == "__main__":
    main()
