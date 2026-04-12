import requests
import json

SUPABASE_URL = "https://ulztqglgbzhzqpaaekki.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenRxZ2xnYnpoenFwYWFla2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDcxNDgsImV4cCI6MjA4MzcyMzE0OH0.TrF-1de85fuGASKrW4bH9k2FpDRiQHVBFxZBFxvyMLg"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Call the RPC function
print("=== Calling get_sponsored_post_for_category RPC ===")
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/get_sponsored_post_for_category",
    headers=headers,
    json={"_category_id": None}
)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2) if resp.status_code == 200 else resp.text}")

# Also check if there's a seed data in the database
# Check all tables to find where the ToolMaster data might be
print("\n=== Checking posts table for ToolMaster ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/posts?select=*&title=ilike.*ToolMaster*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} posts matching ToolMaster")
    for post in data:
        print(json.dumps(post, indent=2))
else:
    print(f"Error: {resp.text}")

# Check all sponsored_posts with different approach
print("\n=== Checking all sponsored_posts (no filter) ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/sponsored_posts",
    headers={**headers, "Prefer": "count=exact"}
)
print(f"Status: {resp.status_code}")
print(f"Content-Range: {resp.headers.get('content-range', 'N/A')}")
print(f"Response: {resp.text[:500]}")
