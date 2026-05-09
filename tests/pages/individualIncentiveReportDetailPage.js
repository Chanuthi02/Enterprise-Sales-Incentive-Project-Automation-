// tests/pages/individualIncentiveReportDetailPage.js
class IndividualIncentiveReportDetailPage {
  constructor(page) {
    this.page = page;
    
    // ========== PAGE HEADER ==========
    this.pageTitle = page.locator('h1, h2, .page-title');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label*="back"]').first();
    
    // ========== EMPLOYEE INFORMATION SECTION ==========
    this.serviceNoLabel = page.locator('text=/Service No|Service Number/i');
    this.serviceNoInput = page.locator('input[type="text"], input[placeholder*="Service"]').first();
    this.nameLabel = page.locator('text=/Name/i');
    this.nameInput = page.locator('input[type="text"], input[placeholder*="Name"]').nth(1);
    this.sectionLabel = page.locator('text=/Section/i');
    this.sectionInput = page.locator('input[type="text"], input[placeholder*="Section"]');
    this.designationLabel = page.locator('text=/Designation/i');
    this.designationInput = page.locator('input[type="text"], input[placeholder*="Designation"]');
    
    // ========== PAYABLE COMMISSION SECTION ==========
    this.payableCommissionSection = page.locator('text=/Payable Commission Amount/i').locator('..').first();
    this.incentiveAmountField = page.locator('td:has-text("Incentive Amount")');
    this.ceilingField = page.locator('td:has-text("Ceiling")');
    this.retainedCommAmtField = page.locator('td:has-text("Retained Comm. AMT")');
    this.payableCommAmtField = page.locator('td:has-text("Payable Comm. AMT")');
    this.amountValues = page.locator('tbody td:last-child');
    
    // ========== ACHIEVEMENTS SECTION ==========
    this.achievementsSection = page.locator('text=/Achievements by Solution/i').locator('..').first();
    this.achievementsTable = page.locator('text=/Achievements by Solution/i').locator('xpath=following::table[1]');
    this.achievementRows = page.locator('text=/Achievements by Solution/i').locator('xpath=following::table[1] tbody tr');
    
    // ========== LOADING STATES ==========
    this.loadingSpinner = page.locator('.MuiCircularProgress-root, .loading-spinner, .spinner, .loading');
    this.errorMessage = page.locator('.error-message, .alert-danger, .MuiAlert-root[severity="error"]');
    this.successMessage = page.locator('.success-message, .alert-success, .MuiAlert-root[severity="success"]');
  }

  // ========== PAGE LOAD ==========
  
  async isPageLoaded() {
    try {
      const titleVisible = await this.pageTitle.isVisible();
      const backButtonVisible = await this.backButton.isVisible();
      return titleVisible && backButtonVisible;
    } catch {
      return false;
    }
  }

  async waitForPageLoad() {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.warn('Page load timeout, continuing...');
    }
  }

  // ========== EMPLOYEE INFO RETRIEVAL ==========
  
  async getServiceNo() {
    try {
      return await this.serviceNoInput.inputValue();
    } catch {
      return '';
    }
  }

  async getName() {
    try {
      return await this.nameInput.inputValue();
    } catch {
      return '';
    }
  }

  async getSection() {
    try {
      return await this.sectionInput.inputValue();
    } catch {
      return '';
    }
  }

  async getDesignation() {
    try {
      return await this.designationInput.inputValue();
    } catch {
      return '';
    }
  }

  // ========== PAYABLE COMMISSION DATA ==========
  
  async getIncentiveAmount() {
    try {
      const values = await this.amountValues.allTextContents();
      if (values.length > 0) {
        return parseFloat(values[0].replace(/[^\d.-]/g, '')) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getCeilingAmount() {
    try {
      const values = await this.amountValues.allTextContents();
      if (values.length > 1) {
        return values[1];
      }
      return '-';
    } catch {
      return '-';
    }
  }

  async getRetainedAmount() {
    try {
      const values = await this.amountValues.allTextContents();
      if (values.length > 2) {
        return parseFloat(values[2].replace(/[^\d.-]/g, '')) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getPayableCommissionAmount() {
    try {
      const values = await this.amountValues.allTextContents();
      if (values.length > 3) {
        return parseFloat(values[3].replace(/[^\d.-]/g, '')) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  // ========== ACHIEVEMENTS DATA ==========
  
  async getAchievementsData() {
    try {
      const achievements = [];
      const rows = await this.achievementRows.all();
      
      for (const row of rows) {
        const cells = await row.locator('td').allTextContents();
        if (cells.length >= 4) {
          achievements.push({
            solutionId: cells[0],
            customerName: cells[1],
            solutionCategory: cells[2],
            amount: parseFloat(cells[3].replace(/[^\d.-]/g, '')) || 0
          });
        }
      }
      
      return achievements;
    } catch {
      return [];
    }
  }

  async getAchievementsRowCount() {
    try {
      return await this.achievementRows.count();
    } catch {
      return 0;
    }
  }

  async getTotalAchievementsAmount() {
    try {
      const achievements = await this.getAchievementsData();
      return achievements.reduce((sum, ach) => sum + ach.amount, 0);
    } catch {
      return 0;
    }
  }

  // ========== VALIDATION CHECKS ==========
  
  async isPayableCommissionSectionVisible() {
    try {
      return await this.payableCommissionSection.isVisible();
    } catch {
      return false;
    }
  }

  async isAchievementsSectionVisible() {
    try {
      return await this.achievementsSection.isVisible();
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

  async hasSuccessMessage() {
    try {
      return await this.successMessage.isVisible();
    } catch {
      return false;
    }
  }

  // ========== NAVIGATION ==========
  
  async goBack() {
    console.log('Clicking back button...');
    try {
      await this.backButton.click({ force: true, timeout: 5000 });
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.warn(`Error clicking back button: ${error.message}`);
    }
  }

  // ========== WAIT UTILITIES ==========
  
  async waitForNoLoadingSpinner() {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      console.warn('Loading spinner did not appear or timed out');
    }
  }
}

module.exports = { IndividualIncentiveReportDetailPage };
