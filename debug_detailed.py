#!/usr/bin/env python3

import re
from datetime import datetime

# Test the specific patterns with debug output
test_lines = [
    "Dec '20 — Present",
    "Jun '15 — Dec '20", 
    "Feb '13 — Jul '14",
    "Oct '10 — Oct '12"
]

patterns = [
    r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',  # 2020-2023, 2020 - Present
    r'(\d{1,2})/(\d{4})\s*[-–—]\s*(\d{1,2})/(\d{4})',  # 01/2020 - 12/2023
    r'(\d{1,2})/(\d{4})\s*[-–—]\s*(present|current)',  # 01/2020 - Present
    r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})',  # Jan 2020 - Dec 2023
    r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})\s*[-–—]\s*(present|current)',  # Jan 2020 - Present
    r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})',  # Dec '20 — Jun '15
    r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\'(\d{2})\s*[-–—]\s*(present|current)',  # Dec '20 — Present
]

date_patterns = []

for line in test_lines:
    print(f"\nProcessing line: '{line}'")
    line_lower = line.lower()
    
    for i, pattern in enumerate(patterns):
        matches = re.findall(pattern, line_lower)
        if matches:
            print(f"  Pattern {i+1} matched: {matches}")
            for match in matches:
                print(f"    Match details: {match}, length: {len(match)}")
                
                if len(match) == 3 and match[2] in ['present', 'current']:  # Month 'YY - Present
                    print(f"      Processing as Month 'YY - Present")
                    print(f"      match[1] = '{match[1]}', isdigit: {match[1].isdigit()}, len: {len(match[1])}")
                    if match[1].isdigit() and len(match[1]) == 4:  # Full year
                        start_year = int(match[1])
                        print(f"      Full year: {start_year}")
                    else:  # Abbreviated year
                        year_val = int(match[1])
                        start_year = 2000 + year_val if year_val < 50 else 1900 + year_val
                        print(f"      Abbreviated year: {year_val} -> {start_year}")
                    end_year = datetime.now().year
                    date_patterns.append((start_year, end_year))
                    print(f"      Added date range: ({start_year}, {end_year})")
                    
                elif len(match) == 4 and match[3].isdigit():  # Month 'YY - Month 'YY
                    print(f"      Processing as Month 'YY - Month 'YY")
                    print(f"      match[1] = '{match[1]}', match[3] = '{match[3]}'")
                    if match[1].isdigit() and len(match[1]) == 4:  # Full years
                        start_year = int(match[1])
                        end_year = int(match[3])
                        print(f"      Full years: {start_year} - {end_year}")
                    else:  # Abbreviated years
                        start_val = int(match[1])
                        end_val = int(match[3])
                        start_year = 2000 + start_val if start_val < 50 else 1900 + start_val
                        end_year = 2000 + end_val if end_val < 50 else 1900 + end_val
                        print(f"      Abbreviated years: {start_val} -> {start_year}, {end_val} -> {end_year}")
                    date_patterns.append((start_year, end_year))
                    print(f"      Added date range: ({start_year}, {end_year})")

print(f"\nFinal date patterns: {date_patterns}")

if date_patterns:
    all_start_years = [start for start, end in date_patterns]
    all_end_years = [end for start, end in date_patterns]
    
    earliest_start = min(all_start_years)
    latest_end = max(all_end_years)
    total_years = latest_end - earliest_start
    
    print(f"Earliest start: {earliest_start}")
    print(f"Latest end: {latest_end}")
    print(f"Total years: {total_years}")
