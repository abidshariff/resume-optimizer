"""
Simple PDF generator for Lambda environment without external dependencies.
Creates basic PDF documents from text content.
"""

import io
import zlib
from datetime import datetime

def create_pdf_from_text(text_content, title="Document"):
    """
    Create a simple PDF from text content without external dependencies.
    This creates a basic PDF structure that can be read by PDF viewers.
    """
    try:
        # Split text into lines and prepare for PDF
        lines = text_content.split('\n')
        
        # Basic PDF structure
        pdf_objects = []
        
        # Object 1: Catalog
        catalog = """1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj"""
        pdf_objects.append(catalog)
        
        # Object 2: Pages
        pages = """2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj"""
        pdf_objects.append(pages)
        
        # Prepare content stream
        content_lines = []
        content_lines.append("BT")  # Begin text
        content_lines.append("/F1 12 Tf")  # Font and size
        content_lines.append("50 750 Td")  # Position
        
        y_position = 750
        for line in lines:
            if y_position < 50:  # Simple page break check
                break
            # Clean and escape text for PDF
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            content_lines.append(f"({escaped_line}) Tj")
            content_lines.append("0 -15 Td")  # Move down
            y_position -= 15
        
        content_lines.append("ET")  # End text
        
        content_stream = '\n'.join(content_lines)
        
        # Object 3: Page
        page = f"""3 0 obj
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
endobj"""
        pdf_objects.append(page)
        
        # Object 4: Content stream
        content_obj = f"""4 0 obj
<<
/Length {len(content_stream)}
>>
stream
{content_stream}
endstream
endobj"""
        pdf_objects.append(content_obj)
        
        # Object 5: Font
        font = """5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj"""
        pdf_objects.append(font)
        
        # Build the complete PDF
        pdf_content = "%PDF-1.4\n"
        
        # Add objects and track positions
        xref_positions = []
        current_pos = len(pdf_content)
        
        for obj in pdf_objects:
            xref_positions.append(current_pos)
            pdf_content += obj + "\n"
            current_pos = len(pdf_content)
        
        # Cross-reference table
        xref_start = current_pos
        pdf_content += "xref\n"
        pdf_content += f"0 {len(pdf_objects) + 1}\n"
        pdf_content += "0000000000 65535 f \n"
        
        for pos in xref_positions:
            pdf_content += f"{pos:010d} 00000 n \n"
        
        # Trailer
        pdf_content += "trailer\n"
        pdf_content += f"<<\n/Size {len(pdf_objects) + 1}\n/Root 1 0 R\n>>\n"
        pdf_content += "startxref\n"
        pdf_content += f"{xref_start}\n"
        pdf_content += "%%EOF\n"
        
        # Return as BytesIO buffer - handle Unicode characters
        try:
            pdf_buffer = io.BytesIO(pdf_content.encode('latin-1'))
        except UnicodeEncodeError:
            # Replace problematic Unicode characters
            pdf_content_clean = pdf_content.encode('latin-1', errors='replace').decode('latin-1')
            pdf_buffer = io.BytesIO(pdf_content_clean.encode('latin-1'))
        return pdf_buffer
        
    except Exception as e:
        print(f"Error creating PDF: {str(e)}")
        # Fallback: create a minimal PDF with error message
        error_content = f"PDF Generation Error: {str(e)}\n\nOriginal content:\n{text_content[:1000]}..."
        return create_minimal_pdf(error_content)

