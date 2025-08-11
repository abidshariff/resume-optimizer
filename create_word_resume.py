#!/usr/bin/env python3

def create_word_resume():
    """Create a Word document with clean formatting similar to the reference PDF"""
    
    # Simple Word document structure (RTF format for compatibility)
    rtf_content = r"""{{\rtf1\ansi\deff0 {{\fonttbl {{\f0 Calibri;}}}}
\f0\fs22

{{\pard\qc\b\fs26 ABID SHAIK\par}}
{{\pard\qc\fs20 abidshari009@gmail.com \bullet  (716) 970-9249 \bullet  Dallas, Texas, 76210, United States\par}}

{{\pard\sb120\b\fs22 PROFESSIONAL SUMMARY\par}}
{{\pard\sa60 Seasoned Data Engineering Leader with 15+ years of experience building enterprise-scale data solutions and leading high-performing teams. Proven expertise in AWS cloud architecture, real-time data systems, and driving cost optimization initiatives that deliver measurable business impact across Fortune 500 organizations.\par}}

{{\pard\sb120\b\fs22 CORE COMPETENCIES\par}}
{{\pard\sa60 Python \bullet  SQL \bullet  AWS \bullet  Apache Airflow \bullet  dbt \bullet  Snowflake \bullet  Data Governance \bullet  Team Leadership \bullet  Cloud Migration \bullet  ETL/ELT \bullet  Data Modeling \bullet  SLA Management \bullet  Kafka \bullet  Spark \bullet  DevOps \bullet  Cost Optimization\par}}

{{\pard\sb120\b\fs22 PROFESSIONAL EXPERIENCE\par}}

{{\pard\sb80\b\fs22 Data Engineering Manager\par}}
{{\pard Amazon | Dec '20 \emdash  Present\par}}
{{\pard\fi-200\li200 \bullet  Led engineering team in developing AI-powered data discovery solutions using AWS Bedrock, enhancing search capabilities by 40% and enabling self-service analytics for 500+ stakeholders\par}}
{{\pard\fi-200\li200 \bullet  Directed design of real-time workforce management system serving 1M+ global associates, reducing operational overhead by 30% and improving user experience metrics\par}}
{{\pard\fi-200\li200 \bullet  Managed enterprise data modeling initiatives including 200+ metric definitions, establishing governance frameworks across 15 business units and eliminating data integrity issues\par}}
{{\pard\fi-200\li200 \bullet  Oversaw migration of mission-critical systems to microservices architecture, improving platform stability and reducing system downtime by 60%\par}}
{{\pard\fi-200\li200 \bullet  Guided cross-functional teams in developing case management tools that improved user productivity by 25%, earning leadership recognition for innovation\par}}
{{\pard\fi-200\li200 \bullet  Implemented DevOps practices including CI/CD pipelines and runbook automation, reducing deployment time by 70% and operational tickets by 30%\par}}
{{\pard\fi-200\li200 \bullet  Championed cost optimization strategies that reduced cloud infrastructure spending by 50% while maintaining 99.9% SLA compliance\par}}
{{\pard\fi-200\li200 \bullet  Established data security protocols and compliance controls that achieved 100% audit readiness for sensitive data handling across all systems\par}}
{{\pard\fi-200\li200 \bullet  Mentored 8+ engineers in advanced data engineering techniques, promoting 3 team members to senior roles and improving team velocity by 25%\par}}

{{\pard\sb80\b\fs22 Data Engineering Lead\par}}
{{\pard CGI | Jun '15 \emdash  Dec '20\par}}
{{\pard\fi-200\li200 \bullet  Directed AWS cloud migration program that reduced infrastructure costs by 25% while achieving 30% performance improvement across all data pipelines\par}}
{{\pard\fi-200\li200 \bullet  Architected fault-tolerant ETL pipelines processing 10TB daily, enabling real-time analytics for 50+ business stakeholders and improving decision-making speed\par}}
{{\pard\fi-200\li200 \bullet  Supervised development of centralized data lake supporting 100+ concurrent users with role-based access controls and comprehensive audit trails\par}}
{{\pard\fi-200\li200 \bullet  Pioneered automated monitoring framework that reduced data pipeline downtime by 60% through predictive alerting and proactive issue resolution\par}}
{{\pard\fi-200\li200 \bullet  Led technical teams in delivering complex data integration projects for Fortune 500 clients, consistently meeting deadlines and budget constraints\par}}

{{\pard\sb80\b\fs22 ETL Architect\par}}
{{\pard Tech Mahindra | Jan '12 \emdash  May '15\par}}
{{\pard\fi-200\li200 \bullet  Designed and implemented enterprise ETL solutions processing multi-terabyte datasets for Fortune 500 clients across healthcare and financial services\par}}
{{\pard\fi-200\li200 \bullet  Led technical teams in delivering complex data integration projects on time and within budget, maintaining 98% client satisfaction rate\par}}
{{\pard\fi-200\li200 \bullet  Established data quality frameworks and monitoring systems ensuring 99.5% data accuracy across all pipelines and downstream applications\par}}
{{\pard\fi-200\li200 \bullet  Developed automated testing frameworks that reduced deployment errors by 80% and improved overall system reliability\par}}

{{\pard\sb120\b\fs22 EDUCATION\par}}
{{\pard\b Master of Science in Computer Science\par}}
{{\pard University at Buffalo | 2010\par}}
{{\pard\sb40\b Bachelor of Technology in Computer Science\par}}
{{\pard JNTU Hyderabad | 2008\par}}

{{\pard\sb120\b\fs22 CERTIFICATIONS\par}}
{{\pard\fi-200\li200 \bullet  AWS Certified Solutions Architect - Professional\par}}
{{\pard\fi-200\li200 \bullet  AWS Certified Data Analytics - Specialty\par}}
{{\pard\fi-200\li200 \bullet  Certified Data Management Professional (CDMP)\par}}
{{\pard\fi-200\li200 \bullet  Apache Airflow Certified Developer\par}}

}}"""

    return rtf_content

def save_word_document():
    """Save the Word document"""
    rtf_content = create_word_resume()
    
    with open('/Users/shikbi/Desktop/abid_shaik_resume.rtf', 'w', encoding='utf-8') as f:
        f.write(rtf_content)
    
    print("Word document (RTF format) created successfully!")
    print("File saved as: /Users/shikbi/Desktop/abid_shaik_resume.rtf")
    print("You can open this in Microsoft Word, Google Docs, or any word processor.")

if __name__ == "__main__":
    save_word_document()
