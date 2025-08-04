# Replace the complex prompt in index.py with this simple version

def create_clean_prompt(resume_text, job_description, job_keywords):
    """
    Clean prompt that doesn't hallucinate technologies not in the job description
    """
    
    # Only include keywords that were actually found in the job description
    keywords_section = ""
    if job_keywords:
        keywords_section = f"\nKEY TECHNOLOGIES MENTIONED IN JOB: {', '.join(job_keywords)}"
    
    prompt = f"""You are a resume optimizer. Enhance this resume to match the job description using only information that appears in the job posting.

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}{keywords_section}

CRITICAL RULES:
1. ONLY add skills that are explicitly mentioned in the job description
2. NEVER add technologies not mentioned in the job description  
3. Only enhance experience with technologies the candidate could logically have used
4. Preserve all original job titles, companies, dates, and education exactly
5. Keep the same number of experience entries and bullet points

OUTPUT FORMAT (JSON only):
{{
  "full_name": "Name from resume",
  "contact_info": "Contact info from resume",
  "professional_summary": "Brief summary highlighting relevant experience for this job (2-3 sentences)",
  "skills": [
    "Only skills mentioned in the job description",
    "Only if candidate has relevant experience to support them"
  ],
  "experience": [
    {{
      "title": "Exact title from original resume",
      "company": "Exact company from original resume", 
      "dates": "Exact dates from original resume",
      "achievements": [
        "Original bullet enhanced with job-relevant keywords where logical",
        "Same number of bullets as original resume",
        "Only mention technologies from the job description"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "EXACT degree from original - unchanged",
      "institution": "EXACT institution from original - unchanged",
      "dates": "EXACT dates from original - unchanged",
      "details": "EXACT details from original if any - unchanged"
    }}
  ]
}}

Return only valid JSON. No explanations or additional text."""

    return prompt


# Alternative ultra-minimal version
def create_minimal_prompt(resume_text, job_description):
    """
    Minimal prompt for testing
    """
    
    prompt = f"""Optimize this resume for the job by adding relevant keywords from the job description only.

RESUME:
{resume_text}

JOB:
{job_description}

Rules:
- Only add skills mentioned in the job description
- Keep all original structure
- Output JSON with: full_name, contact_info, professional_summary, skills, experience, education

JSON:"""

    return prompt
