"""
Resume Optimization Prompt Template

This file contains the AI prompt template used for resume optimization.
Based on the proven methodology from the GitHub repository.
Edit this file to modify the AI's behavior and instructions.
"""

import re

def analyze_role_seniority_and_type(job_title):
    """Analyze the job title to determine seniority level and role type for appropriate action verbs."""
    job_title_lower = job_title.lower()
    
    # Determine seniority level
    seniority_level = "mid"  # default
    if any(term in job_title_lower for term in ['senior', 'sr.', 'lead', 'principal', 'staff', 'architect']):
        seniority_level = "senior"
    elif any(term in job_title_lower for term in ['junior', 'jr.', 'entry', 'associate', 'intern']):
        seniority_level = "junior"
    elif any(term in job_title_lower for term in ['manager', 'director', 'vp', 'vice president', 'head of', 'chief']):
        seniority_level = "management"
    elif any(term in job_title_lower for term in ['executive', 'ceo', 'cto', 'cfo', 'president']):
        seniority_level = "executive"
    
    # Determine role type
    role_type = "technical"  # default
    if any(term in job_title_lower for term in ['manager', 'director', 'lead', 'supervisor', 'head']):
        role_type = "management"
    elif any(term in job_title_lower for term in ['sales', 'account', 'business development', 'customer success']):
        role_type = "sales"
    elif any(term in job_title_lower for term in ['marketing', 'brand', 'content', 'social media', 'campaign']):
        role_type = "marketing"
    elif any(term in job_title_lower for term in ['product', 'pm', 'product manager', 'product owner']):
        role_type = "product"
    elif any(term in job_title_lower for term in ['analyst', 'data', 'research', 'insights', 'analytics']):
        role_type = "analytical"
    elif any(term in job_title_lower for term in ['design', 'ux', 'ui', 'creative', 'visual']):
        role_type = "design"
    elif any(term in job_title_lower for term in ['hr', 'human resources', 'people', 'talent', 'recruiting']):
        role_type = "hr"
    elif any(term in job_title_lower for term in ['finance', 'accounting', 'financial', 'controller', 'treasurer']):
        role_type = "finance"
    elif any(term in job_title_lower for term in ['operations', 'ops', 'logistics', 'supply chain', 'process']):
        role_type = "operations"
    elif any(term in job_title_lower for term in ['consultant', 'consulting', 'advisory', 'strategy']):
        role_type = "consulting"
    
    return seniority_level, role_type

