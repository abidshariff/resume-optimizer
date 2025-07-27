# Resume Optimizer

A web application that uses AI to optimize resumes based on job descriptions.

## Architecture

This application uses a serverless architecture on AWS:

- **Frontend**: React application hosted on AWS Amplify
- **Backend**: AWS Lambda functions, API Gateway, and Amazon Bedrock for AI processing
- **Storage**: Amazon S3 for file storage and DynamoDB for user history
- **Authentication**: Amazon Cognito for user management

### Architecture Diagram

```
┌─────────────────┐     ┌───────────────┐     ┌───────────────────┐
│                 │     │               │     │                   │
│  React Frontend ├─────►  API Gateway  ├─────►  Resume Processor │
│  (AWS Amplify)  │     │               │     │  Lambda Function  │
│                 │     └───────┬───────┘     └─────────┬─────────┘
└────────┬────────┘             │                       │
         │                      │                       │ Async
         │                      │                       │ Invoke
         │                      │                       ▼
┌────────▼────────┐     ┌───────▼───────┐     ┌─────────────────┐
│                 │     │               │     │                 │
│  Status Checker ◄─────┤     S3        │     │   AI Handler    │
│  (Client-side)  │     │  Bucket       ◄─────┤  Lambda Function│
│                 │     │               │     │                 │
└─────────────────┘     └───────────────┘     └────────┬────────┘
                                                       │
                                                       │
                                              ┌────────▼────────┐
                                              │                 │
                                              │ Amazon Bedrock  │
                                              │ (Claude 3)      │
                                              │                 │
                                              └─────────────────┘
```

In this architecture:

1. The React Frontend sends resume and job description to API Gateway
2. API Gateway triggers the Resume Processor Lambda function
3. Resume Processor stores files in S3 and asynchronously invokes the AI Handler
4. AI Handler processes the resume with Amazon Bedrock (Claude 3 Sonnet)
5. AI Handler stores results and status updates in S3
6. The Status Checker (client-side component in AsyncResumeOptimizer.js) polls S3 for job status
7. When complete, the frontend downloads the optimized resume from S3

## Features

- Upload resumes in PDF, Word (.docx), or text formats
- Enter job descriptions to target your resume optimization
- AI-powered resume optimization using Amazon Bedrock (Claude 3 Sonnet)
- Download optimized resumes in Word or text formats
- User authentication and history tracking
- Responsive design with Material UI components

## Project Structure

```
resume-optimizer/
├── frontend/                      # React frontend application
│   ├── public/                    # Public assets
│   │   ├── index.html             # HTML entry point
│   │   └── manifest.json          # Web app manifest
│   └── src/                       # React source code
│       ├── App.js                 # Main application component
│       ├── AsyncResumeOptimizer.js # Async resume processing component (includes Status Checker)
│       ├── config.js              # Application configuration
│       ├── index.js               # JavaScript entry point
│       └── index.css              # Global styles
├── backend/                       # AWS backend resources
│   ├── lambda-functions/          # Lambda function code
│   │   ├── resume-processor/      # Processes uploaded resumes
│   │   │   └── index.py           # Resume processor Lambda code
│   │   └── ai-handler/            # Handles AI optimization
│   │       └── index.py           # AI handler Lambda code
│   └── templates/                 # CloudFormation templates
│       └── resume-optimizer-stack.yaml # Main infrastructure stack
├── processor/                     # Additional processing utilities
├── deploy-stack.sh                # Script to deploy CloudFormation stack
├── deploy-frontend.sh             # Script to deploy frontend to S3/CloudFront
├── install-packages.sh            # Script to install required packages
├── cleanup.sh                     # Script to clean up AWS resources
└── amplify.yml                    # AWS Amplify configuration
```

## Deployment Instructions

### Backend Deployment

1. Deploy the CloudFormation stack using the provided script:

```bash
./deploy-stack.sh
```

This script will:
- Create or update the CloudFormation stack
- Set up all required AWS resources (Lambda, API Gateway, S3, DynamoDB, Cognito)
- Output the resource identifiers needed for frontend configuration

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

#### Option 1: AWS Amplify (Recommended)

The frontend can be deployed automatically through AWS Amplify when changes are pushed to the Git repository.

1. Connect your repository to AWS Amplify
2. Amplify will use the `amplify.yml` file in the repository root for build settings
3. Set the following environment variables in the AWS Amplify Console:
   - `REACT_APP_USER_POOL_ID`: Cognito User Pool ID
   - `REACT_APP_USER_POOL_WEB_CLIENT_ID`: Cognito User Pool Client ID
   - `REACT_APP_API_ENDPOINT`: API Gateway endpoint URL

#### Option 2: CloudFront/S3

Alternatively, the frontend can be deployed using CloudFront and S3 with the provided script:

```bash
./deploy-frontend.sh
```

This script will:
1. Create an S3 bucket for frontend hosting
2. Configure the bucket for website hosting
3. Upload the built React application to the S3 bucket
4. Create a CloudFront distribution with the S3 bucket as the origin
5. Set up appropriate permissions and CORS settings

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

1. Create a `.env` file in the frontend directory with the following variables:
```
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=<your-user-pool-id>
REACT_APP_USER_POOL_WEB_CLIENT_ID=<your-user-pool-client-id>
REACT_APP_API_ENDPOINT=<your-api-endpoint>
```

2. Install dependencies and start the development server:
```bash
cd frontend
npm install
npm start
```

This will start a development server at http://localhost:3000.

## Current Deployment

The application is currently deployed with the following resources:

- **Frontend URL**: https://main.d3tjpmlvy19b2l.amplifyapp.com
- **API Endpoint**: https://xnmokev79k.execute-api.us-east-1.amazonaws.com/dev/optimize
- **User Pool ID**: us-east-1_LEo2udjvD
- **User Pool Client ID**: bajpb891n9e4rb005mhnqg60

## Cleanup

To remove all AWS resources created for this project, run:

```bash
./cleanup.sh
```

This will delete the CloudFormation stack and all associated resources.
