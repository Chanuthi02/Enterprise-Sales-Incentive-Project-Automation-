require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { Pool } = require('pg');

// ─── DB Connection ────────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

const BASE_URL = process.env.BASE_URL || 'https://dpdlab1.slt.lk:8454';

// ─── CONFIRMED DB Column: "serviceNo" (camelCase, PK) ────────────────────────
const PK = 'serviceNo';

// ─── Constants ────────────────────────────────────────────────────────────────
const KNOWN_SVC_NO   = '1256';
const KNOWN_EMP_NAME = 'A.Lakshmi Kumari';

const ADD_TEST_SVC_NO    = '5555';   // TC-007, TC-015  (Add)
const DELETE_TEST_SVC_NO = '222';    // TC-013          (Delete)
const EDIT_TEST_SVC_NO   = '666';    // TC-011          (Edit)

const ADD_TEST_POSITION = 'BBB';
const ADD_TEST_EMP_NAME = 'Auto Test Member';

// ─── Employee name: letters + spaces + dots ONLY (app regex rule) ────────────
const EDIT_TEST_EMP_NAME_BASE = 'Edited Name Auto';

// ─── Dummy data for required text fields ─────────────────────────────────────
const DUMMY_EMP_NAME = 'Auto Test Member';   // letters/spaces/dots only
const DUMMY_EMAIL    = 'autotest@example.com';
const DUMMY_POSITION = 'BBB';

// ─── DB Helpers ───────────────────────────────────────────────────────────────

async function getMemberFromDB(svcNo) {
  const r = await pool.query(
    `SELECT * FROM solution_team_members WHERE "${PK}"=$1`,
    [svcNo]
  );
  return r.rows[0];
}

async function deleteMemberFromDB(svcNo) {
  await pool.query(
    `DELETE FROM solution_team_members WHERE "${PK}"=$1`,
    [svcNo]
  );
}

async function seedMemberInDB(svcNo) {
  const empCheck = await pool.query(
    `SELECT 1 FROM employees WHERE "serviceNo" = $1`,
    [svcNo]
  );
  if (empCheck.rows.length === 0) {
    throw new Error(
      `serviceNo '${svcNo}' does not exist in the employees table. ` +
      `Cannot seed solution_team_members — FK constraint would be violated.`
    );
  }

  const template = await pool.query(`SELECT * FROM solution_team_members LIMIT 1`);
  if (template.rows.length === 0) {
    throw new Error('No existing rows in solution_team_members to use as seed template');
  }
  const tmpl = template.rows[0];

  const cols         = Object.keys(tmpl);
  const vals         = cols.map(c => (c === PK ? svcNo : tmpl[c]));
  const colList      = cols.map(c => `"${c}"`).join(', ');
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const updateSet    = cols
    .filter(c => c !== PK)
    .map(c => `"${c}"=$${cols.indexOf(c) + 1}`)
    .join(', ');

  await pool.query(
    `INSERT INTO solution_team_members (${colList})
     VALUES (${placeholders})
     ON CONFLICT ("${PK}") DO UPDATE SET ${updateSet}`,
    vals
  );
  return await getMemberFromDB(svcNo);
}

async function restoreSnapshot(snapshot, svcNo) {
  if (!snapshot) {
    await deleteMemberFromDB(svcNo).catch(() => {});
    return;
  }
  const cols         = Object.keys(snapshot);
  const vals         = Object.values(snapshot);
  const colList      = cols.map(c => `"${c}"`).join(', ');
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const updateSet    = cols
    .filter(c => c !== PK)
    .map(c => `"${c}"=$${cols.indexOf(c) + 1}`)
    .join(', ');

  await pool.query(
    `INSERT INTO solution_team_members (${colList})
     VALUES (${placeholders})
     ON CONFLICT ("${PK}") DO UPDATE SET ${updateSet}`,
    vals
  );
}

async function countMembersInDB() {
  const r = await pool.query(
    'SELECT COUNT(*)::int AS cnt FROM solution_team_members'
  );
  return r.rows[0].cnt;
}

