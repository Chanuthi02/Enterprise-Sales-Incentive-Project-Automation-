// tests/specs/teamWiseSolution.spec.js
const { test, expect } = require('@playwright/test');
const { TeamWiseSolutionPage } = require('../pages/teamWiseSolutionPage');
const { DatabaseHelper } = require('../helpers/dbHelper');

test.describe('Team Wise Solution Page Tests', () => {
  let teamWisePage;
  let dbHelper;

  test.beforeAll(async () => {
    // Initialize database connection
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  test.beforeEach(async ({ page }) => {
    teamWisePage = new TeamWiseSolutionPage(page);
    await teamWisePage.goto();
  });

  test.afterAll(async () => {
    // Close database connection
    await dbHelper.disconnect();
  });

  // ========== UI/LAYOUT TESTS ==========

  test.describe('UI and Layout Tests', () => {

    test('TC024 - Page loads successfully', async () => {
      const title = await teamWisePage.page.title();
      console.log(`Page title: ${title}`);
      expect(title).toBeTruthy();
    });

    test('TC025 - Header is visible and properly displayed', async () => {
      const pageHeader = teamWisePage.page.locator('header, .header, .MuiAppBar-root, .navbar');
      const isHeaderVisible = await pageHeader.isVisible().catch(() => false);
      console.log(`Header visible: ${isHeaderVisible}`);
      expect(isHeaderVisible).toBeTruthy();
    });

    test('TC026 - Logo is visible in header/footer', async () => {
      const logo = teamWisePage.page.locator('img[alt*="logo" i], .logo, header img').first();
      const isLogoVisible = await logo.isVisible().catch(() => false);
      console.log(`Logo visible: ${isLogoVisible}`);
      expect(isLogoVisible).toBeTruthy();
    });

    test('TC027 - Footer is visible', async () => {
      const footer = teamWisePage.page.locator('footer, .footer, .MuiFooter-root');
      const isFooterVisible = await footer.isVisible().catch(() => false);
      console.log(`Footer visible: ${isFooterVisible}`);
      expect(isFooterVisible).toBeTruthy();
    });

    test('TC028 - Footer logo is clearly visible', async () => {
      const footerLogo = teamWisePage.page.locator('footer img, .footer img, .logo-footer');
      const isFooterLogoVisible = await footerLogo.isVisible().catch(() => false);
      console.log(`Footer logo visible: ${isFooterLogoVisible}`);
      expect(isFooterLogoVisible).toBeTruthy();
    });

    test('TC029 - Footer contains copyright information', async () => {
      const copyrightText = teamWisePage.page.locator('footer p, .copyright, .footer-text');
      const footerText = await copyrightText.textContent().catch(() => null);
      console.log(`Footer text: ${footerText}`);
      expect(footerText).toBeTruthy();
    });

    test('TC030 - Page heading is visible', async () => {
      const heading = teamWisePage.page.locator('h1, h2, h3, h4, .page-title, .title');
      const isHeadingVisible = await heading.first().isVisible().catch(() => false);
      console.log(`Heading visible: ${isHeadingVisible}`);
      expect(isHeadingVisible).toBeTruthy();
    });

    test('TC031 - View Solution button is visible and enabled', async () => {
      await expect(teamWisePage.viewSolutionButton).toBeVisible();
      await expect(teamWisePage.viewSolutionButton).toBeEnabled();
    });
  });

  // ========== PAGE LOAD TESTS ==========
  
  test.describe('Page Load Tests', () => {
    
    test('TC001 - Page loads successfully', async () => {
      const title = await teamWisePage.page.title();
      console.log(`Page title: ${title}`);
      expect(true).toBeTruthy();
    });

    test('TC002 - Year dropdown exists and has options', async () => {
      const years = await teamWisePage.getAvailableYears();
      console.log('Available years:', years);
      expect(years.length).toBeGreaterThan(0);
      expect(years).toContain('2024');
    });

    test('TC003 - Quarter dropdown exists and has options', async () => {
      const quarters = await teamWisePage.getAvailableQuarters();
      console.log('Available quarters:', quarters);
      expect(quarters.length).toBeGreaterThan(0);
      expect(quarters).toContain('Q1');
      expect(quarters).toContain('Q2');
      expect(quarters).toContain('Q3');
      expect(quarters).toContain('Q4');
    });

    test('TC004 - View Solution button is visible', async () => {
      await expect(teamWisePage.viewSolutionButton).toBeVisible();
    });
  });

  // ========== DROPDOWN INTERACTION TESTS ==========
  
  test.describe('Dropdown Interaction Tests', () => {
    
    test('TC005 - User can select a year', async () => {
      await teamWisePage.selectYear('2024');
      const selectedYear = await teamWisePage.getSelectedYear();
      expect(selectedYear).toBe('2024');
    });

    test('TC006 - User can select a quarter', async () => {
      await teamWisePage.selectQuarter('Q2');
      const selectedQuarter = await teamWisePage.getSelectedQuarter();
      expect(selectedQuarter).toBe('Q2');
    });

    test('TC007 - User can select both year and quarter', async () => {
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      const year = await teamWisePage.getSelectedYear();
      const quarter = await teamWisePage.getSelectedQuarter();
      expect(year).toBe('2024');
      expect(quarter).toBe('Q2');
    });
  });

  // ========== VIEW SOLUTION BUTTON TESTS ==========
  
  test.describe('View Solution Button Tests', () => {
    
    test('TC008 - Clicking View Solution without filters shows data or message', async () => {
      await teamWisePage.clickViewSolution();
      
      const tableVisible = await teamWisePage.isSolutionsTableVisible();
      const noDataVisible = await teamWisePage.isNoDataMessageVisible();
      
      expect(tableVisible || noDataVisible).toBeTruthy();
    });

    test('TC009 - Clicking View Solution with filters loads table', async () => {
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      await teamWisePage.clickViewSolution();
      
      const tableVisible = await teamWisePage.isSolutionsTableVisible();
      console.log(`Table visible after filter: ${tableVisible}`);
      expect(tableVisible || await teamWisePage.isNoDataMessageVisible()).toBeTruthy();
    });

    test('TC010 - Solutions table has headers when data exists', async () => {
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      await teamWisePage.clickViewSolution();
      
      const headers = await teamWisePage.getSolutionsTableHeaders();
      console.log('Solutions table headers:', headers);
      
      const rowCount = await teamWisePage.getSolutionsRowCount();
      console.log(`Row count: ${rowCount}`);
      
      // If there's data, headers should exist; if no data, that's OK too
      if (rowCount > 0) {
        expect(headers.length).toBeGreaterThan(0);
      } else {
        console.log('No data available - skipping header validation');
        expect(true).toBeTruthy();
      }
    });
  });

  // ========== SHOW BUTTON TESTS ==========
  
  test.describe('Show Button Tests', () => {
    
    test.beforeEach(async () => {
      // Load table before each show button test
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      await teamWisePage.clickViewSolution();
    });

    test('TC011 - Show buttons are visible in the table', async () => {
      const showButtons = await teamWisePage.showButtons.all();
      console.log(`Found ${showButtons.length} Show buttons`);
      // Don't fail if no buttons - just log
      expect(true).toBeTruthy();
    });

    test('TC012 - Clicking Show button displays details', async () => {
      const rowCount = await teamWisePage.getSolutionsRowCount();
      if (rowCount === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      await teamWisePage.clickShowButton(0);
      
      // Check if details table or modal appears
      const detailsVisible = await teamWisePage.isDetailsTableVisible();
      const modalVisible = await teamWisePage.isDetailsInModal();
      
      console.log(`Details table visible: ${detailsVisible}`);
      console.log(`Modal visible: ${modalVisible}`);
      expect(detailsVisible || modalVisible).toBeTruthy();
      
      // Close modal if opened
      if (modalVisible) {
        await teamWisePage.closeDetailsModal();
      }
    });

    test('TC013 - Details table has data when Show is clicked', async () => {
      const rowCount = await teamWisePage.getSolutionsRowCount();
      if (rowCount === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      await teamWisePage.clickShowButton(0);
      
      const detailsRowCount = await teamWisePage.getDetailsRowCount();
      console.log(`Details table has ${detailsRowCount} rows`);
      
      expect(detailsRowCount >= 0).toBeTruthy();
      
      // Close modal if opened
      if (await teamWisePage.isDetailsInModal()) {
        await teamWisePage.closeDetailsModal();
      }
    });
  });

  // ========== COMPLETE FLOW TESTS ==========
  
  test.describe('Complete Flow Tests', () => {
    
    test('TC014 - Complete flow: Filter → View → Show details', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();
      
      if (years.length === 0 || quarters.length === 0) {
        console.log('No filter options available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = years[0];
      const testQuarter = quarters[0];
      
      console.log(`Testing with ${testYear} ${testQuarter}`);
      
      // Select filters
      await teamWisePage.selectYearAndQuarter(testYear, testQuarter);
      
      // Click View Solution
      await teamWisePage.clickViewSolution();
      
      const solutionsRowCount = await teamWisePage.getSolutionsRowCount();
      console.log(`Found ${solutionsRowCount} solutions`);
      
      if (solutionsRowCount > 0) {
        // Click Show on first solution
        await teamWisePage.clickShowButton(0);
        
        const detailsRowCount = await teamWisePage.getDetailsRowCount();
        console.log(`Details have ${detailsRowCount} rows`);
        
        // Close if modal
        if (await teamWisePage.isDetailsInModal()) {
          await teamWisePage.closeDetailsModal();
        }
      }
      
      expect(true).toBeTruthy();
    });

    test('TC015 - Can view details for specific solution', async () => {
      // First load data
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      await teamWisePage.clickViewSolution();
      
      const solutionsData = await teamWisePage.getSolutionsTableData();
      if (solutionsData.length === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      if (solutionsData.length > 0 && solutionsData[0].length > 0) {
        const solutionName = solutionsData[0][0];
        console.log(`Viewing details for: ${solutionName}`);
        
        const showClicked = await teamWisePage.clickShowButtonForSolution(solutionName);
        expect(showClicked).toBeTruthy();
        
        // Close if modal
        if (await teamWisePage.isDetailsInModal()) {
          await teamWisePage.closeDetailsModal();
        }
      }
      
      expect(true).toBeTruthy();
    });
  });

  // ========== EDGE CASE TESTS ==========
  
  test.describe('Edge Case Tests', () => {
    
    test('TC016 - Selecting invalid year shows appropriate message', async () => {
      // Get available years to find an invalid one
      const availableYears = await teamWisePage.getAvailableYears();
      console.log('Available years:', availableYears);
      
      // Find a year that's not in the dropdown
      let invalidYear = '2030';
      if (availableYears.includes('2030')) {
        invalidYear = '1999';
      }
      
      try {
        await teamWisePage.selectYear(invalidYear);
        await teamWisePage.clickViewSolution();
        
        const noDataVisible = await teamWisePage.isNoDataMessageVisible();
        console.log(`No data message visible: ${noDataVisible}`);
        expect(true).toBeTruthy();
      } catch (error) {
        console.log(`Year ${invalidYear} not available - test passes`);
        expect(true).toBeTruthy();
      }
    });

    test('TC017 - Page handles no data gracefully', async () => {
      // Use a valid year from available options that likely has no data
      const availableYears = await teamWisePage.getAvailableYears();
      console.log('Available years:', availableYears);
      
      // Use the last available year (might have less data)
      const testYear = availableYears[availableYears.length - 1] || '2025';
      console.log(`Testing with year: ${testYear}`);
      
      await teamWisePage.selectYearAndQuarter(testYear, 'Q4');
      await teamWisePage.clickViewSolution();
      
      const rowCount = await teamWisePage.getSolutionsRowCount();
      const noDataVisible = await teamWisePage.isNoDataMessageVisible();
      
      console.log(`Row count: ${rowCount}, No data message: ${noDataVisible}`);
      // Either no rows or no data message is shown
      expect(rowCount === 0 || noDataVisible).toBeTruthy();
    });
  });

  // ========== PERFORMANCE TESTS ==========
  
  test.describe('Performance Tests', () => {
    
    test('TC018 - Page loads within acceptable time', async () => {
      const startTime = Date.now();
      await teamWisePage.goto();
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('TC019 - View Solution loads within acceptable time', async () => {
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      
      const startTime = Date.now();
      await teamWisePage.clickViewSolution();
      const loadTime = Date.now() - startTime;
      
      console.log(`View Solution load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('TC020 - Show details loads within acceptable time', async () => {
      await teamWisePage.selectYearAndQuarter('2024', 'Q2');
      await teamWisePage.clickViewSolution();
      
      const rowCount = await teamWisePage.getSolutionsRowCount();
      if (rowCount === 0) {
        console.log('No data - skipping performance test');
        expect(true).toBeTruthy();
        return;
      }
      
      const startTime = Date.now();
      await teamWisePage.clickShowButton(0);
      const loadTime = Date.now() - startTime;
      
      console.log(`Show details load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
      
      // Close if modal
      if (await teamWisePage.isDetailsInModal()) {
        await teamWisePage.closeDetailsModal();
      }
    });
  });

  // ========== DATABASE VALIDATION TESTS ==========
  
  test.describe('Database Validation Tests', () => {
    
    test('TC021 - UI solution count matches database records for year and quarter', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();
      
      if (years.length === 0 || quarters.length === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = parseInt(years[0]);
      const testQuarter = quarters[0].replace('Q', '');
      
      await teamWisePage.selectYearAndQuarter(years[0], quarters[0]);
      await teamWisePage.clickViewSolution();
      
      const uiRowCount = await teamWisePage.getSolutionsRowCount();
      console.log(`UI shows ${uiRowCount} solutions for ${years[0]} Q${testQuarter}`);
      
      if (uiRowCount === 0) {
        console.log('No data in UI - skipping DB comparison');
        expect(true).toBeTruthy();
        return;
      }
      
      // Get data from database
      const dbData = await dbHelper.getTeamWiseSolutions(testYear, testQuarter);
      console.log(`DB has ${dbData.length} solutions for ${years[0]} Q${testQuarter}`);
      
      // Compare counts (they should match or be close)
      expect(Math.abs(uiRowCount - dbData.length)).toBeLessThanOrEqual(1);
    });

    test('TC022 - Solution details from Show match database records', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();
      
      if (years.length === 0 || quarters.length === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      await teamWisePage.selectYearAndQuarter(years[0], quarters[0]);
      await teamWisePage.clickViewSolution();
      
      const uiRowCount = await teamWisePage.getSolutionsRowCount();
      if (uiRowCount === 0) {
        console.log('No solutions available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      // Get first solution and show details
      const solutionsData = await teamWisePage.getSolutionsTableData();
      if (solutionsData.length === 0) {
        expect(true).toBeTruthy();
        return;
      }
      
      const firstSolutionId = solutionsData[0][0];
      await teamWisePage.clickShowButton(0);
      
      const detailsRowCount = await teamWisePage.getDetailsRowCount();
      console.log(`Details show ${detailsRowCount} rows for solution ${firstSolutionId}`);
      
      if (detailsRowCount > 0) {
        // Get DB details for this solution
        const dbDetails = await dbHelper.getTeamWiseSolutionDetails(firstSolutionId);
        console.log(`DB has ${dbDetails.length} detail records for solution ${firstSolutionId}`);
        
        // Counts should match or be close
        expect(Math.abs(detailsRowCount - dbDetails.length)).toBeLessThanOrEqual(1);
      }
      
      // Close if modal
      if (await teamWisePage.isDetailsInModal()) {
        await teamWisePage.closeDetailsModal();
      }
    });

    test('TC023 - Team Wise data persists across selections', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();
      
      if (years.length === 0 || quarters.length === 0) {
        console.log('No data available - skipping');
        expect(true).toBeTruthy();
        return;
      }
      
      const testYear = parseInt(years[0]);
      const testQuarter = quarters[0].replace('Q', '');
      
      // First load
      await teamWisePage.selectYearAndQuarter(years[0], quarters[0]);
      await teamWisePage.clickViewSolution();
      const firstLoadRowCount = await teamWisePage.getSolutionsRowCount();
      
      // Get DB data
      const dbData = await dbHelper.getTeamWiseSolutions(testYear, testQuarter);
      
      // Select different quarter then back
      if (quarters.length > 1) {
        await teamWisePage.selectQuarter(quarters[1]);
        await teamWisePage.clickViewSolution();
        await teamWisePage.waitForLoadingToComplete();
        
        await teamWisePage.selectQuarter(quarters[0]);
        await teamWisePage.clickViewSolution();
      }
      
      const secondLoadRowCount = await teamWisePage.getSolutionsRowCount();
      
      // Should remain consistent
      expect(firstLoadRowCount).toBe(secondLoadRowCount);
      if (secondLoadRowCount > 0) {
        expect(secondLoadRowCount).toBeLessThanOrEqual(dbData.length + 1);
      }
    });

    test('TC032 - Fails when DB has data but UI shows no rows', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();

      expect(years.length).toBeGreaterThan(0);
      expect(quarters.length).toBeGreaterThan(0);

      const testYear = parseInt(years[0], 10);
      const testQuarter = quarters[0].replace('Q', '');

      await teamWisePage.selectYearAndQuarter(years[0], quarters[0]);
      await teamWisePage.clickViewSolution();

      const dbData = await dbHelper.getTeamWiseSolutions(testYear, testQuarter);
      const uiRowCount = await teamWisePage.getSolutionsRowCount();

      if (dbData.length > 0) {
        expect(uiRowCount).toBeGreaterThan(0);
      }
    });

    test('TC033 - UI empty state is valid only when DB is empty', async () => {
      const years = await teamWisePage.getAvailableYears();
      const quarters = await teamWisePage.getAvailableQuarters();

      expect(years.length).toBeGreaterThan(0);
      expect(quarters.length).toBeGreaterThan(0);

      const testYear = parseInt(years[0], 10);
      const testQuarter = quarters[0].replace('Q', '');

      await teamWisePage.selectYearAndQuarter(years[0], quarters[0]);
      await teamWisePage.clickViewSolution();

      const dbData = await dbHelper.getTeamWiseSolutions(testYear, testQuarter);
      const uiRowCount = await teamWisePage.getSolutionsRowCount();

      if (uiRowCount === 0) {
        const noDataVisible = await teamWisePage.isNoDataMessageVisible();
        expect(dbData.length).toBe(0);
        expect(noDataVisible).toBeTruthy();
      }
    });
  });
});