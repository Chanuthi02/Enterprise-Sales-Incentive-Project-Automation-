require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

const BASE_URL = process.env.BASE_URL || 'https://dpdlab1.slt.lk:8454';

// ─── Actual DB table / column names (confirmed from pgAdmin) ──────────────────
// Table  : solution_teams
// Columns: id | section_name | product_type | active_status
const TABLE = 'solution_teams';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function goToSolutionTeams(page) {
  // FIX (Bug 3): A single persistent dialog handler on the page covers ALL
  // dialogs for the lifetime of the test.  Individual page.once() calls in
  // each test tried to accept the same dialog a second time, producing
  // "Cannot accept dialog which is already handled!" and aborting the test.
  // Solution: keep only this one handler here and remove every page.once()
  // from individual tests.
  page.on('dialog', async dialog => {
    console.log(`  [dialog] ${dialog.type()}: "${dialog.message()}" → accepting`);
    await dialog.accept();
  });
  await page.goto(`${BASE_URL}/solution-teams`);
  await expect(page.getByText('Solution Teams', { exact: true })).toBeVisible({ timeout: 15000 });
}

async function getAllSectionsFromDB() {
  const r = await pool.query(`SELECT * FROM ${TABLE} ORDER BY section_name ASC`);
  return r.rows;
}

async function getSectionByName(name) {
  const r = await pool.query(
    `SELECT * FROM ${TABLE} WHERE section_name = $1 LIMIT 1`, [name]
  );
  return r.rows[0] ?? null;
}

async function getDistinctProductTypes() {
  const r = await pool.query(
    `SELECT DISTINCT product_type FROM ${TABLE} ORDER BY product_type`
  );
  return r.rows.map(row => row.product_type);
}

async function getDistinctActiveStatuses() {
  const r = await pool.query(
    `SELECT DISTINCT active_status FROM ${TABLE} ORDER BY active_status`
  );
  return r.rows.map(row => row.active_status);
}

// FIX (Bug 2): exact: true prevents matching the MUI h2 "SOLUTION TEAMS close"
// wrapper that also satisfies a non-exact heading search, causing strict-mode
// violations on every modal-heading assertion.
function getModalHeading(page, title) {
  return page.getByRole('heading', { name: title, exact: true });
}

