// tests/helpers/ceilingHelpers.js

/**
 * Generate random ceiling value between min and max
 */
function generateRandomCeilingValue(min = 25000, max = 200000) {
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Format currency for validation
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

/**
 * Parse currency string to number
 */
function parseCurrency(currencyString) {
  return parseFloat(currencyString.replace(/[$,]/g, ''));
}

/**
 * Validate if value is a valid number
 */
function isValidCeilingValue(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num < 10000000;
}

/**
 * Log test step with timestamp
 */
function logStep(stepName) {
  console.log(`[${new Date().toISOString()}] 📍 ${stepName}`);
}

module.exports = {
  generateRandomCeilingValue,
  formatCurrency,
  parseCurrency,
  isValidCeilingValue,
  logStep
};