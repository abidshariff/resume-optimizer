// This is a test script to simulate the API response
// You can run this in the browser console to test the application's handling of Word documents

// Simulate a successful API response
const simulateSuccessfulResponse = () => {
  // Mock job ID
  const mockJobId = 'test-job-' + Math.random().toString(36).substring(2, 10);
  
  console.log('Simulating job submission with ID:', mockJobId);
  
  // Set the job ID in the application state
  // This assumes you have access to the React component's state setter functions
  if (typeof setJobId === 'function') {
    setJobId(mockJobId);
    setJobStatus('PROCESSING');
    setStatusMessage('Processing your resume...');
    setIsPolling(true);
    setIsSubmitting(false);
    
    console.log('Job ID set in application state');
  } else {
    console.error('setJobId function not available. Make sure you run this in the React component context.');
  }
  
  // After a delay, simulate a completed job
  setTimeout(() => {
    console.log('Simulating job completion');
    
    // Mock result with Word document URL
    const mockResult = {
      status: 'COMPLETED',
      message: 'Your resume has been successfully optimized!',
      jobId: mockJobId,
      optimizedResumeUrl: 'https://resume-optimizer-dev.s3.amazonaws.com/optimized/sample-resume.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileType: 'docx',
      downloadFilename: 'optimized_resume.docx'
    };
    
    // Update the application state with the result
    if (typeof setResult === 'function' && typeof setIsPolling === 'function') {
      setJobStatus('COMPLETED');
      setStatusMessage('Your optimized resume is ready!');
      setResult(mockResult);
      setIsPolling(false);
      setActiveStep(2);
      
      console.log('Result set in application state:', mockResult);
    } else {
      console.error('Required state setter functions not available.');
    }
  }, 3000);
};

// Instructions for testing
console.log(`
To test the application's handling of Word documents:

1. Upload a resume and enter a job description
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Copy the following variables from the React component:
   - setJobId
   - setJobStatus
   - setStatusMessage
   - setIsPolling
   - setIsSubmitting
   - setResult
   - setActiveStep
4. Run the simulateSuccessfulResponse() function

This will simulate a successful API response with a Word document.
`);

// Export the function for use in the browser console
window.simulateSuccessfulResponse = simulateSuccessfulResponse;
