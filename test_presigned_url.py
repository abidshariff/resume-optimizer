#!/usr/bin/env python3

import boto3
from botocore.exceptions import ClientError

def test_presigned_url():
    # Initialize S3 client
    s3 = boto3.client('s3')
    
    bucket_name = 'resume-optimizer-storage-066148155043-dev'
    key = 'users/1418d428-6091-7044-3228-6a7e902216d0/optimized/9c6fda2f-08a6-4438-94cc-3353f77ae55e/resume.docx'
    
    try:
        # Test 1: Simple presigned URL without response parameters
        print("Test 1: Simple presigned URL")
        simple_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': key
            },
            ExpiresIn=3600
        )
        print(f"Simple URL: {simple_url}")
        
        # Test 2: Presigned URL with only content type
        print("\nTest 2: Presigned URL with content type")
        content_type_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': key,
                'ResponseContentType': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            },
            ExpiresIn=3600
        )
        print(f"Content-Type URL: {content_type_url}")
        
        # Test 3: Presigned URL with simple content disposition
        print("\nTest 3: Presigned URL with simple content disposition")
        disposition_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': key,
                'ResponseContentDisposition': 'attachment; filename="resume.docx"'
            },
            ExpiresIn=3600
        )
        print(f"Disposition URL: {disposition_url}")
        
        # Test 4: Check if file exists
        print("\nTest 4: Check if file exists")
        try:
            response = s3.head_object(Bucket=bucket_name, Key=key)
            print(f"File exists: {response['ContentLength']} bytes")
            print(f"Content-Type: {response.get('ContentType', 'Not set')}")
        except ClientError as e:
            print(f"File does not exist: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_presigned_url()
