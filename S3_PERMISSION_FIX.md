# S3 Permission Fix Applied - July 23, 2025

## Issue
The status checker Lambda function was getting AccessDenied errors when trying to read status files from S3:

```
Error retrieving status from S3: An error occurred (AccessDenied) when calling the GetObject operation: 
User: arn:aws:sts::273923386654:assumed-role/resume-optimizer-stack-ResumeProcessorRole-7lRDj6M3BRmD/ResumeOptimizerStatusChecker-dev 
is not authorized to perform: s3:GetObject on resource: "arn:aws:s3:::resume-optimizer-storage-273923386654-dev/users/.../status.json" 
because no identity-based policy allows the s3:GetObject action
```

## Root Cause
The `ResumeProcessorRole` used by the status checker Lambda function only had `s3:PutObject` permission but was missing `s3:GetObject` permission needed to read status files from S3.

## Fix Applied
Updated the `ResumeProcessorPolicy` inline policy to include both read and write permissions for S3.

### Before (Only Write Permission):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::resume-optimizer-storage-273923386654-dev/*",
      "Effect": "Allow"
    },
    {
      "Action": ["lambda:InvokeFunction"],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
```

### After (Read + Write Permission):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::resume-optimizer-storage-273923386654-dev/*",
      "Effect": "Allow"
    },
    {
      "Action": ["lambda:InvokeFunction"],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
```

## AWS CLI Command Used
```bash
aws iam put-role-policy \
  --role-name resume-optimizer-stack-ResumeProcessorRole-7lRDj6M3BRmD \
  --policy-name ResumeProcessorPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": ["s3:PutObject", "s3:GetObject"],
        "Resource": "arn:aws:s3:::resume-optimizer-storage-273923386654-dev/*",
        "Effect": "Allow"
      },
      {
        "Action": ["lambda:InvokeFunction"],
        "Resource": "*",
        "Effect": "Allow"
      }
    ]
  }'
```

## Status
✅ **FIXED** - The status checker Lambda function can now:
1. ✅ Read status files from S3 (`s3:GetObject`)
2. ✅ Write status files to S3 (`s3:PutObject`) 
3. ✅ Invoke other Lambda functions (`lambda:InvokeFunction`)

## Impact on Asynchronous Workflow
This fix completes the asynchronous resume optimization workflow:

1. ✅ **Job Submission**: Resume processor creates job and writes initial status to S3
2. ✅ **Status Polling**: Status checker can now read status files from S3
3. ✅ **Real-time Updates**: Frontend receives accurate status updates
4. ✅ **Job Completion**: Final results are properly retrieved

## Future Deployments
The CloudFormation template should be updated to include both `s3:GetObject` and `s3:PutObject` permissions in the `ResumeProcessorPolicy` to maintain this fix across deployments.

## Related Issues Fixed
- ✅ CORS issue with OPTIONS method (previous fix)
- ✅ File size validation for 413 errors (previous fix)  
- ✅ S3 permission issue for status checking (this fix)

The complete asynchronous resume optimization system is now fully operational! 🚀
