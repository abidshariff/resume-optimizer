"""
Advanced text cleanup for PDF extractions with OCR-like artifacts
Fixes common issues with PDF text extraction quality
"""

import re

def clean_extracted_text(raw_text):
    """
    Comprehensive text cleanup for PDF extractions
    Fixes OCR artifacts, encoding issues, and formatting problems
    """
    if not raw_text:
        return "No text content available"
    
    text = raw_text
    
    # Step 1: Fix character encoding issues
    text = fix_character_encoding(text)
    
    # Step 2: Fix OCR artifacts and broken words
    text = fix_ocr_artifacts(text)
    
    # Step 3: Clean up formatting and spacing
    text = clean_formatting(text)
    
    # Step 4: Fix section headers and structure
    text = fix_section_structure(text)
    
    # Step 5: Improve overall readability
    text = improve_readability(text)
    
    return text

def fix_character_encoding(text):
    """Fix common character encoding issues"""
    
    # Fix ligatures and special characters
    replacements = {
        'ﬀ': 'ff',  # Double f ligature
        'ﬁ': 'fi',  # fi ligature
        'ﬂ': 'fl',  # fl ligature
        'ﬃ': 'ffi', # ffi ligature
        'ﬄ': 'ffl', # ffl ligature
        '◇': '•',   # Diamond to bullet
        '◦': '•',   # White bullet to bullet
        '▪': '•',   # Black square to bullet
        '▫': '•',   # White square to bullet
        '‣': '•',   # Triangular bullet to bullet
        '⁃': '•',   # Hyphen bullet to bullet
        ''': "'",   # Smart quote to regular quote
        ''': "'",   # Smart quote to regular quote
        '"': '"',   # Smart quote to regular quote
        '"': '"',   # Smart quote to regular quote
        '–': '-',   # En dash to hyphen
        '—': '-',   # Em dash to hyphen
        '…': '...',  # Ellipsis to three dots
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text

def fix_ocr_artifacts(text):
    """Fix common OCR misreading artifacts"""
    
    # Common OCR mistakes
    ocr_fixes = {
        # Numbers mistaken for letters
        'Pla2orm': 'Platform',
        'pla2orm': 'platform',
        'Scrip9ng': 'Scripting',
        'scrip9ng': 'scripting',
        'Visualiza9on': 'Visualization',
        'visualiza9on': 'visualization',
        'Orchestra9on': 'Orchestration',
        'orchestra9on': 'orchestration',
        'Informa9on': 'Information',
        'informa9on': 'information',
        'Solu9ons': 'Solutions',
        'solu9ons': 'solutions',
        'Prac99oner': 'Practitioner',
        'prac99oner': 'practitioner',
        
        # Letters mistaken for other letters/symbols
        'criOcal': 'critical',
        'analyOcs': 'analytics',
        'AcquisiOon': 'Acquisition',
        'acquisiOon': 'acquisition',
        'plaTorms': 'platforms',
        'recruiOng': 'recruiting',
        'opOmized': 'optimized',
        'real-Ome': 'real-time',
        'transformaOon': 'transformation',
        'InformaOca': 'Informatica',
        'organizaOonal': 'organizational',
        'protecOon': 'protection',
        'applicaOons': 'applications',
        'operaOonal': 'operational',
        'Ockets': 'tickets',
        'uOlity': 'utility',
        'Ome-to-market': 'time-to-market',
        'eﬃciency': 'efficiency',
        'upOme': 'uptime',
        'workﬂows': 'workflows',
        'ﬂexibility': 'flexibility',
        'interacOve': 'interactive',
        'de-duplicaOon': 'de-duplication',
        'analyOc': 'analytic',
        'ﬁnancial': 'financial',
        'transacOons': 'transactions',
        'mulOnaOonal': 'multinational',
        'navigaOon': 'navigation',
        'bonlenecks': 'bottlenecks',
        'execuOon': 'execution',
        'producOon': 'production',
        'eﬀort': 'effort',
        'InsOtute': 'Institute',
        'Buﬀalo': 'Buffalo',
        'signiﬁcantly': 'significantly',
        'creaOvity': 'creativity',
        'reducOon': 'reduction',
        'supporOng': 'supporting',
        'decision-making': 'decision-making',
    }
    
    for mistake, correction in ocr_fixes.items():
        text = text.replace(mistake, correction)
    
    return text

def clean_formatting(text):
    """Clean up formatting and spacing issues"""
    
    # Remove excessive whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Fix broken words across lines (common in PDF extraction)
    text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
    
    # Remove standalone page numbers
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Fix broken email addresses
    text = re.sub(r'(\w+)\s*@\s*(\w+)', r'\1@\2', text)
    
    # Fix broken phone numbers
    text = re.sub(r'\((\d{3})\)\s*(\d{3})\s*-?\s*(\d{4})', r'(\1) \2-\3', text)
    text = re.sub(r'(\d{3})\s*-?\s*(\d{3})\s*-?\s*(\d{4})', r'\1-\2-\3', text)
    
    # Fix broken URLs
    text = re.sub(r'(https?://)\s*(\S+)', r'\1\2', text)
    text = re.sub(r'(www\.)\s*(\S+)', r'\1\2', text)
    
    # Clean up bullet points
    text = re.sub(r'[•·▪▫◦‣⁃]\s*', '• ', text)
    
    return text

def fix_section_structure(text):
    """Fix section headers and improve structure"""
    
    lines = text.split('\n')
    cleaned_lines = []
    
    # Common section headers to standardize
    section_mappings = {
        'SUMMARY': 'PROFESSIONAL SUMMARY',
        'PROFILE': 'PROFESSIONAL SUMMARY',
        'OBJECTIVE': 'PROFESSIONAL SUMMARY',
        'WORK EXPERIENCE': 'EXPERIENCE',
        'PROFESSIONAL EXPERIENCE': 'EXPERIENCE',
        'EMPLOYMENT': 'EXPERIENCE',
        'CAREER': 'EXPERIENCE',
        'TECHNICAL SKILLS': 'SKILLS',
        'CORE COMPETENCIES': 'SKILLS',
        'COMPETENCIES': 'SKILLS',
        'TECHNOLOGIES': 'SKILLS',
        'TOOLS': 'SKILLS',
        'ACADEMIC': 'EDUCATION',
        'QUALIFICATIONS': 'EDUCATION',
        'CERTIFICATES': 'CERTIFICATIONS',
        'LICENSES': 'CERTIFICATIONS',
        'ACHIEVEMENTS': 'ACCOMPLISHMENTS',
        'AWARDS': 'ACCOMPLISHMENTS',
        'HONORS': 'ACCOMPLISHMENTS',
    }
    
    for line in lines:
        line = line.strip()
        if not line:
            cleaned_lines.append('')
            continue
        
        # Check if this is a section header
        line_upper = line.upper()
        
        # Replace section headers with standardized versions
        for old_header, new_header in section_mappings.items():
            if line_upper == old_header or line_upper.startswith(old_header):
                line = new_header
                break
        
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def improve_readability(text):
    """Final pass to improve overall readability"""
    
    # Remove excessive line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Ensure proper spacing after periods
    text = re.sub(r'\.(\w)', r'. \1', text)
    
    # Fix spacing around commas
    text = re.sub(r',(\w)', r', \1', text)
    
    # Fix spacing around colons
    text = re.sub(r':(\w)', r': \1', text)
    
    # Ensure proper capitalization after periods
    def capitalize_after_period(match):
        return match.group(1) + match.group(2).upper()
    
    text = re.sub(r'(\. )([a-z])', capitalize_after_period, text)
    
    # Remove trailing whitespace from lines
    lines = text.split('\n')
    cleaned_lines = [line.rstrip() for line in lines]
    text = '\n'.join(cleaned_lines)
    
    return text.strip()

def create_professional_header(name, contact_info):
    """Create a professional header from extracted name and contact info"""
    
    header_lines = []
    
    if name:
        header_lines.append(name.upper())
        header_lines.append('=' * len(name))
        header_lines.append('')
    
    if contact_info:
        # Clean up contact info
        contact_parts = []
        for info in contact_info:
            info = info.strip()
            if info and info not in contact_parts:
                contact_parts.append(info)
        
        if contact_parts:
            header_lines.extend(contact_parts)
            header_lines.append('')
    
    return '\n'.join(header_lines)

def extract_and_clean_sections(text):
    """Extract and clean individual sections for better formatting"""
    
    sections = {}
    current_section = None
    current_content = []
    
    lines = text.split('\n')
    
    # Common section identifiers
    section_keywords = [
        'PROFESSIONAL SUMMARY', 'SUMMARY', 'PROFILE', 'OBJECTIVE',
        'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
        'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
        'EDUCATION', 'ACADEMIC', 'QUALIFICATIONS',
        'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES',
        'PROJECTS', 'ACCOMPLISHMENTS', 'ACHIEVEMENTS', 'AWARDS'
    ]
    
    for line in lines:
        line = line.strip()
        
        # Check if this line is a section header
        is_section_header = False
        for keyword in section_keywords:
            if line.upper() == keyword or (len(line) < 50 and keyword in line.upper()):
                is_section_header = True
                
                # Save previous section
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = keyword
                current_content = []
                break
        
        if not is_section_header and line:
            current_content.append(line)
    
    # Save last section
    if current_section and current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    
    return sections
