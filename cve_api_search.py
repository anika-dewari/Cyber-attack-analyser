import requests

def search_vulnerabilities(query):
    print(f"\n🔍 Searching vulnerabilities for: {query}")
    api_url = f"https://vulners.com/api/v3/search/lucene/?query=type:cve AND {query}"

    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()

        if data.get("result") != "OK":
            print("❌ API did not return OK result.")
            return []

        results = []
        for item in data.get("data", {}).get("search", []):
            source = item.get("_source", {})
            cve_ids = source.get("cvelist", [])
            if not cve_ids:
                continue

            cve_id = cve_ids[0]
            title = source.get("title", "No title found")
            cvss = source.get("cvss", "N/A")

            results.append({
                "id": cve_id,
                "title": title,
                "cvss": cvss
            })

        return results

    except Exception as e:
        print(f"❌ API Error: {e}")
        return []
