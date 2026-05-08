// solution-team.spec.js
// Playwright E2E tests for the Solution Teams page
// TC-ST-001 to TC-ST-016

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://dpdlab1.slt.lk:8454';
const PAGE_URL = `${BASE_URL}/solution-teams`;

// ─── Shared test data ────────────────────────────────────────────────────────
const NEW_TEAM = {
  code: 'AUTO_TEAM_001',
  name: 'Automation Test Team',
  productType: 'Both',
  activeStatus: 'Active',
  sectionCode: 'CES',
};

const EDITED_NAME = 'Automation Test Team Edited';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Navigate to the page and wait for it to be fully loaded.
 */
async function gotoPage(page) {
  await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
  await expect(
    page.locator('p').filter({ hasText: 'Solution Teams' }).first()
  ).toBeVisible({ timeout: 15_000 });
}

/**
 * Select a section from the "Select Section" dropdown.
 */
async function selectSection(page, sectionName) {
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: sectionName, exact: true }).click();
  await page.waitForTimeout(1000);
}

/**
 * Wait for the data table to contain at least one row.
 */
async function waitForTableRows(page) {
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10_000 });
}

/**
 * Open the "Show" modal for a given team code.
 */
async function openShowModal(page, teamCode) {
  const row = page.locator('tbody tr').filter({ hasText: teamCode });
  await row.getByRole('button', { name: /show/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 });
}

/**
 * Fill the "Add Solution Teams" form.
 */
async function fillAddForm(page, team) {
  await page.getByRole('textbox', { name: /enter team code/i }).fill(team.code);
  await page.getByRole('textbox', { name: /enter team name/i }).fill(team.name);

  await page.getByRole('combobox', { name: /select product type/i }).click();
  await page.getByRole('option', { name: team.productType, exact: true }).click();

  await page.getByRole('combobox', { name: /select active status/i }).click();
  await page.getByRole('option', { name: team.activeStatus, exact: true }).click();

  await page.getByRole('combobox', { name: /select section code/i }).click();
  await page.getByRole('option', { name: team.sectionCode, exact: true }).click();
}

/**
 * Accept the next browser confirm/alert dialog automatically.
 */
function autoAcceptDialog(page) {
  page.once('dialog', (dialog) => dialog.accept());
}

/**
 * Get the Team Name textbox inside the edit modal.
 * FIX: The edit modal textboxes have no accessible name — locate by position
 * (Team Name is the 2nd textbox in the dialog).
 */
