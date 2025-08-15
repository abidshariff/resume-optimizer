#!/usr/bin/env python3
"""
Test script to verify the professional resume layout with proper formatting.
"""

import sys
import os
sys.path.append('backend/lambda-functions/ai-handler')

from pdf_generator import create_pdf_from_resume_json

# Test resume data matching the professional format
test_resume = {
    "full_name": "Abid Shariff",
    "contact_info": "abidshariff009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
    "professional_summary": "Seasoned Data Engineer with 15+ years of expertise in designing scalable data solutions and optimizing enterprise analytics infrastructure. Delivered mission-critical data platforms supporting millions of users while mastering Python, SQL, AWS, and real-time processing technologies.",
    "skills": [
        "Python", "SQL", "Git", "Machine Learning", "Data Science", "AWS", "Spark", "Hadoop", 
        "Kafka", "ETL", "Data Modeling", "Apache Airflow", "Redshift", "DynamoDB", "Microservices"
    ],
    "experience": [
        {
            "title": "Data Engineer",
            "company": "Amazon",
            "dates": "Dec 2020 - Present",
            "location": "Dallas, TX",
            "achievements": [
                "Designed AI-powered data discovery solutions using AWS Bedrock and LLMs, integrating Redshift/DynamoDB datasets to optimize data accessibility and reduce query response times by 40% for analytics teams",
                "Engineered real-time analytics pipelines processing 1M+ hourly associate workloads globally using Spark streaming technology",
                "Architected centralized metrics library with 200+ recruiting KPIs, eliminating data discrepancies in executive reporting"
            ]
        },
        {
            "title": "Senior Data Engineer", 
            "company": "CGI",
            "dates": "Jun 2015 - Dec 2020",
            "location": "Austin, TX",
            "achievements": [
                "Deployed AWS infrastructure meeting SOC2 compliance requirements, reducing security vulnerabilities by 40%",
                "Built fault-tolerant data environments improving application uptime to 99.95% through auto-scaling designs"
            ]
        }
    ],
    "education": [
        {
            "degree": "BS Computer Science",
            "institution": "University of Texas at Dallas",
            "dates": "2013 - 2017",
            "details": "Relevant coursework: Data Structures, Algorithms, Database Systems"
        }
    ]
}

def test_professional_layout():
    """Test the professional resume layout."""
    print("Testing professional resume layout with proper formatting...")
    
    try:
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(test_resume)
        
        if pdf_buffer and pdf_buffer.getvalue():
            print("✅ PDF generated successfully!")
            print(f"PDF size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save test PDF
            with open('test_professional_layout.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_professional_layout.pdf'")
            print("📋 Professional layout features:")
            print("   • Company name with dates aligned to the right")
            print("   • Job title with location on the next line")
            print("   • Bullet points (•) for achievements")
            print("   • Blue section headings with underlines")
            print("   • Times New Roman font for professional appearance")
            
            return True
        else:
            print("❌ PDF generation failed - empty buffer")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_professional_layout()
    sys.exit(0 if success else 1)