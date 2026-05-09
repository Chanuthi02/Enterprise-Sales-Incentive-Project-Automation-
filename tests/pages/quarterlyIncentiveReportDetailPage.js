// tests/pages/quarterlyIncentiveReportDetailPage.js
class QuarterlyIncentiveReportDetailPage {
  constructor(page) {
    this.page = page;
    
    // ========== HEADER/FOOTER ELEMENTS ==========
    this.pageHeader = page.locator('header, .header, .MuiAppBar-root, .navbar');
    this.pageTitle = page.locator('h1, h2, .page-title, .title');
    this.logo = page.locator('img[alt*="logo"], .logo, header img').first();
    this.footer = page.locator('footer, .footer, .MuiFooter-root');
    this.backButton = page.locator('button:has-text("Back"), button:has-text("< Back"), [aria-label*="back"], [aria-label*="Back"]');
    
    // ========== PER ENGINEER INCENTIVE SECTION ==========
    this.perEngineerIncentiveSection = page.locator('text=/Per Engineer/i, div:has-text("Per Engineer")').first();
    this.calculationTable = page.locator('table').first();
    this.calculationTableHeaders = page.locator('table').first().locator('thead th');
    this.calculationTableRows = page.locator('table').first().locator('tbody tr');
    this.amountValues = page.locator('table').first().locator('tbody td:last-child');
    
    // ========== SAVE TEAM AND AMOUNTS SECTION ==========
    this.saveTeamSection = page.locator('div:has-text("Save team"), div:has-text("Enter service")').first();
    this.saveTeamSectionHeading = page.locator('h3:has-text("Save team"), h2:has-text("Save team")').first();
    
    // Input fields for DGM
    this.dgmServiceNoField = page.locator('input[placeholder*="DGM Service"], input[placeholder*="DGM"], input:near(text="DGM Service")').first();
    this.dgmNameField = page.locator('input[placeholder*="DGM Name"], input[placeholder*="GM Name"]').first();
    
    // Input fields for GM
    this.gmServiceNoField = page.locator('input[placeholder*="GM Service"], input[placeholder*="GM"]').nth(1);
    this.gmNameField = page.locator('input[placeholder*="GM Name"]').nth(1);
    
    // Input fields for Solution Engineer / SI Engineer
    this.solutionEngServiceNoField = page.locator('input[placeholder*="Solution"], input[placeholder*="Solution Eng"]').first();
    this.siEngServiceNoField = page.locator('input[placeholder*="SI Eng"], input[placeholder*="Solution"]').nth(1);
    
    // Other engineers section
    this.otherEngineersLabel = page.locator('text=/Other engineers/i');
    this.addOtherEngineerLink = page.locator('a:has-text("ADD OTHER ENGINEER"), text=/\+ ADD OTHER/i, text="+ ADD OTHER ENGINEER"').first();
    this.otherEngineerFields = page.locator('input[placeholder*="engineer"], input[placeholder*="Other"]');
    
    // Save button - multiple ways to find it based on actual UI
    this.saveTeamButton = page.locator(
      'button:has-text("SAVE TEAM & AMOUNTS"), ' +
      'button:has-text("Save Team"), ' +
      'button:has-text("Save"), ' +
      'button >> text=/SAVE|Save/'
    ).first();
    
    // ========== DETAILED RECORDS TABLE ==========
    this.detailedRecordsTable = page.locator('table').nth(1);
    this.detailedTableHeaders = page.locator('table').nth(1).locator('thead th');
    this.detailedTableRows = page.locator('table').nth(1).locator('tbody tr');
    
    // ========== ACTION BUTTONS ==========
    this.editButtons = page.locator('button:has-text("Edit"), button[title*="Edit"]');
    this.deleteButtons = page.locator('button:has-text("Delete"), button[title*="Delete"]');
    this.addButton = page.locator('button:has-text("Add"), button:has-text("+"), button[title*="Add"]');
    
    // ========== LOADING/ERROR STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    this.successMessage = page.locator('.success-message, .alert-success, .MuiAlert-root[severity="success"]');
    this.noDataMessage = page.locator('text=/no data|no records|no results/i');
    
    // ========== DIALOG/MODAL ELEMENTS ==========
    this.dialog = page.locator('[role="dialog"], .MuiDialog-root, .modal');
    this.dialogTitle = page.locator('[role="dialog"] h2, .modal-header h2, .MuiDialogTitle-root');
    this.dialogCloseButton = page.locator('[role="dialog"] button[aria-label="close"], .modal-header button.close');
    this.dialogConfirmButton = page.locator('[role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("OK"), [role="dialog"] button:has-text("Save")');
    this.dialogCancelButton = page.locator('[role="dialog"] button:has-text("Cancel")');
  }

