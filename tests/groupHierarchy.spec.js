import { test } from '@playwright/test';

test('Group Current Hierarchy Flow (Cleaned + Slightly Slow)', async ({ page }) => {

  const pause = async (ms = 500) => {
    await page.waitForTimeout(ms);
  };

  await page.goto('https://dpdlab1.slt.lk:8454/');
  await pause();

  // Login
  await page.getByRole('button', { name: 'Microsoft Login to Microsoft' }).click();
  await pause();

  // Navigate
  await page.getByRole('img', { name: 'Ref Data' }).click();
  await pause();

  await page.getByText('Group Current Hierarchy').click();
  await pause();

  // Filter selection
  await page.getByRole('combobox').click();
  await pause();

  await page.getByRole('option', { name: 'Finance Section' }).click();
  await pause();

  // Display
  await page.getByRole('button', { name: 'Display All' }).click();
  await pause(1000);

  // Row action
  await page.getByRole('row', { name: 'IT Section CB/DOM/AM2 Tech' })
    .getByRole('button')
    .click();

  await pause(800);

  // Edit fields
  await page.locator('[id="_r_k_"]').click();
  await pause();

  await page.locator('[id="_r_k_"]').fill('IT Section6');
  await pause();

  await page.locator('[id="_r_l_"]').click();
  await pause();

  // Final action
  await page.getByRole('button').click();
  await pause(800);

});