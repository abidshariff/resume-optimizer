"""
ATS-Optimized PDF Generator
Creates clean, ATS-friendly resume PDFs with proper formatting
"""

import io
from datetime import datetime

def create_ats_optimized_pdf(resume_data):
    """
    Create an ATS-optimized PDF with clean formatting
    """
    try:
        # Build properly formatted text content
        text_lines = []
        
        # Name - centered, bold equivalent
        if resume_data.get('full_name'):
            name = resume_data['full_name'].upper()
            text_lines.append(name)
            text_lines.append("")
        
        # Contact info - single line, pipe separated
        contact_parts = []
        if resume_data.get('email'):
            contact_parts.append(resume_data['email'])
        if resume_data.get('phone'):
            contact_parts.append(resume_data['phone'])
        if resume_data.get('location'):
            contact_parts.append(resume_data['location'])
        
        if contact_parts:
            text_lines.append(" | ".join(contact_parts))
            text_lines.append("")
        
        # Professional Summary
        if resume_data.get('professional_summary'):
            text_lines.append("PROFESSIONAL SUMMARY")
            text_lines.append("")
            # Break long paragraphs into readable chunks
            summary = resume_data['professional_summary']
            if len(summary) > 100:
                words = summary.split()
                current_line = []
                for word in words:
                    current_line.append(word)
                    if len(' '.join(current_line)) > 90:
                        text_lines.append(' '.join(current_line))
                        current_line = []
                if current_line:
                    text_lines.append(' '.join(current_line))
            else:
                text_lines.append(summary)
            text_lines.append("")
        
        # Core Competencies/Skills - better formatting
        if resume_data.get('skills'):
            text_lines.append("CORE COMPETENCIES")
            text_lines.append("")
            skills = resume_data['skills']
            
            if isinstance(skills, list):
                # Format skills in rows for better ATS parsing
                skill_chunks = []
                for i in range(0, len(skills), 4):  # 4 skills per line
                    chunk = skills[i:i+4]
                    skill_chunks.append(" • ".join(chunk))
                text_lines.extend(skill_chunks)
            else:
                # If skills is a string, format it properly
                skills_text = str(skills).replace(',', ' •')
                text_lines.append(skills_text)
            text_lines.append("")
        
        # Professional Experience - improved formatting
        if resume_data.get('experience'):
            text_lines.append("PROFESSIONAL EXPERIENCE")
            text_lines.append("")
            
            for exp in resume_data['experience']:
                # Job title and company on same line
                job_line = []
                if exp.get('title'):
                    job_line.append(exp['title'])
                if exp.get('company'):
                    job_line.append(exp['company'])
                if exp.get('dates'):
                    job_line.append(exp['dates'])
                
                if job_line:
                    text_lines.append(" | ".join(job_line))
                
                # Add location if available
                if exp.get('location'):
                    text_lines.append(exp['location'])
                
                text_lines.append("")
                
                # Achievements/responsibilities with proper bullet formatting
                achievements = exp.get('achievements', [])
                if not achievements:
                    achievements = exp.get('responsibilities', [])
                
                for achievement in achievements:
                    # Clean up achievement text
                    clean_achievement = achievement.strip()
                    if not clean_achievement.startswith('•'):
                        clean_achievement = f"• {clean_achievement}"
                    
                    # Break long achievements into multiple lines
                    if len(clean_achievement) > 100:
                        words = clean_achievement.split()
                        current_line = [words[0]]  # Start with bullet
                        for word in words[1:]:
                            test_line = ' '.join(current_line + [word])
                            if len(test_line) > 95:
                                text_lines.append(' '.join(current_line))
                                current_line = ['  ' + word]  # Indent continuation
                            else:
                                current_line.append(word)
                        if current_line:
                            text_lines.append(' '.join(current_line))
                    else:
                        text_lines.append(clean_achievement)
                
                text_lines.append("")
        
        # Education
        if resume_data.get('education'):
            text_lines.append("EDUCATION")
            text_lines.append("")
            
            for edu in resume_data['education']:
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
        
        # Additional sections
        for section_name in ['certifications', 'projects', 'awards']:
            if resume_data.get(section_name):
                text_lines.append(section_name.upper())
                text_lines.append("")
                
                section_data = resume_data[section_name]
                if isinstance(section_data, list):
                    for item in section_data:
                        if isinstance(item, dict):
                            item_line = []
                            for key, value in item.items():
                                if value and key != 'description':
                                    item_line.append(str(value))
                            if item_line:
                                text_lines.append(" | ".join(item_line))
                            if item.get('description'):
                                text_lines.append(f"  {item['description']}")
                        else:
                            text_lines.append(f"• {str(item)}")
                else:
                    text_lines.append(str(section_data))
                
                text_lines.append("")
        
        # Join all lines
        resume_text = '\n'.join(text_lines)
        
        # Create PDF with improved formatting
        return create_clean_pdf(resume_text, "ATS_Optimized_Resume")
        
    except Exception as e:
        print(f"Error creating ATS-optimized PDF: {str(e)}")
        fallback_text = f"Resume content:\n\n{str(resume_data)}"
        return create_clean_pdf(fallback_text, "Resume")

