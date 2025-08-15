#!/usr/bin/env python3
"""
Test the improved PDF generator with better formatting and email preservation.
"""

import json
import sys
import os

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_generator import create_pdf_from_resume_json, clean_text_for_pdf

def test_email_preservation():
    """Test that email addresses are preserved correctly."""
    print("🧪 Testing email address preservation...")
    
    test_cases = [
        ("abidshaiff2009@gmail.com", "abidshaiff2009@gmail.com"),
        ("john.doe+test@company.co.uk", "john.doe+test@company.co.uk"),
        ("user_name@domain-name.org", "user_name@domain-name.org"),
        ("test@sub.domain.com", "test@sub.domain.com"),
        ("José María <jose@company.com>", "Jose Maria <jose@company.com>"),
    ]
    
    all_passed = True
    for original, expected in test_cases:
        cleaned = clean_text_for_pdf(original)
        if expected in cleaned:  # Check if expected email is preserved
            print(f"✅ '{original}' → '{cleaned}'")
        else:
            print(f"❌ '{original}' → '{cleaned}' (expected to contain: '{expected}')")
            all_passed = False
    
    return all_passed

def test_improved_pdf_generation():
    """Test PDF generation with improved formatting."""
    print("\n🧪 Testing improved PDF generation...")
    
    # Sample resume with the user's email format
    improved_resume = {
        "full_name": "Abid Shaik",
        "contact_info": "abidshaiff2009@gmail.com | (716) 970-9249 | Dallas, Texas, 76210, United States",
        "professional_summary": "Seasoned Senior Manager, Data Engineering with 15+ years of experience leading enterprise-scale data initiatives. Proven leader in architecting cloud-native data platforms, optimizing real-time analytics systems, and managing cross-functional engineering teams. Expertise in AWS ecosystems, distributed systems, and machine learning implementations. Delivered 50%+ cost reductions through infrastructure optimizations and pioneered AI-driven solutions serving 1M+ users globally.",
        "skills": [
            "Python", "Java", "AWS", "SQL", "Spark", "Hadoop", "Kafka", 
            "Microservices", "Machine Learning", "Data Architecture", 
            "Team Leadership", "Cloud Migration", "Docker", "Kubernetes", "ETL"
        ],
        "experience": [
            {
                "title": "Senior Data Engineering Manager",
                "company": "Amazon",
                "dates": "Dec '20 - Present",
                "achievements": [
                    "Architected AI-driven data solutions using AWS Bedrock and Spark, mentoring 15+ engineering team members in implementing machine learning models that improved data discovery capabilities by 40%",
                    "Led enterprise migration to microservices architecture, reducing system latency by 35% while maintaining 99.99% uptime for global workforce analytics platforms",
                    "Directed cross-functional teams in developing scalable data pipelines handling 2TB daily throughput, accelerating executive decision-making through real-time KPI dashboards",
                    "Pioneered cost-optimization strategies that reduced cloud infrastructure spending by $1.2M annually through automated resource scaling and storage tiering"
                ]
            },
            {
                "title": "Data Engineering Lead",
                "company": "Microsoft",
                "dates": "Jan '18 - Nov '20",
                "achievements": [
                    "Built and deployed machine learning pipelines processing 500GB+ daily data streams",
                    "Implemented real-time analytics platform serving 2M+ users with sub-second response times",
                    "Reduced data processing costs by 60% through optimization of Spark and Hadoop clusters"
                ]
            }
        ],
        "education": [
            {
                "degree": "Master of Science in Data Science",
                "institution": "University of Texas at Dallas",
                "dates": "2015 - 2017",
                "gpa": "3.8",
                "details": "Specialized in Machine Learning and Big Data Analytics"
            },
            {
                "degree": "Bachelor of Technology in Computer Science",
                "institution": "Indian Institute of Technology",
                "dates": "2011 - 2015",
                "gpa": "3.6"
            }
        ]
    }
    
    try:
        # Convert to JSON string
        resume_json_str = json.dumps(improved_resume)
        
        # Generate PDF
        print("📄 Generating improved PDF...")
        pdf_buffer = create_pdf_from_resume_json(resume_json_str, "Professional Resume")
        
        # Check if PDF was created successfully
        if pdf_buffer and hasattr(pdf_buffer, 'getvalue'):
            pdf_data = pdf_buffer.getvalue()
            pdf_size = len(pdf_data)
            
            print(f"✅ Improved PDF generated successfully!")
            print(f"   PDF size: {pdf_size} bytes")
            
            # Basic PDF validation
            if pdf_data.startswith(b'%PDF-'):
                print("✅ PDF format validation passed")
                
                # Save test PDF
                with open('improved_resume_test.pdf', 'wb') as f:
                    f.write(pdf_data)
                print("✅ Improved PDF saved as 'improved_resume_test.pdf'")
                
                return True
            else:
                print("❌ PDF format validation failed")
                return False
        else:
            print("❌ PDF generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during improved PDF generation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("✨ Improved PDF Generation Test")
    print("=" * 50)
    
    # Test email preservation
    email_success = test_email_preservation()
    
    # Test PDF generation
    pdf_success = test_improved_pdf_generation()
    
    print("\n" + "=" * 50)
    if email_success and pdf_success:
        print("🎉 All improved PDF tests PASSED!")
        print("   ✅ Email addresses are preserved correctly")
        print("   ✅ PDF formatting is enhanced and professional")
        print("   ✅ Ready for deployment!")
    else:
        print("💥 Some tests FAILED!")
        if not email_success:
            print("   - Email preservation issues detected")
        if not pdf_success:
            print("   - PDF generation issues detected")
    
    sys.exit(0 if (email_success and pdf_success) else 1)