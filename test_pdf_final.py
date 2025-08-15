#!/usr/bin/env python3
"""
Final test of PDF generation with proper ReportLab and PIL installation
"""

import sys
import os
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_imports():
    """Test that all required imports work"""
    print("🔍 Testing imports...")
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.units import inch
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.enums import TA_CENTER
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        print("✅ ReportLab imports successful")
    except ImportError as e:
        print(f"❌ ReportLab import failed: {e}")
        return False
    
    try:
        import PIL
        from PIL import Image
        print(f"✅ PIL imports successful, version: {PIL.__version__}")
    except ImportError as e:
        print(f"❌ PIL import failed: {e}")
        return False
    
    return True

def test_pdf_generation():
    """Test actual PDF generation"""
    print("\n📄 Testing PDF generation...")
    
    try:
        from pdf_generator import create_pdf_from_resume_json
        
        # Sample resume data
        sample_resume = {
            "full_name": "John Doe",
            "contact_info": "john.doe@email.com | (555) 123-4567 | New York, NY",
            "professional_summary": "Experienced software engineer with 5+ years of experience in full-stack development.",
            "skills": ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "dates": "2020 - Present",
                    "achievements": [
                        "Led development of microservices architecture serving 1M+ users",
                        "Reduced system latency by 40% through optimization initiatives",
                        "Mentored 3 junior developers and improved team productivity"
                    ]
                },
                {
                    "title": "Software Engineer",
                    "company": "StartupXYZ",
                    "dates": "2018 - 2020",
                    "achievements": [
                        "Built responsive web applications using React and Node.js",
                        "Implemented CI/CD pipelines reducing deployment time by 60%"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "University of Technology",
                    "dates": "2014 - 2018",
                    "gpa": "3.8"
                }
            ]
        }
        
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(sample_resume, "Test Resume")
        
        if pdf_buffer and len(pdf_buffer.getvalue()) > 0:
            pdf_size = len(pdf_buffer.getvalue())
            print(f"✅ PDF generated successfully! Size: {pdf_size} bytes")
            
            # Save test PDF
            with open('test_resume_final.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_resume_final.pdf'")
            
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
    """Run all tests"""
    print("🧪 Final PDF Generation Test")
    print("=" * 40)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed")
        return False
    
    # Test PDF generation
    if not test_pdf_generation():
        print("\n❌ PDF generation tests failed")
        return False
    
    print("\n🎉 All tests passed! PDF generation is working correctly.")
    print("✅ ReportLab and PIL are properly installed and functional")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)