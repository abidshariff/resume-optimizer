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
        # Enhanced date patterns to catch more formats
        patterns = [
            r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',  # 2020-2023, 2020 - Present
            r'(\d{1,2})/(\d{4})\s*[-–—]\s*(\d{1,2})/(\d{4})',  # 01/2020 - 12/2023
            r'(\d{1,2})/(\d{4})\s*[-–—]\s*(present|current)',  # 01/2020 - Present
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})',  # Jan 2020 - Dec 2023
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(present|current)',  # Jan 2020 - Present
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})',  # Dec '20 — Jun '15
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(present|current)',  # Dec '20 — Present
        ]
        
        line_lower = line.lower()
        
        # Try each pattern
        for pattern in patterns:
            matches = re.findall(pattern, line_lower)
            if matches:
                for match in matches:
                    if len(match) == 2:  # Simple year-year or year-present
                        start_year = int(match[0])
                        end_year = datetime.now().year if match[1] in ['present', 'current'] else int(match[1])
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 4 and match[2].isdigit():  # MM/YYYY - MM/YYYY
                        start_year = int(match[1])
                        end_year = int(match[3])
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 3 and match[2] in ['present', 'current']:  # MM/YYYY - Present or Month 'YY - Present
                        if match[1].isdigit() and len(match[1]) == 4:  # Full year
                            start_year = int(match[1])
                        else:  # Abbreviated year
                            year_val = int(match[1])
                            start_year = 2000 + year_val if year_val < 50 else 1900 + year_val
                        end_year = datetime.now().year
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 4 and match[3].isdigit():  # Month YYYY - Month YYYY or Month 'YY - Month 'YY
                        if match[1].isdigit() and len(match[1]) == 4:  # Full years
                            start_year = int(match[1])
                            end_year = int(match[3])
                        else:  # Abbreviated years
                            start_val = int(match[1])
                            end_val = int(match[3])
                            start_year = 2000 + start_val if start_val < 50 else 1900 + start_val
                            end_year = 2000 + end_val if end_val < 50 else 1900 + end_val
                        date_patterns.append((start_year, end_year))
    
    if not date_patterns:
        # Fallback: look for individual years and estimate
        years = re.findall(r'\b(20\d{2})\b', resume_text)
        if years:
            years = [int(y) for y in years]
            min_year = min(years)
            max_year = max(years)
            # More conservative estimate - assume gaps
            total_years = max(1, max_year - min_year)
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


