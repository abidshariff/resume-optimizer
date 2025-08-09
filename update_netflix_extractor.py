#!/usr/bin/env python3

"""
Script to update the job URL extractor to handle Netflix URLs properly.
"""

import os
import re

def update_job_extractor():
    """Update the job URL extractor to handle Netflix URLs."""
    
    extractor_path = "/Volumes/workplace/resume-optimizer/backend/lambda-functions/job-url-extractor/index.py"
    
    # Read the current file
    with open(extractor_path, 'r') as f:
        content = f.read()
    
    # Add Netflix extraction function
    netflix_function = '''
def extract_netflix_job(soup, url):
    """Extract job data from Netflix career pages (Eightfold AI platform)."""
    
    try:
        job_data = {
            'source': 'Netflix',
            'url': url,
            'company': 'Netflix'
        }
        
        # Netflix uses Eightfold AI platform - try multiple approaches
        
        # Method 1: Look for structured data or meta tags
        title_meta = soup.find('meta', {'property': 'og:title'}) or soup.find('meta', {'name': 'title'})
        if title_meta:
            job_data['job_title'] = clean_text(title_meta.get('content', ''))
        
        # Method 2: Look for common job title selectors
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
        
        # Method 3: Parse from page text if structured extraction fails
        if not job_data['job_title']:
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\\n') if line.strip()]
            
            # Look for lines that contain job-related keywords
            job_keywords = ['engineer', 'manager', 'analyst', 'developer', 'specialist', 'director', 'lead', 'coordinator', 'architect']
            for line in lines[:30]:  # Check first 30 lines
                if any(keyword in line.lower() for keyword in job_keywords):
                    if 10 < len(line) < 100:  # Reasonable title length
                        job_data['job_title'] = line
                        break
        
        # Try to find location
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
        
        # Set employment type and experience level if available
        job_data['employment_type'] = 'Full-time'  # Default for Netflix
        job_data['experience_level'] = 'Mid-Senior level'  # Default assumption
        
        print(f"Netflix extraction result: Title='{job_data['job_title']}', Location='{job_data['location']}', Description length={len(job_data['description'])}")
        
        return job_data if job_data['job_title'] or job_data['description'] else None
        
    except Exception as e:
        print(f"Netflix extraction error: {str(e)}")
        return None
'''
    
    # Add the Netflix function before the last function
    insertion_point = content.rfind('def clean_text(')
    if insertion_point == -1:
        print("Could not find insertion point")
        return False
    
    updated_content = content[:insertion_point] + netflix_function + '\n\n' + content[insertion_point:]
    
    # Update the domain detection logic
    domain_detection = '''        elif 'glassdoor.com' in domain:
            return extract_glassdoor_job(soup, normalized_url)
        elif 'careers.mastercard.com' in domain:
            return extract_mastercard_job(soup, normalized_url)
        elif 'jobs.lever.co' in domain:
            return extract_lever_job(soup, normalized_url)
        elif 'greenhouse.io' in domain:
            return extract_greenhouse_job(soup, normalized_url)
        elif 'netflix.net' in domain or 'netflix.com' in domain:
            return extract_netflix_job(soup, normalized_url)
        else:
            # Generic extraction for company career pages
            return extract_generic_job(soup, normalized_url)'''
    
    old_domain_detection = '''        elif 'glassdoor.com' in domain:
            return extract_glassdoor_job(soup, normalized_url)
        elif 'careers.mastercard.com' in domain:
            return extract_mastercard_job(soup, normalized_url)
        elif 'jobs.lever.co' in domain:
            return extract_lever_job(soup, normalized_url)
        elif 'greenhouse.io' in domain:
            return extract_greenhouse_job(soup, normalized_url)
        else:
            # Generic extraction for company career pages
            return extract_generic_job(soup, normalized_url)'''
    
    updated_content = updated_content.replace(old_domain_detection, domain_detection)
    
    # Write the updated content
    with open(extractor_path, 'w') as f:
        f.write(updated_content)
    
    print("✅ Updated job URL extractor with Netflix support")
    return True

if __name__ == "__main__":
    update_job_extractor()
