#!/usr/bin/env python3
"""
Test the Lambda function PDF generation functionality.
This simulates an actual Lambda invocation for PDF generation.
"""

import json
import boto3
import base64

def test_lambda_pdf_generation():
    """Test PDF generation via Lambda function invocation."""
    print("🚀 Testing Lambda PDF generation functionality...")
    
    # Sample resume data for testing
    test_resume_data = {
        "full_name": "Jane Smith",
        "contact_info": "jane.smith@email.com | (555) 987-6543",
        "professional_summary": "Results-driven marketing professional with 7+ years of experience in digital marketing, brand management, and campaign optimization.",
        "skills": [
            "Digital Marketing", "SEO/SEM", "Google Analytics", "Social Media Marketing",
            "Content Strategy", "Email Marketing", "A/B Testing", "Marketing Automation"
        ],
        "experience": [
            {
                "title": "Senior Marketing Manager",
                "company": "Digital Agency Pro",
                "dates": "2020 - Present",
                "achievements": [
                    "Increased organic traffic by 150% through SEO optimization",
                    "Managed $500K annual advertising budget with 25% ROI improvement",
                    "Led cross-functional team of 8 marketing specialists"
                ]
            }
        ],
        "education": [
            {
                "degree": "Master of Business Administration",
                "institution": "Business School University",
                "dates": "2016 - 2018",
                "gpa": "3.9"
            }
        ]
    }
    
    # Create Lambda event payload
    event = {
        "httpMethod": "POST",
        "path": "/optimize",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "action": "generate_pdf",
            "resume_data": test_resume_data,
            "format": "pdf"
        })
    }
    
    try:
        # Initialize Lambda client
        lambda_client = boto3.client('lambda', region_name='us-east-1')
        
        print("📤 Invoking Lambda function...")
        
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            InvocationType='RequestResponse',
            Payload=json.dumps(event)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print(f"📥 Lambda response status: {response_payload.get('statusCode', 'Unknown')}")
        
        if response_payload.get('statusCode') == 200:
            body = json.loads(response_payload.get('body', '{}'))
            
            if 'pdf_data' in body:
                # Decode base64 PDF data
                pdf_data = base64.b64decode(body['pdf_data'])
                pdf_size = len(pdf_data)
                
                print(f"✅ PDF generated successfully!")
                print(f"   PDF size: {pdf_size} bytes")
                
                # Validate PDF format
                if pdf_data.startswith(b'%PDF-'):
                    print("✅ PDF format validation passed")
                    
                    # Save test PDF
                    with open('lambda_test_resume.pdf', 'wb') as f:
                        f.write(pdf_data)
                    print("✅ Lambda-generated PDF saved as 'lambda_test_resume.pdf'")
                    
                    return True
                else:
                    print("❌ PDF format validation failed")
                    return False
            else:
                print("❌ No PDF data in response")
                print(f"Response body: {body}")
                return False
        else:
            print(f"❌ Lambda function returned error: {response_payload}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Lambda function: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Lambda PDF Generation Test")
    print("=" * 50)
    
    success = test_lambda_pdf_generation()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Lambda PDF generation test PASSED!")
        print("   The fonttools issue has been resolved!")
        print("   PDF generation is working in the Lambda environment.")
    else:
        print("💥 Lambda PDF generation test FAILED!")
        print("   There may still be issues with the deployment.")
    
    print("\n📋 Next steps:")
    print("   1. Test the web application PDF download functionality")
    print("   2. Verify that resume optimization with PDF format works")
    print("   3. Check that all PDF formatting is correct")