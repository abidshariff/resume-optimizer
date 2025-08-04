"""
REPLACE the entire prompt section in index.py (around lines 900-1100) with this clean version:
"""

# Replace this entire section in your index.py:
# Find the line that starts: prompt = f"""You are an expert ATS resume optimizer...
# And replace everything until the line that ends with: Return ONLY the JSON structure...

def get_clean_prompt(resume_text, job_description, job_keywords, original_page_count, original_structure, length_guidance):
    """
    Clean, simple prompt that actually works
    """
    
    keywords_text = ', '.join(job_keywords) if job_keywords else 'No specific keywords extracted'
    
    prompt = f"""You are a professional resume optimizer. Enhance the resume to match the job description using only technologies and skills mentioned in the job posting.

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

TECHNOLOGIES FOUND IN JOB DESCRIPTION: {keywords_text}

REQUIREMENTS:
1. Only add skills that are explicitly mentioned in the job description above
2. Never add technologies not mentioned in the job description
3. Only enhance experience bullets with technologies that make sense for the candidate's role
4. Preserve all original job titles, companies, dates exactly as written
5. Keep the same number of experience entries as the original resume
6. Keep the same number of bullet points per job as the original resume
7. Do not modify the education section

CONTENT PRESERVATION: {length_guidance}

OUTPUT FORMAT - Return only this JSON structure:

{{
  "full_name": "Full name from the original resume",
  "contact_info": "Contact information from the original resume",
  "professional_summary": "2-3 sentences highlighting the candidate's most relevant qualifications for this specific job",
  "skills": [
    "Only include skills that appear in the job description",
    "Only add if the candidate has relevant experience to support them",
    "Use exact terminology from the job posting"
  ],
  "experience": [
    {{
      "title": "Exact job title from original resume",
      "company": "Exact company name from original resume",
      "dates": "Exact dates from original resume",
      "achievements": [
        "Original bullet point enhanced with relevant keywords from job description",
        "Keep the same number of bullets as the original resume",
        "Only mention technologies that appear in the job description",
        "Maintain authenticity - only add technologies that make sense for this role"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "Exact degree from original resume - do not change",
      "institution": "Exact institution from original resume - do not change",
      "dates": "Exact dates from original resume - do not change",
      "details": "Exact details from original resume if any - do not add new content"
    }}
  ]
}}

Return only the JSON. No explanations."""

    return prompt

# INSTRUCTIONS FOR FIXING YOUR CODE:
# 1. In index.py, find the line around 900 that starts with: prompt = f"""You are an expert ATS resume optimizer...
# 2. Replace that entire prompt assignment with: prompt = get_clean_prompt(resume_text, job_description, job_keywords, original_page_count, original_structure, length_guidance)
# 3. Add the get_clean_prompt function above the lambda_handler function
# 4. Remove all the hardcoded examples mentioning Kafka, Flink, DBT, etc.
