"""
Word document generation using docxtpl for resume optimization.
"""

import io
import boto3
from docxtpl import DocxTemplate

def create_word_resume(resume_json, template_bucket, template_key):
    """
    Generate a Word document resume from JSON data using docxtpl template.
    
    Args:
        resume_json (dict): Parsed resume data with structure:
            - full_name (str)
            - contact_info (str)
            - professional_summary (str)
            - skills (list)
            - experience (list): Each item has title, company, dates, responsibilities
            - education (list): Each item has degree, institution, dates
        template_bucket (str): S3 bucket containing the template
        template_key (str): S3 key for the template file
    
    Returns:
        bytes: Generated Word document as bytes
    """
    
    try:
        # Download template from S3
        s3 = boto3.client('s3')
        template_obj = s3.get_object(Bucket=template_bucket, Key=template_key)
        template_content = template_obj['Body'].read()
        
        # Load template with docxtpl
        template_stream = io.BytesIO(template_content)
        doc = DocxTemplate(template_stream)
        
        # Prepare context data for template
        context = {
            'full_name': resume_json.get('full_name', 'Your Name'),
            'contact_info': resume_json.get('contact_info', 'Your Contact Information'),
            'professional_summary': resume_json.get('professional_summary', 'Professional summary not available'),
            'skills': resume_json.get('skills', []),
            'experience': resume_json.get('experience', []),
            'education': resume_json.get('education', [])
        }
        
        # Ensure experience items have required fields
        for job in context['experience']:
            if 'responsibilities' not in job:
                job['responsibilities'] = []
            # Convert responsibilities to list if it's a string
            if isinstance(job.get('responsibilities'), str):
                job['responsibilities'] = [job['responsibilities']]
        
        # Ensure education items have required fields
        for edu in context['education']:
            if 'degree' not in edu:
                edu['degree'] = 'Degree'
            if 'institution' not in edu:
                edu['institution'] = 'Institution'
            if 'dates' not in edu:
                edu['dates'] = 'Dates'
        
        print(f"Rendering Word document with context: {context}")
        
        # Render the document
        doc.render(context)
        
        # Save to bytes
        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)
        
        return output_stream.getvalue()
        
    except Exception as e:
        print(f"Error generating Word document: {str(e)}")
        raise e

def upload_template_to_s3(template_path, bucket_name, template_key):
    """
    Upload the Word template to S3.
    
    Args:
        template_path (str): Local path to the template file
        bucket_name (str): S3 bucket name
        template_key (str): S3 key for the template
    """
    try:
        s3 = boto3.client('s3')
        
        with open(template_path, 'rb') as template_file:
            s3.put_object(
                Bucket=bucket_name,
                Key=template_key,
                Body=template_file.read(),
                ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        
        print(f"Template uploaded to s3://{bucket_name}/{template_key}")
        
    except Exception as e:
        print(f"Error uploading template to S3: {str(e)}")
        raise e
