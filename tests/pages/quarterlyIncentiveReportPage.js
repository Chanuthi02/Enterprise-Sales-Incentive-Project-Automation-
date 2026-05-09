// tests/pages/quarterlyIncentiveReportPage.js
class QuarterlyIncentiveReportPage {
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
    this.quarterDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').nth(1);
    this.viewSolutionButton = page.locator('button:has-text("View Solution"), button:has-text("View"), button:has-text("Submit")');
    
    // ========== TABLE SECTION ==========
    this.resultsTable = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.tableData = page.locator('table tbody td');
    
    // ========== DETAILED CALCULATION SECTION ==========
    this.detailedCalculationButton = page.locator('button:has-text("Explain"), button:has-text("Detailed Calculation"), button:has-text("Details"), button:has-text("Calculate")');
    
    // ========== SAVE TEAM AND AMOUNTS SECTION ==========
    this.saveTeamSection = page.locator('div:has-text("Save team"), div:has-text("Save Team"), .save-team, .team-section');
    this.saveTeamButton = page.locator('button:has-text("SAVE TEAM & AMOUNTS"), button:has-text("Save"), button:has-text("Save Team"), button:has-text("Update")');
    this.teamInputFields = page.locator('input[type="text"], input[type="number"]');
    this.amountFields = page.locator('input[type="number"]');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results|no incentives/i');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    
    // ========== QUARTERLY SPECIFIC ==========
    this.quarterlyIncentiveValues = page.locator('td:nth-last-child(1), .incentive-amount');
    this.teamNames = page.locator('td:nth-child(1), .team-name');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Quarterly Incentive Report page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/quarterly-incentive-report', {
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
      
      // Close any open menus/backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn('Page load state timeout, continuing...');
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

  async isViewSolutionButtonEnabled() {
    try {
      const button = this.viewSolutionButton;
      const isDisabled = await button.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('Mui-disabled'));
      return !isDisabled;
    } catch {
      return false;
    }
  }

  async waitForViewSolutionButtonEnabled() {
    try {
      await this.page.waitForFunction(() => {
        const buttons = document.querySelectorAll('button');
        const viewSolButton = Array.from(buttons).find(b => b.textContent.includes('View Solution'));
        return viewSolButton && !viewSolButton.hasAttribute('disabled') && !viewSolButton.classList.contains('Mui-disabled');
      }, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSaveTeamSectionVisible() {
    return await this.saveTeamSection.isVisible();
  }

  async getSaveTeamButtonText() {
    return await this.saveTeamButton.first().textContent();
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

  async scrollToSaveTeamSection() {
    try {
      const section = await this.saveTeamSection;
      await section.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      return true;
    } catch {
      return false;
    }
  }

  // ========== DROPDOWN OPERATIONS ==========
  
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

  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    try {
      // Close any open backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
      // Wait for backdrop to be gone
      await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout: 2000 }).catch(() => {});
      
      // Click year dropdown with forced click to bypass backdrop
      await this.yearDropdown.first().click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(1000);
      
      // Wait for menu to appear
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
      // Attempt recovery
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  async selectQuarter(quarter) {
    console.log(`Selecting quarter: ${quarter}`);
    try {
      // Close any open backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
      // Wait for backdrop to be gone
      await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout: 2000 }).catch(() => {});
      
      // Click quarter dropdown with forced click
      await this.quarterDropdown.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(1000);
      
      // Wait for menu to appear
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
      // Attempt recovery
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  async getYearDropdownOptions() {
    try {
      // Close any open backdrops first
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
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
      // Close any open backdrops first
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
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

  // ========== BUTTON OPERATIONS ==========
  
  async clickViewSolution() {
    console.log('Clicking View Solution button...');
    try {
      // Close any open backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
      // Wait for button to potentially be enabled
      let isEnabled = false;
      try {
        isEnabled = await this.page.waitForFunction(() => {
          const buttons = document.querySelectorAll('button');
          const viewSolButton = Array.from(buttons).find(b => b.textContent.includes('View Solution'));
          return viewSolButton && !viewSolButton.hasAttribute('disabled') && !viewSolButton.classList.contains('Mui-disabled');
        }, { timeout: 5000 });
      } catch {
        console.warn('View Solution button did not become enabled within timeout');
      }
      
      // Click button with force to bypass any overlays
      await this.viewSolutionButton.click({ force: true, timeout: 10000 });
      await this.page.waitForTimeout(2000);
      await this.waitForNoLoadingSpinner();
    } catch (error) {
      console.warn(`Error clicking View Solution: ${error.message}`);
      throw error;
    }
  }

  async clickDetailedCalculation(rowIndex = 0) {
    console.log(`Clicking Detailed Calculation button for row ${rowIndex}...`);
    const buttons = await this.detailedCalculationButton.all();
    if (buttons.length > rowIndex) {
      await buttons[rowIndex].click();
      await this.page.waitForTimeout(2000);
    }
  }

  async clickSaveTeam() {
    console.log('Clicking Save Team button...');
    await this.saveTeamButton.first().click();
    await this.page.waitForTimeout(2000);
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
    const rows = await this.tableRows.all();
    const data = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      data.push(cells);
    }
    return data;
  }

  async getTableDataAsObjects() {
    const headers = await this.getTableHeaders();
    const allData = await this.getAllTableData();
    return allData.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = row[index]?.trim() || '';
      });
      return obj;
    });
  }

  // ========== TEAM AND AMOUNTS SECTION ==========
  
  async getTeamInputFields() {
    return await this.teamInputFields.allTextContents();
  }

  async getAmountFieldValues() {
    const fields = await this.amountFields.all();
    const values = [];
    for (const field of fields) {
      values.push(await field.inputValue());
    }
    return values;
  }

  async setAmountField(fieldIndex, value) {
    const fields = await this.amountFields.all();
    if (fields.length > fieldIndex) {
      await fields[fieldIndex].clear();
      await fields[fieldIndex].fill(value.toString());
    }
  }

  async getDetailedCalculationPageTitle() {
    return await this.page.title();
  }

  async isDetailedCalculationPageLoaded() {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // ========== UTILITY FUNCTIONS ==========
  
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

  async getErrorMessage() {
    try {
      return await this.errorMessage.first().textContent();
    } catch {
      return null;
    }
  }

  async isTableVisible() {
    try {
      return await this.resultsTable.isVisible();
    } catch {
      return false;
    }
  }
}

module.exports = { QuarterlyIncentiveReportPage };
