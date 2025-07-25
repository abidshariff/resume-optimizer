const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read the sample resume and job description
const resumePath = path.join(__dirname, 'frontend', 'sample_resume.txt');
const jobDescriptionPath = path.join(__dirname, 'frontend', 'sample_job_description.txt');

const resume = fs.readFileSync(resumePath, 'utf8');
const jobDescription = fs.readFileSync(jobDescriptionPath, 'utf8');

// Convert resume to base64
const resumeBase64 = Buffer.from(resume).toString('base64');

// Function to test the API
async function testApi() {
  try {
    console.log('Submitting resume optimization job...');
    
    // Submit the job
    const submitResponse = await axios.post('http://localhost:3001/optimize', {
      resume: `data:text/plain;base64,${resumeBase64}`,
      jobDescription,
      outputFormat: 'word'
    });
    
    console.log('Job submitted successfully!');
    console.log('Job ID:', submitResponse.data.jobId);
    console.log('Status:', submitResponse.data.status);
    console.log('Message:', submitResponse.data.message);
    
    // Poll for job status
    const jobId = submitResponse.data.jobId;
    let jobCompleted = false;
    
    console.log('\nPolling for job status...');
    
    while (!jobCompleted) {
      // Wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check job status
      const statusResponse = await axios.get(`http://localhost:3001/status?jobId=${jobId}`);
      console.log(`Status: ${statusResponse.data.status}, Message: ${statusResponse.data.message}`);
      
      if (statusResponse.data.status === 'COMPLETED') {
        jobCompleted = true;
        
        console.log('\nJob completed!');
        console.log('Download URL:', statusResponse.data.optimizedResumeUrl);
        console.log('Content Type:', statusResponse.data.contentType);
        console.log('File Type:', statusResponse.data.fileType);
        console.log('Download Filename:', statusResponse.data.downloadFilename);
        
        // Download the optimized resume
        console.log('\nDownloading optimized resume...');
        
        const downloadResponse = await axios.get(statusResponse.data.optimizedResumeUrl, {
          responseType: 'arraybuffer'
        });
        
        // Save the downloaded file
        const downloadPath = path.join(__dirname, statusResponse.data.downloadFilename);
        fs.writeFileSync(downloadPath, downloadResponse.data);
        
        console.log(`Optimized resume saved to: ${downloadPath}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testApi();
