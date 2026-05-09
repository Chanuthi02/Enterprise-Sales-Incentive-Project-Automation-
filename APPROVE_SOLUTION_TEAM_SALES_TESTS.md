# Approve Solution Team Sales Page - Test Cases

## Page URL
`https://dpdlab1.slt.lk:8454/view-confirm-solution-team-sales`

## Overview
This page allows different roles (L1, L2, L3) to view and approve/confirm solution team sales. The page features:
- Role selection modal (L1 View, L2 View, L3 View)
- Filter section with Year, Quarter, and Status dropdowns
- View Sales button to load table data
- Table with solution information and action buttons
- Show/Details buttons to view detailed information for each solution

---

## Test Case Categories

### 1. UI/LAYOUT TESTS (TC001 - TC008)

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC001 | Page loads successfully | Page title is displayed and not empty |
| TC002 | Header is visible and properly displayed | Header element is visible on page load |
| TC003 | Logo is visible in header/footer | Logo image is rendered |
| TC004 | Footer is visible | Footer section is visible when scrolled to bottom |
| TC005 | Footer logo is clearly visible | Footer contains logo image |
| TC006 | Footer contains copyright/footer information | Footer text is present |
| TC007 | Page has no error messages on load | No error alerts on initial page load |
| TC008 | Page layout is responsive and elements are properly aligned | Page layout appears correct (screenshot validation) |

---

### 2. ROLE SELECTION TESTS (TC009 - TC015)

**Context:** Users must select a role view before accessing the main functionality. Three roles available:
- **L1 View**: Solution DGM - Can approve L1 status
- **L2 View**: Sales DGM - Can approve L2 status  
- **L3 View**: Read-only access to all records

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC009 | Role selection modal appears on page load | Modal is displayed OR automatic role selection occurs |
| TC010 | Role selection buttons are available | At least 3 role buttons are present |
| TC011 | Role buttons have correct labels (L1, L2, L3) | All role buttons display correct labels with descriptions |
| TC012 | Select L1 View (Solution DGM) - Can approve L1 status | Page loads with L1 context, user can see L1-related data |
| TC013 | Select L2 View (Sales DGM) - Can approve L2 status | Page loads with L2 context, user can see L2-related data |
| TC014 | Select L3 View (Read-only) - Read-only access to all records | Page loads with read-only context for all data |
| TC015 | Switching views updates page context and data | Data and UI elements change appropriately when switching between views |

---

### 3. FILTER SECTION TESTS (TC016 - TC023)

**Context:** Users can filter results using Year, Quarter, and Status dropdowns before viewing sales data.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC016 | Filter section is visible | Filter section displays after role selection |
| TC017 | Year dropdown is accessible and has options | Year dropdown contains multiple year options |
| TC018 | Quarter dropdown is accessible and has options | Quarter dropdown contains multiple quarter options (Q1, Q2, Q3, Q4) |
| TC019 | Status dropdown is accessible and has options | Status dropdown contains status options (APPROVED, REJECTED, PENDING, etc.) |
| TC020 | Can select year from dropdown | Year selection updates without errors |
| TC021 | Can select quarter from dropdown | Quarter selection updates without errors |
| TC022 | Can select status from dropdown | Status selection updates without errors |
| TC023 | Apply Filters button filters data correctly | Table displays filtered data OR shows "No data" message |

---

### 4. VIEW SALES BUTTON TESTS (TC024 - TC026)

**Context:** The "View Sales" button loads solution team sales data based on selected filters.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC024 | View Sales button is visible | Button appears in the filter section |
| TC025 | Click View Sales button loads table data | Table data is displayed OR "No data" message appears |
| TC026 | View Sales button is enabled/clickable | Button is not disabled and can be clicked |

---

### 5. TABLE AND SOLUTION DATA TESTS (TC027 - TC031)

**Context:** After clicking "View Sales", a table displays solution team sales data with Solution ID, Engineer names, Category, and Status columns.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC027 | Table is displayed after View Sales action | Table renders with data OR appropriate "No data" message |
| TC028 | Table has proper headers (Solution ID, Eng, SI Eng, Category, L1 Status, L2 Status, etc.) | All expected column headers are present |
| TC029 | Table displays solution data correctly | Data in table cells is properly formatted and readable |
| TC030 | Can retrieve all solution IDs from table | All solution IDs are accessible and can be extracted |
| TC031 | Table rows have consistent data structure | All rows contain same number of columns |

---

### 6. SHOW/DETAILS BUTTON TESTS (TC032 - TC038)

**Context:** Each table row has Show/Details buttons (typically an eye icon) that open a modal with detailed information about that solution.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC032 | Show/Details buttons are visible in table rows | Show buttons or eye icons present in each row |
| TC033 | Click Show button on first row displays details modal | Modal opens showing solution details |
| TC034 | Click Eye icon displays details modal | Eye icon click opens detail modal |
| TC035 | Detail modal shows solution information | Modal displays relevant solution data |
| TC036 | Can close detail modal by clicking close button | Close button (X) successfully closes the modal |
| TC037 | Can close detail modal by pressing Escape key | Pressing ESC key closes the modal |
| TC038 | Show Details button on different rows displays correct row data | Different rows show different solution details |

