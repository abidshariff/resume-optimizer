import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import { CssBaseline } from '@mui/material';
import config from './config';

// Get API endpoint from environment variables or config
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://3bemzv60ge.execute-api.us-east-1.amazonaws.com/dev';
const userPoolId = process.env.REACT_APP_USER_POOL_ID || 'us-east-1_Hgs2gd3iK';
const userPoolWebClientId = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '6ql99bmnbe2fr2dcl8n5cda3de';

console.log('Configuring Amplify with:');
console.log('API Endpoint:', apiEndpoint);
console.log('User Pool ID:', userPoolId);
console.log('User Pool Web Client ID:', userPoolWebClientId);

// Configure Amplify for v6
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolWebClientId,
      loginWith: {
        username: true,
        email: true
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true
        }
      }
    }
  },
  API: {
    REST: {
      resumeOptimizer: {
        endpoint: apiEndpoint,
        region: 'us-east-1'
      }
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
