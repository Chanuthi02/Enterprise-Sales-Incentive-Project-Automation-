// tests/helpers/testUtils.js
const { expect } = require('@playwright/test');

/**
 * Generate random test data
 */
function generateRandomString(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Format currency for validation
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount);
}

/**
 * Parse currency string to number
 */
function parseCurrency(currencyString) {
  return parseFloat(currencyString.replace(/,/g, ''));
}

/**
 * Wait with logging
 */
async function waitAndLog(page, milliseconds, message) {
  console.log(`Waiting ${milliseconds}ms: ${message}`);
  await page.waitForTimeout(milliseconds);
}

/**
 * Retry a function if it fails
 */
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Compare two arrays for equality
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Log test step with timestamp
 */
function logStep(stepName) {
  console.log(`[${new Date().toISOString()}] STEP: ${stepName}`);
}

module.exports = {
  generateRandomString,
  formatCurrency,
  parseCurrency,
  waitAndLog,
  retry,
  arraysEqual,
  logStep
};