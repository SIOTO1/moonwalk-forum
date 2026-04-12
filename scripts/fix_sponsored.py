import requests
import json

SUPABASE_URL = "https://ulztqglgbzhzqpaaekki.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsenRxZ2xnYnpoenFwYWFla2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDcxNDgsImV4cCI6MjA4MzcyMzE0OH0.TrF-1de85fuGASKrW4bH9k2FpDRiQHVBFxZBFxvyMLg"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

campaign_id = "0452153d-515c-4652-a6b5-1dc3aac19a76"

# First, let's see the full ad_campaigns record
print("=== Getting ad_campaign details ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/ad_campaigns?id=eq.{campaign_id}&select=*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} campaigns:")
    for c in data:
        print(json.dumps(c, indent=2))

# The RPC function returned data with 'content' field, but it might be joining
# with another table. Let's check ad_sponsored_posts or similar
print("\n=== Checking ad_sponsored_posts table ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/ad_sponsored_posts?select=*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} ad_sponsored_posts:")
    for p in data:
        print(json.dumps(p, indent=2))
elif resp.status_code == 404:
    print("Table not found")
else:
    print(f"Response: {resp.text[:300]}")

# Let's also try campaign_sponsored_posts
print("\n=== Checking campaign_sponsored_posts table ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/campaign_sponsored_posts?select=*",
    headers=headers
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Found {len(data)} campaign_sponsored_posts:")
    for p in data:
        print(json.dumps(p, indent=2))
else:
    print(f"Response: {resp.text[:300]}")
