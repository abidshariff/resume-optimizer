#!/usr/bin/env python3

import json
import boto3

# Sample job descriptions to test
job_descriptions = {
    "snowflake_job": """
    Responsibilities
    Drive the evolution of our enterprise data platform by leading and empowering a team building the next generation of scalable, secure, and high-quality data infrastructure on Snowflake.
    
    Lead and coordinate data engineering activities to ensure successful, timely delivery of data solutions and product features, optimizing for performance, governance, and business value.
    Serve as a hands-on technical leader and mentor, offering expertise in modern data architecture, ELT/ETL, pipeline orchestration, and engineering excellence in Snowflake and cloud-native environments.
    
    Skills And Qualifications
    8+ years of overall data engineering or software engineering experience, with 3+ years managing teams of 5 or more data/analytics engineers.
    Hands-on expertise designing and managing high-volume, reliable, and scalable cloud-based data platforms (preferably with substantial experience in Snowflake environments).
    Demonstrated success in implementing and optimizing end-to-end ELT/ETL workflows using tools such as DBT, Fivetran, and Snowpipe.
    Tech stack expertise: Advanced proficiency with Snowflake; strong experience using DBT (or similar modeling tools), Fivetran, and Snowpipe for data pipeline automation and orchestration.
    """,
    
    "salesforce_job": """
    Senior/Lead/Principal Data Engineer
    We're building the product data platform that will power Salesforce's next era of agentic intelligence — delivering smarter, adaptive, and self-optimizing product experiences.
    
    As a Full-Stack Data Engineer, you'll design and build scalable systems that process hundreds of thousands of context-rich product signals. These signals fuel analytics, customer-facing products, ML models, and autonomous agents.
    
    You'll Work On
    Near real-time and batch telemetry pipelines for trusted signal capture
    Semantic layers and data products for reusable insights
    Programmatic discovery via metadata, MCP, and knowledge graphs
    
    What You'll Do
    Build and scale fault tolerant batch and streaming data pipelines using Spark, Trino, Flink, Kafka, DBT
    Design programmatic consumption layers to make product signals easy to define, discover, and reuse
    Apply software engineering best practices to data systems: testing, CI/CD, observability
    
    What We're Looking For
    5+ years of experience in data engineering, with strong software engineering fundamentals
    Expertise with big data frameworks: Spark, Trino/Presto, DBT
    Experience with streaming systems like Flink and Kafka, incl. distribution strategy (topics & partitions)
    Experience with cloud infrastructure, particularly AWS (e.g., S3, EMR, ECS, IAM), Containerization
    """,
    
    "aws_job": """
    Senior Software Engineer - AWS Lambda
    
    Amazon Web Services (AWS) is seeking a Senior Software Engineer to join the AWS Lambda team. You will be responsible for building and maintaining the core Lambda service that powers millions of serverless applications worldwide.
    
    Key Responsibilities:
    - Design and implement scalable distributed systems for serverless computing
    - Work with technologies including Java, Python, TypeScript, and Go
    - Build infrastructure using AWS services like EC2, S3, DynamoDB, and CloudWatch
    - Implement CI/CD pipelines using Jenkins and AWS CodePipeline
    - Collaborate with teams using Agile methodologies and Scrum practices
    
    Requirements:
    - 5+ years of software development experience
    - Strong experience with Java, Python, or similar languages
    - Experience with AWS services (EC2, S3, DynamoDB, Lambda)
    - Knowledge of containerization technologies like Docker and Kubernetes
    - Experience with microservices architecture and REST APIs
    - Familiarity with DevOps practices and tools
    """
}

def test_lambda_keyword_extraction():
    """Test the Lambda function's keyword extraction with different job descriptions"""
    
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    for job_name, job_desc in job_descriptions.items():
        print(f"\n{'='*60}")
        print(f"Testing: {job_name.upper()}")
        print(f"{'='*60}")
        
        # Create a test payload
        test_payload = {
            "resume_text": "Sample resume text for testing keyword extraction",
            "job_description": job_desc
        }
        
        try:
            # Invoke the Lambda function
            response = lambda_client.invoke(
                FunctionName='ResumeOptimizerAIHandler-prod',
                InvocationType='RequestResponse',
                Payload=json.dumps(test_payload)
            )
            
            # Parse the response
            response_payload = json.loads(response['Payload'].read())
            
            if response.get('StatusCode') == 200:
                print("✅ Lambda invocation successful")
                
                # Look for keyword extraction in logs or response
                if 'body' in response_payload:
                    body = json.loads(response_payload['body'])
                    print(f"Response: {body}")
                else:
                    print(f"Response: {response_payload}")
                    
            else:
                print(f"❌ Lambda invocation failed: {response_payload}")
                
        except Exception as e:
            print(f"❌ Error invoking Lambda: {str(e)}")

