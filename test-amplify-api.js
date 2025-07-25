// Test AWS Amplify API call pattern
import { Amplify } from 'aws-amplify';
import { post } from 'aws-amplify/api';

// Configure Amplify
Amplify.configure({
  API: {
    REST: {
      resumeOptimizer: {
        endpoint: 'https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev',
        region: 'us-east-1'
      }
    }
  }
});

async function testAmplifyAPI() {
  try {
    console.log('Testing AWS Amplify API call pattern...');
    
    const result = post({
      apiName: 'resumeOptimizer',
      path: '/optimize',
      options: {
        body: {
          resume: 'test-resume-data',
          jobDescription: 'test job description',
          outputFormat: 'word'
        }
      }
    });
    
    console.log('Result from post():', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    
    if (result.response) {
      console.log('Found response property, awaiting...');
      const responseData = await result.response;
      console.log('Response data:', responseData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAmplifyAPI();
