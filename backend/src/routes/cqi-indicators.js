const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');
const cqiIndicatorService = require('../services/cqiIndicatorService');
const cqiValidationService = require('../services/cqiValidationService');
const cqiSchedulerService = require('../services/cqiSchedulerService');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

// ===================================================================
// CQI Indicator Data Management Routes
// ===================================================================

/**
 * @route DELETE /apiv1/cqi-indicators/reset
 * @desc Reset/clear all CQI indicators (optionally for specific site)
 * @access Admin only
 */
router.delete('/reset',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { siteId = null } = req.query;
      
      console.log('🗑️ Resetting indicators for site:', siteId || 'ALL');
      
      // Clear indicators from cqi_indicator table
      let deleteQuery, replacements;
      
      if (siteId) {
        deleteQuery = `DELETE FROM cqi_indicator WHERE site_id = ?`;
        replacements = [siteId];
      } else {
        deleteQuery = `TRUNCATE TABLE cqi_indicator`;
        replacements = [];
      }
      
      const result = await sequelize.query(deleteQuery, {
        replacements,
        type: QueryTypes.DELETE
      });
      
      // Reset auto-increment if truncating all
      if (!siteId) {
        await sequelize.query('ALTER TABLE cqi_indicator AUTO_INCREMENT = 1', {
          type: QueryTypes.RAW
        });
      }
      
      console.log('✅ Indicators reset successfully');
      
      res.json({
        success: true,
        message: siteId 
          ? `CQI indicators cleared for site ${siteId}` 
          : 'All CQI indicators cleared and auto-increment reset to 1',
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to reset CQI indicators:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset CQI indicators',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/populate
 * @desc Populate CQI indicator data for a specific period
 * @access Admin only
 */
router.post('/populate', 
  authenticateToken, 
  requireRole(['admin', 'super_admin']),
  [
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('siteId').optional().isString().withMessage('Site ID must be a string'),
    body('deadCode').optional().isInt({ min: 0 }).withMessage('Dead code must be a positive integer'),
    body('lostCode').optional().isInt({ min: 0 }).withMessage('Lost code must be a positive integer'),
    body('transferInCode').optional().isInt({ min: 0 }).withMessage('Transfer in code must be a positive integer'),
    body('transferOutCode').optional().isInt({ min: 0 }).withMessage('Transfer out code must be a positive integer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        startDate,
        endDate,
        siteId = null,
        deadCode = 4,
        lostCode = 3,
        transferInCode = 1,
        transferOutCode = 2
      } = req.body;

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'Start date must be before end date'
        });
      }

      // Validate site if provided
      if (siteId) {
        const siteInfo = await siteDatabaseManager.getSiteInfo(siteId);
        if (!siteInfo) {
          return res.status(404).json({
            success: false,
            error: 'Site not found'
          });
        }
      }

      const result = await cqiIndicatorService.populateAllIndicators({
        startDate,
        endDate,
        siteId,
        deadCode,
        lostCode,
        transferInCode,
        transferOutCode
      });

      res.json({
        success: true,
        message: 'CQI indicators populated successfully',
        data: result,
        period: { startDate, endDate },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to populate CQI indicators:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to populate CQI indicators',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/summary
 * @desc Get summary data for all indicators for a specific period
 * @access Authenticated users
 */
router.get('/summary',
  authenticateToken,
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiIndicatorService.getAllIndicatorsSummary({
        startDate,
        endDate,
        siteId
      });

      res.json({
        success: true,
        data: result,
        count: result.length,
        period: { startDate, endDate },
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get CQI indicators summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get CQI indicators summary',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/:indicatorCode/summary
 * @desc Get summary data for a specific indicator
 * @access Authenticated users
 */
router.get('/:indicatorCode/summary',
  authenticateToken,
  [
    param('indicatorCode').isString().withMessage('Indicator code must be a string'),
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { indicatorCode } = req.params;
      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiIndicatorService.getIndicatorSummary({
        indicatorCode,
        startDate,
        endDate,
        siteId
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Indicator data not found for the specified period'
        });
      }

      res.json({
        success: true,
        data: result,
        period: { startDate, endDate },
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get indicator summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get indicator summary',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/:indicatorCode/details
 * @desc Get patient-level detail data for a specific indicator
 * @access Authenticated users
 */
router.get('/:indicatorCode/details',
  authenticateToken,
  [
    param('indicatorCode').isString().withMessage('Indicator code must be a string'),
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { indicatorCode } = req.params;
      const { 
        startDate, 
        endDate, 
        siteId = null, 
        page = 1, 
        limit = 50, 
        search = '' 
      } = req.query;

      const result = await cqiIndicatorService.getIndicatorDetails({
        indicatorCode,
        startDate,
        endDate,
        siteId,
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        period: { startDate, endDate },
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get indicator details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get indicator details',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/:indicatorCode/demographics
 * @desc Get demographic breakdown for a specific indicator
 * @access Authenticated users
 */
router.get('/:indicatorCode/demographics',
  authenticateToken,
  [
    param('indicatorCode').isString().withMessage('Indicator code must be a string'),
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { indicatorCode } = req.params;
      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiIndicatorService.getIndicatorDemographics({
        indicatorCode,
        startDate,
        endDate,
        siteId
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Indicator demographic data not found for the specified period'
        });
      }

      res.json({
        success: true,
        data: result,
        period: { startDate, endDate },
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get indicator demographics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get indicator demographics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/:indicatorCode/trend
 * @desc Get trend data for a specific indicator across multiple periods
 * @access Authenticated users
 */
router.post('/:indicatorCode/trend',
  authenticateToken,
  [
    param('indicatorCode').isString().withMessage('Indicator code must be a string'),
    body('periods').isArray({ min: 1 }).withMessage('Periods must be a non-empty array'),
    body('periods.*.startDate').isISO8601().withMessage('Each period must have a valid start date'),
    body('periods.*.endDate').isISO8601().withMessage('Each period must have a valid end date'),
    body('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { indicatorCode } = req.params;
      const { periods, siteId = null } = req.body;

      const result = await cqiIndicatorService.getIndicatorTrend({
        indicatorCode,
        periods,
        siteId
      });

      res.json({
        success: true,
        data: result,
        periods,
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get indicator trend:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get indicator trend',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /apiv1/cqi-indicators/:indicatorCode/performance
 * @desc Calculate indicator performance against targets
 * @access Authenticated users
 */
router.post('/:indicatorCode/performance',
  authenticateToken,
  [
    param('indicatorCode').isString().withMessage('Indicator code must be a string'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('targetPercentage').isFloat({ min: 0, max: 100 }).withMessage('Target percentage must be between 0 and 100'),
    body('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { indicatorCode } = req.params;
      const { startDate, endDate, targetPercentage, siteId = null } = req.body;

      const result = await cqiIndicatorService.calculateIndicatorPerformance({
        indicatorCode,
        startDate,
        endDate,
        targetPercentage,
        siteId
      });

      res.json({
        success: true,
        data: result,
        period: { startDate, endDate },
        target: targetPercentage,
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to calculate indicator performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate indicator performance',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/export
 * @desc Export indicator data for reporting
 * @access Authenticated users
 */
router.get('/export',
  authenticateToken,
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string'),
    query('format').optional().isIn(['summary', 'detailed', 'both']).withMessage('Format must be summary, detailed, or both'),
    query('indicators').optional().isString().withMessage('Indicators must be a comma-separated string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { 
        startDate, 
        endDate, 
        siteId = null, 
        format = 'summary',
        indicators = null
      } = req.query;

      const indicatorCodes = indicators ? indicators.split(',').map(i => i.trim()) : null;

      const result = await cqiIndicatorService.exportIndicatorData({
        startDate,
        endDate,
        siteId,
        format,
        indicatorCodes
      });

      // Set appropriate headers for download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="cqi-indicators-${startDate}-to-${endDate}.json"`);

      res.json({
        success: true,
        export_info: {
          period: { startDate, endDate },
          siteId,
          format,
          indicators: indicatorCodes,
          export_date: new Date().toISOString(),
          total_records: Array.isArray(result) ? result.length : (result.summary_data ? result.summary_data.length : 0)
        },
        data: result
      });
    } catch (error) {
      console.error('Failed to export indicator data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export indicator data',
        message: error.message
      });
    }
  }
);

// ===================================================================
// Dashboard and Analytics Routes
// ===================================================================

/**
 * @route GET /apiv1/cqi-indicators/dashboard
 * @desc Get dashboard data with key metrics and trends
 * @access Authenticated users
 */
router.get('/dashboard',
  authenticateToken,
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string'),
    query('compareWith').optional().isISO8601().withMessage('Compare with date must be a valid ISO date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null, compareWith = null } = req.query;

      const result = await cqiIndicatorService.getDashboardData({
        startDate,
        endDate,
        siteId,
        compareWith
      });

      res.json({
        success: true,
        data: result,
        period: { startDate, endDate },
        compareWith,
        siteId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/validation
 * @desc Run all validation checks for data integrity and quality
 * @access Admin only
 */
router.get('/validation',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiValidationService.runAllValidations({
        startDate,
        endDate,
        siteId
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to run validation checks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run validation checks',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/validation/summary
 * @desc Get validation summary for dashboard
 * @access Authenticated users
 */
router.get('/validation/summary',
  authenticateToken,
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiValidationService.getValidationSummary({
        startDate,
        endDate,
        siteId
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get validation summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get validation summary',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/validation/quality-score
 * @desc Get data quality score
 * @access Authenticated users
 */
router.get('/validation/quality-score',
  authenticateToken,
  [
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiValidationService.getDataQualityScore({
        startDate,
        endDate,
        siteId
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get data quality score:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get data quality score',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /apiv1/cqi-indicators/validation/auto-fix
 * @desc Auto-fix certain validation issues
 * @access Admin only
 */
router.post('/validation/auto-fix',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('siteId').optional().isString().withMessage('Site ID must be a string'),
    body('ruleIds').optional().isArray().withMessage('Rule IDs must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { startDate, endDate, siteId = null, ruleIds = [] } = req.body;

      const result = await cqiValidationService.autoFixIssues({
        startDate,
        endDate,
        siteId,
        ruleIds
      });

      res.json({
        success: true,
        data: result,
        message: `Auto-fixed ${result.total_fixed} issues`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to auto-fix validation issues:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-fix validation issues',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/validation/rules/:ruleId
 * @desc Run a specific validation rule
 * @access Admin only
 */
router.get('/validation/rules/:ruleId',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    param('ruleId').isString().withMessage('Rule ID must be a string'),
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { ruleId } = req.params;
      const { startDate, endDate, siteId = null } = req.query;

      const result = await cqiValidationService.runValidationRule(ruleId, {
        startDate,
        endDate,
        siteId
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to run validation rule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run validation rule',
        message: error.message
      });
    }
  }
);

// ===================================================================
// Utility Routes
// ===================================================================

/**
 * @route GET /apiv1/cqi-indicators/indicators
 * @desc Get list of available indicators
 * @access Authenticated users
 */
router.get('/indicators', authenticateToken, async (req, res) => {
  try {
    const indicators = await cqiIndicatorService.getAvailableIndicators();
    
    res.json({
      success: true,
      indicators,
      count: indicators.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get available indicators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available indicators',
      message: error.message
    });
  }
});

/**
 * @route GET /apiv1/cqi-indicators/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await cqiIndicatorService.healthCheck();
    
    res.json({
      success: true,
      status: 'healthy',
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===================================================================
// Scheduler Management Routes
// ===================================================================

/**
 * @route GET /apiv1/cqi-indicators/scheduler/status
 * @desc Get status of all scheduled jobs
 * @access Admin only
 */
router.get('/scheduler/status',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const { jobName } = req.query;
      
      const result = await cqiSchedulerService.getJobStatus(jobName);

      res.json({
        success: true,
        data: result,
        count: result.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get scheduler status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduler status',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /apiv1/cqi-indicators/scheduler/trigger/:jobName
 * @desc Manually trigger a scheduled job
 * @access Admin only
 */
router.post('/scheduler/trigger/:jobName',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  [
    param('jobName').isString().withMessage('Job name must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { jobName } = req.params;

      const result = await cqiSchedulerService.triggerJob(jobName);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to trigger job:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger job',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /apiv1/cqi-indicators/scheduler/restart
 * @desc Restart the scheduler service
 * @access Admin only
 */
router.post('/scheduler/restart',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      await cqiSchedulerService.restart();

      res.json({
        success: true,
        message: 'Scheduler service restarted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to restart scheduler:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restart scheduler',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/cqi-indicators/scheduler/health
 * @desc Check scheduler health
 * @access Admin only
 */
router.get('/scheduler/health',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const jobs = await cqiSchedulerService.getJobStatus();
      const activeJobs = jobs.filter(job => job.is_running).length;
      const recentFailures = jobs.filter(job => 
        job.last_status === 'error' && 
        job.last_run && 
        new Date() - new Date(job.last_run) < 24 * 60 * 60 * 1000 // Last 24 hours
      ).length;

      const health = {
        status: recentFailures > 0 ? 'WARNING' : 'HEALTHY',
        total_jobs: jobs.length,
        active_jobs: activeJobs,
        recent_failures: recentFailures,
        last_check: new Date().toISOString()
      };

      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to check scheduler health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check scheduler health',
        message: error.message
      });
    }
  }
);

module.exports = router;
