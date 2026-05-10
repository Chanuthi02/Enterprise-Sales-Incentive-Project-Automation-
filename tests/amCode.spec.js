import { test, expect } from '@playwright/test';

test('AM Code + Solution Team Members Flow (Stable Fixed)', async ({ page }) => {

  const pause = async (ms = 400) => {
    await page.waitForTimeout(ms);
  };

  await page.goto('https://dpdlab1.slt.lk:8454/');
  await pause();

  // Login
  await page.getByRole('button', { name: /Microsoft Login/i }).click();
  await pause();

  // =========================
  // AM CODE SECTION
  // =========================
  await page.getByRole('img', { name: 'Ref Data' }).first().click();
  await pause();

  await page.getByText('AM Code').click();
  await pause();

  await page.getByRole('button', { name: '+ Add New Position' }).click();
  await pause();

  const positionBox = page.getByRole('textbox').first();
  await expect(positionBox).toBeVisible();

  await positionBox.fill('III');
  await pause();

  page.once('dialog', d => d.dismiss().catch(() => {}));

  await page.getByRole('button', { name: /Save/i }).click();
  await pause(1200);

  await page.locator('.MuiBox-root.css-ihi0f0').first().click();
  await pause();

  // =========================
  // SOLUTION TEAM MEMBERS
  // =========================
  await page.getByText('Solution Team Members').click();
  await pause();

  await page.getByRole('button', { name: '+ Add New' }).click();
  await pause();

  // 🔥 FIX: use stable locators (NOT placeholder text)
  const position = page.locator('input[name="position"]');
  const serviceNo = page.locator('input[name="serviceNo"]');
  const empName = page.locator('input[name="employeeName"]');
  const email = page.locator('input[name="email"]');

  await expect(position).toBeVisible();
  await position.fill('III');
  await pause();

  await serviceNo.fill('1222');
  await pause();

  await empName.fill('sams');
  await pause();

  await email.fill('sams@gmail.com');
  await pause();

  await page.locator('#mui-component-select-role').click();
  await page.getByRole('option', { name: 'enterprise_business' }).click();
  await pause();

  await page.locator('#mui-component-select-division').click();
  await page.getByRole('option', { name: 'DP' }).click();
  await pause();

  await page.locator('#mui-component-select-teamName').click();
  await page.getByRole('option', { name: 'CES Support Team' }).click();
  await pause();

  await page.locator('#mui-component-select-playsheet').click();
  await page.getByRole('option', { name: 'Leave Records' }).click();
  await pause();

  await page.locator('#mui-component-select-incentive').click();
  await page.getByRole('option', { name: 'Yes' }).click();
  await pause();

  await page.getByLabel('', { exact: true }).click();
  await page.getByRole('option', { name: 'Group C' }).click();
  await pause();

  page.once('dialog', d => d.dismiss().catch(() => {}));

  await page.getByRole('button', { name: /Save/i }).click();
  await pause(1500);

  await page.getByRole('button', { name: /Cancel/i }).click();
  await pause();

  // =========================
  // AM CODE SECOND ENTRY
  // =========================
  await page.getByRole('img', { name: 'Ref Data' }).first().click();
  await pause();

  await page.getByText('AM Code').click();
  await pause();

  await page.getByRole('button', { name: '+ Add New', exact: true }).click();
  await pause();

  // 🔥 FIX: stable textbox selection (not placeholder-based)
  const adminCode = page.locator('input').nth(0);
  const gmCode = page.locator('input').nth(1);

  await expect(adminCode).toBeVisible();
  await adminCode.fill('III');
  await pause();

  await gmCode.fill('GENEVA1222');
  await pause();

  page.once('dialog', d => d.dismiss().catch(() => {}));

  await page.getByRole('button', { name: /Save/i }).click();
  await pause(1500);

});