def create_clean_pdf(text_content, title="Document"):
    """
    Create a clean, ATS-friendly PDF with proper spacing and formatting
    """
    try:
        lines = text_content.split('\n')
        
        # PDF structure
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
        
        # Prepare content with better formatting
        content_lines = []
        content_lines.append("BT")
        content_lines.append("/F1 11 Tf")  # Slightly larger font for readability
        content_lines.append("1 0 0 1 50 750 Tm")  # Better positioning
        
        y_position = 750
        line_height = 14  # Better line spacing
        
        for line in lines:
            if y_position < 50:
                break
            
            # Clean text for PDF
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            
            # Handle section headers (all caps lines)
            if line.strip() and line.strip().isupper() and len(line.strip()) < 50:
                # Section header - add extra spacing
                content_lines.append(f"0 -{line_height * 0.5} Td")
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height * 1.5} Td")
                y_position -= line_height * 2
            elif line.strip() == "":
                # Empty line - small spacing
                content_lines.append(f"0 -{line_height * 0.5} Td")
                y_position -= line_height * 0.5
            else:
                # Regular content
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
        
        # Object 5: Font (using standard font for ATS compatibility)
        font = """5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj"""
        pdf_objects.append(font)
        
        # Build complete PDF
        pdf_content = "%PDF-1.4\n"
        
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
        
        # Return as BytesIO buffer
        try:
            pdf_buffer = io.BytesIO(pdf_content.encode('latin-1'))
        except UnicodeEncodeError:
            pdf_content_clean = pdf_content.encode('latin-1', errors='replace').decode('latin-1')
            pdf_buffer = io.BytesIO(pdf_content_clean.encode('latin-1'))
        
        return pdf_buffer
        
    except Exception as e:
        print(f"Error creating clean PDF: {str(e)}")
        return create_minimal_fallback_pdf(text_content)

def create_minimal_fallback_pdf(text):
    """Minimal PDF fallback"""
    content = f"""BT
/F1 11 Tf
50 750 Td
(ATS-Optimized Resume) Tj
0 -20 Td
({text[:200].replace('(', '').replace(')', '').replace('\\', '')}) Tj
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

# Test the function with your resume data
if __name__ == "__main__":
    # Sample resume data based on your current PDF
    sample_resume = {
        "full_name": "ABID SHAIK",
        "email": "abidshari009@gmail.com",
        "phone": "(716) 970-9249",
        "location": "Dallas, Texas, 76210, United States",
        "professional_summary": "Visionary Data Engineering Manager with 15+ years of experience leading high-impact data infrastructure projects and cross-functional teams. Proven track record of architecting scalable cloud solutions, implementing AI-powered platforms, and driving cost optimization initiatives that deliver measurable business value.",
        "skills": [
            "AWS", "Python", "SQL", "Apache Airflow", "dbt", "Snowflake",
            "Data Governance", "Team Leadership", "Cloud Migration", "ETL/ELT",
            "Data Modeling", "SLA Management", "Kafka", "Spark", "Mentorship"
        ],
        "experience": [
            {
                "title": "Data Engineering Manager",
                "company": "Amazon",
                "dates": "Dec '20 - Present",
                "achievements": [
                    "Led engineering team in developing AI-powered data discovery platform using AWS Bedrock, enhancing search capabilities by 40%",
                    "Architected real-time workforce management system processing 2M+ hourly transactions daily, improving operational efficiency by 30%",
                    "Directed implementation of centralized metrics repository with 200+ KPIs, eliminating data integrity issues across 15 business units",
                    "Managed cross-functional team to modernize data infrastructure through microservices architecture, reducing system downtime by 60%",
                    "Spearheaded development of automated pipeline framework cutting deployment timelines by 70% while maintaining 99.9% SLA",
                    "Oversaw security protocol enhancements that reduced incident response time by 45% through automated monitoring systems",
                    "Mentored 8+ engineers in advanced data modeling techniques, improving team velocity by 25%",
                    "Pioneered cost optimization initiatives that reduced cloud infrastructure spending by $1.2M annually"
                ]
            },
            {
                "title": "Senior Data Engineer",
                "company": "CGI",
                "dates": "Jun '15 - Dec '20",
                "achievements": [
                    "Directed enterprise-wide cloud migration strategy, reducing infrastructure costs by 25% while achieving 99.8% uptime",
                    "Engineered fault-tolerant AWS environment handling 50TB+ daily transactions, improving data accessibility by 35%"
                ]
            }
        ]
    }
    
    # Generate the PDF
    pdf_buffer = create_ats_optimized_pdf(sample_resume)
    
    # Save to file
    with open('/Users/shikbi/Desktop/ats_optimized_resume.pdf', 'wb') as f:
        f.write(pdf_buffer.getvalue())
    
    print("ATS-optimized PDF created successfully!")
