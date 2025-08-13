#!/usr/bin/env python3
"""
Simple test of PDF generation with the problematic email
"""

import sys
import os

# Add the Lambda function directory to path
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

# Test the PDF generator
test_resume = {
    "full_name": "ABID SHAIK",
    "contact_info": "abidshariff009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
    "professional_summary": "Test summary",
    "skills": ["Python", "AWS", "Data Engineering"],
    "experience": [
        {
            "title": "Senior Data Engineer",
            "company": "Test Company", 
            "dates": "2020-2025",
            "achievements": ["Test achievement"]
        }
    ],
    "education": [
        {
            "degree": "Bachelor's Degree",
            "institution": "Test University",
            "dates": "2015-2019"
        }
    ]
}

print("Testing email string:")
email = "abidshariff009@gmail.com"
print(f"Original: {email}")
print(f"Each character: {[c for c in email]}")

# Check for any problematic characters
for i, char in enumerate(email):
    print(f"Position {i}: '{char}' (ord: {ord(char)})")

try:
    # Import and test
    from pdf_generator import create_pdf_resume
    print("\n✅ PDF generator imported successfully")
    
    # Test PDF creation
    pdf_data = create_pdf_resume(test_resume)
    print(f"✅ PDF created, size: {len(pdf_data)} bytes")
    
    # Save test PDF
    with open('test_resume.pdf', 'wb') as f:
        f.write(pdf_data)
    print("✅ Test PDF saved as test_resume.pdf")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()