#!/usr/bin/env python3
"""
Test with the actual data structure to see where the email corruption is happening.
"""

import json
import sys
import os

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import create_pdf_from_resume_json, clean_text_for_pdf

def test_with_actual_data():
    """Test with the actual resume data structure that might be causing the issue."""
    print("🧪 Testing with actual resume data structure...")
    
    # This simulates the actual data structure that might be coming from the Lambda function
    resume_data = {
        "full_name": "Abid Shaik",
        "contact_info": "abidshaiff2009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
        "professional_summary": "Seasoned Senior Manager, Data Engineering with 15+ years of experience...",
        "skills": ["Python", "Java", "AWS"],
        "experience": [
            {
                "title": "Senior Data Engineering Manager",
                "company": "Amazon",
                "dates": "Dec '20 - Present",
                "achievements": ["Test achievement"]
            }
        ],
        "education": [
            {
                "degree": "Master of Science",
                "institution": "University",
                "dates": "2015-2017"
            }
        ]
    }
    
    print(f"Original contact_info: '{resume_data['contact_info']}'")
    
    # Test the cleaning function directly
    cleaned_contact = clean_text_for_pdf(resume_data['contact_info'])
    print(f"After clean_text_for_pdf: '{cleaned_contact}'")
    
    # Test the contact parsing logic
    contact = cleaned_contact
    contact_parts = []
    if '|' in contact:
        parts = contact.split('|')
        print(f"Split into parts: {parts}")
        for i, part in enumerate(parts):
            part = part.strip()
            print(f"  Part {i}: '{part}'")
            # Skip LinkedIn entries but keep everything else
            if part and 'linkedin' not in part.lower():
                # Clean up but preserve @ symbols for emails
                cleaned_part = part.replace('LinkedIn:', '').replace('linkedin.com/', '').strip()
                print(f"    After LinkedIn cleaning: '{cleaned_part}'")
                if cleaned_part:
                    contact_parts.append(cleaned_part)
    
    print(f"Final contact_parts: {contact_parts}")
    
    if contact_parts:
        contact_text = ' | '.join(contact_parts)
    else:
        contact_text = contact
    
    print(f"Final contact_text: '{contact_text}'")
    
    # Check if the email is preserved
    original_email = "abidshaiff2009@gmail.com"
    if original_email in contact_text:
        print("✅ Email preserved in contact processing!")
    else:
        print("❌ Email corrupted in contact processing!")
        print(f"Expected: {original_email}")
        print(f"Found in: {contact_text}")
    
    # Now test the full PDF generation
    print("\n" + "="*50)
    print("Testing full PDF generation...")
    
    try:
        resume_json_str = json.dumps(resume_data)
        pdf_buffer = create_pdf_from_resume_json(resume_json_str, "Test Resume")
        
        if pdf_buffer:
            pdf_data = pdf_buffer.getvalue()
            print(f"✅ PDF generated successfully ({len(pdf_data)} bytes)")
            
            # Save for inspection
            with open('debug_resume.pdf', 'wb') as f:
                f.write(pdf_data)
            print("✅ PDF saved as 'debug_resume.pdf' for inspection")
        else:
            print("❌ PDF generation failed")
            
    except Exception as e:
        print(f"❌ Error in PDF generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_with_actual_data()