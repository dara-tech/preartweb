const express = require('express');
const router = express.Router();
const analyticsEngine = require('../services/analyticsEngine');
const { getCanonicalIndicatorLabel } = require('../config/nchadsIndicatorRegistry');
const { sequelize } = require('../config/database');
const { Server } = require('socket.io');
const http = require('http');
const { authenticateToken } = require('../middleware/auth');
const {
  runEtl,
  runEtlMulti,
  querySummary,
  queryCountryRollup,
  queryProvinceRollup,
  getEtlHistory,
  getLastRefreshed,
  ensureAnalyticsTables,
  getEtlProgress,
  clearPeriodAnalytics,
  truncateAnalyticsTable
} = require('../services/analyticsEtlService');

let etlRunning = false;

function parsePeriodQuery(query) {
  const periodType = String(query.periodType || 'quarter').toLowerCase();
  const year = String(query.year || new Date().getFullYear());
  const quarter = String(query.quarter || Math.floor(new Date().getMonth() / 3) + 1);
  const month = String(query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  // Derive period label for queries
  let periodLabel;
  if (periodType === 'quarter') periodLabel = `${year}-Q${quarter}`;
  else if (periodType === 'month') periodLabel = month;
  else periodLabel = year;

  return { periodType, year, quarter, month, periodLabel };
}

/**
 * GET /analytics/summary
 * Get analytics engine summary
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await analyticsEngine.getAnalyticsSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Failed to get analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics summary',
      message: error.message
    });
  }
});

/**
 * GET /analytics/data
 * Get analytics data with filters
 */
router.get('/data', async (req, res) => {
  try {
    const filters = {
      indicatorId: req.query.indicatorId,
      siteCode: req.query.siteCode,
      periodType: req.query.periodType || 'quarterly',
      periodYear: req.query.periodYear ? parseInt(req.query.periodYear) : undefined,
      periodQuarter: req.query.periodQuarter ? parseInt(req.query.periodQuarter) : undefined,
      periodMonth: req.query.periodMonth ? parseInt(req.query.periodMonth) : undefined
    };

    const data = await analyticsEngine.getAnalyticsData(filters);
    
    res.json({
      success: true,
      data: data,
      count: data.length,
      filters: filters
    });
  } catch (error) {
    console.error('Failed to get analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data',
      message: error.message
    });
  }
});

/**
 * POST /analytics/calculate
 * Calculate and store indicator values
 */
router.post('/calculate', async (req, res) => {
  try {
    const { indicatorId, siteCode, period, options = {} } = req.body;

    if (!indicatorId || !siteCode || !period) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'indicatorId, siteCode, and period are required'
      });
    }

    const result = await analyticsEngine.calculateIndicator(indicatorId, siteCode, period, options);
    
    res.json({
      success: true,
      data: result,
      message: 'Indicator calculated successfully'
    });
  } catch (error) {
    console.error('Failed to calculate indicator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate indicator',
      message: error.message
    });
  }
});

/**
 * POST /analytics/batch-calculate
 * Batch calculate multiple indicators
 */
