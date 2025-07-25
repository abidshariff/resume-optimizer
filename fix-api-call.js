// Fixed handleOptimize function for App.js
// This addresses the authentication and API response handling issues

const handleOptimize = async () => {
  if (!resume || !jobDescription) {
    setSnackbarMessage('Please upload a resume and enter a job description');
    setSnackbarOpen(true);
    return;
  }

  setIsSubmitting(true);
  setError(null);
  setJobStatus('SUBMITTING');
  setStatusMessage('Submitting your resume for optimization...');
  
  try {
    console.log("Starting resume optimization...");
    
    // Check payload size before sending
    const payload = {
      resume: resume,
      jobDescription: jobDescription,
      outputFormat: outputFormat || 'word'
    };
    const payloadSize = new Blob([JSON.stringify(payload)]).size;
    console.log(`Payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (payloadSize > 10 * 1024 * 1024) { // 10MB limit
      throw new Error(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)} MB. Maximum allowed is 10 MB.`);
    }
    
    // For local development, use a proxy or mock API response
    if (window.location.hostname === 'localhost') {
      console.log("Local development detected, using mock API response");
      // Mock a successful response for local testing
      const mockResponse = {
        jobId: 'local-test-' + Date.now(),
        status: 'PROCESSING',
        message: 'Job submitted and processing started (mock)'
      };
      
      setJobId(mockResponse.jobId);
      setJobStatus(mockResponse.status);
      setStatusMessage(mockResponse.message);
      setIsPolling(true);
      setIsSubmitting(false);
      
      // Simulate a completed job after 5 seconds
      setTimeout(() => {
        setJobStatus('COMPLETED');
        setStatusMessage('Resume optimization completed (mock)');
        setResult({
          optimizedResume: 'This is a mock optimized resume for local testing.\n\nYour resume has been optimized for the job description.',
          optimizedResumeUrl: '#',
          contentType: 'text/plain',
          fileType: 'txt'
        });
        setIsPolling(false);
        setActiveStep(2);
      }, 5000);
      
      return;
    }
    
    try {
      // Get the current auth session to include the JWT token
      console.log("Getting auth session...");
      const { tokens } = await fetchAuthSession();
      
      if (!tokens || !tokens.idToken) {
        throw new Error('No authentication token available. Please sign in again.');
      }
      
      const idToken = tokens.idToken.toString();
      console.log("Auth token obtained, length:", idToken.length);
      
      // Submit the job and get job ID immediately
      console.log("Submitting job to API...");
      console.log("API endpoint:", 'https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/optimize');
      
      const responseData = await post({
        apiName: 'resumeOptimizer',
        path: '/optimize',
        options: {
          body: payload,
          headers: {
            'Authorization': idToken,
            'Content-Type': 'application/json'
          }
        }
      });
      
      console.log("API response received:", responseData);
      console.log("Response type:", typeof responseData);
      console.log("Response keys:", responseData ? Object.keys(responseData) : 'null');
      
      // Handle different response formats
      let actualResponse = responseData;
      
      // If the response is wrapped in a 'response' object, unwrap it
      if (responseData && responseData.response && typeof responseData.response === 'object') {
        actualResponse = responseData.response;
        console.log("Unwrapped response:", actualResponse);
      }
      
      // Check if we have a jobId in the response
      if (actualResponse && actualResponse.jobId) {
        console.log("Job ID found:", actualResponse.jobId);
        setJobId(actualResponse.jobId);
        setJobStatus(actualResponse.status || 'PROCESSING');
        setStatusMessage(actualResponse.message || 'Job submitted and processing started');
        setIsPolling(true);
        setIsSubmitting(false);
      } else {
        console.error("Invalid API response - no jobId found");
        console.error("Full response:", JSON.stringify(responseData, null, 2));
        console.error("Actual response:", JSON.stringify(actualResponse, null, 2));
        
        // Check if there's an error message in the response
        let errorMessage = 'No job ID returned from the API';
        if (actualResponse && actualResponse.error) {
          errorMessage = actualResponse.error;
        } else if (actualResponse && actualResponse.message) {
          errorMessage = actualResponse.message;
        } else if (responseData && responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData && responseData.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(`${errorMessage}. Response: ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      
      let errorMessage = error.message;
      
      // Handle specific error types
      if (error.name === 'NetworkError') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please sign out and sign in again.';
      } else if (error.message && error.message.includes('403')) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (error.message && error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(`Error submitting job: ${errorMessage}`);
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
      setJobStatus('FAILED');
      setIsSubmitting(false);
    }
  } catch (error) {
    console.error('Error in handleOptimize:', error);
    
    let errorMessage = error.message;
    
    setError(`Error submitting job: ${errorMessage}`);
    setSnackbarMessage(`Error: ${errorMessage}`);
    setSnackbarOpen(true);
    setJobStatus('FAILED');
    setIsSubmitting(false);
  }
};

// Export the function for use in App.js
module.exports = { handleOptimize };
