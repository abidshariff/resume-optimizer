# JobTailorAI

A production-ready web application that uses AI to optimize resumes based on job descriptions, featuring real-time preview and side-by-side comparison capabilities.

## 🚀 Features

- **AI-Powered Optimization**: Uses Amazon Bedrock (Claude 3 Sonnet) for intelligent resume enhancement
- **Multi-Format Support**: Upload PDF, Word (.docx), or text files
- **Real-Time Preview**: See formatted preview of your optimized resume
- **Side-by-Side Comparison**: Compare original vs optimized resume with smart formatting
- **Professional Output**: Download optimized resumes in Word format
- **User Authentication**: Secure user registration and login with AWS Cognito
- **History Tracking**: Keep track of all your resume optimizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

This application uses a serverless architecture on AWS:

- **Frontend**: React application (deployable on AWS Amplify or S3/CloudFront)
- **Backend**: AWS Lambda functions with API Gateway
- **AI Processing**: Amazon Bedrock (Claude 3 Sonnet)
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

## 📁 Project Structure

```
resume-optimizer/
├── frontend/                           # React frontend application
│   ├── public/                         # Static assets
│   ├── src/
│   │   ├── components/                 # React components
│   │   │   ├── MainApp.js             # Main application logic
│   │   │   ├── LandingPage.js         # Landing page component
│   │   │   └── ...                    # Other components
│   │   ├── contexts/                  # React contexts
│   │   ├── App.js                     # App entry point
│   │   └── index.js                   # React DOM entry point
│   ├── package.json                   # Frontend dependencies
│   └── .env                          # Environment variables template
├── backend/
│   ├── lambda-functions/              # AWS Lambda functions
│   │   ├── ai-handler/               # AI processing logic
│   │   │   ├── index.py              # Main AI handler
│   │   │   ├── enhanced_word_generator.py
│   │   │   ├── pdf_generator.py
│   │   │   └── ...                   # Word generation utilities
│   │   ├── resume-processor/         # File processing
│   │   │   └── index.py
│   │   ├── status-checker/           # Status polling
│   │   │   └── index.py
│   │   └── contact-handler/          # Contact form handler
│   │       └── index.py
│   └── templates/
│       └── resume-optimizer-stack.yaml # CloudFormation template
├── deploy.sh                         # One-click deployment script
├── cleanup.sh                        # Resource cleanup script
├── amplify.yml                       # AWS Amplify configuration
└── README.md                         # This file
```

## 🚀 Quick Deployment

### Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **jq installed** for JSON parsing
3. **Access to Amazon Bedrock** (Claude 3 models enabled in your region)

### One-Click Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd resume-optimizer

# Deploy to production (default)
./deploy.sh

# Or deploy to specific environment
./deploy.sh dev    # Development
./deploy.sh test   # Testing
./deploy.sh prod   # Production
```

The deployment script will:
- ✅ Deploy CloudFormation infrastructure
- ✅ Update all Lambda functions
- ✅ Configure API Gateway and CORS
- ✅ Set up S3 buckets and DynamoDB tables
- ✅ Configure Cognito authentication
- ✅ Provide frontend configuration details

### Frontend Deployment

After backend deployment, configure your frontend:

#### Option 1: AWS Amplify (Recommended)

1. Connect your repository to AWS Amplify
2. Set environment variables in Amplify Console:
   ```
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_USER_POOL_ID=us-east-1_PdEKfFD9v
   REACT_APP_USER_POOL_WEB_CLIENT_ID=sp5dfgb8mr3066luhs7e8h2rr
   REACT_APP_API_ENDPOINT=https://giocwxtmw9.execute-api.us-east-1.amazonaws.com/prod
   ```
3. Deploy automatically via Git push

#### Option 2: Manual Build & Deploy

```bash
cd frontend
npm install
npm run build

# Deploy build/ directory to your hosting platform
```

## 🛠️ Local Development

### Backend Development

```bash
# Test Lambda functions locally (requires AWS SAM CLI)
sam local start-api

# Or test individual functions
sam local invoke AIHandlerFunction -e events/test-event.json
```

### Frontend Development

```bash
cd frontend
npm install

# Create .env file with your backend endpoints
cp .env.example .env
# Edit .env with your values

npm start  # Starts development server at http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**:
```
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_PdEKfFD9v
REACT_APP_USER_POOL_WEB_CLIENT_ID=sp5dfgb8mr3066luhs7e8h2rr
REACT_APP_API_ENDPOINT=https://giocwxtmw9.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_TEST_MODE=false
```

**Backend (Lambda Environment Variables)**:
- `STORAGE_BUCKET`: S3 bucket for file storage
- `USER_HISTORY_TABLE`: DynamoDB table for user history

### Logging Configuration

The application uses a custom Logger utility for conditional console output:
- **Development**: Console logging enabled for debugging
- **Production**: Console logging disabled for security and performance
- **Test Mode**: Can be enabled via `REACT_APP_TEST_MODE=true`

See `frontend/LOGGING.md` for detailed logging configuration and best practices.

### AWS Permissions Required

The deployment requires the following AWS permissions:
- CloudFormation: Full access
- Lambda: Full access
- API Gateway: Full access
- S3: Full access
- DynamoDB: Full access
- Cognito: Full access
- IAM: Role and policy management
- Bedrock: Model access (Claude 3)

## 🧪 Testing

### Backend Testing

```bash
# Test API endpoints
curl -X POST https://your-api-endpoint/optimize \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test Lambda functions
aws lambda invoke \
  --function-name ResumeOptimizerAIHandler-prod \
  --payload '{"test": "data"}' \
  response.json
```

### Frontend Testing

```bash
cd frontend
npm test                    # Run unit tests
npm run test:integration   # Run integration tests
npm run build              # Test production build
```

## 📊 Monitoring & Logging

- **CloudWatch Logs**: All Lambda functions log to CloudWatch
- **API Gateway Logs**: Request/response logging enabled
- **Error Tracking**: Comprehensive error handling with user-friendly messages
- **Performance Metrics**: Lambda duration, memory usage, and error rates

## 🔒 Security Features

- **Authentication**: AWS Cognito user pools with email verification
- **Authorization**: JWT token-based API access
- **CORS**: Properly configured for frontend domains
- **Input Validation**: Comprehensive validation on all inputs
- **File Security**: Secure file upload with type validation
- **Data Privacy**: User data isolated by user ID

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend domain is in the CORS configuration
2. **Bedrock Access**: Verify Claude 3 models are enabled in your AWS region
3. **Lambda Timeouts**: Check CloudWatch logs for performance issues
4. **Authentication Issues**: Verify Cognito configuration matches frontend

### Debug Commands

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name resume-optimizer-stack-prod

# View Lambda logs
aws logs tail /aws/lambda/ResumeOptimizerAIHandler-prod --follow

# Test API Gateway
aws apigateway test-invoke-method \
  --rest-api-id your-api-id \
  --resource-id your-resource-id \
  --http-method POST
```

## 🧹 Cleanup

To remove all AWS resources:

```bash
./cleanup.sh prod  # Specify environment
```

This will delete:
- CloudFormation stack and all resources
- S3 buckets (after emptying them)
- Lambda functions
- API Gateway
- Cognito user pools
- DynamoDB tables

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review CloudWatch logs for error details
3. Open an issue in the repository
4. Contact the development team

---

**🎉 Ready to optimize resumes with AI? Deploy now and start helping users land their dream jobs!**
