#!/usr/bin/env python3
"""
COMPLETE SerpApi Google Scholar Fetcher for Abdallah Abou Hajal
Fetches ALL publications and CORRECT metrics, saving JSON for your website.
"""

import requests
import json
import os
import time
from datetime import datetime, timezone

# ========== CONFIGURATION (Read from Environment) ==========
# These MUST be set in GitHub Secrets for the Action to work.
# For local testing, you can set them in your terminal.
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
SCHOLAR_AUTHOR_ID = os.getenv("SCHOLAR_AUTHOR_ID", "1I8SvsQAAAAJ")

# API Configuration
API_URL = "https://serpapi.com/search.json"
OUTPUT_DIR = "data/serpapi"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ========== CORE API FUNCTIONS ==========

def fetch_author_profile():
    """Fetches the main author profile (contains the metrics table)."""
    print(f"Fetching author profile for ID: {SCHOLAR_AUTHOR_ID}")
    params = {
        "engine": "google_scholar_author",
        "author_id": SCHOLAR_AUTHOR_ID,
        "api_key": SERPAPI_KEY,
        "hl": "en"
    }
    try:
        response = requests.get(API_URL, params=params, timeout=45)
        response.raise_for_status()
        data = response.json()
        
        # Check for API errors in the response body
        if data.get("error"):
            print(f"❌ SerpApi Error: {data.get('error')}")
            return None
            
        print("✅ Author profile fetched successfully.")
        # Quick debug of critical keys
        if 'cited_by' in data:
            print(f"   Found 'cited_by' section with {len(data.get('cited_by', {}).get('table', []))} table entries.")
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to fetch author profile: {e}")
        return None

def fetch_all_articles():
    """Fetches ALL articles by paginating through the API results."""
    all_articles = []
    start = 0
    num = 20  # Results per page (API default)
    
    print("\nFetching ALL articles with pagination...")
    
    while True:
        params = {
            "engine": "google_scholar_author",
            "author_id": SCHOLAR_AUTHOR_ID,
            "api_key": SERPAPI_KEY,
            "hl": "en",
            "start": start,
            "num": num
        }
        try:
            response = requests.get(API_URL, params=params, timeout=45)
            response.raise_for_status()
            data = response.json()
            
            if data.get("error"):
                print(f"❌ API error on page start={start}: {data.get('error')}")
                break
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed for page start={start}: {e}")
            break
        
        # Extract articles from this page
        page_articles = data.get("articles", [])
        if not page_articles:
            print("   No more articles found.")
            break
        
        all_articles.extend(page_articles)
        print(f"   Page {start//num + 1}: +{len(page_articles)} articles (Total: {len(all_articles)})")
        
        # Stop if we got fewer articles than requested (last page)
        if len(page_articles) < num:
            print(f"   Last page detected (got {len(page_articles)}, requested {num}).")
            break
        
        # Prepare for next page
        start += num
        time.sleep(0.5)  # Polite delay to avoid rate limiting
    
    print(f"✅ Pagination complete. Total articles fetched: {len(all_articles)}\n")
    return all_articles

def extract_metrics_from_profile(author_profile_data):
    """Correctly extracts h-index and citation metrics from the author profile."""
    if not author_profile_data:
        print("❌ Cannot extract metrics: No author profile data.")
        return {"total_citations": 0, "h_index": 0}
    
    cited_by_table = author_profile_data.get("cited_by", {}).get("table", [])
    
    total_citations = 0
    h_index = 0
    
    print("Extracting metrics from profile...")
    for i, item in enumerate(cited_by_table):
        # The table is a list of dictionaries, each with ONE key
        if "citations" in item:
            total_citations = item.get("citations", {}).get("all", 0)
            print(f"   Total citations: {total_citations}")
        elif "indice_h" in item:  # This is the CORRECT key for h-index
            h_index = item.get("indice_h", {}).get("all", 0)
            print(f"   H-index: {h_index}")
        elif "h_index" in item:  # Backup check, though unlikely
            h_index = item.get("h_index", {}).get("all", 0)
            print(f"   H-index (alt): {h_index}")
    
    return {
        "total_citations": total_citations,
        "h_index": h_index
    }

