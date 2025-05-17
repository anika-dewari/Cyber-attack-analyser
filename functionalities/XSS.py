import requests
from bs4 import BeautifulSoup

# Payload to test XSS
XSS_PAYLOAD = "<script>alert('XSS')</script>"

def check_xss(url):
    try:
        # Inject XSS payload in query parameter
        test_url = f"{url}?q={XSS_PAYLOAD}"

        # Send GET request
        response = requests.get(test_url, timeout=5)

        # Parse response HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # Check if our payload is reflected in the response
        if XSS_PAYLOAD in response.text:
            print(f"[!] Possible XSS vulnerability found at: {test_url}")
        else:
            print(f"[+] No XSS vulnerability detected at: {test_url}")
    
    except requests.exceptions.RequestException as e:
        print(f"[Error] Could not connect to the site: {e}")

if __name__ == "__main__":
    url = input("Enter the website URL (e.g., http://example.com/search): ").strip()
    check_xss(url)
