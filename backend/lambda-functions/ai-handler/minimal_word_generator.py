"""
Minimal Word document generation using only built-in Python libraries.
Creates a basic .docx file structure without external dependencies.
"""

import io
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime

def create_minimal_word_resume(resume_json):
    """
    Create a minimal Word document using only built-in libraries.
    
    Args:
        resume_json (dict): Resume data
    
    Returns:
        bytes: Generated Word document as bytes
    """
    
    try:
        # Create the main document XML content
        document_xml = create_document_xml(resume_json)
        
        # Create the .docx file structure
        docx_buffer = io.BytesIO()
        
        with zipfile.ZipFile(docx_buffer, 'w', zipfile.ZIP_DEFLATED) as docx:
            # Add required files for a valid .docx
            docx.writestr('[Content_Types].xml', get_content_types_xml())
            docx.writestr('_rels/.rels', get_rels_xml())
            docx.writestr('word/_rels/document.xml.rels', get_document_rels_xml())
            docx.writestr('word/document.xml', document_xml)
            docx.writestr('word/styles.xml', get_styles_xml())
            docx.writestr('docProps/app.xml', get_app_xml())
            docx.writestr('docProps/core.xml', get_core_xml())
        
        docx_buffer.seek(0)
        return docx_buffer.getvalue()
        
    except Exception as e:
        print(f"Error creating minimal Word document: {str(e)}")
        raise e

def create_document_xml(resume_json):
    """Create the main document.xml content."""
    
    # Start with basic document structure
    doc = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>'''
    
    # Add name (centered, large, bold)
    name = resume_json.get('full_name', 'Your Name')
    doc += f'''
<w:p>
<w:pPr><w:jc w:val="center"/></w:pPr>
<w:r>
<w:rPr>
<w:b/>
<w:sz w:val="32"/>
<w:color w:val="1F4E79"/>
</w:rPr>
<w:t>{escape_xml(name)}</w:t>
</w:r>
</w:p>'''
    
    # Add contact info (centered)
    contact = resume_json.get('contact_info', 'Your Contact Information')
    doc += f'''
<w:p>
<w:pPr><w:jc w:val="center"/></w:pPr>
<w:r>
<w:rPr><w:sz w:val="22"/></w:rPr>
<w:t>{escape_xml(contact)}</w:t>
</w:r>
</w:p>'''
    
    # Add empty paragraph for spacing
    doc += '<w:p/>'
    
    # Add Professional Summary section
    doc += add_section_header('PROFESSIONAL SUMMARY')
    summary = resume_json.get('professional_summary', 'Professional summary not available')
    doc += add_paragraph(summary)
    
    # Add Skills section
    doc += add_section_header('CORE COMPETENCIES')
    skills = resume_json.get('skills', [])
    if skills:
        skills_text = ' • '.join(skills)
        doc += add_paragraph(f"• {skills_text}")
    
    # Add Experience section
    doc += add_section_header('PROFESSIONAL EXPERIENCE')
    experience = resume_json.get('experience', [])
    for job in experience:
        # Job title (bold)
        title = job.get('title', 'Job Title')
        doc += add_paragraph(title, bold=True)
        
        # Company and dates (italic)
        company = job.get('company', 'Company')
        dates = job.get('dates', 'Dates')
        doc += add_paragraph(f"{company} | {dates}", italic=True)
        
        # Responsibilities
        responsibilities = job.get('responsibilities', [])
        if isinstance(responsibilities, str):
            responsibilities = [responsibilities]
        
        for resp in responsibilities:
            doc += add_paragraph(f"• {resp}")
        
        # Add space between jobs
        doc += '<w:p/>'
    
    # Add Education section
    doc += add_section_header('EDUCATION')
    education = resume_json.get('education', [])
    for edu in education:
        # Degree (bold)
        degree = edu.get('degree', 'Degree')
        doc += add_paragraph(degree, bold=True)
        
        # Institution and dates (italic)
        institution = edu.get('institution', 'Institution')
        dates = edu.get('dates', 'Dates')
        doc += add_paragraph(f"{institution} | {dates}", italic=True)
    
    # Close document
    doc += '''
</w:body>
</w:document>'''
    
    return doc

def add_section_header(text):
    """Add a section header with formatting."""
    return f'''
<w:p>
<w:r>
<w:rPr>
<w:b/>
<w:sz w:val="24"/>
<w:color w:val="1F4E79"/>
<w:u w:val="single"/>
</w:rPr>
<w:t>{escape_xml(text)}</w:t>
</w:r>
</w:p>'''

def add_paragraph(text, bold=False, italic=False):
    """Add a paragraph with optional formatting."""
    formatting = ''
    if bold:
        formatting += '<w:b/>'
    if italic:
        formatting += '<w:i/>'
    
    return f'''
<w:p>
<w:r>
<w:rPr>{formatting}<w:sz w:val="22"/></w:rPr>
<w:t>{escape_xml(text)}</w:t>
</w:r>
</w:p>'''

def escape_xml(text):
    """Escape XML special characters."""
    if not text:
        return ''
    return (text.replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&apos;'))

def get_content_types_xml():
    """Return the [Content_Types].xml file content."""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>'''

def get_rels_xml():
    """Return the _rels/.rels file content."""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''

def get_document_rels_xml():
    """Return the word/_rels/document.xml.rels file content."""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

def get_styles_xml():
    """Return basic styles.xml content."""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults>
<w:rPrDefault>
<w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
<w:sz w:val="22"/>
</w:rPr>
</w:rPrDefault>
</w:docDefaults>
</w:styles>'''

def get_app_xml():
    """Return docProps/app.xml content."""
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<Application>Resume Optimizer</Application>
<DocSecurity>0</DocSecurity>
<ScaleCrop>false</ScaleCrop>
<SharedDoc>false</SharedDoc>
<HyperlinksChanged>false</HyperlinksChanged>
<AppVersion>1.0</AppVersion>
</Properties>'''

def get_core_xml():
    """Return docProps/core.xml content."""
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Optimized Resume</dc:title>
<dc:creator>Resume Optimizer</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>'''
