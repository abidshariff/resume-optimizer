// Comprehensive API debugging script
// Run this in your browser console after signing in

window.debugResumeAPI = async function() {
    console.log('🔍 Starting comprehensive API debug...');
    
    try {
        // Check if we're on the right page
        if (!window.location.href.includes('amplifyapp.com') && !window.location.href.includes('localhost')) {
            console.warn('⚠️ Make sure you are on the Resume Optimizer app page');
        }
        
        // Check Amplify configuration
        console.log('📋 Checking Amplify configuration...');
        const amplifyConfig = window.aws_amplify_core?.Amplify?.getConfig?.() || {};
        console.log('Amplify config:', amplifyConfig);
        
        // Check authentication
        console.log('🔐 Checking authentication...');
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession();
        
        console.log('Auth session:', {
            tokens: session.tokens ? 'Present' : 'Missing',
            credentials: session.credentials ? 'Present' : 'Missing',
            identityId: session.identityId || 'None'
        });
        
        if (!session.tokens?.idToken) {
            console.error('❌ No ID token found. Please sign in first.');
            return;
        }
        
        const idToken = session.tokens.idToken.toString();
        console.log('✅ ID token obtained, length:', idToken.length);
        
        // Test 1: Direct fetch to API
        console.log('\n🧪 Test 1: Direct fetch to API endpoint...');
        const apiEndpoint = 'https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/optimize';
        
        const testPayload = {
            resume: 'data:text/plain;base64,' + btoa('Test resume content'),
            jobDescription: 'Test job description',
            outputFormat: 'word'
        };
        
        try {
            const fetchResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken
                },
                body: JSON.stringify(testPayload)
            });
            
            console.log('Direct fetch response status:', fetchResponse.status);
            console.log('Direct fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));
            
            const fetchResponseText = await fetchResponse.text();
            console.log('Direct fetch response body:', fetchResponseText);
            
            if (fetchResponse.ok) {
                const fetchResponseJson = JSON.parse(fetchResponseText);
                console.log('✅ Direct fetch successful:', fetchResponseJson);
                
                if (fetchResponseJson.jobId) {
                    console.log('✅ Job ID found in direct fetch:', fetchResponseJson.jobId);
                } else {
                    console.log('❌ No job ID in direct fetch response');
                }
            } else {
                console.log('❌ Direct fetch failed with status:', fetchResponse.status);
            }
        } catch (fetchError) {
            console.error('❌ Direct fetch error:', fetchError);
        }
        
        // Test 2: Amplify API call
        console.log('\n🧪 Test 2: Amplify API call...');
        try {
            const { post } = await import('aws-amplify/api');
            
            const amplifyResponse = await post({
                apiName: 'resumeOptimizer',
                path: '/optimize',
                options: {
                    body: testPayload,
                    headers: {
                        'Authorization': idToken,
                        'Content-Type': 'application/json'
                    }
                }
            });
            
            console.log('Amplify response type:', typeof amplifyResponse);
            console.log('Amplify response keys:', amplifyResponse ? Object.keys(amplifyResponse) : 'null');
            console.log('Amplify response:', JSON.stringify(amplifyResponse, null, 2));
            
            // Check various possible locations for jobId
            const possibleJobIds = [
                amplifyResponse?.jobId,
                amplifyResponse?.response?.jobId,
                amplifyResponse?.body?.jobId,
                amplifyResponse?.data?.jobId
            ];
            
            console.log('Possible job ID locations:', possibleJobIds);
            
            const foundJobId = possibleJobIds.find(id => id);
            if (foundJobId) {
                console.log('✅ Job ID found:', foundJobId);
            } else {
                console.log('❌ No job ID found in any expected location');
            }
            
        } catch (amplifyError) {
            console.error('❌ Amplify API error:', amplifyError);
            console.error('Error details:', {
                name: amplifyError.name,
                message: amplifyError.message,
                response: amplifyError.response
            });
        }
        
        // Test 3: Check Lambda function directly (if possible)
        console.log('\n🧪 Test 3: Checking Lambda function status...');
        try {
            // This won't work from browser, but let's try to get some info
            console.log('Cannot directly invoke Lambda from browser, but API Gateway should handle this');
        } catch (e) {
            console.log('Expected: Cannot access Lambda directly from browser');
        }
        
        console.log('\n✅ Debug complete. Check the logs above for issues.');
        
    } catch (error) {
        console.error('❌ Debug script error:', error);
    }
};

console.log(`
🔧 Enhanced API Debug Script Loaded!

To run the comprehensive debug:
1. Sign in to the Resume Optimizer app
2. Open browser console (F12)
3. Run: debugResumeAPI()

This will test both direct fetch and Amplify API calls to identify the issue.
`);
