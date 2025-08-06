#!/usr/bin/env python3
"""
Integration code for adding company research to the existing AI handler.
This code can be integrated into the existing index.py file.
"""

import re
import json
import time
from typing import Dict, List, Optional, Any

# Add this class to the existing index.py file
class CompanyResearcher:
    """Simple company research service for cover letter enhancement."""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = 24 * 60 * 60  # 24 hours
    
    def research_company_sync(self, company_name: str) -> Optional[Dict[str, Any]]:
        """
        Synchronous company research for Lambda environment.
        Uses simple web search patterns to extract company information.
        """
        if not company_name or not company_name.strip():
            return None
        
        company_name = company_name.strip()
        cache_key = company_name.lower()
        
        # Check cache
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration:
                return cached_data
        
        try:
            print(f"Researching company: {company_name}")
            
            # Initialize company data
            company_data = {
                'name': company_name,
                'mission': None,
                'values': [],
                'culture_keywords': [],
                'recent_news': [],
                'industry': None
            }
            
            # Use simple heuristics for well-known companies
            # This can be expanded with actual web search integration
            company_data = self._get_known_company_data(company_name, company_data)
            
            # Cache results if we found anything useful
            if (company_data.get('mission') or 
                company_data.get('values') or 
                company_data.get('culture_keywords')):
                self.cache[cache_key] = (company_data, time.time())
                return company_data
            
            return None
            
        except Exception as e:
            print(f"Company research error: {e}")
            return None
    
    def _get_known_company_data(self, company_name: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get data for well-known companies using predefined knowledge.
        This is a fallback method that can be expanded with actual web search.
        """
        company_lower = company_name.lower()
        
        # Known company data (can be expanded)
        known_companies = {
            'microsoft': {
                'mission': 'To empower every person and every organization on the planet to achieve more',
                'values': ['Respect', 'Integrity', 'Accountability'],
                'culture_keywords': ['Innovation', 'Collaboration', 'Growth', 'Learning'],
                'industry': 'Technology Software',
                'recent_news': ['Advancing AI capabilities', 'Cloud computing expansion']
            },
            'google': {
                'mission': 'To organize the world\'s information and make it universally accessible and useful',
                'values': ['Focus on the user', 'Democracy on the web', 'Fast is better than slow'],
                'culture_keywords': ['Innovation', 'Data-driven', 'Collaboration', 'Excellence'],
                'industry': 'Technology Internet',
                'recent_news': ['AI research breakthroughs', 'Sustainability initiatives']
            },
            'amazon': {
                'mission': 'To be Earth\'s Most Customer-Centric Company',
                'values': ['Customer Obsession', 'Ownership', 'Invent and Simplify'],
                'culture_keywords': ['Customer-focused', 'Innovation', 'Leadership', 'Results'],
                'industry': 'E-commerce Technology',
                'recent_news': ['AWS growth', 'Sustainability commitments']
            },
            'apple': {
                'mission': 'To bring the best user experience to customers through innovative hardware, software, and services',
                'values': ['Innovation', 'Quality', 'Privacy'],
                'culture_keywords': ['Design', 'Innovation', 'Quality', 'Privacy'],
                'industry': 'Technology Hardware',
                'recent_news': ['New product launches', 'Environmental initiatives']
            },
            'tesla': {
                'mission': 'To accelerate the world\'s transition to sustainable energy',
                'values': ['Innovation', 'Sustainability', 'Excellence'],
                'culture_keywords': ['Innovation', 'Sustainability', 'Growth', 'Excellence'],
                'industry': 'Automotive Technology',
                'recent_news': ['Electric vehicle expansion', 'Energy storage solutions']
            },
            'netflix': {
                'mission': 'To entertain the world',
                'values': ['Innovation', 'Curiosity', 'Courage'],
                'culture_keywords': ['Innovation', 'Creativity', 'Data-driven', 'Global'],
                'industry': 'Entertainment Streaming',
                'recent_news': ['Global content expansion', 'Technology innovations']
            },
            'salesforce': {
                'mission': 'To help companies connect with their customers in a whole new way',
                'values': ['Trust', 'Customer Success', 'Innovation', 'Equality'],
                'culture_keywords': ['Customer-focused', 'Innovation', 'Equality', 'Trust'],
                'industry': 'Software CRM',
                'recent_news': ['AI platform developments', 'Sustainability goals']
            }
        }
        
        # Check for exact matches first
        for known_company, data in known_companies.items():
            if known_company in company_lower or company_lower in known_company:
                company_data.update(data)
                return company_data
        
        # Check for partial matches (for subsidiaries or variations)
        for known_company, data in known_companies.items():
            if any(word in company_lower for word in known_company.split()):
                company_data.update(data)
                return company_data
        
        # Generic industry classification based on company name patterns
        if any(word in company_lower for word in ['tech', 'software', 'systems', 'digital', 'data']):
            company_data['industry'] = 'Technology'
            company_data['culture_keywords'] = ['Innovation', 'Technology', 'Growth']
        elif any(word in company_lower for word in ['bank', 'financial', 'capital', 'investment']):
            company_data['industry'] = 'Financial Services'
            company_data['culture_keywords'] = ['Trust', 'Integrity', 'Excellence']
        elif any(word in company_lower for word in ['health', 'medical', 'pharma', 'bio']):
            company_data['industry'] = 'Healthcare'
            company_data['culture_keywords'] = ['Innovation', 'Care', 'Quality']
        elif any(word in company_lower for word in ['retail', 'store', 'shop', 'market']):
            company_data['industry'] = 'Retail'
            company_data['culture_keywords'] = ['Customer-focused', 'Service', 'Quality']
        elif any(word in company_lower for word in ['consulting', 'advisory', 'services']):
            company_data['industry'] = 'Consulting'
            company_data['culture_keywords'] = ['Excellence', 'Collaboration', 'Results']
        
        return company_data


# Replace the existing create_cover_letter_prompt function with this enhanced version
def create_enhanced_cover_letter_prompt(resume_text, job_description, job_title, company_name, company_research=None):
    """
    Enhanced cover letter prompt that includes company research when available.
    """
    company_info = f" at {company_name}" if company_name else ""
    
    # Build job description section
    job_desc_section = f"""
TARGET JOB DESCRIPTION:
{job_description}
""" if job_description else """
GENERAL PROFESSIONAL COVER LETTER:
Create a professional cover letter that highlights the candidate's relevant experience and skills.
"""

    # Build company research section
    company_section = ""
    if company_research and company_name:
        company_section = f"""
COMPANY RESEARCH - {company_name.upper()}:
"""
        
        if company_research.get('mission'):
            company_section += f"""
Mission: {company_research['mission']}
"""
        
        if company_research.get('values'):
            values_text = ', '.join(company_research['values'][:3])
            company_section += f"""
Core Values: {values_text}
"""
        
        if company_research.get('culture_keywords'):
            culture_text = ', '.join(company_research['culture_keywords'][:5])
            company_section += f"""
Culture Keywords: {culture_text}
"""
        
        if company_research.get('recent_news'):
            news_text = '; '.join(company_research['recent_news'][:2])
            company_section += f"""
Recent Developments: {news_text}
"""
        
        if company_research.get('industry'):
            company_section += f"""
Industry: {company_research['industry']}
"""

    # Enhanced requirements when company research is available
    if company_research:
        requirements_text = """COVER LETTER REQUIREMENTS:

1. **Professional Format**: Use standard business letter format
2. **Personalization**: Address the specific role and company
3. **Relevant Experience**: Highlight the most relevant experience from the resume
4. **Skills Alignment**: Emphasize skills that match the job requirements
5. **Company Vision Alignment**: Demonstrate how your values align with the company's mission and culture
6. **Cultural Fit**: Reference company values or developments to show genuine interest
7. **Professional Tone**: Confident but not arrogant, enthusiastic but professional
8. **Length**: 3-4 paragraphs, approximately 300-450 words
9. **Call to Action**: End with a strong closing that requests an interview

ENHANCED STRUCTURE:
- Opening paragraph: Express interest, state qualifications, mention attraction to the company
- Body paragraph 1: Highlight relevant experience and achievements from the resume
- Body paragraph 2: Demonstrate alignment with company values, mission, or recent developments
- Closing paragraph: Reiterate interest, emphasize cultural fit, request next steps

COMPANY ALIGNMENT GUIDELINES:
- Reference the company's mission or values naturally in your narrative
- Connect your career goals to the company's stated mission
- Mention recent developments to show current awareness
- Use culture keywords appropriately to demonstrate fit
- Show enthusiasm for contributing to the company's goals"""
    else:
        requirements_text = """COVER LETTER REQUIREMENTS:

1. **Professional Format**: Use standard business letter format
2. **Personalization**: Address the specific role and company (if provided)
3. **Relevant Experience**: Highlight the most relevant experience from the resume
4. **Skills Alignment**: Emphasize skills that match the job requirements
5. **Professional Tone**: Confident but not arrogant, enthusiastic but professional
6. **Length**: 3-4 paragraphs, approximately 250-400 words
7. **Call to Action**: End with a strong closing that requests an interview

STRUCTURE:
- Opening paragraph: Express interest and briefly state your qualifications
- Body paragraph(s): Highlight relevant experience and achievements from the resume
- Closing paragraph: Reiterate interest and request next steps"""

    prompt = f"""You are an expert cover letter writer with deep knowledge of corporate culture and business strategy. Create a compelling, personalized cover letter for the "{job_title}" position{company_info}.

CANDIDATE'S RESUME:
{resume_text}

{job_desc_section}
{company_section}

{requirements_text}

Return ONLY the cover letter text in a professional business letter format. Do not include JSON formatting or code blocks - just the plain text cover letter.

The cover letter should be ready to use as-is, with proper formatting and professional language that demonstrates both qualifications and cultural alignment."""

    return prompt


# Integration code for the lambda_handler function
def integrate_company_research_in_lambda():
    """
    This shows how to integrate the company research into the existing lambda handler.
    Add this code to the cover letter generation section in lambda_handler.
    """
    
    # Initialize company researcher (add this near the top of lambda_handler)
    company_researcher = CompanyResearcher()
    
    # In the cover letter generation section, replace the existing code with:
    """
    if include_cover_letter:
        try:
            print("Starting enhanced cover letter generation...")
            update_job_status(bucket_name, status_key, 'PROCESSING', 'Generating personalized cover letter')
            
            # Perform company research if company name is provided
            company_research = None
            if company_name and company_name.strip():
                print(f"Researching company: {company_name}")
                update_job_status(bucket_name, status_key, 'PROCESSING', 'Researching company information')
                
                company_research = company_researcher.research_company_sync(company_name.strip())
                
                if company_research:
                    print(f"Company research completed for {company_name}")
                    research_items = []
                    if company_research.get('mission'): research_items.append('mission')
                    if company_research.get('values'): research_items.append('values')
                    if company_research.get('culture_keywords'): research_items.append('culture')
                    if company_research.get('recent_news'): research_items.append('news')
                    
                    if research_items:
                        print(f"Found: {', '.join(research_items)}")
                else:
                    print(f"No additional company data found for {company_name}")
            
            # Create enhanced cover letter prompt
            cover_letter_prompt = create_enhanced_cover_letter_prompt(
                resume_text, 
                job_description, 
                job_title, 
                company_name,
                company_research
            )
            
            # Generate cover letter using existing AI system
            print("Calling Bedrock for cover letter generation...")
            cover_letter_content, cover_letter_model = call_bedrock_with_fallback(cover_letter_prompt)
            
            # Add company research info to completion message
            research_info = ""
            if company_research:
                research_items = []
                if company_research.get('mission'): research_items.append('mission')
                if company_research.get('values'): research_items.append('values')
                if company_research.get('culture_keywords'): research_items.append('culture')
                
                if research_items:
                    research_info = f" with {', '.join(research_items)} alignment"
            
            print(f"Enhanced cover letter generation completed using {cover_letter_model}{research_info}")
            
            # Continue with existing document generation logic...
            # The rest of the cover letter processing remains the same
            
        except Exception as cl_error:
            print(f"Enhanced cover letter generation failed: {str(cl_error)}")
            # Fallback to basic cover letter generation
            try:
                print("Falling back to basic cover letter generation...")
                cover_letter_prompt = create_cover_letter_prompt(resume_text, job_description, job_title, company_name)
                cover_letter_content, cover_letter_model = call_bedrock_with_fallback(cover_letter_prompt)
                print(f"Basic cover letter generation completed using {cover_letter_model}")
                # Continue with document generation...
            except Exception as basic_error:
                print(f"Basic cover letter generation also failed: {str(basic_error)}")
                # Continue without cover letter
    """


# Example of how the enhanced prompt looks
if __name__ == "__main__":
    # Test the enhanced prompt generation
    sample_resume = """John Doe
Software Engineer

Experience:
- 5 years of Python development at TechStart Inc
- Led team of 3 developers on microservices architecture
- Built scalable web applications serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%

Skills:
- Python, JavaScript, React, Node.js
- AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
- Agile methodologies, Scrum, Test-driven development"""

    sample_job_desc = """We are looking for a Senior Software Engineer to join our cloud platform team.

Requirements:
- 3+ years of Python experience
- Experience with cloud platforms (AWS preferred)
- Leadership experience with development teams
- Strong communication and collaboration skills
- Experience with microservices architecture

Responsibilities:
- Design and implement scalable cloud solutions
- Lead technical initiatives and mentor junior developers
- Collaborate with product teams on feature development
- Ensure code quality and best practices"""

    # Test with company research
    researcher = CompanyResearcher()
    company_research = researcher.research_company_sync("Microsoft")
    
    enhanced_prompt = create_enhanced_cover_letter_prompt(
        sample_resume,
        sample_job_desc,
        "Senior Software Engineer",
        "Microsoft",
        company_research
    )
    
    print("ENHANCED COVER LETTER PROMPT WITH COMPANY RESEARCH:")
    print("=" * 80)
    print(enhanced_prompt)
    print("=" * 80)
    
    # Test without company research
    basic_prompt = create_enhanced_cover_letter_prompt(
        sample_resume,
        sample_job_desc,
        "Senior Software Engineer",
        "Unknown Company",
        None
    )
    
    print("\nBASIC COVER LETTER PROMPT (NO COMPANY RESEARCH):")
    print("=" * 80)
    print(basic_prompt)
    print("=" * 80)
