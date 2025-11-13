const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const mortalityRetentionIndicators = require('../services/mortalityRetentionIndicators');
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

    const result = await mortalityRetentionIndicators.executeAllIndicators(siteCode, params);
    
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
      timestamp: result.timestamp
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

module.exports = router;
