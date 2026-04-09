import { test } from '@playwright/test';

test.setTimeout(140000);

test('solution team invalid commission validation', async ({ page }) => {
  await page.goto('https://dpdlab1.slt.lk:8454/', { timeout: 60000 });
  await page.getByRole('button', { name: 'Microsoft Login to Microsoft' }).click();
  await page.getByRole('img', { name: 'Ref Data' }).click();
  await page.getByText('Commission Distribution - Solution Teams').click();

  const invalidValue = '200';

  const selectSolutionTeam = async (teamName) => {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: teamName, exact: true }).click();
    await page.waitForSelector('button:has-text("Edit")', { timeout: 15000 });
  };

  const saveThenCancelIfVisible = async () => {
    page.once('dialog', (dialog) => dialog.dismiss().catch(() => {}));
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    const cancelButton = page.getByRole('button', { name: 'Cancel' }).first();
    if (await cancelButton.count() > 0 && await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click().catch(() => {});
    }
  };

  const editFirstRowWithInvalidValue = async () => {
    await page.locator('button:has-text("Edit")').first().click();
    const input = page.locator('input:visible').first();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.fill(invalidValue);
    await saveThenCancelIfVisible();
  };

  const teams = [
    'CES Development Team',
    'CES Maintenance Team',
    'CES Support Team',
    'DPDS Analytics Team',
    'DPDS Development Team',
    'DPDS Research Team',
    'DTP Deployment Team',
  ];

  for (const teamName of teams) {
    await selectSolutionTeam(teamName);
    await editFirstRowWithInvalidValue();
  }
});