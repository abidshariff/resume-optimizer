import json
import boto3
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse, parse_qs
import time
import random

def lambda_handler(event, context):
    """
    Extract job information from job posting URLs.
    Supports major job boards and company career pages.
    Handles both API Gateway calls and direct Lambda invocations.
    """
    
    try:
        # Determine if this is an API Gateway call or direct Lambda invocation
        is_api_gateway_call = 'httpMethod' in event or 'requestContext' in event
        
        # Extract URL from event
        if is_api_gateway_call:
            # API Gateway call - parse from body
            if event.get('body'):
                body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
                job_url = body.get('jobUrl', '').strip()
            else:
                job_url = event.get('jobUrl', '').strip()
        else:
            # Direct Lambda invocation - get from event directly
            job_url = event.get('jobUrl', '').strip()
        
        print(f"Processing job URL: {job_url} (API Gateway: {is_api_gateway_call})")
        
        if not job_url:
            error_response = {'error': 'Job URL is required'}
            if is_api_gateway_call:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(error_response)
                }
            else:
                return error_response
        
        # Extract job information
        job_data = extract_job_data(job_url)
        
        if not job_data:
            error_response = {'error': 'Unable to extract job information from the provided URL'}
            if is_api_gateway_call:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                    'body': json.dumps(error_response)
                }
            else:
                return error_response
        
        # Return success response
        success_response = {
            'success': True,
            'data': job_data
        }
        
        if is_api_gateway_call:
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(success_response)
            }
        else:
            return success_response
        
    except Exception as e:
        print(f"Error processing job URL: {str(e)}")
        error_response = {'error': f'Internal server error: {str(e)}'}
        
        if is_api_gateway_call:
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(error_response)
            }
        else:
            return error_response

def normalize_job_url(url):
    """
    Convert various job URL formats to their canonical forms.
    """
    try:
        # Handle LinkedIn collections URLs
        if 'linkedin.com/jobs/collections' in url and 'currentJobId=' in url:
            # Extract job ID from currentJobId parameter
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(url)
            query_params = parse_qs(parsed.query)
            if 'currentJobId' in query_params:
                job_id = query_params['currentJobId'][0]
                # Convert to direct LinkedIn job URL
                return f"https://www.linkedin.com/jobs/view/{job_id}/"
        
        # Handle other LinkedIn URL variations
        if 'linkedin.com' in url and '/jobs/' in url:
            # Extract job ID from various LinkedIn URL formats
            import re
            job_id_match = re.search(r'/jobs/view/(\d+)', url)
            if not job_id_match:
                job_id_match = re.search(r'currentJobId=(\d+)', url)
            if job_id_match:
                job_id = job_id_match.group(1)
                return f"https://www.linkedin.com/jobs/view/{job_id}/"
        
        return url
    except Exception as e:
        print(f"Error normalizing URL: {str(e)}")
        return url

