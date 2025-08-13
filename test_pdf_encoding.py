#!/usr/bin/env python3
"""
Test script to debug PDF character encoding issues
"""

import sys
import os
sys.path.append('backend/lambda-functions/ai-handler')

# Test the PDF generator with the problematic email
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
print(f"Encoded bytes: {email.encode('utf-8')}")
print(f"Each character: {[c for c in email]}")

# Test the character filtering
import re
contact_parts = ["abidshariff009@gmail.com", "(716) 970-9249", "Dallas, Texas, 76210, United States"]

print("\nTesting character filtering:")
for part in contact_parts:
    print(f"Original: {part}")
    # Old problematic regex
    old_cleaned = re.sub(r'[^\w\s@.,|()\-+•·]', '', part)
    print(f"Old regex result: {old_cleaned}")
    
    # New regex
    new_cleaned = re.sub(r'[<>&"\'\\]', '', part)
    print(f"New regex result: {new_cleaned}")
    
    # UTF-8 encoding test
    utf8_cleaned = new_cleaned.encode('utf-8', errors='replace').decode('utf-8')
    print(f"UTF-8 processed: {utf8_cleaned}")
    print("---")

# Test importing the PDF generator
try:
    from backend.lambda_functions.ai_handler.pdf_generator import create_pdf_resume
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