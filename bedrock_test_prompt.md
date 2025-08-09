# Resume Optimization Prompt Template for Bedrock Testing

## Instructions for Use:
1. Replace all variables in `{curly_braces}` with actual values
2. Copy the complete prompt and paste it into Amazon Bedrock console
3. Test with Claude 3.5 Sonnet or other supported models

## Variables to Replace:

- `{resume_text}` - The complete original resume text
- `{current_role}` - Current role extracted from resume (e.g., "Data Engineering Manager")
- `{job_title}` - Target job title (e.g., "Analytics Engineering Manager")
- `{company_name}` - Target company name (optional, can be empty)
- `{seniority_level}` - SENIOR/MID/JUNIOR/MANAGEMENT/EXECUTIVE
- `{role_type}` - TECHNICAL/MANAGEMENT/SALES/MARKETING/ANALYTICAL/etc.
- `{appropriate_verbs}` - Comma-separated action verbs (e.g., "Led, Managed, Mentored, Coordinated")
- `{experience_years}` - Total years of experience (e.g., "10")
- `{experience_analysis}` - How experience was calculated (e.g., "Calculated 10 years from 3 employment periods")
- `{experience_requirements}` - Job requirements if found (e.g., "5+ years experience")
- `{total_jobs_found}` - Number of job entries (e.g., "4")
- `{job_details_list}` - List of detected jobs (e.g., "- Data Engineer at Amazon\n- Senior Data Engineer at CGI")
- `{job_keywords}` - Extracted keywords from job description (e.g., "Python, SQL, AWS, Spark")
- `{summary_guidance}` - Professional summary guidance text

---

## Complete Prompt Template:

🚨🚨🚨 CRITICAL PRESERVATION RULES - READ FIRST 🚨🚨🚨

❌ ABSOLUTELY FORBIDDEN:
- Removing ANY company from work history
- Omitting ANY job experience from the original resume
- Skipping ANY employment entry
- Combining multiple jobs into one entry
- Deleting ANY work experience regardless of relevance
- Modifying ANY education entries (degree names, institutions, dates, details)

✅ MANDATORY REQUIREMENTS:
- Include EVERY SINGLE company mentioned in the original resume
- Preserve EVERY job entry structure (company, title, dates) from the original
- Maintain the COMPLETE work history timeline
- Keep ALL employment dates exactly as written
- Keep ALL education entries EXACTLY as written (degrees, institutions, dates, GPA, honors, details)
- TRANSFORM and OPTIMIZE all bullet point content for the target role
- NEVER remove entire job entries
- NEVER modify education section content

🚨 STEP 1: ANALYZE ORIGINAL RESUME STRUCTURE 🚨

Before optimizing, you MUST analyze the original resume and identify:

1. **Count all bullet points/achievement statements** in the experience section
   - Look for: explicit bullets (•, -, *), numbered lists (1., 2.), indented achievements, paragraph-style accomplishments
   - Include ALL types: traditional bullets, achievement statements, responsibility descriptions, accomplishment paragraphs
   - Count EVERYTHING that describes work activities, achievements, or responsibilities

2. **Count all job entries** in work history
   - Each company/position combination = 1 job entry
   - Include ALL employment, even short-term or less relevant positions

3. **Analyze structure per job**
   - How many achievement/bullet statements does each job have?
   - What's the format (bullets, paragraphs, numbered lists)?

🚨 STEP 2: STRUCTURE PRESERVATION REQUIREMENT 🚨

Your output MUST have:
- EXACT same number of job entries as original
- EXACT same number of achievement statements per job as original
- SAME overall structure (if original has 4 jobs with 3, 5, 2, 4 bullets respectively, output must have 4 jobs with 3, 5, 2, 4 bullets)

ORIGINAL RESUME:
{resume_text}

CURRENT ROLE (from resume): {current_role}
TARGET JOB: {job_title}
COMPANY: {company_name}

🎯 TARGET ROLE ANALYSIS 🎯:
Seniority Level: {seniority_level}
Role Type: {role_type}
Appropriate Action Verbs: {appropriate_verbs}

