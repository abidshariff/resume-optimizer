# Cover Letter Debug Guide

## Current Issue
- Cover letter text is being generated ✅
- Cover letter text is available in frontend ✅
- Cover letter URL is null/undefined ❌
- Cover letter Word document is not being uploaded to S3 ❌

## Debugging Steps

### 1. Check CloudWatch Logs
Look for these log messages in AWS CloudWatch for the AI Handler Lambda:

**Success Messages to Look For:**
```
CV toggle enabled: True
Company name key: [some-key]
Generating cover letter...
Cover letter generated successfully (length: [number])
Cover letter uploaded to S3 and download URL generated
```

**Error Messages to Look For:**
```
Error creating cover letter file: [error message]
Error generating cover letter: [error message]
```

### 2. Check AWS Lambda Function
Navigate to AWS Console → Lambda → `ResumeOptimizerAIHandler-[env]`

**Check Recent Invocations:**
1. Go to "Monitor" tab
2. Click "View logs in CloudWatch"
3. Look for recent log streams
4. Search for "cover letter" or "CV toggle"

### 3. Check S3 Bucket
Navigate to AWS Console → S3 → `resume-optimizer-storage-[id]-[env]`

**Look for Cover Letter Files:**
- Check if there's a `cover-letters/` folder
- Look for files like `[job-id]_cover_letter.docx`

### 4. Potential Backend Issues

#### Issue 1: Word Document Generation Error
The `create_cover_letter_word_document()` function might be failing:
- XML parsing errors
- Zipfile creation errors
- Memory issues with large cover letters

#### Issue 2: S3 Upload Permissions
The Lambda might not have permissions to:
- Create objects in the `cover-letters/` folder
- Generate pre-signed URLs for cover letter downloads

#### Issue 3: Exception Handling
The try-catch blocks might be catching errors and setting:
```python
cover_letter_url = None
cover_letter_filename = None
```

### 5. Quick Fixes

#### Frontend Workaround (Already Implemented)
- Download cover letter as text file when Word format fails
- Show "Download as Text" button as fallback

#### Backend Fix Options
1. **Add more logging** to identify exact failure point
2. **Check S3 permissions** for cover letter folder
3. **Test Word document generation** separately
4. **Verify pre-signed URL generation** works

### 6. Testing Steps

1. **Enable Generate CV toggle** ✅
2. **Provide company name** ✅
3. **Check browser console** for debug logs ✅
4. **Check CloudWatch logs** for backend errors
5. **Check S3 bucket** for uploaded files
6. **Use text download** as temporary workaround

### 7. Expected CloudWatch Log Flow

```
Received event: {...}
CV toggle enabled: True
Company name key: company-names/[job-id]_company_name.txt
Generating cover letter...
Cover letter generated successfully (length: 1234)
Cover letter uploaded to S3 and download URL generated
Resume optimization complete using claude-3-sonnet-20240229
```

If any of these steps are missing, that's where the issue is occurring.

## Current Status
- ✅ Frontend correctly sends `generateCV: true`
- ✅ Frontend correctly sends company name
- ✅ Backend receives the flags correctly
- ✅ Cover letter text is generated
- ❌ Cover letter Word document upload fails
- ❌ Cover letter download URL is not generated

## Next Steps
1. Check CloudWatch logs for the exact error
2. Verify S3 permissions for cover letter uploads
3. Test the Word document generation function
4. Use the text download workaround in the meantime
