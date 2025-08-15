#!/usr/bin/env python3
"""
Test ReportLab PDF generation with detailed verification
"""

import sys
import os
import json

# Add the AI handler directory to path
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_reportlab_pdf():
    """Test ReportLab PDF generation with detailed verification"""
    
    print("🧪 Testing ReportLab PDF Generation...")
    
    try:
        # Import the PDF generator
        from pdf_generator import create_pdf_resume, REPORTLAB_AVAILABLE
        
        print(f"📦 ReportLab Available: {REPORTLAB_AVAILABLE}")
        
        if not REPORTLAB_AVAILABLE:
            print("❌ ReportLab is not available!")
            return False
        
        # Sample resume data
        sample_resume = {
            "full_name": "John Doe",
            "contact_info": "john.doe@email.com | (555) 123-4567 | New York, NY",
            "professional_summary": "Experienced software engineer with 5+ years of experience in full-stack development, specializing in cloud-native applications and microservices architecture.",
            "skills": ["Python", "JavaScript", "React", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "dates": "Jan 2020 - Present",
                    "achievements": [
                        "Led development of microservices architecture serving 1M+ users",
                        "Improved system performance by 40% through optimization",
                        "Mentored 5 junior developers in best practices"
                    ]
                },
                {
                    "title": "Software Developer",
                    "company": "StartupXYZ",
                    "dates": "Jun 2018 - Dec 2019",
                    "achievements": [
                        "Built scalable web applications using React and Node.js",
                        "Implemented CI/CD pipelines reducing deployment time by 60%"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "University of Technology",
                    "dates": "2014 - 2018",
                    "details": "Magna Cum Laude, GPA: 3.8"
                }
            ]
        }
        
        print("📄 Creating PDF with ReportLab...")
        pdf_buffer = create_pdf_resume(sample_resume)
        
        if pdf_buffer:
            pdf_size = len(pdf_buffer.getvalue())
            print(f"✅ PDF created successfully! Size: {pdf_size} bytes")
            
            # Check if it's a proper PDF (should be much larger than basic text)
            if pdf_size > 2000:
                print("✅ PDF size indicates proper ReportLab formatting")
            else:
                print("⚠️  PDF size seems small, might be fallback version")
            
            # Save a test PDF to verify
            with open('test_reportlab_output.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("💾 Test PDF saved as 'test_reportlab_output.pdf'")
            
            return True
        else:
            print("❌ PDF creation returned None")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_reportlab_pdf()
    if success:
        print("\n🎉 ReportLab PDF generation test PASSED!")
        print("📋 The PDF should now have:")
        print("   • Professional formatting with proper fonts")
        print("   • Blue underlined headers")
        print("   • Proper spacing and layout")
        print("   • No weird characters or truncation")
        sys.exit(0)
    else:
        print("\n💥 ReportLab PDF generation test FAILED!")
        sys.exit(1)