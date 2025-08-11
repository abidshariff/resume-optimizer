#!/usr/bin/env python3

import sys
sys.path.append('/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler')

from rtf_word_generator import create_rtf_word_resume

# Test data
resume_json = {
    "full_name": "ABID SHAIK",
    "contact_info": "abidshaik009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
    "professional_summary": "Accomplished Data Engineering Manager with 15+ years of experience leading high-impact teams in designing scalable data architectures and driving enterprise-wide analytics solutions.",
    "skills": ["Data Pipeline Architecture", "Team Leadership & Mentorship", "AWS Cloud Solutions", "SQL/Python Optimization", "Data Governance Frameworks"],
    "experience": [{
        "title": "Data Engineering Manager",
        "company": "Amazon",
        "dates": "Dec '20 — Present",
        "achievements": [
            "Led team in developing AI-powered data discovery platform using AWS Bedrock",
            "Directed architecture of enterprise metrics library with 200+ standardized KPIs"
        ]
    }],
    "education": [{
        "degree": "Masters in Information Systems",
        "institution": "University at Buffalo",
        "dates": "2010"
    }]
}

# Generate Word document
try:
    word_content = create_rtf_word_resume(resume_json)
    
    # Save to file
    with open('/Users/shikbi/Downloads/test_resume.docx', 'wb') as f:
        f.write(word_content)
    
    print("Word document created successfully: /Users/shikbi/Downloads/test_resume.docx")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
