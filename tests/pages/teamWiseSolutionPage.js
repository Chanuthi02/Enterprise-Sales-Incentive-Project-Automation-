// tests/pages/teamWiseSolutionPage.js
class TeamWiseSolutionPage {
  constructor(page) {
    this.page = page;
    
    // ========== FILTER SECTION ==========
    // Year and Quarter dropdowns (similar to solution-registry)
    this.yearDropdown = page.getByRole('combobox').first();
    this.quarterDropdown = page.getByRole('combobox').nth(1);
    this.viewSolutionButton = page.getByRole('button', { name: /View Solution|View/i });
    
    // ========== FIRST TABLE (Solutions List) ==========
    this.solutionsTable = page.locator('table').first();
    this.tableRows = page.locator('table tbody tr');
    this.tableHeaders = page.locator('table thead th');
    
    // Show buttons in the first table
    this.showButtons = page.locator('button:has-text("Show"), button:has-text("VIEW"), button:has-text("Details")');
    
    // ========== SECOND TABLE (Details after clicking Show) ==========
    this.detailsTable = page.locator('table').nth(1);
    this.detailsTableRows = page.locator('table').nth(1).locator('tbody tr');
    this.detailsTableHeaders = page.locator('table').nth(1).locator('thead th');
    
    // ========== MODAL / DIALOG (if details open in modal) ==========
    this.detailsDialog = page.getByRole('dialog');
    this.closeDialogButton = page.locator('button:has-text("Close"), button:has-text("X"), [aria-label="Close"]');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results/i');
    
    // ========== BACK/REFRESH BUTTONS ==========
    this.backButton = page.locator('button:has-text("Back"), button:has-text("←")');
    this.refreshButton = page.locator('button:has-text("Refresh"), button:has-text("⟳")');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Team Wise Solution page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/team-wise-solution', {
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

  // ========== FILTER METHODS ==========
  
  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    await this.yearDropdown.click();
    await this.page.getByRole('option', { name: year.toString() }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ Selected year: ${year}`);
  }

  async selectQuarter(quarter) {
    console.log(`Selecting quarter: ${quarter}`);
    await this.quarterDropdown.click();
    await this.page.getByRole('option', { name: quarter }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ Selected quarter: ${quarter}`);
  }

  async selectYearAndQuarter(year, quarter) {
    await this.selectYear(year);
    await this.selectQuarter(quarter);
  }

  async clickViewSolution() {
    console.log('Clicking View Solution button...');
    await this.viewSolutionButton.click();
    await this.waitForLoadingToComplete();
    console.log('✅ View Solution clicked');
  }

  // ========== AVAILABLE OPTIONS METHODS ==========
  
  async getAvailableYears() {
    await this.yearDropdown.click();
    const yearOptions = await this.page.getByRole('option').all();
    const years = [];
    
    for (const option of yearOptions) {
      const text = await option.textContent();
      if (text && text.match(/^\d{4}$/)) {
        years.push(text);
      }
    }
    
    await this.page.locator('body').click();
    await this.page.waitForTimeout(300);
    console.log(`Available years: ${years.join(', ')}`);
    return years;
  }

  async getAvailableQuarters() {
    await this.quarterDropdown.click();
    const quarterOptions = await this.page.getByRole('option').all();
    const quarters = [];
    
    for (const option of quarterOptions) {
      const text = await option.textContent();
      if (text && text.match(/^Q[1-4]$/)) {
        quarters.push(text);
      }
    }
    
    await this.page.locator('body').click();
    await this.page.waitForTimeout(300);
    console.log(`Available quarters: ${quarters.join(', ')}`);
    return quarters;
  }

  // ========== FIRST TABLE METHODS ==========
  
  async isSolutionsTableVisible() {
    return await this.solutionsTable.isVisible().catch(() => false);
  }

  async getSolutionsRowCount() {
    return await this.tableRows.count();
  }

  async getSolutionsTableHeaders() {
    const headers = await this.tableHeaders.all();
    const headerTexts = [];
    for (const header of headers) {
      headerTexts.push((await header.textContent()).trim());
    }
    return headerTexts;
  }

