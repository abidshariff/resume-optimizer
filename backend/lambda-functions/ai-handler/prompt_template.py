"""
Resume Optimization Prompt Template

This file contains the AI prompt template used for resume optimization.
Based on the proven methodology from the GitHub repository.
Edit this file to modify the AI's behavior and instructions.
"""

def analyze_resume_structure(resume_text):
    """Analyze the original resume to understand its structure and content density."""
    lines = resume_text.split('\n')
    bullet_points = [line for line in lines if line.strip().startswith('•') or line.strip().startswith('-') or line.strip().startswith('*')]
    
    # Estimate number of experience sections
    experience_indicators = ['experience', 'work history', 'employment', 'professional background']
    education_indicators = ['education', 'academic', 'degree', 'university', 'college']
    
    experience_sections = 0
    for line in lines:
        line_lower = line.lower()
        if any(indicator in line_lower for indicator in experience_indicators):
            experience_sections += 1
    
    return {
        'total_lines': len(lines),
        'bullet_points': len(bullet_points),
        'estimated_experience_sections': max(1, experience_sections),
        'avg_bullets_per_section': len(bullet_points) // max(1, experience_sections) if experience_sections > 0 else len(bullet_points)
    }


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
    Generate the complete prompt for resume optimization using the proven GitHub methodology.
    
    Args:
        resume_text (str): The original resume content
        job_description (str): The job description to optimize for
        job_title (str): The specific job title to target
        company_name (str): The company name (optional)
        keywords_text (str): Extracted keywords from the job description (legacy parameter)
        length_guidance (str): Content preservation guidance
    
    Returns:
        str: The complete formatted prompt
    """
    
    # Analyze resume structure
    original_structure = analyze_resume_structure(resume_text)
    print(f"Original resume structure: {original_structure}")
    
    # Extract job keywords using comprehensive method
    job_keywords = extract_job_keywords(job_description)
    print(f"Extracted job keywords: {job_keywords}")
    
    # Estimate page count
    original_page_count = estimate_page_count(resume_text)
    print(f"Estimated original resume page count: {original_page_count}")
    
    # Determine content preservation guidance - same rule for all resume lengths
    length_guidance = "Preserve all original content while optimizing for keywords. Maintain the same number of experience entries and bullet points as the original resume."
    
    prompt = f"""
You are an expert ATS resume optimizer and career consultant. Your mission is to COMPLETELY TRANSFORM the provided resume to perfectly match the job description while maintaining truthfulness about the candidate's background.

ORIGINAL RESUME:
{resume_text}

TARGET JOB TITLE: {job_title}
{f"TARGET COMPANY: {company_name}" if company_name else ""}

TARGET JOB DESCRIPTION:
{job_description}

EXTRACTED KEY TECHNOLOGIES/SKILLS FROM JOB: {', '.join(job_keywords) if job_keywords else 'General skills optimization'}

ORIGINAL RESUME LENGTH: Approximately {original_page_count} page(s)
ORIGINAL RESUME STRUCTURE: {original_structure['total_lines']} lines, {original_structure['bullet_points']} bullet points, estimated {original_structure['estimated_experience_sections']} experience sections

CRITICAL OPTIMIZATION REQUIREMENTS:

1. **TARGET ROLE ALIGNMENT**: 
   - Optimize the entire resume specifically for the "{job_title}" position{f" at {company_name}" if company_name else ""}
   - Ensure the professional summary clearly positions the candidate for this exact role{f" and company culture" if company_name else ""}
   - Align all experience descriptions to demonstrate relevance to "{job_title}" responsibilities
   - Use terminology and keywords that hiring managers for "{job_title}" positions expect to see
   {f"- Research and incorporate {company_name}'s values, culture, and industry focus where appropriate" if company_name else ""}

2. **AGGRESSIVE KEYWORD INTEGRATION**: 
2. **AGGRESSIVE KEYWORD INTEGRATION**: 
   - Identify ALL technical skills, tools, frameworks, and buzzwords from the job description
   - Integrate these keywords naturally throughout the resume, especially in experience bullets
   - If the candidate has ANY related experience, reframe it using job description terminology
   - Add relevant keywords to skills section even if not explicitly mentioned in original resume (but candidate likely has exposure)

