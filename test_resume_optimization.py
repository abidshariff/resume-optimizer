#!/usr/bin/env python3
"""
Test script to analyze resume optimization output for Abid's resume
"""

import json
import base64
import boto3
import time
from datetime import datetime

# Your job requirements
JOB_TITLE = "Senior Data Engineer"
COMPANY_NAME = ""  # Optional - leave empty for this test
JOB_DESCRIPTION = """What You'll Do: 

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

def test_resume_optimization():
    """Test the resume optimization with Abid's actual resume"""
    
    # Read the PDF file
    resume_path = "/Users/shikbi/Documents/Users/shikbi/Documents/Personal Docs/resume/Abid_Shaik_Sr_DataEngineer.pdf"
    
    try:
        with open(resume_path, 'rb') as f:
            resume_content = f.read()
            resume_base64 = base64.b64encode(resume_content).decode('utf-8')
    except FileNotFoundError:
        print("❌ Resume file not found. Please check the path.")
        return
    except Exception as e:
        print(f"❌ Error reading resume file: {str(e)}")
        return
    
    # Prepare the payload (same format as frontend)
    payload = {
        "resume": f"data:application/pdf;base64,{resume_base64}",
        "jobTitle": JOB_TITLE,
        "companyName": COMPANY_NAME,
        "jobDescription": JOB_DESCRIPTION,
        "outputFormat": "docx"
    }
    
    print("🧪 Testing Resume Optimization")
    print("=" * 50)
    print(f"📄 Resume: Abid_Shaik_Sr_DataEngineer.pdf")
    print(f"🎯 Job Title: {JOB_TITLE}")
    print(f"🏢 Company: {COMPANY_NAME if COMPANY_NAME else 'Not specified'}")
    print(f"📝 Job Description Length: {len(JOB_DESCRIPTION)} characters")
    print()
    
    # Initialize AWS clients
    try:
        # Use your AWS profile/credentials
        session = boto3.Session(region_name='us-east-1')
        lambda_client = session.client('lambda')
        
        print("🚀 Invoking Resume Processor Lambda...")
        
        # Call the resume processor (same as frontend would)
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerProcessor-prod',
            InvocationType='RequestResponse',
            Payload=json.dumps({
                'httpMethod': 'POST',
                'body': json.dumps(payload),
                'headers': {
                    'Content-Type': 'application/json'
                }
            })
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        if response_payload.get('statusCode') in [200, 202]:  # Accept both 200 and 202
            result = json.loads(response_payload['body'])
            job_id = result.get('jobId')
            
            print(f"✅ Job submitted successfully!")
            print(f"📋 Job ID: {job_id}")
            print()
            
            # Poll for completion
            print("⏳ Waiting for optimization to complete...")
            
            s3_client = session.client('s3')
            bucket_name = 'resume-optimizer-storage-132851953852-prod'
            
            max_attempts = 30  # 5 minutes max
            attempt = 0
            
            while attempt < max_attempts:
                try:
                    # Check status
                    status_key = f"users/anonymous/status/{job_id}/status.json"
                    status_obj = s3_client.get_object(Bucket=bucket_name, Key=status_key)
                    status_data = json.loads(status_obj['Body'].read().decode('utf-8'))
                    
                    status = status_data.get('status')
                    message = status_data.get('message', '')
                    
                    print(f"📊 Status: {status} - {message}")
                    
                    if status == 'COMPLETED':
                        print("\n🎉 Optimization completed!")
                        
                        # Get the optimized resume
                        try:
                            result_key = f"users/anonymous/results/{job_id}/optimized_resume.json"
                            result_obj = s3_client.get_object(Bucket=bucket_name, Key=result_key)
                            optimized_data = json.loads(result_obj['Body'].read().decode('utf-8'))
                            
                            print("\n📋 OPTIMIZED RESUME ANALYSIS:")
                            print("=" * 50)
                            
                            # Analyze the optimized resume
                            analyze_optimized_resume(optimized_data, JOB_TITLE, JOB_DESCRIPTION)
                            
                        except Exception as e:
                            print(f"❌ Error retrieving optimized resume: {str(e)}")
                        
                        break
                        
                    elif status == 'FAILED':
                        print(f"\n❌ Optimization failed: {message}")
                        break
                        
                    elif status in ['PROCESSING', 'SUBMITTING']:
                        time.sleep(10)  # Wait 10 seconds
                        attempt += 1
                    else:
                        print(f"\n⚠️ Unknown status: {status}")
                        break
                        
                except Exception as e:
                    print(f"❌ Error checking status: {str(e)}")
                    break
            
            if attempt >= max_attempts:
                print("\n⏰ Timeout waiting for optimization to complete")
                
        else:
            print(f"❌ Error submitting job: {response_payload}")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")