  async getSolutionsTableData() {
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

  // Get solution by name or ID
  async getSolutionRowByText(searchText) {
    const rows = await this.tableRows.all();
    
    for (let i = 0; i < rows.length; i++) {
      const rowText = await rows[i].textContent();
      if (rowText && rowText.includes(searchText)) {
        return {
          index: i,
          row: rows[i],
          cells: await rows[i].locator('td').all()
        };
      }
    }
    return null;
  }

  // ========== SHOW BUTTON METHODS ==========
  
  async clickShowButton(rowIndex = 0) {
    console.log(`Clicking Show button for row ${rowIndex}...`);
    const showButtons = await this.showButtons.all();
    if (showButtons.length > rowIndex) {
      await showButtons[rowIndex].click();
      await this.waitForLoadingToComplete();
      console.log('✅ Show button clicked');
      return true;
    }
    console.log('❌ Show button not found');
    return false;
  }

  async clickShowButtonForSolution(solutionName) {
    const row = await this.getSolutionRowByText(solutionName);
    if (row) {
      const showButton = row.row.locator('button:has-text("Show"), button:has-text("VIEW")');
      if (await showButton.count() > 0) {
        await showButton.click();
        await this.waitForLoadingToComplete();
        console.log(`✅ Clicked Show for ${solutionName}`);
        return true;
      }
    }
    console.log(`❌ Show button not found for ${solutionName}`);
    return false;
  }

  // ========== SECOND TABLE (DETAILS) METHODS ==========
  
  async isDetailsTableVisible() {
    // Check if details table exists and is visible
    const detailsTable = this.page.locator('table').nth(1);
    return await detailsTable.isVisible().catch(() => false);
  }

  async getDetailsRowCount() {
    if (!await this.isDetailsTableVisible()) return 0;
    return await this.detailsTableRows.count();
  }

  async getDetailsTableHeaders() {
    if (!await this.isDetailsTableVisible()) return [];
    const headers = await this.detailsTableHeaders.all();
    const headerTexts = [];
    for (const header of headers) {
      headerTexts.push((await header.textContent()).trim());
    }
    return headerTexts;
  }

  async getDetailsTableData() {
    if (!await this.isDetailsTableVisible()) return [];
    
    const rows = await this.detailsTableRows.all();
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

  // Check if details opened in modal
  async isDetailsInModal() {
    return await this.detailsDialog.isVisible().catch(() => false);
  }

  async closeDetailsModal() {
    if (await this.isDetailsInModal()) {
      await this.closeDialogButton.click();
      await this.page.waitForTimeout(500);
      console.log('✅ Details modal closed');
    }
  }

  // ========== COMPLETE FLOW METHODS ==========
  
  async searchAndViewDetails(year, quarter, solutionName) {
    console.log(`\n🔄 Searching for ${solutionName} in ${year} ${quarter}`);
    
    // Select filters
    await this.selectYearAndQuarter(year, quarter);
    
    // Click View Solution
    await this.clickViewSolution();
    
    // Verify table loaded
    const tableVisible = await this.isSolutionsTableVisible();
    if (!tableVisible) {
      throw new Error('Solutions table did not load');
    }
    
    // Click Show for specific solution
    const showClicked = await this.clickShowButtonForSolution(solutionName);
    if (!showClicked) {
      throw new Error(`Could not find Show button for ${solutionName}`);
    }
    
    console.log(`✅ Successfully viewed details for ${solutionName}`);
  }

  async getFirstSolutionDetails(year, quarter) {
    console.log(`\n🔄 Getting first solution details for ${year} ${quarter}`);
    
    await this.selectYearAndQuarter(year, quarter);
    await this.clickViewSolution();
    
    const rowCount = await this.getSolutionsRowCount();
    if (rowCount === 0) {
      console.log('No solutions found');
      return null;
    }
    
    await this.clickShowButton(0);
    
    const detailsData = await this.getDetailsTableData();
    console.log(`Found ${detailsData.length} detail rows`);
    
    return detailsData;
  }

  // ========== VERIFICATION METHODS ==========
  
  async isNoDataMessageVisible() {
    return await this.noDataMessage.isVisible().catch(() => false);
  }

  async getErrorMessage() {
    const errorMessage = this.page.locator('.error-message, .alert-danger');
    if (await errorMessage.isVisible().catch(() => false)) {
      return await errorMessage.textContent();
    }
    return null;
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/teamwise_${name}_${Date.now()}.png`,
      fullPage: true 
    });
  }

  // ========== HELPER METHODS ==========
  
  async getSelectedYear() {
    const text = await this.yearDropdown.textContent();
    const yearMatch = text.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : null;
  }

  async getSelectedQuarter() {
    const text = await this.quarterDropdown.textContent();
    const quarterMatch = text.match(/Q[1-4]/);
    return quarterMatch ? quarterMatch[0] : null;
  }
}

module.exports = { TeamWiseSolutionPage };