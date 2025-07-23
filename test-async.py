#!/usr/bin/env python3

import requests
import json
import time
import base64

# Your API endpoints
OPTIMIZE_URL = "https://3bemzv60ge.execute-api.us-east-1.amazonaws.com/dev/optimize"
STATUS_URL = "https://3bemzv60ge.execute-api.us-east-1.amazonaws.com/dev/status"

# Test data
test_resume_text = """
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Software Developer at Tech Corp (2020-2023)
- Developed web applications using Python and JavaScript
- Worked with AWS services including Lambda and S3
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2020)

SKILLS
- Python, JavaScript, React
- AWS, Docker, Git
"""

test_job_description = """
Senior Software Engineer - Cloud Platform

We are looking for a Senior Software Engineer to join our cloud platform team.

Requirements:
- 3+ years of experience in software development
- Strong experience with Python and JavaScript
- Experience with AWS services (Lambda, S3, API Gateway)
- Knowledge of React and modern web frameworks
- Experience with containerization (Docker)
- Strong problem-solving skills

Responsibilities:
- Design and develop scalable cloud applications
- Work with serverless architectures
- Collaborate with DevOps teams
- Mentor junior developers
"""

def test_async_processing():
    print("🚀 Testing Asynchronous Resume Processing")
    print("=" * 50)
    
    # Convert resume to base64 (simulating file upload)
    resume_base64 = base64.b64encode(test_resume_text.encode()).decode()
    
    # Step 1: Submit job
    print("1. Submitting resume optimization job...")
    
    payload = {
        "resume": f"data:text/plain;base64,{resume_base64}",
        "jobDescription": test_job_description
    }
    
    try:
        response = requests.post(OPTIMIZE_URL, 
                               json=payload,
                               headers={"Content-Type": "application/json"})
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 202:
            result = response.json()
            job_id = result.get('jobId')
            print(f"   ✅ Job submitted successfully!")
            print(f"   📋 Job ID: {job_id}")
            
            # Step 2: Poll for status
            print("\n2. Polling for job status...")
            max_attempts = 20  # 1 minute max
            attempt = 0
            
            while attempt < max_attempts:
                attempt += 1
                print(f"   Attempt {attempt}: Checking status...")
                
                try:
                    status_response = requests.get(f"{STATUS_URL}?jobId={job_id}")
                    print(f"   Status Code: {status_response.status_code}")
                    
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        current_status = status_data.get('status')
                        message = status_data.get('message', '')
                        
                        print(f"   📊 Status: {current_status}")
                        print(f"   💬 Message: {message}")
                        
                        if current_status == 'COMPLETED':
                            print(f"   ✅ Job completed successfully!")
                            if 'optimizedResumeUrl' in status_data:
                                print(f"   📄 Download URL: {status_data['optimizedResumeUrl']}")
                            break
                        elif current_status == 'FAILED':
                            print(f"   ❌ Job failed: {message}")
                            break
                        else:
                            print(f"   ⏳ Still processing... waiting 3 seconds")
                            time.sleep(3)
                    else:
                        print(f"   ❌ Error checking status: {status_response.text}")
                        break
                        
                except Exception as e:
                    print(f"   ❌ Error checking status: {str(e)}")
                    break
            
            if attempt >= max_attempts:
                print("   ⏰ Timeout: Job is taking longer than expected")
                
        else:
            print(f"   ❌ Failed to submit job: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error submitting job: {str(e)}")

if __name__ == "__main__":
    test_async_processing()
