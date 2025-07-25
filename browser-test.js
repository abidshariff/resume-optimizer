// Test script to run in browser console after signing in to the app
// This will help debug the API response issue

// Test function to call the API with proper authentication
async function testResumeOptimizerAPI() {
    console.log('🧪 Testing Resume Optimizer API...');
    
    try {
        // Import Amplify functions (these should be available in the browser)
        const { fetchAuthSession } = window.aws_amplify_auth || {};
        const { post } = window.aws_amplify_api || {};
        
        if (!fetchAuthSession || !post) {
            console.error('❌ Amplify functions not available. Make sure you are on the Resume Optimizer app page.');
            return;
        }
        
        // Get authentication token
        console.log('🔐 Getting authentication session...');
        const { tokens } = await fetchAuthSession();
        
        if (!tokens || !tokens.idToken) {
            console.error('❌ No authentication token. Please sign in first.');
            return;
        }
        
        console.log('✅ Authentication token obtained');
        console.log('Token length:', tokens.idToken.toString().length);
        
        // Create test payload
        const testPayload = {
            resume: 'data:text/plain;base64,' + btoa('This is a test resume content for API testing.'),
            jobDescription: 'This is a test job description for API testing.',
            outputFormat: 'word'
        };
        
        console.log('📤 Sending test request to API...');
        console.log('Payload size:', JSON.stringify(testPayload).length, 'bytes');
        
        // Make API call
        const response = await post({
            apiName: 'resumeOptimizer',
            path: '/optimize',
            options: {
                body: testPayload,
                headers: {
                    'Authorization': tokens.idToken.toString(),
                    'Content-Type': 'application/json'
                }
            }
        });
        
        console.log('📥 API Response received:');
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        console.log('Full response:', JSON.stringify(response, null, 2));
        
        // Check for jobId
        if (response && response.jobId) {
            console.log('✅ Job ID found:', response.jobId);
            console.log('✅ API is working correctly!');
            return response;
        } else if (response && response.response && response.response.jobId) {
            console.log('✅ Job ID found in wrapped response:', response.response.jobId);
            console.log('✅ API is working correctly (response is wrapped)!');
            return response.response;
        } else {
            console.log('❌ No job ID found in response');
            console.log('This is the issue causing the error in your app');
            return response;
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Instructions for use
console.log(`
🔧 Resume Optimizer API Test Script Loaded!

To test the API:
1. Make sure you are signed in to the Resume Optimizer app
2. Open browser console (F12)
3. Run: testResumeOptimizerAPI()

This will help identify why the API is returning {"response":{}} instead of a proper job ID.
`);

// Make the function available globally
window.testResumeOptimizerAPI = testResumeOptimizerAPI;