def get_resume_optimization_prompt(resume_text, job_description, job_title, company_name, keywords_text):
    """
    Resume optimization prompt with integrated new template
    """
    
    # Calculate experience years
    experience_years = calculate_total_experience_years(resume_text)
    
    # Determine role type first, then seniority level
    role_type = "Technical"
    if any(word in job_title.lower() for word in ['manager', 'lead', 'director', 'head']):
        role_type = "Management"
    elif any(word in job_title.lower() for word in ['analyst', 'consultant', 'specialist']):
        role_type = "Analytical"
    
    # Determine seniority level - Management roles get "Management" seniority
    if role_type == "Management":
        seniority_level = "Management"
    elif any(word in job_title.lower() for word in ['senior', 'sr.', 'lead', 'principal', 'staff']):
        seniority_level = "Senior"
    elif any(word in job_title.lower() for word in ['junior', 'jr.', 'entry', 'associate']):
        seniority_level = "Junior"
    elif any(word in job_title.lower() for word in ['director', 'vp', 'head of', 'chief']):
        seniority_level = "Executive"
    else:
        seniority_level = "Mid-level"
    
    # Create action verbs list based on role type
    action_verbs = {
        "Technical": ["Developed", "Engineered", "Implemented", "Architected", "Optimized", "Built", "Designed", "Deployed"],
        "Management": ["Led", "Managed", "Directed", "Coordinated", "Supervised", "Guided", "Mentored", "Facilitated"],
        "Analytical": ["Analyzed", "Evaluated", "Assessed", "Investigated", "Researched", "Examined", "Interpreted", "Modeled"]
    }
    
    # Build experience requirements from job description or infer from title
    if job_description and job_description.strip():
        experience_requirements = job_description.strip()
    else:
        # Infer common requirements based on job title
        if 'engineer' in job_title.lower():
            experience_requirements = 'Software Development, System Design, Problem Solving, Technical Leadership'
        elif 'manager' in job_title.lower():
            experience_requirements = 'Team Leadership, Project Management, Strategic Planning, Cross-functional Collaboration'
        elif 'analyst' in job_title.lower():
            experience_requirements = 'Data Analysis, Research, Reporting, Business Intelligence'
        else:
            experience_requirements = 'Industry-standard skills and experience'

    # Print all variables before creating prompt
    print("=== PROMPT TEMPLATE VARIABLES DEBUG ===")
    print(f"Resume text length: {len(resume_text)} chars")
    print(f"Job description length: {len(job_description) if job_description else 0} chars")
    print(f"Job title: '{job_title}'")
    print(f"Company name: '{company_name}'")
    print(f"Keywords text: '{keywords_text}'")
    print(f"Experience years: {experience_years}")
    print(f"Seniority level: '{seniority_level}'")
    print(f"Role type: '{role_type}'")
    print(f"Action verbs: {action_verbs.get(role_type, [])}")
    print(f"Experience requirements: {experience_requirements}")
    print("=== END PROMPT VARIABLES DEBUG ===")

    prompt = f"""# Resume Optimization Assistant
## TASK OVERVIEW
You are an expert resume editor tasked with optimizing a resume to target a specific job while preserving the original structure and factual accuracy. Your goal is to:
- Transform job titles, bullet points and summaries to highlight the most relevant skills and achievements for the target job
- Ensure the candidate appears as an established, experienced professional in the target role
- Optimize for ATS keyword alignment using job description keywords.

## CORE PRINCIPLES
<preservation_rules>
- PRESERVE all job entries (companies, dates) exactly as in the original resume unless.
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
If the target role ({job_title}) has a known equivalent at the company in that time period, replace the original title with the equivalent title that aligns with both the target role and the company's actual naming conventions. If not, then replace it with a company title that suits the target role. Ensure that job title you replace in the latest experience matches to {seniority_level} and {role_type}. Titles must remain factually plausible based on the candidate's described responsibilities and seniority. When possible, adapt generic engineering titles into the target role if the responsibilities clearly overlap (e.g., "Senior Data Engineer" → "Senior Business Intelligence Engineer" if target is BI and work involved BI-related tasks).

Example: Original: "Software Developer" at Google
Optimized: "Software Engineer II" (if verified as realistic for that role at Google)

### STEP 4: BULLET POINT OPTIMIZATION
<optimization_strategy>
When job description is provided:
- Use {experience_requirements} as the foundation
- Rewrite bullets to align with target role requirements
- Integrate action verbs from {', '.join(action_verbs.get(role_type, action_verbs['Technical']))}
- Ensure each bullet adds unique value, avoids repetition, and reflects measurable impact

When job description is not provided:
- Use industry standards for {job_title} to guide bullet rewrites
- Ensure all bullets sound like they come from a seasoned professional already in that role
</optimization_strategy>

### STEP 5: PROFESSIONAL SUMMARY OPTIMIZATION
- Portray candidate as a proven, highly skilled {job_title} with {experience_years['total_years']}+ years of directly relevant experience
- Highlight mastery in {experience_requirements}
- Avoid all transition language
- Include ATS-friendly keywords naturally

---

## INPUT DATA
<resume_data>
Original Resume: {resume_text}

Current Role: [Extract from resume]
Target Job: {job_title}
Target Company: {company_name if company_name else 'Not specified'}
Seniority Level: {seniority_level}
Role Type: {role_type}
Appropriate Action Verbs: {', '.join(action_verbs.get(role_type, action_verbs['Technical']))}
Total Work Experience: {experience_years['total_years']} years
Job Requirements: {experience_requirements}
</resume_data>

## OUTPUT FORMAT
Return ONLY a JSON object in the exact structure below — no extra commentary or notes:

{{
  "full_name": "Exact name from resume",
  "contact_info": "Email | Phone | Location",
  "professional_summary": "Confident, ATS-optimized summary presenting candidate as an established, highly skilled {job_title} with {experience_years['total_years']}+ years of directly relevant experience, demonstrating mastery in {experience_requirements} and delivering measurable results in the field.",
  "skills": ["Technologies and competencies relevant to {job_title}"],
  "experience": [
    {{
      "title": "Research-based or original title, optimized only if it increases realism",
      "company": "Exact company name from original",
      "dates": "Exact dates from original",
      "achievements": [
        "Optimized bullet 1 with strong action verbs and target role alignment",
        "Optimized bullet 2 with unique skill or achievement relevant to {job_title}",
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

CRITICAL: Return ONLY the JSON object. No explanations, no reasoning, no markdown formatting, no code blocks. Just the raw JSON starting with {{ and ending with }}.
"""

    return prompt
