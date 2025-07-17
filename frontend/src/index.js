import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Configuration with environment variables for flexibility
const amplifyConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_SUJLMJ51w',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '11rgtlrprvpmtoga4l016bhhdr',
  },
  API: {
    endpoints: [
      {
        name: 'resumeOptimizer',
        endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://t7zfb4h9n7.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1'
      }
    ]
  }
};

// Initialize Amplify with configuration
Amplify.configure(amplifyConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
