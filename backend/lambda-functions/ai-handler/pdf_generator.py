"""
Professional PDF generator for Lambda environment.
Creates well-formatted PDF documents from resume JSON data.
"""

import io
import json
import re
import sys
import os
from datetime import datetime

# Professional PDF generator with ReportLab support

# Try to import ReportLab components
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.enums import TA_CENTER
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
    REPORTLAB_AVAILABLE = True
    print("✅ ReportLab successfully imported and available")
except ImportError as e:
    REPORTLAB_AVAILABLE = False
    print(f"❌ ReportLab not available: {e}")
    print("📄 Using simple PDF fallback")
    # Placeholder imports for compatibility
    letter = None
    inch = None
    getSampleStyleSheet = None
    TA_CENTER = None
    SimpleDocTemplate = None
    Paragraph = None
    Spacer = None
    KeepTogether = None

# Try to import python-docx
try:
    from docx import Document
    DOCX_AVAILABLE = True
    print("✅ python-docx successfully imported")
except ImportError as e:
    DOCX_AVAILABLE = False
    print(f"❌ python-docx not available: {e}")

def create_simple_pdf_from_text(text_content):
    """Create a basic PDF using pure Python without external dependencies."""
    try:
        # Handle text encoding more carefully
        text_str = str(text_content)[:500]
        
        # Fix ligature characters that AI sometimes returns
        ligature_fixes = {
            'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'ft', 'ﬆ': 'st'
        }
        for ligature, replacement in ligature_fixes.items():
            text_str = text_str.replace(ligature, replacement)
        
        # Only escape characters that would break PDF syntax, preserve normal letters
        clean_text = text_str.replace('(', '\\(').replace(')', '\\)').replace('\\', '\\\\')
        # Ensure proper UTF-8 encoding
        clean_text = clean_text.encode('utf-8', errors='replace').decode('utf-8')
        content_length = len(clean_text.encode('utf-8')) + 100
        
        pdf_content = f"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length {content_length}
