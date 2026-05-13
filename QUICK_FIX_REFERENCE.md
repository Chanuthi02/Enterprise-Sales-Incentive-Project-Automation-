# Quick Fix Reference - Remaining Failing Tests

Based on your list of 37 failing tests, here's the fix pattern for each category:

## Category 1: UI & Layout Tests (TC001-TC003, TC007)

**Current Problem:** Try-catch with masking expect, generic selectors

**Pattern:**
```javascript
// OLD (WRONG)
test('TCxxx - Description', async () => {
  try {
    const value = await approvePage.getSomething();
    expect(value && value.trim().length > 0).toBeTruthy();
  } catch (error) {
    console.log(`⚠️  Test error: ${error.message}`);
    expect(true).toBeTruthy();
  }
});

// NEW (CORRECT)
test('TCxxx - Description', async () => {
  const value = await approvePage.getSomething();
  expect(value && value.trim().length > 0).toBeTruthy();
});
```

**Affected Tests:**
- TC001: Page loads successfully
- TC002: Header is visible
- TC003: Logo is visible
- TC007: Page has no error messages

## Category 2: Role Selection Tests (TC012-TC015)

**Current Problem:** success || true masking pattern

**Pattern:**
```javascript
// OLD (WRONG)
test('TC012 - Select L1 View', async () => {
  try {
    const success = await approvePage.selectL1View();
    expect(success || true).toBeTruthy(); // WRONG
  } catch (error) {
    expect(true).toBeTruthy();
  }
});

// NEW (CORRECT)
test('TC012 - Select L1 View', async () => {
  const success = await approvePage.selectL1View();
  expect(success).toBeTruthy();
});
```

**Affected Tests:**
- TC012: Select L1 View
- TC013: Select L2 View  
- TC014: Select L3 View
- TC015: Switching views

## Category 3: Table & Modal Tests (TC028, TC034-TC038)

**Current Problem:** Complex try-catch with multiple nested conditions and masking

**Pattern:**
```javascript
// OLD (WRONG)
test('TC028 - Table has proper headers', async () => {
  try {
    await approvePage.selectL1View();
    await approvePage.clickViewSales();
    await approvePage.page.waitForTimeout(1500);
    
    const headers = await approvePage.getTableHeaders();
    expect(headers.length).toBeGreaterThan(0);
  } catch (error) {
    console.log(`⚠️  Test error: ${error.message}`);
    expect(true).toBeTruthy(); // WRONG
  }
});

// NEW (CORRECT)
test('TC028 - Table has proper headers', async () => {
  await approvePage.selectL1View();
  await approvePage.clickViewSales();
  await approvePage.page.waitForTimeout(1500);
  
  const headers = await approvePage.getTableHeaders();
  expect(headers.length).toBeGreaterThan(0);
});
```

**Affected Tests:**
- TC028: Table has proper headers
- TC034: Click Eye icon displays modal
- TC035: Detail modal shows solution info
- TC036: Can close detail modal with close button
- TC037: Can close detail modal with Escape key
- TC038: Show Details button on different rows

## Category 4: Edit Operation Tests (TC051-TC070)

**Current Problem:** Long try-catch blocks with conditional expect(true)

**Pattern:**
```javascript
// OLD (WRONG)
test('TC051 - Edit L1 Status field', async () => {
  try {
    await approvePage.selectL1View();
    const rowCount = await approvePage.getRowCount();
    if (rowCount === 0) {
      expect(true).toBeTruthy(); // WRONG
      return;
    }
    // ... more code ...
    const editClicked = await approvePage.clickEditButton();
    if (!editClicked) {
      expect(true).toBeTruthy(); // WRONG
      return;
    }
    // ... more code ...
  } catch (error) {
    expect(true).toBeTruthy(); // WRONG
  }
});

// NEW (CORRECT)
test('TC051 - Edit L1 Status field', async () => {
  await approvePage.selectL1View();
  
  const rowCount = await approvePage.getRowCount();
  if (rowCount === 0) {
    console.warn('No rows available for editing');
    expect(rowCount).toBeGreaterThan(0);
    return;
  }
  
  // ... more code ...
  const editClicked = await approvePage.clickEditButton();
  expect(editClicked).toBeTruthy();
  
  // ... more code ...
});
```

**Affected Tests:**
- TC051-TC055: Basic edit operations
- TC056-TC070: Validation and data persistence

## Category 5: Error Handling Tests (TC072-TC076)

**Current Problem:** Network/error simulation with masking expect

**Pattern:**
```javascript
// OLD (WRONG)
test('TC072 - Network error recovery', async () => {
  try {
    let requestsAborted = false;
    await approvePage.page.route('**/api/**', (route) => {
      requestsAborted = true;
      route.abort('failed');
    });
    
    // ... simulate errors ...
    
    expect(true).toBeTruthy(); // WRONG
  } catch (error) {
    expect(true).toBeTruthy(); // WRONG
  }
});

// NEW (CORRECT)
test('TC072 - Network error recovery', async () => {
  let requestsAborted = false;
  await approvePage.page.route('**/api/**', (route) => {
    requestsAborted = true;
    route.abort('failed');
  });
  
  // ... simulate errors ...
  await approvePage.page.unroute('**/api/**');
  
  // Verify page still functions
  const title = await approvePage.getPageTitle();
  expect(title && title.trim().length > 0).toBeTruthy();
});
```

**Affected Tests:**
- TC072: Network error recovery
- TC073: Invalid dropdown selection handling
- TC074: Modal close during data load
- TC075: Handles missing/malformed data
- TC076: Cannot approve with incomplete role

## Quick Fix Checklist

For each failing test:

- [ ] Remove entire try-catch block if it only has error logging
- [ ] Replace `expect(value || true)` with `expect(value)`
- [ ] Ensure all if/else branches have real assertions
- [ ] Check that selectors actually find elements
- [ ] Verify wait times are sufficient
- [ ] Add meaningful console logs for debugging
- [ ] Test individually to confirm fix

## Verification

After applying fixes:

```bash
# Run all tests
npx playwright test tests/specs/approveSolutionTeamSales.spec.js

# Run specific category
npx playwright test tests/specs/approveSolutionTeamSales.spec.js -g "TC01"

# Run with detailed output
npx playwright test tests/specs/approveSolutionTeamSales.spec.js --reporter=verbose
```

## Expected Outcome

After applying all fixes:

- ✅ Failing tests that should pass → **Will now PASS** (if page works correctly)
- ✅ Real failures → **Will now FAIL** with clear error messages
- ✅ Skipped/optional tests → Will show proper skip reasons
- ✅ Flaky tests → May need timeout/wait adjustments
- ✅ 31+ tests should pass with valid assertions
