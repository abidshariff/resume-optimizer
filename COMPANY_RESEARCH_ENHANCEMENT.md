# Company Research Enhancement for Cover Letters

## 🎯 Overview

Enhance the cover letter generation to include company research and vision alignment when a company name is provided. This will create more compelling, personalized cover letters that demonstrate genuine interest and cultural fit.

## 🔍 Current State vs Enhanced State

### Current Implementation
```python
company_info = f" at {company_name}" if company_name else ""
# Only uses company name for basic personalization
```

### Enhanced Implementation
```python
company_info = f" at {company_name}" if company_name else ""
company_research = await research_company(company_name) if company_name else None
# Includes company mission, values, recent news, and culture insights
```

## 🚀 Implementation Plan

### Phase 1: Company Research Service

#### 1.1 Create Company Research Function
```python
async def research_company(company_name):
    """
    Research company information including mission, values, recent news, and culture.
    Returns structured company data for cover letter personalization.
    """
    try:
        # Use multiple data sources for comprehensive research
        company_data = {
            'name': company_name,
            'mission': None,
            'values': [],
            'recent_news': [],
            'culture_keywords': [],
            'industry': None,
            'size': None,
            'founded': None,
            'headquarters': None
        }
        
        # Research sources (in order of preference)
        sources = [
            search_company_website,
            search_company_linkedin,
            search_company_news,
            search_company_glassdoor,
            fallback_general_search
        ]
        
        for source in sources:
            try:
                data = await source(company_name)
                company_data = merge_company_data(company_data, data)
                if is_sufficient_data(company_data):
                    break
            except Exception as e:
                print(f"Error with {source.__name__}: {e}")
                continue
        
        return company_data
        
    except Exception as e:
        print(f"Company research failed: {e}")
        return None
```

#### 1.2 Data Sources Implementation

**Option A: Web Search Integration (Recommended)**
```python
async def search_company_website(company_name):
    """Use web search to find company website and extract key information."""
    # Use existing eureka_web_search or similar service
    search_query = f"{company_name} company mission values about"
    results = await web_search(search_query)
    
    # Extract mission, values, and key information
    return parse_company_website_data(results)

async def search_company_news(company_name):
    """Search for recent company news and developments."""
    search_query = f"{company_name} company news recent developments"
    results = await web_search(search_query)
    
    return parse_company_news_data(results)
```

**Option B: External API Integration**
```python
async def get_company_data_from_api(company_name):
    """Use external APIs like Clearbit, FullContact, or similar."""
    # Implementation would depend on chosen API
    pass
```

#### 1.3 Data Processing Functions
```python
def extract_company_mission(text):
    """Extract mission statement from company text."""
    mission_patterns = [
        r"(?i)(?:our\s+)?mission(?:\s+is)?[:\s]+([^.!?]+[.!?])",
        r"(?i)(?:we\s+)?(?:aim\s+to|strive\s+to|exist\s+to)([^.!?]+[.!?])",
        r"(?i)(?:our\s+)?purpose(?:\s+is)?[:\s]+([^.!?]+[.!?])"
    ]
    
    for pattern in mission_patterns:
        match = re.search(pattern, text)
        if match:
            return clean_mission_text(match.group(1))
    
    return None

def extract_company_values(text):
    """Extract company values and culture keywords."""
    value_patterns = [
        r"(?i)(?:our\s+)?values?[:\s]+([^.!?]+)",
        r"(?i)(?:we\s+)?believe\s+in([^.!?]+)",
        r"(?i)(?:our\s+)?culture[:\s]+([^.!?]+)"
    ]
    
    values = []
    for pattern in value_patterns:
        matches = re.findall(pattern, text)
        values.extend(matches)
    
    return clean_values_list(values)

def identify_culture_keywords(text):
    """Identify culture and value keywords from company content."""
    culture_keywords = [
        'innovation', 'collaboration', 'integrity', 'excellence',
        'customer-focused', 'diversity', 'inclusion', 'sustainability',
        'growth', 'learning', 'teamwork', 'transparency', 'agility',
        'quality', 'respect', 'accountability', 'passion', 'creativity'
    ]
    
    found_keywords = []
    text_lower = text.lower()
    
    for keyword in culture_keywords:
        if keyword in text_lower:
            found_keywords.append(keyword)
    
    return found_keywords[:5]  # Limit to top 5 most relevant
```

