#!/usr/bin/env python3

import re

# Test the specific patterns
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

for line in test_lines:
    print(f"\nTesting line: '{line}'")
    line_lower = line.lower()
    
    for i, pattern in enumerate(patterns):
        matches = re.findall(pattern, line_lower)
        if matches:
            print(f"  Pattern {i+1} matched: {matches}")
