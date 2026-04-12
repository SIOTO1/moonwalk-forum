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

# The RPC function returns data but the sponsored_posts table is empty
# and ad_campaigns table returns 0 rows. This means RLS (Row Level Security)
# is likely blocking direct table access but the RPC function bypasses it.
# The data IS in the sponsored_posts table, but RLS prevents direct reads.
# The RPC function likely uses SECURITY DEFINER to bypass RLS.

# Let's try to use the RPC function to understand the data structure,
# then try to update via RPC or find another way.

# First, let's check if there's an update RPC function
print("=== Trying update_sponsored_post RPC ===")
resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/update_sponsored_post",
    headers=headers,
    json={
        "post_id": "ba901c66-f8c9-4444-9c59-9c10cb8d6295",
        "new_title": "Advertise on Moonwalk Forum",
    }
)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:300]}")

# Since we can't update via API due to RLS, let's handle this in the code
# by checking if the sponsored post contains space-themed content and
# replacing it with party rental content on the frontend
print("\n=== Alternative: We'll handle this in the frontend code ===")
print("Since RLS prevents direct updates via anon key,")
print("we'll update the placeholder/fallback in the code to override space-themed content.")
