#!/usr/bin/env python3

import re

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

def extract_job_keywords(job_desc):
    """Enhanced keyword extraction function"""
    
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
    
    # Find exact matches
    found_keywords = []
    job_lower = job_desc.lower()
    
    for tech in all_technologies:
        pattern = r'\b' + re.escape(tech.lower()) + r'\b'
        if re.search(pattern, job_lower):
            original_case = tech.title() if tech.islower() else tech
            if original_case not in found_keywords:
                found_keywords.append(original_case)
    
    # Extract technology clusters (e.g., "using X, Y, Z")
    cluster_patterns = [
        r'using\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'experience\s+with\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'proficiency\s+in\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'knowledge\s+of\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'expertise\s+in\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'tools\s+such\s+as\s+([^.]+?)(?:\s+for|\s+to|\.|$)',
        r'including\s+([^.]+?)(?:\s+for|\s+to|\.|$)'
    ]
    
    for pattern in cluster_patterns:
        matches = re.finditer(pattern, job_lower, re.IGNORECASE)
        for match in matches:
            cluster_text = match.group(1)
            # Split by common separators
            cluster_items = re.split(r'[,;/\s+and\s+|\s+or\s+]', cluster_text)
            for item in cluster_items:
                item = item.strip().strip('()')
                if len(item) > 2:
                    # Check if this item matches any known technologies
                    for tech in all_technologies:
                        if tech.lower() in item.lower() or item.lower() in tech.lower():
                            original_case = tech.title() if tech.islower() else tech
                            if original_case not in found_keywords:
                                found_keywords.append(original_case)
    
    # Extract capitalized technology names
    capitalized_pattern = r'\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b'
    capitalized_matches = re.findall(capitalized_pattern, job_desc)
    
    tech_indicators = ['sql', 'api', 'db', 'cloud', 'data', 'analytics', 'pipeline', 'stream', 'batch']
    for match in capitalized_matches:
        match_lower = match.lower()
        if (any(indicator in match_lower for indicator in tech_indicators) or 
            any(tech.lower() in match_lower for tech in all_technologies) or
            match in ['Snowflake', 'DBT', 'Fivetran', 'Snowpipe', 'Kafka', 'Flink', 'Spark', 'Trino']):
            if match not in found_keywords and len(match) > 2:
                found_keywords.append(match)
    
    # Remove duplicates and sort by frequency
    unique_keywords = list(set(found_keywords))
    
    # Sort by frequency of mention
    keyword_frequency = []
    for keyword in unique_keywords:
        frequency = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', job_lower))
        keyword_frequency.append((keyword, frequency))
    
    sorted_keywords = sorted(keyword_frequency, key=lambda x: x[1], reverse=True)
    final_keywords = [kw[0] for kw in sorted_keywords if kw[1] > 0]
    
    return final_keywords[:15]

def test_keyword_extraction():
    """Test the keyword extraction with different job descriptions"""
    
    for job_name, job_desc in job_descriptions.items():
        print(f"\n{'='*60}")
        print(f"TESTING: {job_name.upper()}")
        print(f"{'='*60}")
        
        keywords = extract_job_keywords(job_desc)
        print(f"Extracted Keywords ({len(keywords)}):")
        for i, keyword in enumerate(keywords, 1):
            print(f"  {i:2d}. {keyword}")
        
        # Analyze expectations
        if job_name == "snowflake_job":
            expected = ["Snowflake", "DBT", "Fivetran", "Snowpipe", "ELT"]
            print(f"\n🎯 Expected: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing = [kw for kw in expected if kw not in keywords]
            print(f"✅ Found Expected: {found_expected}")
            if missing:
                print(f"❌ Missing: {missing}")
            else:
                print("🎉 All expected keywords found!")
                
        elif job_name == "salesforce_job":
            expected = ["Spark", "Trino", "Flink", "Kafka", "DBT", "AWS"]
            print(f"\n🎯 Expected: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing = [kw for kw in expected if kw not in keywords]
            print(f"✅ Found Expected: {found_expected}")
            if missing:
                print(f"❌ Missing: {missing}")
            else:
                print("🎉 All expected keywords found!")
                
        elif job_name == "aws_job":
            expected = ["AWS", "Java", "Python", "TypeScript", "Go", "EC2", "S3", "DynamoDB", "Docker", "Kubernetes"]
            print(f"\n🎯 Expected: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing = [kw for kw in expected if kw not in keywords]
            print(f"✅ Found Expected: {found_expected}")
            if missing:
                print(f"❌ Missing: {missing}")
            else:
                print("🎉 All expected keywords found!")

if __name__ == "__main__":
    print("🔧 Testing Enhanced Keyword Extraction...")
    test_keyword_extraction()