CANDIDATE EXPERIENCE ANALYSIS:
Total Work Experience: {experience_years} years ({experience_analysis})
Job Requirements: {experience_requirements}
Use this information to align professional summary with job requirements.

WORK HISTORY ANALYSIS: Found {total_jobs_found} distinct job entries in work history
You MUST include EXACTLY {total_jobs_found} job entries in your output.

DETECTED JOBS IN ORIGINAL RESUME:
{job_details_list}

CAREER TRANSITION ASSESSMENT:
Analyze if this is a major career transition vs. career advancement:
- Current: {current_role}  
- Target: {job_title}

Examples of MAJOR CAREER TRANSITIONS (Different Domains/Fields/Industries):
❌ Design Engineer → Software Engineer (mechanical/civil → software domain)
❌ Marketing Manager → Data Scientist (marketing → data science field)  
❌ Mechanical Engineer → Product Manager (engineering → business function)
❌ Teacher → Software Developer (education → technology industry)
❌ Accountant → UX Designer (finance → design field)
❌ Sales Representative → Data Analyst (sales → analytics domain)
❌ Nurse → Project Manager (healthcare → business management)
❌ Graphic Designer → Software Engineer (design → programming domain)
❌ Operations Manager → Marketing Manager (operations → marketing function)
❌ Research Scientist → Business Analyst (research → business domain)

Examples of CAREER ADVANCEMENT (Same Domain, Higher Level/Responsibility):
✅ Software Engineer → Senior Software Engineer (technical progression)
✅ Software Engineer → Engineering Manager (IC → management advancement)
✅ Data Analyst → Senior Data Analyst (level progression)
✅ Data Analyst → Data Science Manager (IC → management advancement)
✅ Marketing Coordinator → Marketing Manager (level advancement)
✅ Product Manager → Senior Product Manager (seniority advancement)
✅ Developer → Lead Developer → Engineering Director (career ladder progression)
✅ Designer → Senior Designer → Design Manager (design career advancement)
✅ Sales Associate → Sales Manager → Sales Director (sales career progression)
✅ Financial Analyst → Senior Financial Analyst → Finance Manager (finance advancement)

Examples of SAME/RELATED ROLES (Lateral or Skill Expansion):
✅ Frontend Developer → Full Stack Developer (skill expansion)
✅ Data Analyst → Data Engineer (related technical field)
✅ Backend Engineer → DevOps Engineer (related technical specialization)
✅ Product Manager → Technical Product Manager (specialization)
✅ Marketing Specialist → Digital Marketing Manager (specialization + advancement)
✅ Business Analyst → Product Owner (related business role)

BULLET POINT MODIFICATION STRATEGY:

IF MAJOR CAREER TRANSITION (Different Domains/Fields/Industries):
   - Job description provided: Completely rewrite each bullet using job technologies: {job_keywords}
   - Transform the story to show transferable skills for {job_title}
   - Example: "Designed mechanical systems for automotive" → "Developed systematic solutions using Python and SQL for data processing applications"
   - Keep achievements/metrics but change the domain completely
   - Use appropriate action verbs for target role: {appropriate_verbs}

IF CAREER ADVANCEMENT (Same Domain, Higher Level/Management):
   - Job description provided: Reframe existing work to show leadership and higher-level impact
   - Transform IC work to show management capabilities: "Built feature" → "Led development of feature, mentoring 3 junior developers"
   - Emphasize team leadership, strategic thinking, and business impact
   - Use management action verbs: Led, Managed, Mentored, Coordinated, Directed, Supervised, Guided, Strategized
   - Example: "Developed API endpoints" → "Led API development initiative, coordinating with 3 teams and mentoring junior developers"

IF SAME/RELATED ROLE (Lateral or Skill Expansion):
   - Job description provided: Keep original story/context, update technologies: {job_keywords}
   - Example: "Built data pipeline using MySQL" → "Built data pipeline using PostgreSQL"
   - Preserve the work context, enhance with job-relevant tools
   - Use appropriate action verbs for seniority level: {appropriate_verbs}

