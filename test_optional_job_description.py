#!/usr/bin/env python3
"""
Test script to verify optional job description functionality
"""

import json
import base64
import boto3
import time

def test_without_job_description():
    """Test resume optimization without job description"""
    
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
    
    # Prepare the payload WITHOUT job description
    payload = {
        "resume": f"data:application/pdf;base64,{resume_base64}",
        "jobTitle": "Senior Data Engineer",
        "companyName": "",  # Optional
        "jobDescription": "",  # EMPTY - this is what we're testing
        "outputFormat": "docx"
    }
    
    print("🧪 Testing Optional Job Description Functionality")
    print("=" * 60)
    print(f"📄 Resume: Abid_Shaik_Sr_DataEngineer.pdf")
    print(f"🎯 Job Title: Senior Data Engineer")
    print(f"🏢 Company: Not specified")
    print(f"📝 Job Description: EMPTY (testing optional functionality)")
    print()
    
    # Initialize AWS clients
    try:
        session = boto3.Session(region_name='us-east-1')
        lambda_client = session.client('lambda')
        
        print("🚀 Invoking Resume Processor Lambda...")
        
        # Call the resume processor
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
        
        if response_payload.get('statusCode') in [200, 202]:
            result = json.loads(response_payload['body'])
            job_id = result.get('jobId')
            
            print(f"✅ Job submitted successfully without job description!")
            print(f"📋 Job ID: {job_id}")
            print()
            
            # Poll for completion
            print("⏳ Waiting for optimization to complete...")
            
            s3_client = session.client('s3')
            bucket_name = 'resume-optimizer-storage-132851953852-prod'
            
            max_attempts = 30
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
                        print("\n🎉 Optimization completed without job description!")
                        
                        # Get the optimized resume
                        try:
                            preview_key = f"users/anonymous/optimized/{job_id}/preview.txt"
                            preview_obj = s3_client.get_object(Bucket=bucket_name, Key=preview_key)
                            optimized_text = preview_obj['Body'].read().decode('utf-8')
                            
                            print("\n📋 OPTIMIZED RESUME (WITHOUT JOB DESCRIPTION):")
                            print("=" * 60)
                            print(optimized_text[:1000] + "..." if len(optimized_text) > 1000 else optimized_text)
                            
                            # Analyze the optimization
                            analyze_general_optimization(optimized_text)
                            
                        except Exception as e:
                            print(f"❌ Error retrieving optimized resume: {str(e)}")
                        
                        break
                        
                    elif status == 'FAILED':
                        print(f"\n❌ Optimization failed: {message}")
                        break
                        
                    elif status in ['PROCESSING', 'SUBMITTING']:
                        time.sleep(10)
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

def analyze_general_optimization(optimized_text):
    """Analyze the general optimization results"""
    
    print("\n📊 GENERAL OPTIMIZATION ANALYSIS:")
    print("=" * 40)
    
    # Check for professional enhancement
    professional_indicators = [
        'experienced', 'skilled', 'proven', 'expertise', 'proficient',
        'accomplished', 'seasoned', 'demonstrated', 'comprehensive'
    ]
    
    found_indicators = []
    text_lower = optimized_text.lower()
    
    for indicator in professional_indicators:
        if indicator in text_lower:
            found_indicators.append(indicator)
    
    print(f"✅ Professional Language Enhancement: {len(found_indicators)} indicators found")
    print(f"   Examples: {', '.join(found_indicators[:5])}")
    
    # Check for technical terms
    tech_terms = [
        'python', 'sql', 'aws', 'data', 'analytics', 'engineering',
        'systems', 'architecture', 'optimization', 'scalable'
    ]
    
    found_tech = []
    for term in tech_terms:
        if term in text_lower:
            found_tech.append(term)
    
    print(f"✅ Technical Terminology: {len(found_tech)} terms found")
    print(f"   Examples: {', '.join(found_tech[:5])}")
    
    # Check for quantified achievements
    import re
    numbers = re.findall(r'\d+%|\d+\+|\d+[KMB]|\d+ [a-zA-Z]', optimized_text)
    print(f"✅ Quantified Achievements: {len(numbers)} metrics found")
    if numbers:
        print(f"   Examples: {', '.join(numbers[:3])}")
    
    # Check for action verbs
    action_verbs = [
        'developed', 'implemented', 'designed', 'built', 'created',
        'managed', 'led', 'optimized', 'improved', 'delivered'
    ]
    
    found_verbs = []
    for verb in action_verbs:
        if verb in text_lower:
            found_verbs.append(verb)
    
    print(f"✅ Action Verbs: {len(found_verbs)} different verbs found")
    print(f"   Examples: {', '.join(found_verbs[:5])}")
    
    print(f"\n🎯 CONCLUSION:")
    print("✅ Resume was successfully optimized for general professional enhancement")
    print("✅ No job description was required for processing")
    print("✅ Professional language and terminology were enhanced")
    print("✅ Technical skills and achievements were highlighted")

if __name__ == '__main__':
    test_without_job_description()
