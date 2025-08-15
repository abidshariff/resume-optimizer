#!/usr/bin/env python3

from bs4 import BeautifulSoup
import html
import re

def clean_text(text):
    """Clean and normalize text content with enhanced HTML handling."""
    if not text:
        return ''
    
    import html
    import re
    
    # If the text contains HTML tags, parse it with BeautifulSoup first
    if '<' in text and '>' in text:
        soup = BeautifulSoup(text, 'html.parser')
        
        # Convert common HTML elements to readable text
        # Replace <br>, <p> tags with line breaks
        for br in soup.find_all(['br', 'p']):
            br.replace_with('\n')
        
        # Replace list items with bullet points
        for li in soup.find_all('li'):
            li.insert(0, '• ')
            li.append('\n')
        
        # Get clean text
        text = soup.get_text()
    
    # Decode HTML entities (like &#39; &amp; etc.)
    text = html.unescape(text)
    
    # Clean up whitespace - replace multiple spaces/newlines with single space
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove common unwanted phrases
    unwanted_phrases = [
        'Apply now', 'Apply for this job', 'Save job', 'Share job',
        'Report job', 'Easy Apply', 'Quick Apply'
    ]
    
    for phrase in unwanted_phrases:
        text = text.replace(phrase, '')
    
    return text.strip()

# Test the problematic text
test_html = "<p><span>Netflix is one of the world&#39;s leading entertainment services, with over 300 million pai..."

print("Original:")
print(test_html)
print()

print("After clean_text:")
result = clean_text(test_html)
print(result)
print()

print("Length:", len(result))