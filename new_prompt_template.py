# Simple, effective prompt template for resume optimization

def create_simple_prompt(resume_text, job_description, job_keywords):
    """
    Create a clean, focused prompt that doesn't hallucinate technologies.
    """
    
    prompt = f"""You are a professional resume optimizer. Your job is to enhance the provided resume to better match the job description while staying truthful about the candidate's experience.

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

INSTRUCTIONS:
1. Only add skills that are explicitly mentioned in the job description
2. Only enhance experience bullets with technologies that make logical sense given the candidate's background
3. Do not add technologies that aren't in the job description
4. Preserve all original experience entries and education exactly as written
5. Keep the same number of bullet points per job

REQUIRED OUTPUT FORMAT (JSON only):
{{
  "full_name": "Extract from original resume",
  "contact_info": "Extract from original resume", 
  "professional_summary": "2-3 sentences highlighting relevant experience for this specific job",
  "skills": [
    "Only include skills mentioned in the job description",
    "Only add if candidate has related experience",
    "Use exact terminology from job posting"
  ],
  "experience": [
    {{
      "title": "Exact title from original resume",
      "company": "Exact company from original resume",
      "dates": "Exact dates from original resume",
      "achievements": [
        "Enhance original bullets with job-relevant keywords where logical",
        "Keep same number of bullets as original",
        "Only mention technologies from the job description",
        "Maintain truthfulness about candidate's actual work"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "Exact degree from original - DO NOT CHANGE",
      "institution": "Exact institution from original - DO NOT CHANGE", 
      "dates": "Exact dates from original - DO NOT CHANGE",
      "details": "Exact details from original if any - DO NOT ADD NEW"
    }}
  ]
}}

Return only the JSON. No explanations."""

    return prompt


def create_keyword_focused_prompt(resume_text, job_description, extracted_keywords):
    """
    Alternative approach focusing specifically on extracted keywords
    """
    
    keywords_str = ", ".join(extracted_keywords) if extracted_keywords else "No specific keywords extracted"
    
    prompt = f"""Optimize this resume for the job by incorporating relevant keywords naturally.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

KEYWORDS FOUND IN JOB: {keywords_str}

RULES:
- Only use keywords that actually appear in the job description
- Only add skills the candidate could realistically have
- Enhance existing experience bullets, don't create new ones
- Keep education section unchanged

Output as JSON:
{{
  "full_name": "...",
  "contact_info": "...",
  "professional_summary": "...",
  "skills": ["only job-relevant skills"],
  "experience": [
    {{
      "title": "...",
      "company": "...", 
      "dates": "...",
      "achievements": ["enhanced bullets with job keywords where appropriate"]
    }}
  ],
  "education": [
    {{
      "degree": "unchanged",
      "institution": "unchanged",
      "dates": "unchanged", 
      "details": "unchanged"
    }}
  ]
}}"""

    return prompt


def create_minimal_prompt(resume_text, job_description):
    """
    Ultra-simple prompt that just focuses on keyword matching
    """
    
    prompt = f"""Match this resume to the job description by adding relevant keywords naturally.

RESUME: {resume_text}

JOB: {job_description}

Rules:
1. Only add skills mentioned in the job description
2. Only enhance bullets with technologies from the job description  
3. Keep all original content structure
4. Output JSON format with: full_name, contact_info, professional_summary, skills, experience, education

JSON only:"""

    return prompt
