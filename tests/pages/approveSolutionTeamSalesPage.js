// tests/pages/approveSolutionTeamSalesPage.js
class ApproveSolutionTeamSalesPage {
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
    
    // ========== ROLE SELECTION MODAL ==========
    this.roleSelectionModal = page.locator('dialog, .modal, .MuiDialog-root, [role="dialog"]');
    this.roleButtons = page.locator('button:has-text("View"), button:has-text("L1"), button:has-text("L2"), button:has-text("L3")');
    this.l1ViewButton = page.locator('button:has-text("L1 View")');
    this.l2ViewButton = page.locator('button:has-text("L2 View")');
    this.l3ViewButton = page.locator('button:has-text("L3 View")');
    
    // ========== FILTER SECTION ==========
    this.filterSection = page.locator('div:has-text("Filter"), .filter-section, .filters');
    this.yearDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').first();
    this.quarterDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').nth(1);
    this.statusDropdown = page.locator('select, .MuiSelect-root, [role="combobox"]').nth(2);
    this.applyFiltersButton = page.locator('button:has-text("Apply Filters"), button:has-text("Apply"), button:has-text("Search")');
    this.viewSalesButton = page.locator('div:has-text("Filter By")').locator('button:has-text("View Sales"), button:has-text("Submit")').first();
    
    // ========== TABLE SECTION ==========
    this.resultsTable = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.tableData = page.locator('table tbody td');
    
    // ========== TABLE ACTION BUTTONS ==========
    this.viewSalesTableButtons = page.locator('button:has-text("View Sales"), td button:has-text("View Sales")');
    this.showDetailsButtons = page.locator('button:has-text("Show"), button:has-text("Details"), button:has-text("Eye"), svg[role="button"]');
    this.eyeIcons = page.locator('svg[role="button"], .show-icon, .details-icon, .view-icon');
    
    // ========== SOLUTION DATA IN TABLE ==========
    this.solutionIdColumn = page.locator('table tbody td:nth-child(1)');
    this.solutionEngColumn = page.locator('table tbody td:nth-child(2)');
    this.siEngColumn = page.locator('table tbody td:nth-child(3)');
    this.solutionCategoryColumn = page.locator('table tbody td:nth-child(4)');
    this.l1StatusColumn = page.locator('table tbody td:nth-child(5)');
    this.l2StatusColumn = page.locator('table tbody td:nth-child(6)');
    
