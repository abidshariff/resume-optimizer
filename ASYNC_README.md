# Resume Optimizer - Asynchronous Processing Implementation

This implementation solves the timeout issues by converting the resume optimization process from synchronous to asynchronous processing.

## Problem Solved

- **Original Issue**: Lambda functions taking 31 seconds but REST API Gateway timing out at 29 seconds
- **Solution**: Asynchronous processing pattern that returns immediately and allows polling for results

## Architecture Changes

### New Flow
1. Client submits resume + job description to `/optimize` endpoint
2. API immediately returns with a `jobId` and status `PROCESSING`
3. Client polls `/status?jobId=xxx` endpoint every 3 seconds
4. When status becomes `COMPLETED`, client downloads the optimized resume

### New Components

1. **Updated Resume Processor Lambda** (`index_async.py`)
   - Returns immediately with job ID
   - Invokes AI Handler asynchronously
   - Stores job status in S3

2. **Updated AI Handler Lambda** (`index_async.py`)
   - Updates job status throughout processing
   - Handles long-running AI operations
   - Stores final results and status

3. **New Status Checker Lambda** (`status-checker/index.py`)
   - Checks job status from S3
   - Returns current status and results when complete

4. **New API Endpoint**: `/status`
   - GET endpoint for checking job status
   - Requires `jobId` query parameter

## Deployment Instructions

### 1. Deploy the New Stack

```bash
# Make the deployment script executable (if not already done)
chmod +x deploy-async.sh

# Deploy to dev environment
./deploy-async.sh dev

# Or deploy to prod environment
./deploy-async.sh prod
```

### 2. Manual Deployment (Alternative)

```bash
# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file backend/templates/resume-optimizer-async-stack.yaml \
  --stack-name resume-optimizer-async-stack \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=dev

# Update Lambda functions
cd backend/lambda-functions/resume-processor
cp index_async.py index.py
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerProcessor-dev \
  --zip-file fileb://function.zip

cd ../ai-handler
cp index_async.py index.py
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-dev \
  --zip-file fileb://function.zip

cd ../status-checker
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerStatusChecker-dev \
  --zip-file fileb://function.zip
```

### 3. Update Frontend

Replace your existing resume optimizer component with the new `AsyncResumeOptimizer.js` component, or update your existing component to use the new asynchronous flow.

### 4. Update Amplify Configuration

Update your Amplify environment variables with the new API endpoints:

```javascript
// In your Amplify configuration
const config = {
  API: {
    endpoints: [
      {
        name: "resumeOptimizerApi",
        endpoint: "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev",
        region: "us-east-1"
      }
    ]
  }
};
```

## API Reference

### POST /optimize

Submit a resume optimization job.

**Request Body:**
```json
{
  "resume": "base64-encoded-file-content",
  "jobDescription": "Job description text"
}
```

**Response (202 Accepted):**
```json
{
  "message": "Resume optimization job submitted",
  "jobId": "uuid-job-id",
  "status": "PROCESSING"
}
```

### GET /status?jobId={jobId}

Check the status of a resume optimization job.

**Query Parameters:**
- `jobId`: The job ID returned from the optimize endpoint

**Response Examples:**

*Processing:*
```json
{
  "status": "PROCESSING",
  "message": "Processing resume and job description",
  "timestamp": "2024-07-23T18:00:00.000Z",
  "jobId": "uuid-job-id"
}
```

*Completed:*
```json
{
  "status": "COMPLETED",
  "message": "Resume optimization complete",
  "timestamp": "2024-07-23T18:01:30.000Z",
  "jobId": "uuid-job-id",
  "optimizedResumeUrl": "https://presigned-s3-url",
  "fileType": "txt",
  "contentType": "text/plain",
  "downloadFilename": "optimized_resume_12345678.txt"
}
```

*Failed:*
```json
{
  "status": "FAILED",
  "message": "Error message describing what went wrong",
  "timestamp": "2024-07-23T18:00:30.000Z",
  "jobId": "uuid-job-id"
}
```

## Status Values

- `PROCESSING`: Job is being processed
- `COMPLETED`: Job completed successfully, results available
- `FAILED`: Job failed, error message provided

## Frontend Implementation Example

```javascript
// Submit job
const response = await API.post('resumeOptimizerApi', '/optimize', {
  body: { resume: base64Resume, jobDescription: jobDesc }
});

const jobId = response.jobId;

// Poll for status
const pollStatus = async () => {
  const status = await API.get('resumeOptimizerApi', '/status', {
    queryStringParameters: { jobId }
  });
  
  if (status.status === 'COMPLETED') {
    // Download result
    window.open(status.optimizedResumeUrl, '_blank');
  } else if (status.status === 'FAILED') {
    // Handle error
    console.error(status.message);
  } else {
    // Continue polling
    setTimeout(pollStatus, 3000);
  }
};

pollStatus();
```

## Benefits

1. **No Timeouts**: Jobs can run for up to 5 minutes (Lambda max timeout)
2. **Better UX**: Users get immediate feedback and can see progress
3. **Scalability**: Multiple jobs can be processed concurrently
4. **Reliability**: Long-running operations complete successfully
5. **Monitoring**: Real-time status updates and error handling

## Monitoring and Debugging

- Job statuses are stored in S3 under `users/{userId}/status/{jobId}/status.json`
- CloudWatch logs are available for all Lambda functions
- DynamoDB stores job history for completed jobs
- Pre-signed URLs for downloads expire after 1 hour

## Migration from Synchronous Version

1. Deploy the new asynchronous stack
2. Update your frontend to use the new polling pattern
3. Test thoroughly with the new endpoints
4. Update your Amplify configuration
5. Optionally, clean up the old synchronous stack

The asynchronous version is backward compatible in terms of authentication and basic functionality, but the API response format has changed to support the new flow.
