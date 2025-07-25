const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json({ limit: '50mb' }));

// Store job statuses in memory (for testing purposes only)
const jobs = {};

// Endpoint to handle resume optimization requests
app.post('/optimize', (req, res) => {
  console.log('Received optimization request');
  
  const { resume, jobDescription, outputFormat } = req.body;
  
  if (!resume || !jobDescription) {
    console.log('Missing resume or job description');
    return res.status(400).json({ error: 'Resume and job description are required' });
  }
  
  // Generate a random job ID
  const jobId = 'job-' + Math.random().toString(36).substring(2, 10);
  
  // Store job status
  jobs[jobId] = {
    status: 'PROCESSING',
    message: 'Your resume is being processed...',
    startTime: Date.now()
  };
  
  console.log(`Job ${jobId} submitted for processing`);
  
  // Return job ID immediately
  res.json({
    jobId,
    status: 'PROCESSING',
    message: 'Job submitted and processing started'
  });
  
  // Simulate processing (complete after 5 seconds)
  setTimeout(() => {
    // Update job status to completed
    jobs[jobId] = {
      status: 'COMPLETED',
      message: 'Your resume has been successfully optimized!',
      optimizedResumeUrl: `http://localhost:${PORT}/download/${jobId}`,
      contentType: outputFormat === 'word' 
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        : 'text/plain',
      fileType: outputFormat === 'word' ? 'docx' : 'txt',
      downloadFilename: outputFormat === 'word' ? 'optimized_resume.docx' : 'optimized_resume.txt',
      completedAt: Date.now()
    };
    
    console.log(`Job ${jobId} completed`);
  }, 5000);
});

// Endpoint to check job status
app.get('/status', (req, res) => {
  console.log('Received status request');
  
  const { jobId } = req.query;
  
  console.log(`Checking status for job ${jobId}`);
  
  if (!jobId || !jobs[jobId]) {
    console.log(`Job ${jobId} not found`);
    return res.status(404).json({ error: 'Job not found' });
  }
  
  console.log(`Job ${jobId} status: ${jobs[jobId].status}`);
  res.json(jobs[jobId]);
});

// Endpoint to download optimized resume
app.get('/download/:jobId', (req, res) => {
  console.log('Received download request');
  
  const { jobId } = req.params;
  
  console.log(`Download request for job ${jobId}`);
  
  if (!jobId || !jobs[jobId] || jobs[jobId].status !== 'COMPLETED') {
    console.log(`Job ${jobId} not found or not completed`);
    return res.status(404).json({ error: 'Job not found or not completed' });
  }
  
  const job = jobs[jobId];
  
  // For testing, we'll just return a sample file
  const filePath = job.fileType === 'docx' 
    ? path.join(__dirname, 'sample_optimized_resume.docx')
    : path.join(__dirname, 'sample_optimized_resume.txt');
  
  console.log(`Sending file: ${filePath}`);
  
  // Check if the file exists, if not create a simple text file
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist`);
    
    if (job.fileType === 'txt') {
      console.log('Creating sample text file');
      fs.writeFileSync(filePath, 'This is a sample optimized resume in text format.');
    } else {
      // For docx, we can't easily create one on the fly, so return an error
      console.log('Sample DOCX file not found');
      return res.status(404).json({ error: 'Sample DOCX file not found' });
    }
  }
  
  res.setHeader('Content-Type', job.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${job.downloadFilename}"`);
  
  // Stream the file to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test API server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST http://localhost:${PORT}/optimize`);
  console.log(`- GET http://localhost:${PORT}/status?jobId=<jobId>`);
  console.log(`- GET http://localhost:${PORT}/download/<jobId>`);
});
