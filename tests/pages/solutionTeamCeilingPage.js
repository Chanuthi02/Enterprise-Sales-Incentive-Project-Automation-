// tests/pages/solutionTeamCeilingPage.js
class SolutionTeamCeilingPage {
  constructor(page) {
    this.page = page;
    
    // Table selectors
    this.ceilingTable = page.locator('table');
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
    
    // Edit buttons
    this.editButtons = page.locator('button:has-text("Edit"), button:has-text("EDIT")');
    
    // Dialog selectors - using the specific dialog role
    this.editDialog = page.getByRole('dialog', { name: 'EDIT DISTRIBUTION' });
    
    // The 4th input (index 3) is the Solution Team % (Ceiling Value)
    // Based on the error: input names are solutionName, solutionEngPercentage, siEngPercentage, solutionTeamPercentage
    this.ceilingValueInput = this.editDialog.locator('input[name="solutionTeamPercentage"]');
    this.solutionNameInput = this.editDialog.locator('input[name="solutionName"]');
    
    // Dialog buttons
    this.dialogSaveButton = this.editDialog.locator('button:has-text("Save"), button:has-text("Update")');
    this.dialogCancelButton = this.editDialog.locator('button:has-text("Cancel")');
    
    // Success/Error messages
    this.successMessage = page.locator('.success-message, .alert-success, .MuiAlert-root');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Solution Team Ceiling Values page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/solution-team-ceiling-values', {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '60000', 10)
    });
    await this.waitForPageLoad();
    console.log('✅ Page loaded');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async waitForLoadingToComplete() {
    if (await this.loadingSpinner.isVisible().catch(() => false)) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    }
    await this.page.waitForTimeout(500);
  }

  async waitForDialog() {
    await this.editDialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    console.log('✅ Dialog opened');
  }

  async waitForDialogToClose() {
    await this.editDialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    console.log('✅ Dialog closed');
  }

  // ========== TABLE METHODS ==========
  
  async isTableVisible() {
    return await this.ceilingTable.isVisible().catch(() => false);
  }

  async getRowCount() {
    return await this.tableRows.count();
  }

  async getTableHeaders() {
    const headers = await this.tableHeaders.all();
    const headerTexts = [];
    for (const header of headers) {
      headerTexts.push((await header.textContent()).trim());
    }
    return headerTexts;
  }

  async getTableData() {
    const rows = await this.tableRows.all();
    const tableData = [];
    
    for (const row of rows) {
      const cells = await row.locator('td').all();
      const rowData = [];
      for (const cell of cells) {
        rowData.push((await cell.textContent()).trim());
      }
      tableData.push(rowData);
    }
    
    return tableData;
  }

  async getRowIndexBySolution(solutionName) {
    const rows = await this.tableRows.all();
    
    for (let i = 0; i < rows.length; i++) {
      const cells = await rows[i].locator('td').all();
      if (cells.length > 0) {
        const firstCell = await cells[0].textContent();
        if (firstCell && firstCell.trim() === solutionName) {
          return i;
        }
      }
    }
    return -1;
  }

  // ========== EDIT FUNCTIONALITY ==========
  
  async clickEditButton(rowIndex = 0) {
    console.log(`Clicking edit button for row ${rowIndex}...`);
    const editButtons = await this.editButtons.all();
    if (editButtons.length > rowIndex) {
      await editButtons[rowIndex].click();
      await this.waitForDialog();
      return true;
    }
    console.log('❌ Edit button not found');
    return false;
  }

  async clickEditButtonForSolution(solutionName) {
    const rowIndex = await this.getRowIndexBySolution(solutionName);
    if (rowIndex >= 0) {
      return await this.clickEditButton(rowIndex);
    }
    console.log(`❌ Solution "${solutionName}" not found`);
    return false;
  }

  async updateCeilingValueInDialog(newValue) {
    console.log(`Updating ceiling value to: ${newValue}`);
    // Target the specific input for Solution Team % (ceiling value)
    await this.ceilingValueInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.ceilingValueInput.clear();
    await this.ceilingValueInput.fill(newValue.replace('%', ''));
    await this.page.waitForTimeout(500);
    console.log(`✅ Entered new value: ${newValue}`);
  }

 async saveDialog() {
  console.log('Clicking save in dialog...');
  
  // Wait for save button to be enabled
  await this.dialogSaveButton.waitFor({ state: 'visible', timeout: 5000 });
  
  // Click save
  await this.dialogSaveButton.click();
  
  // Wait for dialog to close
  await this.waitForDialogToClose();
  
  // Wait for any loading to complete
  await this.waitForLoadingToComplete();
  
  // Additional wait for the page to settle
  await this.page.waitForTimeout(1000);
  
  console.log('✅ Saved');
}

  async cancelDialog() {
    console.log('Clicking cancel in dialog...');
    await this.dialogCancelButton.click();
    await this.waitForDialogToClose();
    console.log('✅ Cancelled');
  }

  async editCeilingValue(solutionName, newValue) {
    console.log(`\n🔄 Editing ${solutionName} ceiling to ${newValue}`);
    
    const clicked = await this.clickEditButtonForSolution(solutionName);
    if (!clicked) {
      throw new Error(`Could not find edit button for ${solutionName}`);
    }
    
    await this.updateCeilingValueInDialog(newValue);
    await this.saveDialog();
    
    console.log(`✅ Successfully edited ${solutionName} ceiling to ${newValue}`);
  }

  async editAndCancel(solutionName, newValue) {
    console.log(`\n🔄 Testing cancel for ${solutionName} with ${newValue}`);
    
    const clicked = await this.clickEditButtonForSolution(solutionName);
    if (!clicked) {
      throw new Error(`Could not find edit button for ${solutionName}`);
    }
    
    await this.updateCeilingValueInDialog(newValue);
    await this.cancelDialog();
    
    console.log(`✅ Cancelled edit for ${solutionName}`);
  }

  // ========== VERIFICATION METHODS ==========
  
  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible().catch(() => false);
  }

  async getSuccessMessage() {
    if (await this.isSuccessMessageVisible()) {
      return await this.successMessage.textContent();
    }
    return null;
  }

  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  async getErrorMessage() {
    if (await this.isErrorMessageVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async getCeilingValueForSolution(solutionName) {
    const rows = await this.tableRows.all();
    
    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length > 0) {
        const firstCell = await cells[0].textContent();
        if (firstCell && firstCell.trim() === solutionName) {
          // Ceiling Value is at index 6 (7th column) based on your headers
          if (cells.length > 6) {
            return await cells[6].textContent();
          }
        }
      }
    }
    return null;
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/ceiling_${name}_${Date.now()}.png`,
      fullPage: true 
    });
  }
}

module.exports = { SolutionTeamCeilingPage };