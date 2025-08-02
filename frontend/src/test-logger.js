/**
 * Test script for Logger utility
 * Run this to verify logging behavior in different environments
 */

import Logger from './utils/logger';

Logger.forceLog('=== Logger Test Script ===');
Logger.forceLog('NODE_ENV:', process.env.NODE_ENV);
Logger.forceLog('REACT_APP_TEST_MODE:', process.env.REACT_APP_TEST_MODE);
Logger.forceLog('');

Logger.forceLog('Testing Logger methods:');
Logger.forceLog('');

// Test all Logger methods
Logger.log('✅ Logger.log - This should show in development/test mode only');
Logger.error('❌ Logger.error - This should show in development/test mode only');
Logger.warn('⚠️ Logger.warn - This should show in development/test mode only');
Logger.info('ℹ️ Logger.info - This should show in development/test mode only');
Logger.debug('🐛 Logger.debug - This should show in development/test mode only');

Logger.forceLog('');
Logger.forceLog('Testing force methods (these always show):');
Logger.forceLog('🔥 Logger.forceLog - This ALWAYS shows regardless of environment');
Logger.forceError('💥 Logger.forceError - This ALWAYS shows regardless of environment');

Logger.forceLog('');
Logger.forceLog('=== End Logger Test ===');

export default function testLogger() {
  return 'Logger test completed - check console output';
}
