import requests
import sys
import json
from urllib.parse import urlparse, quote

def extract_hostname(url):
    # Remove scheme if present
    if url.startswith(('http://', 'https://')):
        parsed = urlparse(url)
        return parsed.netloc
    return url

def search_vulnerabilities(query):
    # Extract hostname/IP from URL if present
    search_term = extract_hostname(query)
    
    # Using NVD API (National Vulnerability Database)
    # URL encode the search term to handle special characters
    encoded_term = quote(search_term)
    api_url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch={encoded_term}&resultsPerPage=5"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'apiKey': '3aa3c0c0-5e73-4df8-8090-09f9d079e1d1'  # NVD API key
    }

    try:
        response = requests.get(api_url, headers=headers, timeout=10)
        
        # Check if the response is successful
        if response.status_code == 404:
            return {
                "target": query,
                "search_term": search_term,
                "message": f"No vulnerabilities found for {search_term}",
                "vulnerabilities": []
            }
        
        response.raise_for_status()
        data = response.json()

        results = []
        if 'vulnerabilities' in data:
            for vuln in data['vulnerabilities']:
                cve = vuln.get('cve', {})
                results.append({
                    "id": cve.get('id', 'Unknown'),
                    "title": cve.get('descriptions', [{}])[0].get('value', 'No description available'),
                    "cvss": cve.get('metrics', {}).get('cvssMetricV31', [{}])[0].get('cvssData', {}).get('baseScore', 'N/A'),
                    "severity": cve.get('metrics', {}).get('cvssMetricV31', [{}])[0].get('cvssData', {}).get('baseSeverity', 'N/A'),
                    "published": cve.get('published', 'Unknown')
                })

        if not results:
            return {
                "target": query,
                "search_term": search_term,
                "message": f"No vulnerabilities found for {search_term}",
                "vulnerabilities": []
            }

        return {
            "target": query,
            "search_term": search_term,
            "vulnerabilities": results,
            "total_results": len(results)
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        if "404" in error_msg:
            return {
                "target": query,
                "search_term": search_term,
                "message": f"No vulnerabilities found for {search_term}",
                "vulnerabilities": []
            }
        return {
            "error": f"API request failed: {error_msg}",
            "target": query,
            "search_term": search_term
        }
    except json.JSONDecodeError as e:
        return {
            "error": f"Failed to parse API response: {str(e)}",
            "target": query,
            "search_term": search_term
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}",
            "target": query,
            "search_term": search_term
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide a search query"}))
        sys.exit(1)
    
    query = sys.argv[1]
    result = search_vulnerabilities(query)
    print(json.dumps(result, indent=2))
