import requests

def check_clickjacking(url):
    try:
        response = requests.get(url, timeout=5)
        headers = response.headers

        print(f"\n🔍 Checking: {url}")

        if 'X-Frame-Options' not in headers:
            print("⚠️ Missing X-Frame-Options → Vulnerable to Clickjacking")
        else:
            print(f"✅ X-Frame-Options: {headers['X-Frame-Options']}")

        if 'Content-Security-Policy' not in headers:
            print("⚠️ Missing Content-Security-Policy → Frame control not enforced")
        else:
            print(f"✅ CSP: {headers['Content-Security-Policy']}")
    except Exception as e:
        print(f"❌ Failed to check {url}: {e}")

# Take user input
user_url = input("🔎 Enter URL to check for Clickjacking: ")
check_clickjacking(user_url)
