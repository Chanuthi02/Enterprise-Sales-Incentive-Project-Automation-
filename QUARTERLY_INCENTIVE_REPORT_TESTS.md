# Quarterly Incentive Report Page - Test Suite Implementation Guide

## Overview
Comprehensive test suite implementation for the Quarterly Incentive Report page at: `https://dpdlab1.slt.lk:8454/quarterly-incentive-report`

## Files Created/Modified

### 1. **Page Object** - `tests/pages/quarterlyIncentiveReportPage.js`
   - Navigation to the quarterly incentive report page
   - UI element selectors for header, footer, logo, buttons
   - Dropdown interaction methods (Year, Quarter)
   - View Solution button functionality
   - Table data extraction methods
   - Detailed Calculation button interaction
   - Save Team and Amounts section interaction
   - Loading and error state handling

### 2. **Test Specification** - `tests/specs/quarterlyIncentiveReport.spec.js`
   - **41 comprehensive test cases** organized into 9 test suites:

#### Test Coverage by Category:

**UI/Layout Tests (TC024-TC031)** - 8 tests
- Page loads successfully
- Header visibility and display
- Logo visibility
- Footer visibility
- View Solution button visibility
- Save Team section visibility
- Save Team button text verification
- Error message verification

**Year and Quarter Filters (TC001-TC007)** - 7 tests
- Year dropdown accessibility and options
- Quarter dropdown accessibility and options
- Year selection functionality
- Quarter selection functionality
- Year filter data behavior
- Quarter filter data behavior
- Combined year and quarter filter functionality

**View Solution Button (TC008-TC011)** - 4 tests
- Button clickability
- Button displays data in table
- Loading state completion
- Behavior without filters

**Table Structure Tests (TC012-TC015)** - 4 tests
- Table headers presence and visibility
- Expected columns presence
- Table rows proper formatting
- All data display correctly

**Detailed Calculation Navigation (TC016-TC018)** - 3 tests
- Detailed Calculation button visibility in rows
- Navigation to details page functionality
- Details page content verification

**Save Team and Amounts Section (TC019-TC023)** - 5 tests
- Save Team section contains input fields
- Amount fields are editable
- Save Team button clickability
- Confirmation or data update after save
- Multiple amount fields modification and save

**Database Validation Tests (TC032-TC036)** - 5 tests
- Quarterly report data matches database records
- Data values in table match database values
- Quarterly incentive totals calculated correctly
- **GUARD: Fails if DB has records but UI shows empty** (TC035)
- **GUARD: Validates empty state only when DB is truly empty** (TC036)

**Edge Cases (TC037-TC038)** - 2 tests
- Page handles rapid filter changes
- Page recovers from no data gracefully

**Performance Tests (TC039-TC041)** - 3 tests
- Page loads within 10 seconds
- View Solution returns results within 10 seconds
- Table data rendering completes within 5 seconds

### 3. **Database Helper Extension** - `tests/helpers/dbHelper.js`
   Added 5 new methods for quarterly incentive queries:

   - `getQuarterlyIncentiveRecordCount(year, quarter)` - Returns count of records for year/quarter
   - `getQuarterlyIncentiveData(year, quarter)` - Returns all quarterly incentive records
   - `getQuarterlyIncentiveTotal(year, quarter)` - Returns total incentive for year/quarter
   - `getQuarterlyIncentiveByTeam(teamName, year, quarter)` - Returns specific team's quarterly incentive
   - `updateQuarterlyIncentiveTeamAmounts(teamName, amounts, year, quarter)` - Updates team amounts

### 4. **Test Data File** - `tests/data/quarterlyIncentiveReportData.json`
   - Sample test data with years (2023-2025) and quarters (Q1-Q4)
   - Test team data with team names, leads, and incentive amounts
   - Expected table headers
   - Save Team section labels

## Key Features

### 1. **Strict Database Validation with Guard Tests**
   - Guard tests (TC035-TC036) ensure UI and DB data always match
   - Tests fail immediately if DB has data but UI is empty
   - Validates empty state only when database is truly empty
   - Prevents "pass anyway" fallback patterns that hide data mismatches

### 2. **Comprehensive Component Testing**
   - UI Layout: Header, footer, logo, buttons all verified visible
   - Filters: Year and Quarter dropdowns with independent and combined testing
   - Navigation: Detailed Calculation button navigates to detail page
   - Save Functionality: Team amounts can be edited and saved
   - Table Data: Headers, rows, and data integrity verified

