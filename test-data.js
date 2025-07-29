// Test script to add sample data to localStorage for testing the profile page
// Run this in the browser console after logging in

const sampleResumes = [
  {
    id: "1",
    title: "Software Engineer Resume - Google",
    description: "Optimized for Google software engineer position",
    jobTitle: "Software Engineer",
    format: "docx",
    downloadUrl: "https://example.com/resume1.docx",
    createdAt: new Date().toISOString(),
    originalJobDescription: "We are looking for a talented Software Engineer to join our team..."
  },
  {
    id: "2", 
    title: "Frontend Developer Resume - Meta",
    description: "Tailored for Meta frontend developer role",
    jobTitle: "Frontend Developer",
    format: "docx",
    downloadUrl: "https://example.com/resume2.docx",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    originalJobDescription: "Meta is seeking a Frontend Developer with React experience..."
  },
  {
    id: "3",
    title: "Full Stack Developer Resume - Amazon",
    description: "Customized for Amazon full stack position",
    jobTitle: "Full Stack Developer", 
    format: "txt",
    downloadUrl: "https://example.com/resume3.txt",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    originalJobDescription: "Amazon Web Services is looking for a Full Stack Developer..."
  }
];

// Add to localStorage
localStorage.setItem('savedResumes', JSON.stringify(sampleResumes));

console.log('Sample resumes added to localStorage!');
console.log('Navigate to /app/profile to see them.');
