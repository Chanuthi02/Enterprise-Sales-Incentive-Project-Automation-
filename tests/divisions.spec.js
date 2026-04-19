import { test, expect } from '@playwright/test';

test('Division Full Flow - SURVAY 2022', async ({ page }) => {

  // 1. Login
  await page.goto('https://dpdlab1.slt.lk:8454/');
  await page.getByRole('button', { name: /Microsoft Login/i }).click();

  // 2. Navigate
  await page.getByRole('img', { name: 'Ref Data' }).first().click();
  await page.getByText('Division').click();

  // 3. Add Division
  await page.getByRole('button', { name: /\+ Add Division/i }).click();

  const inputs = page.getByRole('textbox');

  // Division Code = 2022
  await inputs.nth(0).fill('2022');

  // Division Name = SURVAY
  await inputs.nth(1).fill('SURVAY');

  // Team Type
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'SOLTEAM' }).click();

  // Save
  await page.getByRole('button', { name: /^Save$/ }).click();

  // ✅ CLOSE ANY POPUP / DIALOG IF EXISTS
  const dialogClose = page.getByRole('button', { name: /Close|OK|Cancel/i });
  if (await dialogClose.first().isVisible().catch(() => false)) {
    await dialogClose.first().click();
  }

  // ✅ WAIT UNTIL UI IS CLICKABLE AGAIN
  await page.waitForLoadState('networkidle');

  // 4. Find row safely
  const row = page.locator('tr').filter({ hasText: 'SURVAY' }).first();
  await expect(row).toBeVisible();

  // 5. Open (Show)
  await row.locator('button').first().click();

  // 6. Edit
  await page.getByRole('button', { name: /Edit/i }).first().click();

  const editInputs = page.getByRole('textbox');

  // Modify values
  await editInputs.nth(0).fill('2022@');
  await editInputs.nth(1).fill('SURVAY@');

  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.getByRole('button', { name: /^Cancel$/ }).click();

  // 7. Delete
  page.once('dialog', async dialog => {
    console.log(`Dialog: ${dialog.message()}`);
    await dialog.accept();
  });

  await page.getByRole('button', { name: /Delete/i }).click();

});