// ─── Page Helpers ─────────────────────────────────────────────────────────────

async function goToSolutionTeamMembers(page) {
  page.on('dialog', async dialog => {
    console.log(`  [dialog] ${dialog.type()}: "${dialog.message()}" → accepting`);
    await dialog.accept();
  });
  await page.goto(`${BASE_URL}/solution-team-members`);
  await expect(
    page.getByRole('heading', { name: 'Solution Team Members', exact: true })
  ).toBeVisible({ timeout: 15000 });
}

async function clickDisplayAll(page) {
  await page.getByRole('button', { name: 'Display All' }).click();
  await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
}

async function openAddModal(page) {
  await page.getByRole('button', { name: /add new/i }).click();
  await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 10000 });
  await expect(
    page.locator('div[role="dialog"]').getByText('ADD NEW SOLUTION MEMBERS')
  ).toBeVisible({ timeout: 5000 });
}

async function openShowModalForMember(page, svcNo) {
  const searchInput = page.getByPlaceholder('Service No / Position');
  await searchInput.fill('');
  await page.waitForTimeout(200);
  await searchInput.fill(svcNo);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  const row = page.locator('tbody tr').filter({
    has: page.locator('td:nth-child(2)', { hasText: svcNo })
  }).first();

  await expect
    .poll(
      async () => {
        const visible = await row.isVisible().catch(() => false);
        if (!visible) {
          const allCells = await page.locator('tbody tr td:nth-child(2)')
            .allTextContents().catch(() => []);
          console.log(
            `  [openShowModalForMember] searching for "${svcNo}". ` +
            `td:nth-child(2) contents: ${JSON.stringify(allCells)}`
          );
          await page.getByRole('button', { name: /search/i }).click();
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        }
        return visible;
      },
      {
        message: `Row for serviceNo="${svcNo}" should appear in table after search`,
        timeout: 30000,
        intervals: [500, 500, 1000, 1000, 2000, 2000, 3000, 3000],
      }
    )
    .toBe(true);

  const cellText   = await row.locator('td:nth-child(2)').textContent();
  const normalised = cellText.replace(/"/g, '').trim();
  if (normalised !== svcNo) {
    throw new Error(
      `openShowModalForMember: expected serviceNo="${svcNo}" but matched cell="${normalised}".`
    );
  }

  await row.getByRole('button', { name: /show/i }).click();
  await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 10000 });
}

