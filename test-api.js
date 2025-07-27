// Simple test script to debug the API response
const axios = require('axios');

const API_ENDPOINT = 'https://xnmokev79k.execute-api.us-east-1.amazonaws.com/dev/optimize';

// Test payload
const testPayload = {
  resume: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC4xOzN1TcKZW5kc3RyZWFtCmVuZG9iago=', // Simple PDF header
  jobDescription: 'Test job description for debugging',
  outputFormat: 'word'
};

async function testAPI() {
  try {
    console.log('Testing API endpoint:', API_ENDPOINT);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post(API_ENDPOINT, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        // Note: This test doesn't include authentication
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Error testing API:');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testAPI();
