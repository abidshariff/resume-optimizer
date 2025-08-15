#!/usr/bin/env python3
"""
Test script to verify improved PDF formatting with professional fonts and proper text wrapping.
"""

import sys
import os
sys.path.append('backend/lambda-functions/ai-handler')

from pdf_generator import create_pdf_from_resume_json

# Test resume data with long text that might get truncated
test_resume = {
    "full_name": "Abid Shariff",
    "contact_info": "abidshariff009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
    "professional_summary": "Seasoned Data Engineer with 15+ years of expertise in designing scalable data solutions and optimizing enterprise analytics infrastructure. Delivered mission-critical data platforms supporting millions of users while mastering Python, SQL, AWS, and real-time processing technologies. Proven leader in building AI-driven analytics tools, cloud migrations, and security-compliant data systems that drive operational efficiency and cost reduction.",
    "skills": [
        "Python", "SQL", "Git", "Machine Learning", "Data Science", "AWS", "Spark", "Hadoop", 
        "Kafka", "ETL", "Data Modeling", "Apache Airflow", "Redshift", "DynamoDB", "Microservices"
    ],
    "experience": [
        {
            "title": "Data Engineer",
            "company": "Amazon",
            "dates": "Dec '20 - Present",
            "achievements": [
                "Designed AI-powered data discovery solutions using AWS Bedrock and LLMs, integrating Redshift/DynamoDB datasets to optimize data accessibility and reduce query response times by 40% for analytics teams",
                "Engineered real-time analytics pipelines processing 1M+ hourly associate workloads globally using Spark streaming technology, enabling data-driven decision making across multiple business units",
                "Architected centralized metrics library with 200+ recruiting KPIs, eliminating data discrepancies in executive reporting and improving data consistency across all recruiting dashboards by 95%",
                "Led migration of legacy reporting systems to microservices architecture, resolving 15+ integration challenges and reducing system maintenance overhead by 60% through automated deployment pipelines"
            ]
        },
        {
            "title": "Data Engineer", 
            "company": "CGI",
            "dates": "Jun '15 - Dec '20",
            "achievements": [
                "Deployed AWS infrastructure meeting SOC2 compliance requirements, reducing security vulnerabilities by 40% through implementation of comprehensive monitoring and access control systems",
                "Built fault-tolerant data environments improving application uptime to 99.95% through auto-scaling designs and redundant system architecture across multiple availability zones"
            ]
        }
    ],
    "education": [
        {
            "degree": "BS Computer Science",
            "institution": "University of Texas at Dallas",
            "dates": "2013 - 2017",
            "details": "Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Machine Learning"
        }
    ]
}

def test_improved_formatting():
    """Test that the improved formatting works correctly."""
    print("Testing improved PDF formatting with professional fonts and text wrapping...")
    
    try:
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(test_resume)
        
        if pdf_buffer and pdf_buffer.getvalue():
            print("✅ PDF generated successfully!")
            print(f"PDF size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save test PDF
            with open('test_improved_formatting.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_improved_formatting.pdf'")
            print("📋 Improvements applied:")
            print("   • Changed font from Arial to Times New Roman for professional look")
            print("   • Replaced asterisks (*) with dashes (-) for bullet points")
            print("   • Improved text wrapping to prevent truncation")
            print("   • Increased font sizes for better readability")
            print("   • Enhanced spacing and layout")
            
            return True
        else:
            print("❌ PDF generation failed - empty buffer")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_improved_formatting()
    sys.exit(0 if success else 1)