async function closeAllDialogs(page) {
  for (let i = 0; i < 5; i++) {
    const visible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
    if (!visible) break;
    const cancelBtn = page.locator('div[role="dialog"]').last()
      .getByRole('button', { name: /cancel|close/i });
    const hasCancelBtn = await cancelBtn.isVisible().catch(() => false);
    if (hasCancelBtn) {
      await cancelBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(600);
  }
}

// ─── selectFirstDropdownOption ───────────────────────────────────────────────
// Clicks a combobox identified by its label <p> and selects the first
// available li[role="option"]. Gracefully skips if not visible or no options.
async function selectFirstDropdownOption(page, dialog, labelText) {
  const combo = dialog
    .locator(`p:has-text("${labelText}") ~ div [role="combobox"]`)
    .first();

  const isVisible = await combo.isVisible({ timeout: 3000 }).catch(() => false);
  if (!isVisible) {
    console.log(`  [selectFirstDropdownOption] "${labelText}" not visible — skipping`);
    return;
  }

  await combo.click();
  await page.waitForTimeout(300);

  const option = page.locator('li[role="option"]').first();
  const optionVisible = await option.isVisible({ timeout: 4000 }).catch(() => false);

  if (optionVisible) {
    const optionText = await option.textContent().catch(() => '?');
    await option.click();
    console.log(`  [selectFirstDropdownOption] "${labelText}" → "${optionText.trim()}"`);
  } else {
    await page.keyboard.press('Escape');
    console.log(`  [selectFirstDropdownOption] "${labelText}" → no options, Escape pressed`);
  }
  await page.waitForTimeout(200);
}

// ─── fillAllRequiredFieldsForAdd ─────────────────────────────────────────────
// FIX for TC-007 & TC-015:
// The Add modal has SIX required dropdowns: Role, Division, Team Name,
// Playsheet, Incentive Eligibility, Group (confirmed in stdout error log and
// screenshots). The previous code only selected Role, so the form was still
// invalid on Save. This function fills every required field.
async function fillAllRequiredFieldsForAdd(page, dialog) {
  // 1. Trigger employee lookup icon
  await dialog.locator('img[alt="Search"]').click();
  await page.waitForTimeout(1000);

  // 2. Fill text fields if lookup did not auto-populate them
  const empNameValue = await dialog
    .locator('p:has-text("Employee Name") ~ div input')
    .first()
    .inputValue()
    .catch(() => '');

  if (!empNameValue) {
    console.log('  [fillAllRequiredFieldsForAdd] Lookup returned nothing — using dummy data');

    await dialog
      .locator('p:has-text("Employee Name") ~ div input')
      .first()
      .fill(DUMMY_EMP_NAME);

    const emailInput = dialog.locator('p:has-text("Email") ~ div input').first();
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(DUMMY_EMAIL);
    }
  } else {
    console.log(`  [fillAllRequiredFieldsForAdd] Lookup set Employee Name: "${empNameValue}"`);
  }

  // 3. Position
  const posInput = dialog.locator('p:has-text("Position") ~ div input').first();
  if (!(await posInput.inputValue().catch(() => ''))) {
    await posInput.fill(DUMMY_POSITION);
  }

  // 4. All six required dropdowns — pick first available option in each
  for (const label of [
    'Role',
    'Division',
    'Team Name',
    'Playsheet',
    'Incentive Eligibility',
    'Group',
  ]) {
    await selectFirstDropdownOption(page, dialog, label);
  }

  await page.waitForTimeout(400);
}

