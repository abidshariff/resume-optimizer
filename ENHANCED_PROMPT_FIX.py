# Enhanced LLM Prompt for Better Skills-Experience Alignment
# This fixes the issue where core competencies update but experience bullets don't match

def create_enhanced_prompt(resume_text, job_description, job_keywords, original_page_count, original_structure, length_guidance):
    prompt = f"""
    You are an expert ATS resume optimizer and career consultant. Your mission is to COMPLETELY TRANSFORM the provided resume to perfectly match the job description while maintaining truthfulness about the candidate's background.

    ORIGINAL RESUME:
    {resume_text}

    TARGET JOB DESCRIPTION:
    {job_description}

    EXTRACTED KEY TECHNOLOGIES/SKILLS FROM JOB: {', '.join(job_keywords) if job_keywords else 'General skills optimization'}

    ORIGINAL RESUME LENGTH: Approximately {original_page_count} page(s)
    ORIGINAL RESUME STRUCTURE: {original_structure['total_lines']} lines, {original_structure['bullet_points']} bullet points, estimated {original_structure['estimated_experience_sections']} experience sections

    🎯 CRITICAL ALIGNMENT REQUIREMENT:
    **SKILLS AND EXPERIENCE MUST BE PERFECTLY ALIGNED**
    - If you add "Google Cloud" to skills, experience bullets MUST mention Google Cloud projects/work
    - If you add "React" to skills, experience bullets MUST show React development work
    - If you add "Python" to skills, experience bullets MUST demonstrate Python usage
    - NO SKILL should appear in the skills section without corresponding evidence in experience bullets

    CRITICAL OPTIMIZATION REQUIREMENTS:

    1. **TECHNOLOGY SUBSTITUTION AND ALIGNMENT**: 
       - IDENTIFY similar technologies between original resume and job requirements
       - SUBSTITUTE original technologies with job-required ones where logical
       - Example: If original mentions "AWS Lambda" and job needs "Google Cloud Functions", 
         change experience bullets to mention "Google Cloud Functions" instead
       - Example: If original mentions "MySQL" and job needs "PostgreSQL",
         update experience bullets to mention "PostgreSQL" work
       - ENSURE every skill in the skills section has supporting evidence in experience bullets

    2. **AGGRESSIVE KEYWORD INTEGRATION WITH EVIDENCE**: 
       - Identify ALL technical skills, tools, frameworks from job description
       - For EACH skill added to skills section, CREATE corresponding experience bullet evidence
       - Transform existing experience bullets to incorporate new technologies naturally
       - If candidate worked with similar technology, reframe using job description terminology
       - Add specific project examples using job-required technologies

    3. **COMPLETE EXPERIENCE TRANSFORMATION WITH TECHNOLOGY FOCUS**:
       - REWRITE every bullet point to include job-relevant technologies
       - Replace original technology mentions with job-required equivalents
       - Transform generic accomplishments into technology-specific achievements
       - Use exact technology names from job description
       - Quantify achievements with technology-specific metrics
       - Focus on impact using the technologies mentioned in job posting

    4. **CROSS-SECTION VALIDATION**:
       - After creating skills section, VERIFY each skill has evidence in experience
       - After creating experience section, VERIFY it supports all listed skills
       - Remove any skills that cannot be supported by experience bullets
       - Add experience details for any skills that lack supporting evidence

    5. **STRATEGIC SKILL ENHANCEMENT WITH PROOF**:
       - Add technical skills from job description that candidate likely has
       - For EACH new skill added, modify at least one experience bullet to show usage
       - Reorganize skills to prioritize job-relevant technologies
       - Use exact terminology from job description
       - Ensure skills section and experience section tell the same story

    6. **PROFESSIONAL SUMMARY TECHNOLOGY ALIGNMENT**:
       - Mention ONLY technologies that appear in both skills and experience sections
       - Include years of experience with job-relevant technologies
       - Highlight specific technology combinations mentioned in job posting
       - Ensure summary reflects the technology focus shown in experience

    7. **CONTENT PRESERVATION AND PRIORITIZATION**:
       - {length_guidance}
       - **PRESERVE ALL EXPERIENCE ENTRIES** from the original resume
       - **PRESERVE ALL BULLET POINTS** for each job - do not reduce the number
       - **MAINTAIN THE SAME LEVEL OF DETAIL** as the original resume
       - Transform existing content to include job-relevant technologies
       - Substitute similar technologies rather than adding unrelated ones

    8. **ATS OPTIMIZATION WITH CONSISTENCY**:
       - Use exact phrases from job description in both skills and experience
       - Ensure keyword density is high but natural across all sections
       - Maintain consistent technology terminology throughout resume
       - Format for maximum ATS compatibility

    9. **EDUCATION PRESERVATION**:
       - **DO NOT MODIFY THE EDUCATION SECTION**
       - Keep all education entries exactly as they appear in the original resume

    🔧 TECHNOLOGY TRANSFORMATION EXAMPLES:

    **Example 1: Cloud Platform Substitution**
    - Original Skill: "AWS"
    - Job Requires: "Google Cloud Platform"
    - Skills Section: Add "Google Cloud Platform, Compute Engine, Cloud Storage"
    - Experience Transformation: 
      - Original: "Deployed applications on AWS EC2 instances"
      - New: "Deployed applications on Google Cloud Compute Engine instances"
      - Original: "Used AWS S3 for file storage"
      - New: "Implemented file storage solutions using Google Cloud Storage"

    **Example 2: Programming Language Focus**
    - Original Skill: "Java"
    - Job Requires: "Python"
    - Skills Section: Emphasize "Python, Django, Flask, pandas"
    - Experience Transformation:
      - Original: "Developed backend services in Java"
      - New: "Developed backend services in Python using Django framework"
      - Original: "Built data processing applications"
      - New: "Built data processing applications using Python pandas and NumPy"

    **Example 3: Database Technology Alignment**
    - Original Skill: "MySQL"
    - Job Requires: "PostgreSQL"
    - Skills Section: Add "PostgreSQL, SQL optimization, database design"
    - Experience Transformation:
      - Original: "Managed MySQL databases"
      - New: "Designed and optimized PostgreSQL databases for high-performance applications"
      - Original: "Wrote complex SQL queries"
      - New: "Developed complex PostgreSQL queries with advanced indexing strategies"

    OUTPUT FORMAT:
    Provide your response in the following JSON structure:

    ```json
    {{
      "full_name": "Full Name from Resume",
      "contact_info": "Email | Phone | LinkedIn | Location",
      "professional_summary": "2-3 sentences mentioning ONLY technologies that appear in both skills and experience sections (under 100 words)",
      "skills": [
        "Job-relevant technologies that WILL BE MENTIONED in experience bullets",
        "Prioritize job-mentioned technologies first",
        "Use exact terminology from job posting",
        "Maximum 15 skills total, each must have experience evidence",
        "Remove any skills that cannot be supported by experience"
      ],
      "experience": [
        {{
          "title": "Job Title (enhanced if needed to sound more relevant)",
          "company": "Company Name", 
          "dates": "Start Date - End Date",
          "achievements": [
            "Bullet mentioning specific job-relevant technology with quantified impact",
            "Achievement using job-required tools/frameworks with specific metrics",
            "Technology-focused accomplishment that supports skills section claims",
            "EVERY bullet must include at least one technology from skills section",
            "Transform original technology mentions to job-relevant equivalents",
            "Maintain same number of bullets as original, just enhanced with relevant tech"
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
    ```

    🎯 **VALIDATION CHECKLIST BEFORE RESPONDING**:
    1. ✅ Every skill in skills section has supporting evidence in experience bullets
    2. ✅ Every experience bullet mentions at least one technology from skills section  
    3. ✅ Technology terminology is consistent between skills and experience
    4. ✅ Original technologies replaced with job-relevant equivalents where logical
    5. ✅ Professional summary only mentions technologies proven in experience
    6. ✅ Same number of experience entries and bullets as original resume
    7. ✅ Education section completely unchanged from original

    **CRITICAL SUCCESS CRITERIA**:
    - **PERFECT ALIGNMENT**: Skills section and experience section must tell the same technology story
    - **LOGICAL SUBSTITUTION**: Replace similar technologies rather than adding unrelated ones
    - **EVIDENCE-BASED**: Every skill claim must be backed by experience bullet proof
    - **CONSISTENCY**: Same technology terminology used throughout all sections
    - **PRESERVATION**: All original content preserved, just enhanced with relevant technologies

    Return ONLY the JSON structure with the completely optimized and aligned resume content. No explanations or notes.
    """
    
    return prompt
