const AWS = require('aws-sdk');

// Test the API with proper Cognito authentication
async function testAuthenticatedAPI() {
    console.log('Testing authenticated API call...');
    
    // You would need to create a test user and get a JWT token
    // For now, let's check if the Lambda function can be invoked directly
    
    const lambda = new AWS.Lambda({ region: 'us-east-1' });
    
    try {
        // Test the Resume Processor Lambda directly
        const testPayload = {
            body: JSON.stringify({
                resume: 'data:text/plain;base64,' + Buffer.from('Test resume content').toString('base64'),
                jobDescription: 'Test job description',
                outputFormat: 'word'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-id',
                        email: 'test@example.com'
                    }
                }
            }
        };
        
        console.log('Invoking Resume Processor Lambda...');
        const result = await lambda.invoke({
            FunctionName: 'ResumeOptimizerProcessor-dev',
            Payload: JSON.stringify(testPayload)
        }).promise();
        
        const response = JSON.parse(result.Payload);
        console.log('Lambda response:', response);
        
        if (response.statusCode === 200) {
            const body = JSON.parse(response.body);
            console.log('✅ Lambda function working correctly');
            console.log('Response body:', body);
            
            if (body.jobId) {
                console.log('✅ Job ID returned:', body.jobId);
            } else {
                console.log('❌ No job ID in response');
            }
        } else {
            console.log('❌ Lambda function returned error:', response);
        }
        
    } catch (error) {
        console.error('Error invoking Lambda:', error.message);
        
        if (error.code === 'AccessDenied') {
            console.log('❌ Access denied - check your AWS credentials and permissions');
        }
    }
    
    // Test the API Gateway authorizer
    console.log('\n--- Testing API Gateway Configuration ---');
    
    const apigateway = new AWS.APIGateway({ region: 'us-east-1' });
    
    try {
        // List REST APIs to find our API
        const apis = await apigateway.getRestApis().promise();
        const resumeAPI = apis.items.find(api => 
            api.name.includes('ResumeOptimizer') || 
            api.name.includes('resume-optimizer')
        );
        
        if (resumeAPI) {
            console.log('✅ Found API Gateway:', resumeAPI.name);
            console.log('API ID:', resumeAPI.id);
            
            // Get the authorizers
            const authorizers = await apigateway.getAuthorizers({
                restApiId: resumeAPI.id
            }).promise();
            
            console.log('Authorizers:', authorizers.items.map(auth => ({
                name: auth.name,
                type: auth.type,
                providerARNs: auth.providerARNs
            })));
            
        } else {
            console.log('❌ Resume Optimizer API not found');
        }
        
    } catch (error) {
        console.error('Error checking API Gateway:', error.message);
    }
}

// Run the test
testAuthenticatedAPI().catch(console.error);
