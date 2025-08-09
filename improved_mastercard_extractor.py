#!/usr/bin/env python3
"""
Improved Mastercard job extractor that handles their specific page structure
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def extract_mastercard_job_improved(url):
    """
    Improved extraction for Mastercard careers page using multiple strategies
    """
    
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
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        job_data = {
            'source': 'Mastercard Careers',
            'url': url,
            'company': 'Mastercard',
            'employment_type': 'Full-time',
            'industry': 'Financial Services - Payments Technology',
            'company_size': 'Large Enterprise (10,000+ employees)',
            'company_type': 'Public Company'
        }
        
        # Strategy 1: Extract from JSON-LD structured data
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if data.get('@type') == 'JobPosting':
                    # Extract job title
                    if 'title' in data:
                        job_data['job_title'] = data['title']
                    
                    # Extract location
                    if 'jobLocation' in data:
                        location_data = data['jobLocation']
                        if isinstance(location_data, dict) and 'address' in location_data:
                            address = location_data['address']
                            location_parts = []
                            if 'addressLocality' in address:
                                location_parts.append(address['addressLocality'])
                            if 'addressRegion' in address:
                                location_parts.append(address['addressRegion'])
                            if 'addressCountry' in address:
                                location_parts.append(address['addressCountry'])
                            job_data['location'] = ', '.join(location_parts)
                    
                    # Extract description
                    if 'description' in data:
                        # Clean HTML from description
                        desc_html = data['description']
                        desc_soup = BeautifulSoup(desc_html, 'html.parser')
                        job_data['description'] = desc_soup.get_text().strip()
                    
                    # Extract employment type
                    if 'employmentType' in data:
                        emp_types = data['employmentType']
                        if isinstance(emp_types, list) and emp_types:
                            job_data['employment_type'] = emp_types[0].replace('_', '-').title()
                    
                    break
            except (json.JSONDecodeError, KeyError) as e:
                continue
        
        # Strategy 2: Extract from meta tags if JSON-LD didn't work
        if not job_data.get('job_title'):
            # Try page title
            title_tag = soup.find('title')
            if title_tag:
                title_text = title_tag.get_text()
                # Parse title like "Manager, Data Engineering in O Fallon, United States of America, 63368-7263 | R-252285 | Other Jobs at Mastercard"
                if ' in ' in title_text and ' | ' in title_text:
                    parts = title_text.split(' | ')
                    if len(parts) >= 2:
                        job_location_part = parts[0]  # "Manager, Data Engineering in O Fallon, United States of America, 63368-7263"
                        if ' in ' in job_location_part:
                            job_title, location = job_location_part.split(' in ', 1)
                            job_data['job_title'] = job_title.strip()
                            job_data['location'] = location.strip()
        
        # Strategy 3: Extract from Twitter/OG meta tags
        if not job_data.get('job_title'):
            twitter_title = soup.find('meta', {'name': 'twitter:title'})
            if twitter_title:
                title_content = twitter_title.get('content', '')
                if ' in ' in title_content:
                    job_title = title_content.split(' in ')[0]
                    job_data['job_title'] = job_title.strip()
        
        if not job_data.get('description'):
            twitter_desc = soup.find('meta', {'name': 'twitter:description'})
            if twitter_desc:
                job_data['description'] = twitter_desc.get('content', '').strip()
        
        # Strategy 4: Extract from page content
        if not job_data.get('description'):
            desc_elem = soup.find('div', class_='description') or soup.find('div', class_='content')
            if desc_elem:
                job_data['description'] = desc_elem.get_text().strip()
        
        # Extract job ID from URL
        job_id_match = re.search(r'/job/([^/]+)/', url)
        if job_id_match:
            job_data['job_id'] = job_id_match.group(1)
        
        return job_data
        
    except Exception as e:
        print(f"Improved Mastercard extraction error: {str(e)}")
        return None

def test_improved_extraction():
    """Test the improved extraction"""
    
    url = "https://careers.mastercard.com/us/en/job/MASRUSR252285EXTERNALENUS/Manager-Data-Engineering?utm_source=linkedin&utm_medium=phenom-feeds&source=LINKEDIN"
    
    print("🚀 Testing Improved Mastercard Job Extraction")
    print("=" * 80)
    print(f"🔗 URL: {url}")
    print("-" * 80)
    
    result = extract_mastercard_job_improved(url)
    
    if result:
        print("✅ Extraction successful!")
        print()
        for key, value in result.items():
            if key == 'description':
                # Show truncated description
                desc_preview = value[:300] + "..." if len(value) > 300 else value
                print(f"📝 {key.replace('_', ' ').title()}: {desc_preview}")
            else:
                print(f"📋 {key.replace('_', ' ').title()}: {value}")
        
        print("\n" + "=" * 80)
        print("✅ Test completed successfully!")
        
        # Show key technical skills mentioned
        if result.get('description'):
            desc = result['description'].lower()
            tech_skills = []
            skills_to_check = ['spark', 'scala', 'python', 'hadoop', 'nifi', 'oracle', 'netezza', 'data warehouse', 'data pipeline']
            for skill in skills_to_check:
                if skill in desc:
                    tech_skills.append(skill.title())
            
            if tech_skills:
                print(f"🛠️  Key Technical Skills Mentioned: {', '.join(tech_skills)}")
    else:
        print("❌ Extraction failed")

if __name__ == "__main__":
    test_improved_extraction()
