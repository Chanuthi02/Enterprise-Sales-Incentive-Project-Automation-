import { test, expect } from '@playwright/test';

test('Ceiling Values Automation', async ({ page }) => {

  await page.goto('https://dpdlab1.slt.lk:8454/');

  await page.getByRole('button', { name: /Microsoft Login/i }).click();

  // Navigate (FIX: multiple Ref Data → use first)
  await page.getByRole('img', { name: 'Ref Data' }).first().click();
  await page.getByText('Ceiling Values').click();

  // Select ENG row → FIX: pick FIRST matching edit button
  const row = page.getByRole('row', { name: /ENG MONTH SALESTEAM/i });

  await row.locator('button').first().click();

  // Input edit (NO LONG WAITS)
  const input = page.locator('[id="_r_v_"]');

  await input.click();
  await input.press('ArrowRight');
  await input.press('ArrowRight');
  await input.press('ArrowRight');
  await input.press('ArrowRight');
  await input.press('ArrowRight');
  await input.press('ArrowRight');

  await input.fill('0');

  // Save
  await page.getByRole('button', { name: /Save/i }).click();

  // Cancel
  await page.getByRole('button', { name: /Cancel/i }).click();

  // Dropdown actions (unchanged)
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'CES' }).click();

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'PSBM' }).click();

});