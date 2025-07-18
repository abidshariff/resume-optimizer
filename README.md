# Resume Optimizer

A web application that uses AI to optimize resumes based on job descriptions.

## Architecture

This application uses a serverless architecture on AWS:

- **Frontend**: React application hosted on AWS Amplify or CloudFront/S3
- **Backend**: AWS Lambda functions, API Gateway, and Amazon Bedrock
- **Storage**: Amazon S3 for file storage and DynamoDB for user history
- **Authentication**: Amazon Cognito for user management

## Project Structure

```
resume-optimizer/
├── backend/
│   ├── lambda-functions/
│   │   ├── resume-processor/
│   │   │   └── index.py
│   │   └── ai-handler/
│   │       └── index.py
│   └── templates/
│       └── resume-optimizer-stack.yaml
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── src/
        ├── App.js
        ├── index.js
        └── index.css
```

## Deployment Instructions

### Backend Deployment

1. Deploy the CloudFormation template:

```bash
aws cloudformation deploy \
  --template-file backend/templates/resume-optimizer-stack.yaml \
  --stack-name resume-optimizer-stack \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=dev
```

2. Update the Lambda functions with the actual code:

```bash
# Package and update Resume Processor Lambda
cd backend/lambda-functions/resume-processor
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerProcessor-dev \
  --zip-file fileb://function.zip

# Package and update AI Handler Lambda
cd ../ai-handler
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-dev \
  --zip-file fileb://function.zip
```

3. Get the outputs from the CloudFormation stack:

```bash
aws cloudformation describe-stacks \
  --stack-name resume-optimizer-stack \
  --query "Stacks[0].Outputs"
```

### Frontend Deployment

#### Option 1: AWS Amplify

The frontend can be deployed automatically through AWS Amplify when changes are pushed to the Git repository.

#### Environment Variables

The following environment variables should be set in the AWS Amplify Console:

- `REACT_APP_USER_POOL_ID`: Cognito User Pool ID
- `REACT_APP_USER_POOL_WEB_CLIENT_ID`: Cognito User Pool Client ID
- `REACT_APP_API_ENDPOINT`: API Gateway endpoint URL

#### Option 2: CloudFront/S3

Alternatively, the frontend can be deployed using CloudFront and S3:

1. Create an S3 bucket for frontend hosting
2. Upload the built React application to the S3 bucket
3. Create a CloudFront distribution with the S3 bucket as the origin
4. Set up an Origin Access Identity (OAI) to secure the S3 bucket
5. Update the S3 bucket policy to allow access from CloudFront

## Current Deployment

The application is currently deployed with the following resources:

- **Frontend URL**: https://dw2t3tdxg9cog.cloudfront.net
- **API Endpoint**: https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev/optimize
- **User Pool ID**: us-east-1_WFZ10DH6I
- **User Pool Client ID**: 6bhk08l5egdqjgimmaau0jmrd6

## Local Development

### Backend Local Testing

You can test the Lambda functions locally using the AWS SAM CLI:

```bash
# Install AWS SAM CLI
pip install aws-sam-cli

# Test the Lambda functions
sam local invoke ResumeProcessorLambda -e events/test-event.json
```

### Frontend Local Development

```bash
cd frontend
npm install
npm start
```

This will start a development server at http://localhost:3000.
