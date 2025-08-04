# Prompt Template Editing Guide

## Overview

The AI resume optimization system now uses a comprehensive methodology based on proven GitHub implementation. The prompt has been separated into its own file (`prompt_template.py`) for easy editing and maintenance, with advanced resume analysis capabilities built-in.

## Files

- **`prompt_template.py`** - Contains the main prompt template function with comprehensive analysis
- **`index.py`** - Main Lambda function that imports and uses the prompt
- **`PROMPT_EDITING_GUIDE.md`** - This documentation file

## New Comprehensive Methodology

The system now includes several advanced analysis functions:

### 1. **Resume Structure Analysis**
```python
def analyze_resume_structure(resume_text):
    """Analyze the original resume to understand its structure and content density."""
    # Analyzes bullet points, experience sections, total lines
    # Returns structured data about the resume
```

### 2. **Enhanced Keyword Extraction**
```python
def extract_job_keywords(job_desc):
    """Extract key technical skills, tools, and requirements from job description"""
    # Comprehensive technology patterns covering:
    # - Cloud platforms (AWS, Azure, GCP)
    # - Programming languages (Python, Java, JavaScript, etc.)
    # - Data tools (Spark, Kafka, Airflow, etc.)
    # - Databases (PostgreSQL, MongoDB, Redis, etc.)
    # - Frameworks (React, Django, Spring, etc.)
    # - DevOps tools (Docker, Kubernetes, Jenkins, etc.)
```

### 3. **Page Count Estimation**
```python
def estimate_page_count(text):
    """Estimate the number of pages in the resume"""
    # Smart estimation based on word count and line analysis
    # Used for content preservation guidance
```

## Current Prompt Features

### ✅ **AGGRESSIVE KEYWORD INTEGRATION**
- Identifies ALL technical skills from job description
- Natural integration throughout resume
- Reframes experience using job terminology
- Adds relevant skills candidate likely has

### ✅ **COMPLETE EXPERIENCE TRANSFORMATION**
- Rewrites every bullet point for job alignment
- Transforms generic accomplishments to role-specific
- Uses exact job description terminology
- Quantifies achievements with reframed numbers

### ✅ **STRATEGIC SKILL ENHANCEMENT**
- Adds job-relevant skills candidate likely has
- Prioritizes job-mentioned technologies
- Uses exact terminology from job posting
- Maximum 15 skills, most relevant first

### ✅ **PROFESSIONAL SUMMARY OVERHAUL**
- Completely rewritten for specific role
- Includes years of experience
- Mentions key technologies from job description
- Highlights leadership/collaboration aspects

### ✅ **CONTENT PRESERVATION**
- **PRESERVES ALL EXPERIENCE ENTRIES**
- **PRESERVES ALL BULLET POINTS** (same count)
- **MAINTAINS SAME LEVEL OF DETAIL**
- Transforms rather than removes content
- **EDUCATION SECTION UNCHANGED**

## How to Edit the Prompt

### 1. Edit the Prompt Template

Open `prompt_template.py` and modify the `get_resume_optimization_prompt()` function:

```python
def get_resume_optimization_prompt(resume_text, job_description, keywords_text, length_guidance):
    # The function automatically:
    # 1. Analyzes resume structure
    # 2. Extracts job keywords
    # 3. Estimates page count
    # 4. Generates comprehensive prompt
    
    prompt = f"""Your custom modifications here...
    
    # All the analysis data is available:
    # - original_structure: bullet points, sections, etc.
    # - job_keywords: extracted technologies
    # - original_page_count: estimated pages
    # - length_guidance: preservation rules
    """
    return prompt
```

### 2. Customize Analysis Functions

You can modify the analysis functions for different behavior:

#### **Modify Keyword Extraction**
```python
def extract_job_keywords(job_desc):
    # Add new technology categories
    tech_patterns = [
        'Your', 'Custom', 'Technologies',
        # ... existing patterns
    ]
    # Custom extraction logic
```

#### **Adjust Structure Analysis**
```python
def analyze_resume_structure(resume_text):
    # Custom structure analysis
    # Add new indicators or metrics
```

