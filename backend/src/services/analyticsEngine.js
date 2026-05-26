const AnalyticsIndicator = require('../models/AnalyticsIndicator');
const siteOptimizedIndicators = require('./siteOptimizedIndicators');
const { sequelize } = require('../config/database');

class AnalyticsEngine {
  constructor() {
    this.calculationQueue = new Map();
    this.isProcessing = false;
    this.enabled = true; // Analytics engine enabled/disabled state
  }

  /**
   * Enable analytics engine
   */
  enable() {
    this.enabled = true;
    console.log('[Analytics] Engine enabled');
  }

  /**
   * Disable analytics engine
   */
  disable() {
    this.enabled = false;
    console.log('[Analytics] Engine disabled');
  }

  /**
   * Check if analytics engine is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Calculate and store indicator values for a specific period and site
   */
  async calculateIndicator(indicatorId, siteCode, period, options = {}) {
    if (!this.enabled) {
      throw new Error('Analytics engine is disabled');
    }
    const startTime = Date.now();
    const calculationId = `${indicatorId}_${siteCode}_${period.periodYear}_${period.periodQuarter || period.periodMonth || 'all'}`;
    
    try {
      // Check if already calculating
      if (this.calculationQueue.has(calculationId)) {
      console.log(`⏳ Calculation already in progress for ${calculationId}`);
      return await this.calculationQueue.get(calculationId);
      }

      // Create calculation promise
      const calculationPromise = this._performCalculation(indicatorId, siteCode, period, options);
      this.calculationQueue.set(calculationId, calculationPromise);

      const result = await calculationPromise;
      
      const duration = Date.now() - startTime;
      console.log(`✅ Analytics calculation completed: ${calculationId} in ${duration}ms`);
      
      return result;
    } catch (error) {
      console.error(`❌ Analytics calculation failed: ${calculationId}`, error);
      throw error;
    } finally {
      this.calculationQueue.delete(calculationId);
    }
  }

  /**
   * Perform the actual calculation
   */
  async _performCalculation(indicatorId, siteCode, period, options) {
    const startTime = Date.now();
    
    try {
      // Check if calculation already exists and is recent
      const existing = await this._getExistingCalculation(indicatorId, siteCode, period);
      if (existing && this._isCalculationFresh(existing, options.forceRefresh)) {
        console.info(`📊 Using existing calculation for ${indicatorId} at ${siteCode}`);
        return existing;
      }

      // Update or create calculation record
      const calculationRecord = await this._createOrUpdateCalculationRecord(
        indicatorId, siteCode, period, 'calculating'
      );

      // Calculate the indicator value
      const indicatorData = await this._calculateIndicatorValue(indicatorId, siteCode, period);
      
      // Store the result
      const result = await this._storeCalculationResult(
        calculationRecord, indicatorData, startTime
      );

      return result;
    } catch (error) {
      // Update calculation record with error
      await this._updateCalculationRecord(indicatorId, siteCode, period, 'failed', null, error.message);
      throw error;
    }
  }