def create_minimal_pdf(text):
    """Create the most basic PDF possible"""
    content = f"""BT
/F1 12 Tf
50 750 Td
(PDF Generation - Text Content) Tj
0 -20 Td
({text[:100].replace('(', '').replace(')', '')}) Tj
ET"""
    
    pdf = f"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length {len(content)}>>stream
{content}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
0000000340 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
408
%%EOF"""
    
    return io.BytesIO(pdf.encode('ascii', errors='replace'))

def create_pdf_resume(resume_json):
    """
    Create an ATS-optimized PDF resume from JSON data.
    """
    try:
        # Build ATS-friendly text content
        text_lines = []
        
        # Name - clean, centered
        if resume_json.get('full_name'):
            text_lines.append(resume_json['full_name'].upper())
            text_lines.append("")
        
        # Contact info - single line, pipe separated
        contact_parts = []
        if resume_json.get('email'):
            contact_parts.append(resume_json['email'])
        if resume_json.get('phone'):
            contact_parts.append(resume_json['phone'])
        if resume_json.get('location'):
            contact_parts.append(resume_json['location'])
        if resume_json.get('contact_info'):
            # Handle legacy contact_info field
            contact_parts.append(resume_json['contact_info'])
        
        if contact_parts:
            text_lines.append(" | ".join(contact_parts))
            text_lines.append("")
        
        # Professional Summary
        if resume_json.get('professional_summary'):
            text_lines.append("PROFESSIONAL SUMMARY")
            text_lines.append("")
            text_lines.append(resume_json['professional_summary'])
            text_lines.append("")
        
        # Core Competencies/Skills
        if resume_json.get('skills'):
            text_lines.append("CORE COMPETENCIES")
            text_lines.append("")
            skills = resume_json['skills']
            
            if isinstance(skills, list):
                # Format skills in readable rows
                skill_chunks = []
                for i in range(0, len(skills), 4):
                    chunk = skills[i:i+4]
                    skill_chunks.append(" • ".join(chunk))
                text_lines.extend(skill_chunks)
            else:
                skills_text = str(skills).replace(',', ' •')
                text_lines.append(skills_text)
            text_lines.append("")
        
        # Professional Experience
        if resume_json.get('experience'):
            text_lines.append("PROFESSIONAL EXPERIENCE")
            text_lines.append("")
            
            for exp in resume_json['experience']:
                # Job title, company, dates on one line
                job_line = []
                if exp.get('title'):
                    job_line.append(exp['title'])
                if exp.get('company'):
                    job_line.append(exp['company'])
                if exp.get('dates'):
                    job_line.append(exp['dates'])
                
                if job_line:
                    text_lines.append(" | ".join(job_line))
                
                text_lines.append("")
                
                # Achievements with proper bullet formatting
                achievements = exp.get('achievements', [])
                if not achievements:
                    achievements = exp.get('responsibilities', [])
                
                for achievement in achievements:
                    clean_achievement = achievement.strip()
                    if not clean_achievement.startswith('•'):
                        clean_achievement = f"• {clean_achievement}"
                    text_lines.append(clean_achievement)
                
                text_lines.append("")
        
        # Education
        if resume_json.get('education'):
            text_lines.append("EDUCATION")
            text_lines.append("")
            
            for edu in resume_json['education']:
                edu_line = []
                if edu.get('degree'):
                    edu_line.append(edu['degree'])
                if edu.get('institution'):
                    edu_line.append(edu['institution'])
                if edu.get('dates') or edu.get('year'):
                    date_info = edu.get('dates') or edu.get('year')
                    edu_line.append(str(date_info))
                
                if edu_line:
                    text_lines.append(" | ".join(edu_line))
                
                if edu.get('details'):
                    text_lines.append(f"  {edu['details']}")
                
                text_lines.append("")
        
        # Join all lines
        resume_text = '\n'.join(text_lines)
        
        # Create ATS-optimized PDF
        return create_ats_pdf(resume_text, "ATS_Resume")
        
    except Exception as e:
        print(f"Error creating PDF resume: {str(e)}")
        fallback_text = f"Resume content error: {str(e)}"
        return create_minimal_pdf(fallback_text)

def create_ats_pdf(text_content, title="Document"):
    """
    Create ATS-friendly PDF with proper formatting and spacing
    """
    try:
        lines = text_content.split('\n')
        
        pdf_objects = []
        
        # Object 1: Catalog
        catalog = """1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj"""
        pdf_objects.append(catalog)
        
        # Object 2: Pages
        pages = """2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj"""
        pdf_objects.append(pages)
        
        # Content with improved formatting
        content_lines = []
        content_lines.append("BT")
        content_lines.append("/F1 11 Tf")  # Good font size for ATS
        content_lines.append("1 0 0 1 50 750 Tm")
        
        y_position = 750
        line_height = 14
        
        for line in lines:
            if y_position < 50:
                break
            
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            
            # Handle section headers
            if line.strip() and line.strip().isupper() and len(line.strip()) < 50:
                content_lines.append(f"0 -{line_height * 0.5} Td")
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height * 1.5} Td")
                y_position -= line_height * 2
            elif line.strip() == "":
                content_lines.append(f"0 -{line_height * 0.5} Td")
                y_position -= line_height * 0.5
            else:
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height} Td")
                y_position -= line_height
        
        content_lines.append("ET")
        content_stream = '\n'.join(content_lines)
        
        # Object 3: Page
        page = f"""3 0 obj
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
endobj"""
        pdf_objects.append(page)
        
        # Object 4: Content stream
        content_obj = f"""4 0 obj
<<
/Length {len(content_stream)}
>>
stream
{content_stream}
endstream
endobj"""
        pdf_objects.append(content_obj)
        
        # Object 5: Standard font for ATS compatibility
        font = """5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj"""
        pdf_objects.append(font)
        
        # Build PDF
        pdf_content = "%PDF-1.4\n"
        
        xref_positions = []
        current_pos = len(pdf_content)
        
        for obj in pdf_objects:
            xref_positions.append(current_pos)
            pdf_content += obj + "\n"
            current_pos = len(pdf_content)
        
        xref_start = current_pos
        pdf_content += "xref\n"
        pdf_content += f"0 {len(pdf_objects) + 1}\n"
        pdf_content += "0000000000 65535 f \n"
        
        for pos in xref_positions:
            pdf_content += f"{pos:010d} 00000 n \n"
        
        pdf_content += "trailer\n"
        pdf_content += f"<<\n/Size {len(pdf_objects) + 1}\n/Root 1 0 R\n>>\n"
        pdf_content += "startxref\n"
        pdf_content += f"{xref_start}\n"
        pdf_content += "%%EOF\n"
        
        try:
            pdf_buffer = io.BytesIO(pdf_content.encode('latin-1'))
        except UnicodeEncodeError:
            pdf_content_clean = pdf_content.encode('latin-1', errors='replace').decode('latin-1')
            pdf_buffer = io.BytesIO(pdf_content_clean.encode('latin-1'))
        
        return pdf_buffer
        
    except Exception as e:
        print(f"Error creating ATS PDF: {str(e)}")
        return create_minimal_pdf(text_content)
