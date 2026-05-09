// tests/pages/salesMonthlyIndividualIncentivePage.js
class SalesMonthlyIndividualIncentivePage {
  constructor(page) {
    this.page = page;

    // Header elements
    this.pageHeader = page.locator('header, .header, .MuiAppBar-root, .navbar');
    this.pageTitle = page.locator('h1, h2, h3, h4, .page-title, .title');
    this.logo = page.locator('img[alt*="logo" i], .logo, header img').first();

    // Footer elements
    this.footer = page.locator('footer, .footer, .MuiFooter-root');
    this.footerLogo = page.locator('footer img, .footer img, .logo-footer');
    this.copyrightText = page.locator('footer p, .copyright, .footer-text');

    // Filters: Year, Month, Section
    this.yearDropdown = page.getByRole('combobox').first();
    this.monthDropdown = page.getByRole('combobox').nth(1);
    this.sectionDropdown = page.getByRole('combobox').nth(2);

    this.viewSalesButton = page.getByRole('button', { name: /View Sales|View|Submit/i });

    // Table
    this.resultsTable = page.locator('table');
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');

    // Loading and messages
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.noDataMessage = page.locator('text=/no data|no records|no results/i');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
  }

  async goto() {
    console.log('Navigating to Sales Monthly Individual Incentive page...');

    const targetUrl = 'https://dpdlab1.slt.lk:8454/sales-monthly-individual-incentive';
    const timeoutMs = parseInt(process.env.PLAYWRIGHT_TIMEOUT || '60000', 10);

    try {
      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs,
        ignoreHTTPSErrors: true
      });
    } catch (error) {
      console.log(`⚠️ First navigation attempt failed: ${error.message}`);
      await this.page.goto(targetUrl, {
        waitUntil: 'commit',
        timeout: timeoutMs,
        ignoreHTTPSErrors: true
      });
    }

    await this.waitForPageLoad();
    console.log('✅ Page loaded');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1500);
  }

  async waitForLoadingToComplete() {
    if (await this.loadingSpinner.isVisible().catch(() => false)) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 });
    }
    await this.page.waitForTimeout(500);
  }

  async selectYear(year) {
    await this.yearDropdown.click();
    await this.page.getByRole('option', { name: year.toString() }).click();
    await this.page.waitForTimeout(300);
  }

  async selectMonth(month) {
    await this.monthDropdown.click();
    await this.page.getByRole('option', { name: month.toString() }).click();
    await this.page.waitForTimeout(300);
  }

  async selectSection(section) {
    await this.sectionDropdown.click();
    await this.page.getByRole('option', { name: section.toString() }).click();
    await this.page.waitForTimeout(300);
  }

  async selectYearMonthSection(year, month, section) {
    await this.selectYear(year);
    await this.selectMonth(month);
    await this.selectSection(section);
  }

  async clickViewSales() {
    await this.viewSalesButton.click();
    await this.waitForLoadingToComplete();
  }

  async getAvailableYears() {
    await this.yearDropdown.click();
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.locator('body').click();
    return options.map(v => v.trim()).filter(v => /^\d{4}$/.test(v));
  }

  async getAvailableMonths() {
    await this.monthDropdown.click();
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.locator('body').click();
    return options
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .filter(v => /^(0?[1-9]|1[0-2]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)$/i.test(v));
  }

  async getAvailableSections() {
    await this.sectionDropdown.click();
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.locator('body').click();
    return options.map(v => v.trim()).filter(v => v.length > 0);
  }

  async getSelectedYear() {
    const text = await this.yearDropdown.textContent();
    const match = (text || '').match(/\d{4}/);
    return match ? match[0] : null;
  }

  async getSelectedMonth() {
    const text = await this.monthDropdown.textContent();
    return (text || '').trim() || null;
  }

  async getSelectedSection() {
    const text = await this.sectionDropdown.textContent();
    return (text || '').trim() || null;
  }

  async isTableVisible() {
    return await this.resultsTable.isVisible().catch(() => false);
  }

  async getTableHeaders() {
    const headers = await this.tableHeaders.all();
    const values = [];
    for (const header of headers) {
      values.push(((await header.textContent()) || '').trim());
    }
    return values;
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
        rowData.push(((await cell.textContent()) || '').trim());
      }
      tableData.push(rowData);
    }
    return tableData;
  }

  async getTotalIncentiveFromTable() {
    const rows = await this.getTableData();
    let total = 0;
    for (const row of rows) {
      if (row.length === 0) continue;
      const lastValue = row[row.length - 1];
      const parsed = parseFloat(lastValue.replace(/[$,%\s,]/g, ''));
      if (!isNaN(parsed)) {
        total += parsed;
      }
    }
    return total;
  }

  async isNoDataMessageVisible() {
    return await this.noDataMessage.isVisible().catch(() => false);
  }

  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async isHeaderVisible() {
    return await this.pageHeader.isVisible().catch(() => false);
  }

  async isLogoVisible() {
    return await this.logo.isVisible().catch(() => false);
  }

  async isFooterVisible() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await this.page.waitForTimeout(200);
    return await this.footer.isVisible().catch(() => false);
  }

  async isFooterLogoVisible() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await this.page.waitForTimeout(200);
    return await this.footerLogo.isVisible().catch(() => false);
  }

  async getFooterText() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await this.page.waitForTimeout(200);

    if (await this.copyrightText.isVisible().catch(() => false)) {
      return await this.copyrightText.textContent();
    }

    const fallbackText = await this.page.locator('text=/copyright|all rights reserved/i').first().textContent().catch(() => null);
    return fallbackText;
  }

  async validateTableStructure() {
    const rowCount = await this.getRowCount();
    if (rowCount === 0) return true;

    const firstCount = await this.tableRows.first().locator('td').count();
    for (let i = 1; i < Math.min(rowCount, 5); i++) {
      const rowCellCount = await this.tableRows.nth(i).locator('td').count();
      if (rowCellCount !== firstCount) {
        return false;
      }
    }
    return true;
  }

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `screenshots/monthly_individual_${name}_${Date.now()}.png`,
      fullPage: true
    });
  }
}

module.exports = { SalesMonthlyIndividualIncentivePage };
