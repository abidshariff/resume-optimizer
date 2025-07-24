#!/bin/bash

# Cleanup script for resume-optimizer project
echo "Cleaning up unnecessary files..."

# Remove test files
rm -f test-resume.txt test-resume.pdf test-job-description.txt Abid_Shaik_DataEngineer.pdf
rm -f test-event.json payload.json response.json optimized_resume.txt

# Remove temporary zip files
rm -f processor.zip processor_updated.zip processor_reverted.zip status_checker.zip
rm -f lambda-deployment.zip frontend-deployment.zip

# Remove duplicate documentation files
rm -f ASYNC_README.md S3_PERMISSION_FIX.md CORS_FIX_APPLIED.md DEPLOYMENT_SUMMARY.md
rm -f AMPLIFY_UPDATE_GUIDE.md WORD_FEATURE_TEST.md WORD_DOCUMENT_FEATURE.md
rm -f PORTABLE_DEPLOYMENT.md CLEAN_STRUCTURE.md

# Remove redundant scripts
rm -f update-cors.sh update-cors-fixed.sh fix-cors.sh fix-cors-post.sh fix-cors-direct.sh
rm -f fix-options-method.sh update-lambda-with-docx.sh update-lambda.sh update-lambda-functions.sh
rm -f update-lambda-and-cors.sh test-api.sh test-api-with-auth.sh
rm -f retry-deploy.sh redeploy-stack.sh deploy-new-stack.sh delete-and-deploy-stack.sh
rm -f deploy-async.sh test-async.py status_checker.py
rm -f verify-frontend.js update-frontend-config.sh restore-frontend-config.sh
rm -f deploy-portable.sh cleanup-for-portable.sh

# Remove virtual environment
rm -rf pdf_env

# Remove node_modules (can be reinstalled with npm install)
rm -rf frontend/node_modules

# Remove .kiro directory (appears to be a temporary directory)
rm -rf .kiro

# Remove build.zip (can be regenerated)
rm -f frontend/build.zip

# Remove test_word_generation.py (appears to be a test script)
rm -f test_word_generation.py

# Keep only the necessary build files
# The build directory can be regenerated from the frontend source
# but we'll keep it for now as it might be needed for deployment

echo "Cleanup complete!"
echo "The following core files and directories have been preserved:"
echo "- README.md: Project documentation"
echo "- backend/: Contains Lambda functions and CloudFormation templates"
echo "- frontend/: Contains React application source code"
echo "- processor/: Contains resume processor code"
echo "- build/: Contains built frontend application"
echo "- deploy-stack.sh: Script to deploy the CloudFormation stack"
echo "- deploy-frontend.sh: Script to deploy the frontend"
echo "- install-packages.sh: Script to install required packages"
echo "- amplify.yml: Configuration for AWS Amplify"
echo "- cors-config.json: CORS configuration for API Gateway"
echo "- updated-ai-handler-policy.json: IAM policy for AI handler Lambda"
echo "- .gitignore: Git ignore file"