### 3. Deploy Your Changes

```bash
# From the ai-handler directory
cd /path/to/resume-optimizer/backend/lambda-functions/ai-handler

# Create deployment package
zip -r ai-handler-updated.zip index.py prompt_template.py enhanced_word_generator.py pdf_generator.py word_generator.py minimal_word_generator.py simple_word_generator.py create_docx_template.py create_working_template.py create_template.py resume_template.py resume_template.docx professional_resume_template.docx PROMPT_EDITING_GUIDE.md

# Update Lambda function
aws lambda update-function-code \
    --function-name ResumeOptimizerAIHandler-prod \
    --zip-file fileb://ai-handler-updated.zip \
    --region us-east-1
```

## Advanced Customizations

### 1. **Industry-Specific Optimization**
```python
# Add conditional logic based on job description
if 'healthcare' in job_description.lower():
    prompt += "\nFocus on HIPAA compliance and patient care experience."
elif 'finance' in job_description.lower():
    prompt += "\nEmphasize regulatory compliance and risk management."
```

### 2. **Role-Level Customization**
```python
# Adjust approach based on seniority level
if any(level in job_description.lower() for level in ['senior', 'lead', 'principal']):
    prompt += "\nEmphasize leadership, mentoring, and strategic impact."
```

### 3. **Technology Stack Specialization**
```python
# Custom handling for specific tech stacks
if 'react' in job_keywords and 'node.js' in job_keywords:
    prompt += "\nFocus on full-stack JavaScript development experience."
```

### 4. **Content Preservation Rules**
```python
# Modify preservation logic based on resume length
if original_page_count > 2:
    length_guidance = "Prioritize most relevant experiences while preserving all content."
```

## Key Differences from Previous Version

### **Enhanced Analysis**
- **Before**: Simple keyword matching
- **Now**: Comprehensive structure analysis + advanced keyword extraction

### **Smarter Optimization**
- **Before**: Basic keyword integration
- **Now**: Complete transformation while preserving structure

### **Better Preservation**
- **Before**: General content preservation
- **Now**: Exact bullet point count matching + detailed structure analysis

### **Advanced Prompting**
- **Before**: Simple instructions
- **Now**: Detailed transformation examples + success criteria

## Testing Your Changes

### Local Testing
```python
from prompt_template import get_resume_optimization_prompt

# Test with sample data
test_resume = "John Doe\nSoftware Engineer\n• Developed applications\n• Worked with databases"
test_job_desc = "Looking for Python developer with React experience and AWS knowledge"

prompt = get_resume_optimization_prompt(test_resume, test_job_desc, "", "")
print("Generated keywords:", extract_job_keywords(test_job_desc))
print("Resume structure:", analyze_resume_structure(test_resume))
print("Page count:", estimate_page_count(test_resume))
```

### Production Testing
1. Deploy changes to Lambda
2. Test with real resume/job combinations
3. Verify keyword extraction accuracy
4. Check structure preservation
5. Validate output quality

## Best Practices

1. **Preserve Core Logic** - Don't modify the analysis functions unless necessary
2. **Test Thoroughly** - Always test with various resume types and job descriptions
3. **Monitor Performance** - Check CloudWatch logs for analysis accuracy
4. **Gradual Changes** - Make incremental improvements
5. **Document Changes** - Keep track of customizations

## Troubleshooting

### Common Issues

1. **Missing Keywords** - Check if new technologies need to be added to `tech_patterns`
2. **Structure Analysis Errors** - Verify resume format compatibility
3. **Page Count Issues** - Adjust estimation logic if needed
4. **Prompt Too Long** - Some AI models have token limits

### Debug Output
The system now provides detailed logging:
```
Original resume structure: {'total_lines': 45, 'bullet_points': 12, 'estimated_experience_sections': 3}
Extracted job keywords: ['Python', 'React', 'AWS', 'Docker', 'PostgreSQL']
Estimated original resume page count: 1.5
```

## Support

For questions about the new methodology or deployment issues, refer to the main project documentation or contact the development team.

The system now provides enterprise-grade resume optimization with comprehensive analysis and intelligent transformation capabilities!