def get_appropriate_action_verbs(seniority_level, role_type):
    """Get appropriate action verbs based on seniority level and role type."""
    
    # Base action verbs by seniority level
    seniority_verbs = {
        "junior": [
            "Assisted", "Supported", "Contributed", "Participated", "Collaborated", 
            "Helped", "Learned", "Developed", "Built", "Created", "Implemented",
            "Worked on", "Gained experience", "Applied", "Utilized", "Executed"
        ],
        "mid": [
            "Developed", "Built", "Implemented", "Created", "Designed", "Optimized",
            "Managed", "Coordinated", "Delivered", "Achieved", "Improved", "Enhanced",
            "Analyzed", "Resolved", "Maintained", "Collaborated", "Executed", "Performed"
        ],
        "senior": [
            "Led", "Architected", "Designed", "Spearheaded", "Drove", "Established",
            "Mentored", "Guided", "Optimized", "Transformed", "Innovated", "Pioneered",
            "Strategized", "Influenced", "Championed", "Delivered", "Scaled", "Advanced"
        ],
        "management": [
            "Led", "Managed", "Directed", "Oversaw", "Supervised", "Coordinated",
            "Mentored", "Coached", "Guided", "Developed", "Built", "Established",
            "Strategized", "Planned", "Organized", "Delegated", "Motivated", "Inspired",
            "Transformed", "Restructured", "Optimized", "Scaled", "Grew", "Expanded"
        ],
        "executive": [
            "Spearheaded", "Championed", "Transformed", "Revolutionized", "Pioneered",
            "Established", "Founded", "Launched", "Scaled", "Grew", "Expanded",
            "Strategized", "Envisioned", "Influenced", "Negotiated", "Acquired",
            "Divested", "Restructured", "Optimized", "Maximized", "Delivered"
        ]
    }
    
    # Role-specific action verbs
    role_specific_verbs = {
        "management": [
            "Led", "Managed", "Supervised", "Coordinated", "Mentored", "Coached",
            "Guided", "Developed", "Built teams", "Established processes", "Streamlined",
            "Optimized workflows", "Facilitated", "Delegated", "Motivated", "Inspired",
            "Aligned", "Collaborated across", "Drove initiatives", "Implemented strategies"
        ],
        "sales": [
            "Generated", "Closed", "Negotiated", "Cultivated", "Built relationships",
            "Prospected", "Qualified", "Converted", "Exceeded targets", "Grew accounts",
            "Expanded territory", "Developed partnerships", "Secured contracts",
            "Increased revenue", "Drove growth", "Managed pipeline", "Forecasted"
        ],
        "marketing": [
            "Launched", "Developed campaigns", "Increased brand awareness", "Generated leads",
            "Optimized conversion", "Analyzed performance", "Segmented audiences",
            "Created content", "Managed budgets", "Coordinated events", "Built brand",
            "Drove engagement", "Measured ROI", "A/B tested", "Personalized experiences"
        ],
        "product": [
            "Defined requirements", "Prioritized features", "Collaborated with engineering",
            "Conducted user research", "Analyzed metrics", "Optimized user experience",
            "Launched products", "Managed roadmap", "Gathered feedback", "Iterated",
            "Validated hypotheses", "Drove adoption", "Increased retention", "Reduced churn"
        ],
        "analytical": [
            "Analyzed", "Investigated", "Researched", "Modeled", "Forecasted",
            "Identified trends", "Generated insights", "Recommended", "Optimized",
            "Measured", "Tracked", "Reported", "Visualized", "Interpreted",
            "Validated", "Tested hypotheses", "Segmented", "Correlated"
        ],
        "technical": [
            "Developed", "Built", "Implemented", "Designed", "Architected",
            "Optimized", "Debugged", "Deployed", "Maintained", "Integrated",
            "Automated", "Scaled", "Refactored", "Tested", "Documented",
            "Configured", "Monitored", "Troubleshot", "Enhanced", "Migrated"
        ],
        "design": [
            "Designed", "Created", "Conceptualized", "Prototyped", "Wireframed",
            "Researched user needs", "Conducted usability testing", "Iterated",
            "Collaborated with stakeholders", "Presented concepts", "Refined",
            "Optimized user experience", "Established design systems", "Maintained brand consistency"
        ],
        "hr": [
            "Recruited", "Hired", "Onboarded", "Developed talent", "Managed performance",
            "Facilitated training", "Implemented policies", "Resolved conflicts",
            "Built culture", "Improved retention", "Conducted interviews",
            "Managed compensation", "Ensured compliance", "Supported employees"
        ],
        "finance": [
            "Analyzed financial data", "Prepared reports", "Managed budgets",
            "Forecasted", "Modeled scenarios", "Assessed risks", "Optimized costs",
            "Ensured compliance", "Audited", "Reconciled", "Tracked performance",
            "Advised stakeholders", "Improved processes", "Managed cash flow"
        ],
        "operations": [
            "Streamlined processes", "Optimized workflows", "Managed supply chain",
            "Coordinated logistics", "Improved efficiency", "Reduced costs",
            "Ensured quality", "Managed vendors", "Implemented systems",
            "Monitored performance", "Resolved issues", "Scaled operations"
        ],
        "consulting": [
            "Advised", "Consulted", "Recommended", "Analyzed", "Assessed",
            "Developed strategies", "Implemented solutions", "Facilitated workshops",
            "Presented findings", "Guided clients", "Optimized processes",
            "Transformed organizations", "Delivered value", "Built relationships"
        ]
    }
    
    # Combine seniority and role-specific verbs
    base_verbs = seniority_verbs.get(seniority_level, seniority_verbs["mid"])
    role_verbs = role_specific_verbs.get(role_type, role_specific_verbs["technical"])
    
    # Merge and deduplicate
    all_verbs = list(set(base_verbs + role_verbs))
    
    return all_verbs

