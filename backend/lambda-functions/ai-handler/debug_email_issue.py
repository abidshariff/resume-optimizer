#!/usr/bin/env python3
"""
Debug the email corruption issue to identify exactly what's happening.
"""

import sys
import os
import unicodedata

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import clean_text_for_pdf

def debug_email_cleaning():
    """Debug the email cleaning process step by step."""
    original_email = "abidshaiff2009@gmail.com"
    print(f"🔍 Debugging email cleaning for: '{original_email}'")
    print("=" * 60)
    
    # Step 1: Check each character
    print("Step 1: Character analysis")
    for i, char in enumerate(original_email):
        print(f"  [{i:2d}] '{char}' -> ord({ord(char)}) -> ASCII: {ord(char) < 128}")
    
    print("\nStep 2: Unicode normalization test")
    try:
        normalized = unicodedata.normalize('NFD', original_email)
        ascii_text = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
        print(f"  Original: '{original_email}'")
        print(f"  Normalized: '{normalized}'")
        print(f"  After removing combining marks: '{ascii_text}'")
    except Exception as e:
        print(f"  Error in normalization: {e}")
        ascii_text = original_email
    
    print("\nStep 3: Safe character filtering")
    safe_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    safe_chars.update(' .,;:!?()-_@#$%&*+=[]{}|\\/<>"\'^~`')
    
    print(f"  Safe chars include 'f': {'f' in safe_chars}")
    print(f"  Safe chars include 'F': {'F' in safe_chars}")
    
    filtered_chars = []
    for i, char in enumerate(ascii_text):
        is_safe = char in safe_chars or ord(char) < 128
        filtered_chars.append(char if is_safe else '?')
        if not is_safe:
            print(f"  REMOVED: [{i:2d}] '{char}' -> ord({ord(char)})")
        elif char in 'fF':
            print(f"  KEPT: [{i:2d}] '{char}' -> ord({ord(char)})")
    
    filtered_text = ''.join(filtered_chars)
    print(f"  After filtering: '{filtered_text}'")
    
    print("\nStep 4: Final result")
    result = clean_text_for_pdf(original_email)
    print(f"  clean_text_for_pdf('{original_email}') = '{result}'")
    
    if result != original_email:
        print(f"  ❌ CORRUPTION DETECTED!")
        print(f"  Expected: '{original_email}'")
        print(f"  Got:      '{result}'")
        print(f"  Missing:  {set(original_email) - set(result)}")
    else:
        print(f"  ✅ Email preserved correctly!")

def test_various_emails():
    """Test various email formats to see which ones get corrupted."""
    print("\n" + "=" * 60)
    print("Testing various email formats:")
    
    test_emails = [
        "abidshaiff2009@gmail.com",
        "test@example.com", 
        "user.name@domain.com",
        "first.last@company.co.uk",
        "simple@test.org",
        "complex+tag@subdomain.example.com"
    ]
    
    for email in test_emails:
        result = clean_text_for_pdf(email)
        status = "✅" if result == email else "❌"
        print(f"  {status} '{email}' -> '{result}'")

if __name__ == "__main__":
    debug_email_cleaning()
    test_various_emails()