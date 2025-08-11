#!/usr/bin/env python3

import io

def create_fixed_resume():
    """Create properly formatted ATS-friendly resume"""
    
    resume_text = """ABID SHAIK

abidshari009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States

PROFESSIONAL SUMMARY

Seasoned Data Engineering Leader with 15+ years of experience building enterprise-scale data solutions and leading high-performing teams. Proven expertise in AWS cloud architecture, real-time data systems, and driving cost optimization initiatives that deliver measurable business impact.

CORE COMPETENCIES

Team Leadership & Mentorship • Data Pipeline Architecture • AWS Cloud Solutions • SQL/Python Engineering
Data Governance & Compliance • Airflow Orchestration • Real-time Data Systems • Performance Optimization
Cross-functional Collaboration • SLA Management • DevOps Practices • Cost Optimization

PROFESSIONAL EXPERIENCE

Data Engineering Manager | Amazon | Dec '20 - Present

• Led engineering team in developing AI-powered data discovery solutions using AWS Bedrock, enhancing search capabilities by 40%
• Directed design of real-time workforce management system serving 1M+ global associates, reducing operational overhead by 30%
• Managed enterprise data modeling initiatives including 200+ metric definitions, establishing governance frameworks across business units
• Oversaw migration of mission-critical systems to microservices architecture, improving platform stability and reducing downtime by 60%
• Guided cross-functional teams in developing case management tools that improved user productivity by 25%
• Implemented DevOps practices including CI/CD pipelines and runbook automation, reducing deployment time by 70%
• Championed cost optimization strategies that reduced cloud infrastructure spending by 50% while maintaining 99.9% SLA
• Established data security protocols and compliance controls that achieved 100% audit readiness for sensitive data handling
• Mentored 8+ engineers in advanced data engineering techniques, promoting 3 team members to senior roles

Data Engineering Lead | CGI | Jun '15 - Dec '20

• Directed AWS cloud migration program that reduced infrastructure costs by 25% while achieving 30% performance improvement
• Architected fault-tolerant ETL pipelines processing 10TB daily, enabling real-time analytics for 50+ business stakeholders
• Supervised development of centralized data lake supporting 100+ concurrent users with role-based access controls
• Pioneered automated monitoring framework that reduced data pipeline downtime by 60% through predictive alerting

ETL Architect | Tech Mahindra | Jan '12 - May '15

• Designed and implemented enterprise ETL solutions processing multi-terabyte datasets for Fortune 500 clients
• Led technical teams in delivering complex data integration projects on time and within budget
• Established data quality frameworks and monitoring systems ensuring 99.5% data accuracy across all pipelines

EDUCATION

Master of Science in Computer Science | University at Buffalo | 2010
Bachelor of Technology in Computer Science | JNTU Hyderabad | 2008

CERTIFICATIONS

• AWS Certified Solutions Architect - Professional
• AWS Certified Data Analytics - Specialty
• Certified Data Management Professional (CDMP)"""

    return create_clean_pdf(resume_text)

def create_clean_pdf(text_content):
    """Create clean PDF without decorative elements"""
    lines = text_content.split('\n')
    
    # PDF structure
    pdf_objects = []
    
    catalog = """1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj"""
    pdf_objects.append(catalog)
    
    pages = """2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj"""
    pdf_objects.append(pages)
    
    # Content with proper formatting and line wrapping
    content_lines = []
    content_lines.append("BT")
    content_lines.append("/F1 10 Tf")  # Smaller font to fit more
    content_lines.append("1 0 0 1 40 750 Tm")  # More margin
    
    y_position = 750
    line_height = 12
    max_chars = 95  # Characters per line
    
    for line in lines:
        if y_position < 50:
            break
        
        # Break long lines
        if len(line) > max_chars and line.strip():
            words = line.split()
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                if len(test_line) > max_chars and current_line:
                    # Output current line
                    clean_line = ' '.join(current_line).encode('ascii', errors='ignore').decode('ascii')
                    escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
                    content_lines.append(f"({escaped_line}) Tj")
                    content_lines.append(f"0 -{line_height} Td")
                    y_position -= line_height
                    current_line = [word]
                else:
                    current_line.append(word)
            
            # Output remaining words
            if current_line:
                clean_line = ' '.join(current_line).encode('ascii', errors='ignore').decode('ascii')
                escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height} Td")
                y_position -= line_height
        else:
            # Regular line processing
            clean_line = line.encode('ascii', errors='ignore').decode('ascii')
            escaped_line = clean_line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            
            if line.strip() and line.strip().isupper() and len(line.strip()) < 50 and not line.startswith('•'):
                # Section header
                content_lines.append(f"0 -{line_height * 0.8} Td")
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height * 1.2} Td")
                y_position -= line_height * 2
            elif line.strip() == "":
                content_lines.append(f"0 -{line_height * 0.6} Td")
                y_position -= line_height * 0.6
            else:
                content_lines.append(f"({escaped_line}) Tj")
                content_lines.append(f"0 -{line_height} Td")
                y_position -= line_height
    
    content_lines.append("ET")
    content_stream = '\n'.join(content_lines)
    
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
    
    content_obj = f"""4 0 obj
<<
/Length {len(content_stream)}
>>
stream
{content_stream}
endstream
endobj"""
    pdf_objects.append(content_obj)
    
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
    
    return io.BytesIO(pdf_content.encode('latin-1', errors='replace'))

if __name__ == "__main__":
    pdf_buffer = create_fixed_resume()
    
    with open('/Users/shikbi/Desktop/abid_shaik_ats_resume.pdf', 'wb') as f:
        f.write(pdf_buffer.getvalue())
    
    print("Fixed ATS-friendly resume created!")
