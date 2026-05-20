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
  const codeField = page.locator('text=Section Code').locator('xpath=following::*[@role="textbox"][1]');
  await expect(codeField).toBeVisible({ timeout: 60000 });
  await codeField.click();
  await slow(page);
  await codeField.fill('CES@');
  await slow(page);

  // Update section name
  const nameField = page.locator('text=Section Name').locator('xpath=following::*[@role="textbox"][1]');
  await expect(nameField).toBeVisible({ timeout: 60000 });
  await nameField.click();
  await slow(page);
  await nameField.press('End');
  await slow(page);
  await nameField.fill('Cloud and Emerging Solution Sections@');
  await slow(page);

  // Dropdowns
  const productType = page.locator('text=Product Type').locator('xpath=following::*[@role="combobox"][1]');
  await productType.click();
  await slow(page);
  await page.getByRole('option', { name: 'Domestic' }).click();
  await slow(page);

  const teamType = page.locator('text=Team Type').locator('xpath=following::*[@role="combobox"][1]');
  await teamType.click();
  await slow(page);
  await page.getByRole('option', { name: 'SALESTEAM' }).click();
  await slow(page);

  const divisionField = page.locator('text=Division').locator('xpath=following::*[@role="combobox"][1]');
  await divisionField.click();
  await slow(page);
  await page.getByRole('option', { name: '- PRIVATE' }).click();
  await slow(page);

  // Value field
  const valueField = page.locator('text=Staff Count').locator('xpath=following::*[@role="spinbutton"][1]');
  await expect(valueField).toBeVisible({ timeout: 60000 });
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
  const newCode = page.locator('text=Section Code').locator('xpath=following::*[@role="textbox"][1]');
  await expect(newCode).toBeVisible({ timeout: 60000 });
  await newCode.click();
  await slow(page);
  await newCode.fill('CES');
  await slow(page);

  // New name
  const newName = page.locator('text=Section Name').locator('xpath=following::*[@role="textbox"][1]');
  await expect(newName).toBeVisible({ timeout: 60000 });
  await newName.click();
  await slow(page);
  await newName.fill('Network');
  await slow(page);

  // Dropdowns
  const newProductType = page.locator('text=Product Type').locator('xpath=following::*[@role="combobox"][1]');
  await newProductType.click();
  await slow(page);
  await page.getByRole('option', { name: 'Domestic' }).click();
  await slow(page);

  const newTeamType = page.locator('text=Team Type').locator('xpath=following::*[@role="combobox"][1]');
  await newTeamType.click();
  await slow(page);
  await page.getByRole('option', { name: 'SALESTEAM' }).click();
  await slow(page);

  const newDivision = page.locator('text=Division').locator('xpath=following::*[@role="combobox"][1]');
  await newDivision.click();
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