#!/usr/bin/env python3
"""
Detailed test script to analyze the Mastercard job page structure
"""

import requests
from bs4 import BeautifulSoup
import sys
import os

# Add the lambda function directory to the path
sys.path.append('backend/lambda-functions/job-url-extractor')

def analyze_mastercard_page():
    """Analyze the structure of the Mastercard job page"""
    
    url = "https://careers.mastercard.com/us/en/job/MASRUSR252285EXTERNALENUS/Manager-Data-Engineering?utm_source=linkedin&utm_medium=phenom-feeds&source=LINKEDIN"
    
    print(f"🔍 Analyzing Mastercard job page: {url}")
    print("=" * 80)
    
    try:
        # Set up headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Make request
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        print(f"✅ Successfully fetched page (Status: {response.status_code})")
        print(f"📄 Content length: {len(response.content)} bytes")
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Analyze page title
        title_tag = soup.find('title')
        print(f"\n🏷️  Page Title: {title_tag.get_text() if title_tag else 'Not found'}")
        
        # Look for various job title selectors
        print("\n🔍 Searching for job title elements:")
        title_selectors = [
            'h1',
            '.job-title',
            '.title',
            '[class*="title"]',
            '[data-automation-id="jobPostingHeader"]',
            '[data-automation-id="jobTitle"]',
            '.jobPostingHeader',
            '.job-header h1',
            'h1[data-automation-id]'
        ]
        
        for selector in title_selectors:
            elements = soup.select(selector)
            if elements:
                print(f"   ✅ {selector}: Found {len(elements)} element(s)")
                for i, elem in enumerate(elements[:3]):  # Show first 3
                    text = elem.get_text().strip()[:100]
                    print(f"      [{i+1}] {text}")
            else:
                print(f"   ❌ {selector}: Not found")
        
        # Look for location elements
        print("\n🌍 Searching for location elements:")
        location_selectors = [
            '.location',
            '[class*="location"]',
            '[data-automation-id="jobPostingLocation"]',
            '.job-location',
            '[class*="city"]'
        ]
        
        for selector in location_selectors:
            elements = soup.select(selector)
            if elements:
                print(f"   ✅ {selector}: Found {len(elements)} element(s)")
                for i, elem in enumerate(elements[:3]):
                    text = elem.get_text().strip()[:100]
                    print(f"      [{i+1}] {text}")
            else:
                print(f"   ❌ {selector}: Not found")
        
        # Look for job description
        print("\n📝 Searching for job description:")
        desc_selectors = [
            '.job-description',
            '.description',
            '.content',
            'main',
            'article',
            '[data-automation-id="jobPostingDescription"]'
        ]
        
        for selector in desc_selectors:
            elements = soup.select(selector)
            if elements:
                print(f"   ✅ {selector}: Found {len(elements)} element(s)")
                for i, elem in enumerate(elements[:2]):
                    text = elem.get_text().strip()[:200]
                    print(f"      [{i+1}] {text}...")
            else:
                print(f"   ❌ {selector}: Not found")
        
        # Check if this is a dynamic page (JavaScript-heavy)
        scripts = soup.find_all('script')
        print(f"\n⚡ Found {len(scripts)} script tags (may indicate dynamic content)")
        
        # Look for data attributes that might contain job info
        print("\n🔍 Searching for data attributes:")
        elements_with_data = soup.find_all(attrs={"data-automation-id": True})
        if elements_with_data:
            print(f"   Found {len(elements_with_data)} elements with data-automation-id:")
            for elem in elements_with_data[:10]:  # Show first 10
                automation_id = elem.get('data-automation-id')
                text = elem.get_text().strip()[:50]
                print(f"      {automation_id}: {text}")
        
        # Save a sample of the HTML for manual inspection
        with open('mastercard_page_sample.html', 'w', encoding='utf-8') as f:
            f.write(str(soup.prettify())[:10000])  # First 10k characters
        print(f"\n💾 Saved page sample to 'mastercard_page_sample.html'")
        
    except Exception as e:
        print(f"❌ Error analyzing page: {str(e)}")

if __name__ == "__main__":
    analyze_mastercard_page()
