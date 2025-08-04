#!/usr/bin/env python3

import json
import boto3
import time
from datetime import datetime

# Sample resume text (based on your original resume)
SAMPLE_RESUME = """
ABID SHAIK
(716) 970-9249 | abidshariff009@gmail.com | Dallas, Texas | LinkedIn

PROFESSIONAL SUMMARY
Experienced Data Engineer with 10+ years of experience building scalable data platforms and analytics solutions. Skilled in cloud technologies, big data processing, and data pipeline development.

CORE COMPETENCIES
AWS • Python • SQL • Apache Spark • Data Engineering • ETL/ELT • Database Management

PROFESSIONAL EXPERIENCE

Data Engineer | Amazon
Dec '20 — Present
• Built AI assistant using AWS Bedrock integrating data from Redshift and DynamoDB
• Designed real-time analytics solutions for workload management
• Developed centralized metrics library with 200+ core recruiting metrics
• Led cross-functional team for case management tool development
• Implemented automation framework reducing pipeline development time by 70%

Data Engineer | CGI  
Jun '15 — Dec '20
• Designed AWS systems following compliance and security standards
• Built scalable, fault-tolerant environments enhancing uptime by 30%
• Led cloud migration reducing infrastructure costs by 25%
• Developed centralized data repositories and automated workflows

ETL Analyst | Tech Mahindra
Feb '13 — Jul '14
• Built decision support model reducing insurance claims cost by 35%
• Published interactive reports using Tableau Server
• Developed scoring model for de-duplication of 50M+ records
• Designed data repository for investment bank analytics

Systems Engineer | Infosys
Oct '10 — Oct '12
• Managed financial transactions for multinational bank
• Designed OBIEE dashboards with drill-downs and navigation
• Developed Unix shell scripts optimizing execution time by 70%
• Automated production processes reducing manual effort by 65%

EDUCATION
Masters in Information Systems | University at Buffalo (GPA: 3.89)
Bachelors in Computer Science | Vellore Institute of Technology (GPA: 3.7)
"""

# 5 Different job descriptions to test
JOB_DESCRIPTIONS = {
    "snowflake_data_engineer": """
    Senior Data Engineer - Snowflake Platform
    
    We're seeking a Senior Data Engineer to join our data platform team building next-generation analytics infrastructure on Snowflake.
    
    Responsibilities:
    • Design and implement scalable data pipelines using Snowflake, DBT, and Fivetran
    • Build ELT workflows for data transformation and modeling
    • Implement Snowpipe for real-time data ingestion
    • Collaborate with analytics teams on data warehouse design
    • Optimize query performance and cost management in Snowflake
    
    Requirements:
    • 5+ years of data engineering experience
    • Expert-level Snowflake knowledge
    • Strong experience with DBT for data transformation
    • Experience with Fivetran or similar data integration tools
    • Knowledge of Snowpipe for streaming data ingestion
    • SQL expertise and data modeling skills
    • Python programming for data processing
    """,
    
    "streaming_data_engineer": """
    Principal Data Engineer - Real-time Analytics
    
    Join our team building the next generation of real-time data processing systems for millions of users.
    
    What You'll Do:
    • Build fault-tolerant streaming data pipelines using Apache Kafka and Apache Flink
    • Design real-time analytics using Apache Spark Streaming
    • Implement event-driven architectures with Kafka Connect
    • Work with Apache Airflow for workflow orchestration
    • Build monitoring and alerting for streaming systems
    
    Requirements:
    • 7+ years in data engineering with focus on streaming
    • Expert knowledge of Apache Kafka and Apache Flink
    • Strong experience with Apache Spark for batch and streaming
    • Experience with Apache Airflow for orchestration
    • Proficiency in Scala, Python, and Java
    • Knowledge of distributed systems and microservices
    • Experience with AWS or GCP for cloud infrastructure
    """,
    
    "ml_data_engineer": """
    Senior ML Data Engineer
    
    We're looking for a Senior ML Data Engineer to build data infrastructure supporting our machine learning platform.
    
    Key Responsibilities:
    • Build ML data pipelines using Apache Airflow and Kubeflow
    • Implement feature stores and data versioning systems
    • Work with MLflow for model lifecycle management
    • Deploy models using TensorFlow Serving and PyTorch
    • Build data quality monitoring and validation systems
    • Collaborate with data scientists on model deployment
    
    Required Skills:
    • 5+ years of data engineering experience in ML environments
    • Strong Python programming and data processing skills
    • Experience with ML frameworks: TensorFlow, PyTorch, Scikit-learn
    • Knowledge of MLOps tools: MLflow, Kubeflow, Apache Airflow
    • Experience with containerization: Docker, Kubernetes
    • Understanding of feature engineering and model serving
    • Cloud platform experience (AWS, GCP, Azure)
    """,
    
    "aws_data_engineer": """
    Senior AWS Data Engineer
    
    Join our cloud data team building enterprise-scale data solutions on AWS.
    
    What You'll Build:
    • Serverless data pipelines using AWS Lambda and Step Functions
    • Data lakes using AWS S3, Glue, and Athena
    • Real-time streaming with AWS Kinesis and Kinesis Analytics
    • Data warehousing solutions with Amazon Redshift
    • ETL processes using AWS Glue and EMR
    • Monitoring and alerting with CloudWatch and SNS
    
    Requirements:
    • 6+ years of data engineering experience
    • Deep AWS expertise: S3, Lambda, Glue, EMR, Redshift, Kinesis
    • Strong Python and SQL programming skills
    • Experience with Infrastructure as Code (CloudFormation, Terraform)
    • Knowledge of data governance and security best practices
    • Experience with CI/CD pipelines and DevOps practices
    • AWS certifications preferred
    """,
    
    "analytics_engineer": """
    Senior Analytics Engineer
    
    We're seeking an Analytics Engineer to build self-service analytics infrastructure and empower data-driven decision making.
    
    Responsibilities:
    • Build and maintain data models using DBT and SQL
    • Create self-service analytics dashboards with Tableau and Looker
    • Implement data quality testing and monitoring
    • Design dimensional data models for business intelligence
    • Build automated reporting and alerting systems
    • Collaborate with business stakeholders on analytics requirements
    
    Required Experience:
    • 4+ years in analytics engineering or business intelligence
    • Expert SQL skills and data modeling expertise
    • Strong experience with DBT for data transformation
    • Proficiency with BI tools: Tableau, Looker, or Power BI
    • Knowledge of data warehousing concepts and dimensional modeling
    • Experience with Python for data analysis and automation
    • Understanding of statistical analysis and A/B testing
    """
}

