/**
 * Logger utility for conditional console logging
 * Only logs in development mode or when explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTestMode = process.env.REACT_APP_TEST_MODE === 'true';

class Logger {
  static log(...args) {
    if (isDevelopment || isTestMode) {
      console.log(...args);
    }
  }

  static error(...args) {
    if (isDevelopment || isTestMode) {
      console.error(...args);
    }
  }

  static warn(...args) {
    if (isDevelopment || isTestMode) {
      console.warn(...args);
    }
  }

  static info(...args) {
    if (isDevelopment || isTestMode) {
      console.info(...args);
    }
  }

  static debug(...args) {
    if (isDevelopment || isTestMode) {
      console.debug(...args);
    }
  }

  // Force log - always logs regardless of environment (use sparingly)
  static forceLog(...args) {
    console.log(...args);
  }

  // Force error - always logs errors regardless of environment
  static forceError(...args) {
    console.error(...args);
  }
}

export default Logger;
