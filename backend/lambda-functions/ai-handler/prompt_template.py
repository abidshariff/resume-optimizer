"""
Resume Optimization Prompt Template

This file contains the AI prompt template used for resume optimization.
Based on the proven methodology from the GitHub repository.
Edit this file to modify the AI's behavior and instructions.
"""

import re

def calculate_total_experience_years(resume_text):
    """Calculate total years of work experience from the resume."""
    import re
    from datetime import datetime
    
    lines = resume_text.split('\n')
    date_patterns = []
    
    # Look for date patterns in the resume
    for line in lines:
        # Common date patterns: "2020-2023", "Jan 2020 - Dec 2023", "2020 - Present", etc.
        date_matches = re.findall(r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)', line.lower())
        if date_matches:
            for match in date_matches:
                start_year = int(match[0])
                end_year = datetime.now().year if match[1] in ['present', 'current'] else int(match[1])
                date_patterns.append((start_year, end_year))
    
    if not date_patterns:
        # Fallback: look for individual years
        years = re.findall(r'\b(20\d{2})\b', resume_text)
        if years:
            years = [int(y) for y in years]
            min_year = min(years)
            max_year = max(years)
            total_years = max_year - min_year + 1
            return {
                'total_years': total_years,
                'analysis': f"Estimated {total_years} years based on year range {min_year}-{max_year}",
                'confidence': 'low'
            }
        return {
            'total_years': 3,
            'analysis': "Could not parse dates, defaulting to 3 years",
            'confidence': 'very_low'
        }
    
    # Calculate total experience (may have overlaps, so we'll take the span)
    all_start_years = [start for start, end in date_patterns]
    all_end_years = [end for start, end in date_patterns]
    
    earliest_start = min(all_start_years)
    latest_end = max(all_end_years)
    total_years = latest_end - earliest_start
    
    return {
        'total_years': total_years,
        'analysis': f"Calculated {total_years} years from {earliest_start} to {latest_end}",
        'confidence': 'high',
        'date_ranges': date_patterns
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
    """Analyze the original resume to understand its structure and content density."""
    lines = resume_text.split('\n')
    
    # Enhanced bullet point detection - look for various formats
    bullet_indicators = ['•', '-', '*', '◦', '▪', '▫', '‣', '⁃']
    bullet_points = []
    
    print("=== BULLET POINT ANALYSIS DEBUG ===")
    print(f"Total lines in resume: {len(lines)}")
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if line_stripped:
            # Check for various bullet point formats
            starts_with_bullet = any(line_stripped.startswith(indicator) for indicator in bullet_indicators)
            # Also check for numbered lists (1., 2., etc.)
            starts_with_number = bool(re.match(r'^\d+\.', line_stripped))
            # Check for indented lines that might be bullet points without symbols
            is_indented_item = line.startswith('  ') or line.startswith('\t')
            
            if starts_with_bullet or starts_with_number:
                bullet_points.append(line_stripped)
                print(f"Line {i+1}: BULLET FOUND -> '{line_stripped[:50]}...'")
            elif is_indented_item and len(line_stripped) > 10:  # Likely a bullet point without symbol
                bullet_points.append(line_stripped)
                print(f"Line {i+1}: INDENTED BULLET -> '{line_stripped[:50]}...'")
    
    print(f"TOTAL BULLET POINTS DETECTED: {len(bullet_points)}")
    print("=== END BULLET POINT ANALYSIS ===")
    
    # Estimate number of experience sections
    experience_indicators = ['experience', 'work history', 'employment', 'professional background']
    education_indicators = ['education', 'academic', 'degree', 'university', 'college']
    
    experience_sections = 0
    for line in lines:
        line_lower = line.lower()
        if any(indicator in line_lower for indicator in experience_indicators):
            experience_sections += 1
    
    # Count bullet points per section (rough estimate)
    bullets_per_section = []
    current_section_bullets = 0
    in_experience_section = False
    
    for line in lines:
        line_stripped = line.strip()
        line_lower = line.lower()
        
        # Check if we're entering an experience section
        if any(indicator in line_lower for indicator in experience_indicators):
            if current_section_bullets > 0:
                bullets_per_section.append(current_section_bullets)
            current_section_bullets = 0
            in_experience_section = True
        elif any(indicator in line_lower for indicator in education_indicators):
            if current_section_bullets > 0:
                bullets_per_section.append(current_section_bullets)
            current_section_bullets = 0
            in_experience_section = False
        elif any(line_stripped.startswith(indicator) for indicator in bullet_indicators) or bool(re.match(r'^\d+\.', line_stripped)):
            if in_experience_section:
                current_section_bullets += 1
    
    # Add the last section if it had bullets
    if current_section_bullets > 0:
        bullets_per_section.append(current_section_bullets)
    
    result = {
        'total_lines': len(lines),
        'bullet_points': len(bullet_points),
        'estimated_experience_sections': max(1, experience_sections),
        'avg_bullets_per_section': len(bullet_points) // max(1, experience_sections) if experience_sections > 0 else len(bullet_points),
        'bullets_per_section': bullets_per_section,
        'detailed_bullet_analysis': f"Total bullets: {len(bullet_points)}, Sections with bullets: {len(bullets_per_section)}, Bullets per section: {bullets_per_section}",
        'all_detected_bullets': bullet_points[:10]  # First 10 for debugging
    }
    
    print(f"FINAL BULLET COUNT RESULT: {result['bullet_points']}")
    return result


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
    Simplified prompt optimized for Claude 3 Haiku with career transition detection
    
    Args:
        resume_text (str): The original resume content
        job_description (str): The job description to optimize for (optional)
        job_title (str): The specific job title to target
        company_name (str): The company name (optional)
        keywords_text (str): Extracted keywords from the job description (legacy parameter)
        length_guidance (str): Content preservation guidance
    
    Returns:
        str: The complete formatted prompt
    """
    
    # Analyze resume structure
    original_structure = analyze_resume_structure(resume_text)
    work_history_analysis = analyze_work_history_structure(resume_text)
    experience_years = calculate_total_experience_years(resume_text)
    
    print("=== PROMPT GENERATION DEBUG ===")
    print(f"Original resume structure: {original_structure}")
    print(f"Work history analysis: {work_history_analysis}")
    print(f"Experience years calculation: {experience_years}")
    print(f"CRITICAL: Bullet points detected = {original_structure['bullet_points']}")
    print(f"CRITICAL: Jobs detected = {work_history_analysis['total_jobs_found']}")
    print("=== END PROMPT DEBUG ===")
    
    # Extract current role from most recent experience
    lines = resume_text.split('\n')
    current_role = "Unknown"
    for line in lines:
        line_stripped = line.strip()
        # Look for job titles (usually after company names or in experience sections)
        if any(indicator in line.lower() for indicator in ['engineer', 'manager', 'analyst', 'developer', 'designer', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior']):
            current_role = line_stripped
            break
    
    # Extract job keywords using comprehensive method (only if job description provided)
    job_keywords = []
    if job_description and job_description.strip():
        job_keywords = extract_job_keywords(job_description)
        print(f"Extracted job keywords: {job_keywords}")
    else:
        print("No job description provided - optimizing for general job title")
    
    prompt = f"""
🚨🚨🚨 CRITICAL PRESERVATION RULES - READ FIRST 🚨🚨🚨

❌ ABSOLUTELY FORBIDDEN:
- Removing ANY company from work history
- Omitting ANY job experience from the original resume
- Skipping ANY employment entry
- Combining multiple jobs into one entry
- Deleting ANY work experience regardless of relevance

✅ MANDATORY REQUIREMENTS:
- Include EVERY SINGLE company mentioned in the original resume
- Preserve EVERY job entry structure (company, title, dates) from the original
- Maintain the COMPLETE work history timeline
- Keep ALL employment dates exactly as written
- TRANSFORM and OPTIMIZE all bullet point content for the target role
- NEVER remove entire job entries

🚨 CRITICAL RULE #1: PRESERVE EXACT BULLET COUNT 🚨

Original resume has {original_structure['bullet_points']} bullet points total.
Your output MUST have EXACTLY {original_structure['bullet_points']} bullet points total.
Each job must have the same number of bullets as the original job.

🚨 CRITICAL RULE #2: PRESERVE ALL WORK HISTORY 🚨

WORK HISTORY ANALYSIS: {work_history_analysis['analysis_summary']}
You MUST include EXACTLY {work_history_analysis['total_jobs_found']} job entries in your output.
NO EXCEPTIONS. NO OMISSIONS. NO COMBINATIONS.

DETECTED JOBS IN ORIGINAL RESUME:
{chr(10).join([f"- {job.get('title', 'Unknown Title')} at {job.get('company', 'Unknown Company')}" for job in work_history_analysis['job_details']])}

COUNT VERIFICATION: Original has {work_history_analysis['total_jobs_found']} jobs → Output must have {work_history_analysis['total_jobs_found']} jobs

ORIGINAL RESUME:
{resume_text}

CURRENT ROLE (from resume): {current_role}
TARGET JOB: {job_title}
{f"COMPANY: {company_name}" if company_name else ""}

CANDIDATE EXPERIENCE ANALYSIS:
Total Work Experience: {experience_years['total_years']} years ({experience_years['analysis']})
Use this information to align professional summary with job requirements.

🔍 WORK HISTORY PRESERVATION CHECK:
Before proceeding, count how many different companies/jobs are in the original resume.
Your output MUST have the exact same number of experience entries.

CAREER TRANSITION ASSESSMENT:
Analyze if this is a major career transition:
- Current: {current_role}  
- Target: {job_title}

Examples of MAJOR CAREER TRANSITIONS:
❌ Design Engineer → Software Engineer (different domains)
❌ Marketing Manager → Data Scientist (different fields)  
❌ Mechanical Engineer → Product Manager (different functions)
❌ Teacher → Software Developer (different industries)

Examples of SAME/SIMILAR ROLES:
✅ Software Engineer → Senior Software Engineer (progression)
✅ Data Analyst → Data Engineer (related field)
✅ Frontend Developer → Full Stack Developer (expansion)

🏢 COMPANY-SPECIFIC JOB TITLE RESEARCH 🏢

CRITICAL: Before modifying any job titles, you MUST research the actual job titles used at each company.

COMPANY TITLE RESEARCH REQUIREMENTS:
1. **For well-known companies** (Amazon, Google, Microsoft, Meta, Apple, etc.):
   - Use your knowledge of their specific job title conventions
   - Examples:
     * Amazon: "Senior Software Development Engineer", "Principal Engineer", "Senior Data Engineer"
     * Google: "Senior Software Engineer", "Staff Software Engineer", "Senior Data Scientist"  
     * Microsoft: "Senior Software Engineer", "Principal Software Engineer", "Senior Data & Applied Scientist"
     * Meta: "Senior Software Engineer", "Staff Software Engineer", "Senior Data Scientist"

2. **For specific companies mentioned in the resume**:
   - Research their actual job title hierarchy and naming conventions
   - Use realistic titles that exist at that company
   - Avoid creating fictional titles like "Senior Data Engineering Lead" 

3. **Job Title Modification Rules**:
   - ONLY use job titles that actually exist at the specific company
   - If unsure about a company's titles, use industry-standard generic titles
   - Maintain logical career progression within each company's hierarchy
   - Never invent titles that don't exist at the company

EXAMPLES OF CORRECT COMPANY-SPECIFIC TITLES:
✅ Amazon: "Senior Software Development Engineer" (not "Senior Software Engineering Lead")
✅ Google: "Senior Software Engineer" (not "Senior Software Development Lead")  
✅ Microsoft: "Senior Software Engineer" (not "Senior Software Engineering Manager")
✅ Meta: "Senior Software Engineer" (not "Senior Software Development Specialist")

EXAMPLES OF INCORRECT FICTIONAL TITLES:
❌ "Senior Data Engineering Lead" (doesn't exist at most companies)
❌ "Principal Software Development Manager" (mixing levels incorrectly)
❌ "Staff Data Science Engineer" (mixing disciplines incorrectly)

BULLET POINT MODIFICATION STRATEGY:

IF MAJOR CAREER TRANSITION:
{f'''   - Job description provided: Completely rewrite each bullet using job technologies: {', '.join(job_keywords) if job_keywords else 'N/A'}
   - Transform the story to show transferable skills for {job_title}
   - Example: "Designed mechanical systems for automotive" → "Developed systematic solutions using Python and SQL for data processing applications"
   - Keep achievements/metrics but change the domain completely''' if job_description and job_description.strip() else f'''   - No job description: Research {job_title} industry standards and completely rewrite bullets
   - Transform each story to demonstrate {job_title} capabilities  
   - Example: "Designed mechanical systems" → "Developed software applications using modern frameworks"
   - Keep achievements/metrics but change domain to {job_title}'''}

IF SAME/SIMILAR ROLE:
{f'''   - Job description provided: Keep original story/context, update technologies: {', '.join(job_keywords) if job_keywords else 'N/A'}
   - Example: "Built data pipeline using MySQL" → "Built data pipeline using PostgreSQL"
   - Preserve the work context, enhance with job-relevant tools''' if job_description and job_description.strip() else f'''   - No job description: Keep story/context, modernize with {job_title} technologies
   - Example: "Built web application" → "Built web application using React.js and Node.js"
   - Enhance existing work with current industry standards'''}

🚨 TRANSFORMATION RULES - CRITICAL 🚨:
- PRESERVE: ALL companies, ALL job entry structures, ALL employment dates, company names
- RESEARCH: Each company's actual job title conventions before modifying titles
- MODIFY: Job titles (using ONLY real titles that exist at each specific company), bullet point content, technologies, tools, methodologies
- OPTIMIZE: All bullet points for the target role while maintaining achievements and metrics
- CONCEAL: Previous career field in professional summary if major career transition
- MAINTAIN: Complete work history, professional progression, responsibility level
- NEVER CHANGE: Company names, employment dates, education details
- NEVER REMOVE: Any job experience, any company, any work history entry
- NEVER INVENT: Fictional job titles that don't exist at the specific company
- NEVER REVEAL: Previous career field in summary for major transitions

SKILLS SECTION:
- Replace with technologies relevant to {job_title}
- Prioritize job description keywords if provided

🎯 PROFESSIONAL SUMMARY RULES 🎯:

CRITICAL: The professional summary must NEVER reveal the candidate's previous career field if this is a major career transition.

YEARS OF EXPERIENCE CALCULATION:
1. **Calculate total work experience** from the resume (all employment periods combined)
2. **Check job description requirements** for required years of experience
3. **Align the summary** to match or slightly exceed job requirements when possible
4. **Use realistic numbers** based on actual work history timeline

PROFESSIONAL SUMMARY STRATEGY:

IF MAJOR CAREER TRANSITION:
- NEVER mention the previous career field or role (e.g., don't say "data engineering background" when targeting Design Engineer)
- Focus ONLY on transferable skills relevant to the target role
- Position candidate as someone suited for the target role
- Use target role terminology and industry language
- **Include years of experience** that align with job requirements
- Example: Data Engineer → Design Engineer: "Innovative Design Engineer with 5+ years of experience in systematic problem-solving and technical solution development. Experienced in CAD software, prototyping, and engineering design principles with a focus on creating efficient and scalable solutions."

IF SAME/SIMILAR ROLE:
- Can mention current field since it's relevant
- Focus on progression and enhanced capabilities
- **Include accurate years of experience** in the field
- Example: Software Engineer → Senior Software Engineer: "Experienced Software Engineer with 7+ years of expertise in full-stack development and system architecture..."

YEARS OF EXPERIENCE GUIDELINES:
- **Job requires 3+ years**: Use "3+ years" or "5+ years" if candidate has more
- **Job requires 5+ years**: Use "5+ years" or "7+ years" if candidate has more  
- **Job requires 10+ years**: Use "10+ years" or actual years if candidate has more
- **Entry level**: Use "2+ years" or omit years if very junior
- **Senior roles**: Use specific years like "8+ years" or "10+ years"

FORBIDDEN EXAMPLES FOR CAREER TRANSITIONS:
❌ "Data Engineer transitioning to Design Engineer" (reveals previous field)
❌ "Background in data engineering, now focusing on design" (reveals previous field)  
❌ "Leveraging data engineering experience for design roles" (reveals previous field)
❌ "Strong background in [previous field] and analytics" (reveals previous field)
❌ "Design Engineer with 2 years of experience" (when job requires 5+ years and candidate has 8 total years)

CORRECT EXAMPLES FOR CAREER TRANSITIONS:
✅ "Innovative Design Engineer with 5+ years of experience in systematic problem-solving and technical solution development"
✅ "Results-driven Design Engineer with 7+ years specializing in CAD design and product development"
✅ "Creative Design Engineer with 8+ years of experience and strong analytical skills in engineering design principles"

OUTPUT FORMAT (JSON):
{{
  "full_name": "Name from resume",
  "contact_info": "Email | Phone | Location", 
  "professional_summary": "Brief summary with X+ years of experience positioning candidate ONLY for {job_title} - align years with job requirements, NEVER mention previous career field if major transition",
  "skills": ["Technologies relevant to {job_title}"],
  "experience": [
    {{
      "title": "RESEARCH-BASED title that actually exists at this specific company for {job_title} progression",
      "company": "EXACT company name - NEVER CHANGE THIS",
      "dates": "EXACT dates - NEVER CHANGE THIS",
      "achievements": [
        "Bullet 1 - COMPLETELY REWRITTEN and optimized for {job_title} role",
        "Bullet 2 - TRANSFORMED content using career transition strategy", 
        "Bullet 3 - ENHANCED with relevant technologies and impact metrics",
        "MUST have EXACT same number of bullets as original job but FULLY OPTIMIZED content"
      ]
    }},
    {{
      "title": "COMPANY-SPECIFIC title based on actual titles used at this company",
      "company": "NEVER OMIT ANY COMPANY - PRESERVE EXACT NAME",
      "dates": "PRESERVE ALL DATES EXACTLY",
      "achievements": [
        "Transform and optimize ALL bullet points for target role relevance"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "EXACT from original - DO NOT CHANGE",
      "institution": "EXACT from original - DO NOT CHANGE", 
      "dates": "EXACT from original - DO NOT CHANGE"
    }}
  ]
}}

🚨 FINAL VALIDATION CHECKLIST 🚨:
1. Count bullets: Original = {original_structure['bullet_points']}, Output = ___
2. Count jobs: Original = {work_history_analysis['total_jobs_found']}, Output = ___ (MUST BE EQUAL)
3. Career transition strategy applied correctly
4. ALL company names preserved exactly
5. ALL employment dates preserved exactly
6. NO job entries omitted or removed
7. Complete work history maintained
8. ALL job titles use REAL titles that exist at each specific company (no fictional titles)
9. Professional summary does NOT reveal previous career field if major transition
10. Professional summary includes years of experience aligned with job requirements

❌ FAILURE CONDITIONS (DO NOT SUBMIT IF ANY ARE TRUE):
- Output has fewer than {work_history_analysis['total_jobs_found']} job entries
- Any company name is missing from output
- Any employment period is omitted
- Work history timeline has gaps
- Any job experience is completely removed
- Any job title is fictional or doesn't exist at the specific company
- Professional summary mentions previous career field for major career transitions
- Professional summary lacks years of experience or misaligns with job requirements

Return ONLY the JSON.
"""

    return prompt
    
    # Build job description section
    job_desc_section = ""
    if job_description and job_description.strip():
        job_desc_section = f"""
TARGET JOB DESCRIPTION:
{job_description}

EXTRACTED KEY TECHNOLOGIES/SKILLS FROM JOB: {', '.join(job_keywords) if job_keywords else 'General skills optimization'}"""
    else:
        job_desc_section = """
TARGET JOB DESCRIPTION: Not provided - optimize for general job title requirements

EXTRACTED KEY TECHNOLOGIES/SKILLS FROM JOB: General skills optimization based on job title"""
    
    prompt = f"""
You are an expert ATS resume optimizer and career consultant. Your mission is to COMPLETELY TRANSFORM the provided resume to perfectly match the job title{' and job description' if job_description and job_description.strip() else ''} while maintaining truthfulness about the candidate's background.

ORIGINAL RESUME:
{resume_text}

TARGET JOB TITLE: {job_title}
{f"TARGET COMPANY: {company_name}" if company_name else ""}
{job_desc_section}

ORIGINAL RESUME LENGTH: Approximately {original_page_count} page(s)
ORIGINAL RESUME STRUCTURE: {original_structure['total_lines']} lines, {original_structure['bullet_points']} bullet points, estimated {original_structure['estimated_experience_sections']} experience sections
DETAILED BULLET ANALYSIS: {original_structure['detailed_bullet_analysis']}

🚨🚨🚨 **MANDATORY BULLET POINT PRESERVATION - READ THIS FIRST** 🚨🚨🚨:

**CRITICAL INSTRUCTION**: The original resume contains {original_structure['bullet_points']} bullet points total. Your output MUST contain EXACTLY {original_structure['bullet_points']} bullet points total. NO EXCEPTIONS.

**BULLET POINT COUNTING RULES**:
1. Count every bullet point (•, -, *) in the original resume
2. Your output must have the EXACT SAME NUMBER of bullet points
3. If original Job A has 4 bullets → output Job A must have 4 bullets
4. If original Job B has 6 bullets → output Job B must have 6 bullets
5. If original Job C has 3 bullets → output Job C must have 3 bullets
6. NEVER reduce, combine, or eliminate bullet points
7. NEVER create fewer bullets than the original
8. Each original bullet point must become exactly one output bullet point

**VALIDATION CHECK**: Before submitting your response, count the bullet points in your output:
- Original total: {original_structure['bullet_points']} bullets
- Your output total: [COUNT YOUR BULLETS] bullets
- These numbers MUST be identical

**IF BULLET COUNTS DON'T MATCH**: You have failed the task. Revise your response to match the exact bullet count.

🚨 **CRITICAL WORK HISTORY PRESERVATION RULES** 🚨:
**NEVER CHANGE COMPANY NAMES**: All company names from the original resume MUST remain exactly as they appear. Do not modify, replace, or substitute any company names.
**NEVER CHANGE EMPLOYMENT DATES**: All employment dates must remain exactly as they appear in the original resume.
**PRESERVE WORK HISTORY INTEGRITY**: The candidate's actual work history and career progression must remain completely intact and truthful.

CRITICAL OPTIMIZATION REQUIREMENTS:

1. **TARGET ROLE ALIGNMENT**: 
   - Optimize the entire resume specifically for the "{job_title}" position{f" at {company_name}" if company_name else ""}
   - Ensure the professional summary clearly positions the candidate for this exact role{f" and company culture" if company_name else ""}
   - Align all experience descriptions to demonstrate relevance to "{job_title}" responsibilities
   - Use terminology and keywords that hiring managers for "{job_title}" positions expect to see
   {f"- Research and incorporate {company_name}'s values, culture, and industry focus where appropriate" if company_name else ""}

2. **AGGRESSIVE KEYWORD INTEGRATION**: 
   {f'''- Identify ALL technical skills, tools, frameworks, and buzzwords from the job description
   - Integrate these keywords naturally throughout the resume, especially in experience bullets
   - If the candidate has ANY related experience, reframe it using job description terminology
   - Add relevant keywords to skills section even if not explicitly mentioned in original resume (but candidate likely has exposure)''' if job_description and job_description.strip() else '''- Focus on industry-standard keywords and skills relevant to the "{job_title}" position
   - Research common requirements for "{job_title}" roles and integrate relevant keywords
   - Enhance technical skills section with technologies commonly used in "{job_title}" positions
   - Use industry-standard terminology throughout the resume'''}

2A. **CAREER TRANSITION ASSESSMENT**:
   **ANALYZE CAREER CHANGE**: Compare the candidate's most recent role with the target position:
   - Current Role (from resume): [Extract from the most recent experience entry]
   - Target Role: {job_title}
   
   **ENHANCED DECISION CRITERIA**: 
   - Are these roles in fundamentally different domains (tech ↔ business ↔ HR ↔ sales ↔ marketing)?
   - Do they require significantly different core skills and knowledge bases?
   - Do they serve different primary stakeholders or business functions?
   - Would a hiring manager question this career change without clear explanation?
   - **NEW**: Are these roles in the same broad field but with different focus areas, responsibilities, or skill emphasis?
   
   **EXAMPLES FOR CALIBRATION**:
   ✅ NOT Career Transitions: Junior → Senior (same role), Software Engineer → Senior Software Engineer
   🔄 RELATED-FIELD TRANSITIONS: Data Engineer → BI Engineer, Backend Engineer → Full Stack Engineer, Software Engineer → DevOps Engineer, Marketing Analyst → Product Manager, Financial Analyst → Business Analyst
   ❌ MAJOR Career Transitions: Software Engineer → Recruiter, Engineer → Sales Manager, Marketing Manager → Data Scientist
   
   **YOUR ASSESSMENT**: 
   - Is this a MAJOR career transition? [YES/NO]
   - Is this a RELATED-FIELD transition (same domain, different focus)? [YES/NO]
   
   **TRANSITION STRATEGY SELECTION**:
   
   **IF MAJOR CAREER TRANSITION = YES**:
   Apply aggressive transformation strategy:
   
   {f'''**WITH JOB DESCRIPTION PROVIDED**:
   - **REPHRASE 50% of bullet points** in each experience to align with specific job description requirements while preserving the original context and achievements
   - **REPHRASE 50% of bullet points** in each experience using industry research for {job_title} roles while maintaining the core story of the original bullets
   - Create compelling narrative that naturally explains the career pivot
   - Focus heavily on transferable skills and cross-domain value
   
   **WITHOUT JOB DESCRIPTION PROVIDED**:
   - **REPHRASE 100% of bullet points** across ALL experiences using industry research for {job_title} roles while preserving the original achievements and context
   - Research {job_title} industry standards, responsibilities, and terminology
   - Transform every original bullet point to demonstrate relevance to {job_title} positions while keeping the core accomplishment intact
   - Emphasize transferable skills and career change rationale''' if job_description and job_description.strip() else '''**NO JOB DESCRIPTION PROVIDED**:
   - **REPHRASE 100% of bullet points** across ALL experiences using industry research for {job_title} roles while preserving the original achievements and context
   - Research {job_title} industry standards, responsibilities, and terminology  
   - Transform every original bullet point to demonstrate relevance to {job_title} positions while keeping the core accomplishment intact
   - Emphasize transferable skills and career change rationale'''}
   
   **IF RELATED-FIELD TRANSITION = YES**:
   Apply focused reframing strategy:
   - **REFRAME 75% of bullet points** to emphasize aspects most relevant to the target role's focus area
   - **PRESERVE 25% of bullet points** that already align well with the target role
   - **SHIFT EMPHASIS**: Transform technical accomplishments to highlight business impact, or business accomplishments to highlight technical depth, as appropriate
   - **UPDATE TERMINOLOGY**: Use target role's industry language and buzzwords throughout
   - **BRIDGE THE GAP**: Show logical progression and transferable expertise between related fields
   
   **Examples of Related-Field Reframing**:
   - Data Engineer → BI Engineer: Emphasize analytics, reporting, business insights over infrastructure
   - Backend → Full Stack: Highlight user-facing impact and frontend technologies used
   - Individual Contributor → Manager: Emphasize leadership, mentoring, and strategic thinking shown in technical work
   
   **IF BOTH = NO** (Same Role/Domain):
   - Apply standard optimization approach (continue with sections 3-12 below)
   - Focus on role progression and skill enhancement within the same domain
   - Use existing bullet point transformation methodology

3. **JOB TITLE ALIGNMENT IN EXPERIENCE**:
   - **MANDATORY TITLE OPTIMIZATION**: You MUST update job titles in the experience section to create a logical progression toward the target "{job_title}" role
   - **PROGRESSIVE EVOLUTION**: Show clear career advancement using titles that build toward the target position
   - **RELEVANCE MAXIMIZATION**: Replace generic or less relevant titles with industry-standard titles that directly relate to the target role
   - **CONSISTENCY ENFORCEMENT**: Ensure all titles use terminology consistent with the target role's field and seniority level
   - **TRUTHFUL ENHANCEMENT**: Maintain accuracy while using more impactful and relevant job titles that better represent the actual work performed
   - **LOGICAL PROGRESSION**: Create a career story that naturally leads to the target "{job_title}" position
   
   **Title Optimization Examples**:
   - Generic "Software Developer" → "Senior Full Stack Engineer" (if targeting senior roles)
   - "Data Analyst" → "Business Intelligence Analyst" → "Senior BI Engineer" (if targeting BI roles)
   - "Marketing Coordinator" → "Digital Marketing Specialist" → "Product Marketing Manager" (if targeting product marketing)
   - "Support Engineer" → "DevOps Engineer" → "Senior Site Reliability Engineer" (if targeting SRE roles)
   
   **IMPORTANT**: You MUST change job titles to optimize relevance, but NEVER change company names or employment dates

3A. **COMPANY-SPECIFIC JOB TITLE RESEARCH** {f"(for {company_name})" if company_name else ""}:
   {f'''- **RESEARCH {company_name.upper()} JOB TITLES**: Use your knowledge of {company_name}'s organizational structure, culture, and naming conventions
   - **IDENTIFY TITLE PATTERNS**: What job titles does {company_name} typically use for {job_title} and related positions?
   - **UNDERSTAND PROGRESSION**: What is {company_name}'s career progression structure (e.g., Engineer → Senior → Principal vs SDE I → SDE II → SDE III)?
   - **APPLY COMPANY CONVENTIONS**: Use {company_name}'s specific terminology and title hierarchy
   - **ENSURE AUTHENTICITY**: Make job titles sound authentic to someone familiar with {company_name}'s structure
   - **MAINTAIN LOGICAL FLOW**: Show realistic career progression that would make sense at {company_name}
   
   **Company Research Examples:**
   - Microsoft: Uses "Program Manager" not "Product Manager", has "Principal" levels
   - Amazon: Uses "SDE I/II/III" progression, "Principal Engineer" for senior roles  
   - Google: Uses "Software Engineer" → "Senior" → "Staff" → "Senior Staff" progression
   - Meta: Similar to Google but with different culture/focus areas
   - Apple: More traditional titles, less public hierarchy information
   
   **Research Confidence**: Only apply company-specific titles if you have MODERATE CONFIDENCE (6/10+) in your knowledge of {company_name}'s conventions. If uncertain, use industry-standard progression.''' if company_name else '''- **USE INDUSTRY STANDARDS**: Since no specific company is provided, use industry-standard job title progression
   - **FOCUS ON ROLE RELEVANCE**: Ensure titles clearly show progression toward the target "{job_title}" position
   - **MAINTAIN CONSISTENCY**: Use consistent terminology and logical career advancement'''}

4. **STRATEGIC EXPERIENCE ENHANCEMENT**:
   **APPLY TRANSITION STRATEGY**: Follow the approach determined in section 2A above.
   
   **FOR MAJOR CAREER TRANSITIONS**:
   - **PRESERVE the original achievement and context** of each bullet point from the original resume
   - **REPHRASE using transition strategy**: Transform the original bullets based on the strategy determined above (50/50 split or 100% industry research)
   - **MAINTAIN the core accomplishment** while reframing it for the target role
   - **EMPHASIZE transferable skills** and cross-domain value proposition
   - **USE target role terminology** while keeping the original achievement intact
   - **CREATE NARRATIVE BRIDGE** that explains why this career change makes logical sense
   
   **FOR RELATED-FIELD TRANSITIONS**:
   - **REFRAME FOCUS**: Shift emphasis from current role's primary focus to target role's primary focus
   - **PRESERVE CORE WORK**: Keep the fundamental work description but change the angle of presentation
   - **BRIDGE TERMINOLOGY**: Use target role's language to describe similar concepts from current role
   - **HIGHLIGHT RELEVANT ASPECTS**: Emphasize parts of each accomplishment most relevant to target role
   - **SHOW NATURAL PROGRESSION**: Demonstrate how current experience logically leads to target role
   
   **Related-Field Transformation Examples**:
   - Data Engineer → BI Engineer: "Built ETL pipelines for data processing" → "Developed data integration solutions enabling business intelligence and analytics reporting"
   - Backend Engineer → Full Stack: "Optimized API performance" → "Enhanced API performance improving user experience across web applications"
   - Marketing Analyst → Product Manager: "Analyzed campaign performance metrics" → "Leveraged data analytics to drive product strategy and user engagement optimization"
   
   **FOR SAME-ROLE OPTIMIZATION** (Standard Approach):
   - **PRESERVE the core story and context** of each original bullet point
   - **ENHANCE with relevant technical details** that would logically be part of the work described
   - **ADD industry-standard technologies** that align with the described responsibilities
   - **EXPAND on implied skills** that would naturally be involved in the original work
   - **REFRAME accomplishments** using job-relevant terminology and metrics
   - **MAINTAIN truthfulness** while maximizing keyword relevance
   - **AVOID major fabrications** like entirely new projects or drastically different roles
   - **PRIORITIZE enhancement over invention** - exhaust all realistic enhancements before considering fabrication

   **Enhancement Hierarchy** (applies to all transition types):
   1. **First**: Reframe existing work using target role terminology and focus
   2. **Second**: Add logical technical details and industry terminology
   3. **Third**: Expand on implied responsibilities and skills that naturally fit
   4. **Fourth**: Add reasonable metrics and quantifications
   5. **Last Resort**: Create new elements only when essential for job match and logically defensible

5. **SKILLS-EXPERIENCE ALIGNMENT**:
   - **ENSURE EVERY SKILL** listed in Core Competencies/Technical Skills is demonstrated in at least one experience bullet
   - **CROSS-REFERENCE** skills section with experience bullets to verify alignment
   - **ENHANCE EXISTING BULLETS** to naturally incorporate skills that are listed but not demonstrated
   - **AVOID ADDING SKILLS** to competencies unless they can be logically demonstrated in experience
   - **PRIORITIZE SKILLS** that appear in both job description AND can be shown in experience bullets
   - **CREATE SKILL-TO-EXPERIENCE MAPPING** ensuring no orphaned skills in competencies section

   **Alignment Rules:**
   - If you add "DBT" to skills → Must show DBT usage in at least one experience bullet
   - If you add "KSQL" to skills → Must demonstrate KSQL experience in bullets
   - If you add "API Design" to skills → Must show API development/design work in experience
   - If you add "Agile/Scrum" to skills → Must mention Agile/Scrum methodology in experience

   **Skills Validation Checklist:**
   □ Every technical skill in competencies appears in experience bullets
   □ Every tool/technology mentioned is demonstrated with specific usage
   □ No skills are listed without corresponding experience evidence
   □ Experience bullets support the skills claimed in competencies section

6. **COMPLETE EXPERIENCE TRANSFORMATION**:
   - **REWRITE every single bullet point** to align with job requirements and target role focus
   - **TRANSFORM PERSPECTIVE**: Shift from current role's viewpoint to target role's viewpoint
   - **ROLE-SPECIFIC EMPHASIS**: Adjust what aspects of each accomplishment to highlight based on target role priorities
   - **TERMINOLOGY ALIGNMENT**: Use action verbs and terminology that match the job description and target role exactly
   - **QUANTIFY STRATEGICALLY**: Include metrics that matter most to the target role (business impact for business roles, technical metrics for technical roles, etc.)
   - **FOCUS ON RELEVANT IMPACT**: Emphasize results that demonstrate capabilities most valued in the target position
   
   **Role-Specific Focus Examples**:
   - **For Business/BI Roles**: Emphasize business impact, stakeholder communication, decision-making support, revenue/cost effects
   - **For Technical Roles**: Emphasize technical complexity, performance improvements, scalability, architecture decisions
   - **For Management Roles**: Emphasize team leadership, strategic planning, process improvements, cross-functional collaboration
   - **For Product Roles**: Emphasize user impact, feature adoption, market research, product strategy, user experience
   - **For Sales/Marketing Roles**: Emphasize customer engagement, conversion rates, market expansion, relationship building

7. **STRATEGIC SKILL ENHANCEMENT**:
   - Add technical skills from job description that the candidate likely has but didn't mention
   - Reorganize skills to prioritize job-relevant technologies
   - Include both hard and soft skills mentioned in job posting
   - Use exact terminology from job description (e.g., if job says "React.js", use "React.js" not "React")

8. **PROFESSIONAL SUMMARY OVERHAUL**:
   - Completely rewrite to sound like the perfect candidate for this specific role
   - Include years of experience in relevant areas
   - Mention key technologies and methodologies from job description
   - Highlight leadership/collaboration aspects if mentioned in job posting

9. **MANDATORY CONTENT PRESERVATION AND BULLET POINT RULES**:
   - {length_guidance}
   - **PRESERVE ALL EXPERIENCE ENTRIES** from the original resume
   - 🚨 **CRITICAL**: **PRESERVE THE EXACT NUMBER OF BULLET POINTS** for each job - NEVER reduce the number
   - **BULLET POINT RULE**: If original Job A has 5 bullets, output Job A MUST have exactly 5 bullets
   - **NO COMBINING**: Never combine multiple original bullets into one output bullet
   - **NO ELIMINATION**: Never eliminate or skip any original bullet points
   - **ONE-TO-ONE MAPPING**: Each original bullet point must become exactly one enhanced bullet point
   - **MAINTAIN THE SAME LEVEL OF DETAIL** as the original resume
   - Only reorder experiences if it significantly improves relevance to the job
   - Transform and enhance existing content rather than removing it
   
   **BULLET POINT PRESERVATION EXAMPLES**:
   ✅ CORRECT: Original has 4 bullets → Output has 4 enhanced bullets
   ❌ WRONG: Original has 4 bullets → Output has 3 bullets (even if "better")
   ❌ WRONG: Original has 4 bullets → Output has 2 bullets (combining bullets)
   ❌ WRONG: Original has 4 bullets → Output has 5 bullets (adding new bullets)

10. **AVOID REDUNDANCY AND REPETITION**:
   - Use DIFFERENT action verbs for each bullet point (avoid repeating "Developed", "Built", "Implemented")
   - Ensure each bullet point highlights a UNIQUE aspect of the candidate's contributions
   - Vary sentence structures and lengths for better readability
   - Distribute key technologies across different bullets rather than clustering them
   - Show progressive responsibility and diverse skill application across experience entries
   - Each bullet should tell a different story about the candidate's capabilities

11. **ATS OPTIMIZATION**:
   - Use exact phrases from job description where appropriate
   - Include industry-standard terminology
   - Ensure keyword density is high but natural
   - Format for maximum ATS compatibility

12. **EDUCATION PRESERVATION**:
   - **DO NOT MODIFY THE EDUCATION SECTION**
   - Keep all education entries exactly as they appear in the original resume
   - Do not add coursework, projects, or details that weren't in the original
   - Preserve original degree names, institution names, dates, and any existing details

TRANSFORMATION EXAMPLES (PRESERVE ALL ORIGINAL POINTS):

**FOR CAREER TRANSITIONS** (Rephrasing Original Bullets):
- Original: "Developed web applications for e-commerce platform"
- Rephrased for Recruiter: "Created user-facing systems for customer engagement, demonstrating user experience focus and systematic thinking essential for candidate experience optimization"

- Original: "Managed database performance optimization reducing query time by 40%"  
- Rephrased for Product Manager: "Led performance improvement initiatives that enhanced system efficiency by 40%, showcasing data-driven decision making and process optimization skills crucial for product management"

- Original: "Collaborated with 3 teams to deliver quarterly releases"
- Rephrased for Sales Role: "Coordinated with multiple stakeholders to achieve quarterly deliverables, demonstrating relationship management and goal-oriented execution vital for sales success"

**FOR STANDARD OPTIMIZATION** (Enhancement Approach):
- Original: "Developed web applications" → "Built responsive React.js applications with Node.js backend and AWS deployment"
- Original: "Worked with databases" → "Designed and optimized PostgreSQL databases, implemented complex queries for data analytics"
- Original: "Team collaboration" → "Led cross-functional Agile teams using Scrum methodology, facilitated daily standups and sprint planning"

**CRITICAL RULE**: Every bullet point must be based on an original bullet from the candidate's resume - never create entirely new accomplishments.
- **IMPORTANT**: If original has 6 bullet points, output must have 6 bullet points (enhanced, not removed)

🚨🚨🚨 **FINAL BULLET POINT VALIDATION BEFORE SUBMITTING** 🚨🚨🚨:

**MANDATORY PRE-SUBMISSION CHECK**:
1. **COUNT ORIGINAL BULLETS**: The original resume has {original_structure['bullet_points']} total bullet points
2. **COUNT YOUR OUTPUT BULLETS**: Count every bullet point in your JSON response
3. **VERIFY EXACT MATCH**: Your output must have EXACTLY {original_structure['bullet_points']} bullet points
4. **CHECK EACH JOB**: Verify each job has the same number of bullets as the original
5. **NO SHORTCUTS**: Do not combine, eliminate, or reduce bullet points for any reason

**IF COUNTS DON'T MATCH**: 
- STOP and revise your response
- Add missing bullet points by enhancing original content
- Never submit a response with fewer bullets than the original

**BULLET POINT ACCOUNTABILITY**:
- Original total: {original_structure['bullet_points']} bullets
- Your output total: _____ bullets (YOU MUST COUNT THIS)
- Match required: YES ✅ / NO ❌

OUTPUT FORMAT:
Provide your response in the following JSON structure:

{{
  "full_name": "Full Name from Resume",
  "contact_info": "Email | Phone | LinkedIn | Location",
  "professional_summary": "2-3 sentences that make this candidate sound perfect for the target role, incorporating key job requirements and technologies (under 100 words)",
  "skills": [
    "Include ALL relevant technical skills from job description",
    "Prioritize job-mentioned technologies first",
    "Add related skills candidate likely has",
    "Use exact terminology from job posting",
    "Maximum 15 skills total, most relevant first"
  ],
  "experience": [
    {{
      "title": "Job Title (you may enhance this to be more relevant to target role)",
      "company": "EXACT COMPANY NAME FROM ORIGINAL RESUME - NEVER CHANGE THIS",
      "dates": "EXACT DATES FROM ORIGINAL RESUME - NEVER CHANGE THIS",
      "achievements": [
        "COMPLETELY rewritten bullet focusing on job-relevant impact with specific technologies/methodologies",
        "Quantified achievement using job description terminology and relevant metrics",
        "Another transformed bullet that showcases skills mentioned in job posting",
        "🚨 CRITICAL: PRESERVE ALL ORIGINAL BULLET POINTS - if original has 6 bullets, output must have EXACTLY 6 bullets",
        "Each bullet should be 1-2 lines, highly targeted to job requirements",
        "Transform existing content rather than removing it - NEVER reduce bullet count",
        "⚠️ REMINDER: Count your bullets - this job must have same number as original job",
        "Every original bullet point must become exactly one enhanced bullet point"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "EXACT degree name from original resume - DO NOT CHANGE",
      "institution": "EXACT institution name from original resume - DO NOT CHANGE", 
      "dates": "EXACT dates from original resume - DO NOT CHANGE",
      "details": "EXACT details from original resume if any existed - DO NOT ADD NEW CONTENT"
    }}
  ]
}}

**CRITICAL SUCCESS CRITERIA**:
- 🚨 **BULLET POINT PRESERVATION**: Same number of jobs, EXACT SAME NUMBER of bullet points per job (original: {original_structure['bullet_points']} total bullets → output: {original_structure['bullet_points']} total bullets)
- **NEVER CHANGE COMPANY NAMES**: All company names must remain exactly as they appear in the original resume
- **NEVER CHANGE EMPLOYMENT DATES**: All employment dates must remain exactly as they appear in the original resume
- Every bullet point should feel like it was written specifically for this job
- Resume should contain 80%+ of the technical keywords from job description
- Candidate should sound like the ideal fit based on resume content
- Maintain truthfulness - enhance and reframe, don't fabricate experiences
- Final resume should be significantly different from original while staying factual and complete
- **EDUCATION SECTION MUST REMAIN COMPLETELY UNCHANGED FROM ORIGINAL**
- **NO CONTENT SHOULD BE LOST** - only enhanced and optimized
- 🚨 **FINAL CHECK**: Count your output bullets - must equal {original_structure['bullet_points']} exactly

**REMEMBER**: This is not just editing - this is a complete strategic transformation to make this candidate irresistible for this specific role. However, you must NEVER change company names, employment dates, or education details. The candidate's work history integrity is sacred and must be preserved exactly as provided.

Return ONLY the JSON structure with the completely optimized resume content. No explanations or notes.
"""

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
