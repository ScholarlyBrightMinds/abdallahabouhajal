def fetch_all_articles():
    """Fetches ALL articles by paginating through the API results."""
    all_articles = []
    start = 0
    num = 20  # Results per page (max is 100, but 20 is the API's default and most reliable)
    
    print("Fetching articles with pagination...")
    
    while True:
        params = {
            "engine": "google_scholar_author",
            "author_id": SCHOLAR_AUTHOR_ID,
            "api_key": SERPAPI_KEY,
            "hl": "en",
            "start": start,  # Pagination parameter
            "num": num       # Results per page
        }
        try:
            response = requests.get(API_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            # Check for API errors
            if data.get("error"):
                print(f"API error on page start={start}: {data.get('error')}")
                break
        except requests.exceptions.RequestException as e:
            print(f"Request failed for page start={start}: {e}")
            break
        
        # Extract articles from this page
        page_articles = data.get("articles", [])
        if not page_articles:
            break  # No more articles
        
        all_articles.extend(page_articles)
        print(f"  Retrieved page with {len(page_articles)} articles (total: {len(all_articles)})...")
        
        # Check if we've gotten all articles. If page has less than 'num' items, it's the last page.
        if len(page_articles) < num:
            break
        
        # Prepare for next page
        start += num
        time.sleep(0.5)  # Brief pause to be nice to the API
    
    print(f"Finished pagination. Total articles fetched: {len(all_articles)}")
    return all_articles

def normalize_author_data(raw_data, all_articles_list):
    """Converts the SerpApi author response and the full articles list to our website's format."""
    if not raw_data:
        return [], {}
    
    publications = []
    
    # 1. Normalize ALL publications from the paginated list
    for article in all_articles_list:
        cited_by_value = article.get("cited_by", {}).get("value")
        
        pub = {
            "title": article.get("title", ""),
            "authors": article.get("authors", ""),
            "venue": article.get("publication", ""),  # This is the journal name
            "year": article.get("year", ""),
            "cited_by": int(cited_by_value) if cited_by_value else 0,
            "link": article.get("link", "#"),
            "author_id": SCHOLAR_AUTHOR_ID
        }
        publications.append(pub)
    
    # 2. Correctly extract METRICS from the "cited_by" -> "table" key [citation:4]
    cited_by_table = raw_data.get("cited_by", {}).get("table", [])
    
    total_citations = 0
    h_index = 0
    
    # Loop through the table to find the specific objects
    for item in cited_by_table:
        # The structure is: [ {"citations": {"all": X}}, {"indice_h": {"all": Y}} ]
        if "citations" in item:
            total_citations = item.get("citations", {}).get("all", 0)
        if "indice_h" in item:  # This is the key for h-index [citation:4]
            h_index = item.get("indice_h", {}).get("all", 0)
    
    metrics = {
        "total_documents": len(all_articles_list),  # Use the full count
        "total_citations": total_citations,
        "h_index": h_index,  # This should now be correct
        "author_id": SCHOLAR_AUTHOR_ID,
        "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
    }
    
    return publications, metrics

def main():
    print("=== Starting Enhanced SerpApi Author Data Fetch (with Pagination) ===")
    
    # Step 1: Fetch the main author profile (for metrics table)
    raw_data = fetch_author_data()
    
    if not raw_data:
        print("❌ Failed to fetch author profile data.")
        return
    
    # Step 2: Fetch ALL articles using pagination
    all_articles = fetch_all_articles()
    
    if not all_articles:
        print("❌ Failed to fetch any articles.")
        return
    
    # Step 3: Convert the data to our format
    publications, metrics = normalize_author_data(raw_data, all_articles)
    
    # Save data files (this part remains the same)...
    # ... [Keep the existing code for saving pubs_path and metrics_path] ...
