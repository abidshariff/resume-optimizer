# Resume Optimizer - New AWS Account Deployment Guide

This guide will help you deploy the Resume Optimizer application to a new AWS account.

## 🔧 Prerequisites

1. **AWS Account**: A new AWS account with administrative access
2. **AWS CLI**: Installed and configured
3. **Node.js**: Version 14 or higher
4. **Git**: For cloning and managing the repository

## 📋 Quick Start

### Step 1: Configure AWS CLI

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region (recommend: `us-east-1`)
- Default output format: `json`

### Step 2: Deploy Complete Application

Run the automated deployment script:

```bash
./deploy-to-new-account.sh
```

This script will:
- ✅ Verify AWS CLI configuration
- 🏗️ Deploy backend infrastructure (CloudFormation)
- 🔄 Update Lambda functions with code
- 📝 Create frontend environment configuration
- 🏗️ Build the frontend application

## 🏗️ Manual Deployment Steps

If you prefer manual deployment or need to troubleshoot:

### Backend Deployment

1. **Deploy CloudFormation Stack**:
   ```bash
   ./deploy-stack.sh
   ```

2. **Update Lambda Functions**:
   ```bash
   # Resume Processor
   cd backend/lambda-functions/resume-processor
   zip -r function.zip index.py
   aws lambda update-function-code \
     --function-name ResumeOptimizerProcessor-dev \
     --zip-file fileb://function.zip
   
   # AI Handler
   cd ../ai-handler
   zip -r function.zip index.py
   aws lambda update-function-code \
     --function-name ResumeOptimizerAIHandler-dev \
     --zip-file fileb://function.zip
   ```

3. **Get Stack Outputs**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name resume-optimizer-stack \
     --query "Stacks[0].Outputs"
   ```

### Frontend Deployment

You have three options for frontend deployment:

#### Option 1: AWS Amplify (Recommended)

```bash
./deploy-frontend-amplify.sh
```

Or manually:
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" > "Host web app"
3. Connect your GitHub repository
4. Set environment variables:
   - `REACT_APP_AWS_REGION`
   - `REACT_APP_USER_POOL_ID`
   - `REACT_APP_USER_POOL_WEB_CLIENT_ID`
   - `REACT_APP_API_ENDPOINT`
5. Deploy

#### Option 2: S3 + CloudFront

```bash
./deploy-frontend-s3.sh
```

#### Option 3: Manual S3 Deployment

```bash
# Build frontend
cd frontend
npm install
npm run build

# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Upload files
aws s3 sync build/ s3://your-bucket-name --delete

# Configure static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

## 🔧 Configuration

### Environment Variables

Create `frontend/.env` with these values (obtained from CloudFormation outputs):

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/optimize
```

### AWS Resources Created

The deployment creates these AWS resources:

- **Amazon Cognito**: User Pool and User Pool Client for authentication
- **AWS Lambda**: Two functions (Resume Processor and AI Handler)
- **Amazon API Gateway**: REST API for backend communication
- **Amazon S3**: Bucket for file storage
- **Amazon DynamoDB**: Table for user history
- **IAM Roles**: For Lambda function permissions

## 🧪 Testing the Deployment

1. **Backend API Test**:
   ```bash
   curl -X POST https://your-api-endpoint/optimize \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-jwt-token" \
     -d '{"test": "data"}'
   ```

2. **Frontend Test**:
   - Visit your deployed frontend URL
   - Try user registration with email/username
   - Test login functionality
   - Upload a resume and job description
   - Verify optimization process works

## 🔍 Troubleshooting

### Common Issues

1. **AWS CLI Not Configured**:
   ```bash
   aws configure
   ```

2. **Lambda Function Update Fails**:
   - Check function names match your environment
   - Verify IAM permissions

3. **Frontend Build Fails**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **CORS Issues**:
   - Check API Gateway CORS configuration
   - Verify frontend domain in CORS settings

### Logs and Monitoring

- **Lambda Logs**: CloudWatch Logs
- **API Gateway Logs**: CloudWatch Logs
- **Frontend Errors**: Browser Developer Console

## 🧹 Cleanup

To remove all resources:

```bash
./cleanup.sh
```

Or manually:
```bash
aws cloudformation delete-stack --stack-name resume-optimizer-stack
```

## 📞 Support

If you encounter issues:

1. Check CloudFormation stack events
2. Review Lambda function logs in CloudWatch
3. Verify IAM permissions
4. Check API Gateway configuration

## 🔄 Updates

To update the application:

1. Make code changes
2. Commit to Git
3. Re-run deployment scripts
4. For frontend-only changes, just rebuild and redeploy frontend

---

**Note**: This deployment guide assumes you're deploying to a fresh AWS account. Adjust resource names and configurations as needed for your specific requirements.