3. **JOB TITLE ALIGNMENT IN EXPERIENCE**:
   - Update job titles in the experience section to align with the target "{job_title}" role
   - Use progressive title evolution showing growth toward the target position (e.g., "Software Engineer" → "Senior Software Engineer" → "Lead Software Engineer")
   - Replace generic titles with industry-standard titles that match the target role terminology
   - Ensure consistency in title terminology throughout the resume
   - Maintain truthfulness while using more relevant and impactful job titles
   - Show clear career progression that logically leads to the target "{job_title}" position

4. **STRATEGIC EXPERIENCE ENHANCEMENT**:
   - **PRESERVE the core story and context** of each original bullet point
   - **ENHANCE with relevant technical details** that would logically be part of the work described
   - **ADD industry-standard technologies** that align with the described responsibilities
   - **EXPAND on implied skills** that would naturally be involved in the original work
   - **REFRAME accomplishments** using job-relevant terminology and metrics
   - **MAINTAIN truthfulness** while maximizing keyword relevance
   - **AVOID major fabrications** like entirely new projects or drastically different roles - **do this only if absolutely necessary** to meet critical job requirements
   - **PRIORITIZE enhancement over invention** - exhaust all realistic enhancements before considering fabrication

   **Enhancement Hierarchy:**
   1. **First**: Add logical technical details and industry terminology
   2. **Second**: Expand on implied responsibilities and skills
   3. **Third**: Add reasonable metrics and quantifications
   4. **Last Resort**: Create new elements only when essential for job match

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
   - REWRITE every single bullet point to align with job requirements
4. **COMPLETE EXPERIENCE TRANSFORMATION**:
   - REWRITE every single bullet point to align with job requirements
5. **COMPLETE EXPERIENCE TRANSFORMATION**:
   - REWRITE every single bullet point to align with job requirements
6. **COMPLETE EXPERIENCE TRANSFORMATION**:
   - REWRITE every single bullet point to align with job requirements
   - Transform generic accomplishments into role-specific achievements
   - Use action verbs and terminology that match the job description exactly
   - Quantify achievements wherever possible, even if you need to reframe existing numbers
   - Focus on impact and results that matter for this specific role

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

9. **CONTENT PRESERVATION AND PRIORITIZATION**:
   - {length_guidance}
   - **PRESERVE ALL EXPERIENCE ENTRIES** from the original resume
   - **PRESERVE THE NUMBER OF BULLET POINTS** for each job - do not reduce the number
   - **MAINTAIN THE SAME LEVEL OF DETAIL** as the original resume
   - Only reorder experiences if it significantly improves relevance to the job
   - Transform and enhance existing content rather than removing it

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
- Original: "Developed web applications" → "Built responsive React.js applications with Node.js backend and AWS deployment"
- Original: "Worked with databases" → "Designed and optimized PostgreSQL databases, implemented complex queries for data analytics"
- Original: "Team collaboration" → "Led cross-functional Agile teams using Scrum methodology, facilitated daily standups and sprint planning"
- **IMPORTANT**: If original has 6 bullet points, output must have 6 bullet points (enhanced, not removed)

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
      "title": "Job Title (enhanced if needed to sound more relevant)",
      "company": "Company Name",
      "dates": "Start Date - End Date",
      "achievements": [
        "COMPLETELY rewritten bullet focusing on job-relevant impact with specific technologies/methodologies",
        "Quantified achievement using job description terminology and relevant metrics",
        "Another transformed bullet that showcases skills mentioned in job posting",
        "PRESERVE ALL ORIGINAL BULLET POINTS - if original has 6 bullets, output must have 6 bullets",
        "Each bullet should be 1-2 lines, highly targeted to job requirements",
        "Transform existing content rather than removing it"
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
- **PRESERVE ALL ORIGINAL CONTENT**: Same number of jobs, same number of bullet points per job
- Every bullet point should feel like it was written specifically for this job
- Resume should contain 80%+ of the technical keywords from job description
- Candidate should sound like the ideal fit based on resume content
- Maintain truthfulness - enhance and reframe, don't fabricate experiences
- Final resume should be significantly different from original while staying factual and complete
- **EDUCATION SECTION MUST REMAIN COMPLETELY UNCHANGED FROM ORIGINAL**
- **NO CONTENT SHOULD BE LOST** - only enhanced and optimized

**REMEMBER**: This is not just editing - this is a complete strategic transformation to make this candidate irresistible for this specific role. However, the education section should be preserved exactly as it appears in the original resume.

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
