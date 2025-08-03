// Enhanced text formatting utilities for better resume comparison view

/**
 * Formats extracted resume text to be more readable in comparison view
 * Handles PDF text extraction issues and improves formatting
 */
export const formatResumeText = (rawText, fileType = 'unknown') => {
  if (!rawText || typeof rawText !== 'string') {
    return 'No text content available';
  }

  let formattedText = rawText;

  // Clean up common PDF extraction issues
  formattedText = cleanupPdfText(formattedText);
  
  // Add intelligent formatting
  formattedText = addIntelligentFormatting(formattedText);
  
  // Improve section detection and spacing
  formattedText = improveSectionSpacing(formattedText);
  
  return formattedText;
};

/**
 * Clean up common PDF text extraction artifacts
 */
const cleanupPdfText = (text) => {
  return text
    // Remove excessive whitespace but preserve intentional spacing
    .replace(/[ \t]+/g, ' ')
    // Fix broken words that got split across lines
    .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
    // Remove standalone page numbers
    .replace(/^\s*\d+\s*$/gm, '')
    // Clean up bullet points
    .replace(/[•·▪▫◦‣⁃]/g, '•')
    // Fix email addresses that got broken
    .replace(/(\w+)\s*@\s*(\w+)/g, '$1@$2')
    // Fix phone numbers
    .replace(/(\d{3})\s*-?\s*(\d{3})\s*-?\s*(\d{4})/g, '$1-$2-$3')
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n');
};

/**
 * Add intelligent formatting based on content patterns
 */
const addIntelligentFormatting = (text) => {
  const lines = text.split('\n');
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    
    if (!line) {
      formattedLines.push('');
      continue;
    }
    
    // Detect and format headers (likely section titles)
    if (isLikelyHeader(line, nextLine)) {
      formattedLines.push('');
      formattedLines.push(line.toUpperCase());
      formattedLines.push('─'.repeat(Math.min(line.length, 40)));
      continue;
    }
    
    // Detect and format job titles/company names
    if (isLikelyJobTitle(line)) {
      formattedLines.push('');
      formattedLines.push(`📍 ${line}`);
      continue;
    }
    
    // Detect and format dates
    if (isLikelyDateLine(line)) {
      formattedLines.push(`📅 ${line}`);
      continue;
    }
    
    // Detect and format bullet points
    if (isLikelyBulletPoint(line)) {
      formattedLines.push(`  • ${line.replace(/^[•·▪▫◦‣⁃\-\*]\s*/, '')}`);
      continue;
    }
    
    // Detect contact information
    if (isContactInfo(line)) {
      formattedLines.push(`📧 ${line}`);
      continue;
    }
    
    // Regular line
    formattedLines.push(line);
  }
  
  return formattedLines.join('\n');
};

/**
 * Improve section spacing and organization
 */
const improveSectionSpacing = (text) => {
  // Add extra spacing around major sections
  const sectionKeywords = [
    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
    'EDUCATION', 'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
    'PROJECTS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'SUMMARY',
    'PROFESSIONAL SUMMARY', 'OBJECTIVE'
  ];
  
  let formattedText = text;
  
  sectionKeywords.forEach(keyword => {
    const regex = new RegExp(`(^|\\n)(${keyword})`, 'gmi');
    formattedText = formattedText.replace(regex, '\n\n$2');
  });
  
  return formattedText;
};

/**
 * Helper functions for content detection
 */
const isLikelyHeader = (line, nextLine) => {
  const headerKeywords = [
    'experience', 'education', 'skills', 'summary', 'objective',
    'projects', 'certifications', 'achievements', 'technical skills',
    'core competencies', 'professional summary', 'work experience'
  ];
  
  return (
    line.length < 50 &&
    headerKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    ) &&
    !line.includes('@') &&
    !line.includes('•')
  );
};

const isLikelyJobTitle = (line) => {
  const jobTitlePatterns = [
    /engineer/i, /developer/i, /manager/i, /analyst/i, /specialist/i,
    /coordinator/i, /consultant/i, /director/i, /lead/i, /senior/i,
    /junior/i, /associate/i, /principal/i, /architect/i
  ];
  
  return (
    line.length < 100 &&
    jobTitlePatterns.some(pattern => pattern.test(line)) &&
    !line.includes('•') &&
    !line.includes('@')
  );
};

const isLikelyDateLine = (line) => {
  const datePatterns = [
    /\d{4}\s*-\s*\d{4}/, // 2020 - 2023
    /\d{4}\s*-\s*present/i, // 2020 - Present
    /\w+\s+\d{4}\s*-\s*\w+\s+\d{4}/, // Jan 2020 - Dec 2023
    /\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{4}/ // 01/2020 - 12/2023
  ];
  
  return datePatterns.some(pattern => pattern.test(line));
};

const isLikelyBulletPoint = (line) => {
  return (
    line.match(/^[•·▪▫◦‣⁃\-\*]\s/) ||
    line.toLowerCase().startsWith('developed') ||
    line.toLowerCase().startsWith('managed') ||
    line.toLowerCase().startsWith('led') ||
    line.toLowerCase().startsWith('implemented') ||
    line.toLowerCase().startsWith('created') ||
    line.toLowerCase().startsWith('designed')
  );
};

const isContactInfo = (line) => {
  return (
    line.includes('@') ||
    line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
    line.toLowerCase().includes('linkedin') ||
    line.toLowerCase().includes('github') ||
    line.match(/https?:\/\//)
  );
};

/**
 * Create a formatted preview for file upload
 */
export const createFilePreview = (file) => {
  const fileType = file.type;
  const fileName = file.name;
  const fileSize = (file.size / 1024).toFixed(1);
  
  if (fileType === 'application/pdf') {
    return `📄 PDF Document: ${fileName} (${fileSize} KB)

📋 Processing Status: Extracting text content...

ℹ️  PDF files require text extraction for optimization. The original formatting 
will be preserved in the final output, but the comparison view shows the 
extracted text content.

⏳ Please wait while we process your document...`;
  }
  
  if (fileType.includes('word') || fileType.includes('document')) {
    return `📝 Word Document: ${fileName} (${fileSize} KB)

📋 Processing Status: Reading document content...

ℹ️  Word documents maintain better formatting during processing.

⏳ Please wait while we process your document...`;
  }
  
  return `📄 Document: ${fileName} (${fileSize} KB)

📋 Processing Status: Reading file content...

⏳ Please wait while we process your document...`;
};

/**
 * Enhanced comparison view formatting
 */
export const formatForComparison = (text, isOriginal = false) => {
  if (!text) {
    return isOriginal 
      ? 'Original resume content will appear here after processing...'
      : 'Optimized resume content will appear here...';
  }
  
  const formatted = formatResumeText(text);
  
  if (isOriginal) {
    return `📄 ORIGINAL RESUME
${'═'.repeat(50)}

${formatted}`;
  }
  
  return formatted;
};