def test_lambda_with_job_descriptions():
    """Test the Lambda function with different job descriptions"""
    
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    results = {}
    
    print("🚀 Testing AIHandler Lambda with 5 Different Job Descriptions")
    print("=" * 80)
    
    for job_name, job_desc in JOB_DESCRIPTIONS.items():
        print(f"\n📋 Testing: {job_name.upper().replace('_', ' ')}")
        print("-" * 60)
        
        # Create test payload
        test_payload = {
            "resume_text": SAMPLE_RESUME,
            "job_description": job_desc,
            "user_id": "test_user",
            "request_id": f"test_{job_name}_{int(time.time())}"
        }
        
        try:
            print("⏳ Invoking Lambda function...")
            start_time = time.time()
            
            response = lambda_client.invoke(
                FunctionName='ResumeOptimizerAIHandler-prod',
                InvocationType='RequestResponse',
                Payload=json.dumps(test_payload)
            )
            
            end_time = time.time()
            execution_time = end_time - start_time
            
            # Parse response
            response_payload = json.loads(response['Payload'].read())
            
            if response.get('StatusCode') == 200:
                print(f"✅ Lambda execution successful ({execution_time:.1f}s)")
                
                # Parse the response body
                if 'body' in response_payload:
                    body = json.loads(response_payload['body'])
                    
                    if 'optimizedResume' in body:
                        optimized_resume = body['optimizedResume']
                        results[job_name] = {
                            'success': True,
                            'resume': optimized_resume,
                            'execution_time': execution_time,
                            'model_used': body.get('model_used', 'Unknown')
                        }
                        
                        print(f"📄 Resume generated successfully")
                        print(f"🤖 Model used: {body.get('model_used', 'Unknown')}")
                        print(f"📊 Resume length: {len(optimized_resume)} characters")
                        
                    else:
                        print(f"❌ No optimized resume in response: {body}")
                        results[job_name] = {'success': False, 'error': 'No optimized resume'}
                        
                else:
                    print(f"❌ No body in response: {response_payload}")
                    results[job_name] = {'success': False, 'error': 'No response body'}
                    
            else:
                print(f"❌ Lambda execution failed: {response_payload}")
                results[job_name] = {'success': False, 'error': response_payload}
                
        except Exception as e:
            print(f"❌ Error invoking Lambda: {str(e)}")
            results[job_name] = {'success': False, 'error': str(e)}
        
        # Add delay between requests
        time.sleep(2)
    
    return results

