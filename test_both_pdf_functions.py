#!/usr/bin/env python3
"""
Test both PDF functions that the Lambda uses
"""

import sys
import os
import json

# Add the AI handler directory to path
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_both_functions():
    """Test both PDF functions"""
    
    print("🧪 Testing both PDF functions...")
    
    try:
        # Import both functions
        from pdf_generator import create_pdf_resume, create_pdf_from_text
        print("✅ Both functions imported successfully")
        
        # Sample resume data
        sample_resume = {
            "full_name": "John Doe",
            "contact_info": "john.doe@email.com | (555) 123-4567 | New York, NY",
            "professional_summary": "Experienced software engineer with 5+ years of experience.",
            "skills": ["Python", "JavaScript", "React"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "dates": "Jan 2020 - Present",
                    "achievements": ["Led development of microservices"]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "University of Technology",
                    "dates": "2015 - 2019"
                }
            ]
        }
        
        # Test create_pdf_resume
        print("📄 Testing create_pdf_resume...")
        pdf_buffer = create_pdf_resume(sample_resume)
        print(f"✅ create_pdf_resume works! Size: {len(pdf_buffer.getvalue())} bytes")
        
        # Test create_pdf_from_text
        print("📝 Testing create_pdf_from_text...")
        text_content = "This is a test cover letter.\n\nDear Hiring Manager,\n\nI am writing to apply for the position."
        text_pdf_buffer = create_pdf_from_text(text_content, "Cover Letter")
        print(f"✅ create_pdf_from_text works! Size: {len(text_pdf_buffer.getvalue())} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_both_functions()
    if success:
        print("\n🎉 Both PDF functions work correctly!")
        sys.exit(0)
    else:
        print("\n💥 PDF functions test failed!")
        sys.exit(1)