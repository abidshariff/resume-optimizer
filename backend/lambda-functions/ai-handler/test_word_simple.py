#!/usr/bin/env python3
"""
Simple test for Word document generation.
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from docxtpl import DocxTemplate
import io

def test_word_generation():
    """Test Word document generation with sample data."""
    
    # Sample resume data
    test_data = {
        "full_name": "John Smith",
        "contact_info": "john.smith@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johnsmith",
        "professional_summary": "Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.",
        "skills": [
            "Python, JavaScript, Java",
            "AWS, Docker, Kubernetes", 
            "React, Node.js, Django",
            "PostgreSQL, MongoDB",
            "CI/CD, Git, Agile methodologies"
        ],
        "experience": [
            {
                "title": "Senior Software Engineer",
                "company": "Tech Solutions Inc.",
                "dates": "2021 - Present",
                "responsibilities": [
                    "Led development of microservices architecture serving 1M+ users",
                    "Mentored team of 4 junior developers and improved code quality by 40%",
                    "Implemented CI/CD pipelines reducing deployment time by 60%"
                ]
            },
            {
                "title": "Software Engineer", 
                "company": "StartupCorp",
                "dates": "2019 - 2021",
                "responsibilities": [
                    "Developed full-stack web applications using React and Django",
                    "Optimized database queries improving application performance by 35%",
                    "Collaborated with product team to deliver features on tight deadlines"
                ]
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "University of Technology", 
                "dates": "2015 - 2019"
            }
        ]
    }
    
    try:
        # Load the template
        template_path = "working_resume_template.docx"
        doc = DocxTemplate(template_path)
        
        print("✅ Template loaded successfully")
        
        # Render with test data
        doc.render(test_data)
        
        print("✅ Template rendered successfully")
        
        # Save to output file
        output_path = "test_resume_output.docx"
        doc.save(output_path)
        
        print(f"✅ Word document saved to: {output_path}")
        
        # Check file size
        file_size = os.path.getsize(output_path)
        print(f"📄 File size: {file_size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Word document generation...")
    success = test_word_generation()
    
    if success:
        print("\n🎉 Word generation test completed successfully!")
        print("You can open 'test_resume_output.docx' to view the generated resume.")
    else:
        print("\n💥 Word generation test failed!")
