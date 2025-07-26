import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import SimpleAuth from './SimpleAuth';
import MainApp from './components/MainApp';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import { LandingPage } from './components/LandingPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication */}
          <Route path="/auth" element={<SimpleAuth />} />
          
          {/* Protected App Routes */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<MainApp />} />
                <Route path="/upload" element={<MainApp />} />
                <Route path="/job-description" element={<MainApp />} />
                <Route path="/results" element={<MainApp />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
