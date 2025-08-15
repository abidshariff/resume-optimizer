#!/usr/bin/env python3
"""
Test script to verify the compact professional resume layout with dots, full years, and tight spacing.
"""

import sys
import os
sys.path.append('backend/lambda-functions/ai-handler')

from pdf_generator import create_pdf_from_resume_json, format_dates_for_pdf

# Test resume data with abbreviated years and long content
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
            "dates": "Dec '20 - Present",  # Test abbreviated year formatting
            "location": "Dallas, TX",
            "achievements": [
                "Designed AI-powered data discovery solutions using AWS Bedrock and LLMs, integrating Redshift/DynamoDB datasets to optimize data accessibility and reduce query response times by 40% for analytics teams",
                "Engineered real-time analytics pipelines processing 1M+ hourly associate workloads globally using Spark streaming technology, enabling data-driven decision making across multiple business units",
                "Architected centralized metrics library with 200+ recruiting KPIs, eliminating data discrepancies in executive reporting and improving data consistency across all recruiting dashboards by 95%",
                "Led migration of legacy reporting systems to microservices architecture, resolving 15+ integration challenges and reducing system maintenance overhead by 60% through automated deployment pipelines",
                "Implemented operational run-books reducing support tickets by 30% through automated incident resolution workflows"
            ]
        },
        {
            "title": "Senior Data Engineer", 
            "company": "CGI",
            "dates": "Jun '15 - Dec '20",  # Test abbreviated year formatting
            "location": "Austin, TX",
            "achievements": [
                "Deployed AWS infrastructure meeting SOC2 compliance requirements, reducing security vulnerabilities by 40% through implementation of comprehensive monitoring and access control systems",
                "Built fault-tolerant data environments improving application uptime to 99.95% through auto-scaling designs and redundant system architecture across multiple availability zones",
                "Migrated 50+ on-premises applications to AWS cloud, achieving 52.8M annual infrastructure cost savings"
            ]
        }
    ],
    "education": [
        {
            "degree": "BS Computer Science",
            "institution": "University of Texas at Dallas",
            "dates": "'13 - '17",  # Test abbreviated year formatting
            "details": "Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Machine Learning"
        }
    ]
}

def test_date_formatting():
    """Test the date formatting function."""
    print("Testing date formatting...")
    
    test_cases = [
        ("Dec '20 - Present", "Dec 2020 - Present"),
        ("Jun '15 - Dec '20", "Jun 2015 - Dec 2020"),
        ("'13 - '17", "2013 - 2017"),
        ("Jan '99 - Dec '01", "Jan 1999 - Dec 2001"),
        ("2020 - Present", "2020 - Present"),  # Should remain unchanged
    ]
    
    for input_date, expected in test_cases:
        result = format_dates_for_pdf(input_date)
        status = "✅" if result == expected else "❌"
        print(f"  {status} '{input_date}' -> '{result}' (expected: '{expected}')")

def test_compact_layout():
    """Test the compact professional layout."""
    print("\nTesting compact professional resume layout...")
    
    try:
        # Generate PDF
        pdf_buffer = create_pdf_from_resume_json(test_resume)
        
        if pdf_buffer and pdf_buffer.getvalue():
            print("✅ PDF generated successfully!")
            print(f"PDF size: {len(pdf_buffer.getvalue())} bytes")
            
            # Save test PDF
            with open('test_compact_professional_layout.pdf', 'wb') as f:
                f.write(pdf_buffer.getvalue())
            print("✅ Test PDF saved as 'test_compact_professional_layout.pdf'")
            print("📋 Compact layout features:")
            print("   • Dots (o) instead of dashes for bullet points")
            print("   • Full year format (2020 instead of '20)")
            print("   • Tighter spacing between bullet points")
            print("   • Reduced section spacing for compactness")
            print("   • Professional company/dates alignment")
            
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
    test_date_formatting()
    success = test_compact_layout()
    sys.exit(0 if success else 1)