def normalize_articles_for_website(all_articles_list):
    """Converts SerpApi article format to our website's JSON structure."""
    publications = []
    
    print("Normalizing article data for website...")
    for article in all_articles_list:
        cited_by_value = article.get("cited_by", {}).get("value")
        
        pub = {
            "title": article.get("title", "Untitled").strip(),
            "authors": article.get("authors", ""),
            "venue": article.get("publication", "").strip(),
            "year": str(article.get("year", "")),
            "cited_by": int(cited_by_value) if cited_by_value else 0,
            "link": article.get("link", "#"),
            "author_id": SCHOLAR_AUTHOR_ID
        }
        publications.append(pub)
    
    print(f"   Normalized {len(publications)} publications.")
    return publications

def save_data_files(publications, metrics, total_articles):
    """Saves the data to JSON files in the correct location."""
    # Prepare the final metrics object
    final_metrics = {
        "total_documents": total_articles,
        "total_citations": metrics.get("total_citations", 0),
        "h_index": metrics.get("h_index", 0),
        "author_id": SCHOLAR_AUTHOR_ID,
        "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
    }
    
    # Save publications
    pubs_path = os.path.join(OUTPUT_DIR, "serpapi.json")
    with open(pubs_path, 'w', encoding='utf-8') as f:
        json.dump(publications, f, indent=2, ensure_ascii=False)
    print(f"✅ Publications saved to: {pubs_path}")
    
    # Save metrics
    metrics_path = os.path.join(OUTPUT_DIR, "metrics.json")
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(final_metrics, f, indent=2)
    print(f"✅ Metrics saved to: {metrics_path}")
    
    # Show summary
    print(f"\n📊 DATA SUMMARY")
    print(f"   Total publications: {final_metrics['total_documents']}")
    print(f"   Total citations: {final_metrics['total_citations']}")
    print(f"   H-index: {final_metrics['h_index']}")
    
    return True

# ========== MAIN EXECUTION ==========

def main():
    print("\n" + "="*60)
    print("SERPAPI GOOGLE SCHOLAR DATA FETCHER")
    print("="*60)
    
    # 1. VALIDATE CONFIGURATION
    if not SERPAPI_KEY:
        print("❌ CRITICAL ERROR: SERPAPI_KEY is not set.")
        print("   For GitHub Actions: Set it as a repository secret.")
        print("   For local testing: Run 'export SERPAPI_KEY=your_key_here'")
        return
    
    print(f"✅ API Key configured. Author ID: {SCHOLAR_AUTHOR_ID}")
    
    # 2. FETCH AUTHOR PROFILE (for metrics)
    author_profile = fetch_author_profile()
    if not author_profile:
        print("❌ Cannot proceed without author profile.")
        return
    
    # 3. EXTRACT METRICS FROM PROFILE
    metrics = extract_metrics_from_profile(author_profile)
    
    # 4. FETCH ALL ARTICLES (with pagination)
    all_articles = fetch_all_articles()
    if not all_articles:
        print("❌ No articles fetched. Cannot create data files.")
        return
    
    # 5. NORMALIZE DATA FOR WEBSITE
    publications = normalize_articles_for_website(all_articles)
    
    # 6. SAVE FILES
    success = save_data_files(publications, metrics, len(all_articles))
    
    if success:
        print("\n" + "="*60)
        print("✅ FETCH COMPLETE!")
        print("   The JSON files are ready in 'data/serpapi/'.")
        print("   Commit and push these files to update your website.")
        print("="*60)
    else:
        print("\n❌ Failed to save data files.")

if __name__ == "__main__":
    main()
