import { test, expect } from '@playwright/test';

test('All Roles Incentive Flow', async ({ page }) => {

  await page.goto('https://dpdlab1.slt.lk:8454/');
  await page.getByRole('button', { name: /Microsoft Login/i }).click();

  // Wait for login
  await page.waitForTimeout(15000);

  await page.getByText('Reference Data').click();
  await page.getByText('Commission Distribution - Sales Teams').click();

  // 🔥 ALL ROLES DATA (you can expand this)
  const roles = [
    { name: 'AM', inc50: '50.00%', inc100: '50.00%', inc101: '0.00%' },
    { name: 'ENG', inc50: '100.00%', inc100: '200.00%', inc101: '250.00%' },
    { name: 'DGM', inc50: '300.00%', inc100: '300.00%', inc101: '400.00%' },
    { name: 'GM', inc50: '109.00%', inc100: '104.00%', inc101: '109.00%' },
    { name: 'enterprise_business', inc50: '1.00%', inc100: '0.00%', inc101: '3.00%' }
  ];

  for (const role of roles) {

    // Select role from dropdown
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: role.name }).click();

    // Select row
    await page.getByRole('row', { name: new RegExp(role.name, 'i') })
      .getByRole('button')
      .click();

    await page.waitForTimeout(2000);

    // Fill values
    await page.locator('input[name="incPctg50"]').fill(role.inc50);
    await page.locator('input[name="incPctg100"]').fill(role.inc100);
    await page.locator('input[name="incPctg101"]').fill(role.inc101);

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForTimeout(2000);
  }

});
