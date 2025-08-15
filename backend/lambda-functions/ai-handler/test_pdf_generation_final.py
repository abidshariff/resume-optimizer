#!/usr/bin/env python3
"""
Final test of PDF generation functionality.
Tests the actual PDF generator with sample resume data.
"""

import json
import sys
import os

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import create_pdf_from_resume_json

def test_pdf_generation():
    """Test PDF generation with sample resume data."""
    print("🧪 Testing PDF generation with sample resume data...")
    
    # Sample resume data
    sample_resume = {
        "full_name": "John Doe",
        "contact_info": "john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe",
        "professional_summary": "Experienced software engineer with 5+ years of experience in full-stack development. Proven track record of delivering high-quality applications using modern technologies and best practices.",
        "skills": [
            "Python", "JavaScript", "React", "Node.js", "AWS", "Docker", 
            "PostgreSQL", "MongoDB", "Git", "CI/CD", "Agile", "REST APIs"
        ],
        "experience": [
            {
                "title": "Senior Software Engineer",
                "company": "Tech Company Inc",
                "dates": "2021 - Present",
                "achievements": [
                    "Led development of microservices architecture serving 1M+ users",
                    "Reduced application load time by 40% through optimization",
                    "Mentored 3 junior developers and improved team productivity by 25%"
                ]
            },
            {
                "title": "Software Engineer",
                "company": "StartupCorp",
                "dates": "2019 - 2021",
                "achievements": [
                    "Built responsive web applications using React and Node.js",
                    "Implemented automated testing reducing bugs by 60%",
                    "Collaborated with cross-functional teams on product features"
                ]
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "University of Technology",
                "dates": "2015 - 2019",
                "gpa": "3.8",
                "details": "Graduated Magna Cum Laude"
            }
        ]
    }
    
    try:
        # Convert to JSON string (simulating how it comes from the handler)
        resume_json_str = json.dumps(sample_resume)
        
        # Generate PDF
        print("📄 Generating PDF...")
        pdf_buffer = create_pdf_from_resume_json(resume_json_str, "Professional Resume")
        
        # Check if PDF was created successfully
        if pdf_buffer and hasattr(pdf_buffer, 'getvalue'):
            pdf_data = pdf_buffer.getvalue()
            pdf_size = len(pdf_data)
            
            print(f"✅ PDF generated successfully!")
            print(f"   PDF size: {pdf_size} bytes")
            
            # Basic PDF validation - check for PDF header
            if pdf_data.startswith(b'%PDF-'):
                print("✅ PDF format validation passed")
                
                # Save test PDF for manual inspection
                with open('test_resume_output.pdf', 'wb') as f:
                    f.write(pdf_data)
                print("✅ Test PDF saved as 'test_resume_output.pdf'")
                
                return True
            else:
                print("❌ PDF format validation failed - invalid PDF header")
                return False
        else:
            print("❌ PDF generation failed - no output buffer")
            return False
            
    except Exception as e:
        print(f"❌ Error during PDF generation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🎯 Final PDF Generation Test")
    print("=" * 50)
    
    success = test_pdf_generation()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 PDF generation test PASSED!")
        print("   The Lambda function should now work correctly.")
    else:
        print("💥 PDF generation test FAILED!")
        print("   There may still be issues with the Lambda deployment.")
    
    sys.exit(0 if success else 1)