async function openAddModal(page) {
  await page.getByRole('button', { name: /\+ Add New/i }).click();
  await expect(getModalHeading(page, 'ADD SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });
}

async function openShowModal(page, rowName) {
  const row = page.locator('tr').filter({ hasText: rowName }).first();
  await row.getByRole('button', { name: /show/i }).click();
  await expect(getModalHeading(page, 'SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });
}

async function closeModal(page) {
  await page.getByRole('button', { name: /close/i }).click();
  await page.waitForTimeout(500);
}

// Show modal: all inputs are readonly — qualify with [readonly] so the selector
// never accidentally matches the editable inputs in the Edit modal that may be
// simultaneously mounted in the DOM.
function getShowModalTextbox(page, value) {
  return page.locator(
    `dialog input[readonly][value="${value}"], [role="dialog"] input[readonly][value="${value}"]`
  );
}

// Edit modal: Section Name is a writable input with name="sectionName".
// Target it by name so it is unambiguous even when a readonly input with the
// same value exists elsewhere in the DOM.
function getEditModalSectionNameInput(page) {
  return page.locator(
    `dialog input[name="sectionName"], [role="dialog"] input[name="sectionName"]`
  );
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Solution Teams Page', () => {

  test.beforeEach(async ({ page }) => {
    await goToSolutionTeams(page);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-001: Page loads with all required elements
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-001: Page loads with all required elements', async ({ page }) => {
    await expect(page.getByText('Solution Teams', { exact: true })).toBeVisible();

    // Table headers
    await expect(page.getByRole('columnheader', { name: 'SECTION NAME' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'PRODUCT TYPE' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ACTIVE STATUS' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ACTION' })).toBeVisible();

    // Header count
    const headerCount = await page.getByRole('columnheader').count();
    expect(headerCount, `Expected 4 column headers but found ${headerCount}`).toBe(4);

    // Add New button
    await expect(page.getByRole('button', { name: /\+ Add New/i })).toBeVisible();

    console.log('✅ TC-ST-001 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-002: Table row count matches DB record count
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-002: Table row count matches DB record count', async ({ page }) => {
    const dbResult = await pool.query(`SELECT COUNT(*)::int AS cnt FROM ${TABLE}`);
    const dbCount = dbResult.rows[0].cnt;
    console.log(`  DB total rows: ${dbCount}`);

    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
    const uiRows = await page.locator('tbody tr').count();
    console.log(`  UI rows on load: ${uiRows}`);

    if (uiRows !== dbCount) {
      console.warn(`  ⚠️  Row count mismatch: UI=${uiRows}, DB=${dbCount}`);
    }

    expect(uiRows).toBe(dbCount);
    console.log('✅ TC-ST-002 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-003: UI table data matches DB — column-by-column comparison
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-003: UI table data matches DB — column-by-column comparison', async ({ page }) => {
    const sampleResult = await pool.query(
      `SELECT section_name, product_type, active_status
       FROM ${TABLE}
       ORDER BY section_name ASC
       LIMIT 5`
    );
    const sampleRows = sampleResult.rows;
    console.log(`  Sampled ${sampleRows.length} rows from DB`);

    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

    for (let i = 0; i < sampleRows.length; i++) {
      const db = sampleRows[i];
      console.log(`\n  --- Sample row ${i + 1} ---`);
      console.log(`  DB: section_name=${db.section_name} | product_type=${db.product_type} | active_status=${db.active_status}`);

      const uiRow = page.locator('tbody tr')
        .filter({ hasText: db.section_name })
        .filter({ hasText: db.product_type })
        .first();

      const count = await uiRow.count();
      if (count === 0) {
        console.error(`  ❌ BUG: No UI row found for section_name="${db.section_name}"`);
        expect(count, `Row ${i + 1}: no UI row matched DB record`).toBeGreaterThan(0);
        continue;
      }

      const cells = await uiRow.locator('td').allTextContents();
      const uiSectionName  = cells[0]?.trim() ?? '';
      const uiProductType  = cells[1]?.trim() ?? '';
      const uiActiveStatus = cells[2]?.trim() ?? '';

      console.log(`  UI: section_name=${uiSectionName} | product_type=${uiProductType} | active_status=${uiActiveStatus}`);

      expect(uiSectionName,  `Row ${i + 1} SECTION NAME mismatch`).toBe(db.section_name.trim());
      expect(uiProductType,  `Row ${i + 1} PRODUCT TYPE mismatch`).toBe(db.product_type.trim());
      expect(uiActiveStatus, `Row ${i + 1} ACTIVE STATUS mismatch`).toBe(db.active_status.trim());

      console.log(`  ✔ Row ${i + 1} all columns match`);
    }

    console.log('\n✅ TC-ST-003 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-004: Show button opens modal with correct details
  //
  // FIX (Bug 1): Scope textbox queries inside the dialog so getByRole('textbox')
  // does not resolve to all 3 inputs at once and trigger strict-mode violation.
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-004: Show button opens modal with correct details', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

    const firstRow = page.locator('tbody tr').first();
    const cells = await firstRow.locator('td').allTextContents();
    const uiSectionName  = cells[0]?.trim();
    const uiProductType  = cells[1]?.trim();
    const uiActiveStatus = cells[2]?.trim();
    console.log(`  First row: name=${uiSectionName} | type=${uiProductType} | status=${uiActiveStatus}`);

    await firstRow.getByRole('button', { name: /show/i }).click();
    await expect(getModalHeading(page, 'SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    // Show modal inputs are all readonly — use readonly-qualified selector
    await expect(getShowModalTextbox(page, uiSectionName)).toBeVisible();
    await expect(getShowModalTextbox(page, uiProductType)).toBeVisible();
    await expect(getShowModalTextbox(page, uiActiveStatus)).toBeVisible();

    // Modal has Edit and Delete buttons
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();

    await closeModal(page);
    console.log('✅ TC-ST-004 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-005: Show modal fields match DB record (spot-check CES)
  //
  // FIX (Bug 1): Scope textbox queries inside the dialog.
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-005: Show modal fields match DB record', async ({ page }) => {
    const dbRow = await getSectionByName('CES');
    if (!dbRow) {
      console.warn('  ⚠️  Section "CES" not found in DB — skipping');
      return;
    }
    console.log('  DB record:', JSON.stringify(dbRow));

    await openShowModal(page, 'CES');

    // FIX: readonly-qualified selector avoids matching editable Edit modal inputs
    await expect(getShowModalTextbox(page, dbRow.section_name)).toBeVisible();
    await expect(getShowModalTextbox(page, dbRow.product_type)).toBeVisible();
    await expect(getShowModalTextbox(page, dbRow.active_status)).toBeVisible();

    await closeModal(page);
    console.log('✅ TC-ST-005 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-006: Close (×) button dismisses the Show modal
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-006: Close button dismisses the Show modal', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
    await page.locator('tbody tr').first().getByRole('button', { name: /show/i }).click();
    await expect(getModalHeading(page, 'SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    await closeModal(page);

    await expect(getModalHeading(page, 'SOLUTION TEAMS')).not.toBeVisible({ timeout: 5000 });
    console.log('✅ TC-ST-006 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-007: Add New button opens Add modal with empty fields
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-007: Add New button opens Add modal with empty fields', async ({ page }) => {
    await openAddModal(page);

    // Section Name input should be empty
    const sectionInput = page.getByRole('textbox', { name: /enter section name/i });
    await expect(sectionInput).toBeVisible();
    await expect(sectionInput).toHaveValue('');

    // Dropdowns show placeholder text
    await expect(page.getByRole('combobox', { name: /select product type/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /select active status/i })).toBeVisible();

    // Save and Cancel buttons visible
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(getModalHeading(page, 'ADD SOLUTION TEAMS')).not.toBeVisible({ timeout: 5000 });

    console.log('✅ TC-ST-007 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-008: Product Type dropdown contains expected options
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-008: Product Type dropdown contains expected options', async ({ page }) => {
    await openAddModal(page);

    await page.getByRole('combobox', { name: /select product type/i }).click();
    const options = page.getByRole('option');
    const count = await options.count();
    const uiOptions = [];
    for (let i = 0; i < count; i++) {
      uiOptions.push((await options.nth(i).textContent()).trim());
    }
    console.log('  Product Type options:', uiOptions);

    const expectedOptions = ['Domestic', 'Both'];
    for (const opt of expectedOptions) {
      expect(uiOptions, `Missing option: ${opt}`).toContain(opt);
    }

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /cancel/i }).click();
    console.log('✅ TC-ST-008 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-009: Active Status dropdown contains expected options
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-009: Active Status dropdown contains expected options', async ({ page }) => {
    await openAddModal(page);

    await page.getByRole('combobox', { name: /select active status/i }).click();
    const options = page.getByRole('option');
    const count = await options.count();
    const uiOptions = [];
    for (let i = 0; i < count; i++) {
      uiOptions.push((await options.nth(i).textContent()).trim());
    }
    console.log('  Active Status options:', uiOptions);

    const expectedOptions = ['Active', 'Inactive'];
    for (const opt of expectedOptions) {
      expect(uiOptions, `Missing option: ${opt}`).toContain(opt);
    }

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /cancel/i }).click();
    console.log('✅ TC-ST-009 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-010: Add new section — happy path (create, verify, then clean up)
  //
  // FIX (Bug 3): Removed page.once('dialog', ...) calls. The persistent
  // page.on handler in goToSolutionTeams already accepts every dialog, so a
  // second handler via page.once throws "Cannot accept dialog which is already
  // handled!" and aborts the test.
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-010: Add new section — happy path', async ({ page }) => {
    const NEW_SECTION = `TEST_${Date.now()}`;

    // Pre-check: should not exist in DB
    const before = await getSectionByName(NEW_SECTION);
    expect(before).toBeNull();

    await openAddModal(page);

    await page.getByRole('textbox', { name: /enter section name/i }).fill(NEW_SECTION);
    await page.getByRole('combobox', { name: /select product type/i }).click();
    await page.getByRole('option', { name: 'Both', exact: true }).click();
    await page.getByRole('combobox', { name: /select active status/i }).click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();

    // FIX: no page.once() — the global handler in beforeEach covers this dialog
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(1500);

    // Verify row appears in UI
    const newRow = page.locator('tbody tr').filter({ hasText: NEW_SECTION });
    await expect(newRow.first()).toBeVisible({ timeout: 10000 });
    console.log(`  ✔ New section "${NEW_SECTION}" visible in table`);

    // Verify persisted to DB
    const dbRow = await getSectionByName(NEW_SECTION);
    expect(dbRow, `BUG: New section "${NEW_SECTION}" not found in DB after save`).not.toBeNull();
    expect(dbRow.product_type.toUpperCase()).toBe('BOTH');
    expect(dbRow.active_status.toUpperCase()).toBe('ACTIVE');
    console.log(`  ✔ New section persisted to DB: ${JSON.stringify(dbRow)}`);

    // ── Clean up: delete the test record ────────────────────────────────────
    await newRow.first().getByRole('button', { name: /show/i }).click();
    await expect(getModalHeading(page, 'SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    // FIX: no page.once() — the global handler covers this dialog too
    await page.getByRole('button', { name: /delete/i }).click();
    await page.waitForTimeout(1000);

    const deletedRow = await getSectionByName(NEW_SECTION);
    expect(deletedRow, `Cleanup failed: section "${NEW_SECTION}" still in DB`).toBeNull();
    console.log(`  ✔ Cleanup: section "${NEW_SECTION}" deleted`);

    console.log('✅ TC-ST-010 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-011: Cancel on Add modal discards changes — no new DB record
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-011: Cancel on Add modal discards changes', async ({ page }) => {
    const CANCEL_SECTION = `CANCEL_TEST_${Date.now()}`;

    await openAddModal(page);
    await page.getByRole('textbox', { name: /enter section name/i }).fill(CANCEL_SECTION);
    await page.getByRole('combobox', { name: /select product type/i }).click();
    await page.getByRole('option', { name: 'Both', exact: true }).click();
    await page.getByRole('combobox', { name: /select active status/i }).click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(getModalHeading(page, 'ADD SOLUTION TEAMS')).not.toBeVisible({ timeout: 5000 });
    console.log('  ✔ Add modal closed after Cancel');

    // Row should NOT appear in table
    const newRow = page.locator('tbody tr').filter({ hasText: CANCEL_SECTION });
    expect(await newRow.count()).toBe(0);

    // Should NOT be in DB
    const dbRow = await getSectionByName(CANCEL_SECTION);
    expect(dbRow, `BUG: Cancelled section "${CANCEL_SECTION}" was saved to DB`).toBeNull();

    console.log('✅ TC-ST-011 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-012: Edit section — toggle Active Status and save
  //
  // FIX (Bug 3): Removed page.once('dialog', ...) calls.
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-012: Edit section — toggle Active Status and save', async ({ page }) => {
    const dbRowBefore = await getSectionByName('CES');
    if (!dbRowBefore) {
      console.warn('  ⚠️  Section "CES" not found — skipping');
      return;
    }
    const originalStatus = dbRowBefore.active_status;
    const toggledStatus  = originalStatus.toUpperCase() === 'INACTIVE' ? 'Active' : 'Inactive';
    const toggledExpected = toggledStatus.toUpperCase();
    console.log(`  CES original status: ${originalStatus} → toggling to: ${toggledExpected}`);

    await openShowModal(page, 'CES');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(getModalHeading(page, 'EDIT SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    // Edit modal pre-fills with current values — use name-based selector for the
    // editable Section Name input to avoid matching the readonly Show modal input
    await expect(getEditModalSectionNameInput(page)).toHaveValue('CES');

    // Toggle status
    await page.getByRole('combobox', { name: new RegExp(originalStatus, 'i') }).click();
    await page.getByRole('option', { name: toggledStatus, exact: true }).click();

    // FIX: no page.once() — the global handler covers this dialog
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(1500);

    // Verify UI updated
    const updatedRow = page.locator('tbody tr').filter({ hasText: 'CES' }).first();
    const cells = await updatedRow.locator('td').allTextContents();
    console.log(`  Updated row cells: ${cells}`);
    expect(cells[2]?.trim()).toBe(toggledExpected);

    // Verify DB updated
    const dbRowAfter = await getSectionByName('CES');
    expect(dbRowAfter.active_status.toUpperCase()).toBe(toggledExpected);
    console.log(`  ✔ DB status updated to: ${dbRowAfter.active_status}`);

    // ── Restore original status ──────────────────────────────────────────────
    await openShowModal(page, 'CES');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(getModalHeading(page, 'EDIT SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });
    await page.getByRole('combobox', { name: new RegExp(toggledStatus, 'i') }).click();
    const restoreOption = originalStatus.charAt(0).toUpperCase() + originalStatus.slice(1).toLowerCase();
    await page.getByRole('option', { name: restoreOption, exact: true }).click();
    // FIX: no page.once()
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(1000);
    console.log(`  ✔ Restored CES status to: ${originalStatus}`);

    console.log('✅ TC-ST-012 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-013: Cancel on Edit modal discards changes — DB unchanged
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-013: Cancel on Edit modal discards changes', async ({ page }) => {
    const dbRowBefore = await getSectionByName('CES');
    if (!dbRowBefore) {
      console.warn('  ⚠️  Section "CES" not found — skipping');
      return;
    }
    const originalStatus = dbRowBefore.active_status;
    const otherStatus    = originalStatus.toUpperCase() === 'INACTIVE' ? 'Active' : 'Inactive';

    await openShowModal(page, 'CES');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(getModalHeading(page, 'EDIT SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    // Change status but then cancel
    await page.getByRole('combobox', { name: new RegExp(originalStatus, 'i') }).click();
    await page.getByRole('option', { name: otherStatus, exact: true }).click();
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.waitForTimeout(500);

    // DB should be unchanged
    const dbRowAfter = await getSectionByName('CES');
    expect(dbRowAfter.active_status).toBe(originalStatus);
    console.log(`  ✔ DB status unchanged after cancel: ${dbRowAfter.active_status}`);

    console.log('✅ TC-ST-013 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-014: Edit modal pre-populates with current DB values
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-014: Edit modal pre-populates with current DB values', async ({ page }) => {
    const dbRow = await getSectionByName('CES');
    if (!dbRow) {
      console.warn('  ⚠️  Section "CES" not found — skipping');
      return;
    }

    await openShowModal(page, 'CES');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(getModalHeading(page, 'EDIT SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    // Section Name input pre-filled — use name-based selector for the editable
    // input; avoids strict-mode collision with the readonly Show modal input
    await expect(getEditModalSectionNameInput(page)).toHaveValue(dbRow.section_name);
    console.log(`  ✔ Section Name pre-filled: ${dbRow.section_name}`);

    // Product Type dropdown shows current value
    const productTypeCombo = page.getByRole('combobox')
      .filter({ hasText: new RegExp(dbRow.product_type, 'i') });
    await expect(productTypeCombo).toBeVisible();
    console.log(`  ✔ Product Type pre-filled: ${dbRow.product_type}`);

    // Active Status dropdown shows current value
    const activeStatusCombo = page.getByRole('combobox')
      .filter({ hasText: new RegExp(dbRow.active_status, 'i') });
    await expect(activeStatusCombo).toBeVisible();
    console.log(`  ✔ Active Status pre-filled: ${dbRow.active_status}`);

    await page.getByRole('button', { name: /cancel/i }).click();
    console.log('✅ TC-ST-014 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-015: Delete section — creates temp record, deletes it, verifies removal
  //
  // FIX (Bug 3): Removed page.once('dialog', ...) calls.
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-015: Delete section — removes record from UI and DB', async ({ page }) => {
    const DELETE_SECTION = `DELETE_TEST_${Date.now()}`;

    // Step 1: Create a throwaway record via Add
    await openAddModal(page);
    await page.getByRole('textbox', { name: /enter section name/i }).fill(DELETE_SECTION);
    await page.getByRole('combobox', { name: /select product type/i }).click();
    await page.getByRole('option', { name: 'Both', exact: true }).click();
    await page.getByRole('combobox', { name: /select active status/i }).click();
    await page.getByRole('option', { name: 'Inactive', exact: true }).click();
    // FIX: no page.once()
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(1500);

    const newRow = page.locator('tbody tr').filter({ hasText: DELETE_SECTION });
    await expect(newRow.first()).toBeVisible({ timeout: 10000 });
    console.log(`  ✔ Temp section "${DELETE_SECTION}" created`);

    // Step 2: Open Show modal and delete
    await newRow.first().getByRole('button', { name: /show/i }).click();
    await expect(getModalHeading(page, 'SOLUTION TEAMS')).toBeVisible({ timeout: 8000 });

    const rowCountBefore = await page.locator('tbody tr').count();

    // FIX: no page.once()
    await page.getByRole('button', { name: /delete/i }).click();
    await page.waitForTimeout(1500);

    // Row removed from UI
    const deletedRow = page.locator('tbody tr').filter({ hasText: DELETE_SECTION });
    expect(await deletedRow.count()).toBe(0);
    console.log(`  ✔ Row removed from UI table`);

    // Row count decreased by 1
    const rowCountAfter = await page.locator('tbody tr').count();
    expect(rowCountAfter).toBe(rowCountBefore - 1);
    console.log(`  ✔ Table row count decreased: ${rowCountBefore} → ${rowCountAfter}`);

    // Removed from DB
    const dbRow = await getSectionByName(DELETE_SECTION);
    expect(dbRow, `BUG: Deleted section "${DELETE_SECTION}" still found in DB`).toBeNull();
    console.log(`  ✔ Record removed from DB`);

    console.log('✅ TC-ST-015 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-016: UI table headers match DB column mapping
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-016: UI table headers match DB column mapping', async ({ page }) => {
    const schemaResult = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name   = '${TABLE}'
       ORDER BY ordinal_position`
    );
    const dbColumns = schemaResult.rows.map(r => r.column_name);
    console.log('  DB columns:', dbColumns);

    const requiredDbColumns = ['section_name', 'product_type', 'active_status'];
    for (const col of requiredDbColumns) {
      expect(dbColumns, `BUG: Expected DB column "${col}" missing from ${TABLE} table`).toContain(col);
    }
    console.log('  ✔ All required DB columns exist');

    const headerMapping = [
      ['section_name',  'SECTION NAME'],
      ['product_type',  'PRODUCT TYPE'],
      ['active_status', 'ACTIVE STATUS'],
    ];
    for (const [dbCol, uiHeader] of headerMapping) {
      await expect(
        page.getByRole('columnheader', { name: uiHeader, exact: true }),
        `BUG: UI header "${uiHeader}" (maps to DB column "${dbCol}") is missing`
      ).toBeVisible();
      console.log(`  ✔ DB column "${dbCol}" → UI header "${uiHeader}" ✓`);
    }

    await expect(page.getByRole('columnheader', { name: 'ACTION', exact: true })).toBeVisible();
    console.log('  ✔ UI-only column "ACTION" ✓');

    console.log('✅ TC-ST-016 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-ST-019: Add section with empty Section Name does not create a record
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-ST-019: Add with empty Section Name does not create a record', async ({ page }) => {
    const dbCountBefore = (
      await pool.query(`SELECT COUNT(*)::int AS cnt FROM ${TABLE}`)
    ).rows[0].cnt;

    await openAddModal(page);

    // Leave Section Name blank, fill other fields
    await page.getByRole('combobox', { name: /select product type/i }).click();
    await page.getByRole('option', { name: 'Both', exact: true }).click();
    await page.getByRole('combobox', { name: /select active status/i }).click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();

    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(1000);

    const dbCountAfter = (
      await pool.query(`SELECT COUNT(*)::int AS cnt FROM ${TABLE}`)
    ).rows[0].cnt;

    if (dbCountAfter > dbCountBefore) {
      console.error(`  ❌ BUG: Empty Section Name was saved — DB count went from ${dbCountBefore} to ${dbCountAfter}`);
      expect(dbCountAfter, 'BUG: record created with empty section name').toBe(dbCountBefore);
    } else {
      console.log('  ✔ Empty Section Name correctly prevented record creation');
    }

    // Close modal if still open
    const addHeading = getModalHeading(page, 'ADD SOLUTION TEAMS');
    if (await addHeading.isVisible()) {
      await page.getByRole('button', { name: /cancel/i }).click();
    }

    console.log('✅ TC-ST-019 PASSED');
  });

});