def analyze_resume_outputs(results):
    """Analyze the generated resume outputs"""
    
    print(f"\n\n🔍 ANALYSIS OF GENERATED RESUMES")
    print("=" * 80)
    
    successful_results = {k: v for k, v in results.items() if v.get('success')}
    
    print(f"📊 Success Rate: {len(successful_results)}/{len(results)} ({len(successful_results)/len(results)*100:.1f}%)")
    
    if not successful_results:
        print("❌ No successful results to analyze")
        return
    
    for job_name, result in successful_results.items():
        print(f"\n{'='*60}")
        print(f"📋 JOB: {job_name.upper().replace('_', ' ')}")
        print(f"{'='*60}")
        
        resume_text = result['resume']
        
        # Extract skills section
        skills_match = extract_section(resume_text, "CORE COMPETENCIES", "PROFESSIONAL EXPERIENCE")
        if skills_match:
            skills = [skill.strip() for skill in skills_match.replace('•', ',').split(',') if skill.strip()]
            print(f"🛠️  SKILLS EXTRACTED ({len(skills)}):")
            for i, skill in enumerate(skills[:10], 1):  # Show first 10
                print(f"   {i:2d}. {skill}")
            if len(skills) > 10:
                print(f"   ... and {len(skills) - 10} more")
        
        # Extract professional summary
        summary_match = extract_section(resume_text, "PROFESSIONAL SUMMARY", "CORE COMPETENCIES")
        if summary_match:
            print(f"\n📝 PROFESSIONAL SUMMARY:")
            print(f"   {summary_match.strip()}")
        
        # Analyze first experience bullet
        exp_match = extract_section(resume_text, "Data Engineer | Amazon", "Data Engineer | CGI")
        if exp_match:
            bullets = [line.strip() for line in exp_match.split('\n') if line.strip().startswith('•')]
            if bullets:
                print(f"\n💼 FIRST EXPERIENCE BULLETS (showing first 3):")
                for i, bullet in enumerate(bullets[:3], 1):
                    print(f"   {i}. {bullet}")
        
        # Check for job-specific technologies
        job_specific_analysis(job_name, resume_text)
        
        print(f"\n⏱️  Execution Time: {result['execution_time']:.1f}s")
        print(f"🤖 Model Used: {result['model_used']}")

def extract_section(text, start_marker, end_marker):
    """Extract text between two markers"""
    try:
        start_idx = text.find(start_marker)
        if start_idx == -1:
            return None
        
        start_idx = text.find('\n', start_idx) + 1
        end_idx = text.find(end_marker, start_idx)
        
        if end_idx == -1:
            return text[start_idx:].strip()
        else:
            return text[start_idx:end_idx].strip()
    except:
        return None

def job_specific_analysis(job_name, resume_text):
    """Analyze if resume contains job-specific technologies"""
    
    expected_techs = {
        "snowflake_data_engineer": ["Snowflake", "DBT", "Fivetran", "Snowpipe", "ELT"],
        "streaming_data_engineer": ["Kafka", "Flink", "Spark", "Airflow", "Streaming"],
        "ml_data_engineer": ["MLflow", "TensorFlow", "PyTorch", "Kubeflow", "Machine Learning"],
        "aws_data_engineer": ["AWS", "Lambda", "S3", "Glue", "Redshift", "Kinesis"],
        "analytics_engineer": ["DBT", "Tableau", "Looker", "SQL", "Analytics", "BI"]
    }
    
    if job_name in expected_techs:
        expected = expected_techs[job_name]
        found = []
        missing = []
        
        resume_lower = resume_text.lower()
        for tech in expected:
            if tech.lower() in resume_lower:
                found.append(tech)
            else:
                missing.append(tech)
        
        print(f"\n🎯 JOB-SPECIFIC TECHNOLOGY ANALYSIS:")
        print(f"   Expected: {expected}")
        print(f"   ✅ Found: {found} ({len(found)}/{len(expected)})")
        if missing:
            print(f"   ❌ Missing: {missing}")
        
        accuracy = len(found) / len(expected) * 100
        print(f"   📊 Accuracy: {accuracy:.1f}%")

def save_results_to_file(results):
    """Save detailed results to a file for further analysis"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"lambda_test_results_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {filename}")

if __name__ == "__main__":
    print("🧪 Testing AIHandler Lambda with Multiple Job Descriptions")
    
    # Test Lambda with different job descriptions
    results = test_lambda_with_job_descriptions()
    
    # Analyze the outputs
    analyze_resume_outputs(results)
    
    # Save results for detailed analysis
    save_results_to_file(results)
    
    print(f"\n✅ Testing completed!")