  /**
   * Run analytics for a specific year and all quarters
   */
  async runYearlyAnalytics(year, siteCode = null) {
    if (!this.enabled) {
      throw new Error('Analytics engine is disabled');
    }
    
    console.log(`[Analytics] Starting yearly analytics for year ${year}, site: ${siteCode || 'all sites'}`);
    
    const results = {
      year,
      siteCode,
      totalCalculations: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Get all sites if no specific site provided
    let sites = [];
    if (siteCode) {
      sites = [{ code: siteCode }];
    } else {
      try {
        const { Site } = require('../models');
        const siteRecords = await Site.findAll({ where: { status: 1 } });
        sites = siteRecords.map(site => ({ code: site.code }));
      } catch (error) {
        console.error('[Analytics] Error fetching sites:', error);
        results.errors.push('Failed to fetch sites');
        return results;
      }
    }

    // Define all indicators to calculate
    const indicators = ['1', '2', '3', '4', '5', '5.1.1', '5.1.2', '5.1.3', '5.2', '6', '7', '8', '8.2', '8.3', '8.4', '9', '10', '10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8'];

    // Calculate for each quarter of the year
    for (let quarter = 1; quarter <= 4; quarter++) {
      const period = this._getPeriodForYearQuarter(year, quarter);
      
      for (const site of sites) {
        for (const indicatorId of indicators) {
          results.totalCalculations++;
          
          try {
            await this.calculateIndicator(indicatorId, site.code, {
              periodType: 'quarterly',
              periodYear: year,
              periodQuarter: quarter,
              startDate: period.startDate,
              endDate: period.endDate,
              previousEndDate: period.previousEndDate
            });
            results.successful++;
            console.log(`[Analytics] ✅ ${indicatorId} for ${site.code} Q${quarter} ${year}`);
          } catch (error) {
            results.failed++;
            results.errors.push(`${indicatorId} for ${site.code} Q${quarter} ${year}: ${error.message}`);
            console.error(`[Analytics] ❌ ${indicatorId} for ${site.code} Q${quarter} ${year}:`, error.message);
          }
        }
      }
    }

    console.log(`[Analytics] Yearly analytics completed: ${results.successful}/${results.totalCalculations} successful`);
    return results;
  }

  /**
   * Run analytics for a specific year with real-time logging callback
   */
  async runYearlyAnalyticsWithLogging(year, siteCode = null, logCallback = null) {
    if (!this.enabled) {
      throw new Error('Analytics engine is disabled');
    }
    
    const log = (message, level = 'info', data = {}) => {
      if (logCallback) {
        logCallback({ message, level, data });
      }
    };

    log(`🚀 Starting yearly analytics for year ${year}, site: ${siteCode || 'all sites'}`, 'info');
    
    const results = {
      year,
      siteCode,
      totalCalculations: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Get all sites if no specific site provided
    let sites = [];
    if (siteCode) {
      sites = [{ code: siteCode }];
    } else {
      try {
        const { Site } = require('../models');
        const siteRecords = await Site.findAll({ where: { status: 1 } });
        sites = siteRecords.map(site => ({ code: site.code }));
        log(`📊 Found ${sites.length} sites to process`, 'info', { siteCount: sites.length });
      } catch (error) {
        log(`❌ Error fetching sites: ${error.message}`, 'error', { error: error.message });
        results.errors.push('Failed to fetch sites');
        return results;
      }
    }

    // Define all indicators to calculate
    const indicators = ['1', '2', '3', '4', '5', '5.1.1', '5.1.2', '5.1.3', '5.2', '6', '7', '8', '8.2', '8.3', '8.4', '9', '10', '10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8'];
    log(`📋 Processing ${indicators.length} indicators across 4 quarters`, 'info', { 
      indicatorCount: indicators.length, 
      siteCount: sites.length,
      totalCalculations: indicators.length * sites.length * 4
    });

    // Calculate for each quarter of the year
    for (let quarter = 1; quarter <= 4; quarter++) {
      const period = this._getPeriodForYearQuarter(year, quarter);
      log(`📅 Processing Quarter ${quarter} (${period.startDate} to ${period.endDate})`, 'info', { 
        quarter, 
        startDate: period.startDate, 
        endDate: period.endDate 
      });
      
      for (const site of sites) {
        log(`🏥 Processing site ${site.code} for Q${quarter}`, 'info', { siteCode: site.code, quarter });
        
        for (const indicatorId of indicators) {
          results.totalCalculations++;
          
          try {
            log(`⚙️  Calculating ${indicatorId} for ${site.code} Q${quarter}...`, 'info', { 
              indicatorId, 
              siteCode: site.code, 
              quarter,
              progress: `${results.totalCalculations}/${indicators.length * sites.length * 4}`
            });
            
            await this.calculateIndicator(indicatorId, site.code, {
              periodType: 'quarterly',
              periodYear: year,
              periodQuarter: quarter,
              startDate: period.startDate,
              endDate: period.endDate,
              previousEndDate: period.previousEndDate
            });
            results.successful++;
            log(`✅ Completed ${indicatorId} for ${site.code} Q${quarter}`, 'success', { 
              indicatorId, 
              siteCode: site.code, 
              quarter,
              successful: results.successful,
              failed: results.failed
            });
          } catch (error) {
            results.failed++;
            results.errors.push(`${indicatorId} for ${site.code} Q${quarter} ${year}: ${error.message}`);
            log(`❌ Failed ${indicatorId} for ${site.code} Q${quarter}: ${error.message}`, 'error', { 
              indicatorId, 
              siteCode: site.code, 
              quarter,
              error: error.message,
              successful: results.successful,
              failed: results.failed
            });
          }
        }
      }
    }

    const successRate = results.totalCalculations > 0 ? (results.successful / results.totalCalculations * 100).toFixed(1) : 0;
    log(`🎉 Yearly analytics completed! Success rate: ${successRate}% (${results.successful}/${results.totalCalculations})`, 'success', {
      successful: results.successful,
      failed: results.failed,
      totalCalculations: results.totalCalculations,
      successRate: parseFloat(successRate)
    });
    
    return results;
  }

  /**
   * Get period dates for a specific year and quarter
   */
  _getPeriodForYearQuarter(year, quarter) {
    const quarters = {
      1: { start: '01-01', end: '03-31', prevEnd: '12-31' },
      2: { start: '04-01', end: '06-30', prevEnd: '03-31' },
      3: { start: '07-01', end: '09-30', prevEnd: '06-30' },
      4: { start: '10-01', end: '12-31', prevEnd: '09-30' }
    };

    const q = quarters[quarter];
    const prevYear = quarter === 1 ? year - 1 : year;
    
    return {
      startDate: `${year}-${q.start}`,
      endDate: `${year}-${q.end}`,
      previousEndDate: `${prevYear}-${q.prevEnd}`
    };
  }

  /**
   * Calculate indicator value using existing service
   */
  async _calculateIndicatorValue(indicatorId, siteCode, period) {
    const params = {
      startDate: period.startDate,
      endDate: period.endDate,
      previousEndDate: period.previousEndDate,
      siteCode: siteCode
    };

    // Map short indicator ID to full query file name
    const indicatorMapping = {
      '1': '01_active_art_previous',
      '2': '02_active_pre_art_previous',
      '3': '03_newly_enrolled',
      '4': '04_retested_positive',
      '5': '05_newly_initiated',
      '5.1.1': '05.1.1_art_same_day',
      '5.1.2': '05.1.2_art_1_7_days',
      '5.1.3': '05.1.3_art_over_7_days',
      '5.2': '05.2_art_with_tld',
      '6': '06_transfer_in',
      '7': '07_lost_and_return',
      '8': '08_tpt_new_start',
      '8.2': '08.2_dead',
      '8.3': '08.3_lost_to_followup',
      '8.4': '08.4_transfer_out',
      '9': '09_active_pre_art',
      '10': '10_active_art_current',
      '10.1': '10.1_eligible_mmd',
      '10.2': '10.2_mmd',
      '10.3': '10.3_tld',
      '10.4': '10.4_tpt_start',
      '10.5': '10.5_tpt_complete',
      '10.6': '10.6_eligible_vl_test',
      '10.7': '10.7_vl_tested_12m',
      '10.8': '10.8_vl_suppression'
    };

    const queryIndicatorId = indicatorMapping[indicatorId] || indicatorId;
    console.log(`[Analytics] Calculating indicator ${indicatorId} -> ${queryIndicatorId} for site ${siteCode}`);
    
    // Use analytics-specific method that bypasses cache
    try {
      const result = await siteOptimizedIndicators.executeSiteIndicatorForAnalytics(siteCode, queryIndicatorId, params);
      console.log(`[Analytics] Result for ${indicatorId}:`, result ? 'success' : 'failed', result?.error || 'no error');
      
      if (!result || !result.success) {
        throw new Error(`Failed to calculate indicator ${indicatorId}: ${result?.error || 'Unknown error'}`);
      }
      
      return result.data;
    } catch (error) {
      console.log(`[Analytics] Error calculating ${indicatorId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get existing calculation if it exists
   */
  async _getExistingCalculation(indicatorId, siteCode, period) {
    const whereClause = {
      indicator_id: indicatorId,
      site_code: siteCode,
      period_type: period.periodType,
      period_year: period.periodYear
    };

    if (period.periodQuarter) {
      whereClause.period_quarter = period.periodQuarter;
    }
    if (period.periodMonth) {
      whereClause.period_month = period.periodMonth;
    }

    return await AnalyticsIndicator.findOne({
      where: whereClause,
      order: [['last_updated', 'DESC']]
    });
  }

  /**
   * Check if calculation is fresh enough
   */
  _isCalculationFresh(calculation, forceRefresh = false) {
    if (forceRefresh) return false;
    
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const age = Date.now() - new Date(calculation.last_updated).getTime();
    
    return age < maxAge && calculation.calculation_status === 'completed';
  }

  /**
   * Create or update calculation record
   */
  async _createOrUpdateCalculationRecord(indicatorId, siteCode, period, status) {
    const whereClause = {
      indicator_id: indicatorId,
      site_code: siteCode,
      period_type: period.periodType,
      period_year: period.periodYear
    };

    if (period.periodQuarter) {
      whereClause.period_quarter = period.periodQuarter;
    }
    if (period.periodMonth) {
      whereClause.period_month = period.periodMonth;
    }

    const [record, created] = await AnalyticsIndicator.findOrCreate({
      where: whereClause,
      defaults: {
        indicator_name: this._getIndicatorName(indicatorId),
        site_name: period.siteName || siteCode,
        period_type: period.periodType,
        period_year: period.periodYear,
        period_quarter: period.periodQuarter,
        period_month: period.periodMonth,
        start_date: period.startDate,
        end_date: period.endDate,
        previous_end_date: period.previousEndDate,
        calculation_status: status,
        calculation_started_at: new Date()
      }
    });

    if (!created) {
      await record.update({
        calculation_status: status,
        calculation_started_at: new Date(),
        error_message: null
      });
    }

    return record;
  }

  /**
   * Store calculation result
   */
  async _storeCalculationResult(record, indicatorData, startTime) {
    const duration = Date.now() - startTime;
    
    const updateData = {
      total: indicatorData.TOTAL || 0,
      male_0_14: indicatorData.Male_0_14 || 0,
      female_0_14: indicatorData.Female_0_14 || 0,
      male_over_14: indicatorData.Male_over_14 || 0,
      female_over_14: indicatorData.Female_over_14 || 0,
      calculation_status: 'completed',
      calculation_completed_at: new Date(),
      calculation_duration_ms: duration,
      last_updated: new Date()
    };

    await record.update(updateData);
    
    return {
      ...record.toJSON(),
      ...updateData
    };
  }

  /**
   * Update calculation record with error
   */
  async _updateCalculationRecord(indicatorId, siteCode, period, status, duration, errorMessage) {
    const whereClause = {
      indicator_id: indicatorId,
      site_code: siteCode,
      period_type: period.periodType,
      period_year: period.periodYear
    };

    if (period.periodQuarter) {
      whereClause.period_quarter = period.periodQuarter;
    }
    if (period.periodMonth) {
      whereClause.period_month = period.periodMonth;
    }

    await AnalyticsIndicator.update({
      calculation_status: status,
      calculation_completed_at: new Date(),
      calculation_duration_ms: duration,
      error_message: errorMessage,
      last_updated: new Date()
    }, { where: whereClause });
  }

  /**
   * Get indicator name by ID
   */
  _getIndicatorName(indicatorId) {
    const indicatorNames = {
      '1': 'Active ART patients in previous quarter',
      '2': 'Active Pre-ART patients in previous quarter',
      '3': 'Newly Enrolled',
      '4': 'Re-tested positive',
      '5': 'Newly Initiated',
      '5.1.1': 'New ART started: Same day',
      '5.1.2': 'New ART started: 1-7 days',
      '5.1.3': 'New ART started: >7 days',
      '5.2': 'New ART started with TLD',
      '6': 'Transfer-in patients',
      '7': 'Lost and Return',
      '8': 'TPT Start (new start)',
      '8.2': 'Dead',
      '8.3': 'Lost to follow up (LTFU)',
      '8.4': 'Transfer-out',
      '9': 'Active Pre-ART',
      '10': 'Active ART patients in this quarter',
      '10.1': 'Eligible MMD',
      '10.2': 'MMD',
      '10.3': 'TLD',
      '10.4': 'TPT Start',
      '10.5': 'TPT Complete',
      '10.6': 'Eligible for VL test',
      '10.7': 'VL tested in 12M',
      '10.8': 'VL suppression'
    };
    
    return indicatorNames[indicatorId] || `Indicator ${indicatorId}`;
  }

  /**
   * Batch calculate indicators for multiple sites and periods
   */
  async batchCalculate(requests) {
    const results = [];
    const errors = [];

    for (const request of requests) {
      try {
        const result = await this.calculateIndicator(
          request.indicatorId,
          request.siteCode,
          request.period,
          request.options
        );
        results.push(result);
      } catch (error) {
        errors.push({
          request,
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  /**
   * Get analytics data for reporting
   */
  async getAnalyticsData(filters = {}) {
    const whereClause = {
      calculation_status: 'completed'
    };

    if (filters.indicatorId) {
      whereClause.indicator_id = filters.indicatorId;
    }
    if (filters.siteCode) {
      whereClause.site_code = filters.siteCode;
    }
    if (filters.periodType) {
      whereClause.period_type = filters.periodType;
    }
    if (filters.periodYear) {
      whereClause.period_year = filters.periodYear;
    }
    if (filters.periodQuarter) {
      whereClause.period_quarter = filters.periodQuarter;
    }
    if (filters.periodMonth) {
      whereClause.period_month = filters.periodMonth;
    }

    return await AnalyticsIndicator.findAll({
      where: whereClause,
      order: [
        ['indicator_id', 'ASC'],
        ['site_code', 'ASC'],
        ['period_year', 'DESC'],
        ['period_quarter', 'DESC'],
        ['period_month', 'DESC']
      ]
    });
  }

  /**
   * Get pre-calculated indicator data for a specific period and site
   */
  async getIndicatorData(indicatorId, siteCode, period) {
    try {
      const record = await AnalyticsIndicator.findOne({
        where: {
          indicator_id: indicatorId,
          site_code: siteCode,
          period_type: period.periodType,
          period_year: period.periodYear,
          period_quarter: period.periodQuarter,
          period_month: period.periodMonth,
          calculation_status: 'completed'
        }
      });

      if (record) {
        // Construct the value object from individual fields
        const value = {
          Indicator: record.indicator_name,
          TOTAL: record.total,
          Male_0_14: record.male_0_14,
          Female_0_14: record.female_0_14,
          Male_over_14: record.male_over_14,
          Female_over_14: record.female_over_14
        };
        
        return {
          success: true,
          data: value,
          fromCache: true,
          calculatedAt: record.calculation_completed_at
        };
      }

      return {
        success: false,
        data: null,
        fromCache: false,
        message: 'No pre-calculated data found'
      };
    } catch (error) {
      console.error('[Analytics] Error retrieving indicator data:', error);
      return {
        success: false,
        data: null,
        fromCache: false,
        error: error.message
      };
    }
  }

  /**
   * Get all indicators for a specific period and site
   */
  async getAllIndicatorsForPeriod(siteCode, period) {
    try {
      const records = await AnalyticsIndicator.findAll({
        where: {
          site_code: siteCode,
          period_type: period.periodType,
          period_year: period.periodYear,
          period_quarter: period.periodQuarter,
          period_month: period.periodMonth,
          calculation_status: 'completed'
        },
        order: [['indicator_id', 'ASC']]
      });

      const indicators = {};
      records.forEach(record => {
        // Construct the value object from individual fields
        const value = {
          Indicator: record.indicator_name,
          TOTAL: record.total,
          Male_0_14: record.male_0_14,
          Female_0_14: record.female_0_14,
          Male_over_14: record.male_over_14,
          Female_over_14: record.female_over_14
        };
        indicators[record.indicator_id] = value;
      });

      return {
        success: true,
        data: indicators,
        fromCache: true,
        count: records.length,
        calculatedAt: records.length > 0 ? records[0].calculatedAt : null
      };
    } catch (error) {
      console.error('[Analytics] Error retrieving all indicators:', error);
      return {
        success: false,
        data: {},
        fromCache: false,
        error: error.message
      };
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  async getAnalyticsSummary() {
    try {
      // Use raw SQL query to get counts by status
      const [results] = await sequelize.query(`
        SELECT 
          calculation_status,
          COUNT(*) as count
        FROM analytics_indicators 
        GROUP BY calculation_status
      `);

      // Initialize counts
      let completedRecords = 0;
      let failedRecords = 0;
      let pendingRecords = 0;
      let calculatingRecords = 0;

      // Process results
      results.forEach(row => {
        switch (row.calculation_status) {
          case 'completed':
            completedRecords = parseInt(row.count);
            break;
          case 'failed':
            failedRecords = parseInt(row.count);
            break;
          case 'pending':
            pendingRecords = parseInt(row.count);
            break;
          case 'calculating':
            calculatingRecords = parseInt(row.count);
            break;
        }
      });

      const totalRecords = completedRecords + failedRecords + pendingRecords + calculatingRecords;

      // Get last updated timestamp
      const [lastUpdatedResult] = await sequelize.query(`
        SELECT last_updated 
        FROM analytics_indicators 
        ORDER BY last_updated DESC 
        LIMIT 1
      `);

      const summary = {
        totalRecords,
        completedRecords,
        failedRecords,
        pendingRecords,
        calculatingRecords,
        successRate: totalRecords > 0 ? (completedRecords / totalRecords * 100).toFixed(2) : 0,
        lastUpdated: lastUpdatedResult[0]?.last_updated
      };

      return summary;
    } catch (error) {
      console.error('[Analytics] Error getting summary:', error);
      return {
        totalRecords: 0,
        completedRecords: 0,
        failedRecords: 0,
        pendingRecords: 0,
        calculatingRecords: 0,
        successRate: 0,
        lastUpdated: null
      };
    }
  }
}

module.exports = new AnalyticsEngine();
