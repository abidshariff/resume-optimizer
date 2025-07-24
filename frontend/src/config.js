// Configuration file for Resume Optimizer
// This file reads from environment variables set during deployment

const config = {
  // AWS Cognito Configuration
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH'
  },
  
  // API Configuration
  API: {
    endpoints: [
      {
        name: 'resumeOptimizer',
        endpoint: process.env.REACT_APP_API_ENDPOINT || '',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
      }
    ]
  },
  
  // Application Configuration
  App: {
    name: 'Resume Optimizer',
    version: '1.0.0',
    description: 'AI-powered resume optimization tool',
    supportedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    outputFormats: ['word', 'text'],
    defaultOutputFormat: 'word'
  }
};

// Validation function to check if all required config is present
export const validateConfig = () => {
  const errors = [];
  
  if (!config.Auth.userPoolId) {
    errors.push('REACT_APP_USER_POOL_ID is not set');
  }
  
  if (!config.Auth.userPoolWebClientId) {
    errors.push('REACT_APP_USER_POOL_WEB_CLIENT_ID is not set');
  }
  
  if (!config.API.endpoints[0].endpoint) {
    errors.push('REACT_APP_API_ENDPOINT is not set');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    return false;
  }
  
  return true;
};

export default config;
