const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const mortalityRetentionIndicators = require('../services/mortalityRetentionIndicators');
// CQI Analytics Engine removed
const { siteDatabaseManager } = require('../config/siteDatabase');

const router = express.Router();

// Get list of available mortality and retention indicators (must be before /sites/:siteCode)
router.get('/indicators', authenticateToken, async (req, res) => {
  try {
    const indicators = await mortalityRetentionIndicators.getAvailableIndicators();
    
    res.json({
      success: true,
      indicators: indicators,
      count: indicators.length
    });
  } catch (error) {
    console.error('Failed to get mortality retention indicators list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get indicators list',
      message: error.message
    });
  }
});

// Admin endpoints for managing indicator status
// Get all indicators with their status (admin only)
router.get('/admin/indicators', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you may want to add role check middleware)
    const indicators = await mortalityRetentionIndicators.getAvailableIndicators();
    
    res.json({
      success: true,
      indicators: indicators,
      count: indicators.length
    });
  } catch (error) {
    console.error('Failed to get indicator statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get indicator statuses',
      message: error.message
    });
  }
});

// Update indicator status (admin only)
router.put('/admin/indicators/:indicatorId/status', authenticateToken, async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean value'
      });
    }
    
    const result = await mortalityRetentionIndicators.updateIndicatorStatus(indicatorId, is_active);
    
    res.json({
      success: true,
      message: `Indicator ${indicatorId} ${is_active ? 'activated' : 'deactivated'}`,
      data: result
    });
  } catch (error) {
    console.error('Failed to update indicator status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update indicator status',
      message: error.message
    });
  }
});