---

### 7. DATABASE VALIDATION TESTS (TC039 - TC042)

**Context:** Validates that UI data matches database records. Tests are marked with `.skip()` and require database connection.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC039 | DB: Verify solution data exists in database | Database contains solution_team_sales records |
| TC040 | DB: Verify table data matches database records | Solution IDs displayed in UI exist in database |
| TC041 | DB: Verify status values are valid (APPROVED, REJECTED, PENDING) | Status values in DB match valid status enum |
| TC042 | DB: Count total solutions and verify matches table display | Database count matches (or aligns with) UI table count |

**Note:** These tests require:
- PostgreSQL database connection
- Environment variables: `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_DATABASE`, `TEST_DB_USER`, `TEST_DB_PASSWORD`
- Table: `solution_team_sales` with columns: `id`, `solution_eng`, `si_eng`, `solution_category`, `l1_status`, `l2_status`

---

### 8. ROLE-SPECIFIC BEHAVIOR TESTS (TC043 - TC045)

**Context:** Each role (L1, L2, L3) has specific capabilities and visible elements.

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC043 | L1 View: Can see L1 Status column and can interact with approval actions | L1 Status column visible, approval actions available |
| TC044 | L2 View: Can see L2 Status column and can interact with approval actions | L2 Status column visible, approval actions available |
| TC045 | L3 View: Can see all data with read-only access (no edit/approve buttons) | All data visible but no action buttons present |

---

### 9. COMPREHENSIVE FLOW TESTS (TC046 - TC047)

**Context:** End-to-end user workflows that combine multiple features.

| TC ID | Test Case | Steps | Expected Result |
|-------|-----------|-------|-----------------|
| TC046 | Complete flow: Select view -> Filter -> View Sales -> Show Details | 1. Select L1 View<br>2. Select Year filter<br>3. Click View Sales<br>4. Verify table loads<br>5. Click Show Details on first row | Complete workflow executes without errors, modal displays details |
| TC047 | View switching flow: Switch between L1, L2, and L3 views | 1. Select L1 View<br>2. Switch to L2<br>3. Switch to L3<br>4. Switch back to L1 | View switching completes smoothly, page context updates |

---

## Test Data Requirements

### Database Tables
- `solution_team_sales` - Contains solution approval records
  - Columns: `id`, `solution_eng`, `si_eng`, `solution_category`, `l1_status`, `l2_status`

### Dropdown Values Expected
- **Year**: 2024, 2025, 2026 (configurable based on data)
- **Quarter**: Q1, Q2, Q3, Q4 (or ALL)
- **Status**: APPROVED, REJECTED, PENDING, ALL (or similar)

---

## Running the Tests

### Run all tests:
```bash
npx playwright test tests/specs/approveSolutionTeamSales.spec.js
```

### Run with headed browser:
```bash
npx playwright test tests/specs/approveSolutionTeamSales.spec.js --headed
```

### Run specific test case:
```bash
npx playwright test tests/specs/approveSolutionTeamSales.spec.js -g "TC012"
```

### Run with specific browser:
```bash
npx playwright test tests/specs/approveSolutionTeamSales.spec.js --project=chromium --headed
```

---

## Test Results Location
- HTML Report: `./playwright-report/index.html`
- Screenshots: `./screenshots/`
- Test Results: `./test-results/`
- JUnit Report: `junit.xml`

---

## Notes

1. **Role Selection**: Modal must be completed before proceeding. Tests automatically select L1, L2, or L3 based on test requirements.

2. **Filter Application**: Filters are optional. Tests verify both filtered and unfiltered scenarios.

3. **Database Tests**: Tests marked with `.skip()` are for database validation and require proper database configuration.

4. **Modal Interactions**: Details modal can be closed by:
   - Clicking close (X) button
   - Pressing ESC key
   - Clicking outside (if configured)

5. **Table Pagination**: If table uses pagination, tests should verify each page separately.

6. **Responsive Design**: Tests run on desktop viewport by default. Update `playwright.config.js` for other viewports.

7. **Error Handling**: Tests include error logging and screenshot capture for debugging purposes.

---

## Test Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Passed |
| ❌ | Failed |
| ⏭️ | Skipped |
| ⚠️ | Warning/Issue |

---

## Related Test Pages

- [Individual Incentive Report Tests](./INDIVIDUAL_INCENTIVE_REPORT_TESTS.md)
- [Quarterly Incentive Report Tests](./QUARTERLY_INCENTIVE_REPORT_TESTS.md)
- [Quarterly Incentive Detailed Page Tests](./QUARTERLY_INCENTIVE_DETAILED_PAGE_TESTS.md)
