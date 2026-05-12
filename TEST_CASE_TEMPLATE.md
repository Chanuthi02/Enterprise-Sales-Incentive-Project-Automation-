# Test Case Template: Back Button & Record Count Validation

## Overview
Two new test cases have been added to standardize testing across all pages:
1. **Back Button Navigation Test (TC999)** - Verify browser back button navigates correctly
2. **Record Count Validation Test (TC998)** - Verify all DB records are displayed in UI

## Pages that need these tests added:
- [x] solutionTeamCeiling.spec.js - ✅ DONE
- [ ] approveSolutionTeamSales.spec.js
- [ ] individualIncentiveReport.spec.js
- [ ] quarterlyIncentiveReport.spec.js
- [ ] salesMonthlyIndividualIncentive.spec.js
- [ ] salesTeamYearlyIncentive.spec.js
- [ ] solutionRegistry.spec.js
- [ ] teamWiseSolution.spec.js

## Pattern for Each Page

### 1. Back Button Navigation Test (TC999)
Add this test at the END of each test file (before test.afterAll):

```javascript
test('TC999 - Back button navigates to previous page', async () => {
  // Navigate to a different page first
  console.log('\n📋 TEST TC999 - Back Button Navigation');
  
  // Store current URL
  const originalUrl = [pageObjectName].page.url();
  console.log(`   Current URL: ${originalUrl}`);
  
  // Navigate to home or different page
  const homeUrl = originalUrl.split('/[page-path]')[0];
  await [pageObjectName].page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
    console.log('   ⚠️ Home page navigation skipped - may not exist');
  });
  
  await [pageObjectName].page.waitForTimeout(1000);
  const intermediateUrl = [pageObjectName].page.url();
  console.log(`   Navigated to: ${intermediateUrl}`);
  
  // Click back button using browser back functionality
  await [pageObjectName].page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await [pageObjectName].page.waitForTimeout(1000);
  
  const finalUrl = [pageObjectName].page.url();
  console.log(`   After back button: ${finalUrl}`);
  
  // Verify we're back at the correct page
  expect(finalUrl).toContain('[page-identifier-from-url]');
  console.log(`   ✅ Back button navigated correctly`);
});
```

### 2. Record Count Validation Test (TC998)
Add this test at the END of each test file (before test.afterAll):

```javascript
test('TC998 - Record count validation: DB records match UI display', async () => {
  // Verify that ALL database records are displayed in the UI
  console.log('\n📋 TEST TC998 - Record Count Validation');
  
  const dbData = await dbHelper.[getMethodForThisPage]();
  const uiRowCount = await [pageObjectName].getRowCount();
  
  console.log(`\n   📊 RECORD COUNT COMPARISON:`);
  console.log(`   Database records: ${dbData.length}`);
  console.log(`   UI rows displayed: ${uiRowCount}`);
  
  // If DB has data, all records must be shown
  if (dbData.length > 0) {
    if (uiRowCount === 0) {
      console.log(`\n   ❌ CRITICAL: Database has ${dbData.length} records but UI shows 0 rows`);
      expect.fail(`Record count mismatch: DB has ${dbData.length} records but UI shows ${uiRowCount} rows. All available data must be displayed.`);
    }
    
    if (uiRowCount < dbData.length) {
      console.log(`\n   ❌ INCOMPLETE: Only ${uiRowCount}/${dbData.length} records visible`);
      expect.fail(`Record count mismatch: DB has ${dbData.length} records but only ${uiRowCount} are visible. All data must be shown.`);
    }
    
    if (uiRowCount > dbData.length) {
      console.log(`\n   ⚠️ WARNING: More rows (${uiRowCount}) than DB records (${dbData.length})`);
      console.log(`   This may indicate duplicate entries or data from different sources`);
    }
    
    if (uiRowCount === dbData.length) {
      console.log(`\n   ✅ CORRECT: All ${dbData.length} database records are displayed`);
    }
  } else {
    console.log(`   ℹ️ No data in database - record count test inconclusive`);
  }
  
  expect(uiRowCount).toBe(dbData.length);
});
```

## Implementation Guide

### Step 1: Identify Page-Specific Information
For each page, you need to determine:

| Page | Page Object | DB Method | URL Path | 
|------|------------|-----------|----------|
| solutionTeamCeiling.spec.js | ceilingPage | getSolutionTeamCeilings() | solution-team-ceiling-values |
| approveSolutionTeamSales.spec.js | [approvePage] | [getApproveSalesData()] | [approve-sales-path] |
| individualIncentiveReport.spec.js | [reportPage] | [getIndividualIncentives()] | [report-path] |
| ... | ... | ... | ... |

### Step 2: Check Page Object
Verify the page object has `getRowCount()` method:
```javascript
async getRowCount() {
  // Should return count of data rows in the table
}
```

If not, add it following the pattern from solutionTeamCeilingPage.js

### Step 3: Check DB Helper
Verify the DatabaseHelper has a method to fetch records for this page:
```javascript
async getRecordsForThisPage() {
  // Should return array of records
}
```

If not, add it following existing patterns

### Step 4: Apply Template
Replace placeholders in template with page-specific information and add to the test file

## Expected Test Results

### TC999 - Back Button Test
- **PASS**: User navigates away from page, clicks back, and returns to the same page
- **FAIL**: Back button doesn't navigate to the correct URL or fails to navigate

### TC998 - Record Count Validation
- **PASS**: All DB records are displayed in UI (count matches exactly)
- **FAIL**: 
  - DB has records but UI shows 0 rows
  - Not all DB records are visible in UI (UI shows fewer than DB)
  - Different counts indicate incomplete data display

## Example for approveSolutionTeamSales.spec.js

For this page, you would:
1. Find the approve page object name (likely `approvePage`)
2. Find the DB method (likely `getApproveSalesData()` or similar)
3. Find the URL path (likely contains "approve")
4. Replace in template and add to spec file

## Notes
- TC999 and TC998 should be added to ALL spec files for consistency
- These tests verify critical functionality: navigation and data completeness
- Failing these tests indicates major UI/API issues that must be fixed
