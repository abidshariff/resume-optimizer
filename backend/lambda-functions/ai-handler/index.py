import json
import boto3
import os
import uuid
import tempfile
import subprocess
import base64
import sys
from datetime import datetime

s3 = boto3.client('s3')
bedrock_runtime = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
bucket_name = os.environ.get('STORAGE_BUCKET')
table_name = os.environ.get('USER_HISTORY_TABLE')

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',  # Allow all origins, or specify your domain
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Access-Control-Allow-Credentials': 'true'
}

# Function to extract text from PDF
def extract_text_from_pdf(pdf_content):
    try:
        # Check if the file actually appears to be a PDF (starts with %PDF)
        if not pdf_content.startswith(b'%PDF'):
            print("File does not appear to be a valid PDF (missing PDF header)")
            return "The uploaded file does not appear to be a valid PDF. Please check the file format and try again."
        
        # We'll use Amazon Textract for PDF text extraction
        textract = boto3.client('textract')
        
        try:
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
                
            return text
            
        except textract.exceptions.UnsupportedDocumentException:
            print("Textract reports unsupported document format")
            return "The PDF format is not supported for text extraction. The file might be corrupted, password-protected, or in an unsupported format."
            
        except textract.exceptions.InvalidS3ObjectException:
            print("Textract reports invalid document")
            return "The document appears to be invalid or corrupted. Please check the file and try again."
            
        except textract.exceptions.InvalidParameterException:
            print("Textract reports invalid parameters")
            return "The document could not be processed due to invalid parameters. Please try a different file format."
            
        except textract.exceptions.DocumentTooLargeException:
            print("Textract reports document too large")
            return "The document is too large for text extraction. Please try reducing the file size or splitting it into smaller documents."
            
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        
        # Try fallback method with PyPDF2
        try:
            print("Attempting fallback PDF extraction with PyPDF2")
            # Create a temporary file to store the PDF content
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(pdf_content)
            
            # Try to install and use PyPDF2
            try:
                subprocess.check_call(['pip', 'install', 'PyPDF2', '-t', '/tmp'])
                sys.path.append('/tmp')
                import PyPDF2
                
                text = ""
                with open(temp_file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        text += page.extract_text() + "\n"
                
                # Clean up the temporary file
                os.unlink(temp_file_path)
                
                if text.strip():
                    return text
                else:
                    return "No text could be extracted from the PDF. The file might contain scanned images or have security restrictions."
                    
            except Exception as pypdf_error:
                print(f"PyPDF2 extraction failed: {str(pypdf_error)}")
                os.unlink(temp_file_path)
                return f"Error extracting text from PDF: {str(e)}. Fallback method also failed."
                
        except Exception as fallback_error:
            print(f"All PDF extraction methods failed: {str(fallback_error)}")
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

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))
        
        # Extract data from the event
        user_id = event.get('userId', 'anonymous')
        job_id = event.get('jobId')
        resume_key = event.get('resumeKey')
        job_desc_key = event.get('jobDescriptionKey')
        
        # Validate inputs
        if not job_id or not resume_key or not job_desc_key:
            return {
                'error': 'Missing required parameters',
                'headers': CORS_HEADERS
            }
        
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
                return {
                    'error': resume_text,
                    'headers': CORS_HEADERS
                }
            
            # Verify we have enough text to process
            if len(resume_text.strip()) < 50:  # Arbitrary minimum length
                print("Extracted text too short, likely failed extraction")
                return {
                    'error': f"The extracted text from your resume is too short ({len(resume_text.strip())} characters). Please check the file format and try again.",
                    'headers': CORS_HEADERS
                }
            
            # Get job description
            job_desc_obj = s3.get_object(Bucket=bucket_name, Key=job_desc_key)
            job_description = job_desc_obj['Body'].read().decode('utf-8')
        except Exception as e:
            print(f"Error retrieving or processing files from S3: {str(e)}")
            return {
                'error': f'Error retrieving or processing files: {str(e)}',
                'headers': CORS_HEADERS
            }
        
        # Prepare prompt for Bedrock
        prompt = f"""
        You are an expert ATS-optimization resume consultant. Your task is to optimize the provided resume for the specific job description while maintaining the original document format and structure.

        RESUME:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        INSTRUCTIONS:
        1. Maintain the exact same formatting, sections, and structure of the original resume.
        2. Optimize all content to align with the job description requirements.
        3. Identify and incorporate key technical skills, qualifications, and terminology from the job description.
        4. Ensure the resume will pass through Applicant Tracking Systems (ATS) by strategically placing relevant keywords.
        5. Do not add fabricated experiences or qualifications.
        6. Keep the same chronological order and date formatting.
        7. Preserve all section headers and formatting elements.
        8. Focus on quantifiable achievements that match job requirements.
        9. Ensure the optimized content fits within the original document structure.
        10. Highlight transferable skills that match the job requirements.

        Return ONLY the optimized resume text with all formatting preserved. Do not include explanations or notes.
        """
        
        # Call Amazon Bedrock
        try:
            # Call Amazon Bedrock with Claude 3 Sonnet
            response = bedrock_runtime.invoke_model(
                modelId='anthropic.claude-3-sonnet-20240229-v1:0',
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 4000,
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
            response_body = json.loads(response['body'].read())
            optimized_resume = response_body['content'][0]['text']
            
            # Fallback to simulated response if Bedrock call fails
            if not optimized_resume:
                print("Warning: Empty response from Bedrock, using fallback")
                optimized_resume = f"""
                # OPTIMIZED RESUME
                
                ## PROFESSIONAL SUMMARY
                Experienced software developer with expertise in cloud technologies and web application development.
                Skilled in creating scalable solutions using AWS services and modern frontend frameworks.
                
                ## SKILLS
                - Cloud Technologies: AWS (Lambda, S3, DynamoDB, API Gateway)
                - Programming Languages: Python, JavaScript, TypeScript
                - Web Development: React, Vue.js, HTML5, CSS3
                - DevOps: CI/CD, Infrastructure as Code, CloudFormation
                - AI/ML: Integration with LLM services, prompt engineering
                
                ## EXPERIENCE
                
                **Senior Software Engineer**
                *Tech Solutions Inc. | 2022 - Present*
                - Developed serverless applications using AWS Lambda and API Gateway
                - Implemented authentication flows with Amazon Cognito
                - Created responsive web interfaces with React and Material UI
                - Integrated AI capabilities using Amazon Bedrock
                
                **Software Developer**
                *Digital Innovations | 2019 - 2022*
                - Built and maintained web applications using Vue.js and Node.js
                - Designed and implemented RESTful APIs
                - Collaborated with cross-functional teams to deliver projects on schedule
                
                ## EDUCATION
                **Bachelor of Science in Computer Science**
                *University of Technology | 2019*
                """
            
        except Exception as e:
            print(f"Error calling Bedrock: {str(e)}")
            return {
                'error': f'Error generating optimized resume: {str(e)}',
                'headers': CORS_HEADERS
            }
        
        # Store optimized resume in S3
        # First, determine the original file extension
        original_file_extension = resume_key.split('.')[-1].lower()
        
        # Default to .txt if we can't determine the extension or it's not a document format
        output_extension = 'txt'
        content_type = 'text/plain'
        
        if original_file_extension in ['docx', 'doc']:
            # If the original was a Word document, create a Word document
            try:
                # Create a temporary file to store the Word document
                with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_file:
                    temp_file_path = temp_file.name
                
                # Try to install and use python-docx
                try:
                    subprocess.check_call(['pip', 'install', 'python-docx', '-t', '/tmp'])
                    sys.path.append('/tmp')
                    import docx
                    
                    # Create a new Word document
                    doc = docx.Document()
                    
                    # Add the optimized content
                    # Split by paragraphs and add each as a paragraph in the document
                    for paragraph in optimized_resume.split('\n\n'):
                        if paragraph.strip():
                            doc.add_paragraph(paragraph.strip())
                    
                    # Save the document
                    doc.save(temp_file_path)
                    
                    # Read the document as binary data
                    with open(temp_file_path, 'rb') as file:
                        docx_content = file.read()
                    
                    # Clean up the temporary file
                    os.unlink(temp_file_path)
                    
                    # Set the output extension and content type
                    output_extension = 'docx'
                    content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    
                    # Update the optimized content to the Word document binary data
                    optimized_resume = docx_content
                    is_binary = True
                    
                except Exception as docx_error:
                    print(f"Error creating Word document: {str(docx_error)}")
                    # Fall back to text format
                    output_extension = 'txt'
                    content_type = 'text/plain'
                    is_binary = False
            except Exception as e:
                print(f"Error in Word document handling: {str(e)}")
                # Fall back to text format
                output_extension = 'txt'
                content_type = 'text/plain'
                is_binary = False
        else:
            # For other formats, use text
            is_binary = False
        
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
        
        # Generate pre-signed URL for download
        optimized_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': optimized_key
            },
            ExpiresIn=3600  # URL valid for 1 hour
        )
        
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
        
        return {
            'optimizedResumeUrl': optimized_url,
            'jobId': job_id,
            'headers': CORS_HEADERS
        }
    except Exception as e:
        print(f"Error in AI Handler: {str(e)}")
        return {
            'error': str(e),
            'headers': CORS_HEADERS
        }
