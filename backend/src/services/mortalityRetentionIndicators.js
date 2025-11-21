const { siteDatabaseManager } = require('../config/siteDatabase');
const { sequelize } = require('../config/database');
const IndicatorStatus = require('../models/IndicatorStatus');
const fs = require('fs');
const path = require('path');

/**
 * Mortality and Retention Indicators Service
 * Dedicated service for mortality and retention indicators only
 */
class MortalityRetentionIndicators {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
    this.indicatorStatusCache = new Map();
    this.loadAllQueries();
    this.loadAllDetailQueries();
    // Load status asynchronously - will be ready when needed
    this.loadIndicatorStatus().catch(err => {
      console.error('[MortalityRetentionIndicators] Error loading indicator status in constructor:', err);
    });
  }

  // Load indicator status from database
  async loadIndicatorStatus() {
    try {
      const statuses = await IndicatorStatus.findAll();
      this.indicatorStatusCache.clear();
      statuses.forEach(status => {
        this.indicatorStatusCache.set(status.indicator_id, {
          is_active: status.is_active === 1,
          indicator_name: status.indicator_name,
          description: status.description
        });
      });
      console.log(`[MortalityRetentionIndicators] Loaded ${this.indicatorStatusCache.size} indicator statuses`);
    } catch (error) {
      console.error('[MortalityRetentionIndicators] Error loading indicator status:', error);
      // If table doesn't exist, all indicators are considered active by default
      this.queries.forEach((query, indicatorId) => {
        if (!this.indicatorStatusCache.has(indicatorId)) {
          this.indicatorStatusCache.set(indicatorId, {
            is_active: true,
            indicator_name: indicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: null
          });
        }
      });
    }
  }

  // Check if indicator is active
  async isIndicatorActive(indicatorId) {
    // Refresh cache if needed (can be optimized with periodic refresh)
    if (this.indicatorStatusCache.size === 0) {
      await this.loadIndicatorStatus();
    }
    
    const status = this.indicatorStatusCache.get(indicatorId);
    return status ? status.is_active : true; // Default to active if not found
  }

  // Load all mortality and retention SQL queries into memory at startup
  loadAllQueries() {
    const mortalityRetentionDir = path.join(__dirname, '../queries/mortality_retention_indicators');
    
    // List of mortality and retention indicator files
    const mortalityRetentionFiles = [
      '1_percentage_died.sql',
      '2_percentage_lost_to_followup.sql',
      '3_reengaged_within_28_days.sql',
      '4_reengaged_over_28_days.sql',
      '5a_late_visits_beyond_buffer.sql',
      '5b_late_visits_within_buffer.sql',
      '5c_visits_on_schedule.sql',
      '5d_early_visits.sql',
      '6a_same_day_art_initiation.sql',
      '6b_art_initiation_1_7_days.sql',
      '6c_art_initiation_over_7_days.sql',
      '7_baseline_cd4_before_art.sql',
      '8a_cotrimoxazole_prophylaxis.sql',
      '8b_fluconazole_prophylaxis.sql',
      '9a_mmd_less_than_3_months.sql',
      '9b_mmd_3_months.sql',
      '9c_mmd_4_months.sql',
      '9d_mmd_5_months.sql',
      '9e_mmd_6_plus_months.sql',
      '10a_tld_new_initiation.sql',
      '10b_tld_cumulative.sql',
      '11a_tpt_received.sql',
      '11b_tpt_completed.sql',
      '12a_vl_testing_coverage.sql',
      '12b_vl_monitored_six_months.sql',
      '12c_vl_suppression_12_months.sql',
      '12d_vl_suppression_overall.sql',
      '12e_vl_results_10_days.sql',
      '13a_enhanced_adherence_counseling.sql',
      '13b_followup_vl_after_counseling.sql',
      '13c_vl_suppression_after_counseling.sql',
      '14a_first_line_to_second_line.sql',
      '14b_second_line_to_third_line.sql',
      '15_retention_rate.sql'
    ];
    
    mortalityRetentionFiles.forEach(filename => {
      const filePath = path.join(mortalityRetentionDir, filename);
      if (fs.existsSync(filePath)) {
        const query = fs.readFileSync(filePath, 'utf8');
        const indicatorId = filename.replace('.sql', '');
        this.queries.set(indicatorId, query);
        console.log(`[MortalityRetentionIndicators] Loaded indicator: ${indicatorId}`);
      }
    });
    
    console.log(`[MortalityRetentionIndicators] Loaded ${this.queries.size} mortality and retention indicators`);
  }

  // Load detail queries (patient-level)
  loadAllDetailQueries() {
    const detailsDir = path.join(__dirname, '../queries/mortality_retention_indicators');
    const files = fs.readdirSync(detailsDir).filter(filename => filename.endsWith('_details.sql'));

    files.forEach(filename => {
      const filePath = path.join(detailsDir, filename);
      const query = fs.readFileSync(filePath, 'utf8');
      const indicatorId = filename.replace('.sql', '');
      this.detailQueries.set(indicatorId, query);

      if (indicatorId.endsWith('_details')) {
        const baseId = indicatorId.replace('_details', '');
        this.detailQueries.set(baseId, query);
      }
    });
  }

  // Process query with parameters
  // Handles both SET @variable syntax and :parameter syntax
  processQuery(query, params) {
    let processedQuery = query;
    
    // Check if query uses SET @variable syntax (new format)
    const usesSetVariables = query.includes('SET @') || query.includes('@StartDate') || query.includes('@EndDate');
    
    if (usesSetVariables) {
      // Generate SET statements for MySQL variables
      const setStatements = [];
      
      // Map parameter names to MySQL variable names
      const paramMap = {
        'StartDate': '@StartDate',
        'EndDate': '@EndDate',
        'PreviousEndDate': '@PreviousEndDate',
        'lost_code': '@lost_code',
        'dead_code': '@dead_code',
        'transfer_out_code': '@transfer_out_code',
        'mmd_eligible_code': '@mmd_eligible_code',
        'mmd_drug_quantity': '@mmd_drug_quantity',
        'vl_suppression_threshold': '@vl_suppression_threshold',
        'tld_regimen_formula': '@tld_regimen_formula',
        'transfer_in_code': '@transfer_in_code',
        'tpt_drug_list': '@tpt_drug_list',
        'ReengageDays': '@ReengageDays',
        'GraceDays': '@GraceDays'
      };
      
      Object.keys(params).forEach(key => {
        const value = params[key];
        const varName = paramMap[key] || `@${key}`;
        
        if (value !== null && value !== undefined) {
          if (typeof value === 'string') {
            setStatements.push(`SET ${varName} = '${value.replace(/'/g, "''")}';`);
          } else {
            setStatements.push(`SET ${varName} = ${value};`);
          }
        }
      });
      
      // Prepend SET statements to the query
      if (setStatements.length > 0) {
        processedQuery = setStatements.join('\n') + '\n' + processedQuery;
      }
    } else {
      // Old format: Replace :parameter syntax
      Object.keys(params).forEach(key => {
        const value = params[key];
        const regex = new RegExp(`:${key}\\b`, 'g');
        if (value !== null && value !== undefined) {
          if (typeof value === 'string') {
            processedQuery = processedQuery.replace(regex, `'${value.replace(/'/g, "''")}'`);
          } else {
            processedQuery = processedQuery.replace(regex, value);
          }
        }
      });
    }
    
    return processedQuery;
  }

  // Execute single mortality retention indicator for a specific site
  async executeIndicator(siteCode, indicatorId, params) {
    const startTime = performance.now();
    
    try {
      // Get query
      const query = this.queries.get(indicatorId);
      if (!query) {
        throw new Error(`Mortality retention indicator ${indicatorId} not found`);
      }

      // Process query with parameters
      const processedQuery = this.processQuery(query, params);
      
      // Execute on site database
      const siteDb = await siteDatabaseManager.getSiteConnection(siteCode);
      const results = await siteDb.query(processedQuery, {
        type: siteDb.QueryTypes.SELECT
      });
      
      const executionTime = performance.now() - startTime;
      
      // STANDARDIZE all results to the same schema for analytics
      // ALL indicators must return the EXACT SAME fields (0 for non-applicable)
      const processedResults = results.map(row => {
        if (row && typeof row === 'object') {
          // Create standardized result with ALL possible fields (0 if not present)
          const standardized = {
            // Core fields (always present)
            Indicator: row.Indicator || '',
            TOTAL: Number(row.TOTAL || 0),
            Percentage: Number(row.Percentage || 0),
            Male_0_14: Number(row.Male_0_14 || 0),
            Female_0_14: Number(row.Female_0_14 || 0),
            Male_over_14: Number(row.Male_over_14 || 0),
            Female_over_14: Number(row.Female_over_14 || 0),
            Children_Total: Number(row.Children_Total || (Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0))),
            Adults_Total: Number(row.Adults_Total || (Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0))),
            
            // Denominator fields (always present, 0 if not applicable)
            Total_ART: Number(row.Total_ART || 0),
            Total_Lost: Number(row.Total_Lost || 0),
            Total_Eligible: Number(row.Total_Eligible || 0),
            Total_Visits: Number(row.Total_Visits || 0),
            Total_Newly_Initiated: Number(row.Total_Newly_Initiated || 0),
            Eligible_Patients: Number(row.Eligible_Patients || 0),
            
            // Numerator fields (always present, 0 if not applicable)
            Deaths: Number(row.Deaths || 0),
            Lost_to_Followup: Number(row.Lost_to_Followup || 0),
            Reengaged_Within_28: Number(row.Reengaged_Within_28 || 0),
            Reengaged_Over_28: Number(row.Reengaged_Over_28 || 0),
            Late_Visits_Beyond_Buffer: Number(row.Late_Visits_Beyond_Buffer || 0),
            Late_Visits_Within_Buffer: Number(row.Late_Visits_Within_Buffer || 0),
            Visits_On_Schedule: Number(row.Visits_On_Schedule || row.On_Schedule_Visits || 0),
            Early_Visits: Number(row.Early_Visits || 0),
            Same_Day_Initiation: Number(row.Same_Day_Initiation || 0),
            Initiation_1_7_Days: Number(row.Initiation_1_7_Days || 0),
            Initiation_Over_7_Days: Number(row.Initiation_Over_7_Days || 0),
            With_Baseline_CD4: Number(row.With_Baseline_CD4 || 0),
            Receiving_Cotrimoxazole: Number(row.Receiving_Cotrimoxazole || 0),
            Receiving_Fluconazole: Number(row.Receiving_Fluconazole || 0),
            TPT_Received: Number(row.TPT_Received || 0),
            TPT_Completed: Number(row.TPT_Completed || 0),
            VL_Tested_12M: Number(row.VL_Tested_12M || 0),
            VL_Monitored_6M: Number(row.VL_Monitored_6M || 0),
            VL_Suppressed_12M: Number(row.VL_Suppressed_12M || 0),
            VL_Suppressed_Overall: Number(row.VL_Suppressed_Overall || 0),
            Within_10_Days: Number(row.Within_10_Days || 0),
            Received_Counseling: Number(row.Received_Counseling || 0),
            Followup_Received: Number(row.Followup_Received || 0),
            Achieved_Suppression: Number(row.Achieved_Suppression || 0),
            Switched_To_Second_Line: Number(row.Switched_To_Second_Line || 0),
            Switched_To_Third_Line: Number(row.Switched_To_Third_Line || 0),
            Total_Retained: Number(row.Total_Retained || 0),
            
            // Demographic total fields (denominator demographics)
            Male_0_14_Total: Number(row.Male_0_14_Total || 0),
            Female_0_14_Total: Number(row.Female_0_14_Total || 0),
            Male_over_14_Total: Number(row.Male_over_14_Total || 0),
            Female_over_14_Total: Number(row.Female_over_14_Total || 0),
            
            // Additional demographic breakdown fields (if present, keep them)
            Male_0_14_Deaths: Number(row.Male_0_14_Deaths || 0),
            Female_0_14_Deaths: Number(row.Female_0_14_Deaths || 0),
            Male_over_14_Deaths: Number(row.Male_over_14_Deaths || 0),
            Female_over_14_Deaths: Number(row.Female_over_14_Deaths || 0),
            Male_0_14_Lost: Number(row.Male_0_14_Lost || 0),
            Female_0_14_Lost: Number(row.Female_0_14_Lost || 0),
            Male_over_14_Lost: Number(row.Male_over_14_Lost || 0),
            Female_over_14_Lost: Number(row.Female_over_14_Lost || 0),
            Male_0_14_Reengaged: Number(row.Male_0_14_Reengaged || 0),
            Female_0_14_Reengaged: Number(row.Female_0_14_Reengaged || 0),
            Male_over_14_Reengaged: Number(row.Male_over_14_Reengaged || 0),
            Female_over_14_Reengaged: Number(row.Female_over_14_Reengaged || 0),
            Male_0_14_Eligible: Number(row.Male_0_14_Eligible || 0),
            Female_0_14_Eligible: Number(row.Female_0_14_Eligible || 0),
            Male_over_14_Eligible: Number(row.Male_over_14_Eligible || 0),
            Female_over_14_Eligible: Number(row.Female_over_14_Eligible || 0)
          };
          
          return standardized;
        }
        return row;
      });

      return {
        siteCode,
        indicatorId,
        data: processedResults,
        executionTime: Math.round(executionTime),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[MortalityRetentionIndicators] Error executing ${indicatorId} for site ${siteCode}:`, error);
      throw error;
    }
  }

  // Execute query and return RAW results (for Query Editor - no standardization)
  async executeIndicatorRaw(siteCode, indicatorId, params) {
    const startTime = performance.now();
    
    try {
      // Get query
      const query = this.queries.get(indicatorId);
      if (!query) {
        throw new Error(`Mortality retention indicator ${indicatorId} not found`);
      }

      // Process query with parameters
      const processedQuery = this.processQuery(query, params);
      
      // Execute on site database
      const siteDb = await siteDatabaseManager.getSiteConnection(siteCode);
      const results = await siteDb.query(processedQuery, {
        type: siteDb.QueryTypes.SELECT
      });
      
      const executionTime = performance.now() - startTime;
      
      // Return RAW results - exactly what the SQL query returns, no standardization
      return {
        siteCode,
        indicatorId,
        data: results, // Raw results from SQL query
        executionTime: Math.round(executionTime),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[MortalityRetentionIndicators] Error executing ${indicatorId} for site ${siteCode}:`, error);
      throw error;
    }
  }

  getDetailQueryKey(indicatorId) {
    if (this.detailQueries.has(indicatorId)) {
      return indicatorId;
    }

    const detailKey = `${indicatorId}_details`;
    if (this.detailQueries.has(detailKey)) {
      return detailKey;
    }

    return null;
  }

  async executeIndicatorDetails(siteCode, indicatorId, params, options = {}) {
    const { page = 1, limit = 50, search = '' } = options;
    const detailKey = this.getDetailQueryKey(indicatorId);

    if (!detailKey) {
      throw new Error(`Mortality retention detail indicator ${indicatorId} not found`);
    }

    const query = this.detailQueries.get(detailKey);
    const processedQuery = this.processQuery(query, params);
    const siteDb = await siteDatabaseManager.getSiteConnection(siteCode);

    const records = await siteDb.query(processedQuery, {
      type: siteDb.QueryTypes.SELECT
    });

    const normalizedSearch = (search || '').toString().trim().toLowerCase();
    const filteredRecords = normalizedSearch
      ? records.filter(record =>
          Object.values(record || {}).some(value => {
            if (value === null || value === undefined) return false;
            return value
              .toString()
              .toLowerCase()
              .includes(normalizedSearch);
          })
        )
      : records;

    const safeLimit = limit > 0 ? limit : 50;
    const totalCount = filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const offset = (currentPage - 1) * safeLimit;
    const paginatedRecords = filteredRecords.slice(offset, offset + safeLimit);

    return {
      data: paginatedRecords,
      pagination: {
        page: currentPage,
        limit: safeLimit,
        totalCount,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  // Execute all mortality retention indicators for a site (only active ones)
  async executeAllIndicators(siteCode, params) {
    const startTime = performance.now();
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Refresh indicator status cache
    await this.loadIndicatorStatus();

    for (const indicatorId of this.queries.keys()) {
      // Check if indicator is active
      const isActive = await this.isIndicatorActive(indicatorId);
      
      if (!isActive) {
        console.log(`[MortalityRetentionIndicators] Skipping inactive indicator: ${indicatorId}`);
        skippedCount++;
        continue;
      }

      try {
        const result = await this.executeIndicator(siteCode, indicatorId, params);
        results.push({
          indicatorId,
          data: result.data[0] || {},
          success: true
        });
        successCount++;
      } catch (error) {
        console.error(`[MortalityRetentionIndicators] Error executing ${indicatorId}:`, error);
        results.push({
          indicatorId,
          data: {
            Indicator: indicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            TOTAL: 0,
            Male_0_14: 0,
            Female_0_14: 0,
            Male_over_14: 0,
            Female_over_14: 0,
            error: error.message
          },
          success: false
        });
        errorCount++;
      }
    }

    const executionTime = performance.now() - startTime;
    const activeIndicatorsCount = this.queries.size - skippedCount;
    
    return {
      results: results.map(r => r.data),
      executionTime,
      successCount,
      errorCount,
      skippedCount,
      activeIndicatorsCount,
      totalIndicatorsCount: this.queries.size,
      averageTimePerIndicator: activeIndicatorsCount > 0 ? executionTime / activeIndicatorsCount : 0,
      timestamp: new Date().toISOString()
    };
  }

  // Get list of available indicators with status
  async getAvailableIndicators() {
    await this.loadIndicatorStatus();
    return Array.from(this.queries.keys()).map(indicatorId => {
      const status = this.indicatorStatusCache.get(indicatorId);
      return {
        id: indicatorId,
        name: status ? status.indicator_name : indicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        is_active: status ? status.is_active : true,
        description: status ? status.description : null
      };
    });
  }

  // Get indicator status (for admin)
  async getIndicatorStatus(indicatorId) {
    await this.loadIndicatorStatus();
    return this.indicatorStatusCache.get(indicatorId) || null;
  }

  // Update indicator status (for admin)
  async updateIndicatorStatus(indicatorId, isActive) {
    try {
      const [indicatorStatus, created] = await IndicatorStatus.findOrCreate({
        where: { indicator_id: indicatorId },
        defaults: {
          indicator_id: indicatorId,
          indicator_name: indicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          is_active: isActive ? 1 : 0
        }
      });

      if (!created) {
        indicatorStatus.is_active = isActive ? 1 : 0;
        await indicatorStatus.save();
      }

      // Update cache
      await this.loadIndicatorStatus();

      return {
        success: true,
        indicator_id: indicatorId,
        is_active: isActive
      };
    } catch (error) {
      console.error(`[MortalityRetentionIndicators] Error updating indicator status for ${indicatorId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const mortalityRetentionIndicators = new MortalityRetentionIndicators();

module.exports = mortalityRetentionIndicators;