def calculate_total_experience_years(resume_text):
    """Calculate total years of work experience from the resume with improved date parsing."""
    import re
    from datetime import datetime
    
    lines = resume_text.split('\n')
    date_patterns = []
    current_year = datetime.now().year
    
    print(f"=== DATE PARSING DEBUG ===")
    print(f"Current year: {current_year}")
    print(f"Analyzing {len(lines)} lines for date patterns...")
    
    # Enhanced date patterns to catch more formats
    date_regex_patterns = [
        # Year ranges: "2020-2023", "2020 - 2023", "2020–2023", "2020—2023"
        r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',
        
        # Month Year ranges: "Jan 2020 - Dec 2023", "January 2020 - Present"
        r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\s*[-–—]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+)?(\d{4}|present|current)',
        
        # Abbreviated month formats: "Jan '20 - Dec '23", "Jan '20 - Present"
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*['\"]?(\d{2})\s*[-–—]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*['\"]?)?(\d{2}|present|current)",
        
        # MM/YYYY format: "01/2020 - 12/2023", "01/2020 - Present"
        r'(\d{1,2})/(\d{4})\s*[-–—]\s*(?:\d{1,2}/)?(\d{4}|present|current)',
        
        # YYYY format with context: "2020 — Present", "Since 2020"
        r'(?:since\s+)?(\d{4})\s*[-–—]\s*(\d{4}|present|current|now)',
        
        # Parenthetical dates: "(2020-2023)", "(Jan 2020 - Present)"
        r'\(.*?(\d{4})\s*[-–—]\s*(\d{4}|present|current).*?\)',
    ]
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if not line_lower:
            continue
            
        print(f"Line {i+1}: {line_lower[:100]}...")
        
        for pattern in date_regex_patterns:
            matches = re.findall(pattern, line_lower)
            if matches:
                print(f"  Found matches with pattern: {matches}")
                
                for match in matches:
                    try:
                        if len(match) == 2:
                            # Standard year range format
                            start_year_str, end_year_str = match
                            
                            # Handle 2-digit years (convert to 4-digit)
                            if len(start_year_str) == 2:
                                start_year = 2000 + int(start_year_str)
                            else:
                                start_year = int(start_year_str)
                            
                            if end_year_str.lower() in ['present', 'current', 'now']:
                                end_year = current_year
                            elif len(end_year_str) == 2:
                                end_year = 2000 + int(end_year_str)
                            else:
                                end_year = int(end_year_str)
                                
                        elif len(match) == 3:
                            # MM/YYYY format
                            month_str, start_year_str, end_year_str = match
                            start_year = int(start_year_str)
                            
                            if end_year_str.lower() in ['present', 'current', 'now']:
                                end_year = current_year
                            else:
                                end_year = int(end_year_str)
                        else:
                            continue
                        
                        # Validate years are reasonable
                        if 1990 <= start_year <= current_year and 1990 <= end_year <= current_year + 1:
                            if start_year <= end_year:  # Start year should be before or equal to end year
                                date_patterns.append((start_year, end_year))
                                print(f"  Added date range: {start_year} - {end_year}")
                            else:
                                print(f"  Skipped invalid range: {start_year} - {end_year} (start > end)")
                        else:
                            print(f"  Skipped unreasonable years: {start_year} - {end_year}")
                            
                    except (ValueError, IndexError) as e:
                        print(f"  Error parsing match {match}: {e}")
                        continue
    
    print(f"Total date patterns found: {len(date_patterns)}")
    print(f"Date patterns: {date_patterns}")
    
    if not date_patterns:
        # Enhanced fallback: look for individual years and try to infer experience
        print("No date ranges found, trying fallback methods...")
        
        # Look for years in context that might indicate work experience
        experience_context_patterns = [
            r'(?:since|from|started)\s+(\d{4})',
            r'(\d{4})\s*[-–—]\s*(?:present|current|now)',
            r'(?:experience|worked|employed).*?(\d{4})',
        ]
        
        context_years = []
        for pattern in experience_context_patterns:
            matches = re.findall(pattern, resume_text.lower())
            for match in matches:
                try:
                    year = int(match)
                    if 1990 <= year <= current_year:
                        context_years.append(year)
                        print(f"Found contextual year: {year}")
                except ValueError:
                    continue
        
        if context_years:
            min_year = min(context_years)
            max_year = max(context_years)
            total_years = current_year - min_year
            print(f"Using contextual years: {min_year} to {current_year} = {total_years} years")
            return {
                'total_years': total_years,
                'analysis': f"Estimated {total_years} years based on contextual years {min_year}-{current_year}",
                'confidence': 'medium'
            }
        
        # Final fallback: look for any 4-digit years
        years = re.findall(r'\b(20\d{2})\b', resume_text)
        if years:
            years = [int(y) for y in years if 1990 <= int(y) <= current_year]
            if years:
                min_year = min(years)
                max_year = max(years)
                # More conservative estimate - assume they started working at min_year
                total_years = current_year - min_year
                print(f"Using year range fallback: {min_year} to {current_year} = {total_years} years")
                return {
                    'total_years': total_years,
                    'analysis': f"Estimated {total_years} years based on year range {min_year}-{current_year}",
                    'confidence': 'low'
                }
        
        print("All parsing methods failed, using default")
        return {
            'total_years': 5,  # Increased default from 3 to 5 years
            'analysis': "Could not parse dates, defaulting to 5 years (typical mid-level experience)",
            'confidence': 'very_low'
        }
    
    # Calculate total experience from date ranges
    # Remove duplicates and overlaps
    unique_ranges = []
    for start, end in sorted(set(date_patterns)):
        # Merge overlapping ranges
        if unique_ranges and start <= unique_ranges[-1][1] + 1:
            # Extend the last range if there's overlap or they're adjacent
            unique_ranges[-1] = (unique_ranges[-1][0], max(unique_ranges[-1][1], end))
        else:
            unique_ranges.append((start, end))
    
    print(f"Unique/merged ranges: {unique_ranges}")
    
    # Calculate total years from merged ranges
    total_years = sum(end - start for start, end in unique_ranges)
    
    # Alternative calculation: use the span from earliest to latest
    all_start_years = [start for start, end in unique_ranges]
    all_end_years = [end for start, end in unique_ranges]
    
    earliest_start = min(all_start_years)
    latest_end = max(all_end_years)
    span_years = latest_end - earliest_start
    
    # Use the more conservative estimate
    final_years = min(total_years, span_years)
    
    print(f"Total years (sum): {total_years}")
    print(f"Span years: {span_years}")
    print(f"Final estimate: {final_years}")
    
    return {
        'total_years': final_years,
        'analysis': f"Calculated {final_years} years from {len(unique_ranges)} employment periods ({earliest_start} to {latest_end})",
        'confidence': 'high',
        'date_ranges': unique_ranges,
        'raw_patterns': date_patterns
    }