>>
stream
BT
/F1 12 Tf
50 750 Td
({clean_text}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
0000000340 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
408
%%EOF"""
        
        return pdf_content.encode('utf-8')
        
    except Exception as e:
        print(f"Even simple PDF creation failed: {e}")
        error_message = f"PDF Generation Failed: {str(e)}" + "\n\nResume Content:\n" + str(text_content)
        return error_message.encode('utf-8')

def format_resume_as_text(resume_json):
    """Format resume JSON as plain text for simple PDF generation."""
    try:
        lines = []
        
        # Name
        if resume_json.get('full_name'):
            lines.append(resume_json['full_name'].upper())
            lines.append("")
        
        # Contact
        if resume_json.get('contact_info'):
            contact = resume_json['contact_info']
            contact_parts = [part.strip() for part in contact.split('|') if part.strip()]
            contact_parts = [part for part in contact_parts if not any(linkedin_term in part.lower() for linkedin_term in ['linkedin', 'linkedin.com'])]
            lines.append(" | ".join(contact_parts))
            lines.append("")
        
        # Professional Summary
        if resume_json.get('professional_summary'):
            lines.append("PROFESSIONAL SUMMARY")
            lines.append("-" * 20)
            lines.append(resume_json['professional_summary'])
            lines.append("")
        
        # Skills
        if resume_json.get('skills'):
            lines.append("CORE COMPETENCIES")
            lines.append("-" * 17)
            skills = resume_json['skills']
            if isinstance(skills, list):
                lines.append(" • ".join(skills[:12]))
            lines.append("")
        
        # Experience
        if resume_json.get('experience'):
            lines.append("PROFESSIONAL EXPERIENCE")
            lines.append("-" * 23)
            for exp in resume_json['experience']:
                if exp.get('title'):
                    lines.append(f"{exp['title']} - {exp.get('dates', '')}")
                if exp.get('company'):
                    lines.append(exp['company'])
                if exp.get('achievements'):
                    for achievement in exp['achievements'][:3]:
                        lines.append(f"• {achievement}")
                lines.append("")
        
        # Education
        if resume_json.get('education'):
            lines.append("EDUCATION")
            lines.append("-" * 9)
            for edu in resume_json['education']:
                if edu.get('degree'):
                    lines.append(f"{edu['degree']} - {edu.get('dates', '')}")
                if edu.get('institution'):
                    lines.append(edu['institution'])
                lines.append("")
        
        return "\n".join(lines)
        
    except Exception as e:
        return f"Resume formatting error: {str(e)}"

def create_pdf_resume(resume_json):
    """Create PDF using ReportLab if available, otherwise use simple fallback."""
    if not REPORTLAB_AVAILABLE:
        print("Creating professional PDF document...")
        text_content = format_resume_as_text(resume_json)
        return create_simple_pdf_from_text(text_content)
    
    try:
        # Create buffer
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.6*inch,
            leftMargin=0.6*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        # Use ONLY the default Normal style - no custom styles
        styles = getSampleStyleSheet()
        normal_style = styles['Normal']
        
        # Create center-aligned style for name and contact
        center_style = styles['Normal'].clone('CenterStyle')
        center_style.alignment = TA_CENTER
        
        story = []
        
        # Name - using HTML bold, center aligned
        name = resume_json.get('full_name', 'Name Not Provided')
        story.append(Paragraph(f'<font size="14"><b>{name}</b></font>', center_style))
        story.append(Spacer(1, 6))
        
        # Contact - regular text (remove LinkedIn if present), center aligned
        contact = resume_json.get('contact_info', 'Contact information not provided')
        
        # Fix ligature characters that AI sometimes returns (ﬀ, ﬁ, ﬂ, etc.)
        ligature_fixes = {
            'ﬀ': 'ff',  # U+FB00 -> ff
            'ﬁ': 'fi',  # U+FB01 -> fi  
            'ﬂ': 'fl',  # U+FB02 -> fl
            'ﬃ': 'ffi', # U+FB03 -> ffi
            'ﬄ': 'ffl', # U+FB04 -> ffl
            'ﬅ': 'ft',  # U+FB05 -> ft
            'ﬆ': 'st'   # U+FB06 -> st
        }
        
        for ligature, replacement in ligature_fixes.items():
            contact = contact.replace(ligature, replacement)
        
        print(f"DEBUG: Contact after ligature fix: {repr(contact)}")
        
        contact_parts = [part.strip() for part in contact.split('|') if part.strip()]
        contact_parts = [part for part in contact_parts if not any(linkedin_term in part.lower() for linkedin_term in ['linkedin', 'linkedin.com'])]
        # Clean contact parts more carefully to preserve all valid characters
        cleaned_contact_parts = []
        for part in contact_parts:
            # Only remove truly problematic characters, preserve letters, numbers, and common symbols
            cleaned_part = re.sub(r'[<>&"\'\\]', '', part)  # Remove only HTML/XML problematic chars
            cleaned_contact_parts.append(cleaned_part)
        contact_parts = cleaned_contact_parts
        
        if len(contact_parts) > 1:
            # Ensure proper encoding for each contact part
            first_part = contact_parts[0].encode('utf-8', errors='replace').decode('utf-8')
            contact_html = f'<font size="10">{first_part}</font>'
            for part in contact_parts[1:]:
                clean_part = part.encode('utf-8', errors='replace').decode('utf-8')
                contact_html += f' <font size="11"><b>•</b></font> <font size="10">{clean_part}</font>'
        else:
            clean_contact = (contact_parts[0] if contact_parts else contact).encode('utf-8', errors='replace').decode('utf-8')
            contact_html = f'<font size="10">{clean_contact}</font>'
        
        story.append(Paragraph(contact_html, center_style))
        story.append(Spacer(1, 12))
        
        # Professional Summary
        if resume_json.get('professional_summary'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>PROFESSIONAL SUMMARY</u></b></font>', normal_style))
            story.append(Spacer(1, 4))
            story.append(Paragraph(f'<font size="9">{resume_json["professional_summary"]}</font>', normal_style))
            story.append(Spacer(1, 8))
        
        # Skills
        if resume_json.get('skills'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>CORE COMPETENCIES</u></b></font>', normal_style))
            story.append(Spacer(1, 4))
            skills_text = ' • '.join(resume_json['skills'][:12])
            story.append(Paragraph(f'<font size="9">{skills_text}</font>', normal_style))
            story.append(Spacer(1, 8))
        
        # Experience
        if resume_json.get('experience'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>PROFESSIONAL EXPERIENCE</u></b></font>', normal_style))
            story.append(Spacer(1, 4))
            
            for exp in resume_json['experience']:
                # Create experience entry elements to keep together
                exp_elements = []
                
                # Job title
                title = exp.get('title', 'Position Title')
                exp_elements.append(Paragraph(f'<font size="9"><b>{title}</b></font>', normal_style))
                exp_elements.append(Spacer(1, 1))
                
                # Company and dates
                company_info = f"{exp.get('company', 'Company')} | {exp.get('dates', 'Dates')}"
                exp_elements.append(Paragraph(f'<font size="9">{company_info}</font>', normal_style))
                exp_elements.append(Spacer(1, 2))
                
                # Achievements
                if exp.get('achievements'):
                    for achievement in exp['achievements']:
                        exp_elements.append(Paragraph(f'<font size="9">• {achievement}</font>', normal_style))
                        exp_elements.append(Spacer(1, 1))
                
                exp_elements.append(Spacer(1, 6))
                
                # Keep each experience entry together on the same page
                if KeepTogether:
                    story.append(KeepTogether(exp_elements))
                else:
                    # Fallback if KeepTogether is not available
                    story.extend(exp_elements)
        
        # Education
        if resume_json.get('education'):
            # Create education section elements to keep together
            education_section = []
            
            # Add section heading
            education_section.append(Paragraph('<font size="11" color="#4A90E2"><b><u>EDUCATION</u></b></font>', normal_style))
            education_section.append(Spacer(1, 4))
            
            # Add all education entries
            for edu in resume_json['education']:
                # Degree
                degree = edu.get('degree', 'Degree')
                education_section.append(Paragraph(f'<font size="9"><b>{degree}</b></font>', normal_style))
                education_section.append(Spacer(1, 1))
                
                # Institution
                edu_info = edu.get('institution', 'Institution')
                if edu.get('dates'):
                    edu_info += f" | {edu['dates']}"
                if edu.get('gpa'):
                    edu_info += f" | GPA: {edu['gpa']}"
                education_section.append(Paragraph(f'<font size="9">{edu_info}</font>', normal_style))
                
                if edu.get('details'):
                    education_section.append(Spacer(1, 1))
                    education_section.append(Paragraph(f'<font size="9">• {edu["details"]}</font>', normal_style))
                
                education_section.append(Spacer(1, 6))
            
            # Keep the entire education section together on the same page
            if KeepTogether:
                story.append(KeepTogether(education_section))
            else:
                # Fallback if KeepTogether is not available
                story.extend(education_section)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
        
    except Exception as e:
        print(f"ReportLab PDF creation failed: {str(e)}")
        # Fall back to simple PDF
        text_content = format_resume_as_text(resume_json)
        return create_simple_pdf_from_text(text_content)

def create_pdf_from_text(text_content, title="Document"):
    """Create a PDF document from plain text content."""
    if not REPORTLAB_AVAILABLE:
        print("Creating PDF document for cover letter...")
        pdf_content = create_simple_pdf_from_text(text_content)
        buffer = io.BytesIO(pdf_content)
        return buffer
    
    try:
        # Create buffer
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Use default styles
        styles = getSampleStyleSheet()
        normal_style = styles['Normal']
        
        story = []
        
        # Split text into paragraphs
        paragraphs = text_content.split('\n')
        for para in paragraphs:
            para = para.strip()
            if para:
                # Escape HTML special characters
                para = para.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(f'<font size="11">{para}</font>', normal_style))
                story.append(Spacer(1, 6))
            else:
                # Add spacing for empty paragraphs
                story.append(Spacer(1, 12))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
        
    except Exception as e:
        print(f"Error creating PDF from text with ReportLab: {str(e)}")
        # Create a basic fallback PDF
        pdf_content = create_simple_pdf_from_text(text_content)
        buffer = io.BytesIO(pdf_content)
        return buffer

# Legacy function names for compatibility
def create_enhanced_pdf_from_word_structure(resume_json):
    """Enhanced PDF creation - falls back to simple PDF if ReportLab fails"""
    print("Attempting enhanced PDF creation...")
    return create_pdf_resume(resume_json)

def create_pdf_resume_matching_word(resume_json):
    """PDF matching Word format - falls back to simple PDF if ReportLab fails"""
    print("Attempting Word-matching PDF creation...")
    return create_pdf_resume(resume_json)

def create_minimal_pdf(text_content):
    """Create minimal PDF from text content"""
    print("Creating minimal PDF...")
    return create_simple_pdf_from_text(str(text_content))

def create_pdf_from_resume_json(resume_json_str, title="Resume"):
    """Legacy function name - calls create_pdf_resume"""
    if isinstance(resume_json_str, str):
        import json
        try:
            resume_data = json.loads(resume_json_str)
        except:
            resume_data = {"full_name": "Resume", "professional_summary": resume_json_str}
    else:
        resume_data = resume_json_str
    
    return create_pdf_resume(resume_data)