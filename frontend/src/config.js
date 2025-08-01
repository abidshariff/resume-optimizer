// Configuration file for JobTailorAI
// This file reads from environment variables set during deployment

import Logger from './utils/logger';

const config = {
  // AWS Cognito Configuration
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_PdEKfFD9v',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || 'sp5dfgb8mr3066luhs7e8h2rr',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH'
  },
  
  // API Configuration
  API: {
    REST: {
      resumeOptimizer: {
        endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://giocwxtmw9.execute-api.us-east-1.amazonaws.com/prod',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
      }
    }
  },
  
  // Application Configuration
  App: {
    name: 'JobTailorAI',
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
  
  if (!config.API.REST.resumeOptimizer.endpoint) {
    errors.push('REACT_APP_API_ENDPOINT is not set');
  }
  
  if (errors.length > 0) {
    Logger.error('Configuration errors:', errors);
    return false;
  }
  
  return true;
};

export default config;
