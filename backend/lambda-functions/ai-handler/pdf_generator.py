"""
PDF resume generation using reportlab library.
Creates a professionally formatted resume in PDF format.
"""

import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def create_pdf_resume(resume_json):
    """
    Create a professionally formatted PDF resume using reportlab.
    
    Args:
        resume_json (dict): Resume data
    
    Returns:
        bytes: Generated PDF document as bytes
    """
    
    try:
        # Create a BytesIO buffer to hold the PDF
        buffer = io.BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Get default styles and create custom ones
        styles = getSampleStyleSheet()
        
        # Custom styles
        name_style = ParagraphStyle(
            'CustomName',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=6,
            alignment=TA_CENTER,
            textColor=HexColor('#1F4E79'),
            fontName='Helvetica-Bold'
        )
        
        contact_style = ParagraphStyle(
            'CustomContact',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            alignment=TA_CENTER,
            textColor=HexColor('#333333')
        )
        
        section_header_style = ParagraphStyle(
            'CustomSectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=6,
            spaceBefore=12,
            textColor=HexColor('#1F4E79'),
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=HexColor('#1F4E79'),
            borderPadding=2
        )
        
        job_title_style = ParagraphStyle(
            'CustomJobTitle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=2,
            fontName='Helvetica-Bold',
            textColor=HexColor('#333333')
        )
        
        job_details_style = ParagraphStyle(
            'CustomJobDetails',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            fontName='Helvetica-Oblique',
            textColor=HexColor('#666666')
        )
        
        bullet_style = ParagraphStyle(
            'CustomBullet',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=3,
            leftIndent=20,
            bulletIndent=10,
            textColor=HexColor('#333333')
        )
        
        # Build the document content
        story = []
        
        # Name
        name = resume_json.get('full_name', 'Your Name')
        story.append(Paragraph(name, name_style))
        
        # Contact Info
        contact = resume_json.get('contact_info', 'Your Contact Information')
        story.append(Paragraph(contact, contact_style))
        
        # Professional Summary
        story.append(Paragraph('PROFESSIONAL SUMMARY', section_header_style))
        summary = resume_json.get('professional_summary', 'Professional summary not available')
        story.append(Paragraph(summary, styles['Normal']))
        story.append(Spacer(1, 6))
        
        # Skills
        story.append(Paragraph('CORE COMPETENCIES', section_header_style))
        skills = resume_json.get('skills', [])
        if skills:
            skills_text = ' • '.join(skills)
            story.append(Paragraph(f"• {skills_text}", styles['Normal']))
        story.append(Spacer(1, 6))
        
        # Experience
        story.append(Paragraph('PROFESSIONAL EXPERIENCE', section_header_style))
        experience = resume_json.get('experience', [])
        
        for exp in experience:
            # Create a group for each job to keep it together
            job_content = []
            
            # Job title
            title = exp.get('title', 'Job Title')
            job_content.append(Paragraph(title, job_title_style))
            
            # Company and dates
            company = exp.get('company', 'Company')
            dates = exp.get('dates', 'Dates')
            job_content.append(Paragraph(f"{company} | {dates}", job_details_style))
            
            # Achievements
            achievements = exp.get('achievements', [])
            for achievement in achievements:
                job_content.append(Paragraph(f"• {achievement}", bullet_style))
            
            # Add spacing between jobs
            job_content.append(Spacer(1, 8))
            
            # Keep job content together
            story.append(KeepTogether(job_content))
        
        # Education
        story.append(Paragraph('EDUCATION', section_header_style))
        education = resume_json.get('education', [])
        
        for edu in education:
            edu_content = []
            
            # Degree
            degree = edu.get('degree', 'Degree')
            edu_content.append(Paragraph(degree, job_title_style))
            
            # Institution and dates
            institution = edu.get('institution', 'Institution')
            dates = edu.get('dates', 'Dates')
            edu_content.append(Paragraph(f"{institution} | {dates}", job_details_style))
            
            # Details if available
            details = edu.get('details', '')
            if details:
                edu_content.append(Paragraph(details, styles['Normal']))
            
            edu_content.append(Spacer(1, 6))
            story.append(KeepTogether(edu_content))
        
        # Build the PDF
        doc.build(story)
        
        # Get the PDF content
        buffer.seek(0)
        return buffer.getvalue()
        
    except Exception as e:
        print(f"Error creating PDF resume: {str(e)}")
        raise e

def escape_html(text):
    """Escape HTML special characters for reportlab."""
    if not text:
        return ''
    return (text.replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#x27;'))
