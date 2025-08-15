#!/usr/bin/env python3
"""
Test Unicode character handling in PDF generation.
"""

import json
import sys
import os

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import create_pdf_from_resume_json, clean_text_for_pdf

def test_unicode_cleaning():
    """Test the Unicode text cleaning function."""
    print("🧪 Testing Unicode text cleaning...")
    
    test_cases = [
        ("José María", "Jose Maria"),
        ("Café résumé", "Cafe resume"),
        ("naïve résumé", "naive resume"),
        ("François Müller", "Francois Muller"),
        ('Smart "quotes" and \'apostrophes\'', 'Smart "quotes" and \'apostrophes\''),
        ("En–dash and Em—dash", "En-dash and Em-dash"),
        ("Bullet • point", "Bullet - point"),
        ("Degree 25°C", "Degree 25 degreesC"),
        ("Copyright © 2024", "Copyright (C) 2024"),
        ("Trademark™ symbol", "Trademark(TM) symbol"),
    ]
    
    all_passed = True
    for original, expected in test_cases:
        cleaned = clean_text_for_pdf(original)
        if cleaned == expected:
            print(f"✅ '{original}' → '{cleaned}'")
        else:
            print(f"❌ '{original}' → '{cleaned}' (expected: '{expected}')")
            all_passed = False
    
    return all_passed

def test_unicode_pdf_generation():
    """Test PDF generation with Unicode characters."""
    print("\n🧪 Testing PDF generation with Unicode characters...")
    
    # Sample resume with Unicode characters
    unicode_resume = {
        "full_name": "José María González",
        "contact_info": "josé.gonzález@email.com | (555) 123-4567 | Café Street, Montréal",
        "professional_summary": "Experienced software engineer with naïve approach to résumé writing. Specializes in café management systems and Müller algorithms.",
        "skills": [
            "Café Management", "Résumé Writing", "Naïve Algorithms", 
            "François Framework", "Montréal Systems", "José's Methods"
        ],
        "experience": [
            {
                "title": "Senior Café Engineer",
                "company": "Résumé Solutions Inc.",
                "dates": "2020 – Present",
                "achievements": [
                    "Developed naïve café management system for François",
                    "Improved résumé quality by 150% using José's methods",
                    "Led team in Montréal office with 25° temperature control"
                ]
            }
        ],
        "education": [
            {
                "degree": "Master's in Café Engineering",
                "institution": "Université de Montréal",
                "dates": "2018 – 2020",
                "gpa": "3.9",
                "details": "Specialized in naïve résumé algorithms"
            }
        ]
    }
    
    try:
        # Convert to JSON string
        resume_json_str = json.dumps(unicode_resume)
        
        # Generate PDF
        print("📄 Generating PDF with Unicode characters...")
        pdf_buffer = create_pdf_from_resume_json(resume_json_str, "Unicode Test Résumé")
        
        # Check if PDF was created successfully
        if pdf_buffer and hasattr(pdf_buffer, 'getvalue'):
            pdf_data = pdf_buffer.getvalue()
            pdf_size = len(pdf_data)
            
            print(f"✅ PDF generated successfully!")
            print(f"   PDF size: {pdf_size} bytes")
            
            # Basic PDF validation
            if pdf_data.startswith(b'%PDF-'):
                print("✅ PDF format validation passed")
                
                # Save test PDF
                with open('unicode_test_resume.pdf', 'wb') as f:
                    f.write(pdf_data)
                print("✅ Unicode test PDF saved as 'unicode_test_resume.pdf'")
                
                return True
            else:
                print("❌ PDF format validation failed")
                return False
        else:
            print("❌ PDF generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during Unicode PDF generation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🌍 Unicode PDF Generation Test")
    print("=" * 50)
    
    # Test text cleaning
    cleaning_success = test_unicode_cleaning()
    
    # Test PDF generation
    pdf_success = test_unicode_pdf_generation()
    
    print("\n" + "=" * 50)
    if cleaning_success and pdf_success:
        print("🎉 All Unicode tests PASSED!")
        print("   PDF generator can now handle Unicode characters safely.")
    else:
        print("💥 Some Unicode tests FAILED!")
        if not cleaning_success:
            print("   - Text cleaning issues detected")
        if not pdf_success:
            print("   - PDF generation issues detected")
    
    sys.exit(0 if (cleaning_success and pdf_success) else 1)