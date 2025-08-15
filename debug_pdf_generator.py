#!/usr/bin/env python3
"""
Debug script to check what's failing in PDF generator
"""

import sys
import os
import json

# Add the AI handler directory to path
sys.path.insert(0, 'backend/lambda-functions/ai-handler')

def debug_pdf_generator():
    """Debug the PDF generator to see what's failing"""
    
    print("🔍 Debugging PDF Generator...")
    
    try:
        # Try to import the PDF generator
        print("📦 Importing PDF generator...")
        from pdf_generator import create_pdf_from_resume_json, wrap_text
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
        
        print("📄 Testing create_pdf_from_resume_json directly...")
        
        # Test the main function directly to see if it throws an exception
        try:
            pdf_buffer = create_pdf_from_resume_json(sample_resume)
            print(f"✅ Main function succeeded! Size: {len(pdf_buffer.getvalue())} bytes")
            
            # Check if it's actually formatted or just plain text
            pdf_content = pdf_buffer.getvalue().decode('utf-8', errors='ignore')
            if 'BT' in pdf_content and '/F1' in pdf_content:
                print("✅ PDF contains formatting commands")
            else:
                print("❌ PDF appears to be plain text")
                
        except Exception as e:
            print(f"❌ Main function failed: {e}")
            print(f"Exception type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            
        # Test wrap_text function
        print("\n🔤 Testing wrap_text function...")
        try:
            wrapped = wrap_text("This is a test of the wrap text function with a long sentence", 20)
            print(f"✅ wrap_text works: {wrapped}")
        except Exception as e:
            print(f"❌ wrap_text failed: {e}")
            
    except Exception as e:
        print(f"❌ Import or setup error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_pdf_generator()