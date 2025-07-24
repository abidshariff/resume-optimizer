import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import { CssBaseline } from '@mui/material';

// Configure Amplify
// Use the values from README.md as they are the correct ones
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev/optimize';
const userPoolId = process.env.REACT_APP_USER_POOL_ID || 'us-east-1_WFZ10DH6I';
const userPoolWebClientId = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '6bhk08l5egdqjgimmaau0jmrd6';

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
        email: true
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
