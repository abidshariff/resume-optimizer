#!/usr/bin/env python3
"""
Test script to verify fonttools import works correctly.
This simulates the Lambda environment import behavior.
"""

import sys
import os

def test_fonttools_import():
    """Test that fonttools can be imported correctly."""
    print("Testing fonttools import...")
    
    try:
        # Test direct import
        import fonttools
        print("✅ Successfully imported fonttools")
        print(f"   fonttools location: {fonttools.__file__}")
        
        # Test specific submodule that fpdf2 uses
        from fonttools.ttLib import TTFont
        print("✅ Successfully imported TTFont from fonttools.ttLib")
        
        # Test fpdf2 import (which depends on fonttools)
        from fpdf import FPDF
        print("✅ Successfully imported FPDF")
        
        # Create a simple PDF to test functionality
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(40, 10, 'Test PDF')
        
        # Try to output (this will test fonttools integration)
        pdf_output = pdf.output(dest='S')
        print("✅ Successfully created PDF output")
        print(f"   PDF output size: {len(pdf_output)} bytes")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_fonttools_directories():
    """Check if both fonttools and fontTools directories exist."""
    print("\nChecking fonttools directory structure...")
    
    # Check current directory for fonttools
    if os.path.exists('fonttools'):
        print("✅ fonttools directory found")
    else:
        print("❌ fonttools directory not found")
    
    if os.path.exists('fontTools'):
        print("✅ fontTools directory found")
    else:
        print("❌ fontTools directory not found")

if __name__ == "__main__":
    print("🧪 Testing fonttools import compatibility")
    print("=" * 50)
    
    check_fonttools_directories()
    
    success = test_fonttools_import()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! fonttools is working correctly.")
    else:
        print("💥 Tests failed. fonttools import issues detected.")
    
    sys.exit(0 if success else 1)