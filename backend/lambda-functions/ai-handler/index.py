import json
import boto3
import os
import uuid
from datetime import datetime

s3 = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
bucket_name = os.environ.get('STORAGE_BUCKET')
table_name = os.environ.get('USER_HISTORY_TABLE')

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))
        
        # Extract data from the event
        user_id = event.get('userId', 'anonymous')
        job_id = event.get('jobId')
        resume_key = event.get('resumeKey')
        job_desc_key = event.get('jobDescriptionKey')
        
        # Validate inputs
        if not job_id or not resume_key or not job_desc_key:
            return {
                'error': 'Missing required parameters'
            }
        
        # Get files from S3
        try:
            resume_obj = s3.get_object(Bucket=bucket_name, Key=resume_key)
            resume_content = resume_obj['Body'].read()
            
            # Try to extract text from PDF (simplified approach)
            try:
                resume_text = resume_content.decode('utf-8')
            except UnicodeDecodeError:
                # If we can't decode as text, it's likely a binary format
                # In a real implementation, you would use a PDF parser library
                resume_text = "PDF content (binary format) - text extraction would be implemented in production"
            
            job_desc_obj = s3.get_object(Bucket=bucket_name, Key=job_desc_key)
            job_description = job_desc_obj['Body'].read().decode('utf-8')
        except Exception as e:
            print(f"Error retrieving files from S3: {str(e)}")
            return {
                'error': f'Error retrieving files: {str(e)}'
            }
        
        # Prepare prompt for Bedrock
        prompt = f"""
        You are an expert resume optimizer. Your task is to optimize the following resume to better match the job description.
        Make the resume more relevant to the job by:
        1. Highlighting relevant skills and experiences
        2. Using keywords from the job description
        3. Adjusting the formatting and structure for clarity
        4. Removing irrelevant information
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_description}
        
        Provide the optimized resume in a clean, professional format.
        """
        
        # Call Amazon Bedrock
        try:
            # For POC, we'll simulate the Bedrock response
            # In production, you would use:
            # response = bedrock_runtime.invoke_model(
            #     modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            #     body=json.dumps({
            #         "prompt": prompt,
            #         "max_tokens_to_sample": 4000,
            #         "temperature": 0.7,
            #         "top_p": 0.9,
            #     })
            # )
            # response_body = json.loads(response['body'].read())
            # optimized_resume = response_body['completion']
            
            # Simulated response for POC
            optimized_resume = f"""
            # OPTIMIZED RESUME
            
            ## PROFESSIONAL SUMMARY
            Experienced software developer with expertise in cloud technologies and web application development.
            Skilled in creating scalable solutions using AWS services and modern frontend frameworks.
            
            ## SKILLS
            - Cloud Technologies: AWS (Lambda, S3, DynamoDB, API Gateway)
            - Programming Languages: Python, JavaScript, TypeScript
            - Web Development: React, Vue.js, HTML5, CSS3
            - DevOps: CI/CD, Infrastructure as Code, CloudFormation
            - AI/ML: Integration with LLM services, prompt engineering
            
            ## EXPERIENCE
            
            **Senior Software Engineer**
            *Tech Solutions Inc. | 2022 - Present*
            - Developed serverless applications using AWS Lambda and API Gateway
            - Implemented authentication flows with Amazon Cognito
            - Created responsive web interfaces with React and Material UI
            - Integrated AI capabilities using Amazon Bedrock
            
            **Software Developer**
            *Digital Innovations | 2019 - 2022*
            - Built and maintained web applications using Vue.js and Node.js
            - Designed and implemented RESTful APIs
            - Collaborated with cross-functional teams to deliver projects on schedule
            
            ## EDUCATION
            **Bachelor of Science in Computer Science**
            *University of Technology | 2019*
            
            This resume has been optimized to highlight relevant skills and experiences for the job description.
            """
            
        except Exception as e:
            print(f"Error calling Bedrock: {str(e)}")
            return {
                'error': f'Error generating optimized resume: {str(e)}'
            }
        
        # Store optimized resume in S3
        optimized_key = f"users/{user_id}/optimized/{job_id}/resume.txt"
        s3.put_object(
            Bucket=bucket_name,
            Key=optimized_key,
            Body=optimized_resume.encode('utf-8'),
            ContentType='text/plain'
        )
        
        # Generate pre-signed URL for download
        optimized_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': optimized_key
            },
            ExpiresIn=3600  # URL valid for 1 hour
        )
        
        # Record in DynamoDB
        if table_name:
            table = dynamodb.Table(table_name)
            try:
                table.put_item(
                    Item={
                        'userId': user_id,
                        'jobId': job_id,
                        'timestamp': datetime.now().isoformat(),
                        'originalResumeKey': resume_key,
                        'jobDescriptionKey': job_desc_key,
                        'optimizedResumeKey': optimized_key
                    }
                )
            except Exception as e:
                print(f"Error recording to DynamoDB: {str(e)}")
                # Continue even if DynamoDB recording fails
        
        return {
            'optimizedResumeUrl': optimized_url,
            'jobId': job_id
        }
    except Exception as e:
        print(f"Error in AI Handler: {str(e)}")
        return {
            'error': str(e)
        }
