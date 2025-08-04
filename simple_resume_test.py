#!/usr/bin/env python3
"""
Simple test to analyze what our prompt template would do with Abid's job requirements
"""

import sys
import os

# Add the ai-handler directory to the path
sys.path.append('/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler')

def test_prompt_generation():
    """Test what prompt would be generated for Abid's job requirements"""
    
    try:
        from prompt_template import get_resume_optimization_prompt, extract_job_keywords
        
        # Abid's job requirements
        job_title = "Senior Data Engineer"
        company_name = ""  # Optional - empty for this test
        
        job_description = """What You'll Do: 

Collaborate with product managers and engineers to build high-quality, scalable data solutions.

Develop reusable frameworks for data transformation, anomaly detection, and data quality improvements.

Take full ownership of business problems, from concept to implementation.

Support and maintain the reliability of core data systems, proactively resolving production issues. 

Evaluate new technologies and contribute ideas for continuous improvement. 

Build and maintain APIs for data access and systems integration. 

Help enforce and automate data governance processes in alignment with privacy regulations (e.g., CCPA). 

Work in an Agile/Scrum environment with a focus on delivering incremental value. 

What You'll Bring:

A driven data engineer that is motivated to build great products and a great codebase in a fast-paced environment with 5+ years of related experience.

Proficient in Python. Ability to work in other languages is desirable.

Proficient in DBT for modeling, testing and transforming data.

Experience with writing performant SQL queries for batch and real-time data processing using KSQL.

Understand the principles of stream processing and how frameworks like Kafka and Flink fits into the stream processing ecosystem.

Knowledge of API best practices and industry standards.

Familiar with AWS cloud-based architectures, development, revision control, test, and deployment automation.

Knowledge of event-driven architecture and design patterns. 

Ability to clearly document and communicate technical requirements.

Ability to perform technical presentations to Move's internal stakeholders.

Bachelor's degree in Computer Science/Engineering or related field or related experience."""

        # Sample resume text (since we can't easily extract from PDF)
        sample_resume_text = """Abid Shaik
Senior Data Engineer
(716) 970-9249 | abidshariff009@gmail.com | LinkedIn

PROFESSIONAL SUMMARY
Experienced Data Engineer with 6+ years of expertise in designing and implementing scalable data pipelines, ETL processes, and data warehousing solutions. Proficient in Python, SQL, and cloud technologies.

TECHNICAL SKILLS
• Programming: Python, SQL, Java, Scala
• Big Data: Apache Spark, Hadoop, Kafka
• Cloud: AWS (S3, EC2, Lambda, Redshift), Azure
• Databases: PostgreSQL, MySQL, MongoDB
• Tools: Docker, Kubernetes, Git, Jenkins

PROFESSIONAL EXPERIENCE

Senior Data Engineer | ABC Company | 2022 - Present
• Developed data pipelines processing 10TB+ daily data
• Built ETL processes using Python and Apache Spark
• Implemented real-time streaming solutions with Kafka
• Optimized database queries improving performance by 40%
• Collaborated with cross-functional teams on data initiatives

Data Engineer | XYZ Corp | 2020 - 2022
• Created automated data workflows using Python scripts
• Designed data models for business intelligence reporting
• Maintained data quality and governance standards
• Worked with stakeholders to understand data requirements

Junior Data Engineer | Tech Solutions | 2018 - 2020
• Assisted in building data extraction and transformation processes
• Performed data analysis and reporting tasks
• Supported database maintenance and optimization activities

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018"""

        print("🧪 Testing Prompt Generation for Abid's Resume")
        print("=" * 60)
        print(f"🎯 Job Title: {job_title}")
        print(f"🏢 Company: {company_name if company_name else 'Not specified'}")
        print()
        
        # Extract keywords from job description
        job_keywords = extract_job_keywords(job_description)
        print(f"🔑 Extracted Keywords from Job Description:")
        print(f"   {', '.join(job_keywords)}")
        print()
        
        # Generate the prompt
        skills_text = "Dynamic Skills Database: Python, SQL, DBT, Kafka, Flink, AWS, API development"
        length_guidance = "Preserve all original content while optimizing for keywords"
        
        prompt = get_resume_optimization_prompt(
            sample_resume_text, 
            job_description, 
            job_title,
            company_name,
            skills_text, 
            length_guidance
        )
        
        print("📝 GENERATED PROMPT ANALYSIS:")
        print("=" * 40)
        
        # Analyze the prompt
        analyze_prompt_content(prompt, job_title, job_keywords)
        
        # Show key sections of the prompt
        print("\n📋 KEY PROMPT SECTIONS:")
        print("=" * 30)
        
        sections = [
            "TARGET JOB TITLE",
            "STRATEGIC EXPERIENCE ENHANCEMENT", 
            "JOB TITLE ALIGNMENT IN EXPERIENCE",
            "AVOID REDUNDANCY AND REPETITION"
        ]
        
        for section in sections:
            if section in prompt:
                print(f"✅ {section} - Present")
            else:
                print(f"❌ {section} - Missing")
        
        print(f"\n📊 PROMPT STATISTICS:")
        print(f"   📏 Total Length: {len(prompt):,} characters")
        print(f"   🎯 Job Title Mentions: {prompt.count(job_title)}")
        print(f"   🔑 Keyword Mentions: {sum(prompt.lower().count(kw.lower()) for kw in job_keywords)}")
        
        # Expected optimizations
        print(f"\n🎯 EXPECTED OPTIMIZATIONS:")
        print("=" * 30)
        print("✅ Job titles in experience will align with 'Senior Data Engineer'")
        print("✅ Experience bullets will include: Python, SQL, DBT, Kafka, Flink, AWS")
        print("✅ Professional summary will target Senior Data Engineer role")
        print("✅ Skills section will prioritize job-relevant technologies")
        print("✅ Redundant action verbs will be avoided")
        print("✅ Original stories will be preserved but enhanced with keywords")
        
    except Exception as e:
        print(f"❌ Error testing prompt generation: {str(e)}")
        import traceback
        traceback.print_exc()

def analyze_prompt_content(prompt, job_title, job_keywords):
    """Analyze the generated prompt content"""
    
    # Check for key instructions
    key_instructions = [
        "PRESERVE the core story and context",
        "ENHANCE with relevant technical details", 
        "AVOID major fabrications",
        "PRIORITIZE enhancement over invention",
        "Use DIFFERENT action verbs",
        "Update job titles in the experience section"
    ]
    
    print("🔍 Key Instructions Analysis:")
    for instruction in key_instructions:
        if instruction in prompt:
            print(f"   ✅ {instruction}")
        else:
            print(f"   ❌ {instruction}")
    
    # Check keyword integration
    keywords_in_prompt = []
    for keyword in job_keywords:
        if keyword.lower() in prompt.lower():
            keywords_in_prompt.append(keyword)
    
    print(f"\n🔑 Keywords in Prompt: {len(keywords_in_prompt)}/{len(job_keywords)}")
    print(f"   Found: {', '.join(keywords_in_prompt)}")
    
    missing_keywords = [kw for kw in job_keywords if kw not in keywords_in_prompt]
    if missing_keywords:
        print(f"   Missing: {', '.join(missing_keywords)}")

if __name__ == '__main__':
    test_prompt_generation()