### 3. **Performance Monitoring**
   - Page load time verification (< 10 seconds)
   - View Solution response time check (< 10 seconds)
   - Table rendering performance (< 5 seconds)

### 4. **Error Handling**
   - Error message detection and validation
   - No data message handling
   - Loading spinner state management
   - Graceful degradation for optional features

## How to Run the Tests

### Run all Quarterly Incentive Report tests:
```bash
npx playwright test tests/specs/quarterlyIncentiveReport.spec.js
```

### Run specific test case:
```bash
npx playwright test tests/specs/quarterlyIncentiveReport.spec.js -g "TC024"
```

### Run with UI mode (interactive):
```bash
npx playwright test tests/specs/quarterlyIncentiveReport.spec.js --ui
```

### Run with browser headed (see browser):
```bash
npx playwright test tests/specs/quarterlyIncentiveReport.spec.js --headed
```

### Run with detailed output:
```bash
npx playwright test tests/specs/quarterlyIncentiveReport.spec.js --reporter=verbose
```

### Run all test suites (all pages):
```bash
npx playwright test tests/specs/
```

## Database Schema Assumptions

The implementation assumes the following table structure for quarterly incentive data:

```sql
CREATE TABLE quarterly_incentive_report (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(255),
  team_lead VARCHAR(255),
  quarterly_incentive DECIMAL(10, 2),
  calculation_details TEXT,
  year INTEGER,
  report_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Note**: If your actual table structure differs, update the query methods in `tests/helpers/dbHelper.js` accordingly.

## Configuration

### Environment Variables (from `.env`)
```
TEST_DB_HOST=124.43.216.136
TEST_DB_PORT=5432
TEST_DB_DATABASE=esic_testing_db
TEST_DB_USER=esic_user
TEST_DB_PASSWORD=ESIC@2025
PLAYWRIGHT_TIMEOUT=60000
```

### Playwright Configuration
- Timeout per test: 90 seconds
- Page navigation timeout: 60 seconds
- Retry on failure: Enabled
- Headless mode: Default (set `headless: false` for debugging)

## Integration with Existing Pages

This Quarterly Incentive Report page implementation follows the exact same pattern as the 4 existing pages:
1. **Sales Team Yearly Incentive** - yearly incentive data
2. **Solution Registry** - solution data by year/quarter
3. **Team Wise Solution** - team-wise solution breakdown
4. **Solution Team Ceiling** - team ceiling percentages

All pages share:
- Same UI layout testing structure
- Database validation with strict guard tests
- Performance monitoring
- Error handling patterns
- Page object architecture

## Test Case Numbering Scheme

- **TC024-TC031**: UI/Layout tests (consistent across all pages)
- **TC001-TC007**: Filter/Dropdown tests
- **TC008-TC023**: Functional tests (View Solution, Table, Detailed Calculation, Save Team)
- **TC032-TC036**: Database validation and guard tests
- **TC037-TC038**: Edge cases
- **TC039-TC041**: Performance tests

## Debugging Tips

1. **Page Element Not Found**: Selectors in `quarterlyIncentiveReportPage.js` may need adjustment if page layout differs
2. **Database Query Error**: Verify table name and column names match actual schema with `SELECT * FROM information_schema.tables WHERE table_name LIKE 'quarterly%'`
3. **Timeout Issues**: Increase `PLAYWRIGHT_TIMEOUT` in `.env` if tests consistently timeout
4. **No Data**: Ensure test year/quarter combinations have data in the database

## Success Criteria

✅ All 41 tests should pass:
- UI tests confirm page elements are visible
- Filter tests verify dropdown functionality
- Navigation tests confirm button interactions work
- Table tests validate data integrity
- Database guard tests ensure UI ↔ DB data consistency
- Performance tests confirm page loads quickly
- Edge case tests show proper error handling

## Next Steps

1. Run the test suite: `npx playwright test tests/specs/quarterlyIncentiveReport.spec.js`
2. Review any failing tests and adjust selectors if needed
3. Verify database query methods return correct data
4. Run full test suite to ensure no regressions in other pages
5. Schedule regular regression runs as part of CI/CD pipeline
