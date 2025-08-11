#!/usr/bin/env python3

# Test the date parser function with the resume format we saw in logs
import re
from datetime import datetime

def calculate_total_experience_years(resume_text):
    """Calculate total years of work experience from the resume."""
    import re
    from datetime import datetime
    
    lines = resume_text.split('\n')
    date_patterns = []
    
    # Look for date patterns in the resume
    for line in lines:
        # Enhanced date patterns to catch more formats
        patterns = [
            r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',  # 2020-2023, 2020 - Present
            r'(\d{1,2})/(\d{4})\s*[-–—]\s*(\d{1,2})/(\d{4})',  # 01/2020 - 12/2023
            r'(\d{1,2})/(\d{4})\s*[-–—]\s*(present|current)',  # 01/2020 - Present
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})',  # Jan 2020 - Dec 2023
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(present|current)',  # Jan 2020 - Present
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})',  # Dec '20 — Jun '15
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(present|current)',  # Dec '20 — Present
        ]
        
        line_lower = line.lower()
        
        # Try each pattern
        for pattern in patterns:
            matches = re.findall(pattern, line_lower)
            if matches:
                for match in matches:
                    if len(match) == 2:  # Simple year-year or year-present
                        start_year = int(match[0])
                        end_year = datetime.now().year if match[1] in ['present', 'current'] else int(match[1])
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 4 and match[2].isdigit():  # MM/YYYY - MM/YYYY
                        start_year = int(match[1])
                        end_year = int(match[3])
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 3 and match[2] in ['present', 'current']:  # MM/YYYY - Present
                        start_year = int(match[1])
                        end_year = datetime.now().year
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 3 and match[2] in ['present', 'current']:  # MM/YYYY - Present or Month 'YY - Present
                        if match[1].isdigit() and len(match[1]) == 4:  # Full year
                            start_year = int(match[1])
                        else:  # Abbreviated year
                            year_val = int(match[1])
                            start_year = 2000 + year_val if year_val < 50 else 1900 + year_val
                        end_year = datetime.now().year
                        date_patterns.append((start_year, end_year))
                    elif len(match) == 4 and match[3].isdigit():  # Month YYYY - Month YYYY or Month 'YY - Month 'YY
                        if match[1].isdigit() and len(match[1]) == 4:  # Full years
                            start_year = int(match[1])
                            end_year = int(match[3])
                        else:  # Abbreviated years
                            start_val = int(match[1])
                            end_val = int(match[3])
                            start_year = 2000 + start_val if start_val < 50 else 1900 + start_val
                            end_year = 2000 + end_val if end_val < 50 else 1900 + end_val
                        date_patterns.append((start_year, end_year))
    
    if not date_patterns:
        # Fallback: look for individual years and estimate
        years = re.findall(r'\b(20\d{2})\b', resume_text)
        if years:
            years = [int(y) for y in years]
            min_year = min(years)
            max_year = max(years)
            # More conservative estimate - assume gaps
            total_years = max(1, max_year - min_year)
            return {
                'total_years': total_years,
                'analysis': f"Estimated {total_years} years based on year range {min_year}-{max_year}",
                'confidence': 'low'
            }
        return {
            'total_years': 3,
            'analysis': "Could not parse dates, defaulting to 3 years",
            'confidence': 'very_low'
        }
    
    # Calculate total experience (may have overlaps, so we'll take the span)
    all_start_years = [start for start, end in date_patterns]
    all_end_years = [end for start, end in date_patterns]
    
    earliest_start = min(all_start_years)
    latest_end = max(all_end_years)
    total_years = latest_end - earliest_start
    
    return {
        'total_years': total_years,
        'analysis': f"Calculated {total_years} years from {earliest_start} to {latest_end}",
        'confidence': 'high',
        'date_ranges': date_patterns
    }

# Test with the actual resume format from the logs
test_resume = """
ABID SHAIK
(716) 970-9249 | abidshariff009@gmail.com | Dallas, Texas | LinkedIn

PROFESSIONAL SUMMARY
Experienced Data Engineer with 10+ years of experience building scalable data platforms and analytics solutions. Skilled in cloud technologies, big data processing, and data pipeline development.

CORE COMPETENCIES
AWS • Python • SQL • Apache Spark • Data Engineering • ETL/ELT • Database Management

PROFESSIONAL EXPERIENCE

Data Engineer | Amazon
Dec '20 — Present
• Built AI assistant using AWS Bedrock integrating data from Redshift and DynamoDB
• Designed real-time analytics solutions for workload management
• Developed centralized metrics library with 200+ core recruiting metrics
• Led cross-functional team for case management tool development
• Implemented automation framework reducing pipeline development time by 70%

Data Engineer | CGI  
Jun '15 — Dec '20
• Designed AWS systems following compliance and security standards
• Built scalable, fault-tolerant environments enhancing uptime by 30%
• Led cloud migration reducing infrastructure costs by 25%
• Developed centralized data repositories and automated workflows

ETL Analyst | Tech Mahindra
Feb '13 — Jul '14
• Built decision support model reducing insurance claims cost by 35%
• Published interactive reports using Tableau Server
• Developed scoring model for de-duplication of 50M+ records
• Designed data repository for investment bank analytics

Systems Engineer | Infosys
Oct '10 — Oct '12
• Managed financial transactions for multinational bank
• Designed OBIEE dashboards with drill-downs and navigation
• Developed Unix shell scripts optimizing execution time by 70%
• Automated production processes reducing manual effort by 65%

EDUCATION
Masters in Information Systems | University at Buffalo (GPA: 3.89)
Bachelors in Computer Science | Vellore Institute of Technology (GPA: 3.7)
"""

result = calculate_total_experience_years(test_resume)
print("Experience calculation result:")
print(f"Total years: {result['total_years']}")
print(f"Analysis: {result['analysis']}")
print(f"Confidence: {result['confidence']}")
if 'date_ranges' in result:
    print(f"Date ranges found: {result['date_ranges']}")