def extract_job_data(url):
    """
    Extract job data from various job posting URLs.
    """
    
    try:
        # Normalize the URL first
        normalized_url = normalize_job_url(url)
        print(f"Original URL: {url}")
        print(f"Normalized URL: {normalized_url}")
        
        # Add random delay to avoid rate limiting
        time.sleep(random.uniform(1, 3))
        
        # Set up headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Make request with timeout
        response = requests.get(normalized_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Log response details for debugging
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response content length: {len(response.content)}")
        print(f"Response content preview: {response.text[:500]}")
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Determine job board and extract accordingly
        domain = urlparse(normalized_url).netloc.lower()
        
        if 'linkedin.com' in domain:
            return extract_linkedin_job(soup, normalized_url)
        elif 'indeed.com' in domain:
            return extract_indeed_job(soup, normalized_url)
        elif 'glassdoor.com' in domain:
            return extract_glassdoor_job(soup, normalized_url)
        elif 'careers.mastercard.com' in domain:
            return extract_mastercard_job(soup, normalized_url)
        elif 'jobs.lever.co' in domain:
            return extract_lever_job(soup, normalized_url)
        elif 'greenhouse.io' in domain:
            return extract_greenhouse_job(soup, normalized_url)
        else:
            # Generic extraction for company career pages
            return extract_generic_job(soup, normalized_url)
            
    except requests.RequestException as e:
        print(f"Request error: {str(e)}")
        return None
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return None

def extract_linkedin_job(soup, url):
    """Extract job data from LinkedIn job postings."""
    
    try:
        # Check if we're getting a login page or authentication challenge
        if soup.find('form', {'name': 'login'}) or 'Sign in to LinkedIn' in soup.get_text():
            print("LinkedIn returned login page - authentication required")
            return None
            
        # Check for CAPTCHA or bot detection
        if 'captcha' in soup.get_text().lower() or 'unusual activity' in soup.get_text().lower():
            print("LinkedIn detected bot activity - CAPTCHA required")
            return None
        
        job_data = {
            'source': 'LinkedIn',
            'url': url
        }
        
        # Try multiple selectors for job title
        title_selectors = [
            'h1.top-card-layout__title',
            'h1.t-24.t-bold.inline',
            'h1[data-test-id="job-title"]',
            'h1.jobs-unified-top-card__job-title',
            'h1'
        ]
        
        title_elem = None
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                break
        
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Try multiple selectors for company name
        company_selectors = [
            'a.topcard__org-name-link',
            'span.topcard__flavor',
            'a[data-test-id="job-poster-name"]',
            '.jobs-unified-top-card__company-name a',
            '.jobs-unified-top-card__company-name'
        ]
        
        company_elem = None
        for selector in company_selectors:
            company_elem = soup.select_one(selector)
            if company_elem:
                break
        
        job_data['company'] = clean_text(company_elem.get_text()) if company_elem else ''
        
        # Try multiple selectors for location
        location_selectors = [
            'span.topcard__flavor.topcard__flavor--bullet',
            '.jobs-unified-top-card__bullet',
            '[data-test-id="job-location"]'
        ]
        
        location_elem = None
        for selector in location_selectors:
            location_elem = soup.select_one(selector)
            if location_elem:
                break
        
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Try multiple selectors for job description
        desc_selectors = [
            'div.show-more-less-html__markup',
            'div.description__text',
            '.jobs-box__html-content',
            '.jobs-description-content__text'
        ]
        
        desc_elem = None
        for selector in desc_selectors:
            desc_elem = soup.select_one(selector)
            if desc_elem:
                break
        
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        # Employment type
        employment_elem = soup.find('span', string=re.compile(r'Full-time|Part-time|Contract|Temporary'))
        job_data['employment_type'] = clean_text(employment_elem.get_text()) if employment_elem else 'Full-time'
        
        # Experience level
        exp_elem = soup.find('span', string=re.compile(r'Entry level|Associate|Mid-Senior level|Director|Executive'))
        job_data['experience_level'] = clean_text(exp_elem.get_text()) if exp_elem else ''
        
        # If we didn't get basic info, try JSON-LD structured data
        if not job_data['job_title'] or not job_data['company']:
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                try:
                    data = json.loads(script.string)
                    if data.get('@type') == 'JobPosting':
                        if not job_data['job_title'] and 'title' in data:
                            job_data['job_title'] = data['title']
                        if not job_data['company'] and 'hiringOrganization' in data:
                            org = data['hiringOrganization']
                            if isinstance(org, dict) and 'name' in org:
                                job_data['company'] = org['name']
                        if not job_data['description'] and 'description' in data:
                            job_data['description'] = clean_text(data['description'])
                        break
                except (json.JSONDecodeError, KeyError):
                    continue
        
        return job_data if job_data['job_title'] or job_data['company'] else None
        
    except Exception as e:
        print(f"LinkedIn extraction error: {str(e)}")
        return None

def extract_indeed_job(soup, url):
    """Extract job data from Indeed job postings."""
    
    try:
        job_data = {
            'source': 'Indeed',
            'url': url
        }
        
        # Job title
        title_elem = soup.find('h1', class_='jobsearch-JobInfoHeader-title') or soup.find('h1')
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Company name
        company_elem = soup.find('div', class_='jobsearch-InlineCompanyRating') or soup.find('span', class_='jobsearch-JobInfoHeader-subtitle-item')
        if company_elem:
            company_link = company_elem.find('a')
            job_data['company'] = clean_text(company_link.get_text()) if company_link else clean_text(company_elem.get_text())
        else:
            job_data['company'] = ''
        
        # Location
        location_elem = soup.find('div', {'data-testid': 'job-location'})
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Job description
        desc_elem = soup.find('div', class_='jobsearch-jobDescriptionText') or soup.find('div', id='jobDescriptionText')
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        # Salary (if available)
        salary_elem = soup.find('span', class_='jobsearch-JobMetadataHeader-item')
        job_data['salary'] = clean_text(salary_elem.get_text()) if salary_elem else ''
        
        return job_data
        
    except Exception as e:
        print(f"Indeed extraction error: {str(e)}")
        return None

def extract_glassdoor_job(soup, url):
    """Extract job data from Glassdoor job postings."""
    
    try:
        job_data = {
            'source': 'Glassdoor',
            'url': url
        }
        
        # Job title
        title_elem = soup.find('div', {'data-test': 'job-title'}) or soup.find('h1')
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Company name
        company_elem = soup.find('div', {'data-test': 'employer-name'})
        job_data['company'] = clean_text(company_elem.get_text()) if company_elem else ''
        
        # Location
        location_elem = soup.find('div', {'data-test': 'job-location'})
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Job description
        desc_elem = soup.find('div', {'data-test': 'jobDescriptionContent'})
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        # Salary
        salary_elem = soup.find('div', {'data-test': 'detailSalary'})
        job_data['salary'] = clean_text(salary_elem.get_text()) if salary_elem else ''
        
        return job_data
        
    except Exception as e:
        print(f"Glassdoor extraction error: {str(e)}")
        return None

def extract_mastercard_job(soup, url):
    """Extract job data from Mastercard careers page using multiple strategies."""
    
    try:
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
                    
                    # Extract job ID
                    if 'identifier' in data and isinstance(data['identifier'], dict):
                        job_data['job_id'] = data['identifier'].get('value', '')
                    
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
        
        # Strategy 4: Extract from page content (fallback)
        if not job_data.get('description'):
            desc_elem = soup.find('div', class_='description') or soup.find('div', class_='content')
            if desc_elem:
                job_data['description'] = clean_text(desc_elem.get_text())
        
        # Extract job ID from URL if not found in structured data
        if not job_data.get('job_id'):
            job_id_match = re.search(r'/job/([^/]+)/', url)
            if job_id_match:
                job_data['job_id'] = job_id_match.group(1)
        
        return job_data
        
    except Exception as e:
        print(f"Mastercard extraction error: {str(e)}")
        return None

def extract_lever_job(soup, url):
    """Extract job data from Lever-powered career pages."""
    
    try:
        job_data = {
            'source': 'Lever',
            'url': url
        }
        
        # Job title
        title_elem = soup.find('h2', class_='posting-headline') or soup.find('h1')
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Company name (extract from URL or page)
        company_match = re.search(r'jobs\.lever\.co/([^/]+)', url)
        job_data['company'] = company_match.group(1).replace('-', ' ').title() if company_match else ''
        
        # Location
        location_elem = soup.find('div', class_='posting-categories')
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Job description
        desc_elem = soup.find('div', class_='section-wrapper page-full-width')
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        return job_data
        
    except Exception as e:
        print(f"Lever extraction error: {str(e)}")
        return None

def extract_greenhouse_job(soup, url):
    """Extract job data from Greenhouse-powered career pages."""
    
    try:
        job_data = {
            'source': 'Greenhouse',
            'url': url
        }
        
        # Job title
        title_elem = soup.find('h1', class_='app-title') or soup.find('h1')
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Company name (usually in the page title or header)
        company_elem = soup.find('div', class_='company-name') or soup.find('title')
        if company_elem:
            company_text = clean_text(company_elem.get_text())
            # Extract company name from title like "Job Title - Company Name"
            if ' - ' in company_text:
                job_data['company'] = company_text.split(' - ')[-1]
            else:
                job_data['company'] = company_text
        else:
            job_data['company'] = ''
        
        # Location
        location_elem = soup.find('div', class_='location')
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Job description
        desc_elem = soup.find('div', id='content') or soup.find('div', class_='content')
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        return job_data
        
    except Exception as e:
        print(f"Greenhouse extraction error: {str(e)}")
        return None

def extract_generic_job(soup, url):
    """Generic extraction for company career pages."""
    
    try:
        job_data = {
            'source': 'Company Career Page',
            'url': url
        }
        
        # Try to extract company name from domain
        domain = urlparse(url).netloc
        company_name = domain.replace('www.', '').replace('careers.', '').split('.')[0]
        job_data['company'] = company_name.title()
        
        # Job title - try multiple selectors
        title_selectors = ['h1', '.job-title', '.title', '[class*="title"]', '[class*="job"]']
        title_elem = None
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                break
        
        job_data['job_title'] = clean_text(title_elem.get_text()) if title_elem else ''
        
        # Location - try multiple selectors
        location_selectors = ['.location', '[class*="location"]', '[class*="city"]']
        location_elem = None
        for selector in location_selectors:
            location_elem = soup.select_one(selector)
            if location_elem:
                break
        
        job_data['location'] = clean_text(location_elem.get_text()) if location_elem else ''
        
        # Job description - get main content
        desc_selectors = ['.job-description', '.description', '.content', 'main', 'article']
        desc_elem = None
        for selector in desc_selectors:
            desc_elem = soup.select_one(selector)
            if desc_elem:
                break
        
        job_data['description'] = clean_text(desc_elem.get_text()) if desc_elem else ''
        
        return job_data
        
    except Exception as e:
        print(f"Generic extraction error: {str(e)}")
        return None

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

def extract_keywords_from_description(description):
    """Extract technical keywords and skills from job description."""
    
    # Common technical keywords to look for
    tech_keywords = [
        # Programming Languages
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Scala', 'R',
        'SQL', 'NoSQL', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
        
        # Frameworks & Libraries
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
        'Laravel', 'Rails', 'ASP.NET', 'jQuery', 'Bootstrap',
        
        # Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
        'DynamoDB', 'Oracle', 'SQL Server', 'SQLite',
        
        # Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
        'Terraform', 'Ansible', 'Chef', 'Puppet',
        
        # Data & Analytics
        'Spark', 'Hadoop', 'Kafka', 'Airflow', 'Tableau', 'Power BI', 'Looker',
        'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        
        # Methodologies
        'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD'
    ]
    
    found_keywords = []
    description_lower = description.lower()
    
    for keyword in tech_keywords:
        if keyword.lower() in description_lower:
            found_keywords.append(keyword)
    
    return found_keywords
