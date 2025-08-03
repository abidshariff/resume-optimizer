import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionTier, setSubscriptionTier] = useState('free'); // 'free' or 'premium'
  const [resumeEditsUsed, setResumeEditsUsed] = useState(0);
  const [isPaywallEnabled, setIsPaywallEnabled] = useState(false);

  // Check if paywall is enabled from environment variables
  useEffect(() => {
    const paywallEnabled = process.env.REACT_APP_PAYWALL_ENABLED === 'true';
    setIsPaywallEnabled(paywallEnabled);
    
    // Load user's subscription data from localStorage
    const savedTier = localStorage.getItem('subscriptionTier') || 'free';
    const savedEdits = parseInt(localStorage.getItem('resumeEditsUsed') || '0');
    
    setSubscriptionTier(savedTier);
    setResumeEditsUsed(savedEdits);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('subscriptionTier', subscriptionTier);
    localStorage.setItem('resumeEditsUsed', resumeEditsUsed.toString());
  }, [subscriptionTier, resumeEditsUsed]);

  const incrementResumeEdits = () => {
    if (subscriptionTier === 'free') {
      setResumeEditsUsed(prev => prev + 1);
    }
  };

  const upgradeToPremium = () => {
    setSubscriptionTier('premium');
    // Reset edit count when upgrading
    setResumeEditsUsed(0);
  };

  const downgradeToFree = () => {
    setSubscriptionTier('free');
    setResumeEditsUsed(0);
  };

  // Check if user has reached free tier limit
  const hasReachedFreeLimit = () => {
    return subscriptionTier === 'free' && resumeEditsUsed >= 3;
  };

  // Check if user can perform an action
  const canUseFeature = (feature) => {
    if (!isPaywallEnabled) return true; // If paywall is disabled, allow everything
    if (subscriptionTier === 'premium') return true; // Premium users can use everything

    // Free tier restrictions
    switch (feature) {
      case 'resume_edit':
        return resumeEditsUsed < 3;
      case 'preview':
      case 'compare':
      case 'save_to_profile':
        return false; // These features are premium-only
      default:
        return true;
    }
  };

  const getRemainingEdits = () => {
    if (subscriptionTier === 'premium') return 'Unlimited';
    return Math.max(0, 3 - resumeEditsUsed);
  };

  const value = {
    subscriptionTier,
    resumeEditsUsed,
    isPaywallEnabled,
    incrementResumeEdits,
    upgradeToPremium,
    downgradeToFree,
    hasReachedFreeLimit,
    canUseFeature,
    getRemainingEdits,
    isPremium: subscriptionTier === 'premium',
    isFree: subscriptionTier === 'free'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
