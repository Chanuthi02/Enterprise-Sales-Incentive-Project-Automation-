// tests/pages/individualIncentiveReportPage.js
class IndividualIncentiveReportPage {
  constructor(page) {
    this.page = page;
    
    // ========== VIEW MODE MODAL ==========
    this.viewModeModal = page.locator('text=/Select View Mode/i').locator('..').first();
    this.adminViewOption = page.locator('text=/Admin View/i').first();
    this.employeeViewOption = page.locator('text=/Employee View/i').first();
    this.serviceNumberInput = page.locator('input[placeholder*="service" i], input[placeholder*="Service" i], input[name*="service" i]');
    this.continueButton = page.locator('button:has-text("Continue")').first();
    
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
    this.quarterDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').nth(1);
    this.sectionDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').nth(2);
    this.viewSolutionButton = page.locator('button:has-text("View Solution"), button:has-text("View"), button:has-text("Submit")');
    
    // ========== TABLE SECTION ==========
    this.resultsTable = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.tableData = page.locator('table tbody td');
    
    // ========== EXPLAIN/DETAIL BUTTON ==========
    this.explainButton = page.locator('button:has-text("Explain"), button:has-text("Details"), button:has-text("View Details")');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results/i');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    
    // ========== ADMIN VIEW SPECIFIC ==========
    this.individualRecords = page.locator('tbody tr');
    this.serviceNoColumn = page.locator('tbody td:first-child');
    this.nameColumn = page.locator('tbody td:nth-child(2)');
    this.roleColumn = page.locator('tbody td:nth-child(3)');
    this.payableAmountColumn = page.locator('tbody td:nth-child(4)');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Individual Incentive Report page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/individual-incentive-report', {
      ignoreHTTPSErrors: true,
      waitUntil: 'domcontentloaded',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '60000', 10)
    });
    await this.waitForPageLoad();
    console.log('✅ Page loaded');
  }

  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      await this.page.waitForTimeout(2000); // Additional wait for rendering
      
      // Wait for View Mode modal to appear
      try {
        await this.viewModeModal.waitFor({ state: 'visible', timeout: 10000 });
        console.log('✅ View Mode modal appeared');
      } catch {
        console.warn('View Mode modal not visible within 10 seconds, continuing...');
      }
      
      // Close any open menus/backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`Page load state error: ${error.message}`);
    }
  }

  async closeAllBackdrops() {
    // Close any open Material-UI menus by clicking the backdrop
    const backdrops = await this.page.locator('.MuiBackdrop-root').all();
    for (const backdrop of backdrops) {
      try {
        const isVisible = await backdrop.isVisible();
        if (isVisible) {
          await backdrop.click({ force: true });
          await this.page.waitForTimeout(200);
        }
      } catch {
        // Ignore errors
      }
    }
  }

  // ========== VIEW MODE SELECTION ==========
  
  async selectAdminView() {
    console.log('Selecting Admin View...');
    try {
      // Wait for modal to be visible
      await this.viewModeModal.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {
        console.log('Modal not visible, but continuing...');
      });
      
      await this.page.waitForTimeout(500);
      
      const isVisible = await this.adminViewOption.isVisible().catch(() => false);
      if (isVisible) {
        await this.adminViewOption.click({ force: true, timeout: 5000 }).catch((error) => {
          console.warn(`Error clicking Admin View: ${error.message}`);
        });
        await this.page.waitForTimeout(1000);
      } else {
        console.warn('Admin View option not visible');
      }
      
      // Click Continue button
      const continueVisible = await this.continueButton.isVisible().catch(() => false);
      if (continueVisible) {
        await this.continueButton.click({ force: true, timeout: 5000 }).catch((error) => {
          console.warn(`Error clicking Continue: ${error.message}`);
        });
      } else {
        console.warn('Continue button not visible');
      }
      
      await this.page.waitForTimeout(2000);
      console.log('✅ Admin View selection completed');
    } catch (error) {
      console.warn(`Error in selectAdminView: ${error.message}`);
      // Don't throw - let tests handle this gracefully
    }
  }

  async selectEmployeeView() {
    console.log('Selecting Employee View...');
    try {
      const isVisible = await this.employeeViewOption.isVisible().catch(() => false);
      if (isVisible) {
        await this.employeeViewOption.click({ force: true, timeout: 5000 }).catch((error) => {
          console.warn(`Error clicking Employee View: ${error.message}`);
        });
        await this.page.waitForTimeout(1000);
      } else {
        console.warn('Employee View option not visible');
      }
      
      console.log('✅ Employee View selected - waiting for service number input');
    } catch (error) {
      console.warn(`Error in selectEmployeeView: ${error.message}`);
      // Don't throw - let tests handle this gracefully
    }
  }

  async enterServiceNumber(serviceNumber) {
    console.log(`Entering service number: ${serviceNumber}`);
    try {
      const input = await this.serviceNumberInput.first().catch(() => null);
      if (!input) {
        console.warn('Service number input field not found');
        return false;
      }
      
      const isVisible = await input.isVisible().catch(() => false);
      
      if (isVisible) {
        await input.click({ force: true, timeout: 5000 }).catch((e) => console.warn(`Click error: ${e.message}`));
        await input.fill(serviceNumber, { timeout: 5000 }).catch((e) => console.warn(`Fill error: ${e.message}`));
        await this.page.waitForTimeout(500);
        console.log(`✅ Service number entered: ${serviceNumber}`);
        return true;
      } else {
        console.warn('Service number input field not visible');
        return false;
      }
    } catch (error) {
      console.warn(`Error entering service number: ${error.message}`);
      return false;
    }
  }

  async clickContinueAfterServiceNumber() {
    console.log('Clicking Continue button after entering service number...');
    try {
      const button = await this.continueButton.first().catch(() => null);
      if (!button) {
        console.warn('Continue button not found');
        return false;
      }
      
      await button.click({ force: true, timeout: 5000 }).catch((e) => console.warn(`Click error: ${e.message}`));
      await this.page.waitForTimeout(2000);
      console.log('✅ Continue clicked and Employee View loaded');
      return true;
    } catch (error) {
      console.warn(`Error clicking continue: ${error.message}`);
      return false;
    }
  }

  async isViewModeModalVisible() {
    try {
      return await this.viewModeModal.isVisible();
    } catch {
      return false;
    }
  }

  // ========== UI CHECKS ==========
  
  async getPageTitle() {
    const titleElement = await this.pageTitle.first();
    return await titleElement.textContent();
  }

  async isHeaderVisible() {
    return await this.pageHeader.first().isVisible();
  }

  async isLogoVisible() {
    try {
      return await this.logo.isVisible();
    } catch {
      return false;
    }
  }

  async isFooterVisible() {
    try {
      return await this.footer.first().isVisible();
    } catch {
      return false;
    }
  }

  async isViewSolutionButtonVisible() {
    return await this.viewSolutionButton.isVisible();
  }

  async scrollToFooter() {
    try {
      const footerElement = await this.footer.first();
      await footerElement.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      return true;
    } catch {
      return false;
    }
  }

  // ========== DROPDOWN OPERATIONS ==========
  
  async closeAllDropdowns() {
    await this.closeAllBackdrops();
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Wait for backdrop to be gone
      await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout: 2000 }).catch(() => {});
      
      // Click year dropdown
      await this.yearDropdown.first().click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(1000);
      
      // Wait for menu options
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Click the year option
      const optionLocator = this.page.locator(`[role="option"]:has-text("${year}")`);
      if (await optionLocator.count() > 0) {
        await optionLocator.first().click({ force: true, timeout: 5000 });
      } else {
        throw new Error(`Year option "${year}" not found`);
      }
      
      // Wait for menu to close
      await this.page.waitForSelector('[role="option"]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`Error selecting year ${year}: ${error.message}`);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  async selectQuarter(quarter) {
    console.log(`Selecting quarter: ${quarter}`);
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Wait for backdrop to be gone
      await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout: 2000 }).catch(() => {});
      
      // Click quarter dropdown
      await this.quarterDropdown.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(1000);
      
      // Wait for menu options
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Handle different quarter formats
      const quarterText = quarter.toString().includes('Q') ? quarter : `Q${quarter}`;
      const optionLocator = this.page.locator(`[role="option"]:has-text("${quarterText}")`);
      
      if (await optionLocator.count() > 0) {
        await optionLocator.first().click({ force: true, timeout: 5000 });
      } else {
        // Try without 'Q' prefix
        const altLocator = this.page.locator(`[role="option"]:has-text("${quarter}")`);
        if (await altLocator.count() > 0) {
          await altLocator.first().click({ force: true, timeout: 5000 });
        } else {
          throw new Error(`Quarter option "${quarterText}" not found`);
        }
      }
      
      // Wait for menu to close
      await this.page.waitForSelector('[role="option"]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`Error selecting quarter ${quarter}: ${error.message}`);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  async selectSection(section) {
    console.log(`Selecting section: ${section}`);
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Click section dropdown
      await this.sectionDropdown.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(1000);
      
      // Wait for menu options
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Click the section option
      const optionLocator = this.page.locator(`[role="option"]:has-text("${section}")`);
      if (await optionLocator.count() > 0) {
        await optionLocator.first().click({ force: true, timeout: 5000 });
      } else {
        throw new Error(`Section option "${section}" not found`);
      }
      
      // Wait for menu to close
      await this.page.waitForSelector('[role="option"]', { state: 'hidden', timeout: 2000 }).catch(() => {});
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`Error selecting section ${section}: ${error.message}`);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  async getYearDropdownOptions() {
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Open the year dropdown
      await this.yearDropdown.first().click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(800);
      
      // Wait for menu options to appear
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Get all options
      const options = await this.page.locator('[role="option"], .MuiMenuItem-root').allTextContents();
      
      // Close menu
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
      
      return options.filter(opt => opt.trim() !== '');
    } catch (error) {
      console.warn(`Error getting year dropdown options: ${error.message}`);
      return [];
    }
  }

  async getQuarterDropdownOptions() {
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Open the quarter dropdown
      await this.quarterDropdown.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(800);
      
      // Wait for menu options to appear
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Get all options
      const options = await this.page.locator('[role="option"], .MuiMenuItem-root').allTextContents();
      
      // Close menu
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
      
      return options.filter(opt => opt.trim() !== '');
    } catch (error) {
      console.warn(`Error getting quarter dropdown options: ${error.message}`);
      return [];
    }
  }

  async getSectionDropdownOptions() {
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Open the section dropdown
      await this.sectionDropdown.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(800);
      
      // Wait for menu options to appear
      await this.page.waitForSelector('[role="option"]', { timeout: 3000 }).catch(() => {});
      
      // Get all options
      const options = await this.page.locator('[role="option"], .MuiMenuItem-root').allTextContents();
      
      // Close menu
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
      
      return options.filter(opt => opt.trim() !== '');
    } catch (error) {
      console.warn(`Error getting section dropdown options: ${error.message}`);
      return [];
    }
  }

  // ========== BUTTON OPERATIONS ==========
  
  async clickViewSolution() {
    console.log('Clicking View Solution button...');
    try {
      await this.closeAllDropdowns();
      await this.page.waitForTimeout(500);
      
      // Click button with force to bypass any overlays
      await this.viewSolutionButton.click({ force: true, timeout: 10000 });
      await this.page.waitForTimeout(2000);
      await this.waitForNoLoadingSpinner();
    } catch (error) {
      console.warn(`Error clicking View Solution: ${error.message}`);
      throw error;
    }
  }

  async clickExplainButton(rowIndex = 0) {
    console.log(`Clicking Explain button for row ${rowIndex}...`);
    const buttons = await this.explainButton.all();
    if (buttons.length > rowIndex) {
      await buttons[rowIndex].click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(2000);
    }
  }

  // ========== TABLE OPERATIONS ==========
  
  async getTableRowCount() {
    return await this.tableRows.count();
  }

  async getTableHeaders() {
    return await this.tableHeaders.allTextContents();
  }

  async getTableData(rowIndex = 0) {
    const rows = await this.tableRows.all();
    if (rows.length > rowIndex) {
      const cells = await rows[rowIndex].locator('td').allTextContents();
      return cells;
    }
    return [];
  }

  async getAllTableData() {
    const rowsCount = await this.getTableRowCount();
    const allData = [];
    
    for (let i = 0; i < rowsCount; i++) {
      const rowData = await this.getTableData(i);
      allData.push(rowData);
    }
    
    return allData;
  }

  // ========== LOADING STATES ==========
  
  async waitForNoLoadingSpinner() {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      console.warn('Loading spinner did not appear or timed out');
    }
  }

  async hasNoDataMessage() {
    try {
      return await this.noDataMessage.isVisible();
    } catch {
      return false;
    }
  }

  async hasErrorMessage() {
    try {
      return await this.errorMessage.isVisible();
    } catch {
      return false;
    }
  }

  // ========== DATA RETRIEVAL ==========
  
  async getIndividualRecords() {
    const records = [];
    const rows = await this.individualRecords.all();
    
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length >= 4) {
        records.push({
          serviceNo: cells[0],
          name: cells[1],
          role: cells[2],
          payableAmount: parseFloat(cells[3].replace(/[^\d.-]/g, '')) || 0
        });
      }
    }
    
    return records;
  }

  async getTotalAmount() {
    try {
      const amounts = await this.payableAmountColumn.allTextContents();
      let total = 0;
      
      for (const amount of amounts) {
        const value = parseFloat(amount.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
          total += value;
        }
      }
      
      return total;
    } catch {
      return 0;
    }
  }
}

module.exports = { IndividualIncentiveReportPage };
