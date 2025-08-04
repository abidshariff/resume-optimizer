#!/usr/bin/env python3
"""
Test script for the adaptive skills system
"""

import boto3
import json
import sys
import os

# Add the ai-handler directory to the path
sys.path.append('/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler')

from skills_manager import SkillsManager
from skill_extractor import SkillExtractor

def test_skills_system():
    """Test the adaptive skills system"""
    
    # Configuration
    table_name = 'resume-optimizer-skills-prod'
    region = 'us-east-1'
    
    print("🧪 Testing Adaptive Skills System")
    print("=" * 50)
    
    try:
        # Initialize skills manager
        print("1. Initializing Skills Manager...")
        skills_manager = SkillsManager(table_name)
        
        # Test job description
        job_description = """
        We are looking for a Senior Software Engineer with expertise in:
        - Python and Django for backend development
        - React and TypeScript for frontend
        - AWS services including Lambda, S3, and DynamoDB
        - Docker and Kubernetes for containerization
        - Machine Learning and TensorFlow experience
        - Strong problem-solving and communication skills
        - Experience with Agile methodologies
        """
        
        print("2. Testing skill extraction...")
        extracted_skills = skills_manager.extract_skills_from_text(job_description)
        print(f"   Extracted {len(extracted_skills)} skills:")
        for skill in extracted_skills[:10]:  # Show first 10
            print(f"   - {skill['skill_name']} ({skill['category']}) - confidence: {skill.get('confidence_score', 0):.2f}")
        
        print("3. Processing extracted skills...")
        result = skills_manager.process_extracted_skills(extracted_skills)
        print(f"   Processing result: {result}")
        
        print("4. Getting organized skills for optimization...")
        organized_skills = skills_manager.get_skills_for_optimization()
        
        print("   Skills by category:")
        for category, skills_list in organized_skills.items():
            if skills_list:
                print(f"   - {category}: {len(skills_list)} skills")
                print(f"     Top 5: {', '.join(skills_list[:5])}")
        
        print("5. Testing skill normalization...")
        test_skills = ['javascript', 'JS', 'react.js', 'python3', 'aws', 'machine learning']
        for skill in test_skills:
            normalized = skills_manager.normalize_skill_name(skill)
            print(f"   '{skill}' -> '{normalized}'")
        
        print("\n✅ Skills system test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing skills system: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return False

if __name__ == '__main__':
    # Set up virtual environment
    venv_path = '/Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/venv'
    if os.path.exists(venv_path):
        sys.path.insert(0, f'{venv_path}/lib/python3.13/site-packages')
    
    success = test_skills_system()
    sys.exit(0 if success else 1)
