// Test script to verify job URL extraction is working
const config = {
  API: {
    REST: {
      resumeOptimizer: {
        endpoint: 'https://giocwxtmw9.execute-api.us-east-1.amazonaws.com/prod'
      }
    }
  }
};

// Mock authentication token (you'll need to replace this with a real token)
const mockToken = 'your-auth-token-here';

async function testJobExtraction() {
  const testUrl = 'https://careers.netflix.com/jobs/123456';
  
  try {
    console.log('Testing job URL extraction...');
    console.log('URL:', testUrl);
    
    const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/extract-job-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockToken
      },
      body: JSON.stringify({
        jobUrl: testUrl
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✅ Extraction successful!');
      console.log('Job Title:', data.data.job_title);
      console.log('Company:', data.data.company);
      console.log('Location:', data.data.location);
      console.log('Description length:', data.data.description?.length || 0);
    } else {
      console.log('\n❌ Extraction failed');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Note: This is a test script - you need to provide a valid auth token to run it
console.log('Job URL extraction test script created.');
console.log('To run this test, you need to:');
console.log('1. Get a valid authentication token from your frontend');
console.log('2. Replace mockToken with the real token');
console.log('3. Run: node test-job-extraction.js');