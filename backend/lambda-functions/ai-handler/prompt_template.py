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
    print(f"Original resume structure: {original_structure}")
    
    # Extract job keywords using comprehensive method (only if job description provided)
    job_keywords = []
    if job_description and job_description.strip():
        job_keywords = extract_job_keywords(job_description)
        print(f"Extracted job keywords: {job_keywords}")
    else:
        print("No job description provided - optimizing for general job title")
    
    # Estimate page count
    original_page_count = estimate_page_count(resume_text)
    print(f"Estimated original resume page count: {original_page_count}")
    
    # Determine content preservation guidance - same rule for all resume lengths
    length_guidance = "Preserve all original content while optimizing for keywords. Maintain the same number of experience entries and bullet points as the original resume."
    
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
- **NEVER CHANGE COMPANY NAMES**: All company names must remain exactly as they appear in the original resume
- **NEVER CHANGE EMPLOYMENT DATES**: All employment dates must remain exactly as they appear in the original resume
- Every bullet point should feel like it was written specifically for this job
- Resume should contain 80%+ of the technical keywords from job description
- Candidate should sound like the ideal fit based on resume content
- Maintain truthfulness - enhance and reframe, don't fabricate experiences
- Final resume should be significantly different from original while staying factual and complete
- **EDUCATION SECTION MUST REMAIN COMPLETELY UNCHANGED FROM ORIGINAL**
- **NO CONTENT SHOULD BE LOST** - only enhanced and optimized

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
