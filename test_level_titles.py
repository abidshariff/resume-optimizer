#!/usr/bin/env python3

import re

def clean_job_title(title):
    """Clean job title by extracting the core role and removing specializations."""
    if not title:
        return ''
    
    cleaned = title.strip()
    
    # First, remove common patterns like location, remote info, etc.
    patterns_to_remove = [
        r'\s*\(Remote.*?\)',  # (Remote - United States)
        r'\s*\(.*?Remote.*?\)',  # (Remote)
        r'\s*-\s*Remote.*',  # - Remote
        r'\s*\|\s*.*',  # | anything after pipe
        r'\s*-\s*\d+.*',  # - numbers (job IDs)
        r'\s*\(.*?\)\s*$',  # (anything) at end
        r'\s*-\s*.*\s+\w{2,3}\s*$',  # - Location State
    ]
    
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    # Also remove level indicators and other parenthetical info anywhere in the title
    # This handles cases like "Senior Engineer (L5), Platform Team"
    cleaned = re.sub(r'\s*\([^)]*\)', '', cleaned)  # Remove any remaining parentheses
    
    # Extract core job title by handling comma-separated specializations
    if ',' in cleaned:
        core_title = cleaned.split(',')[0].strip()
        
        # Only keep department specializations for executive/management titles
        core_title_lower = core_title.lower()
        executive_titles = [
            'director', 'vp', 'vice president', 'head', 'chief', 'manager'
        ]
        
        specialization = cleaned.split(',')[1].strip() if ',' in cleaned else ''
        specialization_lower = specialization.lower()
        
        # Common department/area specializations to keep
        important_departments = [
            'engineering', 'product', 'marketing', 'sales', 'operations', 
            'finance', 'hr', 'human resources', 'design', 'analytics',
            'security', 'infrastructure', 'platform', 'strategy'
        ]
        
        # Only keep specialization for executive/management titles with department names
        if (any(exec_title in core_title_lower for exec_title in executive_titles) and
            any(dept in specialization_lower for dept in important_departments)):
            cleaned = f"{core_title}, {specialization}"
        else:
            # Otherwise, just use the core title
            cleaned = core_title
    
    # Handle dash-separated specializations similarly
    elif ' - ' in cleaned and not any(word in cleaned.lower() for word in ['remote', 'location']):
        parts = cleaned.split(' - ')
        core_title = parts[0].strip()
        
        # Apply same logic for dash-separated titles
        core_title_lower = core_title.lower()
        specialization = parts[1].strip() if len(parts) > 1 else ''
        specialization_lower = specialization.lower()
        
        # Only keep department specializations for executive/management titles
        executive_titles = [
            'director', 'vp', 'vice president', 'head', 'chief'
        ]
        
        important_departments = [
            'engineering', 'product', 'marketing', 'sales', 'operations',
            'finance', 'hr', 'human resources', 'design', 'data', 'analytics',
            'security', 'infrastructure', 'platform', 'strategy'
        ]
        
        # Only keep specialization for executive titles with department names
        if (any(exec_title in core_title_lower for exec_title in executive_titles) and
            any(dept in specialization_lower for dept in important_departments)):
            cleaned = f"{core_title} - {specialization}"
        else:
            cleaned = core_title
    
    # Clean up extra spaces
    cleaned = ' '.join(cleaned.split())
    
    return cleaned.strip()

def test_level_titles():
    """Test job titles with level indicators."""
    
    test_cases = [
        # Level indicators that should be removed
        ("Software Engineer (L4)", "Software Engineer"),
        ("Software Engineer (L5)", "Software Engineer"),
        ("Senior Software Engineer (L6)", "Senior Software Engineer"),
        ("Staff Software Engineer (L7)", "Staff Software Engineer"),
        ("Principal Engineer (L8)", "Principal Engineer"),
        ("Data Scientist (L4)", "Data Scientist"),
        ("Product Manager (L5)", "Product Manager"),
        
        # Other parenthetical info that should be removed
        ("Software Engineer (Backend)", "Software Engineer"),
        ("Product Manager (Growth)", "Product Manager"),
        ("Data Scientist (ML)", "Data Scientist"),
        
        # Mixed cases
        ("Senior Software Engineer (L5), Platform Team", "Senior Software Engineer"),
        ("Staff Engineer (L7) - Infrastructure", "Staff Engineer"),
        
        # Should keep executive titles with departments
        ("Director, Engineering (L9)", "Director, Engineering"),
        ("VP, Product (L10)", "VP, Product"),
    ]
    
    print("=" * 80)
    print("TESTING LEVEL INDICATOR CLEANING")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for original, expected in test_cases:
        result = clean_job_title(original)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        
        if result == expected:
            passed += 1
        else:
            failed += 1
        
        print(f"{status} | '{original}' -> '{result}' (expected: '{expected}')")
    
    print("\n" + "=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 80)
    
    return failed == 0

if __name__ == "__main__":
    test_level_titles()