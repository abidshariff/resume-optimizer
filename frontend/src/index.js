import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import { CssBaseline } from '@mui/material';

// Configure Amplify
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev';
const userPoolId = process.env.REACT_APP_USER_POOL_ID || 'us-east-1_WFZ10DH6I';
const userPoolWebClientId = process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '6bhk08l5egdqjgimmaau0jmrd6';

console.log('Configuring Amplify with:');
console.log('API Endpoint:', apiEndpoint);
console.log('User Pool ID:', userPoolId);
console.log('User Pool Web Client ID:', userPoolWebClientId);

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: userPoolId,
    userPoolWebClientId: userPoolWebClientId,
    mandatorySignIn: true,
  },
  API: {
    endpoints: [
      {
        name: 'resumeOptimizer',
        endpoint: apiEndpoint,
        region: 'us-east-1',
        custom_header: async () => {
          try {
            const session = await Amplify.Auth.currentSession();
            const token = session.getIdToken().getJwtToken();
            console.log("Setting custom header with token:", token.substring(0, 20) + "...");
            return {
              'Authorization': token,
              'Content-Type': 'application/json'
            };
          } catch (error) {
            console.error('Error getting auth token:', error);
            return {};
          }
        }
      }
    ]
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
