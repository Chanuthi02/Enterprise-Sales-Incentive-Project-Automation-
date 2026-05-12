// tests/pages/solutionTeamCeilingPage.js
class SolutionTeamCeilingPage {
  constructor(page) {
    this.page = page;
    
    // Table selectors - try multiple approaches since page might use different rendering
    this.ceilingTable = page.locator('table');
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
    
    // Alternative selectors for div-based tables
    this.dataRows = page.locator('[role="row"]');
    this.dataCells = page.locator('[role="cell"]');
    
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
    
    // No data message (for debugging)
    this.noDataMessage = page.locator('text=/no.*records?|no.*data/i');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Solution Team Ceiling Values page...');
    try {
      // Use longer timeout and try 'load' first, fallback to 'domcontentloaded'
      await this.page.goto('https://dpdlab1.slt.lk:8454/solution-team-ceiling-values', {
        waitUntil: 'load',
        timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '90000', 10)
      }).catch(async (error) => {
        console.log('⚠️ Load timeout, trying with domcontentloaded...');
        await this.page.goto('https://dpdlab1.slt.lk:8454/solution-team-ceiling-values', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
      });
    } catch (error) {
      console.log('❌ Navigation failed:', error.message);
      throw error;
    }
    
    await this.waitForPageLoad();
    console.log('✅ Page loaded');
    
    // Debug: Check if no data message is shown
    const hasNoDataMessage = await this.noDataMessage.isVisible().catch(() => false);
    if (hasNoDataMessage) {
      const msg = await this.noDataMessage.first().textContent();
      console.log(`⚠️ Page showing no-data message: "${msg}"`);
    }
  }

  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('load').catch(() => {
        console.log('⚠️ Load state not reached, waiting for domcontentloaded');
        return this.page.waitForLoadState('domcontentloaded');
      });
    } catch (error) {
      console.log('⚠️ Page load state wait timeout, continuing anyway...');
    }
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

  async areDataTablesAvailable() {
    // Check if either HTML table or div-based table exists on the page
    const htmlTableExists = await this.ceilingTable.count().catch(() => 0) > 0;
    const divTableExists = await this.dataRows.count().catch(() => 0) > 0;
    const tablesAvailable = htmlTableExists || divTableExists;
    
    if (!tablesAvailable) {
      console.log('⚠️ WARNING: Data tables are NOT available on the page');
      console.log('   - No HTML tables found');
      console.log('   - No div-based rows found');
      return false;
    }
    
    console.log('✅ Data tables ARE available on the page');
    return true;
  }

  async getRowCount() {
    // Try HTML table first
    let count = await this.tableRows.count().catch(() => 0);
    if (count > 0) {
      console.log(`Found ${count} rows in HTML table`);
      return count;
    }
    
    // Try role-based rows (for div-based tables)
    count = await this.dataRows.count().catch(() => 0);
    if (count > 0) {
      console.log(`Found ${count} rows in div-based table`);
      return count;
    }
    
    console.log('⚠️ No table rows found using either selector');
    return 0;
  }

  async getTableHeaders() {
    // Try HTML table headers first
    let headers = await this.tableHeaders.all().catch(() => []);
    if (headers.length > 0) {
      const headerTexts = [];
      for (const header of headers) {
        headerTexts.push((await header.textContent()).trim());
      }
      return headerTexts;
    }
    
    // Try role-based headers (for div-based tables)
    const headerCells = await this.page.locator('[role="columnheader"]').all();
    if (headerCells.length > 0) {
      const headerTexts = [];
      for (const cell of headerCells) {
        headerTexts.push((await cell.textContent()).trim());
      }
      return headerTexts;
    }
    
    console.log('⚠️ No table headers found');
    return [];
  }

  async getTableData() {
    const rows = await this.tableRows.all().catch(() => []);
    if (rows.length === 0) {
      // Try div-based rows
      const divRows = await this.dataRows.all();
      const tableData = [];
      
      for (const row of divRows) {
        const cells = await row.locator('[role="cell"]').all();
        const rowData = [];
        for (const cell of cells) {
          rowData.push((await cell.textContent()).trim());
        }
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      }
      
      if (tableData.length > 0) {
        console.log(`Extracted ${tableData.length} rows from div-based table`);
      }
      return tableData;
    }
    
    // HTML table rows
    const tableData = [];
    for (const row of rows) {
      const cells = await row.locator('td').all();
      const rowData = [];
      for (const cell of cells) {
        rowData.push((await cell.textContent()).trim());
      }
      tableData.push(rowData);
    }
    
    console.log(`Extracted ${tableData.length} rows from HTML table`);
    return tableData;
  }

  async getRowIndexBySolution(solutionName) {
    const rows = await this.tableRows.all().catch(() => []);
    
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