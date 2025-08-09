#!/usr/bin/env python3
"""
Test script for the Job URL Extractor Lambda function with enhanced logging.
This script will invoke the Lambda function and show all the variables it extracts.
"""

import boto3
import json
import sys

def test_job_url_extractor(job_url):
    """Test the Job URL Extractor Lambda function with a specific URL."""
    
    # Initialize Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    # Prepare the test payload
    test_payload = {
        'jobUrl': job_url
    }
    
    print("=" * 80)
    print("TESTING JOB URL EXTRACTOR LAMBDA FUNCTION")
    print("=" * 80)
    print(f"Function Name: ResumeOptimizerJobUrlExtractor-prod")
    print(f"Test URL: {job_url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    print("=" * 80)
    
    try:
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerJobUrlExtractor-prod',
            InvocationType='RequestResponse',  # Synchronous call
            Payload=json.dumps(test_payload)
        )
        
        # Read the response
        response_payload = response['Payload'].read()
        
        print("LAMBDA INVOCATION RESPONSE:")
        print("=" * 40)
        print(f"Status Code: {response['StatusCode']}")
        print(f"Response Size: {len(response_payload)} bytes")
        
        # Parse the response
        try:
            result = json.loads(response_payload)
            print(f"Response: {json.dumps(result, indent=2)}")
            
            if result.get('success') and result.get('data'):
                print("\n" + "=" * 40)
                print("EXTRACTED VARIABLES SUMMARY:")
                print("=" * 40)
                
                data = result['data']
                for key, value in data.items():
                    print(f"{key}: {value}")
                    
            elif 'error' in result:
                print(f"\n❌ Error: {result['error']}")
                
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse response as JSON: {e}")
            print(f"Raw response: {response_payload}")
            
    except Exception as e:
        print(f"❌ Error invoking Lambda function: {str(e)}")
        return False
    
    print("\n" + "=" * 80)
    print("CHECK CLOUDWATCH LOGS FOR DETAILED EXTRACTION LOGGING:")
    print("=" * 80)
    print("Log Group: /aws/lambda/ResumeOptimizerJobUrlExtractor-prod")
    print("AWS Console: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FResumeOptimizerJobUrlExtractor-prod")
    print("CLI Command: aws logs tail /aws/lambda/ResumeOptimizerJobUrlExtractor-prod --follow --region us-east-1")
    
    return True

def main():
    """Main function to run tests with different job URLs."""
    
    # Test URLs for different job boards
    test_urls = [
        # LinkedIn job (if you have a specific one to test)
        "https://www.linkedin.com/jobs/view/3234567890/",
        
        # Mastercard careers (example)
        "https://careers.mastercard.com/us/en/job/R-252285/Manager-Data-Engineering",
        
        # Netflix careers (example)
        "https://jobs.netflix.com/jobs/123456789",
        
        # Generic company career page
        "https://careers.example.com/jobs/software-engineer"
    ]
    
    if len(sys.argv) > 1:
        # Use URL provided as command line argument
        job_url = sys.argv[1]
        print(f"Testing with provided URL: {job_url}")
        test_job_url_extractor(job_url)
    else:
        # Test with example URLs
        print("No URL provided. Here are some example commands:")
        print("\nUsage:")
        print("python test-job-url-extractor.py <job_url>")
        print("\nExamples:")
        for url in test_urls:
            print(f"python test-job-url-extractor.py '{url}'")
        
        print("\n" + "=" * 80)
        print("TESTING WITH FIRST EXAMPLE URL")
        print("=" * 80)
        test_job_url_extractor(test_urls[0])

if __name__ == "__main__":
    main()