def test_local_keyword_extraction():
    """Test the keyword extraction logic locally"""
    
    # Import the extraction logic (we'll simulate it here)
    import re
    
    def extract_job_keywords(job_desc):
        """Local version of the keyword extraction function"""
        
        # Comprehensive technology patterns
        tech_categories = {
            'cloud_platforms': [
                'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 
                'google cloud platform', 'snowflake', 'databricks', 'redshift', 'bigquery'
            ],
            'programming_languages': [
                'python', 'java', 'javascript', 'typescript', 'scala', 'r', 'go', 'rust',
                'c++', 'c#', 'php', 'ruby', 'kotlin', 'swift', 'sql', 'pyspark'
            ],
            'data_tools': [
                'spark', 'apache spark', 'hadoop', 'kafka', 'apache kafka', 'flink', 'apache flink',
                'airflow', 'apache airflow', 'dbt', 'fivetran', 'snowpipe', 'tableau', 'power bi',
                'looker', 'quicksight', 'amazon quicksight', 'superset', 'metabase', 'trino', 'presto'
            ],
            'databases': [
                'postgresql', 'postgres', 'mysql', 'mongodb', 'cassandra', 'redis', 'elasticsearch',
                'oracle', 'sql server', 'dynamodb', 'cosmos db', 'neo4j', 'clickhouse'
            ],
            'frameworks_libraries': [
                'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
                'spring boot', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
            ],
            'devops_tools': [
                'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform',
                'ansible', 'chef', 'puppet', 'helm', 'istio', 'prometheus', 'grafana'
            ],
            'methodologies': [
                'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
                'rest api', 'graphql', 'etl', 'elt', 'data modeling', 'data warehousing'
            ]
        }
        
        # Flatten all technologies
        all_technologies = []
        for category, techs in tech_categories.items():
            all_technologies.extend(techs)
        
        # Find matches
        found_keywords = []
        job_lower = job_desc.lower()
        
        for tech in all_technologies:
            pattern = r'\b' + re.escape(tech.lower()) + r'\b'
            if re.search(pattern, job_lower):
                original_case = tech.title() if tech.islower() else tech
                if original_case not in found_keywords:
                    found_keywords.append(original_case)
        
        # Sort by frequency
        keyword_frequency = []
        for keyword in found_keywords:
            frequency = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', job_lower))
            keyword_frequency.append((keyword, frequency))
        
        sorted_keywords = sorted(keyword_frequency, key=lambda x: x[1], reverse=True)
        final_keywords = [kw[0] for kw in sorted_keywords if kw[1] > 0]
        
        return final_keywords[:15]
    
    # Test each job description
    for job_name, job_desc in job_descriptions.items():
        print(f"\n{'='*60}")
        print(f"LOCAL TEST: {job_name.upper()}")
        print(f"{'='*60}")
        
        keywords = extract_job_keywords(job_desc)
        print(f"Extracted Keywords ({len(keywords)}):")
        for i, keyword in enumerate(keywords, 1):
            print(f"  {i:2d}. {keyword}")
        
        # Analyze what we expect vs what we got
        if job_name == "snowflake_job":
            expected = ["Snowflake", "DBT", "Fivetran", "Snowpipe", "ELT"]
            print(f"\nExpected: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing = [kw for kw in expected if kw not in keywords]
            print(f"Found Expected: {found_expected}")
            print(f"Missing: {missing}")
            
        elif job_name == "salesforce_job":
            expected = ["Spark", "Trino", "Flink", "Kafka", "DBT", "AWS"]
            print(f"\nExpected: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing = [kw for kw in expected if kw not in keywords]
            print(f"Found Expected: {found_expected}")
            print(f"Missing: {missing}")

if __name__ == "__main__":
    print("Testing Keyword Extraction...")
    
    # Test locally first
    test_local_keyword_extraction()
    
    # Then test with Lambda (uncomment if you want to test Lambda)
    # test_lambda_keyword_extraction()