// Bulk update indicator statuses (admin only)
router.put('/admin/indicators/bulk-status', authenticateToken, async (req, res) => {
  try {
    const { indicators } = req.body;
    
    if (!Array.isArray(indicators)) {
      return res.status(400).json({
        success: false,
        error: 'indicators must be an array of {indicator_id, is_active} objects'
      });
    }
    
    const results = [];
    for (const indicator of indicators) {
      try {
        const result = await mortalityRetentionIndicators.updateIndicatorStatus(
          indicator.indicator_id,
          indicator.is_active
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          indicator_id: indicator.indicator_id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${results.filter(r => r.success).length} indicators`,
      results: results
    });
  } catch (error) {
    console.error('Failed to bulk update indicator statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update indicator statuses',
      message: error.message
    });
  }
});

// Get all mortality and retention indicators for a specific site
router.get('/sites/:siteCode', authenticateToken, async (req, res) => {
  try {
    const { siteCode } = req.params;
    const { startDate, endDate, previousEndDate, useCache = 'true' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: startDate, endDate'
      });
    }

    // Validate site exists
    const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
    if (!siteInfo) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    const params = {
      StartDate: startDate,
      EndDate: endDate,
      PreviousEndDate: previousEndDate || null,
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      mmd_eligible_code: 0,
      mmd_drug_quantity: 60,
      vl_suppression_threshold: 1000,
      tld_regimen_formula: '3TC + DTG + TDF',
      transfer_in_code: 1,
      tpt_drug_list: "'Isoniazid','3HP','6H'"
    };

    // Determine period type and quarter from dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const year = startDateObj.getFullYear();
    const month = startDateObj.getMonth() + 1;
    const quarter = Math.floor((month - 1) / 3) + 1;

    // Check cache first if useCache is true
    const shouldUseCache = useCache === 'true' || useCache === true;
    let cachedResults = [];
    let fromCache = false;

    if (shouldUseCache) {
      try {
        const cacheFilters = {
          siteCode: siteCode,
          periodType: 'quarterly',
          periodYear: year,
          periodQuarter: quarter
        };

        console.log(`[MortalityRetention] Cache disabled - CQI Analytics Engine removed`);
        cachedResults = [];
        console.log(`[MortalityRetention] No cached records available`);

        // Check if we have cached data for this period
        // We match by year, quarter, and site - dates can vary (old cache might have wrong dates from bug)
        // Since we're matching by periodYear and periodQuarter, we trust that the cache is for the correct period
        if (cachedResults.length > 0) {
          // Verify the cached records are for the same quarter period
          // Check that periodYear and periodQuarter match (already filtered in query)
          // Allow date differences since old cache might have wrong dates from the date calculation bug
          const firstRecord = cachedResults[0];
          const cacheStartDate = firstRecord.start_date ? new Date(firstRecord.start_date).toISOString().split('T')[0] : null;
          const cacheEndDate = firstRecord.end_date ? new Date(firstRecord.end_date).toISOString().split('T')[0] : null;
          
          // Since we're already filtering by periodYear and periodQuarter in the query,
          // we can trust the cache is for the correct period even if dates differ
          // (This handles cases where old cache has wrong dates from the date calculation bug)
          fromCache = true;
          if (cacheStartDate !== startDate || cacheEndDate !== endDate) {
            console.log(`[MortalityRetention] ⚠️ Cache dates differ but period matches: cache(${cacheStartDate}-${cacheEndDate}) vs request(${startDate}-${endDate}) - using cache anyway`);
          } else {
            console.log(`[MortalityRetention] ✅ Using cached data (dates match: ${cacheStartDate}-${cacheEndDate})`);
          }
        }
      } catch (error) {
        console.error('[MortalityRetention] Error checking cache:', error);
        cachedResults = [];
      }
    }

    // If we have cached data, transform and return it
    if (fromCache && cachedResults.length > 0) {
      // Map indicator IDs from cache to full indicator IDs
      const indicatorIdMapping = {
        '1': '1_percentage_died',
        '2': '2_percentage_lost_to_followup',
        '3': '3_reengaged_within_28_days',
        '4': '4_reengaged_over_28_days',
        '5A': '5a_late_visits_beyond_buffer',
        '5B': '5b_late_visits_within_buffer',
        '5C': '5c_visits_on_schedule',
        '5D': '5d_early_visits',
        '6A': '6a_same_day_art_initiation',
        '6B': '6b_art_initiation_1_7_days',
        '6C': '6c_art_initiation_over_7_days',
        '7': '7_baseline_cd4_before_art',
        '8A': '8a_cotrimoxazole_prophylaxis',
        '8B': '8b_fluconazole_prophylaxis',
        '9A': '9a_mmd_less_than_3_months',
        '9B': '9b_mmd_3_months',
        '9C': '9c_mmd_4_months',
        '9D': '9d_mmd_5_months',
        '9E': '9e_mmd_6_plus_months',
        '10A': '10a_tld_new_initiation',
        '10B': '10b_tld_cumulative',
        '11A': '11a_tpt_received',
        '11B': '11b_tpt_completed',
        '12A': '12a_vl_testing_coverage',
        '12B': '12b_vl_monitored_six_months',
        '12C': '12c_vl_suppression_12_months',
        '12D': '12d_vl_suppression_overall',
        '12E': '12e_vl_results_10_days',
        '13A': '13a_enhanced_adherence_counseling',
        '13B': '13b_followup_vl_after_counseling',
        '13C': '13c_vl_suppression_after_counseling',
        '14A': '14a_first_line_to_second_line',
        '14B': '14b_second_line_to_third_line',
        '15': '15_retention_rate'
      };

      // Transform cached data to mortality retention format
      // Map ALL standardized fields from database to frontend format
      const transformedResults = cachedResults.map(record => {
        const fullIndicatorId = indicatorIdMapping[record.indicator_id] || record.indicator_id;
        
        // Build the indicator object with ALL standardized fields from database
        // This matches the standardized schema in mortalityRetentionIndicators.js
        const indicator = {
          // Core fields (always present)
          Indicator: record.indicator_name || fullIndicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          TOTAL: Number(record.total || 0),
          Percentage: record.percentage !== null && record.percentage !== undefined ? parseFloat(record.percentage) : 0,
          Male_0_14: Number(record.male_0_14 || 0),
          Female_0_14: Number(record.female_0_14 || 0),
          Male_over_14: Number(record.male_over_14 || 0),
          Female_over_14: Number(record.female_over_14 || 0),
          Children_Total: Number(record.children_total || (Number(record.male_0_14 || 0) + Number(record.female_0_14 || 0))),
          Adults_Total: Number(record.adults_total || (Number(record.male_over_14 || 0) + Number(record.female_over_14 || 0))),
          
          // Denominator fields (standardized fields - default to 0 since not stored in basic schema)
          Total_ART: 0,
          Total_Lost: 0,
          Total_Eligible: 0,
          Total_Visits: 0,
          Total_Newly_Initiated: 0,
          Eligible_Patients: 0,
          
          // Numerator fields (standardized fields - default to 0 since not stored in basic schema)
          Deaths: 0,
          Lost_to_Followup: 0,
          Reengaged_Within_28: 0,
          Reengaged_Over_28: 0,
          Late_Visits_Beyond_Buffer: 0,
          Late_Visits_Within_Buffer: 0,
          Visits_On_Schedule: 0,
          Early_Visits: 0,
          Same_Day_Initiation: 0,
          Initiation_1_7_Days: 0,
          Initiation_Over_7_Days: 0,
          With_Baseline_CD4: 0,
          Receiving_Cotrimoxazole: 0,
          Receiving_Fluconazole: 0,
          TPT_Received: 0,
          TPT_Completed: 0,
          VL_Tested_12M: 0,
          VL_Monitored_6M: 0,
          VL_Suppressed_12M: 0,
          VL_Suppressed_Overall: 0,
          Within_10_Days: 0,
          Received_Counseling: 0,
          Followup_Received: 0,
          Achieved_Suppression: 0,
          Switched_To_Second_Line: 0,
          Switched_To_Third_Line: 0,
          Total_Retained: 0,
          
          // Demographic total fields (default to 0 since not stored in basic schema)
          Male_0_14_Total: 0,
          Female_0_14_Total: 0,
          Male_over_14_Total: 0,
          Female_over_14_Total: 0,
          
          // Additional demographic breakdown fields (default to 0 since not stored in basic schema)
          Male_0_14_Deaths: 0,
          Female_0_14_Deaths: 0,
          Male_over_14_Deaths: 0,
          Female_over_14_Deaths: 0,
          Male_0_14_Lost: 0,
          Female_0_14_Lost: 0,
          Male_over_14_Lost: 0,
          Female_over_14_Lost: 0,
          Male_0_14_Reengaged: 0,
          Female_0_14_Reengaged: 0,
          Male_over_14_Reengaged: 0,
          Female_over_14_Reengaged: 0,
          Male_0_14_Eligible: 0,
          Female_0_14_Eligible: 0,
          Male_over_14_Eligible: 0,
          Female_over_14_Eligible: 0,
          
          // Note: numerator and denominator are no longer stored in the table
          numerator: 0,
          denominator: 0,
        };

        return indicator;
      });

      console.log(`[MortalityRetention] ✅ Returning ${transformedResults.length} indicators from cache`);
      console.log(`[MortalityRetention] Period: ${params.StartDate} to ${params.EndDate}`);

      // Log sample data
      const sampleIndicators = transformedResults.slice(0, 3);
      sampleIndicators.forEach((ind, idx) => {
        console.log(`[MortalityRetention] Sample ${idx + 1}: ${ind.Indicator || 'Unknown'}`);
        console.log(`  - TOTAL: ${ind.TOTAL || 0}`);
        console.log(`  - Percentage: ${ind.Percentage !== null && ind.Percentage !== undefined ? ind.Percentage : 'null'}`);
        console.log(`  - Male_0_14: ${ind.Male_0_14 || 0}, Female_0_14: ${ind.Female_0_14 || 0}`);
        console.log(`  - Male_over_14: ${ind.Male_over_14 || 0}, Female_over_14: ${ind.Female_over_14 || 0}`);
      });

      return res.json({
        success: true,
        site: siteInfo,
        data: transformedResults,
        performance: {
          executionTime: 0, // Cache is instant
          successCount: transformedResults.length,
          errorCount: 0,
          skippedCount: 0,
          activeIndicatorsCount: transformedResults.length,
          totalIndicatorsCount: transformedResults.length,
          averageTimePerIndicator: 0
        },
        period: params,
        timestamp: new Date().toISOString(),
        fromCache: true,
        note: 'Data retrieved from analytics cache'
      });
    }

    // Fall back to on-the-fly calculation
    console.log(`[MortalityRetention] ⚠️ No cache found or useCache=false, calculating on-the-fly...`);
    const result = await mortalityRetentionIndicators.executeAllIndicators(siteCode, params);
    
    // Log sample data for debugging - focus on data matching between cache and fly run
    console.log(`[MortalityRetention] Executed ${result.results.length} indicators for site ${siteCode}`);
    console.log(`[MortalityRetention] Period: ${params.StartDate} to ${params.EndDate}`);
    
    // Log a few sample indicators for verification
    const sampleIndicators = result.results.slice(0, 3);
    sampleIndicators.forEach((ind, idx) => {
      console.log(`[MortalityRetention] Sample ${idx + 1}: ${ind.Indicator || 'Unknown'}`);
      console.log(`  - TOTAL: ${ind.TOTAL || 0}`);
      console.log(`  - Percentage: ${ind.Percentage !== null && ind.Percentage !== undefined ? ind.Percentage : 'null'}`);
      console.log(`  - Male_0_14: ${ind.Male_0_14 || 0}, Female_0_14: ${ind.Female_0_14 || 0}`);
      console.log(`  - Male_over_14: ${ind.Male_over_14 || 0}, Female_over_14: ${ind.Female_over_14 || 0}`);
      
      // Log indicator-specific fields for debugging
      if (ind.Reengaged_Over_28 !== undefined) {
        console.log(`  - Reengaged_Over_28: ${ind.Reengaged_Over_28 || 0}, Total_Lost: ${ind.Total_Lost || 0}`);
      }
      if (ind.Reengaged_Within_28 !== undefined) {
        console.log(`  - Reengaged_Within_28: ${ind.Reengaged_Within_28 || 0}, Total_Lost: ${ind.Total_Lost || 0}`);
      }
    });
    
    res.json({
      success: true,
      site: siteInfo,
      data: result.results,
      performance: {
        executionTime: result.executionTime,
        successCount: result.successCount,
        errorCount: result.errorCount,
        skippedCount: result.skippedCount || 0,
        activeIndicatorsCount: result.activeIndicatorsCount || result.successCount + result.errorCount,
        totalIndicatorsCount: result.totalIndicatorsCount || result.successCount + result.errorCount + (result.skippedCount || 0),
        averageTimePerIndicator: result.averageTimePerIndicator
      },
      period: params,
      timestamp: result.timestamp,
      fromCache: false, // Currently always on-the-fly
      note: 'Data is calculated on-the-fly. Cache integration pending.'
    });
  } catch (error) {
    console.error('Failed to fetch mortality retention indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mortality retention indicators',
      message: error.message
    });
  }
});

// Get indicator details (patient-level) for a specific site
router.get('/sites/:siteCode/indicators/:indicatorId/details', authenticateToken, async (req, res) => {
  try {
    const { siteCode, indicatorId } = req.params;
    const { startDate, endDate, previousEndDate, page = 1, limit = 50, search = '' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: startDate, endDate'
      });
    }

    // Validate site
    const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
    if (!siteInfo) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    const params = {
      StartDate: startDate,
      EndDate: endDate,
      PreviousEndDate: previousEndDate || null,
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      mmd_eligible_code: 0,
      mmd_drug_quantity: 60,
      vl_suppression_threshold: 1000,
      tld_regimen_formula: '3TC + DTG + TDF',
      transfer_in_code: 1,
      tpt_drug_list: "'Isoniazid','3HP','6H'"
    };

    const result = await mortalityRetentionIndicators.executeIndicatorDetails(siteCode, indicatorId, params, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search
    });

    res.json({
      success: true,
      site: siteInfo,
      data: result.data,
      pagination: result.pagination,
      period: params,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Failed to fetch mortality indicator details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch indicator details',
      message: error.message
    });
  }
});

// Get specific mortality and retention indicator for a site
router.get('/sites/:siteCode/indicators/:indicatorId', authenticateToken, async (req, res) => {
  try {
    const { siteCode, indicatorId } = req.params;
    const { startDate, endDate, previousEndDate, useCache = 'true' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: startDate, endDate'
      });
    }

    // Validate site exists
    const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
    if (!siteInfo) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    const params = {
      StartDate: startDate,
      EndDate: endDate,
      PreviousEndDate: previousEndDate || null,
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      mmd_eligible_code: 0,
      mmd_drug_quantity: 60,
      vl_suppression_threshold: 1000,
      tld_regimen_formula: '3TC + DTG + TDF',
      transfer_in_code: 1,
      tpt_drug_list: "'Isoniazid','3HP','6H'"
    };
    
    const result = await mortalityRetentionIndicators.executeIndicator(siteCode, indicatorId, params);
    
    res.json({
      success: true,
      site: siteInfo,
      data: result.data,
      performance: {
        executionTime: result.executionTime
      },
      period: params,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Failed to fetch mortality retention indicator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mortality retention indicator',
      message: error.message
    });
  }
});

// ===================================================================
// Query Editor Admin Routes
// ===================================================================

const fs = require('fs');
const path = require('path');

// Get all mortality retention queries (admin only)
router.get('/admin/queries', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const queriesDir = path.join(__dirname, '../queries/mortality_retention_indicators');
    const files = fs.readdirSync(queriesDir).filter(filename => 
      filename.endsWith('.sql') && !filename.endsWith('_details.sql')
    );

    const queries = files.map(filename => {
      const indicatorId = filename.replace('.sql', '');
      const filePath = path.join(queriesDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        indicatorId,
        filename,
        name: indicatorId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        size: content.length,
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
    });

    res.json({
      success: true,
      queries: queries.sort((a, b) => a.indicatorId.localeCompare(b.indicatorId)),
      count: queries.length
    });
  } catch (error) {
    console.error('Failed to list queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list queries',
      message: error.message
    });
  }
});

// Get specific query content (admin only)
router.get('/admin/queries/:indicatorId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const queriesDir = path.join(__dirname, '../queries/mortality_retention_indicators');
    const filePath = path.join(queriesDir, `${indicatorId}.sql`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Query not found'
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      indicatorId,
      filename: `${indicatorId}.sql`,
      content,
      size: content.length,
      lastModified: stats.mtime.toISOString()
    });
  } catch (error) {
    console.error('Failed to get query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get query',
      message: error.message
    });
  }
});

// Update query content (admin only)
router.put('/admin/queries/:indicatorId', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query content is required'
      });
    }

    const queriesDir = path.join(__dirname, '../queries/mortality_retention_indicators');
    const filePath = path.join(queriesDir, `${indicatorId}.sql`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Query not found'
      });
    }

    // Backup original file
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);

    try {
      // Write new content
      fs.writeFileSync(filePath, content, 'utf8');
      
      // Reload query in service
      mortalityRetentionIndicators.queries.set(indicatorId, content);
      
      const stats = fs.statSync(filePath);

      res.json({
        success: true,
        message: 'Query updated successfully',
        indicatorId,
        backupPath,
        lastModified: stats.mtime.toISOString()
      });
    } catch (writeError) {
      // Restore backup on error
      fs.copyFileSync(backupPath, filePath);
      throw writeError;
    }
  } catch (error) {
    console.error('Failed to update query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update query',
      message: error.message
    });
  }
});

// Execute query with parameters (admin only)
router.post('/admin/queries/:indicatorId/execute', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const { siteCode, startDate, endDate, previousEndDate } = req.body;

    if (!siteCode || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: siteCode, startDate, endDate'
      });
    }

    // Validate site exists
    const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
    if (!siteInfo) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
      });
    }

    const params = {
      StartDate: startDate,
      EndDate: endDate,
      PreviousEndDate: previousEndDate || null,
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      mmd_eligible_code: 0,
      mmd_drug_quantity: 60,
      vl_suppression_threshold: 1000,
      tld_regimen_formula: '3TC + DTG + TDF',
      transfer_in_code: 1,
      tpt_drug_list: "'Isoniazid','3HP','6H'"
    };

    const result = await mortalityRetentionIndicators.executeIndicatorRaw(siteCode, indicatorId, params);

    res.json({
      success: true,
      site: siteInfo,
      indicatorId,
      data: result.data,
      executionTime: result.executionTime,
      period: params,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('Failed to execute query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute query',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
