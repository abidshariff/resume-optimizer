import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

function LoadingScreen({ 
  message = "Loading your workspace...",
  subtitle = "Optimize your career potential",
  showProgress = true,
  fullHeight = true 
}) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    "Initializing application...",
    "Loading user preferences...",
    "Setting up AI engine...",
    "Preparing workspace...",
    "Almost ready!"
  ];

  // Animate progress over 2 seconds
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Update current step based on progress
  useEffect(() => {
    const stepThreshold = 100 / loadingSteps.length;
    const newStep = Math.min(
      Math.floor(progress / stepThreshold),
      loadingSteps.length - 1
    );
    setCurrentStep(newStep);
  }, [progress, loadingSteps.length]);
  return (
    <Box sx={{ 
      minHeight: fullHeight ? '100vh' : '400px',
      bgcolor: '#f3f2ef', // Light gray background like LinkedIn
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      // Add global styles for animations
      '& @keyframes fadeInScale': {
        '0%': {
          opacity: 0,
          transform: 'scale(0.8)'
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)'
        }
      },
      '& @keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(20px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      },
      '& @keyframes shimmer': {
        '0%': {
          transform: 'translateX(-100%)'
        },
        '100%': {
          transform: 'translateX(100%)'
        }
      },
      '& @keyframes pulse': {
        '0%, 100%': {
          opacity: 1
        },
        '50%': {
          opacity: 0.7
        }
      },
      '& @keyframes slideProgress': {
        '0%': {
          transform: 'translateX(-100%)'
        },
        '100%': {
          transform: 'translateX(0%)'
        }
      },
      '& @keyframes glowPulse': {
        '0%, 100%': {
          boxShadow: '0 0 5px rgba(10, 102, 194, 0.3)'
        },
        '50%': {
          boxShadow: '0 0 20px rgba(10, 102, 194, 0.6)'
        }
      }
    }}>
      {/* Main Logo and Brand */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4
      }}>
        {/* Logo Icon */}
        <Box sx={{ 
          mb: 3,
          animation: 'fadeInScale 0.8s ease-out'
        }}>
          <AutoAwesomeIcon sx={{ 
            fontSize: 64, 
            color: '#0A66C2',
            filter: 'drop-shadow(0 2px 8px rgba(10, 102, 194, 0.2))',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </Box>

        {/* Brand Name */}
        <Typography variant="h3" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          mb: 1,
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          JobTailorAI
        </Typography>

        {/* Tagline */}
        <Typography variant="h6" sx={{ 
          color: 'rgba(0,0,0,0.6)',
          fontWeight: 400,
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          {subtitle}
        </Typography>
      </Box>

      {/* Loading Progress Bar */}
      {showProgress && (
        <Box sx={{ 
          width: '320px',
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          {/* Progress Bar Container */}
          <Box sx={{
            width: '100%',
            height: 8,
            backgroundColor: 'rgba(10, 102, 194, 0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(10, 102, 194, 0.2)',
            mb: 2
          }}>
            {/* Animated Progress Fill */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0A66C2 0%, #378FE9 50%, #4A9EFF 100%)',
              borderRadius: 4,
              transition: 'width 0.1s ease-out',
              animation: progress > 0 && progress < 100 ? 'glowPulse 1.5s ease-in-out infinite' : 'none'
            }} />
            
            {/* Shimmer Effect */}
            {progress > 0 && progress < 100 && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '30%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }} />
            )}
          </Box>
          
          {/* Progress Percentage */}
          <Typography variant="caption" sx={{ 
            display: 'block',
            textAlign: 'center',
            color: '#0A66C2',
            fontSize: '12px',
            fontWeight: 600,
            mb: 1
          }}>
            {Math.round(progress)}%
          </Typography>
          
          {/* Current Step */}
          <Typography variant="body2" sx={{ 
            color: 'rgba(0,0,0,0.7)',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 500,
            minHeight: '20px',
            transition: 'all 0.3s ease-in-out'
          }}>
            {progress < 100 ? loadingSteps[currentStep] : "Ready!"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default LoadingScreen;
