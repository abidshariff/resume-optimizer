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
from datetime import datetime
from minimal_word_generator import create_minimal_word_resume

# AI Model Configuration - Models are tried in order of preference
AI_MODELS = [
    {
        'id': 'anthropic.claude-sonnet-4-20250514-v1:0',
        'name': 'Claude Sonnet 4',
        'max_tokens': 4000,
        'description': 'Latest and most capable Claude model'
    },
    {
        'id': 'anthropic.claude-3-7-sonnet-20250219-v1:0', 
        'name': 'Claude 3.7 Sonnet',
        'max_tokens': 4000,
        'description': 'Enhanced Claude 3 model with improved capabilities'
    },
    {
        'id': 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        'name': 'Claude 3.5 Sonnet', 
        'max_tokens': 4000,
        'description': 'Reliable Claude 3.5 model with good performance'
    }
]

s3 = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
bucket_name = os.environ.get('STORAGE_BUCKET')
table_name = os.environ.get('USER_HISTORY_TABLE')

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://main.d3tjpmlvy19b2l.amplifyapp.com',
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
        status_key = event.get('statusKey')
        output_format = event.get('outputFormat', 'text')  # 'text', 'word', 'docx', or 'pdf'
        
        # Map frontend format names to backend format names
        format_mapping = {
            'docx': 'word',
            'txt': 'text',
            'pdf': 'pdf'
        }
        output_format = format_mapping.get(output_format, output_format)
        
        # Validate inputs
        if not job_id or not resume_key or not job_desc_key or not status_key:
            error_msg = 'Missing required parameters'
            if status_key:
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
            return {
                'error': error_msg,
                'headers': CORS_HEADERS
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
            
            # Check if we got a valid extraction or an error message
            if resume_text.startswith("Unfortunately") or resume_text.startswith("Error") or resume_text.startswith("Unable"):
                print("Text extraction failed with error message")
                update_job_status(bucket_name, status_key, 'FAILED', resume_text)
                return {
                    'error': resume_text,
                    'headers': CORS_HEADERS
                }
            
            # Verify we have enough text to process
            if len(resume_text.strip()) < 50:  # Arbitrary minimum length
                error_msg = f"The extracted text from your resume is too short ({len(resume_text.strip())} characters). Please check the file format and try again."
                print("Extracted text too short, likely failed extraction")
                update_job_status(bucket_name, status_key, 'FAILED', error_msg)
                return {
                    'error': error_msg,
                    'headers': CORS_HEADERS
                }
            
            # Get job description
            job_desc_obj = s3.get_object(Bucket=bucket_name, Key=job_desc_key)
            job_description = job_desc_obj['Body'].read().decode('utf-8')
        except Exception as e:
            error_msg = f'Error retrieving or processing files: {str(e)}'
            print(f"Error retrieving or processing files from S3: {str(e)}")
            update_job_status(bucket_name, status_key, 'FAILED', error_msg)
            return {
                'error': error_msg,
                'headers': CORS_HEADERS
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

        # Analyze original resume structure for content preservation
        def analyze_resume_structure(resume_text):
            """Analyze the original resume to understand its structure and content density."""
            lines = resume_text.split('\n')
            bullet_points = [line for line in lines if line.strip().startswith('•') or line.strip().startswith('-') or line.strip().startswith('*')]
            
            # Estimate number of experience sections
            experience_indicators = ['experience', 'work history', 'employment', 'professional background']
            education_indicators = ['education', 'academic', 'degree', 'university', 'college']
            
            experience_sections = 0
            for line in lines:
                line_lower = line.lower()
                if any(indicator in line_lower for indicator in experience_indicators):
                    experience_sections += 1
            
            return {
                'total_lines': len(lines),
                'bullet_points': len(bullet_points),
                'estimated_experience_sections': max(1, experience_sections),
                'avg_bullets_per_section': len(bullet_points) // max(1, experience_sections) if experience_sections > 0 else len(bullet_points)
            }
        
        original_structure = analyze_resume_structure(resume_text)
        print(f"Original resume structure: {original_structure}")

        # Extract key information from job description for targeted optimization
        def extract_job_keywords(job_desc):
            """Extract key technical skills, tools, and requirements from job description"""
            # Common technical keywords to look for
            tech_patterns = [
                'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
                'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API',
                'GraphQL', 'TypeScript', 'Vue.js', 'Angular', 'Spring', 'Django', 'Flask',
                'Microservices', 'DevOps', 'Jenkins', 'Terraform', 'Linux', 'Machine Learning',
                'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Spark', 'Hadoop'
            ]
            
            found_keywords = []
            job_lower = job_desc.lower()
            
            for keyword in tech_patterns:
                if keyword.lower() in job_lower:
                    found_keywords.append(keyword)
            
            return found_keywords

        job_keywords = extract_job_keywords(job_description)
        print(f"Extracted job keywords: {job_keywords}")

        # Prepare enhanced prompt for Bedrock with aggressive optimization
        prompt = f"""
        You are an expert ATS resume optimizer and career consultant. Your mission is to COMPLETELY TRANSFORM the provided resume to perfectly match the job description while maintaining truthfulness about the candidate's background.

        ORIGINAL RESUME:
        {resume_text}

        TARGET JOB DESCRIPTION:
        {job_description}

        EXTRACTED KEY TECHNOLOGIES/SKILLS FROM JOB: {', '.join(job_keywords) if job_keywords else 'General skills optimization'}

        ORIGINAL RESUME LENGTH: Approximately {original_page_count} page(s)
        ORIGINAL RESUME STRUCTURE: {original_structure['total_lines']} lines, {original_structure['bullet_points']} bullet points, estimated {original_structure['estimated_experience_sections']} experience sections

        CRITICAL OPTIMIZATION REQUIREMENTS:

        1. **AGGRESSIVE KEYWORD INTEGRATION**: 
           - Identify ALL technical skills, tools, frameworks, and buzzwords from the job description
           - Integrate these keywords naturally throughout the resume, especially in experience bullets
           - If the candidate has ANY related experience, reframe it using job description terminology
           - Add relevant keywords to skills section even if not explicitly mentioned in original resume (but candidate likely has exposure)

        2. **COMPLETE EXPERIENCE TRANSFORMATION**:
           - REWRITE every single bullet point to align with job requirements
           - Transform generic accomplishments into role-specific achievements
           - Use action verbs and terminology that match the job description exactly
           - Quantify achievements wherever possible, even if you need to reframe existing numbers
           - Focus on impact and results that matter for this specific role

        3. **STRATEGIC SKILL ENHANCEMENT**:
           - Add technical skills from job description that the candidate likely has but didn't mention
           - Reorganize skills to prioritize job-relevant technologies
           - Include both hard and soft skills mentioned in job posting
           - Use exact terminology from job description (e.g., if job says "React.js", use "React.js" not "React")

        4. **PROFESSIONAL SUMMARY OVERHAUL**:
           - Completely rewrite to sound like the perfect candidate for this specific role
           - Include years of experience in relevant areas
           - Mention key technologies and methodologies from job description
           - Highlight leadership/collaboration aspects if mentioned in job posting

        5. **CONTENT PRESERVATION AND PRIORITIZATION**:
           - {length_guidance}
           - **PRESERVE ALL EXPERIENCE ENTRIES** from the original resume
           - **PRESERVE ALL BULLET POINTS** for each job - do not reduce the number
           - **MAINTAIN THE SAME LEVEL OF DETAIL** as the original resume
           - Only reorder experiences if it significantly improves relevance to the job
           - Transform and enhance existing content rather than removing it

        6. **ATS OPTIMIZATION**:
           - Use exact phrases from job description where appropriate
           - Include industry-standard terminology
           - Ensure keyword density is high but natural
           - Format for maximum ATS compatibility

        7. **EDUCATION PRESERVATION**:
           - **DO NOT MODIFY THE EDUCATION SECTION**
           - Keep all education entries exactly as they appear in the original resume
           - Do not add coursework, projects, or details that weren't in the original
           - Preserve original degree names, institution names, dates, and any existing details

        TRANSFORMATION EXAMPLES (PRESERVE ALL ORIGINAL POINTS):
        - Original: "Developed web applications" → "Built responsive React.js applications with Node.js backend and AWS deployment"
        - Original: "Worked with databases" → "Designed and optimized PostgreSQL databases, implemented complex queries for data analytics"
        - Original: "Team collaboration" → "Led cross-functional Agile teams using Scrum methodology, facilitated daily standups and sprint planning"
        - **IMPORTANT**: If original has 6 bullet points, output must have 6 bullet points (enhanced, not removed)

        OUTPUT FORMAT:
        Provide your response in the following JSON structure:

        ```json
        {{
          "full_name": "Full Name from Resume",
          "contact_info": "Email | Phone | LinkedIn | Location",
          "professional_summary": "2-3 sentences that make this candidate sound perfect for the target role, incorporating key job requirements and technologies (under 100 words)",
          "skills": [
            "Include ALL relevant technical skills from job description",
            "Prioritize job-mentioned technologies first",
            "Add related skills candidate likely has",
            "Use exact terminology from job posting",
            "Maximum 15 skills total, most relevant first"
          ],
          "experience": [
            {{
              "title": "Job Title (enhanced if needed to sound more relevant)",
              "company": "Company Name",
              "dates": "Start Date - End Date",
              "achievements": [
                "COMPLETELY rewritten bullet focusing on job-relevant impact with specific technologies/methodologies",
                "Quantified achievement using job description terminology and relevant metrics",
                "Another transformed bullet that showcases skills mentioned in job posting",
                "PRESERVE ALL ORIGINAL BULLET POINTS - if original has 6 bullets, output must have 6 bullets",
                "Each bullet should be 1-2 lines, highly targeted to job requirements",
                "Transform existing content rather than removing it"
              ]
            }}
          ],
          "education": [
            {{
              "degree": "EXACT degree name from original resume - DO NOT CHANGE",
              "institution": "EXACT institution name from original resume - DO NOT CHANGE", 
              "dates": "EXACT dates from original resume - DO NOT CHANGE",
              "details": "EXACT details from original resume if any existed - DO NOT ADD NEW CONTENT"
            }}
          ]
        }}
        ```

        **CRITICAL SUCCESS CRITERIA**:
        - **PRESERVE ALL ORIGINAL CONTENT**: Same number of jobs, same number of bullet points per job
        - Every bullet point should feel like it was written specifically for this job
        - Resume should contain 80%+ of the technical keywords from job description
        - Candidate should sound like the ideal fit based on resume content
        - Maintain truthfulness - enhance and reframe, don't fabricate experiences
        - Final resume should be significantly different from original while staying factual and complete
        - **EDUCATION SECTION MUST REMAIN COMPLETELY UNCHANGED FROM ORIGINAL**
        - **NO CONTENT SHOULD BE LOST** - only enhanced and optimized

        **REMEMBER**: This is not just editing - this is a complete strategic transformation to make this candidate irresistible for this specific role. However, the education section should be preserved exactly as it appears in the original resume.

        Return ONLY the JSON structure with the completely optimized resume content. No explanations or notes.
        """
        
        # Call Amazon Bedrock with automatic model fallback
        def call_bedrock_with_fallback(prompt):
            """
            Call Bedrock with automatic model fallback.
            Uses the AI_MODELS configuration defined at the top of the file.
            """
            
            print(f"Starting AI model fallback with {len(AI_MODELS)} models configured")
            last_error = None
            
            # Try each model in order
            for i, model in enumerate(AI_MODELS):
                try:
                    print(f"Attempting to use {model['name']} (model {i+1}/{len(AI_MODELS)})")
                    print(f"  Model ID: {model['id']}")
                    print(f"  Description: {model['description']}")
                    
                    response = bedrock_runtime.invoke_model(
                        modelId=model['id'],
                        body=json.dumps({
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
                        })
                    )
                    
                    # Parse the response
                    response_body = json.loads(response['body'].read())
                    optimized_resume = response_body['content'][0]['text']
                    
                    if optimized_resume and len(optimized_resume.strip()) > 100:
                        print(f"✅ Successfully used {model['name']}")
                        print(f"Response length: {len(optimized_resume)} characters")
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
                        "ModelErrorException"
                    ]
                    
                    if any(error_type in error_msg for error_type in recoverable_errors):
                        print(f"   → Recoverable error with {model['name']}, trying next model...")
                        continue
                    else:
                        print(f"   → Unexpected error with {model['name']}: {error_msg}")
                        continue
            
            # If all models failed, raise the last error
            print(f"❌ All {len(AI_MODELS)} models failed. Last error: {last_error}")
            raise Exception(f"All Bedrock models failed. Last error: {str(last_error)}")
        
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
      "company": "Resume Optimizer",
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
      "institution": "Resume Optimizer Service",
      "dates": "Current",
      "details": "All AI models are currently experiencing issues. This is a temporary service disruption."
    }}
  ]
}}
```"""
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
            if output_format.lower() == 'pdf':
                try:
                    # Try to use reportlab for PDF generation
                    try:
                        # Install reportlab in /tmp
                        subprocess.check_call(['pip', 'install', 'reportlab', '-t', '/tmp'])
                        sys.path.append('/tmp')
                        
                        # Import the PDF generator
                        from pdf_generator import create_pdf_resume
                        
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
        completion_message = f'Resume optimization complete using {model_used}'
        update_job_status(bucket_name, status_key, 'COMPLETED', completion_message, {
            'optimizedResumeUrl': optimized_url,
            'fileType': output_extension,
            'contentType': content_type,
            'downloadFilename': download_filename,
            'aiModel': model_used
        })
        
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
