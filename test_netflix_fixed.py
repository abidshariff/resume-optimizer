#!/usr/bin/env python3

import requests
from bs4 import BeautifulSoup
import re

def clean_text(text):
    """Clean and normalize extracted text."""
    if not text:
        return ''
    
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove common unwanted phrases
    unwanted_phrases = [
        'Apply now', 'Apply for this job', 'Save job', 'Share job',
        'Report job', 'Easy Apply', 'Quick Apply'
    ]
    
    for phrase in unwanted_phrases:
        text = text.replace(phrase, '')
    
    return text.strip()

def extract_netflix_job(soup, url):
    """Extract job data from Netflix career pages (Eightfold AI platform)."""
    
    try:
        job_data = {
            'source': 'Netflix',
            'url': url,
            'company': 'Netflix',
            'job_title': '',
            'location': '',
            'description': '',
            'employment_type': 'Full-time',
            'experience_level': 'Mid-Senior level'
        }
        
        # Method 1: Extract from page title (most reliable for Netflix)
        if soup.title:
            title_text = soup.title.string.strip()
            # Netflix titles are in format: "Job Title | Location | Netflix"
            if '|' in title_text and 'Netflix' in title_text:
                parts = [part.strip() for part in title_text.split('|')]
                if len(parts) >= 3:
                    job_data['job_title'] = parts[0]
                    job_data['location'] = parts[1]
        
        # Method 2: Look for structured data or meta tags
        if not job_data['job_title']:
            title_meta = soup.find('meta', {'property': 'og:title'}) or soup.find('meta', {'name': 'title'})
            if title_meta:
                job_data['job_title'] = clean_text(title_meta.get('content', ''))
        
        # Method 3: Look for common job title selectors
        if not job_data['job_title']:
            title_selectors = [
                '[data-automation-id="jobTitle"]',
                '.job-title',
                'h1[data-automation-id="jobPostingHeader"]',
                'h1',
                '.posting-headline h2',
                '.job-header h1',
                '.position-title'
            ]
            
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem and title_elem.get_text().strip():
                    job_data['job_title'] = clean_text(title_elem.get_text())
                    break
        
        # Method 4: Parse from page text if structured extraction fails
        if not job_data['job_title']:
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            # Look for lines that contain job-related keywords
            job_keywords = ['engineer', 'manager', 'analyst', 'developer', 'specialist', 'director', 'lead', 'coordinator', 'architect']
            for line in lines[:30]:  # Check first 30 lines
                if any(keyword in line.lower() for keyword in job_keywords):
                    if 10 < len(line) < 100:  # Reasonable title length
                        job_data['job_title'] = line
                        break
        
        # Try to find location if not already found
        if not job_data['location']:
            location_selectors = [
                '[data-automation-id="jobPostingLocation"]',
                '.location',
                '.job-location',
                '[class*="location"]',
                '.posting-location'
            ]
            
            for selector in location_selectors:
                location_elem = soup.select_one(selector)
                if location_elem and location_elem.get_text().strip():
                    job_data['location'] = clean_text(location_elem.get_text())
                    break
        
        # Try to find job description
        desc_selectors = [
            '[data-automation-id="jobPostingDescription"]',
            '.job-description',
            '.posting-description',
            '.job-details',
            '[class*="description"]',
            '.job-content'
        ]
        
        for selector in desc_selectors:
            desc_elem = soup.select_one(selector)
            if desc_elem and desc_elem.get_text().strip():
                job_data['description'] = clean_text(desc_elem.get_text())
                break
        
        # If description is still empty, try to get meaningful content
        if not job_data['description']:
            # Look for any substantial text blocks
            text_blocks = soup.find_all(['p', 'div'], string=True)
            combined_text = []
            for block in text_blocks:
                text = clean_text(block.get_text())
                if len(text) > 50:  # Only substantial text blocks
                    combined_text.append(text)
            
            if combined_text:
                job_data['description'] = ' '.join(combined_text[:5])  # First 5 substantial blocks
        
        # If still no description, create a basic one from the title
        if not job_data['description'] and job_data['job_title']:
            job_data['description'] = f"Netflix is seeking a {job_data['job_title']} to join our team. This is an exciting opportunity to work at one of the world's leading streaming entertainment companies."
        
        print(f"Netflix extraction result: Title='{job_data['job_title']}', Location='{job_data['location']}', Description length={len(job_data['description'])}")
        
        return job_data if job_data['job_title'] else None
        
    except Exception as e:
        print(f"Netflix extraction error: {str(e)}")
        return None

def test_netflix_url():
    """Test Netflix URL extraction."""
    
    url = "https://explore.jobs.netflix.net/careers/job/790302425499?microsite=netflix.com&utm_source=LinkedIn&domain=netflix.com"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        print(f"Testing Netflix URL: {url}")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        print(f"Response status: {response.status_code}")
        print(f"Content length: {len(response.content)}")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Test extraction
        result = extract_netflix_job(soup, url)
        
        if result:
            print("\n✅ Extraction successful!")
            print(f"Job Title: {result['job_title']}")
            print(f"Company: {result['company']}")
            print(f"Location: {result['location']}")
            print(f"Employment Type: {result['employment_type']}")
            print(f"Experience Level: {result['experience_level']}")
            print(f"Description: {result['description'][:200]}..." if len(result['description']) > 200 else f"Description: {result['description']}")
        else:
            print("\n❌ Extraction failed - no data returned")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_netflix_url()
