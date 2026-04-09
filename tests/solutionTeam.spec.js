import { test, expect } from '@playwright/test';

test.setTimeout(140000);

test('solution team invalid commission validation', async ({ page }) => {
  const invalidValue = '200';
  const teams = [
    'CES Development Team',
    'CES Maintenance Team',
    'CES Support Team',
    'DPDS Analytics Team',
    'DPDS Development Team',
    'DPDS Research Team',
    'DTP Deployment Team',
  ];

  await page.goto('https://dpdlab1.slt.lk:8454/', { timeout: 60000 });
  await page.getByRole('button', { name: 'Microsoft Login to Microsoft' }).click();
  await page.getByRole('img', { name: 'Ref Data' }).click();
  await page.getByText('Commission Distribution - Solution Teams').click();

  const selectSolutionTeam = async (teamName) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: teamName, exact: true }).click();
    await page.waitForSelector('table tr', { timeout: 15000 });
  };

  const saveAndCancel = async () => {
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
  };

  const editTeamRow = async (teamName) => {
    const row = page.locator('table tr', { hasText: teamName }).first();
    await expect(row).toBeVisible({ timeout: 15000 });

    await row.getByRole('button', { name: 'Edit' }).click();

    const dialog = page.locator('dialog, [role="dialog"]');
    const incInput = dialog.locator('input[type="text"]:not([disabled])').first();
    await expect(incInput).toBeVisible({ timeout: 15000 });

    await incInput.fill('');
    await incInput.fill(invalidValue);
    await expect(incInput).toHaveValue(invalidValue, { timeout: 5000 });

    await saveAndCancel();
  };

  for (const team of teams) {
    await selectSolutionTeam(team);
    await editTeamRow(team);
  }
});