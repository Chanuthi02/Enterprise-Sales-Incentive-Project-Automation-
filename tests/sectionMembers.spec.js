import { test, expect } from '@playwright/test';

test('Groups / Section Members Flow (All Steps Cleaned)', async ({ page }) => {

  // Open Website
  await page.goto('https://dpdlab1.slt.lk:8454/', {
    waitUntil: 'domcontentloaded'
  });

  // Login
  await page.getByRole('button', {
    name: /Microsoft Login/i
  }).click();

  // Navigate to Groups/Section Members
  await page.getByRole('img', {
    name: 'Ref Data'
  }).first().click();

  await page.getByText('Groups/Section Members').click();

  // Add New
  await page.getByRole('button', {
    name: /\+ Add New/i
  }).click();

  // Wait for dialog
  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toBeVisible({
    timeout: 15000
  });

  // ---------------------------------------------------
  // FORM FILLING
  // ---------------------------------------------------

  // Position
  const position = dialog.getByRole('textbox').nth(0);
  await position.click();
  await position.fill('CB/DOM/DGM');

  // Service No
  const serviceNo = dialog.getByRole('textbox').nth(1);

  await serviceNo.click();
  await serviceNo.fill('SLT0121');

  await dialog.getByRole('textbox').nth(2).click();

  await serviceNo.click();

  await serviceNo.press('ArrowLeft');
  await serviceNo.press('ArrowLeft');
  await serviceNo.press('ArrowLeft');
  await serviceNo.press('ArrowLeft');
  await serviceNo.press('ArrowLeft');

  await serviceNo.press('ArrowRight');

  await serviceNo.fill('0121');

  // Employee Name
  const empName = dialog.getByRole('textbox').nth(2);

  await empName.click();

  await empName.fill('P');
  await empName.fill('Prasanna ');
  await empName.fill('Prasanna G');
  await empName.fill('Prasanna Gunathilaka');

  // Email
  const email = dialog.getByRole('textbox').nth(3);

  await email.click();

  await email.fill('prasannagunathilaka22@gmail.com');

  // ---------------------------------------------------
  // DROPDOWNS
  // ---------------------------------------------------

  // Role
  await dialog.locator('#mui-component-select-role').click();

  await page.getByRole('option', {
    name: 'DGM'
  }).click();

  // Division
  await dialog.locator('#mui-component-select-division').click();

  await page.getByRole('option', {
    name: 'EB'
  }).click();

  // Section
  await dialog.locator('#mui-component-select-section').click();

  await page.getByRole('option', {
    name: 'CES'
  }).click();

  // Playsheet
  await dialog.locator('#mui-component-select-playsheet').click();

  await page.getByRole('option', {
    name: 'Performance'
  }).click();

  // Extra Click (from codegen)
  await page.getByText(
    'PositionService NoEmployee NameEmailRoleDGMDivisionEBActive'
  ).click();

  // Incentive
  await dialog.locator('#mui-component-select-incentive').click();

  await page.getByRole('option', {
    name: 'Yes'
  }).click();

  // Group
  await dialog.locator('#mui-component-select-group').click();

  await page.getByRole('option', {
    name: 'Group A'
  }).click();

  // ---------------------------------------------------
  // SAVE
  // ---------------------------------------------------

  page.once('dialog', dialogBox => {
    console.log(dialogBox.message());
    dialogBox.dismiss().catch(() => {});
  });

  await dialog.getByRole('button', {
    name: /Save/i
  }).click();

  // Extra Click from codegen
  await page.locator('div')
    .filter({
      hasText: 'ADD NEW SECTION'
    })
    .nth(1)
    .click()
    .catch(() => {});

  // Cancel
  await page.getByRole('button', {
    name: /Cancel/i
  }).click().catch(() => {});

  // ---------------------------------------------------
  // SHOW
  // ---------------------------------------------------

  await page.getByRole('button', {
    name: 'Show'
  }).first().click();

  // Title Click
  await page.getByTitle('CB/DOM/DGM')
    .click()
    .catch(() => {});

  // ---------------------------------------------------
  // EDIT
  // ---------------------------------------------------

  await page.getByRole('button', {
    name: /Edit/i
  }).first().click();

  const editDialog = page.locator('[role="dialog"]');

  await expect(editDialog).toBeVisible();

  const editName = editDialog.getByRole('textbox').nth(2);

  await editName.click();
  await editName.click();

  await editName.press('ArrowRight');
  await editName.press('ArrowRight');
  await editName.press('ArrowRight');
  await editName.press('ArrowRight');
  await editName.press('ArrowRight');

  await editName.fill('Prasanna Gunathilaka@');

  // Save Edit
  await editDialog.getByRole('button', {
    name: /Save/i
  }).click();

  // Cancel Edit
  await page.getByRole('button', {
    name: /Cancel/i
  }).click().catch(() => {});

  // ---------------------------------------------------
  // EMPTY BUTTON CLICK
  // ---------------------------------------------------

  await page.getByRole('button')
    .filter({
      hasText: /^$/
    })
    .click()
    .catch(() => {});

  // ---------------------------------------------------
  // SUBOR / SUPER
  // ---------------------------------------------------

  await page.getByRole('button', {
    name: 'SUBOR/SUPER'
  }).first().click();

  await page.getByRole('button', {
    name: 'SUBOR/SUPER'
  }).first().click();

  await page.locator(
    'div:nth-child(2) > div:nth-child(3) > .sc-hlweCQ'
  ).click();

  await page.locator(
    'div:nth-child(2) > div:nth-child(4) > .sc-hlweCQ'
  ).click();

  await page.locator(
    'div:nth-child(2) > div:nth-child(4) > .sc-hlweCQ'
  ).click();

  await page.locator(
    'div:nth-child(2) > div:nth-child(5) > .sc-hlweCQ'
  ).click();

  // ---------------------------------------------------
  // CLOSE
  // ---------------------------------------------------

  await page.getByRole('button', {
    name: /close/i
  }).click().catch(() => {});

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

  const searchBox = page.getByRole('textbox', {
    name: /Service No \/ Position/i
  });

  await searchBox.click();

  await searchBox.fill('0121');

  await page.getByRole('button', {
    name: /search/i
  }).click();

  // Display All
  await page.getByRole('button', {
    name: /Display All/i
  }).click();

});