def analyze_optimized_resume(optimized_data, job_title, job_description):
    """Analyze the optimized resume output"""
    
    # Extract key sections
    professional_summary = optimized_data.get('professional_summary', '')
    skills = optimized_data.get('skills', [])
    experience = optimized_data.get('experience', [])
    
    print(f"👤 Professional Summary:")
    print(f"   {professional_summary}")
    print()
    
    print(f"🛠️ Skills ({len(skills)} total):")
    for i, skill in enumerate(skills[:10]):  # Show first 10
        print(f"   • {skill}")
    if len(skills) > 10:
        print(f"   ... and {len(skills) - 10} more")
    print()
    
    print(f"💼 Experience Entries: {len(experience)}")
    
    # Analyze each experience entry
    job_keywords = extract_job_keywords(job_description)
    
    for i, exp in enumerate(experience):
        company = exp.get('company', 'Unknown Company')
        title = exp.get('title', 'Unknown Title')
        bullets = exp.get('bullets', [])
        
        print(f"\n📍 Experience {i+1}: {title} at {company}")
        print(f"   📝 Bullets: {len(bullets)}")
        
        # Analyze keyword integration in bullets
        keyword_usage = analyze_keyword_usage(bullets, job_keywords)
        
        print(f"   🎯 Keywords found in bullets: {len(keyword_usage)}")
        if keyword_usage:
            print(f"   🔑 Keywords used: {', '.join(keyword_usage[:5])}")
        
        # Show first few bullets
        for j, bullet in enumerate(bullets[:3]):
            print(f"   • {bullet}")
        if len(bullets) > 3:
            print(f"   ... and {len(bullets) - 3} more bullets")
    
    # Overall analysis
    print(f"\n📊 OPTIMIZATION ANALYSIS:")
    print("=" * 30)
    
    # Check job title alignment
    title_alignment = check_title_alignment(experience, job_title)
    print(f"🎯 Job Title Alignment: {'✅ Good' if title_alignment else '⚠️ Needs Improvement'}")
    
    # Check keyword integration
    total_keywords_used = set()
    for exp in experience:
        bullets = exp.get('bullets', [])
        keywords = analyze_keyword_usage(bullets, job_keywords)
        total_keywords_used.update(keywords)
    
    keyword_coverage = len(total_keywords_used) / len(job_keywords) * 100 if job_keywords else 0
    print(f"🔑 Keyword Coverage: {keyword_coverage:.1f}% ({len(total_keywords_used)}/{len(job_keywords)})")
    
    # Check for redundancy
    redundancy_score = check_redundancy(experience)
    print(f"🔄 Redundancy Score: {'✅ Low' if redundancy_score < 0.3 else '⚠️ High'} ({redundancy_score:.2f})")

def extract_job_keywords(job_description):
    """Extract key technical terms from job description"""
    keywords = []
    
    # Common technical terms to look for
    tech_terms = [
        'Python', 'SQL', 'DBT', 'KSQL', 'Kafka', 'Flink', 'AWS', 'API', 'APIs',
        'data transformation', 'anomaly detection', 'data quality', 'stream processing',
        'event-driven', 'Agile', 'Scrum', 'data governance', 'CCPA', 'scalable',
        'batch processing', 'real-time', 'cloud', 'architecture', 'frameworks'
    ]
    
    job_lower = job_description.lower()
    for term in tech_terms:
        if term.lower() in job_lower:
            keywords.append(term)
    
    return keywords

def analyze_keyword_usage(bullets, job_keywords):
    """Check which keywords are used in the bullets"""
    used_keywords = []
    
    bullets_text = ' '.join(bullets).lower()
    
    for keyword in job_keywords:
        if keyword.lower() in bullets_text:
            used_keywords.append(keyword)
    
    return used_keywords

def check_title_alignment(experience, target_title):
    """Check if experience titles align with target job title"""
    target_lower = target_title.lower()
    
    for exp in experience:
        title = exp.get('title', '').lower()
        if 'data engineer' in title or 'engineer' in title:
            return True
    
    return False

def check_redundancy(experience):
    """Check for redundant action verbs in bullets"""
    all_bullets = []
    for exp in experience:
        all_bullets.extend(exp.get('bullets', []))
    
    # Extract first words (action verbs)
    first_words = []
    for bullet in all_bullets:
        words = bullet.split()
        if words:
            first_words.append(words[0].lower())
    
    if not first_words:
        return 0
    
    # Calculate redundancy (higher = more redundant)
    unique_words = len(set(first_words))
    total_words = len(first_words)
    
    return 1 - (unique_words / total_words)

if __name__ == '__main__':
    test_resume_optimization()
