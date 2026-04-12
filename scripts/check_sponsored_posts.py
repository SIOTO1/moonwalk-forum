import requests
import json

SUPABASE_URL = "https://ulztqglgbzhzqpaaekki.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenRxZ2xnYnpoenFwYWFla2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDcxNDgsImV4cCI6MjA4MzcyMzE0OH0.TrF-1de85fuGASKrW4bH9k2FpDRiQHVBFxZBFxvyMLg"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Check sponsored_posts table
print("=== Checking sponsored_posts table ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/sponsored_posts?select=*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} sponsored posts:")
    for post in data:
        print(json.dumps(post, indent=2))
else:
    print(f"Error: {resp.text}")

# Check ad_campaigns table
print("\n=== Checking ad_campaigns table ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/ad_campaigns?select=*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} ad campaigns:")
    for campaign in data:
        print(json.dumps(campaign, indent=2))
else:
    print(f"Error: {resp.text}")
