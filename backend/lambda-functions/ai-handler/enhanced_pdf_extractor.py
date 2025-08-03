"""
Enhanced PDF text extraction with better formatting preservation
Improves the quality of extracted text for comparison view
"""

import PyPDF2
import re
from io import BytesIO

def extract_text_with_formatting(pdf_content):
    """
    Extract text from PDF with enhanced formatting preservation
    
    Args:
        pdf_content: PDF file content as bytes
        
    Returns:
        str: Formatted text with improved structure
    """
    try:
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        
        # Extract text from all pages
        full_text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                # Add page separator for multi-page documents
                if page_num > 0:
                    full_text += "\n" + "="*50 + f" PAGE {page_num + 1} " + "="*50 + "\n\n"
                full_text += page_text
        
        # Apply enhanced formatting
        formatted_text = enhance_text_formatting(full_text)
        
        return formatted_text
        
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return "Error: Could not extract text from PDF file"

def enhance_text_formatting(raw_text):
    """
    Apply intelligent formatting to extracted PDF text
    
    Args:
        raw_text: Raw extracted text from PDF
        
    Returns:
        str: Enhanced formatted text
    """
    if not raw_text:
        return "No text content found in PDF"
    
    # Clean up the text
    text = clean_pdf_artifacts(raw_text)
    
    # Apply intelligent formatting
    text = add_section_formatting(text)
    text = format_contact_info(text)
    text = format_dates_and_locations(text)
    text = format_bullet_points(text)
    text = improve_spacing(text)
    
    return text

def clean_pdf_artifacts(text):
    """Remove common PDF extraction artifacts"""
    
    # Remove excessive whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Fix broken words across lines
    text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)
    
    # Remove standalone page numbers
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Clean up bullet points
    text = re.sub(r'[•·▪▫◦‣⁃]', '•', text)
    
    # Fix broken email addresses
    text = re.sub(r'(\w+)\s*@\s*(\w+)', r'\1@\2', text)
    
    # Fix broken phone numbers
    text = re.sub(r'(\d{3})\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})', r'\1-\2-\3', text)
    
    # Fix broken URLs
    text = re.sub(r'(https?://)\s*(\S+)', r'\1\2', text)
    
    return text

def add_section_formatting(text):
    """Add formatting for resume sections"""
    
    # Common resume section headers
    section_patterns = [
        (r'\b(PROFESSIONAL\s+SUMMARY|SUMMARY)\b', r'\n\n📋 \1\n' + '─'*40),
        (r'\b(WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE)\b', r'\n\n💼 \1\n' + '─'*40),
        (r'\b(EDUCATION)\b', r'\n\n🎓 \1\n' + '─'*40),
        (r'\b(TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES)\b', r'\n\n🛠️ \1\n' + '─'*40),
        (r'\b(PROJECTS)\b', r'\n\n🚀 \1\n' + '─'*40),
        (r'\b(CERTIFICATIONS)\b', r'\n\n📜 \1\n' + '─'*40),
        (r'\b(ACHIEVEMENTS|ACCOMPLISHMENTS)\b', r'\n\n🏆 \1\n' + '─'*40),
    ]
    
    for pattern, replacement in section_patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    return text

def format_contact_info(text):
    """Format contact information with icons"""
    
    # Email addresses
    text = re.sub(r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b', r'📧 \1', text)
    
    # Phone numbers
    text = re.sub(r'\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b', r'📞 \1', text)
    
    # LinkedIn profiles
    text = re.sub(r'(linkedin\.com/in/[^\s]+)', r'🔗 \1', text)
    
    # GitHub profiles
    text = re.sub(r'(github\.com/[^\s]+)', r'💻 \1', text)
    
    return text

def format_dates_and_locations(text):
    """Format dates and locations"""
    
    # Date ranges
    date_patterns = [
        (r'\b(\d{4}\s*[-–]\s*\d{4})\b', r'📅 \1'),
        (r'\b(\d{4}\s*[-–]\s*Present)\b', r'📅 \1'),
        (r'\b(\w+\s+\d{4}\s*[-–]\s*\w+\s+\d{4})\b', r'📅 \1'),
        (r'\b(\w+\s+\d{4}\s*[-–]\s*Present)\b', r'📅 \1'),
    ]
    
    for pattern, replacement in date_patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # Locations (City, State format)
    text = re.sub(r'\b([A-Z][a-z]+,\s*[A-Z]{2})\b', r'📍 \1', text)
    
    return text

def format_bullet_points(text):
    """Improve bullet point formatting"""
    
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            formatted_lines.append('')
            continue
            
        # Check if line starts with a bullet or action verb
        if (line.startswith('•') or 
            re.match(r'^(Developed|Managed|Led|Implemented|Created|Designed|Built|Improved|Increased|Reduced|Achieved)', line, re.IGNORECASE)):
            
            # Clean up existing bullet
            line = re.sub(r'^[•·▪▫◦‣⁃\-\*]\s*', '', line)
            formatted_lines.append(f'  • {line}')
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def improve_spacing(text):
    """Improve overall text spacing"""
    
    # Remove excessive line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Add spacing around sections
    text = re.sub(r'(─{20,})', r'\1\n', text)
    
    # Ensure proper spacing after icons
    text = re.sub(r'([📋💼🎓🛠️🚀📜🏆📧📞🔗💻📅📍])\s*', r'\1 ', text)
    
    return text.strip()

def get_pdf_metadata(pdf_content):
    """Extract metadata from PDF for additional context"""
    
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        metadata = pdf_reader.metadata
        
        info = {
            'pages': len(pdf_reader.pages),
            'title': metadata.get('/Title', 'Unknown') if metadata else 'Unknown',
            'author': metadata.get('/Author', 'Unknown') if metadata else 'Unknown',
            'creator': metadata.get('/Creator', 'Unknown') if metadata else 'Unknown'
        }
        
        return info
        
    except Exception as e:
        print(f"Error extracting PDF metadata: {str(e)}")
        return {'pages': 0, 'title': 'Unknown', 'author': 'Unknown', 'creator': 'Unknown'}

def create_formatted_header(pdf_content):
    """Create a formatted header for the extracted text"""
    
    metadata = get_pdf_metadata(pdf_content)
    
    header = f"""📄 ORIGINAL RESUME (PDF)
{'='*60}
📊 Document Info: {metadata['pages']} page(s)
🔍 Extracted and formatted for comparison
⚡ AI optimization will preserve original formatting in final output

{'='*60}

"""
    
    return header
