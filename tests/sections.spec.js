import { test, expect } from '@playwright/test';

// Small helper delay
const slow = async (page) => {
  await page.waitForTimeout(300); // adjust: 200–400ms if needed
};

test('Sections Full Flow (Slightly Slower)', async ({ page }) => {

  // 1. Navigate & Login
  await page.goto('https://dpdlab1.slt.lk:8454/', { waitUntil: 'domcontentloaded' });
  await slow(page);

  await page.getByRole('button', { name: /Microsoft Login/i }).click();
  await slow(page);

  // 2. Navigate to Sections
  await page.getByRole('img', { name: 'Ref Data' }).first().click();
  await slow(page);

  await page.getByText('Sections').click();
  await slow(page);

  // 3. Open existing row
  const row = page.getByRole('row', { name: /CES Cloud and Emerging/i }).first();
  await row.locator('button').first().click();
  await slow(page);

  // 4. Edit section
  await page.getByRole('button', { name: /Edit/i }).first().click();
  await slow(page);

  // Update section code
  const codeField = page.locator('[id="_r_p_"]');
  await codeField.click();
  await slow(page);
  await codeField.fill('CES@');
  await slow(page);

  // Update section name
  const nameField = page.locator('[id="_r_q_"]');
  await nameField.click();
  await slow(page);
  await nameField.press('End');
  await slow(page);
  await nameField.fill('Cloud and Emerging Solution Sections@');
  await slow(page);

  // Dropdowns
  await page.getByRole('combobox', { name: 'International' }).click();
  await slow(page);
  await page.getByRole('option', { name: 'Domestic' }).click();
  await slow(page);

  await page.getByRole('combobox', { name: 'SALESTEAM' }).click();
  await slow(page);
  await page.getByRole('option', { name: 'SALESTEAM' }).click();
  await slow(page);

  await page.getByRole('combobox', { name: 'EB - Enterprise Business' }).click();
  await slow(page);
  await page.getByRole('option', { name: '- PRIVATE' }).click();
  await slow(page);

  // Value field
  const valueField = page.locator('[id="_r_11_"]');
  await valueField.click();
  await slow(page);
  await valueField.fill('0');
  await slow(page);

  // Save & cancel
  await page.getByRole('button', { name: 'Save' }).click();
  await slow(page);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await slow(page);

  // Close dialog
  await page.getByRole('button', { name: 'close' }).click();
  await slow(page);

  // 5. Add new section
  await page.getByRole('button', { name: '+ Add New' }).click();
  await slow(page);

  // New code
  const newCode = page.locator('[id="_r_15_"]');
  await newCode.click();
  await slow(page);
  await newCode.fill('CES');
  await slow(page);

  // New name
  const newName = page.locator('[id="_r_16_"]');
  await newName.click();
  await slow(page);
  await newName.fill('Network');
  await slow(page);

  // Dropdowns
  await page.locator('[id="_r_17_"]').click();
  await slow(page);
  await page.getByRole('option', { name: 'Domestic' }).click();
  await slow(page);

  await page.locator('[id="_r_19_"]').click();
  await slow(page);
  await page.getByRole('option', { name: 'SALESTEAM' }).click();
  await slow(page);

  await page.getByLabel('', { exact: true }).click();
  await slow(page);
  await page.getByRole('option', { name: 'DP - Digital Platforms' }).click();
  await slow(page);

  // Save flow
  await page.getByRole('button', { name: 'Save' }).click();
  await slow(page);
  await page.getByRole('button', { name: 'Save' }).click();
  await slow(page);
  await page.getByRole('button', { name: 'Cancel' }).click();

});