#!/usr/bin/env python3
"""
Test script to check PDF generator functionality
"""

import sys
import os
import json

# Add the AI handler directory to path
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def test_pdf_generator():
    """Test the PDF generator with sample resume data"""
    
    print("🧪 Testing PDF Generator...")
    
    try:
        # Try to import the PDF generator
        print("📦 Importing PDF generator...")
        from pdf_generator import create_pdf_resume
        print("✅ PDF generator imported successfully")
        
        # Sample resume data
        sample_resume = {
            "full_name": "John Doe",
            "contact_info": "john.doe@email.com | (555) 123-4567 | New York, NY",
            "professional_summary": "Experienced software engineer with 5+ years of experience in full-stack development.",
            "skills": ["Python", "JavaScript", "React", "AWS", "Docker"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "dates": "Jan 2020 - Present",
                    "achievements": [
                        "Led development of microservices architecture",
                        "Improved system performance by 40%"
                    ]
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
        
        print("📄 Creating PDF from sample resume...")
        pdf_buffer = create_pdf_resume(sample_resume)
        
        if pdf_buffer:
            print(f"✅ PDF created successfully! Size: {len(pdf_buffer.getvalue())} bytes")
            return True
        else:
            print("❌ PDF creation returned None")
            return False
            
    except SyntaxError as e:
        print(f"❌ Syntax Error in PDF generator: {e}")
        return False
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Runtime Error: {e}")
        return False

if __name__ == "__main__":
    success = test_pdf_generator()
    if success:
        print("\n🎉 PDF Generator test PASSED")
        sys.exit(0)
    else:
        print("\n💥 PDF Generator test FAILED")
        sys.exit(1)