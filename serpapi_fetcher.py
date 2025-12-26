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
    """Converts the SerpApi author response to our website's format. WITH DEBUGGING."""
    if not raw_data:
        print("❌ DEBUG: No raw_data received.")
        return [], {}
    
    # 1. DEBUG: Let's see the top-level keys of the raw data
    print(f"✅ DEBUG: Top keys in raw_data: {list(raw_data.keys())}")
    
    # 2. DEBUG: Specifically check for the 'cited_by' section
    if 'cited_by' in raw_data:
        print(f"✅ DEBUG: 'cited_by' key found.")
        cited_by_data = raw_data.get('cited_by', {})
        print(f"✅ DEBUG: Keys inside 'cited_by': {list(cited_by_data.keys())}")
        
        if 'table' in cited_by_data:
            table_data = cited_by_data.get('table', [])
            print(f"✅ DEBUG: 'table' is a list with {len(table_data)} item(s).")
            # Print the entire table structure to understand it
            for i, item in enumerate(table_data):
                print(f"   Item {i}: {item}")
    else:
        print("❌ DEBUG: 'cited_by' key is MISSING from the API response.")
    
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
    
    # 2. CORRECTLY extract METRICS from the "cited_by" -> "table" key 
    # The structure is critical. Based on the documentation, we expect something like:
    # "cited_by": {
    #   "table": [
    #     {"citations": {"all": 21934, "recent": 12302}},
    #     {"indice_h": {"all": 45, "recent": 36}},      # <-- This is the h-index[citation:1]
    #     {"indice_i10": {"all": 59, "recent": 51}}
    #   ]
    # }
    
    cited_by_table = raw_data.get("cited_by", {}).get("table", [])
    
    total_citations = 0
    h_index = 0
    
    # Loop through the table to find the specific objects
    for item in cited_by_table:
        if "citations" in item:
            total_citations = item.get("citations", {}).get("all", 0)
            print(f"✅ DEBUG: Found total_citations = {total_citations}")
        if "indice_h" in item:  # This is the correct key for h-index[citation:1]
            h_index = item.get("indice_h", {}).get("all", 0)
            print(f"✅ DEBUG: Found h_index = {h_index}")
    
    metrics = {
        "total_documents": len(all_articles_list),  # Use the full count from pagination
        "total_citations": total_citations,
        "h_index": h_index,  # This should now be correct if the data path is right
        "author_id": SCHOLAR_AUTHOR_ID,
        "last_updated": datetime.now(timezone.utc).isoformat() + "Z"
    }
    
    print(f"✅ DEBUG: Final metrics to be saved: {metrics}")
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


