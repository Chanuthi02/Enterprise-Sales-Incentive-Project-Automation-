// tests/helpers/dbHelper.js
const { Client } = require('pg');

class DatabaseHelper {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Client({
        host: process.env.TEST_DB_HOST || '124.43.216.136',
        port: parseInt(process.env.TEST_DB_PORT) || 5432,
        database: process.env.TEST_DB_DATABASE || 'esic_testing_db',
        user: process.env.TEST_DB_USER || 'esic_user',
        password: process.env.TEST_DB_PASSWORD || 'ESIC@2025',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 15000, // Increased to 15 seconds
        idleTimeoutMillis: 30000,
      });
      
      await this.client.connect();
      console.log('✅ Connected to PostgreSQL database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('✅ Disconnected from database');
    }
  }

  // Test the database connection
  async testConnection() {
    try {
      const result = await this.client.query('SELECT NOW() as current_time');
      console.log('Database time:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('Database test query failed:', error.message);
      return false;
    }
  }

  // Get yearly incentive data for a specific salesperson
  async getYearlyIncentive(salespersonName, year) {
    try {
      const query = `
        SELECT 
          sp.name as salesperson_name,
          SUM(i.incentive_amount) as total_incentive,
          COUNT(DISTINCT i.sale_id) as total_sales,
          EXTRACT(YEAR FROM i.incentive_date) as year
        FROM incentives i
        JOIN salespersons sp ON i.salesperson_id = sp.id
        WHERE sp.name = $1 AND EXTRACT(YEAR FROM i.incentive_date) = $2
        GROUP BY sp.name, EXTRACT(YEAR FROM i.incentive_date)
      `;
      
      const result = await this.client.query(query, [salespersonName, year]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting yearly incentive for ${salespersonName}:`, error.message);
      return null;
    }
  }

  // Get all yearly incentives for a given year
  async getAllYearlyIncentives(year) {
    try {
      const query = `
        SELECT 
          sp.name as salesperson_name,
          COALESCE(SUM(i.incentive_amount), 0) as total_incentive,
          COUNT(DISTINCT i.sale_id) as total_sales
        FROM salespersons sp
        LEFT JOIN incentives i ON i.salesperson_id = sp.id AND EXTRACT(YEAR FROM i.incentive_date) = $1
        GROUP BY sp.name
        ORDER BY total_incentive DESC
      `;
      
      const result = await this.client.query(query, [year]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting all yearly incentives for year ${year}:`, error.message);
      return [];
    }
  }

  // Get total incentives for a year
  async getTotalYearlyIncentive(year) {
    try {
      const query = `
        SELECT COALESCE(SUM(incentive_amount), 0) as total_incentive
        FROM incentives
        WHERE EXTRACT(YEAR FROM incentive_date) = $1
      `;
      
      const result = await this.client.query(query, [year]);
      return parseFloat(result.rows[0]?.total_incentive) || 0;
    } catch (error) {
      console.error(`Error getting total yearly incentive for year ${year}:`, error.message);
      return 0;
    }
  }

  // Get incentive details for a specific sale
  async getIncentiveDetails(saleId) {
    try {
      const query = `
        SELECT 
          s.id as sale_id,
          s.amount as sale_amount,
          i.incentive_amount,
          i.incentive_rate,
          sp.name as salesperson_name
        FROM sales s
        JOIN incentives i ON s.id = i.sale_id
        JOIN salespersons sp ON i.salesperson_id = sp.id
        WHERE s.id = $1
      `;
      
      const result = await this.client.query(query, [saleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting incentive details for sale ${saleId}:`, error.message);
      return null;
    }
  }

  // Verify incentive calculation matches business rules
  async verifyIncentiveCalculation(saleAmount, incentiveRate) {
    // Example calculation: incentive = saleAmount * (incentiveRate / 100)
    const calculatedIncentive = saleAmount * (incentiveRate / 100);
    return calculatedIncentive;
  }

  // Get available years from database
  async getAvailableYears() {
    try {
      const query = `
        SELECT DISTINCT EXTRACT(YEAR FROM incentive_date) as year
        FROM incentives
        WHERE incentive_date IS NOT NULL
        ORDER BY year DESC
      `;
      
      const result = await this.client.query(query);
      const years = result.rows.map(row => row.year.toString());
      console.log(`Available years in DB: ${years.join(', ')}`);
      return years;
    } catch (error) {
      console.error('Error getting available years:', error.message);
      return [];
    }
  }

  // Get salesperson list from database
  async getSalespersons() {
    try {
      const query = `
        SELECT id, name, email, region
        FROM salespersons
        ORDER BY name
      `;
      
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting salespersons:', error.message);
      return [];
    }
  }

  // Get a single employee for Employee View testing
  async getFirstEmployee() {
    try {
      const query = `
        SELECT id, name, email, region
        FROM salespersons
        ORDER BY id
        LIMIT 1
      `;
      
      const result = await this.client.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting first employee:', error.message);
      return null;
    }
  }

  // Get employee incentive data for Employee View
  async getEmployeeIncentiveData(employeeId, year) {
    try {
      const query = `
        SELECT 
          sp.id as employee_id,
          sp.name as employee_name,
          sp.email,
          sp.region,
          COALESCE(SUM(i.incentive_amount), 0) as total_incentive,
          COUNT(DISTINCT i.sale_id) as total_sales
        FROM salespersons sp
        LEFT JOIN incentives i ON i.salesperson_id = sp.id AND EXTRACT(YEAR FROM i.incentive_date) = $1
        WHERE sp.id = $2
        GROUP BY sp.id, sp.name, sp.email, sp.region
      `;
      
      const result = await this.client.query(query, [year, employeeId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting employee incentive data for ID ${employeeId}:`, error.message);
      return null;
    }
  }

  // Get incentive summary for UI comparison
  async getIncentiveSummary(year) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT sp.id) as total_salespersons,
          COUNT(DISTINCT i.sale_id) as total_transactions,
          COALESCE(SUM(i.incentive_amount), 0) as total_incentive,
          COALESCE(AVG(i.incentive_amount), 0) as avg_incentive,
          COALESCE(MAX(i.incentive_amount), 0) as max_incentive,
          COALESCE(MIN(i.incentive_amount), 0) as min_incentive
        FROM salespersons sp
        LEFT JOIN incentives i ON i.salesperson_id = sp.id AND EXTRACT(YEAR FROM i.incentive_date) = $1
      `;
      
      const result = await this.client.query(query, [year]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting incentive summary for year ${year}:`, error.message);
      return null;
    }
  }

  // Execute raw query (for custom validation)
  async executeQuery(query, params = []) {
    try {
      const result = await this.client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error.message);
      throw error;
    }
  }

  // ============ SOLUTION REGISTRY QUERIES ============

  // Get solutions for Solution Registry by year and quarter
  async getSolutionRegistryData(year, quarter) {
    try {
      const query = `
        SELECT 
          sr.solution_id,
          sr.solution_name,
          sr.customer_name,
          sr.category,
          sr.npv,
          sr.year,
          sr.quarter
        FROM solution_registry sr
        WHERE sr.year = $1 AND sr.quarter = $2
        ORDER BY sr.npv DESC
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting solution registry data for ${year} Q${quarter}:`, error.message);
      return [];
    }
  }

  // Get total NPV for a year and quarter
  async getTotalNPVForQuarter(year, quarter) {
    try {
      const query = `
        SELECT COALESCE(SUM(npv), 0) as total_npv
        FROM solution_registry
        WHERE year = $1 AND quarter = $2
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return parseFloat(result.rows[0]?.total_npv) || 0;
    } catch (error) {
      console.error(`Error getting total NPV for ${year} Q${quarter}:`, error.message);
      return 0;
    }
  }

  // ============ TEAM WISE SOLUTION QUERIES ============

  // Get team wise solutions for a given year and quarter
  async getTeamWiseSolutions(year, quarter) {
    try {
      const query = `
        SELECT 
          tw.solution_id,
          tw.solution_name,
          tw.team_name,
          tw.year,
          tw.quarter,
          tw.status
        FROM team_wise_solutions tw
        WHERE tw.year = $1 AND tw.quarter = $2
        ORDER BY tw.team_name, tw.solution_name
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting team wise solutions for ${year} Q${quarter}:`, error.message);
      return [];
    }
  }

  // Get solution details for Team Wise Solution
  async getTeamWiseSolutionDetails(solutionId) {
    try {
      const query = `
        SELECT 
          twd.solution_id,
          twd.metric_name,
          twd.metric_value,
          twd.team_member,
          twd.contribution_percent
        FROM team_wise_solution_details twd
        WHERE twd.solution_id = $1
        ORDER BY twd.team_member
      `;
      
      const result = await this.client.query(query, [solutionId]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting team wise solution details for ${solutionId}:`, error.message);
      return [];
    }
  }

  // ============ SOLUTION TEAM CEILING QUERIES ============

  // Get all solution team ceiling values from ceiling_values table
  async getSolutionTeamCeilings() {
    try {
      const query = `
        SELECT 
          cv.id,
          CONCAT(cv.role, ' - ', cv.team_type) as solution_name,
          cv.role,
          cv.term,
          cv.team_type,
          cv.section_code,
          cv.ceiling_value as solution_team_percentage,
          cv.created_at,
          cv.created_at as updated_at
        FROM public.ceiling_values cv
        ORDER BY cv.role, cv.team_type
      `;
      
      const result = await this.client.query(query);
      console.log(`✅ Retrieved ${result.rows.length} ceiling value records from database`);
      return result.rows;
    } catch (error) {
      console.error('Error getting solution team ceilings:', error.message);
      return [];
    }
  }

  // Get specific solution ceiling value from ceiling_values table
  async getSolutionCeilingValue(solutionName) {
    try {
      // Try matching by role or team_type or combination
      const query = `
        SELECT 
          cv.id,
          CONCAT(cv.role, ' - ', cv.team_type) as solution_name,
          cv.role,
          cv.term,
          cv.team_type,
          cv.section_code,
          cv.ceiling_value as solution_team_percentage,
          cv.created_at
        FROM public.ceiling_values cv
        WHERE LOWER(cv.role) = LOWER($1) 
           OR LOWER(cv.team_type) = LOWER($1)
           OR LOWER(CONCAT(cv.role, ' - ', cv.team_type)) = LOWER($1)
        LIMIT 1
      `;
      
      const result = await this.client.query(query, [solutionName]);
      if (result.rows.length > 0) {
        console.log(`✅ Found ceiling value for ${solutionName}`);
      } else {
        console.log(`⚠️ No ceiling value found for ${solutionName}`);
      }
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting ceiling value for ${solutionName}:`, error.message);
      return null;
    }
  }

  // Update solution ceiling value (for testing)
  async updateSolutionCeiling(solutionName, newPercentage) {
    try {
      // Parse solution name to get role and team_type
      let query, params;
      
      if (solutionName.includes(' - ')) {
        // Format: "ROLE - TEAM_TYPE"
        const [role, teamType] = solutionName.split(' - ').map(s => s.trim());
        query = `
          UPDATE public.ceiling_values
          SET ceiling_value = $1
          WHERE LOWER(role) = LOWER($2) AND LOWER(team_type) = LOWER($3)
          RETURNING *
        `;
        params = [newPercentage, role, teamType];
      } else {
        // Try matching by role or team_type
        query = `
          UPDATE public.ceiling_values
          SET ceiling_value = $1
          WHERE LOWER(role) = LOWER($2) OR LOWER(team_type) = LOWER($2)
          RETURNING *
        `;
        params = [newPercentage, solutionName];
      }
      
      const result = await this.client.query(query, params);
      if (result.rows.length > 0) {
        console.log(`✅ Updated ceiling value for ${solutionName} to ${newPercentage}`);
      }
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating ceiling for ${solutionName}:`, error.message);
      return null;
    }
  }

  // ============ SALES MONTHLY INDIVIDUAL INCENTIVE QUERIES ============

  async getSalespersonSectionExpression() {
    try {
      const query = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'salespersons'
          AND column_name IN ('section', 'region')
      `;

      const columns = await this.client.query(query);
      const names = new Set(columns.rows.map(row => row.column_name));

      if (names.has('section')) return 'sp.section';
      if (names.has('region')) return 'sp.region';
      return "''";
    } catch (error) {
      console.error('Error resolving section expression:', error.message);
      return "''";
    }
  }

  async getMonthlyIndividualIncentiveData(year, month, section) {
    try {
      const sectionExpr = await this.getSalespersonSectionExpression();
      const query = `
        SELECT
          sp.name as salesperson_name,
          ${sectionExpr} as section,
          COALESCE(SUM(i.incentive_amount), 0) as total_incentive,
          COUNT(DISTINCT i.sale_id) as total_sales,
          EXTRACT(YEAR FROM i.incentive_date) as year,
          EXTRACT(MONTH FROM i.incentive_date) as month
        FROM incentives i
        JOIN salespersons sp ON i.salesperson_id = sp.id
        WHERE EXTRACT(YEAR FROM i.incentive_date) = $1
          AND EXTRACT(MONTH FROM i.incentive_date) = $2
          AND ($3::text IS NULL OR COALESCE(${sectionExpr}::text, '') ILIKE $3)
        GROUP BY sp.name, ${sectionExpr}, EXTRACT(YEAR FROM i.incentive_date), EXTRACT(MONTH FROM i.incentive_date)
        ORDER BY total_incentive DESC, sp.name ASC
      `;

      const sectionParam = section ? section.trim() : null;
      const result = await this.client.query(query, [year, month, sectionParam]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting monthly individual incentive data for ${year}-${month} (${section}):`, error.message);
      return [];
    }
  }

  async getMonthlyIndividualIncentiveTotal(year, month, section) {
    try {
      const sectionExpr = await this.getSalespersonSectionExpression();
      const query = `
        SELECT COALESCE(SUM(i.incentive_amount), 0) as total_incentive
        FROM incentives i
        JOIN salespersons sp ON i.salesperson_id = sp.id
        WHERE EXTRACT(YEAR FROM i.incentive_date) = $1
          AND EXTRACT(MONTH FROM i.incentive_date) = $2
          AND ($3::text IS NULL OR COALESCE(${sectionExpr}::text, '') ILIKE $3)
      `;

      const sectionParam = section ? section.trim() : null;
      const result = await this.client.query(query, [year, month, sectionParam]);
      return parseFloat(result.rows[0]?.total_incentive) || 0;
    } catch (error) {
      console.error(`Error getting monthly individual incentive total for ${year}-${month} (${section}):`, error.message);
      return 0;
    }
  }

  // ============ QUARTERLY INCENTIVE REPORT QUERIES ============

  // Get quarterly incentive record count for given year and quarter
  async getQuarterlyIncentiveRecordCount(year, quarter) {
    try {
      const query = `
        SELECT COUNT(*) as record_count
        FROM quarterly_incentive_report
        WHERE EXTRACT(YEAR FROM report_date) = $1
          AND EXTRACT(QUARTER FROM report_date) = $2
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return parseInt(result.rows[0]?.record_count) || 0;
    } catch (error) {
      console.error(`Error getting quarterly incentive record count for ${year} Q${quarter}:`, error.message);
      return 0;
    }
  }

  // Get quarterly incentive data for given year and quarter
  async getQuarterlyIncentiveData(year, quarter) {
    try {
      const query = `
        SELECT 
          qir.id,
          qir.team_name,
          qir.team_lead,
          qir.quarterly_incentive,
          qir.calculation_details,
          qir.year,
          EXTRACT(QUARTER FROM qir.report_date) as quarter,
          qir.report_date,
          qir.created_at,
          qir.updated_at
        FROM quarterly_incentive_report qir
        WHERE EXTRACT(YEAR FROM qir.report_date) = $1
          AND EXTRACT(QUARTER FROM qir.report_date) = $2
        ORDER BY qir.team_name
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting quarterly incentive data for ${year} Q${quarter}:`, error.message);
      return [];
    }
  }

  // Get total quarterly incentive for given year and quarter
  async getQuarterlyIncentiveTotal(year, quarter) {
    try {
      const query = `
        SELECT COALESCE(SUM(quarterly_incentive), 0) as total_quarterly_incentive
        FROM quarterly_incentive_report
        WHERE EXTRACT(YEAR FROM report_date) = $1
          AND EXTRACT(QUARTER FROM report_date) = $2
      `;
      
      const result = await this.client.query(query, [year, quarter]);
      return parseFloat(result.rows[0]?.total_quarterly_incentive) || 0;
    } catch (error) {
      console.error(`Error getting quarterly incentive total for ${year} Q${quarter}:`, error.message);
      return 0;
    }
  }

  // Get quarterly incentive by team
  async getQuarterlyIncentiveByTeam(teamName, year, quarter) {
    try {
      const query = `
        SELECT 
          qir.team_name,
          qir.quarterly_incentive,
          qir.calculation_details,
          qir.year,
          EXTRACT(QUARTER FROM qir.report_date) as quarter
        FROM quarterly_incentive_report qir
        WHERE LOWER(qir.team_name) = LOWER($1)
          AND EXTRACT(YEAR FROM qir.report_date) = $2
          AND EXTRACT(QUARTER FROM qir.report_date) = $3
      `;
      
      const result = await this.client.query(query, [teamName, year, quarter]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error getting quarterly incentive for team ${teamName}:`, error.message);
      return null;
    }
  }

  // Update quarterly incentive team and amounts
  async updateQuarterlyIncentiveTeamAmounts(teamName, amounts, year, quarter) {
    try {
      const query = `
        UPDATE quarterly_incentive_report
        SET quarterly_incentive = $1, updated_at = NOW()
        WHERE LOWER(team_name) = LOWER($2)
          AND EXTRACT(YEAR FROM report_date) = $3
          AND EXTRACT(QUARTER FROM report_date) = $4
        RETURNING *
      `;
      
      const result = await this.client.query(query, [amounts, teamName, year, quarter]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating quarterly incentive for ${teamName}:`, error.message);
      return null;
    }
  }
}

module.exports = { DatabaseHelper };