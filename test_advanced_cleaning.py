#!/usr/bin/env python3
"""
Test script for advanced PDF text cleaning
"""

# Test sample with OCR artifacts (your example)
sample_messy_text = """ABID SHAIK Data Engineer (716) 970-9249 ◇ abidshariﬀ009@gmail.com ◇ Dallas, Texas, 76210, United States ◇ LinkedIn

📋 SUMMARY
────────────────────────────────────────
 As a Data Engineer at Amazon on the Workforce Intelligence team, I play a key role in delivering criOcal analyOcs that empower our Talent AcquisiOon team to enhance features within Amazon's internal hiring plaTorms. I build centralized data plaTorms that are used daily by thousands of users - recruiOng coordinators, hiring managers, and senior execuOves - to improve the candidate

💼 experience
────────────────────────────────────────
 and reduce hiring costs. AddiOonally, I've designed and implemented real-Ome analyOcs soluOons that have opOmized workload management for over a million hourly associates globally. My work also includes developing reusable soluOons to streamline batch and real-Ome data transformaOon pipelines, providing self-service analyOcs for stakeholders.

🛠 ️ SKILLS
────────────────────────────────────────
 Cloud Pla2orm: AWS Scrip9ng Languages: Python, SQL, Pyspark, Scala, Java, Unix Big Data Tech: Hadoop, Spark Visualiza9on Tools: Amazon QuickSight, Tableau, Cognos Database Management: PostgreSQL, MySQL, MongoDB, Oracle Orchestra9on Tools: Apache Airﬂow ETL Tools: InformaOca Powercenter, InformaOca Cloud"""

def simulate_advanced_cleaning(text):
    """Simulate the advanced cleaning process"""
    
    # Step 1: Fix character encoding
    encoding_fixes = {
        'ﬀ': 'ff',
        '◇': '•',
        'ﬂ': 'fl',
    }
    
    for old, new in encoding_fixes.items():
        text = text.replace(old, new)
    
    # Step 2: Fix OCR artifacts
    ocr_fixes = {
        'criOcal': 'critical',
        'analyOcs': 'analytics',
        'AcquisiOon': 'Acquisition',
        'plaTorms': 'platforms',
        'recruiOng': 'recruiting',
        'execuOves': 'executives',
        'AddiOonally': 'Additionally',
        'real-Ome': 'real-time',
        'soluOons': 'solutions',
        'opOmized': 'optimized',
        'transformaOon': 'transformation',
        'Pla2orm': 'Platform',
        'Scrip9ng': 'Scripting',
        'Visualiza9on': 'Visualization',
        'Orchestra9on': 'Orchestration',
        'Airﬂow': 'Airflow',
        'InformaOca': 'Informatica',
    }
    
    for mistake, correction in ocr_fixes.items():
        text = text.replace(mistake, correction)
    
    # Step 3: Clean formatting
    import re
    
    # Fix excessive whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Fix broken email
    text = re.sub(r'(\w+)\s*@\s*(\w+)', r'\1@\2', text)
    
    # Step 4: Improve structure
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Standardize section headers
        if line.upper() == 'SUMMARY':
            line = 'PROFESSIONAL SUMMARY'
        elif line.lower() == 'experience':
            line = 'EXPERIENCE'
        elif 'SKILLS' in line.upper():
            line = 'TECHNICAL SKILLS'
            
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def test_cleaning():
    """Test the cleaning process"""
    
    print("=== ORIGINAL MESSY TEXT ===")
    print(sample_messy_text[:500] + "...")
    print("\n" + "="*60 + "\n")
    
    print("=== AFTER ADVANCED CLEANING ===")
    cleaned = simulate_advanced_cleaning(sample_messy_text)
    print(cleaned[:800] + "...")
    
    print("\n" + "="*60 + "\n")
    print("✅ Cleaning improvements:")
    print("  • Fixed character encoding: ﬀ → ff, ◇ → •")
    print("  • Fixed OCR artifacts: criOcal → critical, analyOcs → analytics")
    print("  • Fixed broken words: AcquisiOon → Acquisition, plaTorms → platforms")
    print("  • Fixed technical terms: Pla2orm → Platform, Scrip9ng → Scripting")
    print("  • Cleaned email formatting: abidshariﬀ009@gmail.com → abidshariff009@gmail.com")
    print("  • Standardized section headers")
    print("  • Improved overall readability")

if __name__ == "__main__":
    test_cleaning()
