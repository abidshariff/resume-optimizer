#!/usr/bin/env python3
"""
Debug the exact ligature issue to understand the character positioning.
"""

def debug_ligature_issue():
    """Debug the exact character positioning in the problematic email."""
    
    # The problematic string from the debug output
    problematic = "abidshariﬀ009@gmail.com"
    expected = "abidshaiff2009@gmail.com"
    
    print("🔍 Character-by-character analysis:")
    print(f"Problematic: '{problematic}'")
    print(f"Expected:    '{expected}'")
    print()
    
    print("Problematic string characters:")
    for i, char in enumerate(problematic):
        print(f"  [{i:2d}] '{char}' -> ord({ord(char):5d}) -> {repr(char)}")
    
    print("\nExpected string characters:")
    for i, char in enumerate(expected):
        print(f"  [{i:2d}] '{char}' -> ord({ord(char):5d}) -> {repr(char)}")
    
    print("\nLigature analysis:")
    ligature_pos = problematic.find('ﬀ')
    if ligature_pos >= 0:
        print(f"Ligature 'ﬀ' found at position {ligature_pos}")
        print(f"Characters before ligature: '{problematic[:ligature_pos]}'")
        print(f"Characters after ligature: '{problematic[ligature_pos+1:]}'")
        
        # What should it be?
        before_expected = expected[:ligature_pos]
        after_expected = expected[ligature_pos+2:]  # +2 because 'ff' is 2 characters
        print(f"Expected before: '{before_expected}'")
        print(f"Expected after: '{after_expected}'")
        
        # The issue might be that we have the wrong characters before the ligature
        print(f"\nComparison:")
        print(f"  Actual before ligature:   '{problematic[:ligature_pos]}'")
        print(f"  Expected before 'ff':     '{expected[:expected.find('ff')]}'")

if __name__ == "__main__":
    debug_ligature_issue()