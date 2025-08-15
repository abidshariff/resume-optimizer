#!/usr/bin/env python3
"""
Test the Unicode ligature fix for the email corruption issue.
"""

import sys
import os

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import clean_text_for_pdf

def test_ligature_fix():
    """Test that Unicode ligatures are properly converted."""
    print("🧪 Testing Unicode ligature fix...")
    
    # Test cases with Unicode ligatures
    test_cases = [
        ("abidshariﬀ009@gmail.com", "abidshaiff2009@gmail.com"),  # FF ligature
        ("oﬃce@company.com", "office@company.com"),  # FFI ligature  
        ("ﬁle@test.org", "file@test.org"),  # FI ligature
        ("ﬂag@example.com", "flag@example.com"),  # FL ligature
        ("regular@email.com", "regular@email.com"),  # No ligatures
    ]
    
    print("Testing ligature conversion:")
    all_passed = True
    
    for original, expected in test_cases:
        result = clean_text_for_pdf(original)
        status = "✅" if result == expected else "❌"
        print(f"  {status} '{original}' → '{result}'")
        if result != expected:
            print(f"      Expected: '{expected}'")
            all_passed = False
    
    return all_passed

def test_specific_email():
    """Test the specific email that was causing issues."""
    print("\n🎯 Testing the specific problematic email...")
    
    # This is the exact string from the debug output
    problematic_contact = "abidshariﬀ009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States"
    expected_contact = "abidshaiff2009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States"
    
    print(f"Original: '{problematic_contact}'")
    print(f"Character codes around 'ﬀ': {[ord(c) for c in problematic_contact[8:12]]}")
    
    result = clean_text_for_pdf(problematic_contact)
    print(f"Cleaned:  '{result}'")
    
    if expected_contact == result:
        print("✅ Email ligature fix successful!")
        return True
    else:
        print("❌ Email ligature fix failed!")
        print(f"Expected: '{expected_contact}'")
        return False

if __name__ == "__main__":
    print("🔧 Unicode Ligature Fix Test")
    print("=" * 50)
    
    ligature_success = test_ligature_fix()
    email_success = test_specific_email()
    
    print("\n" + "=" * 50)
    if ligature_success and email_success:
        print("🎉 All ligature tests PASSED!")
        print("   The email corruption issue should now be fixed.")
    else:
        print("💥 Some ligature tests FAILED!")
        if not ligature_success:
            print("   - General ligature conversion issues")
        if not email_success:
            print("   - Specific email fix issues")
    
    sys.exit(0 if (ligature_success and email_success) else 1)