    // ========== DETAIL VIEW MODAL ==========
    this.detailModal = page.locator('dialog, .modal, .details-modal, .MuiDialog-root');
    this.detailModalTitle = page.locator('dialog h2, .modal-title, .details-title');
    this.detailsContent = page.locator('.modal-content, .details-content, dialog [role="dialog"]');
    this.closeDetailModalButton = page.locator('button[aria-label="close"], button:has-text("Close"), .close-button');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results|no solutions/i');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
  }

  // ========== NAVIGATION ==========
  
  async goto() {
    console.log('Navigating to Approve Solution Team Sales page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/view-confirm-solution-team-sales', {
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
      await this.page.waitForTimeout(2000);
      
      // Close any open menus/backdrops
      await this.closeAllBackdrops();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn('Page load state timeout, continuing...');
    }
  }

  async closeAllBackdrops() {
    try {
      const backdrops = await this.page.locator('.MuiBackdrop-root, .backdrop').all();
      if (backdrops.length > 0) {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
      }
    } catch (error) {
      console.warn('Error closing backdrops:', error.message);
    }
  }

  async waitForLoadingToComplete() {
    if (await this.loadingSpinner.isVisible().catch(() => false)) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(500);
  }

  // ========== ROLE SELECTION METHODS ==========
  
  async isRoleSelectionModalVisible() {
    return await this.roleSelectionModal.isVisible().catch(() => false);
  }

  async selectL1View() {
    console.log('Clicking L1 View button...');
    try {
      await this.l1ViewButton.click();
      await this.waitForLoadingToComplete();
      console.log('✅ L1 View selected');
      return true;
    } catch (error) {
      console.error('Error selecting L1 View:', error.message);
      return false;
    }
  }

  async selectL2View() {
    console.log('Clicking L2 View button...');
    try {
      await this.l2ViewButton.click();
      await this.waitForLoadingToComplete();
      console.log('✅ L2 View selected');
      return true;
    } catch (error) {
      console.error('Error selecting L2 View:', error.message);
      return false;
    }
  }

  async selectL3View() {
    console.log('Clicking L3 View button...');
    try {
      await this.l3ViewButton.click();
      await this.waitForLoadingToComplete();
      console.log('✅ L3 View selected');
      return true;
    } catch (error) {
      console.error('Error selecting L3 View:', error.message);
      return false;
    }
  }

  async getRoleButtonsCount() {
    return await this.roleButtons.count();
  }

  async getRoleButtonsText() {
    const buttons = await this.roleButtons.all();
    const texts = [];
    for (const button of buttons) {
      texts.push((await button.textContent()).trim());
    }
    return texts;
  }

  // ========== UI CHECKS ==========
  
  async getPageTitle() {
    try {
      const titleElement = await this.pageTitle.first();
      return await titleElement.textContent();
    } catch {
      return null;
    }
  }

  async isHeaderVisible() {
    return await this.pageHeader.first().isVisible().catch(() => false);
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
      await this.scrollToFooter();
      return await this.footer.first().isVisible();
    } catch {
      return false;
    }
  }

  async isFooterLogoVisible() {
    try {
      return await this.footerLogo.isVisible();
    } catch {
      return false;
    }
  }

  async getFooterText() {
    try {
      return await this.copyrightText.first().textContent();
    } catch {
      return null;
    }
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

  // ========== FILTER METHODS ==========
  
  async isFilterSectionVisible() {
    return await this.filterSection.isVisible().catch(() => false);
  }

  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    try {
      await this.yearDropdown.click();
      await this.page.getByRole('option', { name: year.toString() }).click();
      await this.page.waitForTimeout(500);
      console.log(`✅ Selected year: ${year}`);
      return true;
    } catch (error) {
      console.error('Error selecting year:', error.message);
      return false;
    }
  }

  async selectQuarter(quarter) {
    console.log(`Selecting quarter: ${quarter}`);
    try {
      await this.quarterDropdown.click();
      await this.page.getByRole('option', { name: quarter.toString() }).click();
      await this.page.waitForTimeout(500);
      console.log(`✅ Selected quarter: ${quarter}`);
      return true;
    } catch (error) {
      console.error('Error selecting quarter:', error.message);
      return false;
    }
  }

  async selectStatus(status) {
    console.log(`Selecting status: ${status}`);
    try {
      await this.statusDropdown.click();
      await this.page.getByRole('option', { name: status }).click();
      await this.page.waitForTimeout(500);
      console.log(`✅ Selected status: ${status}`);
      return true;
    } catch (error) {
      console.error('Error selecting status:', error.message);
      return false;
    }
  }

  async getYearDropdownOptions() {
    try {
      await this.yearDropdown.click();
      const options = await this.page.getByRole('option').all();
      const yearOptions = [];
      
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.trim()) {
          yearOptions.push(text.trim());
        }
      }
      
      await this.page.locator('body').click();
      await this.page.waitForTimeout(300);
      console.log(`Year options: ${yearOptions.join(', ')}`);
      return yearOptions;
    } catch (error) {
      console.error('Error getting year options:', error.message);
      return [];
    }
  }

  async getQuarterDropdownOptions() {
    try {
      await this.quarterDropdown.click();
      const options = await this.page.getByRole('option').all();
      const quarterOptions = [];
      
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.trim()) {
          quarterOptions.push(text.trim());
        }
      }
      
      await this.page.locator('body').click();
      await this.page.waitForTimeout(300);
      console.log(`Quarter options: ${quarterOptions.join(', ')}`);
      return quarterOptions;
    } catch (error) {
      console.error('Error getting quarter options:', error.message);
      return [];
    }
  }

  async getStatusDropdownOptions() {
    try {
      await this.statusDropdown.click();
      const options = await this.page.getByRole('option').all();
      const statusOptions = [];
      
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.trim()) {
          statusOptions.push(text.trim());
        }
      }
      
      await this.page.locator('body').click();
      await this.page.waitForTimeout(300);
      console.log(`Status options: ${statusOptions.join(', ')}`);
      return statusOptions;
    } catch (error) {
      console.error('Error getting status options:', error.message);
      return [];
    }
  }

  async clickApplyFilters() {
    console.log('Clicking Apply Filters button...');
    try {
      await this.applyFiltersButton.click();
      await this.waitForLoadingToComplete();
      console.log('✅ Apply Filters clicked');
      return true;
    } catch (error) {
      console.error('Error clicking Apply Filters:', error.message);
      return false;
    }
  }

  async clickViewSales() {
    console.log('Clicking View Sales button...');
    try {
      // Get the View Sales button from the filter section, not from table
      const filterArea = this.page.locator('div:has-text("Filter By"), .filter-section').first();
      const button = filterArea.locator('button:has-text("View Sales"), button:has-text("View"), button:has-text("Submit")').first();
      await button.click();
      await this.waitForLoadingToComplete();
      console.log('✅ View Sales clicked');
      return true;
    } catch (error) {
      console.error('Error clicking View Sales:', error.message);
      return false;
    }
  }

  // ========== TABLE METHODS ==========
  
  async isTableVisible() {
    return await this.resultsTable.isVisible().catch(() => false);
  }

  async getTableHeaders() {
    try {
      const headers = await this.tableHeaders.all();
      const headerTexts = [];
      for (const header of headers) {
        headerTexts.push((await header.textContent()).trim());
      }
      return headerTexts;
    } catch (error) {
      console.error('Error getting table headers:', error.message);
      return [];
    }
  }

  async getRowCount() {
    return await this.tableRows.count();
  }

  async getTableData() {
    try {
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
    } catch (error) {
      console.error('Error getting table data:', error.message);
      return [];
    }
  }

  async getTableRow(rowIndex) {
    try {
      const row = await this.tableRows.nth(rowIndex);
      const cells = await row.locator('td').all();
      const rowData = [];
      for (const cell of cells) {
        rowData.push((await cell.textContent()).trim());
      }
      return rowData;
    } catch (error) {
      console.error(`Error getting row ${rowIndex}:`, error.message);
      return [];
    }
  }

  // ========== SHOW/DETAILS BUTTON METHODS ==========
  
  async getShowDetailsButtonsCount() {
    return await this.showDetailsButtons.count();
  }

  async clickShowDetailsButton(rowIndex) {
    console.log(`Clicking Show Details button on row ${rowIndex}...`);
    try {
      const button = this.page.locator('table tbody tr').nth(rowIndex).locator('button:has-text("Show"), button:has-text("Details"), button:has-text("Eye"), svg[role="button"]').first();
      await button.click();
      await this.page.waitForTimeout(1000);
      console.log(`✅ Clicked Show Details on row ${rowIndex}`);
      return true;
    } catch (error) {
      console.error(`Error clicking Show Details on row ${rowIndex}:`, error.message);
      return false;
    }
  }

  async getEyeIconsCount() {
    return await this.eyeIcons.count();
  }

  async clickEyeIconByRowIndex(rowIndex) {
    console.log(`Clicking Eye icon on row ${rowIndex}...`);
    try {
      const row = this.page.locator('table tbody tr').nth(rowIndex);
      const eyeIcon = row.locator('svg[role="button"], .show-icon, .details-icon').first();
      await eyeIcon.click();
      await this.page.waitForTimeout(1000);
      console.log(`✅ Clicked Eye icon on row ${rowIndex}`);
      return true;
    } catch (error) {
      console.error(`Error clicking Eye icon on row ${rowIndex}:`, error.message);
      return false;
    }
  }

  // ========== DETAIL MODAL METHODS ==========
  
  async isDetailModalVisible() {
    return await this.detailModal.isVisible().catch(() => false);
  }

  async getDetailModalTitle() {
    try {
      return await this.detailModalTitle.textContent();
    } catch {
      return null;
    }
  }

  async getDetailModalContent() {
    try {
      return await this.detailsContent.textContent();
    } catch {
      return null;
    }
  }

  async closeDetailModal() {
    console.log('Closing detail modal...');
    try {
      const closeBtn = this.closeDetailModalButton;
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(500);
      console.log('✅ Detail modal closed');
      return true;
    } catch (error) {
      console.error('Error closing detail modal:', error.message);
      return false;
    }
  }

  // ========== ERROR/LOADING CHECKS ==========
  
  async hasErrorMessage() {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  async getErrorMessage() {
    try {
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async hasNoDataMessage() {
    return await this.noDataMessage.isVisible().catch(() => false);
  }

  async getNoDataMessage() {
    try {
      return await this.noDataMessage.textContent();
    } catch {
      return null;
    }
  }

  // ========== SCREENSHOT METHODS ==========
  
  async takeScreenshot(name) {
    try {
      await this.page.screenshot({ path: `./screenshots/${name}.png` });
      console.log(`✅ Screenshot saved: ${name}.png`);
    } catch (error) {
      console.warn(`⚠️  Screenshot failed: ${error.message}`);
    }
  }

  // ========== HELPER METHODS ==========
  
  async getSolutionDataByRowIndex(rowIndex) {
    try {
      const row = await this.tableRows.nth(rowIndex);
      const cells = await row.locator('td').all();
      
      return {
        solutionId: await cells[0].textContent(),
        solutionEng: await cells[1].textContent(),
        siEng: cells.length > 2 ? await cells[2].textContent() : null,
        solutionCategory: cells.length > 3 ? await cells[3].textContent() : null,
        l1Status: cells.length > 4 ? await cells[4].textContent() : null,
        l2Status: cells.length > 5 ? await cells[5].textContent() : null,
      };
    } catch (error) {
      console.error(`Error getting solution data for row ${rowIndex}:`, error.message);
      return null;
    }
  }

  async findRowBySolutionId(solutionId) {
    try {
      const rows = await this.tableRows.all();
      for (let i = 0; i < rows.length; i++) {
        const cellText = await rows[i].locator('td').first().textContent();
        if (cellText && cellText.includes(solutionId)) {
          return i;
        }
      }
      return -1;
    } catch (error) {
      console.error('Error finding row by solution ID:', error.message);
      return -1;
    }
  }

  async getAllSolutionIds() {
    try {
      const ids = [];
      const rows = await this.tableRows.all();
      for (const row of rows) {
        const cellText = await row.locator('td').first().textContent();
        if (cellText) {
          ids.push(cellText.trim());
        }
      }
      return ids;
    } catch (error) {
      console.error('Error getting all solution IDs:', error.message);
      return [];
    }
  }

  // ========== EDIT MODAL METHODS ==========
  
  async clickEditButton() {
    console.log('Clicking Edit button...');
    try {
      const editBtn = this.page.locator('button:has-text("Edit"), button:has-text("EDIT")').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Edit button clicked');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clicking Edit button:', error.message);
      return false;
    }
  }

  async isEditModalVisible() {
    try {
      // Look for edit modal - could be a dialog or modal container
      const editModal = this.page.locator('dialog, .modal, .MuiDialog-root, .edit-modal').first();
      return await editModal.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getEditFormFields() {
    try {
      // Get all input fields in the current modal/dialog
      const inputs = await this.page.locator('dialog input, .modal input, dialog textarea, .modal textarea, dialog select, .modal select').all();
      return inputs;
    } catch (error) {
      console.error('Error getting form fields:', error.message);
      return [];
    }
  }

  async getL1StatusDropdown() {
    try {
      // L1 Status is typically the first dropdown in edit modal
      const dropdowns = await this.page.locator('dialog select, .modal select, dialog [role="combobox"], .modal [role="combobox"]').all();
      return dropdowns.length > 0 ? dropdowns[0] : null;
    } catch (error) {
      console.error('Error getting L1 Status dropdown:', error.message);
      return null;
    }
  }

  async getL2StatusDropdown() {
    try {
      // L2 Status is typically the second dropdown in edit modal
      const dropdowns = await this.page.locator('dialog select, .modal select, dialog [role="combobox"], .modal [role="combobox"]').all();
      return dropdowns.length > 1 ? dropdowns[1] : null;
    } catch (error) {
      console.error('Error getting L2 Status dropdown:', error.message);
      return null;
    }
  }

  async getCommentField() {
    try {
      // Comment field is typically a textarea
      const textarea = this.page.locator('dialog textarea, .modal textarea').first();
      return await textarea.isVisible().catch(() => false) ? textarea : null;
    } catch (error) {
      console.error('Error getting comment field:', error.message);
      return null;
    }
  }

  async setFieldValue(fieldSelector, value) {
    try {
      const field = this.page.locator(fieldSelector).first();
      if (await field.isVisible().catch(() => false)) {
        await field.fill(value);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error setting field value: ${error.message}`);
      return false;
    }
  }

  async selectDropdownOption(dropdownSelector, optionText) {
    try {
      const dropdown = this.page.locator(dropdownSelector).first();
      
      // Check if it's a select element or Material-UI dropdown
      const tagName = await dropdown.evaluate(el => el.tagName);
      
      if (tagName === 'SELECT') {
        await dropdown.selectOption({ label: optionText });
      } else {
        // Material-UI dropdown
        await dropdown.click();
        await this.page.waitForTimeout(500);
        const option = this.page.locator(`[role="option"]:has-text("${optionText}")`).first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
      }
      return true;
    } catch (error) {
      console.error(`Error selecting dropdown option: ${error.message}`);
      return false;
    }
  }

  async getFieldValue(fieldSelector) {
    try {
      const field = this.page.locator(fieldSelector).first();
      return await field.inputValue().catch(() => null);
    } catch (error) {
      console.error('Error getting field value:', error.message);
      return null;
    }
  }

  async clickSaveButton() {
    console.log('Clicking Save button...');
    try {
      const saveBtn = this.page.locator('button:has-text("Save"), button:has-text("SAVE"), button:has-text("Submit")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await this.page.waitForTimeout(1500);
        console.log('✅ Save button clicked');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clicking Save button:', error.message);
      return false;
    }
  }

  async clickCancelButton() {
    console.log('Clicking Cancel button...');
    try {
      const cancelBtn = this.page.locator('button:has-text("Cancel"), button:has-text("CANCEL"), button:has-text("Close"), button:has-text("Close Modal")').first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Cancel button clicked');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clicking Cancel button:', error.message);
      return false;
    }
  }

  async getValidationError() {
    try {
      // Look for error messages
      const error = this.page.locator('.error, .MuiFormHelperText-root, [role="alert"], .error-message').first();
      if (await error.isVisible().catch(() => false)) {
        return await error.textContent();
      }
      return null;
    } catch {
      return null;
    }
  }

  async hasValidationError() {
    try {
      const error = this.page.locator('.error, .MuiFormHelperText-root, [role="alert"], .error-message').first();
      return await error.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }
}

module.exports = { ApproveSolutionTeamSalesPage };
