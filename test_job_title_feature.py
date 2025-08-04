#!/usr/bin/env python3
"""
Test script to verify the job title and company name feature implementation
"""

import sys
import os

# Add the ai-handler directory to the path
sys.path.append('/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler')

def test_prompt_template():
    """Test that the prompt template accepts job title and company name parameters"""
    try:
        from prompt_template import get_resume_optimization_prompt
        
        # Test data
        resume_text = "John Doe\nSoftware Engineer\n5 years experience"
        job_description = "We are looking for a Senior Software Engineer..."
        job_title = "Senior Software Engineer"
        company_name = "Google"
        keywords_text = "Python, AWS, React"
        length_guidance = "Preserve content"
        
        # Test the function call
        prompt = get_resume_optimization_prompt(
            resume_text, 
            job_description, 
            job_title, 
            company_name,
            keywords_text, 
            length_guidance
        )
        
        # Check if job title and company name are in the prompt
        job_title_alignment_check = "JOB TITLE ALIGNMENT IN EXPERIENCE" in prompt
        strategic_enhancement_check = "STRATEGIC EXPERIENCE ENHANCEMENT" in prompt
        if job_title in prompt and company_name in prompt and job_title_alignment_check and strategic_enhancement_check:
            print("✅ Job title, company name, job title alignment, and strategic enhancement sections successfully included in prompt template")
            return True
        elif job_title in prompt and job_title_alignment_check and strategic_enhancement_check:
            print("✅ Job title, job title alignment, and strategic enhancement sections found (company name optional)")
            return True
        elif job_title in prompt and job_title_alignment_check:
            print("⚠️ Job title and alignment found but strategic enhancement section missing in prompt template")
            return False
        else:
            print("❌ Job title not found in prompt template")
            return False
            
    except Exception as e:
        print(f"❌ Error testing prompt template: {str(e)}")
        return False

def test_frontend_changes():
    """Test that frontend files have been updated"""
    try:
        # Check if MainApp.js contains jobTitle state
        with open('/Volumes/workplace/resume-optimizer/frontend/src/components/MainApp.js', 'r') as f:
            content = f.read()
            
        checks = [
            ('jobTitle state', 'setJobTitle' in content),
            ('companyName state', 'setCompanyName' in content),
            ('Job Title TextField', 'Job Title' in content and 'TextField' in content),
            ('Company Name TextField', 'Company Name (Optional)' in content and 'TextField' in content),
            ('Job title validation', 'Job title must be 100 characters' in content),
            ('Company name validation', 'Company name must be 100 characters' in content),
            ('Job title in payload', 'jobTitle:' in content),
            ('Company name in payload', 'companyName:' in content)
        ]
        
        all_passed = True
        for check_name, passed in checks:
            if passed:
                print(f"✅ {check_name} - Found")
            else:
                print(f"❌ {check_name} - Not found")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error testing frontend changes: {str(e)}")
        return False

def test_backend_changes():
    """Test that backend files have been updated"""
    try:
        # Check AI handler
        with open('/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/index.py', 'r') as f:
            ai_content = f.read()
        
        # Check resume processor
        with open('/Volumes/workplace/resume-optimizer/backend/lambda-functions/resume-processor/index.py', 'r') as f:
            processor_content = f.read()
        
        ai_checks = [
            ('Job title key extraction', 'jobTitleKey' in ai_content),
            ('Company name key extraction', 'companyNameKey' in ai_content),
            ('Job title S3 retrieval', 'job_title_obj' in ai_content),
            ('Company name S3 retrieval', 'company_name_obj' in ai_content),
            ('Job title in prompt call', 'job_title,' in ai_content),
            ('Company name in prompt call', 'company_name,' in ai_content)
        ]
        
        processor_checks = [
            ('Job title extraction', 'job_title = body.get' in processor_content),
            ('Company name extraction', 'company_name = body.get' in processor_content),
            ('Job title validation', 'Job title is required' in processor_content),
            ('Company name validation', 'Company name must be 100 characters' in processor_content),
            ('Job title S3 storage', 'job_title_key' in processor_content),
            ('Company name S3 storage', 'company_name_key' in processor_content),
            ('Job title in AI payload', 'jobTitleKey' in processor_content),
            ('Company name in AI payload', 'companyNameKey' in processor_content)
        ]
        
        all_passed = True
        
        print("\n🔧 AI Handler checks:")
        for check_name, passed in ai_checks:
            if passed:
                print(f"✅ {check_name} - Found")
            else:
                print(f"❌ {check_name} - Not found")
                all_passed = False
        
        print("\n🔧 Resume Processor checks:")
        for check_name, passed in processor_checks:
            if passed:
                print(f"✅ {check_name} - Found")
            else:
                print(f"❌ {check_name} - Not found")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error testing backend changes: {str(e)}")
        return False

if __name__ == '__main__':
    print("🧪 Testing Job Title and Company Name Feature Implementation")
    print("=" * 50)
    
    # Test prompt template
    print("\n📝 Testing Prompt Template...")
    prompt_test = test_prompt_template()
    
    # Test frontend changes
    print("\n🎨 Testing Frontend Changes...")
    frontend_test = test_frontend_changes()
    
    # Test backend changes
    print("\n⚙️ Testing Backend Changes...")
    backend_test = test_backend_changes()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    
    if prompt_test:
        print("✅ Prompt Template - PASSED")
    else:
        print("❌ Prompt Template - FAILED")
    
    if frontend_test:
        print("✅ Frontend Changes - PASSED")
    else:
        print("❌ Frontend Changes - FAILED")
    
    if backend_test:
        print("✅ Backend Changes - PASSED")
    else:
        print("❌ Backend Changes - FAILED")
    
    if prompt_test and frontend_test and backend_test:
        print("\n🎉 ALL TESTS PASSED! Job title feature is ready.")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Please review the implementation.")
        sys.exit(1)
