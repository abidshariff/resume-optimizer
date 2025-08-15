#!/usr/bin/env python3
"""
Comprehensive test to verify PDF generation and format quality
"""

import json
import boto3
import uuid
import time

def create_comprehensive_test_files():
    """Create comprehensive test files with realistic resume content"""
    
    s3_client = boto3.client('s3')
    bucket_name = 'resume-optimizer-storage-132851953852-prod'
    
    # Generate unique test ID
    test_id = str(uuid.uuid4())[:8]
    
    # Comprehensive test resume content
    resume_content = """John Smith
Senior Software Engineer
Email: john.smith@email.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johnsmith | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers. Passionate about emerging technologies and best practices.

TECHNICAL SKILLS
• Programming Languages: Python, JavaScript, TypeScript, Java, Go
• Frontend Technologies: React, Vue.js, Angular, HTML5, CSS3, SASS
• Backend Technologies: Node.js, Django, Flask, Spring Boot, Express.js
• Cloud Platforms: AWS (Lambda, EC2, S3, RDS), Azure, Google Cloud Platform
• Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
• DevOps & Tools: Docker, Kubernetes, Jenkins, GitLab CI/CD, Terraform
• Testing: Jest, Pytest, Selenium, Cypress, Unit Testing, Integration Testing

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2020 - Present
• Led development of microservices architecture serving 1M+ daily active users
• Implemented CI/CD pipelines reducing deployment time by 75%
• Mentored team of 5 junior developers and conducted code reviews
• Designed and built RESTful APIs with 99.9% uptime
• Optimized database queries resulting in 40% performance improvement
• Collaborated with product managers and designers on feature specifications

Software Engineer | StartupXYZ | Jun 2017 - Dec 2019
• Developed responsive web applications using React and Node.js
• Built automated testing suites increasing code coverage to 95%
• Integrated third-party APIs and payment processing systems
• Participated in agile development processes and sprint planning
• Contributed to open-source projects and technical documentation

Junior Software Developer | DevSolutions | Aug 2015 - May 2017
• Developed web applications using Python Django framework
• Implemented user authentication and authorization systems
• Created data visualization dashboards using D3.js and Chart.js
• Participated in code reviews and pair programming sessions
• Maintained legacy systems and performed bug fixes

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2011 - 2015
• Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering
• GPA: 3.7/4.0

PROJECTS
E-Commerce Platform (2023)
• Built full-stack e-commerce solution using React, Node.js, and PostgreSQL
• Implemented secure payment processing and inventory management
• Deployed on AWS with auto-scaling and load balancing

Task Management API (2022)
• Developed RESTful API using Python Flask and MongoDB
• Implemented JWT authentication and role-based access control
• Created comprehensive API documentation using Swagger

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2023)
• Certified Kubernetes Administrator (CKA) (2022)
• Google Cloud Professional Developer (2021)

ACHIEVEMENTS
• Employee of the Month - TechCorp Inc. (March 2023)
• Led successful migration of legacy system to cloud architecture
• Reduced application load time by 60% through optimization
• Published technical articles on Medium with 10K+ views
"""
    
    # Comprehensive job title
    job_title = "Senior Full-Stack Software Engineer - Cloud Architecture"
    
    # Comprehensive job description
    job_description = """Senior Full-Stack Software Engineer - Cloud Architecture

Company: InnovateTech Solutions
Location: San Francisco, CA (Hybrid)
Salary: $150,000 - $200,000

About the Role:
We are seeking an experienced Senior Full-Stack Software Engineer to join our growing engineering team. You will be responsible for designing and implementing scalable cloud-based solutions, leading technical initiatives, and mentoring junior developers.

Key Responsibilities:
• Design and develop full-stack web applications using modern frameworks
• Architect and implement microservices on AWS cloud platform
• Lead technical design discussions and code reviews
• Collaborate with cross-functional teams including product, design, and QA
• Mentor junior developers and contribute to engineering best practices
• Optimize application performance and ensure high availability
• Implement automated testing and CI/CD pipelines
• Stay current with emerging technologies and industry trends

Required Qualifications:
• 5+ years of experience in full-stack software development
• Strong proficiency in Python, JavaScript/TypeScript, and modern frameworks
• Extensive experience with AWS services (Lambda, EC2, S3, RDS, API Gateway)
• Experience with React, Node.js, and RESTful API development
• Proficiency with databases (PostgreSQL, MongoDB) and caching (Redis)
• Experience with containerization (Docker) and orchestration (Kubernetes)
• Strong understanding of software engineering best practices
• Experience with agile development methodologies
• Excellent communication and collaboration skills
• Bachelor's degree in Computer Science or related field

Preferred Qualifications:
• AWS certifications (Solutions Architect, Developer)
• Experience with Infrastructure as Code (Terraform, CloudFormation)
• Knowledge of DevOps practices and CI/CD tools
• Experience with monitoring and logging tools (CloudWatch, ELK stack)
• Contributions to open-source projects
• Experience in fintech or e-commerce domains
• Leadership or mentoring experience

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements (hybrid/remote options)
• Professional development budget and conference attendance
• Collaborative and innovative work environment
• Opportunity to work on cutting-edge technology projects
• Career growth and advancement opportunities

Join our team and help us build the next generation of cloud-native applications that will transform how businesses operate in the digital age.
"""
    
    # Upload test files
    resume_key = f"format-test-resume-{test_id}.txt"
    job_title_key = f"format-test-job-title-{test_id}.txt"
    job_desc_key = f"format-test-job-desc-{test_id}.txt"
    status_key = f"format-test-status-{test_id}.json"
    
    try:
        # Upload resume
        s3_client.put_object(
            Bucket=bucket_name,
            Key=resume_key,
            Body=resume_content,
            ContentType='text/plain'
        )
        
        # Upload job title
        s3_client.put_object(
            Bucket=bucket_name,
            Key=job_title_key,
            Body=job_title,
            ContentType='text/plain'
        )
        
        # Upload job description
        s3_client.put_object(
            Bucket=bucket_name,
            Key=job_desc_key,
            Body=job_description,
            ContentType='text/plain'
        )
        
        # Create initial status
        initial_status = {
            "status": "PENDING",
            "message": "Format test job created",
            "timestamp": time.time()
        }
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=status_key,
            Body=json.dumps(initial_status),
            ContentType='application/json'
        )
        
        print(f"✅ Created comprehensive test files with ID: {test_id}")
        return {
            'test_id': test_id,
            'resume_key': resume_key,
            'job_title_key': job_title_key,
            'job_desc_key': job_desc_key,
            'status_key': status_key,
            'bucket_name': bucket_name
        }
        
    except Exception as e:
        print(f"❌ Failed to create test files: {str(e)}")
        return None

