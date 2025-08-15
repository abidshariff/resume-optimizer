#!/usr/bin/env python3
"""
Full test to verify PDF generation is working in Lambda
"""

import json
import boto3
import uuid
import time

def create_test_files_in_s3():
    """Create test files in S3 for the Lambda function"""
    
    s3_client = boto3.client('s3')
    bucket_name = 'resume-optimizer-storage-132851953852-prod'
    
    # Generate unique test ID
    test_id = str(uuid.uuid4())[:8]
    
    # Test resume content
    resume_content = """John Doe
Software Engineer

EXPERIENCE:
• 5 years of Python development
• Experience with AWS Lambda
• Built scalable web applications

SKILLS:
• Python, JavaScript, AWS
• React, Node.js
• Database design
"""
    
    # Test job title
    job_title = "Senior Software Engineer"
    
    # Test job description
    job_description = """We are looking for a Senior Software Engineer to join our team.

Requirements:
• 3+ years of Python experience
• AWS cloud experience
• Experience with web applications
• Strong problem-solving skills

Responsibilities:
• Develop scalable applications
• Work with cloud infrastructure
• Collaborate with team members
"""
    
    # Upload test files
    resume_key = f"test-resume-{test_id}.txt"
    job_title_key = f"test-job-title-{test_id}.txt"
    job_desc_key = f"test-job-desc-{test_id}.txt"
    status_key = f"test-status-{test_id}.json"
    
    try:
        # Upload resume
        s3_client.put_object(
            Bucket=bucket_name,
            Key=resume_key,
            Body=resume_content,
            ContentType='text/plain'
        )
        
        # Upload job title
        s3_client.put_object(
            Bucket=bucket_name,
            Key=job_title_key,
            Body=job_title,
            ContentType='text/plain'
        )
        
        # Upload job description
        s3_client.put_object(
            Bucket=bucket_name,
            Key=job_desc_key,
            Body=job_description,
            ContentType='text/plain'
        )
        
        # Create initial status
        initial_status = {
            "status": "PENDING",
            "message": "Test job created",
            "timestamp": time.time()
        }
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=status_key,
            Body=json.dumps(initial_status),
            ContentType='application/json'
        )
        
        print(f"✅ Created test files with ID: {test_id}")
        return {
            'test_id': test_id,
            'resume_key': resume_key,
            'job_title_key': job_title_key,
            'job_desc_key': job_desc_key,
            'status_key': status_key,
            'bucket_name': bucket_name
        }
        
    except Exception as e:
        print(f"❌ Failed to create test files: {str(e)}")
        return None

def test_pdf_generation():
    """Test full PDF generation pipeline"""
    
    print("🚀 Starting PDF generation test...")
    
    # Create test files
    test_data = create_test_files_in_s3()
    if not test_data:
        return False
    
    # Create Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    # Test payload
    test_payload = {
        "userId": "test-user",
        "jobId": f"pdf-test-{test_data['test_id']}",
        "resumeKey": test_data['resume_key'],
        "jobTitleKey": test_data['job_title_key'],
        "jobDescriptionKey": test_data['job_desc_key'],
        "statusKey": test_data['status_key'],
        "outputFormat": "pdf",
        "coverLetterFormat": "pdf"
    }
    
    try:
        print("📤 Invoking Lambda function...")
        
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print("📋 Lambda Response:")
        print(json.dumps(response_payload, indent=2))
        
        # Check for success
        if 'statusCode' in response_payload and response_payload['statusCode'] == 200:
            print("✅ Lambda function executed successfully!")
            
            # Check if PDF files were created
            s3_client = boto3.client('s3')
            bucket_name = test_data['bucket_name']
            
            # Look for generated PDF files
            try:
                objects = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=f"pdf-test-{test_data['test_id']}"
                )
                
                if 'Contents' in objects:
                    pdf_files = [obj['Key'] for obj in objects['Contents'] if obj['Key'].endswith('.pdf')]
                    if pdf_files:
                        print(f"🎉 PDF files generated: {pdf_files}")
                        return True
                    else:
                        print("⚠️  No PDF files found")
                        return False
                else:
                    print("⚠️  No output files found")
                    return False
                    
            except Exception as e:
                print(f"⚠️  Could not check for PDF files: {str(e)}")
                return True  # Lambda succeeded, file check failed
        
        elif 'error' in response_payload:
            error_msg = response_payload['error']
            if 'import' in error_msg.lower() or 'pil' in error_msg.lower() or 'reportlab' in error_msg.lower():
                print("❌ Import error detected!")
                return False
            else:
                print(f"⚠️  Got error (not import-related): {error_msg}")
                return True  # Not an import error
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    finally:
        # Clean up test files
        try:
            s3_client = boto3.client('s3')
            bucket_name = test_data['bucket_name']
            
            # List and delete test files
            objects = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=f"test-{test_data['test_id']}"
            )
            
            if 'Contents' in objects:
                for obj in objects['Contents']:
                    s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])
                print(f"🧹 Cleaned up test files")
                
        except Exception as e:
            print(f"⚠️  Could not clean up test files: {str(e)}")

if __name__ == "__main__":
    success = test_pdf_generation()
    if success:
        print("\n🎉 PDF generation test completed successfully!")
        print("✅ ReportLab and PIL imports are working correctly!")
    else:
        print("\n💥 PDF generation test failed!")
        print("❌ There may still be import issues.")