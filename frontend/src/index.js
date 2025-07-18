import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Configuration with environment variables for flexibility
const amplifyConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_WFZ10DH6I',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '6bhk08l5egdqjgimmaau0jmrd6',
  },
  API: {
    endpoints: [
      {
        name: 'resumeOptimizer',
        endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev/optimize',
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
