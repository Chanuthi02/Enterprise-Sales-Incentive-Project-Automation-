// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Directory where your test files are located
  testDir: './tests/specs',
  
  // Directory for test artifacts (screenshots, videos, traces)
  outputDir: './test-results',
  
  // Timeout for each test in milliseconds (90 seconds to allow for slow page loads)
  timeout: 90 * 1000,
  
  // Timeout for expect assertions
  expect: {
    timeout: 5000
  },
  
  // Run tests in parallel (great for speed)
  fullyParallel: true,
  
  // Fail build on CI if you accidentally committed test.only
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests (2 times on CI, 1 time locally)
  retries: process.env.CI ? 2 : 1,
  
  // Number of parallel workers (4 on CI, auto locally)
  workers: process.env.CI ? 4 : undefined,
  
  // Reporter configuration (multiple reporters for different needs)
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // Interactive HTML report
    ['list'],  // Console output with test names
    ['json', { outputFile: 'test-results.json' }],  // JSON for CI integration
    ['junit', { outputFile: 'junit.xml' }]  // JUnit for CI dashboards
  ],
  
  // Shared settings for all test projects
  use: {
    // Base URL (uncomment when your app is always on localhost:3000)
    // baseURL: 'http://localhost:3000',
    
    // Ignore HTTPS certificate errors (useful for local dev)
    ignoreHTTPSErrors: true,
    
    // Run with visible browser (set to true for CI)
    headless: false,
    
    // Viewport size for consistent testing
    viewport: { width: 1280, height: 720 },
    
    // Action timeout (how long to wait for actions like click, fill)
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Collect trace when retrying the test for debugging
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
  },

  // Configure different browser projects
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // You can add Chrome-specific options here
        launchOptions: {
          args: ['--disable-dev-shm-usage']  // Helps with Docker/CI environments
        }
      },
    },
    
    // Uncomment these when you want to test across multiple browsers
    
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //   },
    // },
    
    // Optional: Test on mobile viewports
    // {
    //   name: 'mobile-chrome',
    //   use: { 
    //     ...devices['Pixel 5'],
    //   },
    // },
    
    // {
    //   name: 'mobile-safari',
    //   use: { 
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],
  
  // Optional: Run your web app before tests start
  // Uncomment if you need to start your app automatically
  // webServer: {
  //   command: 'npm run start',  // Command to start your app
  //   url: 'http://localhost:3000',  // URL to wait for
  //   reuseExistingServer: !process.env.CI,  // Don't restart if already running
  //   timeout: 120 * 1000,  // Wait up to 120 seconds for app to start
  // },
  
  // Global setup and teardown (if needed)
  // globalSetup: './tests/global-setup.js',
  // globalTeardown: './tests/global-teardown.js',
});