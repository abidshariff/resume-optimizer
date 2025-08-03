import { fetchAuthSession } from 'aws-amplify/auth';
import config from '../config';

class SubscriptionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getAuthHeaders() {
    const { tokens } = await fetchAuthSession();
    return {
      'Authorization': tokens.idToken.toString(),
      'Content-Type': 'application/json'
    };
  }

  async getUserSubscription() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/subscription`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }

      const data = await response.json();
      return {
        tier: data.tier || 'free',
        resumeEditsUsed: data.resumeEditsUsed || 0,
        resumeEditsLimit: data.resumeEditsLimit || 3,
        features: data.features || []
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Fallback to free tier on error
      return {
        tier: 'free',
        resumeEditsUsed: 0,
        resumeEditsLimit: 3,
        features: []
      };
    }
  }

  async canUseFeature(feature) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/subscription/can-use/${feature}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return false; // Deny access on error
      }

      const data = await response.json();
      return data.canUse === true;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false; // Deny access on error
    }
  }

  async incrementUsage(feature) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/subscription/increment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ feature })
      });

      if (!response.ok) {
        throw new Error(`Failed to increment usage: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  async upgradeToPremium(paymentToken) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/subscription/upgrade`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentToken })
      });

      if (!response.ok) {
        throw new Error(`Failed to upgrade: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();