  // ========== NAVIGATION ==========
  
  async navigateToDetailedPage(year, quarter, rowIndex = 0) {
    console.log(`Navigating to detailed page for Year: ${year}, Quarter: ${quarter}`);
    // This will be called from the main page spec after clicking Explain button
    await this.waitForPageLoad();
  }

  async goto() {
    console.log('Navigating to Quarterly Incentive Report Detail page...');
    await this.page.goto('https://dpdlab1.slt.lk:8454/quarterly-incentive-report-detail', {
      ignoreHTTPSErrors: true,
      waitUntil: 'domcontentloaded',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '60000', 10)
    });
    await this.waitForPageLoad();
    console.log('✅ Detail page loaded');
  }

  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      await this.page.waitForTimeout(2000); // Additional wait for rendering
    } catch (error) {
      console.warn('Page load state timeout, continuing...');
    }
  }

  async goBack() {
    console.log('Clicking Back button...');
    if (await this.backButton.isVisible()) {
      await this.backButton.click();
      await this.page.waitForTimeout(2000);
    } else {
      console.log('Back button not visible, using browser back');
      await this.page.goBack();
      await this.page.waitForTimeout(2000);
    }
  }

  // ========== UI CHECKS ==========
  
  async isPageLoaded() {
    try {
      return await this.pageHeader.isVisible() || await this.saveTeamSectionHeading.isVisible();
    } catch {
      return false;
    }
  }

  async getPageTitle() {
    try {
      const titleElement = await this.pageTitle.first();
      return await titleElement.textContent();
    } catch {
      return null;
    }
  }

  async isHeaderVisible() {
    try {
      return await this.pageHeader.isVisible();
    } catch {
      return false;
    }
  }

  async isFooterVisible() {
    try {
      return await this.footer.isVisible();
    } catch {
      return false;
    }
  }

  async isLogoVisible() {
    try {
      return await this.logo.isVisible();
    } catch {
      return false;
    }
  }

  // ========== PER ENGINEER INCENTIVE SECTION ==========
  
  async isPerEngineerSectionVisible() {
    try {
      return await this.perEngineerIncentiveSection.isVisible();
    } catch {
      return false;
    }
  }

  async getCalculationTableHeaders() {
    try {
      return await this.calculationTableHeaders.allTextContents();
    } catch {
      return [];
    }
  }

  async getCalculationTableData() {
    try {
      const rows = await this.calculationTableRows.all();
      const data = [];
      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        data.push(cells);
      }
      return data;
    } catch {
      return [];
    }
  }

  async getPerEngineerAmounts() {
    try {
      const amounts = await this.amountValues.allTextContents();
      return amounts.map(amount => parseFloat(amount.replace(/[^0-9.]/g, '')) || 0);
    } catch {
      return [];
    }
  }

  async getTotalPerEngineerAmount() {
    try {
      const amounts = await this.getPerEngineerAmounts();
      return amounts.reduce((sum, amount) => sum + amount, 0);
    } catch {
      return 0;
    }
  }

  // ========== SAVE TEAM AND AMOUNTS SECTION ==========
  
  async isSaveTeamSectionVisible() {
    try {
      return await this.saveTeamSectionHeading.isVisible();
    } catch {
      return false;
    }
  }

  // DGM fields
  async setDGMServiceNo(value) {
    console.log(`Setting DGM Service No to: ${value}`);
    await this.dgmServiceNoField.clear();
    await this.dgmServiceNoField.fill(value.toString());
  }

  async setDGMName(value) {
    console.log(`Setting DGM Name to: ${value}`);
    await this.dgmNameField.clear();
    await this.dgmNameField.fill(value);
  }

  async getDGMServiceNo() {
    return await this.dgmServiceNoField.inputValue();
  }

  async getDGMName() {
    return await this.dgmNameField.inputValue();
  }

  // GM fields
  async setGMServiceNo(value) {
    console.log(`Setting GM Service No to: ${value}`);
    await this.gmServiceNoField.clear();
    await this.gmServiceNoField.fill(value.toString());
  }

  async setGMName(value) {
    console.log(`Setting GM Name to: ${value}`);
    await this.gmNameField.clear();
    await this.gmNameField.fill(value);
  }

  async getGMServiceNo() {
    return await this.gmServiceNoField.inputValue();
  }

  async getGMName() {
    return await this.gmNameField.inputValue();
  }

  // Solution Engineer fields
  async setSolutionEngServiceNo(value) {
    console.log(`Setting Solution Eng Service No to: ${value}`);
    await this.solutionEngServiceNoField.clear();
    await this.solutionEngServiceNoField.fill(value.toString());
  }

  async setSIEngServiceNo(value) {
    console.log(`Setting SI Eng Service No to: ${value}`);
    await this.siEngServiceNoField.clear();
    await this.siEngServiceNoField.fill(value.toString());
  }

  async getSolutionEngServiceNo() {
    return await this.solutionEngServiceNoField.inputValue();
  }

  async getSIEngServiceNo() {
    return await this.siEngServiceNoField.inputValue();
  }

  // Other engineers
  async getOtherEngineersFieldCount() {
    try {
      return await this.otherEngineerFields.count();
    } catch {
      return 0;
    }
  }

  async clickAddOtherEngineer() {
    console.log('Clicking "Add Other Engineer" link...');
    if (await this.addOtherEngineerLink.isVisible()) {
      await this.addOtherEngineerLink.click();
      await this.page.waitForTimeout(1000);
    } else {
      throw new Error('Add Other Engineer link not found');
    }
  }

  async addOtherEngineer(engineerServiceNo, engineerName) {
    console.log(`Adding other engineer: ${engineerName} (${engineerServiceNo})`);
    await this.clickAddOtherEngineer();
    
    const fields = await this.otherEngineerFields.all();
    if (fields.length >= 2) {
      const lastServiceNoField = fields[fields.length - 2];
      const lastNameField = fields[fields.length - 1];
      
      await lastServiceNoField.fill(engineerServiceNo.toString());
      await lastNameField.fill(engineerName);
      console.log(`✅ Added engineer: ${engineerName}`);
    }
  }

  async removeOtherEngineer(index) {
    console.log(`Removing other engineer at index ${index}...`);
    const deleteButtons = await this.deleteButtons.all();
    if (deleteButtons.length > index) {
      await deleteButtons[index].click();
      await this.page.waitForTimeout(1000);
    }
  }

  async isSaveTeamButtonVisible() {
    try {
      return await this.saveTeamButton.isVisible();
    } catch {
      return false;
    }
  }

  async clickSaveTeam() {
    console.log('Clicking Save Team & Amounts button...');
    await this.saveTeamButton.click();
    await this.page.waitForTimeout(2000);
  }

  async getSaveTeamButtonText() {
    try {
      return await this.saveTeamButton.textContent();
    } catch {
      return '';
    }
  }

  // ========== DETAILED RECORDS TABLE OPERATIONS ==========
  
  async isDetailedRecordsTableVisible() {
    try {
      return await this.detailedRecordsTable.isVisible();
    } catch {
      return false;
    }
  }

  async getDetailedTableHeaders() {
    try {
      return await this.detailedTableHeaders.allTextContents();
    } catch {
      return [];
    }
  }

  async getDetailedTableRowCount() {
    try {
      return await this.detailedTableRows.count();
    } catch {
      return 0;
    }
  }

  async getDetailedTableData() {
    try {
      const rows = await this.detailedTableRows.all();
      const data = [];
      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        data.push(cells);
      }
      return data;
    } catch {
      return [];
    }
  }

  async getDetailedTableRow(rowIndex) {
    try {
      const rows = await this.detailedTableRows.all();
      if (rows.length > rowIndex) {
        return await rows[rowIndex].locator('td').allTextContents();
      }
      return [];
    } catch {
      return [];
    }
  }

  // ========== EDIT/DELETE OPERATIONS ==========
  
  async clickEditButton(rowIndex = 0) {
    console.log(`Clicking Edit button for row ${rowIndex}...`);
    const editButtons = await this.editButtons.all();
    if (editButtons.length > rowIndex) {
      await editButtons[rowIndex].click();
      await this.page.waitForTimeout(1500);
    } else {
      throw new Error(`Edit button at index ${rowIndex} not found`);
    }
  }

  async clickDeleteButton(rowIndex = 0) {
    console.log(`Clicking Delete button for row ${rowIndex}...`);
    const deleteButtons = await this.deleteButtons.all();
    if (deleteButtons.length > rowIndex) {
      await deleteButtons[rowIndex].click();
      await this.page.waitForTimeout(1500);
    } else {
      throw new Error(`Delete button at index ${rowIndex} not found`);
    }
  }

  async clickAddButton() {
    console.log('Clicking Add button...');
    if (await this.addButton.isVisible()) {
      await this.addButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  // ========== DIALOG/MODAL OPERATIONS ==========
  
  async isDialogVisible() {
    try {
      return await this.dialog.isVisible();
    } catch {
      return false;
    }
  }

  async getDialogTitle() {
    try {
      return await this.dialogTitle.textContent();
    } catch {
      return '';
    }
  }

  async closeDialog() {
    console.log('Closing dialog...');
    if (await this.dialogCloseButton.isVisible()) {
      await this.dialogCloseButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async confirmDialogAction() {
    console.log('Confirming dialog action...');
    if (await this.dialogConfirmButton.isVisible()) {
      await this.dialogConfirmButton.click();
      await this.page.waitForTimeout(1500);
    }
  }

  async cancelDialogAction() {
    console.log('Canceling dialog action...');
    if (await this.dialogCancelButton.isVisible()) {
      await this.dialogCancelButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  // ========== LOADING/ERROR STATE CHECKS ==========
  
  async waitForLoadingToComplete() {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
      console.log('Loading completed');
    } catch {
      console.warn('Loading spinner timeout or not found');
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
      return await this.errorMessage.textContent();
    } catch {
      return '';
    }
  }

  async hasSuccessMessage() {
    try {
      return await this.successMessage.isVisible();
    } catch {
      return false;
    }
  }

  async getSuccessMessage() {
    try {
      return await this.successMessage.textContent();
    } catch {
      return '';
    }
  }

  async hasNoDataMessage() {
    try {
      return await this.noDataMessage.isVisible();
    } catch {
      return false;
    }
  }

  // ========== UTILITY FUNCTIONS ==========
  
  async fillAllEngineersData(mockData) {
    console.log('Filling all engineer data with mock data...');
    
    if (mockData.dgm) {
      await this.setDGMServiceNo(mockData.dgm.serviceNo);
      await this.setDGMName(mockData.dgm.name);
    }
    
    if (mockData.gm) {
      await this.setGMServiceNo(mockData.gm.serviceNo);
      await this.setGMName(mockData.gm.name);
    }
    
    if (mockData.solutionEng) {
      await this.setSolutionEngServiceNo(mockData.solutionEng.serviceNo);
    }
    
    if (mockData.siEng) {
      await this.setSIEngServiceNo(mockData.siEng.serviceNo);
    }
    
    if (mockData.otherEngineers && Array.isArray(mockData.otherEngineers)) {
      for (const engineer of mockData.otherEngineers) {
        await this.addOtherEngineer(engineer.serviceNo, engineer.name);
      }
    }
    
    console.log('✅ All engineer data filled');
  }

  async saveTeamDataAndWait() {
    console.log('Saving team data...');
    await this.clickSaveTeam();
    await this.waitForLoadingToComplete();
    
    // Wait for success message or table update
    await this.page.waitForTimeout(2000);
    
    if (await this.hasSuccessMessage()) {
      console.log('✅ Team data saved successfully');
      return true;
    } else if (await this.hasErrorMessage()) {
      console.error('❌ Error saving team data');
      return false;
    }
    
    return true;
  }
}

module.exports = { QuarterlyIncentiveReportDetailPage };
