import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { LoadingProvider } from './contexts/LoadingContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import SimpleAuth from './SimpleAuth';
import MainApp from './components/MainApp';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import NotFoundHandler from './components/NotFoundHandler';
import { theme } from './theme';
import { LandingPage } from './components/LandingPage';

function App() {
  return (
    <LoadingProvider>
      <SubscriptionProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Authentication - Protected against already authenticated users */}
              <Route path="/auth" element={
                <AuthGuard>
                  <SimpleAuth />
                </AuthGuard>
              } />
              
              {/* Protected App Routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <Routes>
                  <Route path="/" element={<Navigate to="/app/upload" replace />} />
                  <Route path="/upload" element={<MainApp />} />
                  <Route path="/job-description" element={<MainApp />} />
                  <Route path="/results" element={<MainApp />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* 404 Handler - attempts to redirect to correct route */}
            <Route path="/404" element={<NotFoundHandler />} />
            
            {/* Catch all route - redirect to 404 handler first, then landing */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
      </SubscriptionProvider>
    </LoadingProvider>
  );
}

export default App;
