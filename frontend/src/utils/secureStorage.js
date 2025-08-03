// Enhanced client-side storage with basic obfuscation
// Note: This is NOT secure against determined users, but adds friction

class SecureStorage {
  constructor() {
    this.key = 'jta_sub_data';
    this.salt = 'JobTailorAI_2024_Salt';
  }

  // Simple obfuscation (NOT encryption - just makes it less obvious)
  obfuscate(data) {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(jsonString);
    return encoded.split('').reverse().join('');
  }

  deobfuscate(obfuscatedData) {
    try {
      const reversed = obfuscatedData.split('').reverse().join('');
      const decoded = atob(reversed);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // Add timestamp and checksum for basic integrity
  createSecureData(subscriptionData) {
    const timestamp = Date.now();
    const data = {
      ...subscriptionData,
      timestamp,
      checksum: this.generateChecksum(subscriptionData, timestamp)
    };
    return data;
  }

  generateChecksum(data, timestamp) {
    const dataString = JSON.stringify(data) + timestamp + this.salt;
    // Simple hash (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  validateData(data) {
    if (!data || !data.timestamp || !data.checksum) {
      return false;
    }

    // Check if data is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > maxAge) {
      return false;
    }

    // Validate checksum
    const { checksum, timestamp, ...subscriptionData } = data;
    const expectedChecksum = this.generateChecksum(subscriptionData, timestamp);
    
    return checksum === expectedChecksum;
  }

  setSubscriptionData(subscriptionData) {
    const secureData = this.createSecureData(subscriptionData);
    const obfuscated = this.obfuscate(secureData);
    localStorage.setItem(this.key, obfuscated);
  }

  getSubscriptionData() {
    try {
      const obfuscated = localStorage.getItem(this.key);
      if (!obfuscated) return null;

      const data = this.deobfuscate(obfuscated);
      if (!this.validateData(data)) {
        // Clear invalid data
        localStorage.removeItem(this.key);
        return null;
      }

      const { checksum, timestamp, ...subscriptionData } = data;
      return subscriptionData;
    } catch (error) {
      // Clear corrupted data
      localStorage.removeItem(this.key);
      return null;
    }
  }

  clearSubscriptionData() {
    localStorage.removeItem(this.key);
  }

  // Additional protection: detect tampering attempts
  detectTampering() {
    const keys = Object.keys(localStorage);
    const suspiciousKeys = keys.filter(key => 
      key.includes('subscription') || 
      key.includes('premium') || 
      key.includes('tier') ||
      key.includes('resumeEdits')
    );

    // If user has manually added subscription-related keys, it's suspicious
    return suspiciousKeys.length > 1;
  }
}

export default new SecureStorage();
