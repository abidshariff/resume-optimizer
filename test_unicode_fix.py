#!/usr/bin/env python3
"""
Test script to verify Unicode character handling in PDF generation.
"""

import sys
import os
sys.path.append('backend/lambda-functions/ai-handler')

from pdf_generator import create_pdf_from_resume_json

# Test resume data with problematic Unicode characters
test_resume = {
    "full_name": "John Doe",
    "contact_info": "john.doe@email.com | (555) 123-4567 | Dallas, TX",
    "professional_summary": "Experienced developer with expertise in modern technologies.",
    "skills": [
        "Frontend: React • Vue.js • Angular",
        "Backend: Node.js • Python • Django", 
        "Databases: PostgreSQL • MySQL • MongoDB",
        "Cloud: AWS • Docker • Kubernetes"
    ],
    "experience": [
        {
            "title": "Senior Developer",
            "company": "Tech Corp",
            "dates": "2020 - Present",
            "achievements": [
                "Built scalable applications • Improved performance by 40%",
                "Led team of 5 developers • Implemented CI/CD pipelines"
            ]
        }
    ],
    "education": [
        {
            "degree": "BS Computer Science",
            "institution": "University of Texas",
            "dates": "2016 - 2020",
            "details": "Relevant coursework • Data Structures • Algorithms"
        }
    ]
}

def test_unicode_handling():
    """Test that Unicode characters are properly handled."""
    print("Testing Unicode character handling in PDF generation...")
    
    try:
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(test_resume)
        
        if pdf_buffer and pdf_buffer.getvalue():
            print("✅ PDF generated successfully!")
            print(f"PDF size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save test PDF
            with open('test_unicode_fix.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_unicode_fix.pdf'")
            
            return True
        else:
            print("❌ PDF generation failed - empty buffer")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_unicode_handling()
    sys.exit(0 if success else 1)