def analyze_work_history_structure(resume_text):
    """Analyze the work history structure to count jobs and companies."""
    lines = resume_text.split('\n')
    
    # Common indicators of job entries
    job_indicators = [
        'experience', 'work history', 'employment', 'professional background',
        'career history', 'work experience', 'professional experience'
    ]
    
    # Look for company names and job titles
    potential_jobs = []
    in_experience_section = False
    current_job = {}
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        line_lower = line.lower()
        
        # Check if we're entering an experience section
        if any(indicator in line_lower for indicator in job_indicators):
            in_experience_section = True
            continue
            
        # Check if we're leaving experience section (entering education, skills, etc.)
        if in_experience_section and any(section in line_lower for section in ['education', 'skills', 'certifications', 'projects']):
            in_experience_section = False
            continue
            
        if in_experience_section and line_stripped:
            # Look for patterns that suggest job titles or company names
            # Job titles often contain these keywords
            if any(title_word in line_lower for title_word in [
                'engineer', 'manager', 'analyst', 'developer', 'designer', 
                'specialist', 'coordinator', 'director', 'lead', 'senior', 
                'junior', 'associate', 'consultant', 'administrator', 'officer'
            ]):
                if current_job:
                    potential_jobs.append(current_job)
                current_job = {'title': line_stripped, 'line_number': i}
            
            # Look for date patterns (likely employment dates)
            elif any(char.isdigit() for char in line_stripped) and any(month in line_lower for month in [
                'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
                'present', 'current', '2020', '2021', '2022', '2023', '2024', '2025'
            ]):
                if current_job:
                    current_job['dates'] = line_stripped
            
            # Look for company names (lines that don't start with bullets and aren't dates)
            elif not line_stripped.startswith(('•', '-', '*')) and not any(char.isdigit() for char in line_stripped[:10]):
                if current_job and 'company' not in current_job:
                    current_job['company'] = line_stripped
    
    # Add the last job if it exists
    if current_job:
        potential_jobs.append(current_job)
    
    # Count distinct jobs (remove duplicates based on title or company)
    unique_jobs = []
    seen_combinations = set()
    
    for job in potential_jobs:
        job_key = (job.get('title', ''), job.get('company', ''))
        if job_key not in seen_combinations and job_key != ('', ''):
            seen_combinations.add(job_key)
            unique_jobs.append(job)
    
    return {
        'total_jobs_found': len(unique_jobs),
        'job_details': unique_jobs,
        'analysis_summary': f"Found {len(unique_jobs)} distinct job entries in work history"
    }