### Phase 2: Enhanced Prompt Template

#### 2.1 Updated Prompt Function
```python
def create_enhanced_cover_letter_prompt(resume_text, job_description, job_title, company_name, company_research=None):
    """
    Create an enhanced prompt that includes company research and vision alignment.
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
            values_text = ', '.join(company_research['values'][:3])  # Top 3 values
            company_section += f"""
Core Values: {values_text}
"""
        
        if company_research.get('culture_keywords'):
            culture_text = ', '.join(company_research['culture_keywords'])
            company_section += f"""
Culture Keywords: {culture_text}
"""
        
        if company_research.get('recent_news'):
            news_text = '; '.join(company_research['recent_news'][:2])  # Top 2 news items
            company_section += f"""
Recent Developments: {news_text}
"""
        
        if company_research.get('industry'):
            company_section += f"""
Industry: {company_research['industry']}
"""

    prompt = f"""You are an expert cover letter writer with deep knowledge of corporate culture and business strategy. Create a compelling, personalized cover letter for the "{job_title}" position{company_info}.

CANDIDATE'S RESUME:
{resume_text}

{job_desc_section}
{company_section}

COVER LETTER REQUIREMENTS:

1. **Professional Format**: Use standard business letter format
2. **Personalization**: Address the specific role and company (if provided)
3. **Relevant Experience**: Highlight the most relevant experience from the resume
4. **Skills Alignment**: Emphasize skills that match the job requirements
5. **Company Vision Alignment**: If company research is provided, demonstrate how your values and goals align with the company's mission and culture
6. **Cultural Fit**: Reference specific company values or recent developments to show genuine interest and research
7. **Professional Tone**: Confident but not arrogant, enthusiastic but professional
8. **Length**: 3-4 paragraphs, approximately 300-450 words (slightly longer to accommodate company alignment)
9. **Call to Action**: End with a strong closing that requests an interview

ENHANCED STRUCTURE:
- Opening paragraph: Express interest, briefly state qualifications, and mention specific attraction to the company (if research available)
- Body paragraph 1: Highlight relevant experience and achievements from the resume
- Body paragraph 2: Demonstrate alignment with company values, mission, or recent developments (if research available)
- Closing paragraph: Reiterate interest, emphasize cultural fit, and request next steps

COMPANY ALIGNMENT GUIDELINES (if company research provided):
- Reference the company's mission or values naturally within your narrative
- Connect your personal values or career goals to the company's stated mission
- Mention recent company developments or achievements to show current awareness
- Use company culture keywords appropriately to demonstrate fit
- Show genuine enthusiasm for contributing to the company's specific goals

Return ONLY the cover letter text in a professional business letter format. Do not include JSON formatting or code blocks - just the plain text cover letter.

The cover letter should be ready to use as-is, with proper formatting and professional language that demonstrates both qualifications and cultural alignment."""

    return prompt
```

### Phase 3: Integration with Existing System

#### 3.1 Update AI Handler Function
```python
async def generate_cover_letter_with_research(resume_text, job_description, job_title, company_name):
    """
    Generate cover letter with company research integration.
    """
    try:
        # Perform company research if company name provided
        company_research = None
        if company_name and company_name.strip():
            print(f"Researching company: {company_name}")
            update_job_status(bucket_name, status_key, 'PROCESSING', 'Researching company information')
            
            company_research = await research_company(company_name.strip())
            
            if company_research:
                print(f"Company research completed for {company_name}")
            else:
                print(f"Company research failed for {company_name}, proceeding with basic template")
        
        # Create enhanced prompt
        cover_letter_prompt = create_enhanced_cover_letter_prompt(
            resume_text, 
            job_description, 
            job_title, 
            company_name,
            company_research
        )
        
        # Generate cover letter using existing AI system
        cover_letter_content, cover_letter_model = call_bedrock_with_fallback(cover_letter_prompt)
        
        return cover_letter_content, cover_letter_model, company_research
        
    except Exception as e:
        print(f"Enhanced cover letter generation failed: {e}")
        # Fallback to original method
        return await generate_basic_cover_letter(resume_text, job_description, job_title, company_name)
```

