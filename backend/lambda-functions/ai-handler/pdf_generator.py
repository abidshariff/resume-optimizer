"""
PDF resume generation using reportlab library.
Uses ONLY basic Paragraph with inline HTML - no custom styles at all.
"""

import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER  # Add center alignment import
import re

def create_pdf_resume(resume_json):
    """
    Create PDF using ONLY default Normal style with HTML formatting.
    No custom ParagraphStyle objects that could have hidden box properties.
    """
    
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
        story.append(Paragraph(f'<font size="14"><b>{name}</b></font>', center_style))  # Center aligned
        story.append(Spacer(1, 6))
        
        # Contact - regular text (remove LinkedIn if present), center aligned
        contact = resume_json.get('contact_info', 'Contact information not provided')
        # Remove LinkedIn references
        contact = contact.replace('LinkedIn:', '').replace('linkedin.com/', '').replace('LinkedIn', '').strip()
        # Remove special characters that might appear as black squares, but keep bullets
        contact = re.sub(r'[^\w\s@.,|()\-+•·]', '', contact)  # Keep bullets
        # Clean up extra spaces and separators, then add bullet separators
        contact_parts = [part.strip() for part in contact.split('|') if part.strip() and 'linkedin' not in part.lower()]
        
        # Create contact text with larger, bolder bullets - use same size for better alignment
        if len(contact_parts) > 1:
            contact_html = f'<font size="10">{contact_parts[0]}</font>'
            for part in contact_parts[1:]:
                # Use slightly larger text size for better bullet alignment
                contact_html += f' <font size="11"><b>•</b></font> <font size="10">{part}</font>'
        else:
            contact_html = f'<font size="10">{contact_parts[0] if contact_parts else contact}</font>'
        
        story.append(Paragraph(contact_html, center_style))  # Center aligned
        story.append(Spacer(1, 12))
        
        # Professional Summary
        if resume_json.get('professional_summary'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>PROFESSIONAL SUMMARY</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            story.append(Paragraph(f'<font size="9">{resume_json["professional_summary"]}</font>', normal_style))
            story.append(Spacer(1, 8))
        
        # Skills
        if resume_json.get('skills'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>CORE COMPETENCIES</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            skills_text = ' • '.join(resume_json['skills'][:12])
            story.append(Paragraph(f'<font size="9">{skills_text}</font>', normal_style))
            story.append(Spacer(1, 8))
        
        # Experience
        if resume_json.get('experience'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>PROFESSIONAL EXPERIENCE</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            
            for exp in resume_json['experience']:
                # Job title
                title = exp.get('title', 'Position Title')
                story.append(Paragraph(f'<font size="9"><b>{title}</b></font>', normal_style))  # Reduced from 10
                story.append(Spacer(1, 1))  # Reduced spacing
                
                # Company and dates
                company_info = f"{exp.get('company', 'Company')} | {exp.get('dates', 'Dates')}"
                story.append(Paragraph(f'<font size="9">{company_info}</font>', normal_style))  # Reduced from 10
                story.append(Spacer(1, 2))  # Reduced spacing
                
                # Achievements
                if exp.get('achievements'):
                    for achievement in exp['achievements']:
                        story.append(Paragraph(f'<font size="9">• {achievement}</font>', normal_style))  # Reduced from 10
                        story.append(Spacer(1, 1))  # Reduced spacing
                
                story.append(Spacer(1, 6))  # Reduced spacing
        
        # Education
        if resume_json.get('education'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>EDUCATION</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            
            for edu in resume_json['education']:
                # Degree
                degree = edu.get('degree', 'Degree')
                story.append(Paragraph(f'<font size="9"><b>{degree}</b></font>', normal_style))  # Reduced from 10
                story.append(Spacer(1, 1))  # Reduced spacing
                
                # Institution
                edu_info = edu.get('institution', 'Institution')
                if edu.get('dates'):
                    edu_info += f" | {edu['dates']}"
                if edu.get('gpa'):
                    edu_info += f" | GPA: {edu['gpa']}"
                
                story.append(Paragraph(f'<font size="9">{edu_info}</font>', normal_style))  # Reduced from 10
                
                if edu.get('details'):
                    story.append(Spacer(1, 1))
                    story.append(Paragraph(f'<font size="9">• {edu["details"]}</font>', normal_style))  # Reduced from 10
                
                story.append(Spacer(1, 6))  # Reduced spacing
        
        # Certifications
        if resume_json.get('certifications'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>CERTIFICATIONS</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            
            for cert in resume_json['certifications']:
                story.append(Paragraph(f'<font size="9">• {cert}</font>', normal_style))
                story.append(Spacer(1, 1))
        
        # Projects
        if resume_json.get('projects'):
            story.append(Paragraph('<font size="11" color="#4A90E2"><b><u>KEY PROJECTS</u></b></font>', normal_style))  # Light blue with underline
            story.append(Spacer(1, 4))
            
            for project in resume_json['projects']:
                if isinstance(project, dict):
                    project_name = project.get('name', 'Project')
                    story.append(Paragraph(f'<font size="9"><b>{project_name}</b></font>', normal_style))  # Reduced from 10
                    if project.get('description'):
                        story.append(Spacer(1, 1))
                        story.append(Paragraph(f'<font size="9">• {project["description"]}</font>', normal_style))  # Reduced from 10
                else:
                    story.append(Paragraph(f'<font size="9">• {project}</font>', normal_style))  # Reduced from 10
                story.append(Spacer(1, 1))  # Reduced spacing
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
        
    except Exception as e:
        print(f"Error creating PDF: {str(e)}")
        return create_basic_pdf_resume(resume_json)

def create_basic_pdf_resume(resume_json):
    """Absolute most basic PDF possible."""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        normal = styles['Normal']
        center_style = normal.clone('CenterStyle')
        center_style.alignment = TA_CENTER
        story = []
        
        # Everything as plain text with HTML formatting - smaller fonts, center aligned
        story.append(Paragraph(f'<font size="14"><b>{resume_json.get("full_name", "Name")}</b></font>', center_style))  # Center aligned
        story.append(Spacer(1, 8))
        
        # Remove LinkedIn from contact info and clean special characters
        contact = resume_json.get('contact_info', 'Contact')
        contact = contact.replace('LinkedIn:', '').replace('linkedin.com/', '').replace('LinkedIn', '').strip()
        # Remove special characters that might appear as black squares, but keep bullets
        contact = re.sub(r'[^\w\s@.,|()\-+•·]', '', contact)
        contact_parts = [part.strip() for part in contact.split('|') if part.strip() and 'linkedin' not in part.lower()]
        
        # Create contact text with larger, bolder bullets - use same size for better alignment
        if len(contact_parts) > 1:
            contact_html = f'<font size="10">{contact_parts[0]}</font>'
            for part in contact_parts[1:]:
                # Use slightly larger text size for better bullet alignment
                contact_html += f' <font size="11"><b>•</b></font> <font size="10">{part}</font>'
        else:
            contact_html = f'<font size="10">{contact_parts[0] if contact_parts else contact}</font>'
        
        story.append(Paragraph(contact_html, center_style))  # Center aligned
        story.append(Spacer(1, 12))
        
        if resume_json.get('professional_summary'):
            story.append(Paragraph('<font color="#4A90E2"><b><u>PROFESSIONAL SUMMARY</u></b></font>', normal))  # Light blue with underline
            story.append(Spacer(1, 6))
            story.append(Paragraph(resume_json['professional_summary'], normal))
            story.append(Spacer(1, 18))
        
        if resume_json.get('skills'):
            story.append(Paragraph('<font color="#4A90E2"><b><u>CORE COMPETENCIES</u></b></font>', normal))  # Light blue with underline
            story.append(Spacer(1, 6))
            skills_text = ' • '.join(resume_json['skills'][:12])
            story.append(Paragraph(skills_text, normal))
            story.append(Spacer(1, 18))
        
        if resume_json.get('experience'):
            story.append(Paragraph('<font color="#4A90E2"><b><u>PROFESSIONAL EXPERIENCE</u></b></font>', normal))  # Light blue with underline
            story.append(Spacer(1, 6))
            
            for exp in resume_json['experience']:
                story.append(Paragraph(f"<b>{exp.get('title', 'Title')}</b>", normal))
                story.append(Paragraph(f"{exp.get('company', 'Company')} | {exp.get('dates', 'Dates')}", normal))
                
                if exp.get('achievements'):
                    for achievement in exp['achievements']:
                        story.append(Paragraph(f"• {achievement}", normal))
                story.append(Spacer(1, 12))
        
        if resume_json.get('education'):
            story.append(Paragraph('<font color="#4A90E2"><b><u>EDUCATION</u></b></font>', normal))  # Light blue with underline
            story.append(Spacer(1, 6))
            
            for edu in resume_json['education']:
                story.append(Paragraph(f"<b>{edu.get('degree', 'Degree')}</b>", normal))
                edu_info = edu.get('institution', 'Institution')
                if edu.get('dates'):
                    edu_info += f" | {edu['dates']}"
                story.append(Paragraph(edu_info, normal))
                story.append(Spacer(1, 12))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
        
    except Exception as e:
        print(f"Error in basic PDF: {str(e)}")
        raise e
