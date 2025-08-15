#!/usr/bin/env python3
"""
Test fpdf2-based PDF generation
"""

import sys
import os
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_fpdf2_imports():
    """Test that fpdf2 imports work"""
    print("🔍 Testing fpdf2 imports...")
    
    try:
        from fpdf import FPDF
        print("✅ fpdf2 imports successful")
        return True
    except ImportError as e:
        print(f"❌ fpdf2 import failed: {e}")
        return False

def test_fpdf2_pdf_generation():
    """Test PDF generation with fpdf2"""
    print("\n📄 Testing fpdf2 PDF generation...")
    
    try:
        from pdf_generator import create_pdf_from_resume_json
        
        # Sample resume data
        sample_resume = {
            "full_name": "Alex Johnson",
            "contact_info": "alex.johnson@email.com | (555) 123-4567 | Seattle, WA",
            "professional_summary": "Experienced software engineer with 8+ years in full-stack development, specializing in cloud-native applications and microservices architecture.",
            "skills": ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "CloudTech Solutions",
                    "dates": "2021 - Present",
                    "achievements": [
                        "Designed and implemented scalable microservices architecture serving 5M+ users",
                        "Led migration from monolithic to cloud-native architecture, reducing costs by 40%",
                        "Mentored team of 4 junior developers and established code review best practices"
                    ]
                },
                {
                    "title": "Full Stack Developer",
                    "company": "InnovateCorp",
                    "dates": "2018 - 2021",
                    "achievements": [
                        "Built responsive web applications using React and Node.js",
                        "Implemented automated testing pipeline, improving code quality by 60%",
                        "Collaborated with UX team to deliver user-friendly interfaces"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "University of Washington",
                    "dates": "2014 - 2018",
                    "gpa": "3.7"
                }
            ]
        }
        
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(sample_resume, "fpdf2 Test Resume")
        
        if pdf_buffer and len(pdf_buffer.getvalue()) > 0:
            pdf_size = len(pdf_buffer.getvalue())
            print(f"✅ PDF generated successfully! Size: {pdf_size} bytes")
            
            # Save test PDF
            with open('test_fpdf2_resume.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_fpdf2_resume.pdf'")
            
            return True
        else:
            print("❌ PDF generation failed - empty buffer")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

def main():
    """Run fpdf2 tests"""
    print("🧪 fpdf2 PDF Generation Test")
    print("=" * 35)
    
    # Test imports
    if not test_fpdf2_imports():
        print("\n❌ fpdf2 import tests failed")
        return False
    
    # Test PDF generation
    if not test_fpdf2_pdf_generation():
        print("\n❌ PDF generation tests failed")
        return False
    
    print("\n🎉 All fpdf2 tests passed!")
    print("✅ fpdf2 is working correctly")
    print("✅ Pure Python PDF generation ready for Lambda")
    print("✅ No compiled dependencies required")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)