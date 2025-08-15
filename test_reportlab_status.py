#!/usr/bin/env python3
"""
Test to specifically check ReportLab status in Lambda
"""

import json
import boto3
import uuid
import time

def test_reportlab_status():
    """Test Lambda function to check ReportLab import status"""
    
    s3_client = boto3.client('s3')
    bucket_name = 'resume-optimizer-storage-132851953852-prod'
    
    # Generate unique test ID
    test_id = str(uuid.uuid4())[:8]
    
    # Simple test content
    resume_content = "John Doe\nSoftware Engineer\nTest resume content"
    job_title = "Test Job"
    job_description = "Test job description"
    
    # Upload test files
    resume_key = f"reportlab-test-resume-{test_id}.txt"
    job_title_key = f"reportlab-test-job-title-{test_id}.txt"
    job_desc_key = f"reportlab-test-job-desc-{test_id}.txt"
    status_key = f"reportlab-test-status-{test_id}.json"
    
    try:
        # Upload files
        s3_client.put_object(Bucket=bucket_name, Key=resume_key, Body=resume_content, ContentType='text/plain')
        s3_client.put_object(Bucket=bucket_name, Key=job_title_key, Body=job_title, ContentType='text/plain')
        s3_client.put_object(Bucket=bucket_name, Key=job_desc_key, Body=job_description, ContentType='text/plain')
        s3_client.put_object(Bucket=bucket_name, Key=status_key, Body=json.dumps({"status": "PENDING"}), ContentType='application/json')
        
        print(f"✅ Created test files with ID: {test_id}")
        
        # Create Lambda client
        lambda_client = boto3.client('lambda', region_name='us-east-1')
        
        # Test payload
        test_payload = {
            "userId": "reportlab-test-user",
            "jobId": f"reportlab-test-{test_id}",
            "resumeKey": resume_key,
            "jobTitleKey": job_title_key,
            "jobDescriptionKey": job_desc_key,
            "statusKey": status_key,
            "outputFormat": "pdf"
        }
        
        print("🧪 Testing ReportLab status in Lambda...")
        
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print("📋 Lambda Response:")
        print(json.dumps(response_payload, indent=2))
        
        # Check CloudWatch logs for ReportLab status
        print("\n🔍 Checking CloudWatch logs for ReportLab status...")
        
        logs_client = boto3.client('logs', region_name='us-east-1')
        log_group = '/aws/lambda/ResumeOptimizerAIHandler-prod'
        
        # Get recent log streams
        streams_response = logs_client.describe_log_streams(
            logGroupName=log_group,
            orderBy='LastEventTime',
            descending=True,
            limit=1
        )
        
        if streams_response['logStreams']:
            latest_stream = streams_response['logStreams'][0]['logStreamName']
            
            # Get log events
            events_response = logs_client.get_log_events(
                logGroupName=log_group,
                logStreamName=latest_stream,
                startFromHead=False,
                limit=50
            )
            
            # Look for ReportLab-related messages
            reportlab_messages = []
            for event in events_response['events']:
                message = event['message']
                if any(keyword in message for keyword in ['ReportLab', 'reportlab', 'PIL', '_imaging', 'DEBUG:']):
                    reportlab_messages.append(message.strip())
            
            if reportlab_messages:
                print("📋 ReportLab-related log messages:")
                for msg in reportlab_messages[-10:]:  # Last 10 messages
                    if 'ReportLab' in msg or 'reportlab' in msg:
                        if 'Successfully' in msg or 'Available: True' in msg:
                            print(f"✅ {msg}")
                        elif 'failed' in msg or 'error' in msg or 'Available: False' in msg:
                            print(f"❌ {msg}")
                        else:
                            print(f"ℹ️  {msg}")
                    elif 'PIL' in msg or '_imaging' in msg:
                        if 'Successfully' in msg:
                            print(f"✅ {msg}")
                        else:
                            print(f"❌ {msg}")
                    else:
                        print(f"🔍 {msg}")
            else:
                print("⚠️  No ReportLab-related messages found in recent logs")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    finally:
        # Clean up test files
        try:
            objects = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=f"reportlab-test-{test_id}")
            if 'Contents' in objects:
                for obj in objects['Contents']:
                    s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])
                print(f"🧹 Cleaned up test files")
        except Exception as e:
            print(f"⚠️  Could not clean up: {str(e)}")

if __name__ == "__main__":
    test_reportlab_status()