🚨 ACTION VERB REQUIREMENTS 🚨:
- MANAGEMENT ROLES: Must use "Led, Managed, Mentored, Coordinated, Directed, Supervised, Guided, Strategized"
- SENIOR IC ROLES: Must use "Architected, Led, Spearheaded, Drove, Established, Mentored, Pioneered"
- MID-LEVEL ROLES: Use "Developed, Built, Implemented, Created, Designed, Optimized, Delivered"
- JUNIOR ROLES: Use "Assisted, Supported, Contributed, Participated, Collaborated, Learned"
- NEVER use "Implemented, Developed, Built" for management roles - these are IC verbs

🚨 STEP 3: STRUCTURE VERIFICATION 🚨

Before providing your final output, INTERNALLY verify your analysis (do not include this in the JSON):
- Count: Original resume has X job entries with Y total achievement statements
- Verify: Job 1 has Z achievement statements, Job 2 has W achievement statements, etc.
- Confirm: My output has X job entries with Y total achievement statements (EXACT MATCH)

OUTPUT FORMAT (JSON ONLY - NO ANALYSIS TEXT):
{
  "full_name": "Name from resume",
  "contact_info": "Email | Phone | Location", 
  "professional_summary": "{summary_guidance}",
  "skills": ["Technologies relevant to {job_title}"],
  "experience": [
    {
      "title": "RESEARCH-BASED title that actually exists at this specific company for {job_title} progression",
      "company": "EXACT company name - NEVER CHANGE THIS",
      "dates": "EXACT dates - NEVER CHANGE THIS",
      "achievements": [
        "Bullet 1 - COMPLETELY REWRITTEN and optimized for {job_title} role using appropriate action verbs",
        "Bullet 2 - TRANSFORMED content using career transition strategy", 
        "Bullet 3 - ENHANCED with relevant technologies and impact metrics",
        "MUST have EXACT same number of bullets as original job but FULLY OPTIMIZED content"
      ]
    }
  ],
  "education": [
    {
      "degree": "EXACT from original - NEVER CHANGE ANYTHING",
      "institution": "EXACT from original - NEVER CHANGE ANYTHING", 
      "dates": "EXACT from original - NEVER CHANGE ANYTHING",
      "details": "EXACT from original if present - NEVER CHANGE ANYTHING (GPA, honors, coursework, etc.)"
    }
  ]
}

🚨 CRITICAL: Return ONLY the JSON object above. Do NOT include any analysis text, explanations, or structure verification in your response. The structure analysis should be done internally to guide your work, but not included in the output.

---

## Example Variable Values for Testing:

For the resume you mentioned, here are example values you can use:

```
{resume_text} = [Paste the complete resume text here]

{current_role} = "Data Engineering Manager"

{job_title} = "Analytics Engineering Manager"

{company_name} = "PurposeCare"

{seniority_level} = "MANAGEMENT"

{role_type} = "TECHNICAL"

{appropriate_verbs} = "Led, Managed, Mentored, Coordinated, Directed, Supervised, Guided, Strategized, Architected, Spearheaded"

{experience_years} = "10"

{experience_analysis} = "Calculated 10 years from 4 employment periods (2010 to 2025)"

{experience_requirements} = "5+ years experience in analytics engineering or related field"

{total_jobs_found} = "4"

{job_details_list} = "- Data Engineering Manager at Amazon
- Senior Data Engineer at CGI  
- Data Engineer at Tech Mahindra
- Systems Engineer at Infosys"

{job_keywords} = "Python, SQL, Analytics, Data Engineering, ETL, AWS, Spark, Machine Learning, Data Modeling"

{summary_guidance} = "Brief summary with 10+ years of experience positioning candidate for Analytics Engineering Manager"
```

## Testing Steps:

1. **Copy the template above**
2. **Replace all {variables} with actual values**
3. **Paste into Bedrock console**
4. **Select Claude 3.5 Sonnet model**
5. **Run the prompt**
6. **Compare output with your application's results**

This will help you test the exact same prompt logic that's running in your Lambda function!
