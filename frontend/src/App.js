import React, { useState } from 'react';
import { API, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeName(file.name);
      
      // Read the file as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setResume(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleOptimize = async () => {
    if (!resume || !jobDescription) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Use Amplify's API.post method with authentication
      const response = await API.post('resumeOptimizer', '/optimize', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        },
        body: {
          resume: resume,
          jobDescription: jobDescription
        }
      });
      
      if (response.optimizedResumeUrl) {
        // Fetch the optimized resume content
        const resumeResponse = await fetch(response.optimizedResumeUrl);
        if (!resumeResponse.ok) {
          throw new Error('Failed to fetch optimized resume');
        }
        
        const resumeText = await resumeResponse.text();
        setOptimizedResume(resumeText);
      } else {
        throw new Error('No optimized resume URL returned');
      }
    } catch (error) {
      console.error('Error optimizing resume:', error);
      setError(`Error optimizing resume: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Wrap the app with Authenticator for user authentication
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="container">
          <div className="header">
            <h1>Resume Optimizer</h1>
            <p>Upload your resume and job description to get an AI-optimized resume</p>
            <div className="user-info">
              <p>Welcome, {user.username}</p>
              <button onClick={signOut} className="btn btn-secondary">Sign Out</button>
            </div>
          </div>
          
          <div className="card">
            <div className="form-group">
              <label htmlFor="resume">Upload Resume (PDF or Word)</label>
              <input 
                type="file" 
                id="resume" 
                className="form-control"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
              />
              {resumeName && <p>Selected file: {resumeName}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea 
                id="jobDescription" 
                className="form-control"
                value={jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste job description here..."
                rows={10}
              />
            </div>
            
            <button 
              className="btn"
              onClick={handleOptimize}
              disabled={!resume || !jobDescription || isProcessing}
            >
              {isProcessing ? 'Optimizing...' : 'Optimize Resume'}
            </button>
            
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>
          
          {isProcessing && (
            <div className="card">
              <p>Processing your resume with AI...</p>
              <div className="spinner"></div>
            </div>
          )}
          
          {optimizedResume && (
            <div className="card results-section">
              <h2>Optimized Resume</h2>
              <div className="resume-preview">
                {optimizedResume}
              </div>
              <button 
                className="btn"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  const blob = new Blob([optimizedResume], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'optimized-resume.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                Download Optimized Resume
              </button>
            </div>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;
