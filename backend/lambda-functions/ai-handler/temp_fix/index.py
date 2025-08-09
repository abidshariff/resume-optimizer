import json
import boto3
import os
import uuid
import tempfile
import subprocess
import base64
import sys
import urllib.parse
import datetime
# import requests  # No longer needed - using AWS Bedrock only
from datetime import datetime
from minimal_word_generator import create_minimal_word_resume
from prompt_template import get_resume_optimization_prompt
from skills_manager import SkillsManager

def extract_job_data_from_url(job_url):
    """
    Extract job data from URL using the job-url-extractor Lambda function.
    
    Args:
        job_url (str): The job posting URL
    
    Returns:
        dict: Extracted job data or None if extraction fails
    """
    try:
        print(f"Extracting job data from URL: {job_url}")
        
        # Get the job URL extractor function name from environment
        job_extractor_function = os.environ.get('JOB_URL_EXTRACTOR_FUNCTION')
        if not job_extractor_function:
            print("Error: JOB_URL_EXTRACTOR_FUNCTION environment variable not set")
            return None
        
        print(f"Using job extractor function: {job_extractor_function}")
        
        # Prepare payload for job URL extractor
        extractor_payload = {
            'jobUrl': job_url
        }
        
        print(f"Calling job extractor with payload: {extractor_payload}")
        
        # Invoke job URL extractor Lambda function
        lambda_client = boto3.client('lambda')
        response = lambda_client.invoke(
            FunctionName=job_extractor_function,
            InvocationType='RequestResponse',  # Synchronous call
            Payload=json.dumps(extractor_payload)
        )
        
        print(f"Lambda invoke response status: {response.get('StatusCode')}")
        
        # Read the response payload
        response_payload_raw = response['Payload'].read()
        print(f"Raw response payload (first 500 chars): {response_payload_raw[:500]}")
        
        # Try to parse as JSON
        try:
            response_payload = json.loads(response_payload_raw)
            print(f"Parsed job extractor response: {response_payload}")
        except json.JSONDecodeError as json_error:
            print(f"Failed to parse response as JSON: {json_error}")
            print(f"Response appears to be HTML or other format")
            return None
        
        if response_payload.get('success') and response_payload.get('data'):
            job_data = response_payload['data']
            print(f"Successfully extracted job data: {job_data.keys()}")
            return job_data
        else:
            error_msg = response_payload.get('error', 'Unknown error')
            print(f"Job extraction failed: {error_msg}")
            return None
            
    except Exception as e:
        print(f"Error calling job URL extractor: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        return None

def create_cover_letter_word_document(cover_letter_text):
    """
    Create a Word document from cover letter text using minimal approach.
    
    Args:
        cover_letter_text (str): The cover letter content
    
    Returns:
        io.BytesIO: Word document buffer
    """
    import io
    import zipfile
    import xml.etree.ElementTree as ET
    from datetime import datetime
    
    def escape_xml(text):
        """Escape XML special characters."""
        if not text:
            return ""
        return (text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace('"', "&quot;")
                   .replace("'", "&apos;"))
    
    def create_cover_letter_document_xml(text):
        """Create document.xml for cover letter."""
        # Split text into paragraphs
        paragraphs = text.split('\n')
        
        # Build paragraphs XML
        paragraphs_xml = ""
        for para in paragraphs:
            para = para.strip()
            if para:  # Skip empty paragraphs
                paragraphs_xml += f'''
        <w:p>
            <w:pPr>
                <w:spacing w:after="120"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:sz w:val="22"/>
                </w:rPr>
                <w:t>{escape_xml(para)}</w:t>
            </w:r>
        </w:p>'''
            else:
                # Add empty paragraph for spacing
                paragraphs_xml += '''
        <w:p>
            <w:pPr>
                <w:spacing w:after="120"/>
            </w:pPr>
        </w:p>'''
        
        return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        {paragraphs_xml}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
        </w:sectPr>
    </w:body>
</w:document>'''
    
    def get_content_types_xml():
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
        return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''
    
    def get_document_rels_xml():
        return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''
    
    def get_styles_xml():
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
        return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
    <Application>JobTailorAI</Application>
    <DocSecurity>0</DocSecurity>
    <ScaleCrop>false</ScaleCrop>
    <SharedDoc>false</SharedDoc>
    <HyperlinksChanged>false</HyperlinksChanged>
    <AppVersion>1.0</AppVersion>
</Properties>'''
    
    def get_core_xml():
        now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>Cover Letter</dc:title>
    <dc:creator>JobTailorAI</dc:creator>
    <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>'''
    
    try:
        # Create the document XML content
        document_xml = create_cover_letter_document_xml(cover_letter_text)
        
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
        return docx_buffer
        
    except Exception as e:
        print(f"Error creating cover letter Word document: {str(e)}")
        raise e

# AI Model Configuration - Models are tried in order of preference
# DeepSeek R1 via AWS Bedrock as primary, followed by Claude models
AI_MODELS = [
    {
        'id': 'us.deepseek.r1-v1:0',
        'name': 'DeepSeek R1',
        'max_tokens': 4000,
        'cost_tier': 1,
        'cost_per_1m_input': 0.55,
        'cost_per_1m_output': 2.19,
        'description': 'Primary model - DeepSeek R1 for advanced reasoning and resume optimization',
        'is_bedrock': True
    },
    {
        'id': 'anthropic.claude-3-5-haiku-20241022-v1:0',
        'name': 'Claude 3.5 Haiku',
        'max_tokens': 4000,
        'cost_tier': 2,
        'cost_per_1m_input': 0.25,
        'cost_per_1m_output': 1.25,
        'description': 'Fast, efficient Claude 3.5 model - excellent performance and value'
    },
    {
        'id': 'anthropic.claude-3-haiku-20240307-v1:0',
        'name': 'Claude 3 Haiku',
        'max_tokens': 4000,
        'cost_tier': 3,
        'cost_per_1m_input': 0.25,
        'cost_per_1m_output': 1.25,
        'description': 'Reliable Claude 3 model - proven fallback option'
    }
]

s3 = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
bucket_name = os.environ.get('STORAGE_BUCKET')
table_name = os.environ.get('USER_HISTORY_TABLE')
skills_table_name = os.environ.get('SKILLS_TABLE')

# CORS headers for all responses
def get_cors_headers(origin=None):
    allowed_origins = [
        'https://main.d3tjpmlvy19b2l.amplifyapp.com',
        'https://jobtailorai.com',
        'http://localhost:3000'
    ]
    
    # If origin is provided and is in allowed list, use it; otherwise use wildcard for development
    if origin and origin in allowed_origins:
        cors_origin = origin
    else:
        cors_origin = '*'  # Allow all for development
    
    return {
        'Access-Control-Allow-Origin': cors_origin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Credentials': 'true'
    }

def update_job_status(bucket, status_key, status, message, data=None):
    """Update the job status in S3"""
    try:
        status_data = {
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add any additional data
        if data:
            status_data.update(data)
            
        s3.put_object(
            Bucket=bucket,
            Key=status_key,
            Body=json.dumps(status_data).encode('utf-8'),
            ContentType='application/json'
        )
        print(f"Updated job status to {status}: {message}")
    except Exception as e:
        print(f"Error updating job status: {str(e)}")

# Function to extract text from PDF
def extract_text_from_pdf(pdf_content):
    try:
        # Check if the file actually appears to be a PDF (starts with %PDF)
        if not pdf_content.startswith(b'%PDF'):
            print("File does not appear to be a valid PDF (missing PDF header)")
            return "The uploaded file does not appear to be a valid PDF. Please check the file format and try again."
        
        # First try using PyPDF2 directly (should be included in the package)
        try:
            print("Attempting PDF extraction with PyPDF2")
            # Create a temporary file to store the PDF content
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(pdf_content)
            
            # Import PyPDF2 from the package
            sys.path.append('/tmp')
            import PyPDF2
            
            text = ""
            with open(temp_file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            if text.strip():
                print(f"Successfully extracted {len(text)} characters from PDF using PyPDF2")
                return text
            else:
                print("PyPDF2 extraction returned no text, trying Textract")
        except Exception as pypdf_error:
            print(f"PyPDF2 extraction failed: {str(pypdf_error)}")
            # Continue to next method
        
        # Try using Amazon Textract as a fallback
        try:
            print("Attempting PDF extraction with Amazon Textract")
            textract = boto3.client('textract')
            
            response = textract.detect_document_text(
                Document={'Bytes': pdf_content}
            )
            
            # Extract text from the response
            text = ""
            for item in response["Blocks"]:
                if item["BlockType"] == "LINE":
                    text += item["Text"] + "\n"
            
            # Check if we actually got any text
            if not text.strip():
                print("Textract returned no text content")
                return "No text content could be extracted from the PDF. The file might be scanned images or have security restrictions."
                
            print(f"Successfully extracted {len(text)} characters from PDF using Textract")
            return text
            
        except Exception as textract_error:
            print(f"Textract extraction failed: {str(textract_error)}")
            
            # If we get here, both methods failed
            # Try one more fallback - install PyPDF2 if it wasn't available
            try:
                print("Attempting to install and use PyPDF2 as final fallback")
                subprocess.check_call(['pip', 'install', 'PyPDF2', '-t', '/tmp'])
                sys.path.append('/tmp')
                import PyPDF2
                
                # Create a new temporary file
                with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                    temp_file_path = temp_file.name
                    temp_file.write(pdf_content)
                
                text = ""
                with open(temp_file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        text += page.extract_text() + "\n"
                
                # Clean up the temporary file
                os.unlink(temp_file_path)
                
                if text.strip():
                    print(f"Successfully extracted {len(text)} characters from PDF using installed PyPDF2")
                    return text
                else:
                    return "No text could be extracted from the PDF. The file might contain scanned images or have security restrictions."
            except Exception as final_error:
                print(f"Final PDF extraction attempt failed: {str(final_error)}")
                return "The PDF format is not supported for text extraction. The file might be corrupted, password-protected, or in an unsupported format."
    
    except Exception as e:
        print(f"Error in PDF extraction process: {str(e)}")
        return f"Error extracting text from PDF: {str(e)}"

# Function to extract text from Word document
def extract_text_from_docx(docx_content):
    try:
        # Create a temporary file to store the docx content
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_file:
            temp_file_path = temp_file.name
            temp_file.write(docx_content)
        
        # Use direct zipfile extraction as the primary method (more reliable in Lambda)
        import zipfile
        from xml.etree.ElementTree import XML
        
        document = zipfile.ZipFile(temp_file_path)
        
        # Check if document.xml exists in the zip file
        try:
            xml_content = document.read('word/document.xml')
            
            WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            PARA = WORD_NAMESPACE + 'p'
            TEXT = WORD_NAMESPACE + 't'
            
            tree = XML(xml_content)
            
            paragraphs = []
            for paragraph in tree.iter(PARA):
                texts = [node.text for node in paragraph.iter(TEXT) if node.text]
                if texts:
                    paragraphs.append(''.join(texts))
            
            document.close()
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            extracted_text = '\n'.join(paragraphs)
            
            # Verify we actually got content
            if not extracted_text.strip():
                raise ValueError("No text content extracted from DOCX file")
                
            return extracted_text
            
        except KeyError:
            # If word/document.xml doesn't exist, try alternative paths
            document.close()
            
            # Try using python-docx if available
            try:
                # In Lambda, we can install packages in /tmp
                subprocess.check_call(['pip', 'install', 'python-docx', '-t', '/tmp'])
                sys.path.append('/tmp')
                import docx
                
                doc = docx.Document(temp_file_path)
                full_text = []
                for para in doc.paragraphs:
                    full_text.append(para.text)
                
                # Clean up the temporary file
                os.unlink(temp_file_path)
                
                return '\n'.join(full_text)
            except Exception as docx_error:
                print(f"python-docx extraction failed: {str(docx_error)}")
                raise
    
    except Exception as e:
        print(f"Error extracting text from Word document: {str(e)}")
        
        # Final fallback: Try to use textract package
        try:
            # Create a new temporary file
            with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(docx_content)
            
            # Try to install and use textract
            try:
                subprocess.check_call(['pip', 'install', 'textract', '-t', '/tmp'])
                sys.path.append('/tmp')
                import textract as text_extractor
                
                # Extract text from the docx file
                text = text_extractor.process(temp_file_path).decode('utf-8')
                
                # Clean up the temporary file
                os.unlink(temp_file_path)
                
                return text
            except Exception as textract_error:
                print(f"Textract extraction failed: {str(textract_error)}")
                os.unlink(temp_file_path)
                return "Unable to extract text from the Word document. Please try converting it to PDF format."
        except Exception as fallback_error:
            print(f"All extraction methods failed: {str(fallback_error)}")
            return "Unable to extract text from the Word document. Please try converting it to PDF format."

def format_original_resume_text(raw_text):
    """
    Format the raw extracted resume text to make it more readable for comparison.
    This function attempts to identify and structure common resume sections.
    """
    try:
        lines = raw_text.split('\n')
        formatted_lines = []
        
        # Clean up lines - remove excessive whitespace and empty lines
        clean_lines = []
        for line in lines:
            cleaned = line.strip()
            if cleaned:  # Only keep non-empty lines
                clean_lines.append(cleaned)
        
        if not clean_lines:
            return "No readable content found in the original resume."
        
        # Try to identify sections and format them
        i = 0
        current_section = None
        
        # Common section headers to look for
        section_keywords = {
            'contact': ['email', 'phone', 'linkedin', 'address', 'location'],
            'summary': ['summary', 'objective', 'profile', 'about'],
            'experience': ['experience', 'employment', 'work history', 'professional experience', 'career'],
            'education': ['education', 'academic', 'degree', 'university', 'college', 'school'],
            'skills': ['skills', 'technical skills', 'competencies', 'technologies', 'tools'],
            'projects': ['projects', 'portfolio'],
            'certifications': ['certifications', 'certificates', 'licenses'],
            'awards': ['awards', 'honors', 'achievements', 'recognition']
        }
        
        # First, try to identify the name (usually first few lines)
        name_found = False
        contact_info = []
        
        while i < len(clean_lines) and i < 5:  # Check first 5 lines for header info
            line = clean_lines[i].strip()
            
            # Check if this looks like a name (not too long, not containing common resume keywords)
            if not name_found and len(line) < 50 and not any(keyword in line.lower() for keyword_list in section_keywords.values() for keyword in keyword_list):
                # Check if it contains email, phone, or other contact info
                if '@' in line or any(char.isdigit() for char in line.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')):
                    contact_info.append(line)
                else:
                    # Likely a name
                    formatted_lines.append(line.upper())
                    formatted_lines.append("=" * len(line))
                    formatted_lines.append("")
                    name_found = True
            else:
                # Likely contact info
                contact_info.append(line)
            
            i += 1
        
        # Add contact information
        if contact_info:
            formatted_lines.extend(contact_info)
            formatted_lines.append("")
        
        # Process the rest of the resume
        current_section = None
        in_bullet_list = False
        
        while i < len(clean_lines):
            line = clean_lines[i].strip()
            
            # Check if this line is a section header
            section_detected = None
            for section_name, keywords in section_keywords.items():
                if any(keyword in line.lower() for keyword in keywords):
                    # Additional check: section headers are usually short and may be in caps
                    if len(line) < 100:
                        section_detected = section_name
                        break
            
            if section_detected:
                # Add section header
                if formatted_lines and formatted_lines[-1] != "":
                    formatted_lines.append("")
                
                section_title = line.upper()
                formatted_lines.append(section_title)
                formatted_lines.append("=" * len(section_title))
                formatted_lines.append("")
                current_section = section_detected
                in_bullet_list = False
                
            else:
                # Regular content line
                # Check if it looks like a bullet point
                if line.startswith(('•', '-', '*', '◦')) or (len(line) > 10 and line[0].isalpha() and current_section in ['experience', 'skills', 'projects']):
                    if not line.startswith(('•', '-', '*', '◦')):
                        line = f"• {line}"
                    formatted_lines.append(line)
                    in_bullet_list = True
                    
                # Check if it looks like a job title/company (for experience section)
                elif current_section == 'experience' and not in_bullet_list:
                    # Look ahead to see if next line might be dates or location
                    next_line = clean_lines[i + 1] if i + 1 < len(clean_lines) else ""
                    
                    # If this line is followed by something that looks like dates, treat as job header
                    if any(char.isdigit() for char in next_line) or any(word in next_line.lower() for word in ['present', 'current', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
                        formatted_lines.append(f"{line}")
                        in_bullet_list = False
                    else:
                        formatted_lines.append(f"• {line}")
                        in_bullet_list = True
                        
                # Check if it looks like education entry
                elif current_section == 'education':
                    formatted_lines.append(line)
                    
                # Default: add as regular line
                else:
                    formatted_lines.append(line)
                    in_bullet_list = False
            
            i += 1
        
        # Join all formatted lines
        result = '\n'.join(formatted_lines)
        
        # Clean up excessive blank lines
        while '\n\n\n' in result:
            result = result.replace('\n\n\n', '\n\n')
        
        return result.strip()
        
    except Exception as e:
        print(f"Error formatting original resume text: {str(e)}")
        # Fallback: return original text with basic cleanup
        lines = raw_text.split('\n')
        clean_lines = [line.strip() for line in lines if line.strip()]
        return '\n'.join(clean_lines)

# Function to determine file type and extract text
def extract_text_from_document(file_content, file_key):
    # First, try to detect file type by content (magic bytes)
    file_type = detect_file_type(file_content)
    file_extension = file_key.lower().split('.')[-1]
    
    print(f"File extension from key: {file_extension}")
    print(f"Detected file type from content: {file_type}")
    
    # If detected type doesn't match extension, log a warning
    if file_type and file_extension not in file_type:
        print(f"Warning: File extension ({file_extension}) doesn't match detected type ({file_type})")
    
    # Use detected type if available, otherwise fall back to extension
    actual_type = file_type if file_type else file_extension
    
    if 'pdf' in actual_type:
        result = extract_text_from_pdf(file_content)
        if result.startswith("Error") or result.startswith("The ") or result.startswith("No text"):
            return result
        return result
    elif any(ext in actual_type for ext in ['doc', 'docx', 'word']):
        result = extract_text_from_docx(file_content)
        if result.startswith("Unable to extract text"):
            return "Unfortunately, I could not extract any text from the provided Word document. Please try saving it as a PDF and uploading again."
        return result
    elif any(ext in actual_type for ext in ['txt', 'rtf', 'md', 'text', 'plain']):
        # Try to decode as plain text
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            return "Error decoding text file. Please check the encoding or try converting to PDF format."
    else:
        # Try to decode as plain text for unknown formats
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            return "Unsupported file format. Please upload a PDF, Word document, or plain text file."

# Function to detect file type based on content (magic bytes)
def detect_file_type(file_content):
    # Check for PDF signature
    if file_content.startswith(b'%PDF'):
        return 'pdf'
    
    # Check for DOC signature (DOC files start with D0CF11E0)
    if file_content.startswith(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1'):
        return 'doc'
    
    # Check for DOCX, which is a ZIP file containing specific XML files
    if file_content.startswith(b'PK\x03\x04'):
        # DOCX is a ZIP file, but so are many other formats
        # Try to check if it contains word/document.xml
        try:
            import io
            import zipfile
            with zipfile.ZipFile(io.BytesIO(file_content)) as zip_ref:
                file_list = zip_ref.namelist()
                if 'word/document.xml' in file_list:
                    return 'docx'
        except:
            pass
    
    # Check for RTF signature
    if file_content.startswith(b'{\\rtf'):
        return 'rtf'
    
    # Check for plain text (this is a bit of a guess)
    try:
        sample = file_content[:1000].decode('utf-8')
        # If we can decode it as UTF-8 and it contains mostly printable ASCII,
        # it's probably a text file
        printable_ratio = sum(c.isprintable() for c in sample) / len(sample)
        if printable_ratio > 0.95:
            return 'txt'
    except:
        pass
    
    # Unknown type
    return None

def create_text_resume(resume_json):
    """Create a text-based resume from the JSON data."""
    try:
        # Format the resume as text
        text_resume = f"{resume_json.get('full_name', 'Full Name')}\n"
        text_resume += f"{resume_json.get('contact_info', 'Contact Information')}\n\n"
        text_resume += "=" * 80 + "\n\n"
        
        # Professional Summary
        text_resume += "PROFESSIONAL SUMMARY\n"
        text_resume += "-" * 20 + "\n"
        text_resume += f"{resume_json.get('professional_summary', 'Professional Summary')}\n\n"
        
        # Skills
        text_resume += "SKILLS\n"
        text_resume += "-" * 6 + "\n"
        for skill in resume_json.get('skills', []):
            text_resume += f"• {skill}\n"
        text_resume += "\n"
        
        # Experience
        text_resume += "EXPERIENCE\n"
        text_resume += "-" * 10 + "\n"
        for job in resume_json.get('experience', []):
            text_resume += f"{job.get('title', 'Job Title')} | {job.get('company', 'Company')}\n"
            text_resume += f"{job.get('dates', 'Dates')}\n"
            for achievement in job.get('achievements', []):
                text_resume += f"• {achievement}\n"
            text_resume += "\n"
        
        # Education
        text_resume += "EDUCATION\n"
        text_resume += "-" * 9 + "\n"
        for edu in resume_json.get('education', []):
            text_resume += f"{edu.get('degree', 'Degree')} | {edu.get('institution', 'Institution')}\n"
            text_resume += f"{edu.get('dates', 'Graduation Year')}\n"
            if 'details' in edu and edu['details']:
                text_resume += f"{edu['details']}\n"
            text_resume += "\n"
        
        return text_resume
    except Exception as e:
        print(f"Error creating text resume: {str(e)}")
        return None

def lambda_handler(event, context):
    status_key = None
    try:
        print("Received event:", json.dumps(event))
        
        # Extract data from the event
        user_id = event.get('userId', 'anonymous')
        job_id = event.get('jobId')
        resume_key = event.get('resumeKey')
        job_desc_key = event.get('jobDescriptionKey')
        job_title_key = event.get('jobTitleKey')
        company_name_key = event.get('companyNameKey')
        job_url = event.get('jobUrl')  # New field for job URL extraction
        generate_cv = event.get('generateCV', False)  # Generate CV flag
        status_key = event.get('statusKey')
        output_format = event.get('outputFormat', 'pdf')  # Resume format - default to pdf
        cover_letter_format = event.get('coverLetterFormat', 'pdf')  # Cover letter format - default to pdf
        
        print(f"AI Handler received resume format: {output_format}")
        print(f"AI Handler received cover letter format: {cover_letter_format}")
        print(f"Generate CV flag: {generate_cv}")
        print(f"Job URL provided: {bool(job_url)}")
        
        # Map frontend format names to backend format names
        format_mapping = {
            'docx': 'word',
            'txt': 'text',
            'pdf': 'pdf'
        }
        output_format = format_mapping.get(output_format, output_format)
        cover_letter_format = format_mapping.get(cover_letter_format, cover_letter_format)
        
        print(f"Mapped resume format: {output_format}")
        print(f"Mapped cover letter format: {cover_letter_format}")
        
        # Validate inputs - now more flexible with job URL extraction
        if not job_id or not resume_key or not status_key:
            error_msg = 'Missing required parameters (jobId, resumeKey, statusKey)'
            if status_key:
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
            return {
                'error': error_msg,
                'headers': get_cors_headers()
            }
        
        # Either job URL or job title/description must be provided
        if not job_url and not job_title_key:
            error_msg = 'Either job URL or job title must be provided'
            update_job_status(bucket_name, status_key, 'FAILED', error_msg)
            return {
                'error': error_msg,
                'headers': get_cors_headers()
            }
        
        # Update status to processing
        update_job_status(bucket_name, status_key, 'PROCESSING', 'Processing resume and job description')
        
        # Get files from S3
        try:
            # Get resume file
            resume_obj = s3.get_object(Bucket=bucket_name, Key=resume_key)
            resume_content = resume_obj['Body'].read()
            
            # Extract text from resume document (PDF or Word)
            resume_text = extract_text_from_document(resume_content, resume_key)
            print(f"Extracted resume text length: {len(resume_text)}")
            
            # Store the original extracted text for comparison purposes
            formatted_original_text = resume_text  # Default fallback
            try:
                # Format the original text for better comparison readability
                formatted_original_text = format_original_resume_text(resume_text)
                
                original_text_key = f"users/{user_id}/original/{job_id}/original_text.txt"
                s3.put_object(
                    Bucket=bucket_name,
                    Key=original_text_key,
                    Body=formatted_original_text.encode('utf-8'),
                    ContentType='text/plain'
                )
                print(f"Stored formatted original text at {original_text_key}")
            except Exception as e:
                print(f"Warning: Failed to store original text for comparison: {str(e)}")
                # Use raw text as fallback
                formatted_original_text = resume_text
            
            # Check if we got a valid extraction or an error message
            if resume_text.startswith("Unfortunately") or resume_text.startswith("Error") or resume_text.startswith("Unable"):
                print("Text extraction failed with error message")
                update_job_status(bucket_name, status_key, 'FAILED', resume_text)
                return {
                    'error': resume_text,
                    'headers': get_cors_headers()
                }
            
            # Verify we have enough text to process
            if len(resume_text.strip()) < 50:  # Arbitrary minimum length
                error_msg = f"The extracted text from your resume is too short ({len(resume_text.strip())} characters). Please check the file format and try again."
                print("Extracted text too short, likely failed extraction")
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
                return {
                    'error': error_msg,
                    'headers': get_cors_headers()
                }
            
            # Initialize job data variables
            job_description = ""
            job_title = ""
            company_name = ""
            
            # Extract job data from URL if provided
            if job_url:
                update_job_status(bucket_name, status_key, 'PROCESSING', 'Extracting job information from URL...')
                
                extracted_data = extract_job_data_from_url(job_url)
                if extracted_data:
                    job_description = extracted_data.get('description', '')
                    extracted_job_title = extracted_data.get('job_title', '')
                    company_name = extracted_data.get('company', '')
                    
                    print(f"Extracted job title: {extracted_job_title}")
                    print(f"Extracted company: {company_name}")
                    print(f"Job description length: {len(job_description)}")
                    
                    # Use extracted job title if not provided manually
                    if extracted_job_title:
                        job_title = extracted_job_title
                else:
                    print("Job URL extraction failed, checking for manual data...")
            
            # Get manual job data from S3 if available (fallback or supplement)
            if job_title_key and not job_title:
                try:
                    job_title_obj = s3.get_object(Bucket=bucket_name, Key=job_title_key)
                    job_title = job_title_obj['Body'].read().decode('utf-8').strip()
                    print(f"Using manual job title: {job_title}")
                except Exception as e:
                    print(f"No manual job title found: {str(e)}")
            
            if job_desc_key and not job_description:
                try:
                    job_desc_obj = s3.get_object(Bucket=bucket_name, Key=job_desc_key)
                    job_description = job_desc_obj['Body'].read().decode('utf-8')
                    print(f"Using manual job description, length: {len(job_description)}")
                except Exception as e:
                    print(f"No manual job description found: {str(e)}")
            
            if company_name_key and not company_name:
                try:
                    company_name_obj = s3.get_object(Bucket=bucket_name, Key=company_name_key)
                    company_name = company_name_obj['Body'].read().decode('utf-8').strip()
                    print(f"Using manual company name: {company_name}")
                except Exception as e:
                    print(f"No manual company name found: {str(e)}")
            
            # Final validation
            if not job_title:
                error_msg = "Job title is required. Please provide a job title or a valid job URL."
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
                return {
                    'error': error_msg,
                    'headers': get_cors_headers()
                }
            
            if generate_cv and not company_name:
                error_msg = "Company information is required for cover letter generation. Please provide a valid job URL with company information."
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
                return {
                    'error': error_msg,
                    'headers': get_cors_headers()
                }
        except Exception as e:
            error_msg = f'Error retrieving or processing files: {str(e)}'
            print(f"Error retrieving or processing files from S3: {str(e)}")
            update_job_status(bucket_name, status_key, 'FAILED', error_msg)
            return {
                'error': error_msg,
                'headers': get_cors_headers()
            }
        
        # Process skills extraction and update database
        skills_processing_result = {}
        if skills_table_name:
            try:
                print("Starting adaptive skills processing...")
                update_job_status(bucket_name, status_key, 'PROCESSING', 'Extracting and updating skills database')
                
                # Initialize skills manager
                skills_manager = SkillsManager(skills_table_name)
                
                # Extract skills from job description (if provided)
                extracted_skills = []
                if job_description and job_description.strip():
                    extracted_skills = skills_manager.extract_skills_from_text(job_description)
                    print(f"Extracted {len(extracted_skills)} skills from job description")
                else:
                    print("No job description provided - skipping skills extraction")
                
                # Process the extracted skills (add new ones, update frequencies)
                skills_processing_result = None
                if extracted_skills:
                    skills_processing_result = skills_manager.process_extracted_skills(extracted_skills)
                    print(f"Skills processing result: {skills_processing_result}")
                else:
                    print("No skills to process")
                
                # Get updated skills for optimization
                organized_skills = skills_manager.get_skills_for_optimization()
                print(f"Retrieved organized skills: {sum(len(skills) for skills in organized_skills.values())} total skills")
                
            except Exception as e:
                print(f"Warning: Skills processing failed: {str(e)}")
                # Continue with empty skills if processing fails
                organized_skills = {
                    'technical': [],
                    'soft': [],
                    'industry': [],
                    'tools': [],
                    'frameworks': [],
                    'languages': [],
                    'certifications': [],
                    'general': []
                }
                skills_processing_result = {'error': str(e)}
        else:
            print("Skills table not configured, skipping skills processing")
            organized_skills = {
                'technical': [],
                'soft': [],
                'industry': [],
                'tools': [],
                'frameworks': [],
                'languages': [],
                'certifications': [],
                'general': []
            }
        
        # Update status to AI processing
        update_job_status(bucket_name, status_key, 'PROCESSING', 'Generating optimized resume with AI')
        
        # Estimate the page count of the original resume
        def estimate_page_count(text):
            """
            Estimate the number of pages based on text length and content structure.
            Assumes approximately 500-600 words per page for a typical resume.
            """
            words = len(text.split())
            lines = len(text.split('\n'))
            
            # Base estimation on word count (500-600 words per page)
            word_based_pages = max(1, words / 550)
            
            # Adjust based on line count (assuming 40-50 lines per page)
            line_based_pages = max(1, lines / 45)
            
            # Take the average and round up to nearest 0.5
            estimated_pages = (word_based_pages + line_based_pages) / 2
            
            # Round to nearest 0.5 and ensure minimum of 1 page
            if estimated_pages <= 1:
                return 1
            elif estimated_pages <= 1.5:
                return 1.5
            elif estimated_pages <= 2:
                return 2
            else:
                return min(3, round(estimated_pages * 2) / 2)  # Cap at 3 pages max
        
        original_page_count = estimate_page_count(resume_text)
        print(f"Estimated original resume page count: {original_page_count}")
        
        # Determine content preservation guidance based on page count
        if original_page_count <= 1:
            length_guidance = "Preserve all original content while optimizing for keywords. Maintain the same number of experience entries and bullet points as the original resume."
        elif original_page_count <= 1.5:
            length_guidance = "Preserve all original content while optimizing for keywords. Keep all experience entries and bullet points from the original resume."
        elif original_page_count <= 2:
            length_guidance = "Preserve all original content while optimizing for keywords. Include all experience entries and bullet points from the original resume."
        else:
            length_guidance = "Preserve all original content while optimizing for keywords. Include all experience entries and bullet points from the original resume, maintaining the same level of detail."

        # Generate the prompt using the external template with dynamic skills
        # Convert organized skills to a formatted string for the prompt
        skills_text = ""
        if organized_skills:
            skills_sections = []
            for category, skills_list in organized_skills.items():
                if skills_list:  # Only include categories that have skills
                    category_title = category.replace('_', ' ').title()
                    skills_sections.append(f"{category_title}: {', '.join(skills_list[:20])}")  # Limit to top 20 per category
            
            if skills_sections:
                skills_text = "Dynamic Skills Database (prioritize these skills when relevant):\n" + "\n".join(skills_sections)
                print(f"Generated skills text with {len(skills_sections)} categories")
        
        # ===== COMPREHENSIVE VARIABLE LOGGING FOR DEBUGGING =====
        print("=" * 80)
        print("LOGGING ALL VARIABLES PASSED TO AI HANDLER LAMBDA PROMPT")
        print("=" * 80)
        
        # Log all the variables you mentioned
        print(f"Variable: original_resume_text")
        print(f"Value: {resume_text}")
        print(f"Length: {len(resume_text)} characters")
        print("-" * 40)
        
        # Extract current role from resume for logging
        lines = resume_text.split('\n')
        current_role = "Unknown"
        for line in lines:
            line_stripped = line.strip()
            if any(indicator in line.lower() for indicator in ['engineer', 'manager', 'analyst', 'developer', 'designer', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior']):
                current_role = line_stripped
                break
        
        print(f"Variable: current_role")
        print(f"Value: {current_role}")
        print("-" * 40)
        
        print(f"Variable: target_job_title")
        print(f"Value: {job_title}")
        print("-" * 40)
        
        print(f"Variable: target_company")
        print(f"Value: {company_name}")
        print("-" * 40)
        
        # Analyze target role for seniority and type
        from prompt_template import analyze_role_seniority_and_type, get_appropriate_action_verbs, calculate_total_experience_years, analyze_work_history_structure, extract_experience_requirements, extract_job_keywords
        
        seniority_level, role_type = analyze_role_seniority_and_type(job_title)
        print(f"Variable: seniority_level")
        print(f"Value: {seniority_level}")
        print("-" * 40)
        
        print(f"Variable: role_type")
        print(f"Value: {role_type}")
        print("-" * 40)
        
        action_verbs = get_appropriate_action_verbs(seniority_level, role_type)
        print(f"Variable: action_verbs")
        print(f"Value: {action_verbs}")
        print("-" * 40)
        
        experience_years = calculate_total_experience_years(resume_text)
        print(f"Variable: total_years")
        print(f"Value: {experience_years}")
        print("-" * 40)
        
        print(f"Variable: experience_requirements_text")
        print(f"Value: {job_description}")
        print(f"Length: {len(job_description)} characters")
        print("-" * 40)
        
        # Extract experience requirements from job description
        experience_requirements = extract_experience_requirements(job_description) if job_description else None
        print(f"Variable: experience_requirements")
        print(f"Value: {experience_requirements}")
        print("-" * 40)
        
        # Determine transition type
        transition_type = "unknown"
        if current_role != "Unknown" and job_title:
            # Simple heuristic for transition type
            current_lower = current_role.lower()
            target_lower = job_title.lower()
            
            # Check for major domain changes
            domains = {
                'software': ['software', 'developer', 'engineer', 'programming', 'coding'],
                'data': ['data', 'analyst', 'scientist', 'analytics'],
                'marketing': ['marketing', 'brand', 'campaign', 'social'],
                'sales': ['sales', 'account', 'business development'],
                'design': ['design', 'ux', 'ui', 'creative'],
                'management': ['manager', 'director', 'lead', 'supervisor']
            }
            
            current_domain = None
            target_domain = None
            
            for domain, keywords in domains.items():
                if any(keyword in current_lower for keyword in keywords):
                    current_domain = domain
                if any(keyword in target_lower for keyword in keywords):
                    target_domain = domain
            
            if current_domain and target_domain:
                if current_domain != target_domain:
                    transition_type = "major_career_transition"
                elif 'senior' in target_lower or 'lead' in target_lower or 'manager' in target_lower:
                    transition_type = "career_advancement"
                else:
                    transition_type = "same_related_role"
            else:
                transition_type = "unclear"
        
        print(f"Variable: transition_type")
        print(f"Value: {transition_type}")
        print("-" * 40)
        
        # Generate transition strategies based on type
        transition_strategies = []
        if transition_type == "major_career_transition":
            transition_strategies = [
                f"Completely rewrite bullets using {job_title} technologies and methodologies",
                f"Transform domain-specific achievements to {job_title} context",
                f"Emphasize transferable skills relevant to {job_title}",
                f"Use {job_title}-appropriate action verbs and terminology"
            ]
        elif transition_type == "career_advancement":
            transition_strategies = [
                "Reframe IC work to show leadership and management capabilities",
                "Emphasize team leadership, strategic thinking, and business impact",
                "Transform individual contributions to team leadership examples",
                "Use management-focused action verbs and metrics"
            ]
        else:
            transition_strategies = [
                "Keep original context, update with modern technologies",
                "Enhance existing work with current industry standards",
                f"Modernize with {job_title}-relevant tools and frameworks",
                "Preserve work context while optimizing for target role"
            ]
        
        print(f"Variable: transition_strategy_1")
        print(f"Value: {transition_strategies[0] if len(transition_strategies) > 0 else 'Not applicable'}")
        print("-" * 40)
        
        print(f"Variable: transition_strategy_2")
        print(f"Value: {transition_strategies[1] if len(transition_strategies) > 1 else 'Not applicable'}")
        print("-" * 40)
        
        print(f"Variable: transition_strategy_3")
        print(f"Value: {transition_strategies[2] if len(transition_strategies) > 2 else 'Not applicable'}")
        print("-" * 40)
        
        print(f"Variable: transition_strategy_4")
        print(f"Value: {transition_strategies[3] if len(transition_strategies) > 3 else 'Not applicable'}")
        print("-" * 40)
        
        # Generate transition example
        transition_example = "No specific example available"
        if transition_type == "major_career_transition":
            transition_example = f"Transform 'Designed mechanical systems for automotive' → 'Developed systematic solutions using Python and SQL for {job_title} applications'"
        elif transition_type == "career_advancement":
            transition_example = f"Transform 'Built feature' → 'Led development of feature, mentoring 3 junior developers for {job_title} role'"
        else:
            transition_example = f"Transform 'Built web application' → 'Built web application using React.js and Node.js for {job_title}'"
        
        print(f"Variable: transition_example")
        print(f"Value: {transition_example}")
        print("-" * 40)
        
        # Analyze work history structure
        work_history_analysis = analyze_work_history_structure(resume_text)
        print(f"Variable: total_job_entries")
        print(f"Value: {work_history_analysis['total_jobs_found']}")
        print("-" * 40)
        
        # Count total bullet points (rough estimate)
        bullet_indicators = ['•', '-', '*', '◦']
        total_bullets = 0
        for line in resume_text.split('\n'):
            line_stripped = line.strip()
            if any(line_stripped.startswith(indicator) for indicator in bullet_indicators):
                total_bullets += 1
        
        print(f"Variable: total_bullet_points")
        print(f"Value: {total_bullets} (estimated from bullet indicators)")
        print("-" * 40)
        
        # Generate bullet count breakdown
        bullet_breakdown = {}
        current_job = None
        job_bullet_count = 0
        
        for line in resume_text.split('\n'):
            line_stripped = line.strip()
            # Check if this might be a job title
            if any(title_word in line.lower() for title_word in ['engineer', 'manager', 'analyst', 'developer', 'designer', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior']):
                if current_job and job_bullet_count > 0:
                    bullet_breakdown[current_job] = job_bullet_count
                current_job = line_stripped[:50] + "..." if len(line_stripped) > 50 else line_stripped
                job_bullet_count = 0
            elif any(line_stripped.startswith(indicator) for indicator in bullet_indicators):
                job_bullet_count += 1
        
        # Add the last job
        if current_job and job_bullet_count > 0:
            bullet_breakdown[current_job] = job_bullet_count
        
        print(f"Variable: bullet_count_breakdown")
        print(f"Value: {bullet_breakdown}")
        print("-" * 40)
        
        # Additional variables that are actually used in the prompt
        print(f"Variable: skills_text")
        print(f"Value: {skills_text}")
        print(f"Length: {len(skills_text)} characters")
        print("-" * 40)
        
        print(f"Variable: length_guidance")
        print(f"Value: {length_guidance}")
        print("-" * 40)
        
        print(f"Variable: original_page_count")
        print(f"Value: {original_page_count}")
        print("-" * 40)
        
        print(f"Variable: organized_skills")
        print(f"Value: {organized_skills}")
        print("-" * 40)
        
        print(f"Variable: job_url")
        print(f"Value: {job_url if job_url else 'Not provided'}")
        print("-" * 40)
        
        print(f"Variable: generate_cv")
        print(f"Value: {generate_cv}")
        print("-" * 40)
        
        print(f"Variable: output_format")
        print(f"Value: {output_format}")
        print("-" * 40)
        
        print(f"Variable: cover_letter_format")
        print(f"Value: {cover_letter_format}")
        print("-" * 40)
        
        # Extract job keywords if job description is available
        job_keywords = extract_job_keywords(job_description) if job_description else []
        print(f"Variable: job_keywords")
        print(f"Value: {job_keywords}")
        print("-" * 40)
        
        print("=" * 80)
        print("END OF VARIABLE LOGGING")
        print("=" * 80)
        
        prompt = get_resume_optimization_prompt(resume_text, job_description, job_title, company_name, skills_text, length_guidance)
        
        # Log the final prompt being sent to AI
        print("=" * 80)
        print("FINAL PROMPT BEING SENT TO AI MODEL")
        print("=" * 80)
        print(f"Prompt length: {len(prompt)} characters")
        print("First 1000 characters of prompt:")
        print(prompt[:1000])
        print("...")
        print("Last 1000 characters of prompt:")
        print(prompt[-1000:])
        print("=" * 80)
        print("END OF PROMPT LOGGING")
        print("=" * 80)
        
        # Call Amazon Bedrock with automatic model fallback
        def call_bedrock_with_fallback(prompt):
            """
            Call AI models with automatic fallback.
            Uses the AI_MODELS configuration with DeepSeek R1 first, then Claude models.
            """
            
            print(f"Starting AI model fallback with {len(AI_MODELS)} models configured")
            print("Model hierarchy:")
            for i, model in enumerate(AI_MODELS):
                print(f"  {i+1}. {model['name']} - ${model['cost_per_1m_input']:.2f}/${model['cost_per_1m_output']:.2f} per 1M tokens")
            
            last_error = None
            
            # Try each model in order
            for i, model in enumerate(AI_MODELS):
                try:
                    print(f"Attempting to use {model['name']} (model {i+1}/{len(AI_MODELS)})")
                    print(f"  Model ID: {model['id']}")
                    print(f"  Cost Tier: {model['cost_tier']} - ${model['cost_per_1m_input']:.2f}/${model['cost_per_1m_output']:.2f} per 1M tokens")
                    print(f"  Description: {model['description']}")
                    
                    # All models now use AWS Bedrock
                    if model['id'] == 'us.deepseek.r1-v1:0':
                        # DeepSeek R1 via Bedrock
                        formatted_prompt = f"""
<｜begin▁of▁sentence｜><｜User｜>{prompt}<｜Assistant｜><think>
"""
                        
                        request_body = {
                            "prompt": formatted_prompt,
                            "max_tokens": model['max_tokens'],
                            "temperature": 0.5,
                            "top_p": 0.9
                        }
                        
                        response = bedrock_runtime.invoke_model(
                            modelId=model['id'],
                            body=json.dumps(request_body)
                        )
                        
                        response_data = json.loads(response['body'].read())
                        optimized_resume = response_data['choices'][0]['text']
                        
                    else:
                        # Call AWS Bedrock
                        if model['id'].startswith('anthropic.'):
                            # Anthropic models use the messages format
                            request_body = {
                                "anthropic_version": "bedrock-2023-05-31",
                                "max_tokens": model['max_tokens'],
                                "temperature": 0.5,
                                "system": "You are an expert ATS resume optimizer that preserves document formatting.",
                                "messages": [
                                    {
                                        "role": "user",
                                        "content": prompt
                                    }
                                ]
                            }
                        else:
                            # Other AWS models
                            request_body = {
                                "inputText": f"System: You are an expert ATS resume optimizer that preserves document formatting.\n\nHuman: {prompt}\n\nAssistant:",
                                "textGenerationConfig": {
                                    "maxTokenCount": model['max_tokens'],
                                    "temperature": 0.5,
                                    "topP": 0.9
                                }
                            }
                        
                        # Make the API call to Bedrock
                        response = bedrock_runtime.invoke_model(
                            modelId=model['id'],
                            body=json.dumps(request_body)
                        )
                        
                        # Parse the response based on model type
                        response_body = json.loads(response['body'].read())
                        
                        if model['id'].startswith('anthropic.'):
                            optimized_resume = response_body['content'][0]['text']
                        else:
                            # Try to extract text from common response formats
                            if 'results' in response_body:
                                optimized_resume = response_body['results'][0]['outputText']
                            elif 'generation' in response_body:
                                optimized_resume = response_body['generation']
                            else:
                                optimized_resume = str(response_body)
                    
                    # Validate the response
                    if optimized_resume and len(optimized_resume.strip()) > 100:
                        print(f"[SUCCESS] Successfully used {model['name']}")
                        print(f"Response length: {len(optimized_resume)} characters")
                        
                        # Estimate cost for this request
                        estimated_input_tokens = len(prompt.split()) * 1.3  # Rough estimation
                        estimated_output_tokens = len(optimized_resume.split()) * 1.3
                        estimated_cost = (estimated_input_tokens / 1000000 * model['cost_per_1m_input']) + \
                                       (estimated_output_tokens / 1000000 * model['cost_per_1m_output'])
                        print(f"Estimated cost: ${estimated_cost:.4f} (Input: ~{estimated_input_tokens:.0f} tokens, Output: ~{estimated_output_tokens:.0f} tokens)")
                        
                        return optimized_resume, model['name']
                    else:
                        print(f"⚠️ {model['name']} returned empty/short response, trying next model...")
                        continue
                        
                except Exception as e:
                    error_msg = str(e)
                    print(f"❌ {model['name']} failed: {error_msg}")
                    last_error = e
                    
                    # Check if it's a recoverable error that should trigger fallback
                    recoverable_errors = [
                        "AccessDeniedException", 
                        "ThrottlingException", 
                        "ModelNotReadyException",
                        "ServiceUnavailableException",
                        "ValidationException",
                        "ResourceNotFoundException",
                        "ModelTimeoutException",
                        "ModelErrorException",
                        "InternalServerException",
                        "ModelStreamErrorException",
                        "HTTPError",
                        "ConnectionError",
                        "Timeout"
                    ]
                    
                    if any(error_type in error_msg for error_type in recoverable_errors):
                        print(f"   -> Recoverable error with {model['name']}, trying next model...")
                        continue
                    else:
                        print(f"   -> Unexpected error with {model['name']}: {error_msg}")
                        continue
            
            # If all models failed, raise the last error
            print(f"❌ All {len(AI_MODELS)} models failed. Last error: {last_error}")
            raise Exception(f"All AI models failed. Last error: {str(last_error)}")
        
        try:
            print("Starting resume optimization with automatic model fallback...")
            optimized_resume, model_used = call_bedrock_with_fallback(prompt)
            print(f"Resume optimization completed successfully using {model_used}")
            
        except Exception as e:
            error_msg = f'Error generating optimized resume with all models: {str(e)}'
            print(f"All Bedrock models failed: {str(e)}")
            
            # Provide a fallback response if all models fail
            print("Using emergency fallback response...")
            optimized_resume = f"""```json
{{
  "full_name": "Resume Optimization Unavailable",
  "contact_info": "AI service temporarily unavailable",
  "professional_summary": "We apologize, but our AI resume optimization service is currently experiencing technical difficulties. Your original resume content has been preserved, but we were unable to optimize it at this time. Please try again later or contact support if the issue persists.",
  "skills": [
    "Original resume content preserved",
    "AI optimization temporarily unavailable",
    "Please try again later"
  ],
  "experience": [
    {{
      "title": "Service Notice",
      "company": "JobTailorAI",
      "dates": "Current",
      "achievements": [
        "Your resume was successfully uploaded and processed",
        "AI optimization models are temporarily unavailable",
        "Original content has been preserved for future processing",
        "Please try submitting your resume again in a few minutes"
      ]
    }}
  ],
  "education": [
    {{
      "degree": "Technical Notice",
      "institution": "JobTailorAI Service",
      "dates": "Current",
      "details": "All AI models are currently experiencing issues. This is a temporary service disruption."
    }}
  ]
}}
"""
            model_used = "Emergency Fallback"
        
        # Update status to finalizing
        update_job_status(bucket_name, status_key, 'PROCESSING', 'Finalizing optimized resume')
        
        # Parse the JSON response from Claude
        try:
            # Extract JSON from the response
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', optimized_resume, re.DOTALL)
            if json_match:
                resume_json = json.loads(json_match.group(1))
            else:
                # Try to parse the entire response as JSON
                resume_json = json.loads(optimized_resume)
                
            print("Successfully parsed JSON response")
            
            # Debug: Check content preservation
            experience_count = len(resume_json.get('experience', []))
            print(f"Generated resume has {experience_count} experience entries")
            
            for i, exp in enumerate(resume_json.get('experience', [])):
                achievement_count = len(exp.get('achievements', []))
                print(f"Experience {i+1} ({exp.get('title', 'Unknown')}) has {achievement_count} achievements")
            
            # Generate output based on requested format
            print(f"Generating resume in format: {output_format}")
            if output_format.lower() == 'pdf':
                try:
                    print("Starting PDF generation...")
                    # Try to use reportlab for PDF generation
                    try:
                        print("Installing reportlab...")
                        # Install reportlab in /tmp
                        subprocess.check_call(['pip', 'install', 'reportlab', '-t', '/tmp'])
                        sys.path.append('/tmp')
                        
                        print("Importing PDF generator...")
                        # Import the PDF generator
                        from pdf_generator import create_pdf_resume
                        
                        print("Creating PDF document...")
                        # Generate PDF document
                        pdf_content = create_pdf_resume(resume_json)
                        
                        output_extension = 'pdf'
                        content_type = 'application/pdf'
                        is_binary = True
                        optimized_resume = pdf_content
                        
                        print("Successfully generated PDF document using reportlab")
                        
                    except Exception as pdf_error:
                        print(f"Error using reportlab PDF generator: {str(pdf_error)}")
                        # Fall back to text format
                        text_resume = create_text_resume(resume_json)
                        output_extension = 'txt'
                        content_type = 'text/plain'
                        is_binary = False
                        optimized_resume = text_resume if text_resume else f"Failed to create PDF resume. Error: {str(pdf_error)}"
                    
                except Exception as pdf_outer_error:
                    print(f"Error generating PDF document: {str(pdf_outer_error)}")
                    # Fall back to text format
                    text_resume = create_text_resume(resume_json)
                    output_extension = 'txt'
                    content_type = 'text/plain'
                    is_binary = False
                    optimized_resume = text_resume if text_resume else f"Failed to create resume. Error: {str(pdf_outer_error)}"
            elif output_format.lower() == 'word':
                try:
                    # Try to use python-docx for enhanced formatting
                    try:
                        # Install python-docx in /tmp
                        subprocess.check_call(['pip', 'install', 'python-docx', '-t', '/tmp'])
                        sys.path.append('/tmp')
                        
                        # Import the enhanced Word generator
                        from enhanced_word_generator import create_enhanced_word_resume
                        
                        # Generate Word document with enhanced formatting
                        word_content = create_enhanced_word_resume(resume_json)
                        
                        output_extension = 'docx'
                        content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        is_binary = True
                        optimized_resume = word_content
                        
                        print("Successfully generated Word document using enhanced formatting")
                        
                    except Exception as enhanced_error:
                        print(f"Error using enhanced Word generator: {str(enhanced_error)}")
                        # Fall back to minimal Word generator
                        word_content = create_minimal_word_resume(resume_json)
                        
                        output_extension = 'docx'
                        content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        is_binary = True
                        optimized_resume = word_content
                        
                        print("Successfully generated Word document using minimal approach")
                    
                except Exception as word_error:
                    print(f"Error generating Word document: {str(word_error)}")
                    # Fall back to text format
                    text_resume = create_text_resume(resume_json)
                    output_extension = 'txt'
                    content_type = 'text/plain'
                    is_binary = False
                    optimized_resume = text_resume if text_resume else f"Failed to create resume. Error: {str(word_error)}"
            else:
                # Generate text format (default)
                text_resume = create_text_resume(resume_json)
                
                if text_resume:
                    output_extension = 'txt'
                    content_type = 'text/plain'
                    is_binary = False
                    optimized_resume = text_resume
                else:
                    # Fall back to raw JSON
                    output_extension = 'txt'
                    content_type = 'text/plain'
                    is_binary = False
                    optimized_resume = f"Failed to create formatted resume. Here's the raw response:\n\n{optimized_resume}"
            
        except Exception as e:
            print(f"Error parsing JSON response: {str(e)}")
            # Fall back to text format
            output_extension = 'txt'
            content_type = 'text/plain'
            is_binary = False
            optimized_resume = f"Failed to parse JSON response. Here's the raw response:\n\n{optimized_resume}"
        
        # Store the optimized resume
        optimized_key = f"users/{user_id}/optimized/{job_id}/resume.{output_extension}"
        
        if is_binary:
            # Store binary content directly
            s3.put_object(
                Bucket=bucket_name,
                Key=optimized_key,
                Body=optimized_resume,
                ContentType=content_type
            )
        else:
            # Store text content
            s3.put_object(
                Bucket=bucket_name,
                Key=optimized_key,
                Body=optimized_resume.encode('utf-8'),
                ContentType=content_type
            )
        
        # Also store a text version for preview (if we have the JSON data)
        preview_text = ""
        if 'resume_json' in locals() and resume_json:
            try:
                # Generate text preview that matches the exact AI-generated format
                preview_lines = []
                
                # Header - Full Name (prominently displayed)
                if resume_json.get('full_name'):
                    preview_lines.append(resume_json['full_name'].upper())
                    preview_lines.append("=" * len(resume_json['full_name']))
                    preview_lines.append("")
                
                # Contact Information
                if resume_json.get('contact_info'):
                    preview_lines.append(resume_json['contact_info'])
                    preview_lines.append("")
                
                # Professional Summary
                if resume_json.get('professional_summary'):
                    preview_lines.append("PROFESSIONAL SUMMARY")
                    preview_lines.append("=" * 20)
                    preview_lines.append(resume_json['professional_summary'])
                    preview_lines.append("")
                
                # Skills
                if resume_json.get('skills'):
                    preview_lines.append("CORE COMPETENCIES")
                    preview_lines.append("=" * 17)
                    skills_list = resume_json['skills']
                    if isinstance(skills_list, list):
                        # Display skills in a clean format, 3-4 per line
                        for i in range(0, len(skills_list), 4):
                            line_skills = skills_list[i:i+4]
                            preview_lines.append(" • ".join(line_skills))
                    else:
                        preview_lines.append(str(skills_list))
                    preview_lines.append("")
                
                # Professional Experience
                if resume_json.get('experience'):
                    preview_lines.append("PROFESSIONAL EXPERIENCE")
                    preview_lines.append("=" * 25)
                    preview_lines.append("")
                    
                    for i, exp in enumerate(resume_json['experience']):
                        # Job Title and Company
                        if exp.get('title') and exp.get('company'):
                            preview_lines.append(f"{exp['title']} | {exp['company']}")
                        elif exp.get('title'):
                            preview_lines.append(exp['title'])
                        
                        # Dates
                        if exp.get('dates'):
                            preview_lines.append(exp['dates'])
                        
                        preview_lines.append("")
                        
                        # Achievements (exactly as generated by AI)
                        if exp.get('achievements'):
                            for achievement in exp['achievements']:
                                preview_lines.append(f"• {achievement}")
                        
                        # Add spacing between positions (except for the last one)
                        if i < len(resume_json['experience']) - 1:
                            preview_lines.append("")
                            preview_lines.append("-" * 60)
                            preview_lines.append("")
                        else:
                            preview_lines.append("")
                
                # Education (exactly as preserved by AI)
                if resume_json.get('education'):
                    preview_lines.append("EDUCATION")
                    preview_lines.append("=" * 9)
                    preview_lines.append("")
                    
                    for edu in resume_json['education']:
                        # Degree and Institution
                        if edu.get('degree') and edu.get('institution'):
                            preview_lines.append(f"{edu['degree']} | {edu['institution']}")
                        elif edu.get('degree'):
                            preview_lines.append(edu['degree'])
                        elif edu.get('institution'):
                            preview_lines.append(edu['institution'])
                        
                        # Dates
                        if edu.get('dates'):
                            preview_lines.append(edu['dates'])
                        
                        # Details (if any were preserved from original)
                        if edu.get('details'):
                            preview_lines.append(edu['details'])
                        
                        preview_lines.append("")
                
                # Handle any additional sections that might be in the JSON
                # (The AI might include other sections based on the original resume)
                for key, value in resume_json.items():
                    if key not in ['full_name', 'contact_info', 'professional_summary', 'skills', 'experience', 'education']:
                        if value and isinstance(value, (list, str)):
                            section_title = key.replace('_', ' ').upper()
                            preview_lines.append(section_title)
                            preview_lines.append("=" * len(section_title))
                            
                            if isinstance(value, list):
                                for item in value:
                                    if isinstance(item, dict):
                                        # Handle complex objects
                                        for sub_key, sub_value in item.items():
                                            if sub_value:
                                                preview_lines.append(f"{sub_key.replace('_', ' ').title()}: {sub_value}")
                                    else:
                                        preview_lines.append(f"• {item}")
                            else:
                                preview_lines.append(str(value))
                            
                            preview_lines.append("")
                
                preview_text = "\n".join(preview_lines)
                
                # Store the text preview
                preview_key = f"users/{user_id}/optimized/{job_id}/preview.txt"
                s3.put_object(
                    Bucket=bucket_name,
                    Key=preview_key,
                    Body=preview_text.encode('utf-8'),
                    ContentType='text/plain'
                )
                
                print(f"Stored AI-format-matching text preview at {preview_key}")
                print(f"Preview text length: {len(preview_text)} characters")
                print(f"Resume JSON keys: {list(resume_json.keys())}")
                
            except Exception as e:
                print(f"Error generating text preview: {str(e)}")
                import traceback
                print(f"Full traceback: {traceback.format_exc()}")
                preview_text = "Preview generation failed. Please download the resume to view the complete content."
        
        # Generate pre-signed URL for download (valid for 1 hour)
        filename = f"optimized_resume.{output_extension}"
        
        try:
            optimized_url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': optimized_key,
                    'ResponseContentDisposition': f'attachment; filename="{filename}"',
                    'ResponseContentType': content_type
                },
                ExpiresIn=3600  # 1 hour
            )
        except Exception as e:
            print(f"Error generating presigned URL: {str(e)}")
            # Fallback to basic presigned URL without custom headers
            optimized_url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': optimized_key
                },
                ExpiresIn=3600
            )
        
        # Also generate a direct download URL for the frontend to use
        download_filename = f"optimized_resume_{job_id[:8]}.{output_extension}"
        
        # Generate cover letter if CV toggle is enabled
        cover_letter_text = None
        if generate_cv:
            try:
                print(f"CV toggle enabled: {generate_cv}")
                print(f"Company name key: {company_name_key}")
                print("Generating cover letter...")
                
                # Get company name from S3 if key is provided, otherwise use a default
                company_name = ""
                if company_name_key:
                    try:
                        company_name_obj = s3.get_object(Bucket=bucket_name, Key=company_name_key)
                        company_name = company_name_obj['Body'].read().decode('utf-8').strip()
                    except Exception as e:
                        print(f"Error retrieving company name from S3: {str(e)}")
                        company_name = "the company"  # Fallback
                else:
                    print("No company name key provided, using fallback")
                    company_name = "the company"  # Fallback when no company name is provided
                
                # Create cover letter prompt with your specified format
                job_desc_text = job_description if job_description and job_description.strip() else "No specific job description provided - focus on general qualifications for the role"
                
                # Get current date
                current_date = datetime.now().strftime("%B %d, %Y")
                
                cover_letter_prompt = f"""
                Create a professional cover letter using the provided information. You must research the company and provide actual, real information - NO PLACEHOLDERS allowed.

                IMPORTANT REQUIREMENTS:
                1. Use the ACTUAL current date: {current_date}
                2. Research {company_name} and find their real headquarters/main office address
                3. Extract the candidate's actual name, email, phone, and location from the resume
                4. Write specific content about how the candidate aligns with {company_name}'s mission, values, and goals
                5. NO placeholders like [Current Date], [Company Address], [X years], [Candidate Name], etc.
                6. Make it highly personalized to {company_name} and the {job_title} role

                Job Title: {job_title}
                Company: {company_name}
                Job Description: {job_desc_text}
                
                Resume Content: {create_text_resume(resume_json)[:2000] if 'resume_json' in locals() and resume_json else resume_text[:2000]}...

                Format the cover letter EXACTLY like this structure, but with REAL information:

                [CANDIDATE NAME FROM RESUME]
                [CANDIDATE EMAIL] | [CANDIDATE PHONE] | [CANDIDATE LOCATION] | LinkedIn

                {current_date}


                Hiring Manager
                {company_name}
                [RESEARCH AND PROVIDE ACTUAL COMPANY ADDRESS]
                [CITY, STATE ZIP CODE]

                Dear Hiring Manager,

                I am excited to apply for the {job_title} position at {company_name}. With [EXTRACT ACTUAL YEARS OF EXPERIENCE] years of experience as a [EXTRACT ACTUAL PROFESSIONAL TITLE FROM RESUME], I am confident that I have the skills and expertise to make a significant contribution to your team.

                [Write a compelling paragraph highlighting the candidate's most relevant experience and achievements from their resume that directly match the job requirements. Use specific examples and quantifiable results.]

                [Write a second paragraph demonstrating specific skills and accomplishments that align with the job description. Include how the candidate's experience relates to {company_name}'s industry, products, or services. Research {company_name}'s mission and explain how the candidate's values and experience align with the company's goals.]

                Your posting for the {job_title} role aligns perfectly with my background and passion for [EXTRACT RELEVANT FIELD FROM RESUME]. I am particularly drawn to {company_name}'s [RESEARCH AND MENTION SPECIFIC COMPANY VALUES, MISSION, OR RECENT INITIATIVES]. I am excited about the opportunity to leverage my skills in [EXTRACT RELEVANT SKILLS FROM RESUME THAT MATCH JOB DESCRIPTION] to drive impactful solutions at {company_name}.

                Thank you for considering my application. I welcome the opportunity to discuss my qualifications further and learn more about this exciting position. I look forward to hearing from you.

                Regards,
                [CANDIDATE NAME FROM RESUME]

                CRITICAL INSTRUCTIONS:
                1. Replace ALL bracketed placeholders with actual information
                2. Research {company_name} to get real company address and information about their mission/values
                3. Extract candidate's actual details from the resume provided
                4. Write specific, personalized content - no generic statements
                5. Make the cover letter highly relevant to both the role and the company
                6. Ensure professional formatting and tone throughout
                """
                
                # Generate cover letter using the same AI model
                cover_letter_response, _ = call_bedrock_with_fallback(cover_letter_prompt)
                cover_letter_text = cover_letter_response.strip()
                
                print(f"Cover letter generated successfully (length: {len(cover_letter_text)})")
                
                # Generate cover letter file and upload to S3
                cover_letter_url = None
                cover_letter_filename = None
                try:
                    print("Starting cover letter file creation...")
                    
                    # Create cover letter content based on cover letter format FIRST
                    if cover_letter_format == 'word':
                        print("Creating Word document for cover letter...")
                        # Create cover letter Word document
                        cover_letter_buffer = create_cover_letter_word_document(cover_letter_text)
                        cover_letter_content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        cover_letter_extension = 'docx'
                        print(f"Word document created, buffer size: {len(cover_letter_buffer.getvalue())} bytes")
                    elif cover_letter_format == 'pdf':
                        print("Creating PDF document for cover letter...")
                        # For PDF, we'll use the same approach as the resume
                        from pdf_generator import create_pdf_from_text
                        cover_letter_buffer = create_pdf_from_text(cover_letter_text, f"Cover Letter - {job_title}")
                        cover_letter_content_type = 'application/pdf'
                        cover_letter_extension = 'pdf'
                        print(f"PDF document created, buffer size: {len(cover_letter_buffer.getvalue())} bytes")
                    else:  # text format
                        print("Creating text file for cover letter...")
                        import io
                        cover_letter_buffer = io.BytesIO(cover_letter_text.encode('utf-8'))
                        cover_letter_content_type = 'text/plain'
                        cover_letter_extension = 'txt'
                        print(f"Text file created, buffer size: {len(cover_letter_buffer.getvalue())} bytes")
                    
                    # Now create filenames using the CORRECT cover letter extension
                    cover_letter_filename = f"cover_letter_{job_id}.{cover_letter_extension}"
                    cover_letter_key = f"users/{user_id}/results/{job_id}/{cover_letter_filename}"
                    
                    print(f"Cover letter key: {cover_letter_key}")
                    print(f"Cover letter filename: {cover_letter_filename}")
                    print(f"Resume format: {output_format}, Cover letter format: {cover_letter_format}")
                    print(f"Cover letter extension: {cover_letter_extension}")
                    print(f"Cover letter content type: {cover_letter_content_type}")
                    
                    print("Uploading cover letter to S3...")
                    # Upload cover letter to S3
                    s3.put_object(
                        Bucket=bucket_name,
                        Key=cover_letter_key,
                        Body=cover_letter_buffer.getvalue(),
                        ContentType=cover_letter_content_type
                    )
                    s3.put_object(
                        Bucket=bucket_name,
                        Key=cover_letter_key,
                        Body=cover_letter_buffer.getvalue(),
                        ContentType=content_type
                    )
                    print("Cover letter uploaded to S3 successfully")
                    
                    print("Generating pre-signed URL...")
                    # Generate pre-signed URL for cover letter download
                    cover_letter_url = s3.generate_presigned_url(
                        'get_object',
                        Params={
                            'Bucket': bucket_name,
                            'Key': cover_letter_key,
                            'ResponseContentDisposition': f'attachment; filename="{cover_letter_filename}"',
                            'ResponseContentType': cover_letter_content_type
                        },
                        ExpiresIn=3600  # 1 hour
                    )
                    
                    print(f"Cover letter uploaded to S3 and download URL generated: {cover_letter_url[:50]}...")
                    
                except Exception as e:
                    print(f"Error creating cover letter file: {str(e)}")
                    print(f"Error type: {type(e).__name__}")
                    import traceback
                    print(f"Full traceback: {traceback.format_exc()}")
                    # Continue without cover letter file if generation fails
                    cover_letter_url = None
                    cover_letter_filename = None
                
            except Exception as e:
                print(f"Error generating cover letter: {str(e)}")
                # Continue without cover letter if generation fails
                cover_letter_text = None
        
        # Record in DynamoDB
        if table_name:
            table = dynamodb.Table(table_name)
            try:
                table.put_item(
                    Item={
                        'userId': user_id,
                        'jobId': job_id,
                        'timestamp': datetime.now().isoformat(),
                        'originalResumeKey': resume_key,
                        'jobDescriptionKey': job_desc_key,
                        'optimizedResumeKey': optimized_key
                    }
                )
            except Exception as e:
                print(f"Error recording to DynamoDB: {str(e)}")
                # Continue even if DynamoDB recording fails
        
        # Update status to completed
        skills_summary = ""
        if skills_processing_result:
            new_skills = skills_processing_result.get('new_skills_added', 0)
            updated_skills = skills_processing_result.get('existing_skills_updated', 0)
            if new_skills > 0 or updated_skills > 0:
                skills_summary = f" | Skills: +{new_skills} new, {updated_skills} updated"
        
        completion_message = f'Resume optimization complete using {model_used}{skills_summary}'
        
        # Prepare additional data for status update
        additional_data = {
            'optimizedResumeUrl': optimized_url,
            'fileType': output_extension,
            'contentType': content_type,
            'downloadFilename': download_filename,
            'aiModel': model_used,
            'skillsProcessing': skills_processing_result,
            'previewText': preview_text if 'preview_text' in locals() else None,
            'originalText': formatted_original_text if 'formatted_original_text' in locals() else (resume_text if 'resume_text' in locals() else None),
            'coverLetterText': cover_letter_text if 'cover_letter_text' in locals() and cover_letter_text else None,
            'coverLetterUrl': cover_letter_url if 'cover_letter_url' in locals() and cover_letter_url else None,
            'coverLetterFilename': cover_letter_filename if 'cover_letter_filename' in locals() and cover_letter_filename else None
        }
        
        print(f"Final status update data - Cover letter URL: {additional_data['coverLetterUrl']}")
        print(f"Final status update data - Cover letter filename: {additional_data['coverLetterFilename']}")
        
        update_job_status(bucket_name, status_key, 'COMPLETED', completion_message, additional_data)
        
        return {
            'optimizedResumeUrl': optimized_url,
            'jobId': job_id,
            'fileType': output_extension,
            'contentType': content_type,
            'downloadFilename': download_filename
        }
    except Exception as e:
        print(f"Error in AI Handler: {str(e)}")
        
        # Update status to failed
        if status_key:
            update_job_status(bucket_name, status_key, 'FAILED', f'Error: {str(e)}')
            
        return {
            'error': str(e)
        }
