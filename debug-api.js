const AWS = require('aws-sdk');

// Test the API Gateway endpoint directly
async function testAPI() {
    console.log('Testing API Gateway endpoint...');
    
    const apiEndpoint = 'https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev';
    
    // Test 1: Check if the API Gateway exists and is accessible
    try {
        const response = await fetch(`${apiEndpoint}/optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: 'data'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (response.status === 401) {
            console.log('\n❌ API requires authentication (401 Unauthorized)');
            console.log('This means the API Gateway is working but requires a valid JWT token');
        }
        
    } catch (error) {
        console.error('Error testing API:', error);
    }
    
    // Test 2: Check if the Lambda function exists
    console.log('\n--- Checking Lambda Functions ---');
    
    const lambda = new AWS.Lambda({ region: 'us-east-1' });
    
    try {
        const functions = await lambda.listFunctions().promise();
        const resumeFunctions = functions.Functions.filter(f => 
            f.FunctionName.includes('ResumeOptimizer') || 
            f.FunctionName.includes('resume-optimizer')
        );
        
        console.log('Found Resume Optimizer Lambda functions:');
        resumeFunctions.forEach(func => {
            console.log(`- ${func.FunctionName} (${func.Runtime})`);
        });
        
        if (resumeFunctions.length === 0) {
            console.log('❌ No Resume Optimizer Lambda functions found');
        }
        
    } catch (error) {
        console.error('Error checking Lambda functions:', error.message);
        console.log('Make sure you have AWS credentials configured');
    }
    
    // Test 3: Check Cognito User Pool
    console.log('\n--- Checking Cognito User Pool ---');
    
    const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
    
    try {
        const userPool = await cognito.describeUserPool({
            UserPoolId: 'us-east-1_RFsEVrGxp'
        }).promise();
        
        console.log('✅ User Pool exists:', userPool.UserPool.Name);
        console.log('User Pool Status:', userPool.UserPool.Status);
        
        // Check user pool client
        const client = await cognito.describeUserPoolClient({
            UserPoolId: 'us-east-1_RFsEVrGxp',
            ClientId: '4gpgj1rubf5v84kptlfhi8j6c6'
        }).promise();
        
        console.log('✅ User Pool Client exists:', client.UserPoolClient.ClientName);
        
    } catch (error) {
        console.error('Error checking Cognito:', error.message);
    }
}

// Run the test
testAPI().catch(console.error);
