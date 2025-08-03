// Example of how to modify handleOptimize for server-side validation

const handleOptimizeSecure = async () => {
  if (!resume || !jobDescription) {
    setSnackbarMessage('Please upload a resume and enter a job description');
    setSnackbarOpen(true);
    return;
  }

  setIsSubmitting(true);
  setError(null);
  setJobStatus('SUBMITTING');
  setStatusMessage('Validating subscription and submitting...');
  
  try {
    const selectedFormat = userSettings.defaultOutputFormat || 'docx';
    
    const payload = {
      resume: resume,
      jobDescription: jobDescription,
      outputFormat: selectedFormat,
      // Let server validate subscription
      requestType: 'resume_optimization'
    };
    
    const { tokens } = await fetchAuthSession();
    const idToken = tokens.idToken.toString();
    
    const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/optimize`, {
      method: 'POST',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    // Server returns specific error for subscription limits
    if (response.status === 402) { // Payment Required
      setPaywallFeature('resume_edit');
      setPaywallModalOpen(true);
      setIsSubmitting(false);
      return;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    if (responseData && responseData.jobId) {
      setJobId(responseData.jobId);
      setJobStatus(responseData.status || 'PROCESSING');
      setStatusMessage(responseData.message || 'Job submitted and processing started');
      setIsPolling(true);
      setIsSubmitting(false);
      
      // Server has already incremented usage, just update local state
      if (responseData.subscriptionData) {
        updateLocalSubscriptionState(responseData.subscriptionData);
      }
      
      navigate('/app/results');
    } else {
      throw new Error('No job ID returned from the API');
    }
  } catch (error) {
    Logger.error('Error submitting job:', error);
    setError(`Error submitting job: ${error.message}`);
    setIsSubmitting(false);
  }
};
