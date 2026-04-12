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

# The RPC returned the data from a view or function that joins ad_campaigns + sponsored_posts
# The sponsored_posts table returned empty, so the data is likely in ad_campaigns table
# Let's check the ad_campaigns table more carefully

campaign_id = "0452153d-515c-4652-a6b5-1dc3aac19a76"
sponsored_post_id = "ba901c66-f8c9-4444-9c59-9c10cb8d6295"

# Try updating the ad_campaign
print("=== Trying to update ad_campaign ===")
resp = requests.patch(
    f"{SUPABASE_URL}/rest/v1/ad_campaigns?id=eq.{campaign_id}",
    headers=headers,
    json={
        "title": "Advertise on Moonwalk Forum",
        "content": "Reach thousands of party rental professionals. Promote your products and services to the industry's most engaged community.",
        "sponsor_name": "Moonwalk Forum Ads",
    }
)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:500]}")

# Try updating sponsored_posts table with the ID from the RPC
print("\n=== Trying to update sponsored_post directly ===")
resp = requests.patch(
    f"{SUPABASE_URL}/rest/v1/sponsored_posts?id=eq.{sponsored_post_id}",
    headers=headers,
    json={
        "title": "Advertise on Moonwalk Forum",
        "content": "Reach thousands of party rental professionals. Promote your products and services to the industry's most engaged community.",
        "sponsor_name": "Moonwalk Forum Ads",
        "cta_text": "Learn More",
        "cta_url": "/vendor",
        "tags": ["advertising", "party-rentals", "industry"],
    }
)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:500]}")

# Let's also check what tables exist
print("\n=== Listing all tables ===")
resp = requests.get(
    f"{SUPABASE_URL}/rest/v1/",
    headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
)
print(f"Status: {resp.status_code}")
# The response for the root endpoint might show available tables
if resp.status_code == 200:
    print(f"Response type: {type(resp.json())}")
    if isinstance(resp.json(), dict):
        print(f"Tables: {list(resp.json().keys())[:20]}")
    else:
        print(f"Response: {resp.text[:500]}")
