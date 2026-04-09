import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Navigate to the application
  await page.goto('https://dpdlab1.slt.lk:8454/', { timeout: 60000 }); // Extended timeout for page load
  await page.getByRole('button', { name: 'Microsoft Login to Microsoft' }).click();

  // Wait for the Reference Data section to load
  await page.waitForSelector('text=Reference Data', { timeout: 15000 }); // Reduced timeout for faster execution
  await page.getByText('Reference Data').click();

  // Navigate to Commission Distribution - Sales Teams
  await page.getByText('Commission Distribution - Sales Teams').click();

  // Define roles to test with invalid details
  const roles = ['AM', 'ENG', 'DGM', 'GM', 'Sales ENG', 'enterprise_business'];

  // Iterate through each role
  for (const roleName of roles) {
    // Select Role from the combobox
    await page.waitForSelector('[role="combobox"]', { state: 'attached', timeout: 15000 });
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: roleName, exact: true }).click();

    // Wait for the table to load
    await page.waitForSelector('table', { state: 'attached', timeout: 15000 });

    // Assuming one row per role for simplicity, find the row and click Edit
    // Note: Adjust selector if needed based on actual row structure
    const tableRow = page.locator('table tbody tr').first(); // Assuming the first row is editable
    await tableRow.scrollIntoViewIfNeeded({ timeout: 30000 });

    const isVisible = await tableRow.isVisible();
    if (!isVisible) {
      throw new Error(`Row for ${roleName} is not visible.`);
    }

    // Click the Edit button
    await tableRow.getByRole('button', { name: 'Edit' }).click();

    // Fill in invalid values (0 and more than 100)
    await page.locator('input[name="incPctg50"]').fill('0');
    await page.locator('input[name="incPctg100"]').fill('101');
    await page.locator('input[name="incPctg101"]').fill('102');

    // Click Save button to attempt saving invalid data (for validation testing)
    await page.getByRole('button', { name: 'Save' }).click();

    // Click Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Wait for the combobox to be ready again before proceeding
    await page.waitForSelector('[role="combobox"]', { state: 'attached', timeout: 15000 });
  }
});