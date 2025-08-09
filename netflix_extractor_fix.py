def extract_netflix_job(soup, url):
    """Extract job data from Netflix career pages."""
    
    try:
        job_data = {
            'source': 'Netflix',
            'url': url,
            'company': 'Netflix'
        }
        
        # Netflix uses Eightfold AI platform - look for specific selectors
        # Try to find job title in various locations
        title_selectors = [
            '[data-automation-id="jobTitle"]',
            '.job-title',
            'h1[data-automation-id="jobPostingHeader"]',
            'h1',
            '.posting-headline h2'
        ]
        
        title_elem = None
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem and title_elem.get_text().strip():
                break
        
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Try to find location
        location_selectors = [
            '[data-automation-id="jobPostingLocation"]',
            '.location',
            '.job-location',
            '[class*="location"]'
        ]
        
        location_elem = None
        for selector in location_selectors:
            location_elem = soup.select_one(selector)
            if location_elem and location_elem.get_text().strip():
                break
        
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Try to find job description
        desc_selectors = [
            '[data-automation-id="jobPostingDescription"]',
            '.job-description',
            '.posting-description',
            '.job-details',
            '[class*="description"]'
        ]
        
        desc_elem = None
        for selector in desc_selectors:
            desc_elem = soup.select_one(selector)
            if desc_elem and desc_elem.get_text().strip():
                break
        
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        # If we couldn't extract much, try to get any meaningful text
        if not job_data['job_title'] and not job_data['description']:
            # Look for any text that might be the job title
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            # Try to find a line that looks like a job title
            for line in lines[:20]:  # Check first 20 lines
                if any(keyword in line.lower() for keyword in ['engineer', 'manager', 'analyst', 'developer', 'specialist', 'director', 'lead']):
                    if len(line) < 100:  # Reasonable title length
                        job_data['job_title'] = line
                        break
        
        return job_data if job_data['job_title'] or job_data['description'] else None
        
    except Exception as e:
        print(f"Netflix extraction error: {str(e)}")
        return None

# Add this to the domain detection logic in extract_job_data function:
# elif 'netflix.net' in domain or 'netflix.com' in domain:
#     return extract_netflix_job(soup, normalized_url)
