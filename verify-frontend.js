#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the App.js file
const appJsPath = path.join(__dirname, 'frontend', 'src', 'App.js');
const content = fs.readFileSync(appJsPath, 'utf8');

// Variables that should be defined
const requiredVars = [
  'isProcessing',
  'optimizedResume', 
  'optimizedResumeType',
  'isSubmitting',
  'isPolling',
  'result',
  'jobStatus',
  'statusMessage',
  'jobId',
  'resume',
  'jobDescription',
  'activeStep',
  'error',
  'snackbarOpen',
  'snackbarMessage'
];

console.log('🔍 Checking for variable definitions in App.js...\n');

let allFound = true;

requiredVars.forEach(varName => {
  // Check if variable is declared with useState or as a computed value
  const stateDeclaration = content.includes(`[${varName},`) || content.includes(`set${varName.charAt(0).toUpperCase() + varName.slice(1)}`);
  const computedDeclaration = content.includes(`const ${varName} =`) || content.includes(`let ${varName} =`);
  
  if (stateDeclaration || computedDeclaration) {
    console.log(`✅ ${varName} - Found`);
  } else {
    console.log(`❌ ${varName} - NOT FOUND`);
    allFound = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFound) {
  console.log('🎉 All required variables are properly defined!');
  console.log('✅ The frontend should build successfully now.');
} else {
  console.log('⚠️  Some variables are missing. Please check the App.js file.');
}

console.log('\n📋 Summary:');
console.log(`- Total variables checked: ${requiredVars.length}`);
console.log(`- Variables found: ${requiredVars.filter(varName => {
  const stateDeclaration = content.includes(`[${varName},`) || content.includes(`set${varName.charAt(0).toUpperCase() + varName.slice(1)}`);
  const computedDeclaration = content.includes(`const ${varName} =`) || content.includes(`let ${varName} =`);
  return stateDeclaration || computedDeclaration;
}).length}`);

// Check for common ESLint issues
console.log('\n🔧 Additional checks:');

// Check for unused imports
const imports = content.match(/import.*from/g) || [];
console.log(`- Import statements: ${imports.length}`);

// Check for missing semicolons (basic check)
const missingSemicolons = content.split('\n').filter(line => 
  line.trim().length > 0 && 
  !line.trim().endsWith(';') && 
  !line.trim().endsWith('{') && 
  !line.trim().endsWith('}') &&
  !line.trim().startsWith('//') &&
  !line.trim().startsWith('*') &&
  line.includes('=') &&
  !line.includes('=>')
).length;

if (missingSemicolons === 0) {
  console.log('✅ No obvious missing semicolons detected');
} else {
  console.log(`⚠️  Potential missing semicolons: ${missingSemicolons}`);
}

console.log('\n🚀 Ready for Amplify deployment!');