router.post('/batch-calculate', async (req, res) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'requests must be a non-empty array'
      });
    }

    const { results, errors } = await analyticsEngine.batchCalculate(requests);
    
    res.json({
      success: true,
      data: {
        results,
        errors,
        total: requests.length,
        successful: results.length,
        failed: errors.length
      },
      message: `Batch calculation completed: ${results.length} successful, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Failed to batch calculate indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch calculate indicators',
      message: error.message
    });
  }
});

/**
 * GET /analytics/indicators/fast
 * Fast indicator retrieval using analytics data
 */
router.get('/indicators/fast', async (req, res) => {
  try {
    const {
      indicatorId,
      siteCode,
      periodType = 'quarterly',
      periodYear,
      periodQuarter,
      periodMonth,
      startDate,
      endDate,
      previousEndDate
    } = req.query;

    // If we have analytics data, use it
    if (indicatorId && siteCode && periodYear) {
      const filters = {
        indicatorId,
        siteCode,
        periodType,
        periodYear: parseInt(periodYear),
        periodQuarter: periodQuarter ? parseInt(periodQuarter) : undefined,
        periodMonth: periodMonth ? parseInt(periodMonth) : undefined
      };

      const analyticsData = await analyticsEngine.getAnalyticsData(filters);
      
      if (analyticsData.length > 0) {
        // Transform analytics data to match expected format
        const transformedData = analyticsData.map(record => ({
          Indicator: getCanonicalIndicatorLabel(record.indicator_id, record.indicator_name),
          TOTAL: record.total,
          Male_0_14: record.male_0_14,
          Female_0_14: record.female_0_14,
          Male_over_14: record.male_over_14,
          Female_over_14: record.female_over_14,
          site_code: record.site_code,
          site_name: record.site_name,
          period: {
            type: record.period_type,
            year: record.period_year,
            quarter: record.period_quarter,
            month: record.period_month,
            start_date: record.start_date,
            end_date: record.end_date,
            previous_end_date: record.previous_end_date
          },
          calculated_at: record.calculation_completed_at,
          data_source: 'analytics'
        }));

        return res.json({
          success: true,
          data: transformedData,
          count: transformedData.length,
          data_source: 'analytics',
          performance: {
            executionTime: 0, // Analytics data is instant
            recordCount: transformedData.length,
            sitesProcessed: 1,
            successfulSites: 1
          }
        });
      }
    }

    // Fallback to regular calculation if no analytics data
    res.status(404).json({
      success: false,
      error: 'No analytics data available',
      message: 'Analytics data not found for the requested parameters. Use regular calculation endpoint.',
      fallback_endpoint: '/apiv1/indicators-optimized/all'
    });
  } catch (error) {
    console.error('Failed to get fast indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fast indicators',
      message: error.message
    });
  }
});

/**
 * GET /analytics/health
 * Health check for analytics engine
 */
router.get('/health', async (req, res) => {
  try {
    const summary = await analyticsEngine.getAnalyticsSummary();
    const isHealthy = summary.failedRecords < summary.totalRecords * 0.1; // Less than 10% failed
    
    res.json({
      success: true,
      healthy: isHealthy,
      data: {
        ...summary,
        status: isHealthy ? 'healthy' : 'degraded'
      }
    });
  } catch (error) {
    console.error('Analytics health check failed:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Analytics engine health check failed',
      message: error.message
    });
  }
});

/**
 * Enable analytics engine
 */
router.post('/enable', (req, res) => {
  try {
    analyticsEngine.enable();
    res.json({
      success: true,
      message: 'Analytics engine enabled',
      enabled: true
    });
  } catch (error) {
    console.error('Failed to enable analytics engine:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Disable analytics engine
 */
router.post('/disable', (req, res) => {
  try {
    analyticsEngine.disable();
    res.json({
      success: true,
      message: 'Analytics engine disabled',
      enabled: false
    });
  } catch (error) {
    console.error('Failed to disable analytics engine:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Run yearly analytics for a specific year with real-time logging
 */
router.post('/run-yearly', async (req, res) => {
  try {
    const { year, siteCode } = req.body;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'Year is required'
      });
    }

    if (year < 2020 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        error: 'Year must be between 2020 and ' + (new Date().getFullYear() + 1)
      });
    }

    // Return immediately and run in background
    res.json({
      success: true,
      message: `Yearly analytics started for ${year}`,
      data: { year, siteCode, status: 'running' }
    });

    // Run analytics with real-time logging in background
    setImmediate(async () => {
      try {
        const results = await analyticsEngine.runYearlyAnalyticsWithLogging(year, siteCode, (log) => {
          // Emit log to connected clients via WebSocket
          if (global.io) {
            global.io.emit('analytics-log', {
              timestamp: new Date().toISOString(),
              level: log.level || 'info',
              message: log.message,
              data: log.data || {}
            });
          }
          // Also log to console
          console.log(`[Analytics Log] ${log.message}`);
        });
        
        // Emit completion event
        if (global.io) {
          global.io.emit('analytics-complete', {
            timestamp: new Date().toISOString(),
            results: results
          });
        }
      } catch (error) {
        // Emit error event
        if (global.io) {
          global.io.emit('analytics-error', {
            timestamp: new Date().toISOString(),
            error: error.message
          });
        }
        console.error('Background yearly analytics failed:', error);
      }
    });
  } catch (error) {
    console.error('Yearly analytics failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pre-calculated indicator data
 */
router.get('/indicator/:indicatorId/:siteCode', async (req, res) => {
  try {
    const { indicatorId, siteCode } = req.params;
    const { periodType, periodYear, periodQuarter, periodMonth } = req.query;
    
    if (!periodType || !periodYear) {
      return res.status(400).json({
        success: false,
        error: 'periodType and periodYear are required'
      });
    }

    const period = {
      periodType,
      periodYear: parseInt(periodYear),
      periodQuarter: periodQuarter ? parseInt(periodQuarter) : null,
      periodMonth: periodMonth ? parseInt(periodMonth) : null
    };

    const result = await analyticsEngine.getIndicatorData(indicatorId, siteCode, period);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get indicator data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all pre-calculated indicators for a period and site
 */
router.get('/indicators/:siteCode', async (req, res) => {
  try {
    const { siteCode } = req.params;
    const { periodType, periodYear, periodQuarter, periodMonth } = req.query;
    
    if (!periodType || !periodYear) {
      return res.status(400).json({
        success: false,
        error: 'periodType and periodYear are required'
      });
    }

    const period = {
      periodType,
      periodYear: parseInt(periodYear),
      periodQuarter: periodQuarter ? parseInt(periodQuarter) : null,
      periodMonth: periodMonth ? parseInt(periodMonth) : null
    };

    const result = await analyticsEngine.getAllIndicatorsForPeriod(siteCode, period);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to get indicators data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /analytics/sites
 * Get unique sites from analytics_indicators table
 */
router.get('/sites', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT site_code, site_name 
      FROM preart_sites_registry.analytics_indicators 
      WHERE site_code IS NOT NULL AND site_name IS NOT NULL
      ORDER BY site_code
    `;
    
    const [results] = await sequelize.query(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Failed to get analytics sites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics sites',
      message: error.message
    });
  }
});