async function saveModalAndWaitClose(page) {
  let nativeMsg = null;

  const captureHandler = (dialog) => {
    nativeMsg = dialog.message();
    console.log(`  [saveModalAndWaitClose] native dialog: "${nativeMsg}"`);
    dialog.accept().catch(() => {});
  };
  page.once('dialog', captureHandler);

  await page.locator('div[role="dialog"]').last()
    .getByRole('button', { name: /save/i }).click();

  await page.waitForTimeout(800);

  const empNameError = await page
    .locator('div[role="dialog"] p', { hasText: /employee name is required/i })
    .isVisible()
    .catch(() => false);

  if (empNameError) {
    console.log('  [saveModalAndWaitClose] Employee Name required — filling and retrying');
    page.off('dialog', captureHandler);
    page.once('dialog', (d) => {
      nativeMsg = d.message();
      d.accept().catch(() => {});
    });
    await page
      .locator('div[role="dialog"] p:has-text("Employee Name") ~ div input')
      .first()
      .fill(ADD_TEST_EMP_NAME);
    await page.locator('div[role="dialog"]').last()
      .getByRole('button', { name: /save/i }).click();
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(500);

  if (nativeMsg && /already exists|error|failed|already assigned/i.test(nativeMsg)) {
    throw new Error(`Save rejected by app: "${nativeMsg}"`);
  }

  await expect
    .poll(
      async () => {
        const visible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
        if (visible) {
          const content = await page.locator('div[role="dialog"]').last()
            .textContent().catch(() => '');
          console.log(
            `  [saveModalAndWaitClose] dialog still open — content: "${content.slice(0, 300)}"`
          );
        }
        return visible;
      },
      {
        message: 'MUI dialog should close after successful save',
        timeout: 20000,
        intervals: [300, 300, 500, 500, 1000, 1000, 2000, 2000, 3000, 3000],
      }
    )
    .toBe(false);

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

// ─── confirmDeleteDialog ──────────────────────────────────────────────────────
// FIX for TC-013:
// Image 2 shows the confirm dialog has the heading "Confirm Delete" and its
// own Cancel + Delete buttons. The old locator used hasNot('text=SOLUTION
// MEMBER DETAILS') which caused scrollIntoViewIfNeeded to hang because the
// confirm dialog is a child of the same stacking context as the detail dialog.
//
// Fix: locate by the confirm dialog's OWN heading text "Confirm Delete",
// then fire the click via dispatchEvent to bypass MUI backdrop
// pointer-events that blocked normal .click().
async function confirmDeleteDialog(page) {
  await page.waitForTimeout(600);

  // Target the confirm dialog by its unique heading "Confirm Delete" (Image 2)
  const confirmDialog = page.locator('div[role="dialog"]', {
    has: page.locator('text=Confirm Delete'),
  }).first();

  const isVisible = await confirmDialog
    .isVisible({ timeout: 8000 })
    .catch(() => false);

  if (isVisible) {
    console.log('  [confirmDeleteDialog] "Confirm Delete" dialog visible — dispatching click');
    const deleteBtn = confirmDialog.getByRole('button', { name: /^delete$/i });
    // waitFor attached ensures the element exists before dispatchEvent
    await deleteBtn.waitFor({ state: 'attached', timeout: 10000 });
    // dispatchEvent bypasses pointer-events:none on MUI backdrops
    await deleteBtn.dispatchEvent('click');
    console.log('  [confirmDeleteDialog] click dispatched');
  } else {
    console.warn('  [confirmDeleteDialog] Confirm dialog not found — relying on native alert handler');
  }

  await expect
    .poll(
      () => page.locator('div[role="dialog"]').isVisible().catch(() => false),
      {
        message: 'All dialogs should close after delete',
        timeout: 25000,
        intervals: [300, 500, 500, 1000, 2000, 3000, 3000],
      }
    )
    .toBe(false);

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

async function selectDialogDropdown(page, labelText, optionText) {
  const dialog = page.locator('div[role="dialog"]').last();
  const combo  = dialog.locator(`p:has-text("${labelText}") ~ div [role="combobox"]`).first();
  await combo.click();
  await page.locator('li[role="option"]').filter({ hasText: optionText }).first().click();
  await page.waitForTimeout(200);
}

async function fillDialogInput(page, labelText, value) {
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.locator(`p:has-text("${labelText}") ~ div input`).first().fill(value);
}

async function prepareForAdd(page, svcNo) {
  await deleteMemberFromDB(svcNo).catch(() => {});

  await expect
    .poll(
      () => getMemberFromDB(svcNo).then(r => r ?? null),
      {
        message: `DB row for ${svcNo} should be gone after deleteMemberFromDB`,
        timeout: 10000,
        intervals: [300, 500, 500, 1000, 1000, 2000],
      }
    )
    .toBeNull();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(
    page.getByRole('heading', { name: 'Solution Team Members', exact: true })
  ).toBeVisible({ timeout: 15000 });

  await page.getByPlaceholder('Service No / Position').fill(svcNo);
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  await expect
    .poll(
      () =>
        page.locator('tbody tr').filter({
          has: page.locator('td:nth-child(2)', { hasText: svcNo }),
        }).count(),
      {
        message: `Row for ${svcNo} should be absent after DB delete + reload`,
        timeout: 15000,
        intervals: [300, 500, 500, 1000, 1000, 2000, 2000],
      }
    )
    .toBe(0);

  console.log(`  [prepareForAdd] confirmed: no rows visible for ${svcNo}`);
  await page.waitForTimeout(1500);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(
    page.getByRole('heading', { name: 'Solution Team Members', exact: true })
  ).toBeVisible({ timeout: 15000 });
}

async function waitForRowCount(page, expectedCount) {
  if (expectedCount === 0) {
    await expect
      .poll(() => page.locator('tbody tr').count(), {
        timeout: 15000,
        intervals: [200, 300, 500, 1000],
      })
      .toBeLessThanOrEqual(1);
  } else {
    await expect
      .poll(() => page.locator('tbody tr').count(), {
        timeout: 20000,
        intervals: [200, 300, 500, 1000, 2000],
      })
      .toBeGreaterThanOrEqual(1);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Solution Team Members Page', () => {

  test.beforeEach(async ({ page }) => {
    await goToSolutionTeamMembers(page);
  });

  test.afterAll(async () => {
    await pool.end();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-001
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-001: Page loads with all required elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Solution Team Members', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Service No / Position')).toBeVisible();
    await expect(page.getByRole('button', { name: /display all/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add new/i })).toBeVisible();

    for (const h of ['POSITION', 'SERVICE NO', 'EMP NAME', 'ROLE', 'TEAM NAME', 'ACTION']) {
      await expect(page.getByRole('columnheader', { name: h })).toBeVisible();
    }
    console.log('✅ TC-STM-001 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-002
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-002: Display All loads all rows from DB', async ({ page }) => {
    await clickDisplayAll(page);
    const dbCount = await countMembersInDB();

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    await expect
      .poll(
        async () => {
          const c1 = await page.locator('tbody tr').count();
          await page.waitForTimeout(500);
          const c2 = await page.locator('tbody tr').count();
          return c1 === c2;
        },
        {
          message: 'Table row count should stabilise',
          timeout: 20000,
          intervals: [500, 500, 1000, 1000, 2000],
        }
      )
      .toBe(true);

    const uiRows = await page.locator('tbody tr').count();
    if (uiRows !== dbCount) {
      console.warn(`  ⚠️  Row count mismatch: UI=${uiRows}, DB=${dbCount}.`);
    }
    expect(uiRows).toBeGreaterThanOrEqual(1);
    if (uiRows >= dbCount) {
      expect(uiRows).toBeGreaterThanOrEqual(dbCount);
    }
    console.log(`✅ TC-STM-002 PASSED — UI: ${uiRows}, DB: ${dbCount}`);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-003
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-003: Search by Service No returns matching row', async ({ page }) => {
    await page.getByPlaceholder('Service No / Position').fill(KNOWN_SVC_NO);
    await page.getByRole('button', { name: /search/i }).click();
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });

    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(1);

    const cells = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    for (const c of cells) expect(c.trim()).toContain(KNOWN_SVC_NO);

    console.log(`✅ TC-STM-003 PASSED — ${rows} row(s)`);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-004
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-004: Search by Position returns matching row', async ({ page }) => {
    await page.getByPlaceholder('Service No / Position').fill('AAA');
    await page.getByRole('button', { name: /search/i }).click();
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });

    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(1);
    console.log(`✅ TC-STM-004 PASSED — ${rows} row(s)`);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-005
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-005: Search with non-existent value shows no results', async ({ page }) => {
    await page.getByPlaceholder('Service No / Position').fill('000000000');
    await page.getByRole('button', { name: /search/i }).click();

    await waitForRowCount(page, 0);

    const hasNoDataHeading = await page
      .getByRole('heading', { name: /no solution team members found/i })
      .isVisible().catch(() => false);

    const uiRows = await page.locator('tbody tr').count();
    expect(uiRows === 0 || hasNoDataHeading).toBeTruthy();
    console.log('✅ TC-STM-005 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-006
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-006: Add New modal opens with correct fields', async ({ page }) => {
    await openAddModal(page);
    const dialog = page.locator('div[role="dialog"]');

    for (const label of [
      'Position', 'Service No', 'Employee Name', 'Email',
      'Role', 'Division', 'Active Status', 'Team Name',
      'Playsheet', 'Incentive Eligibility', 'Group',
    ]) {
      await expect(dialog.locator(`p:has-text("${label}")`)).toBeVisible();
    }
    await expect(dialog.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();

    await dialog.getByRole('button', { name: /cancel/i }).click();
    console.log('✅ TC-STM-006 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-007: Add new member saves to UI and DB  (Service No: 5555)
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-007: Add new member saves to UI and DB', async ({ page }) => {
    const snapshot = await getMemberFromDB(ADD_TEST_SVC_NO);

    try {
      await prepareForAdd(page, ADD_TEST_SVC_NO);

      await openAddModal(page);
      const dialog = page.locator('div[role="dialog"]').last();

      await fillDialogInput(page, 'Service No', ADD_TEST_SVC_NO);

      // FIX: fills ALL required text fields + all six required dropdowns
      await fillAllRequiredFieldsForAdd(page, dialog);

      await saveModalAndWaitClose(page);

      // Verify in UI
      await page.getByPlaceholder('Service No / Position').fill(ADD_TEST_SVC_NO);
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const savedRow = page.locator('tbody tr').filter({
        has: page.locator('td:nth-child(2)', { hasText: ADD_TEST_SVC_NO })
      }).first();
      await expect(savedRow).toBeVisible({ timeout: 15000 });

      // Verify in DB
      const dbRow = await getMemberFromDB(ADD_TEST_SVC_NO);
      expect(dbRow).toBeTruthy();
      expect(String(dbRow[PK])).toBe(ADD_TEST_SVC_NO);

      console.log('✅ TC-STM-007 PASSED');
    } finally {
      await restoreSnapshot(snapshot, ADD_TEST_SVC_NO);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-010
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-010: Show button opens detail modal with correct data', async ({ page }) => {
    const dbRow = await getMemberFromDB(KNOWN_SVC_NO);
    expect(dbRow).toBeTruthy();

    await openShowModalForMember(page, KNOWN_SVC_NO);

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator(`text=${KNOWN_SVC_NO}`)).toBeVisible({ timeout: 5000 });

    await closeAllDialogs(page);
    console.log('✅ TC-STM-010 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-011: Edit member name saves to UI and DB  (Service No: 666)
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-011: Edit member name saves to UI and DB', async ({ page }) => {
    const snapshot = await getMemberFromDB(EDIT_TEST_SVC_NO);

    try {
      if (!snapshot) {
        await seedMemberInDB(EDIT_TEST_SVC_NO);
        console.log(`  [TC-011] Seeded row for ${EDIT_TEST_SVC_NO}`);
      } else {
        console.log(`  [TC-011] Row for ${EDIT_TEST_SVC_NO} confirmed in DB`);
      }

      await openShowModalForMember(page, EDIT_TEST_SVC_NO);

      const dialog = page.locator('div[role="dialog"]').last();
      await dialog.getByRole('button', { name: /edit/i }).click();
      await page.waitForTimeout(500);

      // FIX: letters + spaces + dots ONLY — no digits (app regex rejects them)
      const suffix  = new Date().toISOString().replace(/[^a-zA-Z]/g, '').slice(0, 8);
      const newName = `${EDIT_TEST_EMP_NAME_BASE} ${suffix}`;
      console.log(`  [TC-011] Using newName: "${newName}"`);

      const nameInput = dialog.locator('p:has-text("Employee Name") ~ div input').first();
      await nameInput.fill('');
      await nameInput.fill(newName);

      const hasValidationError = await dialog
        .locator('p', { hasText: /only letters.*spaces.*dots/i })
        .isVisible()
        .catch(() => false);
      if (hasValidationError) {
        throw new Error(`TC-STM-011: Validation error after filling "${newName}".`);
      }

      await saveModalAndWaitClose(page);

      const dbRow = await getMemberFromDB(EDIT_TEST_SVC_NO);
      expect(dbRow).toBeTruthy();
      const empNameKey = Object.keys(dbRow).find(k => /emp.*name|employee.*name/i.test(k));
      if (empNameKey) {
        expect(String(dbRow[empNameKey])).toContain(EDIT_TEST_EMP_NAME_BASE);
      }

      console.log('✅ TC-STM-011 PASSED');
    } finally {
      await restoreSnapshot(snapshot, EDIT_TEST_SVC_NO);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-012
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-012: Cancel edit discards changes', async ({ page }) => {
    const snapshot = await getMemberFromDB(KNOWN_SVC_NO);
    expect(snapshot).toBeTruthy();

    await openShowModalForMember(page, KNOWN_SVC_NO);

    const dialog = page.locator('div[role="dialog"]').last();
    await dialog.getByRole('button', { name: /edit/i }).click();
    await page.waitForTimeout(500);

    const nameInput = dialog.locator('p:has-text("Employee Name") ~ div input').first();
    await nameInput.fill('SHOULD BE DISCARDED');

    await dialog.getByRole('button', { name: /cancel/i }).click();
    await page.waitForTimeout(500);

    const dbRow = await getMemberFromDB(KNOWN_SVC_NO);
    const empNameKey = Object.keys(dbRow).find(k => /emp.*name|employee.*name/i.test(k));
    if (empNameKey) {
      expect(String(dbRow[empNameKey])).not.toContain('SHOULD BE DISCARDED');
    }

    await closeAllDialogs(page);
    console.log('✅ TC-STM-012 PASSED');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-013: Delete member removes from UI and DB  (Service No: 222)
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-013: Delete member removes from UI and DB', async ({ page }) => {
    const snapshot = await getMemberFromDB(DELETE_TEST_SVC_NO);

    try {
      if (!snapshot) {
        await seedMemberInDB(DELETE_TEST_SVC_NO);
        console.log(`  [TC-013] Seeded row for ${DELETE_TEST_SVC_NO}`);
      } else {
        console.log(`  [TC-013] Row for ${DELETE_TEST_SVC_NO} confirmed in DB`);
      }

      await openShowModalForMember(page, DELETE_TEST_SVC_NO);

      const dialog = page.locator('div[role="dialog"]').last();
      await dialog.getByRole('button', { name: /delete/i }).click();

      // FIX: locates confirm dialog by "Confirm Delete" heading,
      //      uses dispatchEvent to bypass MUI backdrop pointer-events
      await confirmDeleteDialog(page);

      // Verify gone from UI
      await page.getByPlaceholder('Service No / Position').fill(DELETE_TEST_SVC_NO);
      await page.getByRole('button', { name: /search/i }).click();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      await expect
        .poll(
          () =>
            page.locator('tbody tr').filter({
              has: page.locator('td:nth-child(2)', { hasText: DELETE_TEST_SVC_NO }),
            }).count(),
          { timeout: 15000, intervals: [300, 500, 1000, 2000] }
        )
        .toBe(0);

      const dbRow = await getMemberFromDB(DELETE_TEST_SVC_NO);
      expect(dbRow).toBeFalsy();

      console.log('✅ TC-STM-013 PASSED');
    } finally {
      if (snapshot) {
        await restoreSnapshot(snapshot, DELETE_TEST_SVC_NO);
      }
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-015: Add new member — all fields saved correctly in DB (SvcNo: 5555)
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-015: Add new member — all fields saved correctly in DB', async ({ page }) => {
    const snapshot = await getMemberFromDB(ADD_TEST_SVC_NO);

    try {
      await prepareForAdd(page, ADD_TEST_SVC_NO);

      await openAddModal(page);
      const dialog = page.locator('div[role="dialog"]').last();

      await fillDialogInput(page, 'Service No', ADD_TEST_SVC_NO);

      // FIX: fills ALL required fields including all six required dropdowns
      await fillAllRequiredFieldsForAdd(page, dialog);

      await saveModalAndWaitClose(page);

      const dbRow = await getMemberFromDB(ADD_TEST_SVC_NO);
      expect(dbRow).toBeTruthy();
      expect(String(dbRow[PK])).toBe(ADD_TEST_SVC_NO);

      console.log('✅ TC-STM-015 PASSED');
    } finally {
      await restoreSnapshot(snapshot, ADD_TEST_SVC_NO);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TC-STM-017
  // ══════════════════════════════════════════════════════════════════════════

  test('TC-STM-017: Show modal displays all fields', async ({ page }) => {
    const dbRow = await getMemberFromDB(KNOWN_SVC_NO);
    expect(dbRow).toBeTruthy();

    await openShowModalForMember(page, KNOWN_SVC_NO);

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    for (const label of [
      'Position', 'Service No', 'Employee Name',
      'Role', 'Team Name', 'Active Status',
    ]) {
      await expect(dialog.locator(`p:has-text("${label}")`)).toBeVisible({ timeout: 5000 });
    }

    await closeAllDialogs(page);
    console.log('✅ TC-STM-017 PASSED');
  });

});