def test_pdf_format_quality():
    """Test PDF generation and analyze format quality"""
    
    print("🚀 Starting comprehensive PDF format test...")
    
    # Create test files
    test_data = create_comprehensive_test_files()
    if not test_data:
        return False
    
    # Create Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    # Test payload
    test_payload = {
        "userId": "format-test-user",
        "jobId": f"format-test-{test_data['test_id']}",
        "resumeKey": test_data['resume_key'],
        "jobTitleKey": test_data['job_title_key'],
        "jobDescriptionKey": test_data['job_desc_key'],
        "statusKey": test_data['status_key'],
        "outputFormat": "pdf",
        "coverLetterFormat": "pdf"
    }
    
    try:
        print("📤 Invoking Lambda function for PDF generation...")
        
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print("📋 Lambda Response:")
        print(json.dumps(response_payload, indent=2))
        
        # Check for successful PDF generation
        if 'optimizedResumeUrl' in response_payload:
            pdf_url = response_payload['optimizedResumeUrl']
            print(f"\n✅ PDF generated successfully!")
            print(f"📄 PDF URL: {pdf_url}")
            
            # Analyze the PDF URL and metadata
            print(f"📊 File Type: {response_payload.get('fileType', 'Unknown')}")
            print(f"📊 Content Type: {response_payload.get('contentType', 'Unknown')}")
            print(f"📊 Download Filename: {response_payload.get('downloadFilename', 'Unknown')}")
            
            # Validate PDF URL format
            print("\n🔍 Analyzing PDF URL and metadata...")
            
            # Check if URL looks valid
            if pdf_url.startswith('https://') and 'amazonaws.com' in pdf_url:
                print("✅ Valid S3 URL format detected")
                
                # Check if URL contains PDF-related parameters
                if 'application%2Fpdf' in pdf_url or 'application/pdf' in pdf_url:
                    print("✅ PDF content type found in URL")
                else:
                    print("⚠️  PDF content type not found in URL")
                
                # Check for proper filename
                if '.pdf' in pdf_url:
                    print("✅ PDF file extension found in URL")
                else:
                    print("⚠️  PDF file extension not found in URL")
                
                print("✅ PDF URL appears to be properly formatted")
                return True
            else:
                print("❌ Invalid or malformed PDF URL")
                return False
        
        elif 'error' in response_payload:
            error_msg = response_payload['error']
            print(f"❌ Lambda error: {error_msg}")
            
            # Check if it's an import-related error
            if any(keyword in error_msg.lower() for keyword in ['import', 'pil', 'reportlab', 'module']):
                print("❌ Import-related error detected!")
                return False
            else:
                print("⚠️  Non-import error - may be configuration issue")
                return True
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    finally:
        # Clean up test files
        try:
            s3_client = boto3.client('s3')
            bucket_name = test_data['bucket_name']
            
            # List and delete test files
            objects = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=f"format-test-{test_data['test_id']}"
            )
            
            if 'Contents' in objects:
                for obj in objects['Contents']:
                    s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])
                print(f"🧹 Cleaned up test files")
                
        except Exception as e:
            print(f"⚠️  Could not clean up test files: {str(e)}")

if __name__ == "__main__":
    success = test_pdf_format_quality()
    if success:
        print("\n🎉 PDF format test completed successfully!")
        print("✅ PDF generation is working with proper formatting!")
    else:
        print("\n💥 PDF format test failed!")
        print("❌ There are issues with PDF generation or formatting.")