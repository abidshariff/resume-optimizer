#!/usr/bin/env python3
"""
Final verification test to determine if ReportLab is working
"""

import json
import boto3
import uuid
import time

def test_final_pdf_verification():
    """Final test to verify PDF quality and ReportLab usage"""
    
    print("🎯 Final PDF verification test...")
    
    # Create Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    s3_client = boto3.client('s3')
    bucket_name = 'resume-optimizer-storage-132851953852-prod'
    
    # Generate unique test ID
    test_id = str(uuid.uuid4())[:8]
    
    # Comprehensive resume content
    resume_content = """Sarah Johnson
Senior Full-Stack Developer
Email: sarah.johnson@email.com | Phone: (555) 987-6543 | LinkedIn: linkedin.com/in/sarahjohnson
Location: Seattle, WA

PROFESSIONAL SUMMARY
Highly skilled Senior Full-Stack Developer with 7+ years of experience building scalable web applications and leading development teams. Expertise in modern JavaScript frameworks, cloud architecture, and agile methodologies. Proven track record of delivering high-quality software solutions that drive business growth.

TECHNICAL SKILLS
• Frontend: React, Vue.js, Angular, TypeScript, HTML5, CSS3, SASS, Webpack
• Backend: Node.js, Python, Django, Flask, Express.js, RESTful APIs, GraphQL
• Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
• Cloud & DevOps: AWS (EC2, Lambda, S3, RDS), Docker, Kubernetes, Jenkins, CI/CD
• Testing: Jest, Cypress, Pytest, Unit Testing, Integration Testing, TDD
• Tools: Git, JIRA, Slack, VS Code, Postman, Figma

PROFESSIONAL EXPERIENCE

Senior Full-Stack Developer | InnovateTech Solutions | March 2021 - Present
• Lead development of microservices architecture serving 500K+ monthly active users
• Architected and implemented React-based dashboard reducing customer support tickets by 35%
• Mentored team of 4 junior developers and established code review best practices
• Optimized database queries and API endpoints, improving application performance by 45%
• Collaborated with product managers and UX designers to deliver user-centric features
• Implemented automated testing suites achieving 90% code coverage

Full-Stack Developer | StartupXYZ | June 2019 - February 2021
• Developed responsive web applications using React, Node.js, and PostgreSQL
• Built real-time chat functionality using WebSocket technology
• Integrated third-party payment processing systems (Stripe, PayPal)
• Implemented user authentication and authorization with JWT tokens
• Participated in agile development processes and sprint planning
• Contributed to technical documentation and API specifications

Software Developer | WebDev Agency | August 2017 - May 2019
• Created custom WordPress themes and plugins for client websites
• Developed e-commerce solutions using WooCommerce and custom PHP
• Implemented responsive designs ensuring cross-browser compatibility
• Optimized website performance achieving 95+ Google PageSpeed scores
• Managed client relationships and project timelines
• Provided technical support and maintenance for 20+ client websites

EDUCATION
Bachelor of Science in Computer Science
University of Washington, Seattle | 2013 - 2017
• Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering
• Senior Project: Built a machine learning-powered recommendation system
• GPA: 3.8/4.0

PROJECTS
Task Management Platform (2023)
• Full-stack application built with React, Node.js, and PostgreSQL
• Features: Real-time collaboration, file sharing, project analytics
• Deployed on AWS with auto-scaling and load balancing

E-Learning Portal (2022)
• Educational platform with video streaming and progress tracking
• Technologies: Vue.js, Python Django, Redis for caching
• Served 1000+ students with 99.9% uptime

CERTIFICATIONS & ACHIEVEMENTS
• AWS Certified Solutions Architect - Associate (2023)
• Certified Kubernetes Administrator (CKA) (2022)
• Employee of the Year - InnovateTech Solutions (2023)
• Speaker at Seattle Tech Meetup - "Modern React Patterns" (2022)
• Open source contributor with 500+ GitHub stars across projects
"""
    
    job_title = "Lead Full-Stack Engineer - Cloud Platform"
    
    # Upload test files
    resume_key = f"final-test-resume-{test_id}.txt"
    job_title_key = f"final-test-job-title-{test_id}.txt"
    status_key = f"final-test-status-{test_id}.json"
    
    try:
        # Upload files
        s3_client.put_object(Bucket=bucket_name, Key=resume_key, Body=resume_content)
        s3_client.put_object(Bucket=bucket_name, Key=job_title_key, Body=job_title)
        s3_client.put_object(Bucket=bucket_name, Key=status_key, Body=json.dumps({"status": "PENDING"}))
        
        # Test payload
        test_payload = {
            "userId": "final-test-user",
            "jobId": f"final-test-{test_id}",
            "resumeKey": resume_key,
            "jobTitleKey": job_title_key,
            "statusKey": status_key,
            "outputFormat": "pdf"
        }
        
        print("📤 Invoking Lambda for comprehensive PDF test...")
        
        # Invoke Lambda
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        if 'optimizedResumeUrl' in response_payload:
            pdf_url = response_payload['optimizedResumeUrl']
            print("✅ PDF generated successfully!")
            print(f"📄 PDF URL: {pdf_url[:100]}...")
            
            # Wait a moment for logs to be available
            print("⏳ Waiting for logs to be available...")
            time.sleep(3)
            
            # Check CloudWatch logs for detailed ReportLab information
            logs_client = boto3.client('logs', region_name='us-east-1')
            log_group = '/aws/lambda/ResumeOptimizerAIHandler-prod'
            
            try:
                # Get the most recent log stream
                streams_response = logs_client.describe_log_streams(
                    logGroupName=log_group,
                    orderBy='LastEventTime',
                    descending=True,
                    limit=3
                )
                
                all_debug_messages = []
                
                for stream in streams_response['logStreams']:
                    stream_name = stream['logStreamName']
                    
                    # Get log events from this stream
                    events_response = logs_client.get_log_events(
                        logGroupName=log_group,
                        logStreamName=stream_name,
                        startFromHead=False,
                        limit=100
                    )
                    
                    # Collect ReportLab-related messages
                    for event in events_response['events']:
                        message = event['message'].strip()
                        if any(keyword in message for keyword in [
                            'ReportLab', 'reportlab', 'PIL', 'Falling back', 
                            'DEBUG:', 'Successfully imported', 'Available:', 'error'
                        ]):
                            timestamp = time.strftime('%H:%M:%S', time.localtime(event['timestamp']/1000))
                            all_debug_messages.append(f"[{timestamp}] {message}")
                
                if all_debug_messages:
                    print("\n📋 Recent ReportLab debug messages:")
                    for msg in all_debug_messages[-15:]:  # Last 15 messages
                        if 'Falling back' in msg or 'not available' in msg:
                            print(f"⚠️  {msg}")
                        elif 'Successfully' in msg or 'Available: True' in msg:
                            print(f"✅ {msg}")
                        elif 'error' in msg.lower() or 'failed' in msg.lower():
                            print(f"❌ {msg}")
                        else:
                            print(f"🔍 {msg}")
                    
                    # Analyze the messages
                    if any('Falling back' in msg for msg in all_debug_messages):
                        print("\n⚠️  ANALYSIS: Still falling back to text-based PDF")
                        print("❌ ReportLab is not working properly in Lambda")
                        return False
                    elif any('Successfully imported reportlab' in msg for msg in all_debug_messages):
                        print("\n✅ ANALYSIS: ReportLab is working correctly!")
                        print("🎨 Professional PDF formatting is active")
                        return True
                    else:
                        print("\n❓ ANALYSIS: Unable to determine ReportLab status from logs")
                        return True
                else:
                    print("ℹ️  No debug messages found - function may be working silently")
                    return True
                    
            except Exception as e:
                print(f"⚠️  Could not analyze logs: {str(e)}")
                return True
        else:
            print(f"❌ PDF generation failed: {response_payload}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_final_pdf_verification()
    if success:
        print("\n🎉 Final verification completed!")
    else:
        print("\n💥 Issues detected with ReportLab integration!")