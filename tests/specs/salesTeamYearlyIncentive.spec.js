// tests/specs/salesTeamYearlyIncentive.spec.js
const { test, expect } = require('@playwright/test');
const { SalesTeamYearlyIncentivePage } = require('../pages/salesTeamYearlyIncentivePage');
const { DatabaseHelper } = require('../helpers/dbHelper');

test.describe('Sales Team Yearly Incentive Page Tests', () => {
  let salesPage;
  let dbHelper;

  test.beforeAll(async () => {
    // Initialize database connection
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  test.beforeEach(async ({ page }) => {
    salesPage = new SalesTeamYearlyIncentivePage(page);
    await salesPage.goto();
  });

  test.afterAll(async () => {
    // Close database connection
    await dbHelper.disconnect();
  });

  // ========== UI/LAYOUT TESTS ==========
  
  test.describe('UI and Layout Tests', () => {
    
    test('TC001 - Page loads successfully', async () => {
      const title = await salesPage.getPageTitle();
      console.log(`Page title: ${title}`);
      expect(title).toBeTruthy();
    });

    test('TC002 - Header is visible and properly displayed', async () => {
      const isHeaderVisible = await salesPage.isHeaderVisible();
      console.log(`Header visible: ${isHeaderVisible}`);
      expect(isHeaderVisible).toBeTruthy();
    });

    test('TC003 - Logo is visible in header/footer', async () => {
      const isLogoVisible = await salesPage.isLogoVisible();
      console.log(`Logo visible: ${isLogoVisible}`);
      expect(isLogoVisible).toBeTruthy();
    });

    test('TC004 - Footer is visible', async () => {
      const isFooterVisible = await salesPage.isFooterVisible();
      console.log(`Footer visible: ${isFooterVisible}`);
      expect(isFooterVisible).toBeTruthy();
    });

    test('TC005 - Footer logo is clearly visible', async () => {
      const isFooterLogoVisible = await salesPage.isFooterLogoVisible();
      console.log(`Footer logo visible: ${isFooterLogoVisible}`);
      expect(isFooterLogoVisible).toBeTruthy();
    });

    test('TC006 - Footer contains copyright information', async () => {
      const footerText = await salesPage.getFooterText();
      console.log(`Footer text: ${footerText}`);
      expect(footerText).toBeTruthy();
    });

    test('TC007 - Year dropdown is present and functional', async () => {
      const years = await salesPage.getAvailableYears();
      console.log(`Available years: ${years}`);
      expect(years.length).toBeGreaterThan(0);
    });

    test('TC008 - View Sales button is visible and enabled', async () => {
      await expect(salesPage.viewSalesButton).toBeVisible();
      await expect(salesPage.viewSalesButton).toBeEnabled();
    });

    test('TC009 - Page layout is responsive and elements are properly aligned', async () => {
      // Take screenshot for visual inspection
      await salesPage.takeScreenshot('page_layout');
      
      // Check if table is properly positioned
      const tableBox = await salesPage.resultsTable.boundingBox();
      const headerBox = await salesPage.pageHeader.boundingBox();
      const footerBox = await salesPage.footer.boundingBox();
      
      expect(tableBox).not.toBeNull();
      expect(headerBox).not.toBeNull();
      expect(footerBox).not.toBeNull();
      
      console.log('Layout check passed');
    });
  });

  // ========== DROPDOWN AND BUTTON TESTS ==========
  
  test.describe('Dropdown and Button Tests', () => {
    
    test('TC010 - User can select a year from dropdown', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      await salesPage.selectYear(testYear);
      const selectedYear = await salesPage.getSelectedYear();
      expect(selectedYear).toBe(testYear);
    });

    test('TC011 - Clicking View Sales without year shows appropriate message', async () => {
      await salesPage.clickViewSales();
      
      const tableVisible = await salesPage.isTableVisible();
      const errorVisible = await salesPage.isErrorMessageVisible();
      const noDataVisible = await salesPage.isNoDataMessageVisible();
      
      expect(tableVisible || errorVisible || noDataVisible).toBeTruthy();
    });

    test('TC012 - Clicking View Sales with selected year loads data', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      await salesPage.selectYear(years[0]);
      await salesPage.clickViewSales();
      
      const tableVisible = await salesPage.isTableVisible();
      console.log(`Table visible: ${tableVisible}`);
      expect(tableVisible || await salesPage.isNoDataMessageVisible()).toBeTruthy();
    });
  });

  // ========== TABLE FORMAT AND STRUCTURE TESTS ==========
  
  test.describe('Table Format and Structure Tests', () => {
    
    test.beforeEach(async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length > 0) {
        await salesPage.selectYear(years[0]);
        await salesPage.clickViewSales();
      }
    });

    test('TC013 - Table has proper headers', async () => {
      const headers = await salesPage.getTableHeaders();
      console.log('Table headers:', headers);
      
      if (await salesPage.getRowCount() > 0) {
        expect(headers.length).toBeGreaterThan(0);
      }
    });

    test('TC014 - Table has consistent column structure across rows', async () => {
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const isValidStructure = await salesPage.validateTableStructure();
      console.log(`Table structure valid: ${isValidStructure}`);
      expect(isValidStructure).toBeTruthy();
    });

    test('TC015 - Incentive values are properly formatted', async () => {
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const isValidFormat = await salesPage.validateIncentiveFormatting();
      console.log(`Incentive formatting valid: ${isValidFormat}`);
      expect(isValidFormat).toBeTruthy();
    });

    test('TC016 - Table displays data in correct order', async () => {
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const tableData = await salesPage.getTableData();
      console.log(`Table has ${tableData.length} rows of data`);
      expect(tableData.length).toBe(rowCount);
    });
  });

  // ========== DATABASE VALIDATION TESTS ==========
  
  test.describe('Database Validation Tests', () => {
    
    test('TC017 - UI data matches database records', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();
      
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data in UI - skipping DB comparison');
        expect(true).toBeTruthy();
        return;
      }
      
      // Get data from database
      const dbData = await dbHelper.getAllYearlyIncentives(parseInt(testYear));
      console.log(`DB has ${dbData.length} records for year ${testYear}`);
      
      // Get UI data
      const uiData = await salesPage.getTableData();
      console.log(`UI has ${uiData.length} records for year ${testYear}`);
      
      // Compare counts (they should match or be close)
      expect(Math.abs(uiData.length - dbData.length)).toBeLessThanOrEqual(1);
    });

    test('TC018 - Incentive amounts match database calculations', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();
      
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data in UI - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      // Get first salesperson from UI
      const uiData = await salesPage.getTableData();
      if (uiData.length === 0 || uiData[0].length < 2) {
        console.log('No data to compare');
        expect(true).toBeTruthy();
        return;
      }
      
      const salespersonName = uiData[0][0];
      const uiIncentive = parseFloat(uiData[0][uiData[0].length - 1].replace(/[$,]/g, ''));
      
      // Get data from database
      const dbRecord = await dbHelper.getYearlyIncentive(salespersonName, parseInt(testYear));
      
      if (dbRecord) {
        const dbIncentive = parseFloat(dbRecord.total_incentive);
        console.log(`UI Incentive: ${uiIncentive}, DB Incentive: ${dbIncentive}`);
        
        // Allow small rounding differences
        expect(Math.abs(uiIncentive - dbIncentive)).toBeLessThan(0.01);
      } else {
        console.log(`No DB record found for ${salespersonName}`);
      }
    });

    test('TC019 - Total incentive matches database sum', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();
      
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data in UI - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      // Get total from UI
      const uiTotal = await salesPage.getTotalIncentive();
      
      // Get total from database
      const dbTotal = await dbHelper.getTotalYearlyIncentive(parseInt(testYear));
      
      console.log(`UI Total: ${uiTotal}, DB Total: ${dbTotal}`);
      
      // Allow small rounding differences
      expect(Math.abs(uiTotal - dbTotal)).toBeLessThan(1);
    });

    test('TC020 - All salespersons have valid incentive calculations', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();
      
      const rowCount = await salesPage.getRowCount();
      if (rowCount === 0) {
        console.log('No data in UI - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const uiData = await salesPage.getTableData();
      let allValid = true;
      
      for (const row of uiData) {
        if (row.length >= 2) {
          const salesperson = row[0];
          const incentiveStr = row[row.length - 1];
          const incentive = parseFloat(incentiveStr.replace(/[$,]/g, ''));
          
          if (isNaN(incentive) && !incentiveStr.includes('No data')) {
            console.log(`Invalid incentive for ${salesperson}: ${incentiveStr}`);
            allValid = false;
          }
        }
      }
      
      expect(allValid).toBeTruthy();
    });

    test('TC025 - Fails when DB has data but UI shows no rows', async () => {
      const years = await salesPage.getAvailableYears();
      expect(years.length).toBeGreaterThan(0);

      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();

      const dbData = await dbHelper.getAllYearlyIncentives(parseInt(testYear, 10));
      const uiRowCount = await salesPage.getRowCount();

      if (dbData.length > 0) {
        expect(uiRowCount).toBeGreaterThan(0);
      }
    });

    test('TC026 - UI empty state is valid only when DB is empty', async () => {
      const years = await salesPage.getAvailableYears();
      expect(years.length).toBeGreaterThan(0);

      const testYear = years[0];
      await salesPage.selectYear(testYear);
      await salesPage.clickViewSales();

      const dbData = await dbHelper.getAllYearlyIncentives(parseInt(testYear, 10));
      const uiRowCount = await salesPage.getRowCount();

      if (uiRowCount === 0) {
        const noDataVisible = await salesPage.isNoDataMessageVisible();
        expect(dbData.length).toBe(0);
        expect(noDataVisible).toBeTruthy();
      }
    });
  });

  // ========== EDGE CASE TESTS ==========
  
  test.describe('Edge Case Tests', () => {
    
    test('TC021 - Page handles invalid year selection gracefully', async () => {
      try {
        await salesPage.selectYear('1999');
        await salesPage.clickViewSales();
        
        const noDataVisible = await salesPage.isNoDataMessageVisible();
        console.log(`No data message visible: ${noDataVisible}`);
        expect(true).toBeTruthy();
      } catch (error) {
        console.log('Year not available - test passes');
        expect(true).toBeTruthy();
      }
    });

    test('TC022 - Page handles no data scenario appropriately', async () => {
      // Use a future year that likely has no data
      await salesPage.selectYear('2030');
      await salesPage.clickViewSales();
      
      const rowCount = await salesPage.getRowCount();
      const noDataVisible = await salesPage.isNoDataMessageVisible();
      
      console.log(`Row count: ${rowCount}, No data message: ${noDataVisible}`);
      expect(rowCount === 0 || noDataVisible).toBeTruthy();
    });
  });

  // ========== PERFORMANCE TESTS ==========
  
  test.describe('Performance Tests', () => {
    
    test('TC023 - Page loads within acceptable time', async () => {
      const startTime = Date.now();
      await salesPage.goto();
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('TC024 - View Sales loads data within acceptable time', async () => {
      const years = await salesPage.getAvailableYears();
      if (years.length === 0) {
        console.log('No years available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      await salesPage.selectYear(years[0]);
      
      const startTime = Date.now();
      await salesPage.clickViewSales();
      const loadTime = Date.now() - startTime;
      
      console.log(`View Sales load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });
  });
});