/**
 * GET /analytics/indicators
 * Get unique indicators from analytics_indicators table
 */
router.get('/indicators', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT indicator_id, indicator_name 
      FROM preart_sites_registry.analytics_indicators 
      WHERE indicator_id IS NOT NULL AND indicator_name IS NOT NULL
      ORDER BY CAST(indicator_id AS DECIMAL(10,1))
    `;
    
    const [results] = await sequelize.query(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Failed to get analytics indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics indicators',
      message: error.message
    });
  }
});

/**
 * GET /analytics/years
 * Get unique years from analytics_indicators table
 */
router.get('/years', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT period_year 
      FROM preart_sites_registry.analytics_indicators 
      WHERE period_year IS NOT NULL
      ORDER BY period_year DESC
    `;
    
    const [results] = await sequelize.query(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Failed to get analytics years:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics years',
      message: error.message
    });
  }
});

/**
 * POST /analytics/clear-cache
 * Clear all cached analytics data
 */
router.post('/clear-cache', async (req, res) => {
  try {
    // Clear analytics_indicators table
    await sequelize.query('DELETE FROM preart_sites_registry.analytics_indicators');
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// ─── GET /apiv1/analytics/status ─────────────────────────────────────────────
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    await ensureAnalyticsTables();

    const lastRefreshed = await getLastRefreshed(periodLabel);
    const history = await getEtlHistory({ limit: 5 });
    const progress = getEtlProgress();

    res.json({
      success: true,
      periodLabel,
      periodType,
      lastRefreshed,
      hasData: Boolean(lastRefreshed),
      etlRunning,
      etlProgress: progress,
      recentHistory: history
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/country ─────────────────────────────────────────────
router.get('/country', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    const rows = await queryCountryRollup({ periodLabel, periodType });
    const lastRefreshed = await getLastRefreshed(periodLabel);

    res.json({
      success: true,
      data: rows,
      meta: {
        periodLabel,
        periodType,
        lastRefreshed,
        rowCount: rows.length
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/province ────────────────────────────────────────────
router.get('/province', authenticateToken, async (req, res) => {
  try {
    const { periodLabel, periodType } = parsePeriodQuery(req.query);
    const rows = await queryProvinceRollup({ periodLabel, periodType });
    const lastRefreshed = await getLastRefreshed(periodLabel);

    res.json({
      success: true,
      data: rows,
      meta: {
        periodLabel,
        periodType,
        lastRefreshed,
        rowCount: rows.length
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── GET /apiv1/analytics/etl-history ─────────────────────────────────────────
router.get('/etl-history', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const history = await getEtlHistory({ limit });
    res.json({ success: true, data: history });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── POST /apiv1/analytics/refresh ────────────────────────────────────────────
router.post('/refresh', authenticateToken, async (req, res) => {
  if (etlRunning) {
    return res.status(409).json({
      success: false,
      error: 'ETL is already running. Please wait for it to finish.'
    });
  }

  const body = req.body || req.query;
  const periods = Array.isArray(body.periods) ? body.periods : null;

  if (periods && periods.length > 0) {
    res.json({
      success: true,
      message: `ETL started for ${periods.length} period(s): ${periods.slice(0, 4).join(', ')}${periods.length > 4 ? '...' : ''}. Check /analytics/status for progress.`,
      periods
    });

    etlRunning = true;
    runEtlMulti({ periodKeys: periods, triggeredBy: 'manual' })
      .then((result) => {
        console.log(`[Analytics] Multi ETL completed: ${result.totalRows} rows across ${result.results.length} periods`);
      })
      .catch((e) => {
        console.error(`[Analytics] Multi ETL failed: ${e.message}`);
      })
      .finally(() => {
        etlRunning = false;
      });
  } else {
    const { periodType, year, quarter, month, periodLabel } = parsePeriodQuery(body);

    if (periodType === 'year') {
      const quarterKeys = [`${year}-Q1`, `${year}-Q2`, `${year}-Q3`, `${year}-Q4`];

      res.json({
        success: true,
        message: `Year ${year} expanded to 4 quarters: ${quarterKeys.join(', ')}. ETL started. Check /analytics/status for progress.`,
        periods: quarterKeys,
        periodType: 'quarter'
      });

      etlRunning = true;
      runEtlMulti({ periodKeys: quarterKeys, triggeredBy: 'manual' })
        .then((result) => {
          console.log(`[Analytics] Year ETL (${year}) completed: ${result.totalRows} rows across ${result.results.length} quarters`);
        })
        .catch((e) => {
          console.error(`[Analytics] Year ETL (${year}) failed: ${e.message}`);
        })
        .finally(() => {
          etlRunning = false;
        });

    } else {
      res.json({
        success: true,
        message: `ETL started for ${periodLabel}. Check /analytics/status for progress.`,
        periodLabel,
        periodType
      });

      etlRunning = true;
      runEtl({ periodType, year, quarter, month, triggeredBy: 'manual' })
        .then((result) => {
          console.log(`[Analytics] ETL completed: ${result.rowCount} rows for ${result.periodLabel}`);
        })
        .catch((e) => {
          console.error(`[Analytics] ETL failed: ${e.message}`);
        })
        .finally(() => {
          etlRunning = false;
        });
    }
  }
});

// ─── POST /apiv1/analytics/clear ─────────────────────────────────────────────
router.post('/clear', authenticateToken, async (req, res) => {
  try {
    const { clearAll } = req.body || req.query || {};
    const isClearAll = clearAll === true || clearAll === 'true' || clearAll === 1 || clearAll === '1';

    if (isClearAll) {
      await truncateAnalyticsTable();
      return res.json({
        success: true,
        message: 'Successfully cleared all analytics data from the warehouse.'
      });
    } else {
      const { periodLabel, periodType } = parsePeriodQuery(req.body || req.query);
      await clearPeriodAnalytics({ periodLabel, periodType });
      return res.json({
        success: true,
        message: `Successfully cleared analytics data for ${periodLabel}.`,
        periodLabel,
        periodType
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
