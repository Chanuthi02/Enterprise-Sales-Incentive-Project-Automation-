// tests/pages/solutionRegistryPage.js
class SolutionRegistryPage {
  constructor(page) {
    this.page = page;
    // Make viewRegistryButton available as a property for tests
    this.viewRegistryButton = page.getByRole('button', { name: 'View Registry' });
  }

  async goto() {
    await this.page.goto('https://dpdlab1.slt.lk:8454/solution-registry', {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '60000', 10)
    });
    await this.page.waitForTimeout(2000);
  }

  // Get year dropdown (combobox)
  async getYearDropdown() {
    return this.page.getByRole('combobox').first();
  }

  // Get quarter dropdown (combobox)
  async getQuarterDropdown() {
    return this.page.getByRole('combobox').nth(1);
  }

  // Select year from dropdown
  async selectYear(year) {
    console.log(`Selecting year: ${year}`);
    const yearDropdown = await this.getYearDropdown();
    await yearDropdown.click();
    await this.page.getByRole('option', { name: year.toString() }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ Selected year: ${year}`);
  }

  // Select quarter from dropdown
  async selectQuarter(quarter) {
    console.log(`Selecting quarter: ${quarter}`);
    const quarterDropdown = await this.getQuarterDropdown();
    await quarterDropdown.click();
    await this.page.getByRole('option', { name: quarter }).click();
    await this.page.waitForTimeout(500);
    console.log(`✅ Selected quarter: ${quarter}`);
  }

  // Select both year and quarter
  async selectYearAndQuarter(year, quarter) {
    await this.selectYear(year);
    await this.selectQuarter(quarter);
  }

  // Click View Registry button
  async clickViewRegistry() {
    console.log('Clicking View Registry button...');
    await this.viewRegistryButton.click();
    await this.waitForTableUpdate();
    console.log('✅ Clicked View Registry');
  }

  // Wait for table to update after action
  async waitForTableUpdate() {
    await this.page.waitForTimeout(1000);
    // Wait for any loading spinners to disappear
    const spinner = this.page.locator('.MuiCircularProgress-root');
    if (await spinner.isVisible().catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  // Get available years from dropdown
  async getAvailableYears() {
    const yearDropdown = await this.getYearDropdown();
    await yearDropdown.click();
    
    const yearOptions = await this.page.getByRole('option').all();
    const years = [];
    
    for (const option of yearOptions) {
      const text = await option.textContent();
      if (text && text.match(/^\d{4}$/)) {
        years.push(text);
      }
    }
    
    // Close dropdown
    await this.page.locator('body').click();
    await this.page.waitForTimeout(300);
    
    console.log(`Available years: ${years.join(', ')}`);
    return years;
  }

  // Get available quarters from dropdown
  async getAvailableQuarters() {
    const quarterDropdown = await this.getQuarterDropdown();
    await quarterDropdown.click();
    
    const quarterOptions = await this.page.getByRole('option').all();
    const quarters = [];
    
    for (const option of quarterOptions) {
      const text = await option.textContent();
      if (text && text.match(/^Q[1-4]$/)) {
        quarters.push(text);
      }
    }
    
    // Close dropdown
    await this.page.locator('body').click();
    await this.page.waitForTimeout(300);
    
    console.log(`Available quarters: ${quarters.join(', ')}`);
    return quarters;
  }

  // Get currently selected year
  async getSelectedYear() {
    const yearDropdown = await this.getYearDropdown();
    const text = await yearDropdown.textContent();
    const yearMatch = text.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : null;
  }

  // Get currently selected quarter
  async getSelectedQuarter() {
    const quarterDropdown = await this.getQuarterDropdown();
    const text = await quarterDropdown.textContent();
    const quarterMatch = text.match(/Q[1-4]/);
    return quarterMatch ? quarterMatch[0] : null;
  }

  // Check if table is visible
  async isTableVisible() {
    const table = this.page.locator('table');
    return await table.isVisible().catch(() => false);
  }

  // Get table headers
  async getTableHeaders() {
    const headers = this.page.locator('table thead th');
    const count = await headers.count();
    const headerTexts = [];
    
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      headerTexts.push(text.trim());
    }
    
    return headerTexts;
  }

  // Get number of rows in table
  async getRowCount() {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }

  // Get all table data
  async getTableData() {
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();
    const tableData = [];
    
    for (let i = 0; i < rowCount; i++) {
      const cells = await rows.nth(i).locator('td').all();
      const rowData = [];
      for (const cell of cells) {
        rowData.push(await cell.textContent());
      }
      tableData.push(rowData);
    }
    
    return tableData;
  }

  // Check if a solution exists by ID
  async doesSolutionExist(solutionId) {
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const firstCell = await rows.nth(i).locator('td').first().textContent();
      if (firstCell && firstCell.includes(solutionId)) {
        return true;
      }
    }
    return false;
  }

  // Get solution by ID
  async getSolutionById(solutionId) {
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const firstCell = await rows.nth(i).locator('td').first().textContent();
      if (firstCell && firstCell.includes(solutionId)) {
        const cells = await rows.nth(i).locator('td').all();
        return {
          solutionId: await cells[0].textContent(),
          customerName: await cells[1].textContent(),
          solutionCategory: await cells[2].textContent(),
          solutionEng: await cells[3].textContent(),
          siEng: await cells[4].textContent(),
          dsp: await cells[5].textContent(),
          npv: await cells[6].textContent()
        };
      }
    }
    return null;
  }

  // Get total NPV sum from table
  async getTotalNPV() {
    const npvCells = this.page.locator('table tbody td:last-child');
    const count = await npvCells.count();
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const text = await npvCells.nth(i).textContent();
      const value = parseFloat(text.replace(/,/g, ''));
      if (!isNaN(value)) {
        total += value;
      }
    }
    
    return total;
  }

  // Validate table data integrity (no empty cells)
  async validateTableDataIntegrity() {
    const rows = this.page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const cells = await rows.nth(i).locator('td').all();
      for (const cell of cells) {
        const text = (await cell.textContent()).trim();
        if (text === '' || text === null) {
          return false;
        }
      }
    }
    return true;
  }

  // Check if no data message is shown
  async isNoDataMessageVisible() {
    const noDataText = this.page.locator('text=/no data|no records|no results/i');
    return await noDataText.isVisible().catch(() => false);
  }

  // Get error message if any
  async getErrorMessage() {
    const errorSelectors = ['.error', '.alert-danger', '.error-message'];
    for (const selector of errorSelectors) {
      const error = this.page.locator(selector);
      if (await error.isVisible().catch(() => false)) {
        return await error.textContent();
      }
    }
    return null;
  }

  // Take screenshot
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/${name}_${Date.now()}.png`,
      fullPage: true 
    });
  }
}

module.exports = { SolutionRegistryPage };