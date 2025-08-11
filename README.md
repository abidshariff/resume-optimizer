# JobTailorAI

A production-ready, AI-powered web application that intelligently optimizes resumes and generates cover letters based on job descriptions. Features advanced job URL extraction, real-time preview, side-by-side comparison, and comprehensive user management.

## 🚀 Key Features

### Core AI Capabilities
- **AI-Powered Resume Optimization**: Uses Amazon Bedrock (Claude 3 Sonnet) for intelligent resume enhancement with dynamic prompt templates
- **Cover Letter Generation**: AI-generated personalized cover letters with company research integration
- **ATS Scoring**: Applicant Tracking System compatibility scoring with detailed feedback
- **Smart Job URL Extraction**: Automatically extracts job details from major job boards (LinkedIn, Indeed, Glassdoor, company career pages)
- **Dynamic Skills Enhancement**: Intelligent skill extraction and enhancement based on job requirements

### User Experience
- **Multi-Format Support**: Upload PDF, Word (.docx), or text files
- **Real-Time Preview**: See formatted preview of optimized resumes and cover letters
- **Side-by-Side Comparison**: Compare original vs optimized content with smart formatting
- **Multiple Output Formats**: Download in PDF, Word, or text format
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: User-customizable interface themes

### Professional Features
- **User Authentication**: Secure registration and login with AWS Cognito
- **History Tracking**: Complete optimization history with search and filtering
- **Batch Processing**: Handle multiple resume optimizations efficiently
- **Progress Tracking**: Real-time status updates during processing
- **Error Recovery**: Robust error handling with user-friendly messages

## 🏗️ Architecture

This application uses a serverless architecture on AWS with advanced AI processing capabilities:

- **Frontend**: React application with Material-UI components (deployable on AWS Amplify or S3/CloudFront)
- **Backend**: AWS Lambda functions with API Gateway for serverless processing
- **AI Processing**: Amazon Bedrock (Claude 3 Sonnet) with custom prompt templates
- **Storage**: Amazon S3 for file storage and DynamoDB for user history
- **Authentication**: Amazon Cognito for user management
- **Job Data Extraction**: Dedicated Lambda function for parsing job URLs from major job boards

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
                                              ┌────────▼────────┐
                                              │                 │
                                              │ Amazon Bedrock  │
                                              │ (Claude 3)      │
                                              │                 │
                                              └─────────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │                 │
                                              │ Job URL         │
                                              │ Extractor       │
                                              │ Lambda Function │
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
│   │   │   ├── FormatSelector.js      # Output format selection
│   │   │   ├── ProcessingIndicator.js # Real-time progress tracking
│   │   │   ├── LoadingScreen.js       # Loading animations
│   │   │   ├── ProfileDialog.js       # User profile management
│   │   │   ├── SettingsDialog.js      # Application settings
│   │   │   └── ...                    # Other components
│   │   ├── contexts/                  # React contexts
│   │   │   ├── ThemeContext.js        # Dark/light theme management
│   │   │   ├── LoadingContext.js      # Loading state management
│   │   │   └── AuthContext.js         # Authentication context
│   │   ├── utils/                     # Utility functions
│   │   │   ├── logger.js              # Conditional logging utility
│   │   │   └── sessionManager.js      # Session management
│   │   ├── App.js                     # App entry point
│   │   └── index.js                   # React DOM entry point
│   ├── package.json                   # Frontend dependencies
│   └── .env                          # Environment variables template
├── backend/
│   ├── lambda-functions/              # AWS Lambda functions
│   │   ├── ai-handler/               # AI processing logic
│   │   │   ├── index.py              # Main AI handler
│   │   │   ├── prompt_template.py    # Dynamic prompt generation
│   │   │   ├── enhanced_word_generator.py # Word document generation
│   │   │   ├── pdf_generator.py      # PDF generation
│   │   │   ├── skills_manager.py     # Skills extraction and enhancement
│   │   │   ├── minimal_word_generator.py # Lightweight Word generation
│   │   │   └── requirements.txt      # Python dependencies
│   │   ├── job-url-extractor/        # Job URL parsing service
│   │   │   ├── index.py              # Job data extraction logic
│   │   │   └── requirements.txt      # Web scraping dependencies
│   │   ├── resume-processor/         # File processing
│   │   │   └── index.py              # Resume file handling
│   │   ├── status-checker/           # Status polling
│   │   │   └── index.py              # Processing status updates
│   │   └── contact-handler/          # Contact form handler
│   │       └── index.py              # Contact form processing
│   └── templates/
│       └── resume-optimizer-stack.yaml # CloudFormation template
├── deploy.sh                         # One-click deployment script
├── cleanup.sh                        # Resource cleanup script
├── amplify.yml                       # AWS Amplify configuration
├── test_*.py                         # Testing scripts
├── *.md                              # Documentation files
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
- `JOB_URL_EXTRACTOR_FUNCTION`: Job URL extraction Lambda function name

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

