#!/usr/bin/env python3
"""
Test PDF generation with Lambda-compatible Linux binaries
"""

import sys
import os
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_lambda_compatible_imports():
    """Test that Lambda-compatible imports work"""
    print("🔍 Testing Lambda-compatible imports...")
    
    try:
        # Test PIL with Linux binaries
        import PIL
        from PIL import Image
        print(f"✅ PIL imports successful, version: {PIL.__version__}")
        
        # Test specific _imaging module that was failing
        from PIL import _imaging
        print("✅ PIL._imaging module imported successfully")
        
    except ImportError as e:
        print(f"❌ PIL import failed: {e}")
        return False
    
    try:
        # Test ReportLab imports
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.units import inch
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.enums import TA_CENTER
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        print("✅ ReportLab imports successful")
    except ImportError as e:
        print(f"❌ ReportLab import failed: {e}")
        return False
    
    return True

def test_pdf_generation_with_linux_binaries():
    """Test PDF generation with Linux-compatible binaries"""
    print("\n📄 Testing PDF generation with Linux binaries...")
    
    try:
        from pdf_generator import create_pdf_from_resume_json
        
        # Sample resume data
        sample_resume = {
            "full_name": "Jane Smith",
            "contact_info": "jane.smith@email.com | (555) 987-6543 | San Francisco, CA",
            "professional_summary": "Senior full-stack developer with 7+ years of experience building scalable web applications.",
            "skills": ["Python", "React", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
            "experience": [
                {
                    "title": "Lead Software Engineer",
                    "company": "TechCorp Inc",
                    "dates": "2021 - Present",
                    "achievements": [
                        "Architected microservices platform handling 10M+ requests daily",
                        "Led team of 5 engineers in developing cloud-native applications",
                        "Reduced infrastructure costs by 35% through optimization"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Master of Science in Computer Science",
                    "institution": "Stanford University",
                    "dates": "2016 - 2018",
                    "gpa": "3.9"
                }
            ]
        }
        
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(sample_resume, "Lambda Compatible Resume")
        
        if pdf_buffer and len(pdf_buffer.getvalue()) > 0:
            pdf_size = len(pdf_buffer.getvalue())
            print(f"✅ PDF generated successfully! Size: {pdf_size} bytes")
            
            # Save test PDF
            with open('test_lambda_compatible_resume.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_lambda_compatible_resume.pdf'")
            
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
    """Run Lambda compatibility tests"""
    print("🧪 Lambda-Compatible PDF Generation Test")
    print("=" * 45)
    
    # Test imports with Linux binaries
    if not test_lambda_compatible_imports():
        print("\n❌ Lambda-compatible import tests failed")
        return False
    
    # Test PDF generation
    if not test_pdf_generation_with_linux_binaries():
        print("\n❌ PDF generation tests failed")
        return False
    
    print("\n🎉 All Lambda compatibility tests passed!")
    print("✅ PIL with Linux binaries working correctly")
    print("✅ ReportLab working with proper PIL dependencies")
    print("✅ PDF generation ready for Lambda deployment")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)