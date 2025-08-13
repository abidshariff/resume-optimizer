#!/usr/bin/env python3
"""Test Lambda imports"""

import json

def lambda_handler(event, context):
    try:
        # Test ReportLab import
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.units import inch
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.enums import TA_CENTER
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        reportlab_available = True
        reportlab_error = None
    except ImportError as e:
        reportlab_available = False
        reportlab_error = str(e)
    
    try:
        # Test python-docx import
        from docx import Document
        docx_available = True
        docx_error = None
    except ImportError as e:
        docx_available = False
        docx_error = str(e)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'reportlab_available': reportlab_available,
            'reportlab_error': reportlab_error,
            'docx_available': docx_available,
            'docx_error': docx_error
        })
    }
