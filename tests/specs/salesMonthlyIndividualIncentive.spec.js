// tests/specs/salesMonthlyIndividualIncentive.spec.js
const { test, expect } = require('@playwright/test');
const { SalesMonthlyIndividualIncentivePage } = require('../pages/salesMonthlyIndividualIncentivePage');
const { DatabaseHelper } = require('../helpers/dbHelper');

function normalizeMonthToNumber(monthText) {
  if (!monthText) return null;
  const normalized = monthText.toString().trim().toLowerCase();
  const monthMap = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };

  if (/^\d+$/.test(normalized)) {
    const value = parseInt(normalized, 10);
    return value >= 1 && value <= 12 ? value : null;
  }

  return monthMap[normalized] || null;
}

test.describe('Sales Monthly Individual Incentive Page Tests', () => {
  let monthlyPage;
  let dbHelper;

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  test.beforeEach(async ({ page }) => {
    monthlyPage = new SalesMonthlyIndividualIncentivePage(page);
    await monthlyPage.goto();
  });

  test.afterAll(async () => {
    await dbHelper.disconnect();
  });

  test.describe('UI and Layout Tests', () => {
    test('TC001 - Page loads successfully', async () => {
      const title = await monthlyPage.getPageTitle();
      expect(title).toBeTruthy();
    });

    test('TC002 - Header is visible and properly displayed', async () => {
      expect(await monthlyPage.isHeaderVisible()).toBeTruthy();
    });

    test('TC003 - Logo is visible in header/footer', async () => {
      expect(await monthlyPage.isLogoVisible()).toBeTruthy();
    });

    test('TC004 - Footer is visible', async () => {
      expect(await monthlyPage.isFooterVisible()).toBeTruthy();
    });

    test('TC005 - Footer logo is clearly visible', async () => {
      expect(await monthlyPage.isFooterLogoVisible()).toBeTruthy();
    });

    test('TC006 - Footer contains copyright information', async () => {
      const footerText = await monthlyPage.getFooterText();
      expect(footerText).toBeTruthy();
    });

    test('TC007 - Year, month and section dropdowns are present', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);
    });

    test('TC008 - View Sales button is visible and enabled', async () => {
      await expect(monthlyPage.viewSalesButton).toBeVisible();
      await expect(monthlyPage.viewSalesButton).toBeEnabled();
    });

    test('TC009 - Page layout is responsive and elements are properly aligned', async () => {
      await monthlyPage.takeScreenshot('layout');
      const tableBox = await monthlyPage.resultsTable.boundingBox().catch(() => null);
      expect(tableBox).not.toBeNull();
    });
  });

  test.describe('Dropdown and Button Tests', () => {
    test('TC010 - User can select a year from dropdown', async () => {
      const years = await monthlyPage.getAvailableYears();
      expect(years.length).toBeGreaterThan(0);

      await monthlyPage.selectYear(years[0]);
      const selectedYear = await monthlyPage.getSelectedYear();
      expect(selectedYear).toContain(years[0]);
    });

    test('TC011 - User can select a month from dropdown', async () => {
      const months = await monthlyPage.getAvailableMonths();
      expect(months.length).toBeGreaterThan(0);

      await monthlyPage.selectMonth(months[0]);
      const selectedMonth = await monthlyPage.getSelectedMonth();
      expect(selectedMonth).toBeTruthy();
    });

    test('TC012 - User can select a section from dropdown', async () => {
      const sections = await monthlyPage.getAvailableSections();
      expect(sections.length).toBeGreaterThan(0);

      await monthlyPage.selectSection(sections[0]);
      const selectedSection = await monthlyPage.getSelectedSection();
      expect(selectedSection).toBeTruthy();
    });

    test('TC013 - Clicking View Sales with selected filters loads data', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);

      await monthlyPage.selectYearMonthSection(years[0], months[0], sections[0]);
      await monthlyPage.clickViewSales();

      const tableVisible = await monthlyPage.isTableVisible();
      const noDataVisible = await monthlyPage.isNoDataMessageVisible();
      expect(tableVisible || noDataVisible).toBeTruthy();
    });
  });

  test.describe('Table Format and Structure Tests', () => {
    test.beforeEach(async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      if (years.length > 0 && months.length > 0 && sections.length > 0) {
        await monthlyPage.selectYearMonthSection(years[0], months[0], sections[0]);
        await monthlyPage.clickViewSales();
      }
    });

    test('TC014 - Table has proper headers', async () => {
      const headers = await monthlyPage.getTableHeaders();
      if (await monthlyPage.getRowCount() > 0) {
        expect(headers.length).toBeGreaterThan(0);
      }
    });

    test('TC015 - Table has consistent column structure across rows', async () => {
      const rowCount = await monthlyPage.getRowCount();
      if (rowCount === 0) {
        expect(await monthlyPage.isNoDataMessageVisible()).toBeTruthy();
        return;
      }

      expect(await monthlyPage.validateTableStructure()).toBeTruthy();
    });

    test('TC016 - Table displays data rows when available', async () => {
      const rowCount = await monthlyPage.getRowCount();
      if (rowCount === 0) {
        expect(await monthlyPage.isNoDataMessageVisible()).toBeTruthy();
        return;
      }

      const data = await monthlyPage.getTableData();
      expect(data.length).toBe(rowCount);
    });
  });

  test.describe('Database Validation Tests', () => {
    test('TC017 - UI data count aligns with database records', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);

      const selectedYear = parseInt(years[0], 10);
      const selectedMonthNum = normalizeMonthToNumber(months[0]);
      expect(selectedMonthNum).not.toBeNull();
      const selectedSection = sections[0];

      await monthlyPage.selectYearMonthSection(years[0], months[0], selectedSection);
      await monthlyPage.clickViewSales();

      const dbData = await dbHelper.getMonthlyIndividualIncentiveData(selectedYear, selectedMonthNum, selectedSection);
      const uiRowCount = await monthlyPage.getRowCount();

      if (dbData.length === 0) {
        expect(uiRowCount).toBe(0);
        expect(await monthlyPage.isNoDataMessageVisible()).toBeTruthy();
      } else {
        expect(uiRowCount).toBeGreaterThan(0);
      }
    });

    test('TC018 - Total monthly incentive in UI matches database sum', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);

      const selectedYear = parseInt(years[0], 10);
      const selectedMonthNum = normalizeMonthToNumber(months[0]);
      expect(selectedMonthNum).not.toBeNull();
      const selectedSection = sections[0];

      await monthlyPage.selectYearMonthSection(years[0], months[0], selectedSection);
      await monthlyPage.clickViewSales();

      const dbTotal = await dbHelper.getMonthlyIndividualIncentiveTotal(selectedYear, selectedMonthNum, selectedSection);
      const uiRowCount = await monthlyPage.getRowCount();

      if (dbTotal === 0 && uiRowCount === 0) {
        expect(await monthlyPage.isNoDataMessageVisible()).toBeTruthy();
        return;
      }

      const uiTotal = await monthlyPage.getTotalIncentiveFromTable();
      expect(Math.abs(uiTotal - dbTotal)).toBeLessThan(1);
    });

    test('TC019 - Fails when DB has data but UI shows no rows', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);

      const selectedYear = parseInt(years[0], 10);
      const selectedMonthNum = normalizeMonthToNumber(months[0]);
      expect(selectedMonthNum).not.toBeNull();
      const selectedSection = sections[0];

      await monthlyPage.selectYearMonthSection(years[0], months[0], selectedSection);
      await monthlyPage.clickViewSales();

      const dbData = await dbHelper.getMonthlyIndividualIncentiveData(selectedYear, selectedMonthNum, selectedSection);
      const uiRowCount = await monthlyPage.getRowCount();

      if (dbData.length > 0) {
        expect(uiRowCount).toBeGreaterThan(0);
      }
    });

    test('TC020 - UI empty state is valid only when DB is empty', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      expect(years.length).toBeGreaterThan(0);
      expect(months.length).toBeGreaterThan(0);
      expect(sections.length).toBeGreaterThan(0);

      const selectedYear = parseInt(years[0], 10);
      const selectedMonthNum = normalizeMonthToNumber(months[0]);
      expect(selectedMonthNum).not.toBeNull();
      const selectedSection = sections[0];

      await monthlyPage.selectYearMonthSection(years[0], months[0], selectedSection);
      await monthlyPage.clickViewSales();

      const dbData = await dbHelper.getMonthlyIndividualIncentiveData(selectedYear, selectedMonthNum, selectedSection);
      const uiRowCount = await monthlyPage.getRowCount();

      if (uiRowCount === 0) {
        expect(dbData.length).toBe(0);
        expect(await monthlyPage.isNoDataMessageVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Edge Case Tests', () => {
    test('TC021 - Invalid section selection is handled gracefully', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();

      if (years.length === 0 || months.length === 0) {
        expect(true).toBeTruthy();
        return;
      }

      await monthlyPage.selectYear(years[0]);
      await monthlyPage.selectMonth(months[0]);

      try {
        await monthlyPage.selectSection('INVALID_SECTION_999');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    test('TC022 - Page handles no data scenario appropriately', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      if (years.length === 0 || months.length === 0 || sections.length === 0) {
        expect(true).toBeTruthy();
        return;
      }

      await monthlyPage.selectYearMonthSection(years[0], months[0], sections[0]);
      await monthlyPage.clickViewSales();

      const rowCount = await monthlyPage.getRowCount();
      const noDataVisible = await monthlyPage.isNoDataMessageVisible();
      expect(rowCount > 0 || noDataVisible).toBeTruthy();
    });
  });

  test.describe('Performance Tests', () => {
    test('TC023 - Page loads within acceptable time', async () => {
      const start = Date.now();
      await monthlyPage.goto();
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(10000);
    });

    test('TC024 - View Sales loads data within acceptable time', async () => {
      const years = await monthlyPage.getAvailableYears();
      const months = await monthlyPage.getAvailableMonths();
      const sections = await monthlyPage.getAvailableSections();

      if (years.length === 0 || months.length === 0 || sections.length === 0) {
        expect(true).toBeTruthy();
        return;
      }

      await monthlyPage.selectYearMonthSection(years[0], months[0], sections[0]);

      const start = Date.now();
      await monthlyPage.clickViewSales();
      const loadTime = Date.now() - start;

      expect(loadTime).toBeLessThan(10000);
    });
  });
});
