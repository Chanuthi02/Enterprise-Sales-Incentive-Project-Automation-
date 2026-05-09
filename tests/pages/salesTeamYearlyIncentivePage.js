// tests/pages/salesTeamYearlyIncentivePage.js
class SalesTeamYearlyIncentivePage {
  constructor(page) {
    this.page = page;
    
    // ========== PAGE ELEMENTS ==========
    // Header elements
    this.pageHeader = page.locator('header, .header, .MuiAppBar-root, .navbar');
    this.pageTitle = page.locator('h1, h2, .page-title, .title');
    this.logo = page.locator('img[alt*="logo"], .logo, header img').first();
    
    // Footer elements
    this.footer = page.locator('footer, .footer, .MuiFooter-root');
    this.footerLogo = page.locator('footer img, .footer img, .logo-footer');
    this.copyrightText = page.locator('footer p, .copyright, .footer-text');
    
    // ========== FILTER SECTION ==========
    this.yearDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').first();
    this.viewSalesButton = page.locator('button:has-text("View Sales"), button:has-text("View"), button:has-text("Submit")');
    
    // ========== TABLE SECTION ==========
    this.resultsTable = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.tableData = page.locator('table tbody td');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results|no incentives/i');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    
    // ========== INCENTIVE SPECIFIC ==========
    this.totalIncentiveRow = page.locator('tfoot tr, .total-row, tr:has-text("Total")');
    this.incentiveValues = page.locator('td:nth-last-child(1), .incentive-amount');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Sales Team Yearly Incentive page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/sales-team-yearly-incentive', {
      ignoreHTTPSErrors: true, // Important for self-signed certificates
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
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(500);
  }

  // ========== DROPDOWN METHODS ==========
  
  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    await this.yearDropdown.click();
    await this.page.getByRole('option', { name: year.toString() }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ Selected year: ${year}`);
  }

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

  async getSelectedYear() {
    const text = await this.yearDropdown.textContent();
    const yearMatch = text.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : null;
  }

  // ========== VIEW SALES BUTTON ==========
  
  async clickViewSales() {
    console.log('Clicking View Sales button...');
    await this.viewSalesButton.click();
    await this.waitForLoadingToComplete();
    console.log('✅ View Sales clicked');
  }

  // ========== TABLE METHODS ==========
  
  async isTableVisible() {
    return await this.resultsTable.isVisible().catch(() => false);
  }

  async getTableHeaders() {
    const headers = await this.tableHeaders.all();
    const headerTexts = [];
    for (const header of headers) {
      headerTexts.push((await header.textContent()).trim());
    }
    return headerTexts;
  }

  async getRowCount() {
    return await this.tableRows.count();
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

  // Get incentive value for a specific salesperson
  async getIncentiveForSalesperson(salespersonName) {
    const rows = await this.tableRows.all();
    
    for (const row of rows) {
      const firstCell = await row.locator('td').first().textContent();
      if (firstCell && firstCell.includes(salespersonName)) {
        const lastCell = await row.locator('td').last().textContent();
        return lastCell;
      }
    }
    return null;
  }

  // Get all incentive values as numbers
  async getAllIncentiveValues() {
    const values = await this.incentiveValues.allTextContents();
    return values.map(v => parseFloat(v.replace(/[$,]/g, ''))).filter(v => !isNaN(v));
  }

  async getTotalIncentive() {
    if (await this.totalIncentiveRow.isVisible().catch(() => false)) {
      const totalText = await this.totalIncentiveRow.locator('td').last().textContent();
      return parseFloat(totalText.replace(/[$,]/g, ''));
    }
    
    // Calculate sum if no total row
    const values = await this.getAllIncentiveValues();
    return values.reduce((sum, val) => sum + val, 0);
  }

  // ========== UI/LAYOUT VERIFICATION METHODS ==========
  
  async isHeaderVisible() {
    return await this.pageHeader.isVisible().catch(() => false);
  }

  async isLogoVisible() {
    return await this.logo.isVisible().catch(() => false);
  }

  async isFooterVisible() {
    return await this.footer.isVisible().catch(() => false);
  }

  async isFooterLogoVisible() {
    return await this.footerLogo.isVisible().catch(() => false);
  }

  async getFooterText() {
    if (await this.copyrightText.isVisible().catch(() => false)) {
      return await this.copyrightText.textContent();
    }
    return null;
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getHeaderText() {
    if (await this.pageHeader.isVisible().catch(() => false)) {
      return await this.pageHeader.textContent();
    }
    return null;
  }

  // Check if table has proper structure (no merged cells issues)
  async validateTableStructure() {
    const rowCount = await this.getRowCount();
    if (rowCount === 0) return true;
    
    const firstRowCells = await this.tableRows.first().locator('td').count();
    
    for (let i = 1; i < Math.min(rowCount, 5); i++) {
      const cellCount = await this.tableRows.nth(i).locator('td').count();
      if (cellCount !== firstRowCells) {
        console.log(`Row ${i} has ${cellCount} cells, expected ${firstRowCells}`);
        return false;
      }
    }
    return true;
  }

  // Check if incentive values are properly formatted
  async validateIncentiveFormatting() {
    const values = await this.incentiveValues.allTextContents();
    
    for (const value of values) {
      const trimmed = value.trim();
      // Check if it matches currency format ($1,234.56 or 1,234.56 or 1234.56)
      const isValidFormat = /^[$]?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(trimmed) || /^\d+(\.\d{2})?$/.test(trimmed);
      if (!isValidFormat && trimmed !== '' && !trimmed.includes('No data')) {
        console.log(`Invalid format: ${trimmed}`);
        return false;
      }
    }
    return true;
  }

  // ========== VERIFICATION METHODS ==========
  
  async isNoDataMessageVisible() {
    return await this.noDataMessage.isVisible().catch(() => false);
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

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/sales_incentive_${name}_${Date.now()}.png`,
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: sales_incentive_${name}`);
  }
}

module.exports = { SalesTeamYearlyIncentivePage };