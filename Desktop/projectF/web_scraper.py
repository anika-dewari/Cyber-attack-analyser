from bs4 import BeautifulSoup

def scrape_extra_cve_info(cve_id):

url = f"https://www.cvedetails.com/cve/{cve_id}/"

headers = {

    "User-Agent": "Mozilla/5.0"

}



try:

    response = requests.get(url, headers=headers)

    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')



    # Try to find description text using meta tags and other common divs

    summary_div = soup.find('meta', {'name': 'description'})

    if summary_div:

        return summary_div.get('content').strip()



    # Search for any text that looks like a CVE description

    paragraphs = soup.find_all('p')

    for para in paragraphs:

        if 'Description' in para.text:  # Look for "Description" in the text

            return para.text.strip()



    return f"❌ No summary found for {cve_id}"



except Exception as e:

    return f"⚠ Error while scraping: {e}"