# Test job URL extraction
python test_job_url_extractor.py

# Test resume optimization with real data
python test_resume_optimization.py

# Test skills extraction and enhancement
python test_skills_system.py
```

### Frontend Testing

```bash
cd frontend
npm test                    # Run unit tests
npm run test:integration   # Run integration tests
npm run build              # Test production build
```

### End-to-End Testing

The project includes comprehensive test scripts:

- **`test_resume_optimization.py`**: Tests complete resume optimization workflow
- **`test_job_url_extractor.py`**: Tests job URL extraction from major job boards
- **`test_skills_system.py`**: Tests skills extraction and enhancement
- **`test_netflix_extraction.py`**: Tests Netflix job posting extraction
- **`simple_resume_test.py`**: Simple resume optimization test

## 📊 Monitoring & Logging

- **CloudWatch Logs**: All Lambda functions log to CloudWatch
- **API Gateway Logs**: Request/response logging enabled
- **Error Tracking**: Comprehensive error handling with user-friendly messages
- **Performance Metrics**: Lambda duration, memory usage, and error rates
- **Cost Monitoring**: AI usage tracking and cost optimization scripts

### Cost Management

The project includes AI cost monitoring:

```bash
# Monitor AI costs and usage
./monitor-ai-costs.sh

# View detailed cost breakdown
aws logs filter-log-events \
  --log-group-name /aws/lambda/ResumeOptimizerAIHandler-prod \
  --filter-pattern "BEDROCK_COST"
```

## 🔒 Security Features

- **Authentication**: AWS Cognito user pools with email verification
- **Authorization**: JWT token-based API access
- **CORS**: Properly configured for frontend domains
- **Input Validation**: Comprehensive validation on all inputs
- **File Security**: Secure file upload with type validation
- **Data Privacy**: User data isolated by user ID
- **Rate Limiting**: API throttling to prevent abuse
- **Encryption**: Data encrypted at rest and in transit

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend domain is in the CORS configuration
2. **Bedrock Access**: Verify Claude 3 models are enabled in your AWS region
3. **Lambda Timeouts**: Check CloudWatch logs for performance issues
4. **Authentication Issues**: Verify Cognito configuration matches frontend
5. **Job URL Extraction Failures**: Check supported job board formats
6. **ATS Scoring Issues**: Verify anthropic_version parameter in Claude requests

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

# View job URL extractor logs
./view-job-extractor-logs.sh

# Verify AI handler deployment
./verify-ai-handler.sh
```

### Performance Optimization

- **Lambda Layers**: Shared dependencies for faster cold starts
- **S3 Transfer Acceleration**: Faster file uploads
- **CloudFront CDN**: Optimized content delivery
- **Minimal Deployments**: Reduced package sizes for faster deployments

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

## 📈 Advanced Features

### Job URL Extraction

Supports extraction from:
- **LinkedIn**: Job postings and company pages
- **Indeed**: Job listings with full descriptions
- **Glassdoor**: Company reviews and job postings
- **Company Career Pages**: Direct company job postings
- **Netflix**: Specialized Netflix job extraction
- **Mastercard**: Custom Mastercard job parsing

### AI Prompt Engineering

- **Dynamic Prompt Templates**: Contextual prompts based on job requirements
- **Experience Level Detection**: Automatic seniority level determination
- **Role Type Classification**: Technical, Management, or Analytical roles
- **Skills Enhancement**: Intelligent skill extraction and improvement
- **ATS Optimization**: Keyword optimization for Applicant Tracking Systems

### Company Research Integration

- **Company Mission Alignment**: Incorporates company values in cover letters
- **Recent News Integration**: Includes relevant company updates
- **Culture Fit Analysis**: Matches candidate profile to company culture
- **Industry Insights**: Contextual industry knowledge integration

## 🔄 Deployment Strategies

### Environment Management

```bash
# Development environment
./deploy.sh dev

# Testing environment with validation
./deploy.sh test

# Production deployment with rollback capability
./deploy.sh prod
```

### Blue-Green Deployment

The system supports blue-green deployments for zero-downtime updates:

1. Deploy to staging environment
2. Run comprehensive tests
3. Switch traffic to new version
4. Monitor for issues
5. Rollback if necessary

### Rollback Procedures

```bash
# Emergency rollback
./emergency-recovery.sh

# Revert to previous version
./deploy-reverted-backend.sh
```

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