def analyze_resume_structure(resume_text):
    """Analyze the original resume to understand its basic structure - LLM will handle detailed analysis."""
    lines = resume_text.split('\n')
    
    print("=== BASIC RESUME ANALYSIS ===")
    print(f"Total lines in resume: {len(lines)}")
    print("Note: LLM will perform detailed bullet point and structure analysis")
    print("=== END BASIC ANALYSIS ===")
    
    # Basic structure analysis - let LLM handle the detailed counting
    result = {
        'total_lines': len(lines),
        'analysis_method': 'llm_based',
        'note': 'Bullet point counting and structure analysis delegated to LLM for better accuracy across all resume formats'
    }
    
    return result


def extract_experience_requirements(job_description):
    """Extract experience requirements from job description."""
    import re
    
    if not job_description or not job_description.strip():
        return None
    
    # Common patterns for experience requirements
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'minimum\s*of\s*(\d+)\+?\s*years?',
        r'at\s*least\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in\s*\w+',
        r'(\d+)\+?\s*years?\s*of\s*\w+\s*experience',
        r'(\d+)\s*to\s*(\d+)\s*years?\s*experience',
        r'(\d+)-(\d+)\s*years?\s*experience'
    ]
    
    job_desc_lower = job_description.lower()
    found_requirements = []
    
    for pattern in patterns:
        matches = re.findall(pattern, job_desc_lower)
        for match in matches:
            if isinstance(match, tuple):
                # Handle range patterns like "5-7 years" or "5 to 7 years"
                found_requirements.extend([int(x) for x in match if x.isdigit()])
            else:
                # Handle single number patterns
                if match.isdigit():
                    found_requirements.append(int(match))
    
    if found_requirements:
        # Return the most commonly mentioned requirement, or the minimum if tied
        from collections import Counter
        counter = Counter(found_requirements)
        most_common = counter.most_common(1)[0][0]
        
        return {
            'required_years': most_common,
            'all_found': found_requirements,
            'analysis': f"Found experience requirements: {found_requirements}, using {most_common} years"
        }
    
    return None