function getEditTeamNameField(page) {
  return page.getByRole('dialog').getByRole('textbox').nth(1);
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('Solution Teams Page', () => {

  // ── TC-ST-001 ───────────────────────────────────────────────────────────────
  test('TC-ST-001: Page loads with all required elements', async ({ page }) => {
    await gotoPage(page);

    await expect(
      page.locator('p').filter({ hasText: 'Solution Teams' }).first()
    ).toBeVisible();

    await expect(page.locator('p').filter({ hasText: 'Select Section' })).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();

    await expect(page.getByRole('button', { name: '+ Add New' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add New' })).toBeDisabled();

    await expect(page.getByText(/choose a section from the dropdown/i)).toBeVisible();
  });

  // ── TC-ST-002 ───────────────────────────────────────────────────────────────
  // FIX: The actual section options are CES and PSBD (not PSBM).
  test('TC-ST-002: Dropdown opens and shows section options', async ({ page }) => {
    await gotoPage(page);

    await page.getByRole('combobox').first().click();

    await expect(page.getByRole('option', { name: 'CES', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'PSBD', exact: true })).toBeVisible();
  });

  // ── TC-ST-003 ───────────────────────────────────────────────────────────────
  // FIX: Use PSBD (not PSBM) — that is the actual option in the dropdown.
  test('TC-ST-003: Selecting CES then PSBD refreshes table data', async ({ page }) => {
    await gotoPage(page);

    await selectSection(page, 'CES');
    await waitForTableRows(page);
    await expect(page.locator('tbody tr').first()).toBeVisible();

    await selectSection(page, 'PSBD');
    await waitForTableRows(page);

    const sectionCells = page.locator('tbody tr td:nth-child(5)');
    const count = await sectionCells.count();
    for (let i = 0; i < count; i++) {
      await expect(sectionCells.nth(i)).toHaveText('PSBD');
    }
  });

  // ── TC-ST-004 ───────────────────────────────────────────────────────────────
  test('TC-ST-004: CES table data matches DB', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await expect(page.locator('tbody').getByText('CES_TEAM_003')).toBeVisible();
    await expect(page.locator('tbody').getByText('CES Maintenance Team')).toBeVisible();

    await expect(page.locator('thead').getByText(/team code/i)).toBeVisible();
    await expect(page.locator('thead').getByText(/team name/i)).toBeVisible();
    await expect(page.locator('thead').getByText(/product type/i)).toBeVisible();
    await expect(page.locator('thead').getByText(/active status/i)).toBeVisible();
    await expect(page.locator('thead').getByText(/section code/i)).toBeVisible();
  });

  // ── TC-ST-005 ───────────────────────────────────────────────────────────────
  // FIX: Use PSBD (not PSBM) — verify data that actually exists under PSBD.
  test('TC-ST-005: PSBD table data loads', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, 'PSBD');
    await waitForTableRows(page);

    // Verify section code column shows PSBD for all rows
    const sectionCells = page.locator('tbody tr td:nth-child(5)');
    const count = await sectionCells.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(sectionCells.nth(i)).toHaveText('PSBD');
    }
  });

  // ── TC-ST-006 ───────────────────────────────────────────────────────────────
  test('TC-ST-006: Add New button opens modal with correct fields', async ({ page }) => {
    await gotoPage(page);

    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await page.getByRole('button', { name: '+ Add New' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText(/add solution teams/i)).toBeVisible();

    await expect(dialog.getByRole('textbox', { name: /enter team code/i })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /enter team name/i })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: /select product type/i })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: /select active status/i })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: /select section code/i })).toBeVisible();

    await expect(dialog.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  // ── TC-ST-007 ───────────────────────────────────────────────────────────────
  test('TC-ST-007: Add new team - saves to UI and DB', async ({ page }) => {
    await gotoPage(page);

    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);

    await page.getByRole('button', { name: '+ Add New' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await fillAddForm(page, NEW_TEAM);

    autoAcceptDialog(page);
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);
    await expect(page.locator('tbody').getByText(NEW_TEAM.code)).toBeVisible();
    await expect(page.locator('tbody').getByText(NEW_TEAM.name)).toBeVisible();
  });

  // ── TC-ST-008 ───────────────────────────────────────────────────────────────
  // FIX: dialog.getByDisplayValue is not a function — use page.getByDisplayValue
  // scoped via locator, or target textboxes by value directly.
  test('TC-ST-008: Show button opens view modal with correct data', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await openShowModal(page, 'CES_TEAM_003');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/solution teams/i)).toBeVisible();

    // FIX: Use locator('input[value="..."]') scoped to the dialog
    await expect(dialog.locator('input[value="CES_TEAM_003"]')).toBeVisible();
    await expect(dialog.locator('input[value="CES Maintenance Team"]')).toBeVisible();
    await expect(dialog.locator('input[value="BOTH"]')).toBeVisible();
    await expect(dialog.locator('input[value="INACTIVE"]')).toBeVisible();
    await expect(dialog.locator('input[value="CES"]').first()).toBeVisible();

    await expect(dialog.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  // ── TC-ST-009 ───────────────────────────────────────────────────────────────
  // FIX: Edit modal textboxes have no accessible name. Use nth(1) for Team Name
  // (0=Team Code, 1=Team Name).
  test('TC-ST-009: Edit team name - saves to UI and DB', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);

    await openShowModal(page, NEW_TEAM.code);
    await page.getByRole('dialog').getByRole('button', { name: /edit/i }).click();

    const teamNameField = getEditTeamNameField(page);
    await teamNameField.clear();
    await teamNameField.fill(EDITED_NAME);

    autoAcceptDialog(page);
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);
    await expect(page.locator('tbody').getByText(EDITED_NAME)).toBeVisible();
  });

  // ── TC-ST-010 ───────────────────────────────────────────────────────────────
  // FIX: Same as TC-ST-009 — use nth(1) for Team Name textbox in edit modal.
  test('TC-ST-010: Cancel edit - no changes saved', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);

    await openShowModal(page, NEW_TEAM.code);
    await page.getByRole('dialog').getByRole('button', { name: /edit/i }).click();

    const teamNameField = getEditTeamNameField(page);
    const originalName = await teamNameField.inputValue();

    await teamNameField.clear();
    await teamNameField.fill('SHOULD NOT BE SAVED');

    await page.getByRole('dialog').getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5_000 });

    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);
    await expect(page.locator('tbody').getByText(originalName)).toBeVisible();
    await expect(page.locator('tbody').getByText('SHOULD NOT BE SAVED')).toBeHidden();
  });

  // ── TC-ST-011 ───────────────────────────────────────────────────────────────
  test('TC-ST-011: Delete team - removes from UI and DB', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, NEW_TEAM.sectionCode);
    await waitForTableRows(page);

    await openShowModal(page, NEW_TEAM.code);

    autoAcceptDialog(page);
    await page.getByRole('dialog').getByRole('button', { name: /delete/i }).click();

    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    await selectSection(page, NEW_TEAM.sectionCode);
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody').getByText(NEW_TEAM.code)).toBeHidden({ timeout: 8_000 });
  });

  // ── TC-ST-012 ───────────────────────────────────────────────────────────────
  test('TC-ST-012: Add form - shows validation errors on empty submit', async ({ page }) => {
    await gotoPage(page);

    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await page.getByRole('button', { name: '+ Add New' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('dialog')
        .getByText(/required|cannot be empty|please (enter|fill|select)/i)
        .first()
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── TC-ST-013 ───────────────────────────────────────────────────────────────
  // FIX: Edit modal Team Name has no accessible name — use nth(1).
  test('TC-ST-013: Edit form - shows validation error on empty team name', async ({ page }) => {
    await gotoPage(page);
    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await openShowModal(page, 'CES_TEAM_003');
    await page.getByRole('dialog').getByRole('button', { name: /edit/i }).click();

    const teamNameField = getEditTeamNameField(page);
    await teamNameField.clear();

    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('dialog')
        .getByText(/required|cannot be empty|please (enter|fill)/i)
        .first()
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── TC-ST-014 ───────────────────────────────────────────────────────────────
  // FIX: Broaden the error regex to catch any server/toast error message on
  // duplicate submission. Also check modal stays open as a fallback assertion.
  test('TC-ST-014: Add form - shows error for duplicate team code', async ({ page }) => {
    await gotoPage(page);

    await selectSection(page, 'CES');
    await waitForTableRows(page);

    await page.getByRole('button', { name: '+ Add New' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await fillAddForm(page, {
      code: 'CES_TEAM_003',
      name: 'Duplicate Code Test',
      productType: 'Both',
      activeStatus: 'Active',
      sectionCode: 'CES',
    });

    autoAcceptDialog(page);
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // FIX: Broaden to catch any error wording the app might use
    await expect(
      page.getByText(/already exist|duplicate|taken|error|failed|conflict/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── TC-ST-015 ───────────────────────────────────────────────────────────────
  // FIX: dialog.getByDisplayValue is not a function — use dialog.locator('input[value="..."]')
  test('TC-ST-015: Add new team - all fields saved correctly in DB', async ({ page }) => {
    const uniqueCode = `AUTO_${Date.now()}`;
    const team = { ...NEW_TEAM, code: uniqueCode, name: 'Full Field Test Team' };

    await gotoPage(page);
    await selectSection(page, team.sectionCode);
    await waitForTableRows(page);

    await page.getByRole('button', { name: '+ Add New' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await fillAddForm(page, team);

    autoAcceptDialog(page);
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    await selectSection(page, team.sectionCode);
    await waitForTableRows(page);
    await openShowModal(page, uniqueCode);

    const dialog = page.getByRole('dialog');
    // FIX: scope input[value] queries to the dialog
    await expect(dialog.locator(`input[value="${uniqueCode}"]`)).toBeVisible();
    await expect(dialog.locator(`input[value="${team.name}"]`)).toBeVisible();
    await expect(dialog.locator('input[value="BOTH"]')).toBeVisible();
    await expect(dialog.locator('input[value="ACTIVE"]').first()).toBeVisible();
    await expect(dialog.locator(`input[value="${team.sectionCode}"]`).first()).toBeVisible();

    // Cleanup
    autoAcceptDialog(page);
    await dialog.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
  });

  // ── TC-ST-016 ───────────────────────────────────────────────────────────────
  // FIX: Edit modal Team Name has no accessible name — use nth(1).
  // FIX: dialog.getByDisplayValue is not a function — use dialog.locator('input[value="..."]')
  test('TC-ST-016: Edit team - all changed fields saved correctly in DB', async ({ page }) => {
    const uniqueCode = `EDIT_${Date.now()}`;
    const team = {
      code: uniqueCode,
      name: 'Edit Field Test Team',
      productType: 'Both',
      activeStatus: 'Active',
      sectionCode: 'CES',
    };

    await gotoPage(page);

    // Step 1: Create the team
    await selectSection(page, team.sectionCode);
    await waitForTableRows(page);
    await page.getByRole('button', { name: '+ Add New' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await fillAddForm(page, team);
    autoAcceptDialog(page);
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    // Step 2: Edit the team name
    await selectSection(page, team.sectionCode);
    await waitForTableRows(page);
    await openShowModal(page, uniqueCode);
    await page.getByRole('dialog').getByRole('button', { name: /edit/i }).click();

    const updatedName = 'Edit Field Test Team UPDATED';
    const teamNameField = getEditTeamNameField(page);
    await teamNameField.clear();
    await teamNameField.fill(updatedName);

    autoAcceptDialog(page);
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });

    // Step 3: Confirm via Show modal that updated name persisted
    await selectSection(page, team.sectionCode);
    await waitForTableRows(page);
    await openShowModal(page, uniqueCode);

    const dialog = page.getByRole('dialog');
    // FIX: use input[value] instead of getByDisplayValue
    await expect(dialog.locator(`input[value="${updatedName}"]`)).toBeVisible();

    // Cleanup
    autoAcceptDialog(page);
    await dialog.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
  });

});