#### 3.2 Update Lambda Handler
```python
# In lambda_handler function, replace the existing cover letter generation:

if include_cover_letter:
    try:
        print("Starting enhanced cover letter generation...")
        update_job_status(bucket_name, status_key, 'PROCESSING', 'Generating personalized cover letter with company research')
        
        # Use enhanced generation with company research
        cover_letter_content, cover_letter_model, company_research = await generate_cover_letter_with_research(
            resume_text, job_description, job_title, company_name
        )
        
        # Add company research metadata to response
        company_research_summary = ""
        if company_research:
            research_items = []
            if company_research.get('mission'):
                research_items.append("mission")
            if company_research.get('values'):
                research_items.append("values")
            if company_research.get('recent_news'):
                research_items.append("recent news")
            
            if research_items:
                company_research_summary = f" (researched: {', '.join(research_items)})"
        
        print(f"Enhanced cover letter generation completed using {cover_letter_model}{company_research_summary}")
        
        # Continue with existing document generation logic...
        
    except Exception as e:
        print(f"Enhanced cover letter generation failed: {e}")
        # Fallback to existing basic generation
        # ... existing cover letter generation code ...
```

### Phase 4: Frontend Enhancements

#### 4.1 Add Company Research Indicator
```javascript
// In MainApp.js, add state for company research status
const [companyResearchStatus, setCompanyResearchStatus] = useState(null);

// Update status polling to handle company research
if (statusData.companyResearch) {
  setCompanyResearchStatus(statusData.companyResearch);
}

// Add UI indicator for company research
{includeCoverLetter && companyName && (
  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      🔍 <strong>Enhanced Feature:</strong> We'll research {companyName} to align your cover letter with their mission and values
    </Typography>
  </Box>
)}
```

#### 4.2 Add Research Results Display
```javascript
// Show company research results in the success page
{result.companyResearch && (
  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
      📊 Company Research Applied:
    </Typography>
    <Typography variant="body2">
      • Mission alignment incorporated
      • Company values referenced
      • Recent developments mentioned
    </Typography>
  </Box>
)}
```

## 🔧 Technical Implementation Details

### Data Sources Priority
1. **Company Website** (Primary) - Most accurate, official information
2. **LinkedIn Company Page** - Professional focus, culture insights
3. **Recent News Articles** - Current developments, achievements
4. **Industry Reports** - Context and positioning
5. **General Web Search** - Fallback for basic information

### Performance Considerations
- **Caching**: Cache company research results for 24 hours
- **Timeout**: Limit research to 10-15 seconds maximum
- **Fallback**: Always have fallback to basic cover letter generation
- **Async Processing**: Don't block main resume optimization

### Error Handling
- **Research Failure**: Gracefully fallback to basic template
- **Partial Data**: Use whatever company data is available
- **Rate Limiting**: Handle API rate limits appropriately
- **Invalid Company**: Handle cases where company doesn't exist

## 📊 Expected Improvements

### Quality Metrics
- **Personalization Score**: Increase from 60% to 85%
- **Cultural Alignment**: Add specific company value references
- **Current Awareness**: Include recent company developments
- **Engagement**: Higher response rates due to demonstrated research

### User Experience
- **Differentiation**: Stand out from generic cover letters
- **Authenticity**: Show genuine interest in the company
- **Relevance**: Better alignment with company culture
- **Professionalism**: Demonstrate thorough preparation

## 🚀 Deployment Strategy

### Phase 1: Backend Implementation (Week 1)
- Implement company research functions
- Update prompt template
- Add error handling and fallbacks

### Phase 2: Integration Testing (Week 2)
- Test with various company types and sizes
- Validate research accuracy and relevance
- Performance testing and optimization

### Phase 3: Frontend Updates (Week 3)
- Add UI indicators and status updates
- Implement research results display
- User experience testing

### Phase 4: Production Rollout (Week 4)
- Gradual rollout with monitoring
- User feedback collection
- Performance monitoring and optimization

This enhancement will significantly improve the quality and effectiveness of generated cover letters by demonstrating genuine company research and cultural alignment.
