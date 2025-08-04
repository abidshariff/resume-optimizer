#!/usr/bin/env python3

import re

# Job descriptions similar to the user's example
job_descriptions = {
    "data_engineering_lead": """
    What You'll Be Doing

    Lead and provide mentorship to a team of engineers both technically and professionally
    Manage and drive team timelines, project commitments, and roadmap deliverables
    Work closely with users, leadership, and stakeholders to align and coordinate product design, project execution, and operational usage in setting and achieving objectives and key results.
    Design, build, and maintain scalable data processing and access with cloud ETL technology.
    Implement interfaces to enable self service data pipelines
    Write high quality, maintainable code to process terabytes of data 
    Lead and champion high-level system design and quality code reviews/technical contributions.
    Ability to take a strong sense of ownership and responsibility for mentoring engineers

    What We're Looking For

    5+ years of professional experience as a data engineer or data pipeline engineer
    BS or MS in Computer Science or related field
    Expertise with Python programming
    Expertise with AWS services and solutions (EKS, Lambda, ETL) 
    Experience with distributed system design and development
    Experience leading projects from end to end, designing and delivering and production stages 
    Strong written and oral communication skills
    Comfortable working in a fast-paced, continuous delivery environment

    Bonus Points (not required): 

    Experience with Infrastructure Monitoring
    Experience working in cross-functional development teams 
    Experience working with microservices
    Experience with people management
    """,
    
    "senior_backend_engineer": """
    What You'll Be Doing

    Design and develop high-performance backend services using Java and Spring Boot
    Build and maintain RESTful APIs and microservices architecture
    Work with containerization technologies including Docker and Kubernetes
    Implement CI/CD pipelines using Jenkins and GitLab CI
    Collaborate with frontend teams using React and TypeScript
    Optimize database performance with PostgreSQL and Redis
    Monitor application performance using Prometheus and Grafana
    Participate in code reviews and maintain high code quality standards

    What We're Looking For

    7+ years of software engineering experience
    Strong expertise in Java, Spring Boot, and microservices
    Experience with containerization (Docker, Kubernetes)
    Proficiency with SQL databases (PostgreSQL, MySQL)
    Knowledge of caching solutions (Redis, Memcached)
    Experience with message queues (RabbitMQ, Apache Kafka)
    Familiarity with monitoring tools (Prometheus, Grafana, ELK Stack)
    Understanding of DevOps practices and CI/CD

    Nice to Have:

    Experience with cloud platforms (AWS, GCP, Azure)
    Knowledge of NoSQL databases (MongoDB, Cassandra)
    Experience with event-driven architecture
    """,
    
    "ml_platform_engineer": """
    What You'll Be Doing

    Build and maintain machine learning infrastructure and platforms
    Design scalable ML pipelines using Apache Airflow and Kubeflow
    Work with data scientists to deploy models using MLflow and TensorFlow Serving
    Implement feature stores and data versioning systems
    Manage Kubernetes clusters for ML workloads
    Optimize model training and inference performance
    Build monitoring and observability for ML systems
    Collaborate with data teams on data quality and governance

    What We're Looking For

    4+ years of experience in ML engineering or platform engineering
    Strong Python programming skills
    Experience with ML frameworks (TensorFlow, PyTorch, Scikit-learn)
    Knowledge of containerization and orchestration (Docker, Kubernetes)
    Experience with workflow orchestration (Apache Airflow, Prefect)
    Understanding of ML model lifecycle management
    Experience with cloud platforms (AWS, GCP) and their ML services
    Familiarity with data processing frameworks (Spark, Pandas)

    Bonus Skills:

    Experience with MLOps tools (MLflow, Weights & Biases, Neptune)
    Knowledge of feature stores (Feast, Tecton)
    Experience with model serving platforms
    Understanding of A/B testing and experimentation
    """,
    
    "devops_engineer": """
    What You'll Be Doing

    Design and implement Infrastructure as Code using Terraform and CloudFormation
    Manage and optimize AWS cloud infrastructure (EC2, S3, RDS, Lambda)
    Build and maintain CI/CD pipelines using Jenkins, GitHub Actions, and AWS CodePipeline
    Implement monitoring and alerting using CloudWatch, Prometheus, and Grafana
    Manage containerized applications with Docker and Kubernetes
    Automate deployment processes and configuration management
    Ensure security best practices and compliance requirements
    Troubleshoot production issues and optimize system performance

    What We're Looking For

    5+ years of DevOps or Site Reliability Engineering experience
    Strong expertise with AWS services and cloud architecture
    Proficiency with Infrastructure as Code (Terraform, CloudFormation, Ansible)
    Experience with containerization and orchestration (Docker, Kubernetes, ECS)
    Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
    Understanding of monitoring and observability (Prometheus, Grafana, ELK Stack)
    Scripting skills in Python, Bash, or PowerShell
    Experience with configuration management tools

    Preferred Qualifications:

    AWS certifications (Solutions Architect, DevOps Engineer)
    Experience with service mesh technologies (Istio, Linkerd)
    Knowledge of security scanning and compliance tools
    Experience with multi-cloud environments
    """,
    
    "frontend_architect": """
    What You'll Be Doing

    Lead frontend architecture decisions for large-scale web applications
    Design and implement component libraries using React and TypeScript
    Build responsive user interfaces with modern CSS frameworks
    Implement state management solutions using Redux and Context API
    Optimize application performance and bundle sizes with Webpack and Vite
    Establish testing strategies using Jest, Cypress, and React Testing Library
    Mentor junior developers and conduct code reviews
    Collaborate with UX/UI designers and backend teams

    What We're Looking For

    8+ years of frontend development experience
    Expert-level knowledge of React, TypeScript, and modern JavaScript
    Strong understanding of HTML5, CSS3, and responsive design
    Experience with build tools (Webpack, Vite, Rollup)
    Knowledge of testing frameworks (Jest, Cypress, Playwright)
    Understanding of browser performance optimization
    Experience with design systems and component libraries
    Familiarity with backend technologies and API design

    Nice to Have:

    Experience with Next.js, Gatsby, or other React frameworks
    Knowledge of GraphQL and Apollo Client
    Experience with micro-frontends architecture
    Understanding of accessibility (WCAG) standards
    Experience with mobile development (React Native)
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
            'looker', 'quicksight', 'amazon quicksight', 'superset', 'metabase', 'trino', 'presto',
            'kubeflow', 'mlflow', 'prefect'
        ],
        'databases': [
            'postgresql', 'postgres', 'mysql', 'mongodb', 'cassandra', 'redis', 'elasticsearch',
            'oracle', 'sql server', 'dynamodb', 'cosmos db', 'neo4j', 'clickhouse', 'memcached'
        ],
        'frameworks_libraries': [
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
            'spring boot', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
            'redux', 'next.js', 'gatsby', 'jest', 'cypress'
        ],
        'devops_tools': [
            'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform',
            'ansible', 'chef', 'puppet', 'helm', 'istio', 'prometheus', 'grafana',
            'cloudformation', 'eks', 'ecs', 'lambda'
        ],
        'methodologies': [
            'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
            'rest api', 'graphql', 'etl', 'elt', 'data modeling', 'data warehousing'
        ],
        'aws_services': [
            'ec2', 's3', 'rds', 'lambda', 'eks', 'ecs', 'cloudwatch', 'cloudformation',
            'codepipeline', 'emr', 'glue', 'athena', 'kinesis', 'sqs', 'sns'
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
            # Preserve proper casing for known technologies
            if tech.upper() in ['AWS', 'API', 'SQL', 'ETL', 'ELT', 'CI/CD', 'HTML5', 'CSS3']:
                original_case = tech.upper()
            elif tech in ['JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB', 'GraphQL']:
                original_case = tech
            else:
                original_case = tech.title() if tech.islower() else tech
            
            if original_case not in found_keywords:
                found_keywords.append(original_case)
    
    # Extract capitalized technology names (proper nouns)
    capitalized_pattern = r'\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b'
    capitalized_matches = re.findall(capitalized_pattern, job_desc)
    
    # Known technology names that should be preserved
    known_techs = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
        'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'GCP', 'Azure',
        'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Spark', 'Airflow', 'MLflow',
        'TensorFlow', 'PyTorch', 'Prometheus', 'Grafana', 'CloudFormation',
        'Spring Boot', 'GraphQL', 'Webpack', 'Vite', 'Jest', 'Cypress'
    ]
    
    for match in capitalized_matches:
        if match in known_techs and match not in found_keywords:
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
    """Test the keyword extraction with job descriptions similar to user's example"""
    
    for job_name, job_desc in job_descriptions.items():
        print(f"\n{'='*70}")
        print(f"TESTING: {job_name.upper().replace('_', ' ')}")
        print(f"{'='*70}")
        
        keywords = extract_job_keywords(job_desc)
        print(f"📋 Extracted Keywords ({len(keywords)}):")
        for i, keyword in enumerate(keywords, 1):
            print(f"  {i:2d}. {keyword}")
        
        # Define expected keywords for each job type
        expectations = {
            "data_engineering_lead": {
                "expected": ["Python", "AWS", "EKS", "Lambda", "ETL", "Microservices"],
                "should_not_have": ["React", "Java", "Kubernetes", "Docker"]
            },
            "senior_backend_engineer": {
                "expected": ["Java", "Spring Boot", "Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka"],
                "should_not_have": ["Python", "TensorFlow", "Airflow"]
            },
            "ml_platform_engineer": {
                "expected": ["Python", "TensorFlow", "PyTorch", "Airflow", "Kubernetes", "MLflow"],
                "should_not_have": ["Java", "React", "PostgreSQL"]
            },
            "devops_engineer": {
                "expected": ["AWS", "Terraform", "CloudFormation", "Docker", "Kubernetes", "Jenkins", "Prometheus"],
                "should_not_have": ["React", "TensorFlow", "MLflow"]
            },
            "frontend_architect": {
                "expected": ["React", "TypeScript", "JavaScript", "Redux", "Jest", "Cypress", "Webpack"],
                "should_not_have": ["Python", "AWS", "Kubernetes", "PostgreSQL"]
            }
        }
        
        if job_name in expectations:
            expected = expectations[job_name]["expected"]
            should_not_have = expectations[job_name]["should_not_have"]
            
            print(f"\n🎯 Expected Technologies: {expected}")
            found_expected = [kw for kw in expected if kw in keywords]
            missing_expected = [kw for kw in expected if kw not in keywords]
            
            print(f"✅ Found Expected ({len(found_expected)}/{len(expected)}): {found_expected}")
            if missing_expected:
                print(f"❌ Missing Expected: {missing_expected}")
            
            # Check for technologies that shouldn't be there
            found_unwanted = [kw for kw in should_not_have if kw in keywords]
            if found_unwanted:
                print(f"⚠️  Found Unwanted: {found_unwanted}")
            else:
                print(f"✅ No Unwanted Technologies Found")
            
            # Calculate success rate
            success_rate = len(found_expected) / len(expected) * 100
            print(f"📊 Success Rate: {success_rate:.1f}%")
            
            if success_rate >= 80 and not found_unwanted:
                print("🎉 EXCELLENT - High accuracy with no unwanted technologies!")
            elif success_rate >= 60:
                print("👍 GOOD - Decent accuracy")
            else:
                print("⚠️  NEEDS IMPROVEMENT - Low accuracy")

if __name__ == "__main__":
    print("🔧 Testing Keyword Extraction with Similar Job Descriptions...")
    test_keyword_extraction()
