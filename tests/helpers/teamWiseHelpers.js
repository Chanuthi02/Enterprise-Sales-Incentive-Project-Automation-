// tests/helpers/teamWiseHelpers.js

/**
 * Generate random year for testing
 */
function getRandomYear(years) {
  if (!years || years.length === 0) return '2024';
  return years[Math.floor(Math.random() * years.length)];
}

/**
 * Generate random quarter for testing
 */
function getRandomQuarter(quarters) {
  if (!quarters || quarters.length === 0) return 'Q2';
  return quarters[Math.floor(Math.random() * quarters.length)];
}

/**
 * Log test step with timestamp
 */
function logStep(stepName) {
  console.log(`[${new Date().toISOString()}] 📍 ${stepName}`);
}

/**
 * Validate solution data has required fields
 */
function isValidSolutionRow(row) {
  return row && row.length >= 1 && row[0] !== '';
}

/**
 * Format duration for display
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

module.exports = {
  getRandomYear,
  getRandomQuarter,
  logStep,
  isValidSolutionRow,
  formatDuration
};