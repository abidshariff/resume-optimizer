"""
Professional PDF generator using fpdf2 for proper formatting.
Creates well-formatted PDF documents from resume JSON data.
Pure Python implementation - no compiled dependencies required.
"""

import io
import json
import re
import unicodedata
from datetime import datetime

# Import fpdf2 components
from fpdf import FPDF

def format_dates_for_pdf(date_text):
    """
    Format dates to use full years (YYYY) instead of abbreviated years (YY).
    Converts formats like "Dec '20" to "Dec 2020" and "Jun '15 - Oct '17" to "Jun 2015 - Oct 2017"
    """
    if not date_text:
        return date_text
    
    import re
    
    # Pattern to match abbreviated years like '20, '15, etc.
    # Assumes years '00-'30 are 2000s, '31-'99 are 1900s
    def expand_year(match):
        year_abbrev = match.group(1)
        year_num = int(year_abbrev)
        
        # Assume '00-'30 are 2000s, '31-'99 are 1900s
        if year_num <= 30:
            full_year = 2000 + year_num
        else:
            full_year = 1900 + year_num
            
        return str(full_year)
    
    # Replace patterns like 'YY with full year
    formatted_text = re.sub(r"'(\d{2})", expand_year, date_text)
    
    return formatted_text

def clean_text_for_pdf(text):
    """
    Clean and normalize text for PDF generation to avoid Unicode issues.
    Preserves important characters like email addresses while converting problematic Unicode.
    """
    if not text:
        return ""
    
    # Convert to string if not already
    text = str(text)
    
    # First, handle Unicode ligatures that might affect email addresses
    ligature_replacements = {
        'ﬀ': 'ff',  # Latin Small Ligature FF (U+FB00)
        'ﬁ': 'fi',  # Latin Small Ligature FI (U+FB01)
        'ﬂ': 'fl',  # Latin Small Ligature FL (U+FB02)
        'ﬃ': 'ffi', # Latin Small Ligature FFI (U+FB03)
        'ﬄ': 'ffl', # Latin Small Ligature FFL (U+FB04)
        'ﬆ': 'st',  # Latin Small Ligature ST (U+FB06)
    }
    
    for ligature, replacement in ligature_replacements.items():
        text = text.replace(ligature, replacement)
    
    # Then replace other common problematic Unicode characters
    replacements = {
        '"': '"',  # Smart quotes
        '"': '"',
        ''': "'",
        ''': "'",
        '–': '-',  # En dash
        '—': '-',  # Em dash
        '…': '...',  # Ellipsis
        '•': '•',  # Keep bullet point as is - we'll handle it properly
        '◦': '•',  # White bullet -> bullet
        '▪': '•',  # Black small square -> bullet
        '▫': '•',  # White small square -> bullet
        '‣': '•',  # Triangular bullet -> bullet
        '⁃': '•',  # Hyphen bullet -> bullet
        '°': ' degrees',  # Degree symbol
        '®': '(R)',  # Registered trademark
        '™': '(TM)',  # Trademark
        '©': '(C)',  # Copyright
        '€': 'EUR',  # Euro symbol
        '£': 'GBP',  # Pound symbol
        '¥': 'JPY',  # Yen symbol
        '§': 'Section',  # Section symbol
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Normalize Unicode characters to their closest ASCII equivalents
    # This converts characters like 'ë' to 'e', 'ñ' to 'n', etc.
    try:
        normalized = unicodedata.normalize('NFD', text)
        # Only remove combining marks, keep base characters
        ascii_text = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    except:
        # Fallback if normalization fails
        ascii_text = text
    
    # Only remove characters that are truly problematic (above ASCII 127)
    # But preserve common symbols used in emails and addresses
    safe_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    safe_chars.update(' .,;:!?()-_@#$%&*+=[]{}|\\/<>"\'^~`')
    
    cleaned_text = ''.join(c for c in ascii_text if c in safe_chars or ord(c) < 128)
    
    # Clean up extra whitespace
    cleaned_text = ' '.join(cleaned_text.split())
    
    return cleaned_text

def create_pdf_from_resume_json(resume_json_str, title="Resume"):
    """
    Create a professional PDF from resume JSON data using ReportLab.
    """
    # Parse the resume JSON
    if isinstance(resume_json_str, str):
        resume_data = json.loads(resume_json_str)
    else:
        resume_data = resume_json_str
    
    # Debug logging to track email corruption
    if 'contact_info' in resume_data:
        contact_info = resume_data['contact_info']
        print(f"DEBUG: PDF Generator received contact_info: '{contact_info}'")
        
        # Check for Unicode ligatures
        if 'ﬀ' in contact_info:
            print("DEBUG: 🔍 Found Unicode ligature 'ﬀ' (U+FB00) in contact info - this will be fixed")
        
        if 'abidshaiff2009@gmail.com' in contact_info:
            print("DEBUG: ✅ Correct email found in resume data")
        elif 'abidshari009@gmail.com' in contact_info:
            print("DEBUG: ❌ Corrupted email found in resume data - corruption happened before PDF generator")
        elif 'abidshariﬀ009@gmail.com' in contact_info:
            print("DEBUG: 🔧 Found email with Unicode ligature - will be converted to regular 'ff'")
        elif '@gmail.com' in contact_info:
            print("DEBUG: ⚠️ Gmail address found but may be corrupted")
            # Show character codes for debugging
            email_part = contact_info.split('@')[0] if '@' in contact_info else contact_info
            print(f"DEBUG: Email part character codes: {[ord(c) for c in email_part if 'abid' in email_part.lower()]}")
    
    return create_fpdf_pdf(resume_data, title)

def create_fpdf_pdf(resume_data, title="Resume"):
    """
    Create a concise, professional PDF using fpdf2 with Arial font and blue headers.
    """
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    def check_space_and_add_page(required_height):
        """Check if there's enough space on current page, add new page if needed"""
        current_y = pdf.get_y()
        page_height = pdf.h - pdf.b_margin
        if current_y + required_height > page_height:
            pdf.add_page()
            return True
        return False
    
    # Colors
    blue_color = (65, 105, 225)  # Royal blue for headers
    
    # Add minimal top margin
    pdf.ln(5)
    
    # Name - centered, Arial font for better Unicode support
    name = clean_text_for_pdf(resume_data.get('full_name', 'Name Not Provided'))
    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(*blue_color)
    pdf.cell(0, 8, name, ln=True, align='C')
    pdf.set_text_color(0, 0, 0)  # Reset to black
    pdf.ln(2)
    
    # Contact info - centered, concise
    contact = clean_text_for_pdf(resume_data.get('contact_info', 'Contact information not provided'))
    
    # Parse contact info more carefully to preserve email addresses
    contact_parts = []
    if '|' in contact:
        parts = contact.split('|')
        for part in parts:
            part = part.strip()
            if part and 'linkedin' not in part.lower():
                cleaned_part = part.replace('LinkedIn:', '').replace('linkedin.com/', '').strip()
                if cleaned_part:
                    contact_parts.append(cleaned_part)
    else:
        contact = contact.replace('LinkedIn:', '').replace('linkedin.com/', '').replace('LinkedIn', '').strip()
        if contact:
            contact_parts.append(contact)
    
    if contact_parts:
        contact_text = ' | '.join(contact_parts)
    else:
        contact_text = contact
    
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 5, contact_text, ln=True, align='C')
    pdf.ln(5)
    
    # Professional Summary
    if resume_data.get('professional_summary'):
        # Section header with blue color and underline
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(*blue_color)
        pdf.cell(0, 6, 'PROFESSIONAL SUMMARY', ln=True)
        
        # Long blue underline
        current_y = pdf.get_y()
        pdf.set_draw_color(*blue_color)
        pdf.set_line_width(0.5)
        pdf.line(10, current_y - 1, 200, current_y - 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.ln(2)
        
        # Summary text - concise
        pdf.set_font('Arial', '', 11)
        summary = clean_text_for_pdf(resume_data['professional_summary'])
        pdf.multi_cell(0, 5, summary)
        pdf.ln(2)
    
    # Skills
    if resume_data.get('skills'):
        # Estimate space needed for skills section
        clean_skills = [clean_text_for_pdf(skill) for skill in resume_data['skills']]
        skills_text = ' | '.join(clean_skills)
        
        # Rough estimate: 3 lines for skills + header
        skills_height = 20
        check_space_and_add_page(skills_height)
        
        # Section header with blue color and underline
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(*blue_color)
        pdf.cell(0, 6, 'CORE COMPETENCIES', ln=True)
        
        # Long blue underline
        current_y = pdf.get_y()
        pdf.set_draw_color(*blue_color)
        pdf.set_line_width(0.5)
        pdf.line(10, current_y - 1, 200, current_y - 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.ln(2)
        
        # Skills in compact format
        pdf.set_font('Arial', '', 11)
        pdf.multi_cell(0, 5, skills_text)  # Use pipe separator
        pdf.ln(2)
    
    # Experience
    if resume_data.get('experience'):
        # Section header with blue color and underline
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(*blue_color)
        pdf.cell(0, 6, 'PROFESSIONAL EXPERIENCE', ln=True)
        
        # Long blue underline
        current_y = pdf.get_y()
        pdf.set_draw_color(*blue_color)
        pdf.set_line_width(0.5)
        pdf.line(10, current_y - 1, 200, current_y - 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.ln(2)
        
        for i, exp in enumerate(resume_data['experience']):
            # Calculate space needed for this experience entry
            achievements_count = len(exp.get('achievements', []))
            entry_height = 15 + (achievements_count * 6)  # Header + achievements
            
            # Check if we need a new page for this complete entry
            check_space_and_add_page(entry_height)
            
            # Extract experience details
            title = clean_text_for_pdf(exp.get('title', 'Position Title'))
            company = clean_text_for_pdf(exp.get('company', 'Company'))
            dates = format_dates_for_pdf(clean_text_for_pdf(exp.get('dates', 'Dates')))
            location = clean_text_for_pdf(exp.get('location', ''))
            
            # Line 1: Company name (left) and dates (right)
            pdf.set_font('Arial', 'B', 11)
            company_width = pdf.get_string_width(company)
            dates_width = pdf.get_string_width(dates)
            available_width = pdf.w - pdf.l_margin - pdf.r_margin
            
            # Company name on the left
            pdf.cell(company_width, 5, company, ln=False)
            
            # Dates on the right
            x_pos = pdf.l_margin + available_width - dates_width
            pdf.set_x(x_pos)
            pdf.cell(dates_width, 5, dates, ln=True)
            
            # Line 2: Job title (left) and location (right) - if location exists
            pdf.set_font('Arial', '', 11)
            if location:
                title_width = pdf.get_string_width(title)
                location_width = pdf.get_string_width(location)
                
                # Job title on the left
                pdf.cell(title_width, 5, title, ln=False)
                
                # Location on the right
                x_pos = pdf.l_margin + available_width - location_width
                pdf.set_x(x_pos)
                pdf.cell(location_width, 5, location, ln=True)
            else:
                # Just job title if no location
                pdf.cell(0, 5, title, ln=True)
            
            pdf.ln(1)  # Minimal space after header to save space
            
            # Achievements with bullet points
            if exp.get('achievements'):
                pdf.set_font('Arial', '', 11)
                for achievement in exp['achievements']:
                    clean_achievement = clean_text_for_pdf(achievement)
                    
                    # Save current position
                    start_x = pdf.get_x()
                    start_y = pdf.get_y()
                    
                    # Add bullet point with minimal spacing
                    current_font = pdf.font_family
                    try:
                        # Try to use Symbol font for proper bullet
                        pdf.set_font('Symbol', '', 11)
                        pdf.cell(3, 4, chr(183), ln=False)  # Smaller width for bullet
                        pdf.set_font(current_font, '', 11)  # Reset font
                    except:
                        # Fallback to regular font with bullet character
                        try:
                            pdf.cell(3, 4, '•', ln=False)  # Try Unicode bullet
                        except:
                            pdf.cell(3, 4, chr(149), ln=False)  # Fallback to Windows-1252 bullet
                    
                    # Set position for text with proper indentation
                    text_x = pdf.l_margin + 3  # Bullet width
                    pdf.set_x(text_x)
                    
                    # Calculate remaining width for text
                    remaining_width = pdf.w - pdf.l_margin - pdf.r_margin - 3
                    
                    # Create multi-cell for the achievement text with proper indentation
                    pdf.multi_cell(remaining_width, 4, clean_achievement)
                    
                    # Minimal spacing after each achievement to save space
                    pdf.ln(0.5)
            
            # Space between jobs (reduced for compactness)
            if i < len(resume_data['experience']) - 1:
                pdf.ln(2)
    
    # Education
    if resume_data.get('education'):
        # Check if we need space for the education section header
        check_space_and_add_page(15)  # Space for header + underline + first entry
        
        pdf.ln(2)
        
        # Section header with blue color and underline
        pdf.set_font('Arial', 'B', 12)
        pdf.set_text_color(*blue_color)
        pdf.cell(0, 6, 'EDUCATION', ln=True)
        
        # Long blue underline
        current_y = pdf.get_y()
        pdf.set_draw_color(*blue_color)
        pdf.set_line_width(0.5)
        pdf.line(10, current_y - 1, 200, current_y - 1)
        pdf.set_text_color(0, 0, 0)  # Reset to black
        pdf.ln(2)
        
        for edu in resume_data['education']:
            # Calculate space needed for this education entry
            has_details = edu.get('details') and len(edu['details']) < 150
            entry_height = 5  # Main line height
            if has_details:
                entry_height += 8  # Add space for bullet point details
            
            # Check if we need a new page for this complete entry
            check_space_and_add_page(entry_height)
            
            # Degree, institution, dates - all on one line
            degree = clean_text_for_pdf(edu.get('degree', 'Degree'))
            institution = clean_text_for_pdf(edu.get('institution', 'Institution'))
            
            details_parts = [degree, institution]
            if edu.get('dates') and edu['dates'].strip() and edu['dates'].strip().upper() != 'N/A':
                clean_dates = format_dates_for_pdf(clean_text_for_pdf(edu['dates']))
                details_parts.append(clean_dates)
            
            pdf.set_font('Arial', 'B', 11)
            edu_line = ' | '.join(details_parts)
            pdf.cell(0, 5, edu_line, ln=True)
            
            # Additional details as bullet points
            if has_details:
                clean_details = clean_text_for_pdf(edu['details'])
                pdf.set_font('Arial', '', 11)
                
                # Add bullet point with minimal spacing
                current_font = pdf.font_family
                try:
                    # Try to use Symbol font for proper bullet
                    pdf.set_font('Symbol', '', 11)
                    pdf.cell(3, 4, chr(183), ln=False)  # Smaller width for bullet
                    pdf.set_font(current_font, '', 11)  # Reset font
                except:
                    # Fallback to regular font with bullet character
                    try:
                        pdf.cell(3, 4, '•', ln=False)  # Try Unicode bullet
                    except:
                        pdf.cell(3, 4, chr(149), ln=False)  # Fallback to Windows-1252 bullet
                
                # Set position for text with proper indentation
                text_x = pdf.l_margin + 3  # Bullet width
                pdf.set_x(text_x)
                
                # Calculate remaining width for text
                remaining_width = pdf.w - pdf.l_margin - pdf.r_margin - 3
                pdf.multi_cell(remaining_width, 4, clean_details)
            
            pdf.ln(1)
    
    # Return PDF as BytesIO buffer
    buffer = io.BytesIO()
    pdf_output = pdf.output(dest='S')
    if isinstance(pdf_output, str):
        buffer.write(pdf_output.encode('latin-1'))
    else:
        buffer.write(pdf_output)
    buffer.seek(0)
    
    return buffer



def create_pdf_from_text(text_content, title="Document"):
    """
    Create a PDF from plain text content using fpdf2.
    Used for cover letters and other text documents.
    """
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Add title if provided
    if title and title != "Document":
        clean_title = clean_text_for_pdf(title)
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, clean_title, ln=True, align='C')
        pdf.ln(8)
    
    # Add text content
    pdf.set_font('Arial', '', 11)
    
    # Clean the text content
    clean_content = clean_text_for_pdf(text_content)
    
    # Split text into paragraphs
    paragraphs = clean_content.split('\n\n')
    for paragraph in paragraphs:
        if paragraph.strip():
            # Split long paragraphs into lines
            words = paragraph.strip().split()
            line = ""
            for word in words:
                if pdf.get_string_width(line + word + " ") < 175:
                    line += word + " "
                else:
                    pdf.cell(0, 6, line.strip(), ln=True)
                    line = word + " "
            if line:
                pdf.cell(0, 6, line.strip(), ln=True)
            pdf.ln(4)
    
    # Return PDF as BytesIO buffer
    buffer = io.BytesIO()
    pdf_output = pdf.output(dest='S')
    if isinstance(pdf_output, str):
        buffer.write(pdf_output.encode('latin-1'))
    else:
        buffer.write(pdf_output)
    buffer.seek(0)
    
    return buffer

def create_pdf_resume(resume_json):
    """
    Create a professional PDF from resume JSON data.
    Main function called by the handler.
    """
    return create_pdf_from_resume_json(resume_json)