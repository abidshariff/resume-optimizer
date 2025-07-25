const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();
const lambda = new AWS.Lambda();

async function testDeployment() {
    console.log('🚀 Testing Resume Optimizer Deployment...\n');
    
    try {
        // Test 1: Check Cognito User Pool
        console.log('1. Testing Cognito User Pool...');
        const userPool = await cognito.describeUserPool({
            UserPoolId: 'us-east-1_RFsEVrGxp'
        }).promise();
        console.log('✅ Cognito User Pool is accessible');
        console.log(`   Pool Name: ${userPool.UserPool.Name}`);
        
        // Test 2: Check Lambda Functions
        console.log('\n2. Testing Lambda Functions...');
        
        const functions = [
            'ResumeOptimizerProcessor-dev',
            'ResumeOptimizerAIHandler-dev', 
            'ResumeOptimizerStatusChecker-dev'
        ];
        
        for (const functionName of functions) {
            try {
                const func = await lambda.getFunction({ FunctionName: functionName }).promise();
                console.log(`✅ ${functionName} is deployed`);
                console.log(`   Runtime: ${func.Configuration.Runtime}`);
                console.log(`   Last Modified: ${func.Configuration.LastModified}`);
            } catch (error) {
                console.log(`❌ ${functionName} is not accessible: ${error.message}`);
            }
        }
        
        // Test 3: Check API Gateway
        console.log('\n3. Testing API Gateway Endpoints...');
        
        const apiGateway = new AWS.APIGateway();
        const resources = await apiGateway.getResources({
            restApiId: 'x62c0f3cme'
        }).promise();
        
        console.log('✅ API Gateway is accessible');
        console.log('   Available endpoints:');
        resources.items.forEach(resource => {
            if (resource.resourceMethods) {
                const methods = Object.keys(resource.resourceMethods).join(', ');
                console.log(`   ${resource.path} [${methods}]`);
            }
        });
        
        // Test 4: Check S3 Bucket
        console.log('\n4. Testing S3 Storage...');
        const s3 = new AWS.S3();
        try {
            await s3.headBucket({ Bucket: 'resume-optimizer-storage-066148155043-dev' }).promise();
            console.log('✅ S3 bucket is accessible');
        } catch (error) {
            console.log(`❌ S3 bucket is not accessible: ${error.message}`);
        }
        
        // Test 5: Check DynamoDB Table
        console.log('\n5. Testing DynamoDB Table...');
        const dynamodb = new AWS.DynamoDB();
        try {
            const table = await dynamodb.describeTable({ 
                TableName: 'ResumeOptimizerUserHistory-dev' 
            }).promise();
            console.log('✅ DynamoDB table is accessible');
            console.log(`   Table Status: ${table.Table.TableStatus}`);
        } catch (error) {
            console.log(`❌ DynamoDB table is not accessible: ${error.message}`);
        }
        
        console.log('\n🎉 Deployment Test Complete!');
        console.log('\n📋 Summary:');
        console.log('   Frontend URL: https://main.d16ci5rhuvcide.amplifyapp.com');
        console.log('   API Endpoint: https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev');
        console.log('   Status Endpoint: https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/status');
        console.log('   User Pool ID: us-east-1_RFsEVrGxp');
        console.log('   User Pool Client ID: 4gpgj1rubf5v84kptlfhi8j6c6');
        
    } catch (error) {
        console.error('❌ Deployment test failed:', error.message);
    }
}

testDeployment();