def extract_job_keywords(job_desc):
    """Extract key technical skills, tools, and requirements from job description"""
    # Comprehensive technical keywords to look for
    tech_patterns = [
        'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
        'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API',
        'GraphQL', 'TypeScript', 'Vue.js', 'Angular', 'Spring', 'Django', 'Flask',
        'Microservices', 'DevOps', 'Jenkins', 'Terraform', 'Linux', 'Machine Learning',
        'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Spark', 'Hadoop',
        'Azure', 'GCP', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'Nginx',
        'Apache', 'Tomcat', 'Maven', 'Gradle', 'Webpack', 'Babel', 'Jest',
        'Cypress', 'Selenium', 'JUnit', 'Mockito', 'Pandas', 'NumPy', 'TensorFlow',
        'PyTorch', 'Scikit-learn', 'Jupyter', 'R', 'Scala', 'Go', 'Rust',
        'C++', 'C#', '.NET', 'PHP', 'Ruby', 'Rails', 'Laravel', 'Express',
        'FastAPI', 'Celery', 'Airflow', 'Snowflake', 'BigQuery', 'Redshift',
        'DynamoDB', 'Cassandra', 'Neo4j', 'Prometheus', 'Grafana', 'Splunk',
        'New Relic', 'Datadog', 'CloudFormation', 'CDK', 'Ansible', 'Puppet',
        'Chef', 'Vagrant', 'Helm', 'Istio', 'OpenShift', 'EKS', 'ECS',
        'Lambda', 'S3', 'EC2', 'RDS', 'CloudWatch', 'IAM', 'VPC', 'API Gateway'
    ]
    
    found_keywords = []
    job_lower = job_desc.lower()
    
    for keyword in tech_patterns:
        if keyword.lower() in job_lower:
            found_keywords.append(keyword)
    
    return found_keywords


def estimate_page_count(text):
    """Estimate the number of pages in the resume"""
    # Rough estimation: 500-600 words per page, 5-7 words per line average
    lines = text.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    
    # Estimate words (rough approximation)
    total_words = sum(len(line.split()) for line in non_empty_lines)
    
    # Conservative estimate: 550 words per page
    estimated_pages = total_words / 550
    
    if estimated_pages <= 1:
        return 1
    elif estimated_pages <= 1.5:
        return 1.5
    elif estimated_pages <= 2:
        return 2
    else:
        return min(3, round(estimated_pages * 2) / 2)  # Cap at 3 pages max


