// tests/test-db.js
require('dotenv').config();
const { DatabaseHelper } = require('./helpers/dbHelper');

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.TEST_DB_HOST);
  console.log('Database:', process.env.TEST_DB_DATABASE);
  console.log('User:', process.env.TEST_DB_USER);
  console.log('Password:', process.env.TEST_DB_PASSWORD);
  const db = new DatabaseHelper();
  
  try {
    await db.connect();
    
    // Test connection
    const isConnected = await db.testConnection();
    console.log('Connection test:', isConnected ? '✅ PASSED' : '❌ FAILED');
    
    // Get available years
    const years = await db.getAvailableYears();
    console.log('Available years:', years);
    
    // Get summary for latest year
    if (years.length > 0) {
      const summary = await db.getIncentiveSummary(parseInt(years[0]));
      console.log('Incentive summary:', summary);
    }
    
    await db.disconnect();
    console.log('✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();