def get_resume_optimization_prompt(resume_text, job_description, job_title, company_name, keywords_text, length_guidance):
    """
    New template-based prompt with detailed logging and helper function integration
    
    Args:
        resume_text (str): The original resume content
        job_description (str): The job description to optimize for (optional)
        job_title (str): The specific job title to target
        company_name (str): The company name (optional)
        keywords_text (str): Extracted keywords from the job description (legacy parameter)
        length_guidance (str): Content preservation guidance
    
    Returns:
        str: The complete formatted prompt using new template
    """
    
    print("=== NEW TEMPLATE PROMPT GENERATION START ===")
    print(f"Input parameters:")
    print(f"  - job_title: {job_title}")
    print(f"  - company_name: {company_name}")
    print(f"  - has_job_description: {bool(job_description and job_description.strip())}")
    print(f"  - resume_length: {len(resume_text)} characters")
    
    # Use existing helper functions with detailed logging
    print("\n--- Running resume structure analysis ---")
    original_structure = analyze_resume_structure(resume_text)
    print(f"Structure analysis result: {original_structure}")
    
    print("\n--- Running work history analysis ---")
    work_history_analysis = analyze_work_history_structure(resume_text)
    print(f"Work history analysis: {work_history_analysis}")
    
    print("\n--- Calculating experience years ---")
    experience_years = calculate_total_experience_years(resume_text)
    print(f"Experience calculation: {experience_years}")
    
    # Extract current role with logging
    print("\n--- Extracting current role ---")
    lines = resume_text.split('\n')
    current_role = "Unknown"
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if any(indicator in line.lower() for indicator in ['engineer', 'manager', 'analyst', 'developer', 'designer', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior']):
            current_role = line_stripped
            print(f"Found current role on line {i+1}: {current_role}")
            break
    if current_role == "Unknown":
        print("Could not extract current role from resume")
    
    # Analyze target role with logging
    print("\n--- Analyzing target role ---")
    seniority_level, role_type = analyze_role_seniority_and_type(job_title)
    print(f"Target role analysis: {job_title}")
    print(f"  - Seniority level: {seniority_level}")
    print(f"  - Role type: {role_type}")
    
    print("\n--- Getting appropriate action verbs ---")
    appropriate_verbs = get_appropriate_action_verbs(seniority_level, role_type)
    print(f"Action verbs for {seniority_level} {role_type}: {appropriate_verbs[:10]}... (showing first 10)")
    
    # Process job description with logging
    print("\n--- Processing job description ---")
    job_keywords = []
    experience_requirements_text = ""
    if job_description and job_description.strip():
        print("Job description provided, extracting keywords and requirements")
        job_keywords = extract_job_keywords(job_description)
        experience_requirements = extract_experience_requirements(job_description)
        experience_requirements_text = job_description.strip()
        print(f"Extracted {len(job_keywords)} job keywords: {job_keywords}")
        if experience_requirements:
            print(f"Experience requirements found: {experience_requirements}")
        else:
            print("No specific experience requirements found")
    else:
        print("No job description provided - will optimize for general job title")
    
    # Template variable preparation with logging
    print("\n--- Preparing template variables ---")
    template_vars = {
        'original_resume_text': resume_text,
        'current_role': current_role,
        'target_job_title': job_title,
        'target_company': company_name if company_name else 'Not specified',
        'seniority_level': seniority_level,
        'role_type': role_type,
        'action_verbs': ', '.join(appropriate_verbs[:15]),
        'total_years': experience_years['total_years'],
        'experience_requirements': experience_requirements_text if experience_requirements_text else 'Not provided',
        'total_job_entries': work_history_analysis['total_jobs_found'],
        'job_keywords': ', '.join(job_keywords) if job_keywords else 'N/A',
        'experience_requirements_text': experience_requirements_text
    }
    
    print("Template variables prepared:")
    for key, value in template_vars.items():
        if key == 'original_resume_text':
            print(f"  - {key}: {len(str(value))} characters")
        else:
            print(f"  - {key}: {value}")
    
    print("\n--- Generating new template prompt ---")
    
    prompt = f"""# Resume Optimization Assistant

## TASK OVERVIEW
You are an expert resume editor tasked with optimizing a resume to target a specific job while preserving the original structure and factual accuracy. 
Your goal is to:
- Transform bullet points and summaries to highlight the most relevant skills and achievements for the target job
- Ensure the candidate appears as an established, experienced professional in the target role
- Optimize for ATS keyword alignment using job description keywords without fabricating any experience

## CORE PRINCIPLES
<preservation_rules>
- PRESERVE all job entries (companies, titles, dates) exactly as in the original resume unless optimizing job title for realism (see Job Title Optimization below)
- MAINTAIN the exact number of bullet points per job
- KEEP all education entries (degrees, institutions, dates, GPA, honors) unchanged
- TRANSFORM only bullet point and summary content to align with the target role
- PRESENT the candidate as an established professional already in the target field — avoid any wording implying transition, change, or shift
</preservation_rules>

## PROHIBITED ACTIONS
<forbidden_actions>
- DO NOT remove or combine any jobs
- DO NOT omit any employment entry regardless of relevance
- DO NOT alter employment dates
- DO NOT fabricate achievements or skills
- DO NOT modify education details
- DO NOT add phrases like "transitioning into" or "seeking to move into"
</forbidden_actions>

## PROCESS

### STEP 1: ANALYZE ORIGINAL RESUME
<analysis_instructions>
1. Count all bullet points/achievement statements in each job
2. Count total job entries
3. Record the number of bullets per job to replicate exactly
</analysis_instructions>

### STEP 2: VERIFY STRUCTURE PRESERVATION
<verification_checklist>
- EXACT same number of job entries
- EXACT same number of bullets per job
- SAME order of jobs
</verification_checklist>

### STEP 3: JOB TITLE OPTIMIZATION (If Needed)
If the target role ({template_vars['target_job_title']}) has a known equivalent at the company in that time period, replace the original title with the equivalent title that aligns with both the target role and the company's actual naming conventions.
Titles must remain factually plausible based on the candidate's described responsibilities and seniority.
When possible, adapt generic engineering titles into the target role if the responsibilities clearly overlap (e.g., "Senior Data Engineer" → "Senior Business Intelligence Engineer" if target is BI and work involved BI-related tasks).
Preserve seniority level (e.g., Senior, Lead, Manager) exactly as in the original.
Do not invent promotions or demotions.

Example:
Original: "Software Developer" at Google  
Optimized: "Software Engineer II" (if verified as realistic for that role at Google)

### STEP 4: BULLET POINT OPTIMIZATION
<optimization_strategy>
When job description is provided:
- Use {template_vars['job_keywords']} and {template_vars['experience_requirements_text']} as the foundation
- Rewrite bullets to align with target role requirements
- Integrate action verbs from {template_vars['action_verbs']}
- Ensure each bullet adds unique value, avoids repetition, and reflects measurable impact

When job description is not provided:
- Use industry standards for {template_vars['target_job_title']} to guide bullet rewrites
- Ensure all bullets sound like they come from a seasoned professional already in that role
</optimization_strategy>

### STEP 5: PROFESSIONAL SUMMARY OPTIMIZATION
- Portray candidate as a proven, highly skilled {template_vars['target_job_title']} with {template_vars['total_years']}+ years of directly relevant experience
- Highlight mastery in relevant technologies and skills
- Avoid all transition language
- Include ATS-friendly keywords naturally

---

## INPUT DATA
<resume_data>
Original Resume: {template_vars['original_resume_text']}  
Current Role: {template_vars['current_role']}  
Target Job: {template_vars['target_job_title']}  
Target Company: {template_vars['target_company']}  
Seniority Level: {template_vars['seniority_level']}  
Role Type: {template_vars['role_type']}  
Appropriate Action Verbs: {template_vars['action_verbs']}  
Total Work Experience: {template_vars['total_years']} years  
Job Requirements: {template_vars['experience_requirements']}  
Total Job Entries: {template_vars['total_job_entries']}
</resume_data>

## OUTPUT FORMAT
Return ONLY a JSON object in the exact structure below — no extra commentary or notes:

```json
{{
  "full_name": "Exact name from resume",
  "contact_info": "Email | Phone | Location",
  "professional_summary": "Confident, ATS-optimized summary presenting candidate as an established, highly skilled {template_vars['target_job_title']} with {template_vars['total_years']}+ years of directly relevant experience, demonstrating mastery in relevant technologies and delivering measurable results in the field.",
  "skills": ["Technologies and competencies relevant to {template_vars['target_job_title']}"],
  "experience": [
    {{
      "title": "Research-based or original title, optimized only if it increases realism",
      "company": "Exact company name from original",
      "dates": "Exact dates from original",
      "achievements": [
        "Optimized bullet 1 with strong action verbs and target role alignment",
        "Optimized bullet 2 with unique skill or achievement relevant to {template_vars['target_job_title']}",
        "Same total number of bullets as original"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "Exact degree from original",
      "institution": "Exact institution from original",
      "dates": "Exact dates from original",
      "details": "Exact details from original (GPA, honors, etc.)"
    }}
  ]
}}
```"""
    
    print(f"Prompt generated successfully. Length: {len(prompt)} characters")
    print("=== NEW TEMPLATE PROMPT GENERATION COMPLETE ===")
    
    return prompt


# Alternative prompt templates for different use cases
def get_creative_resume_prompt(resume_text, job_description, keywords_text, length_guidance):
    """
    Alternative prompt for more creative resume optimization.
    Currently unused but available for future customization.
    """
    # This could be used for creative roles or different optimization strategies
    pass


def get_technical_resume_prompt(resume_text, job_description, keywords_text, length_guidance):
    """
    Alternative prompt specifically for technical roles.
    Currently unused but available for future customization.
    """
    # This could be used for highly technical positions with specific requirements
    pass
