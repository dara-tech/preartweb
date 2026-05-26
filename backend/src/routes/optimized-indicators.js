const express = require('express');
const optimizedIndicators = require('../services/optimizedIndicators');
const siteOptimizedIndicators = require('../services/siteOptimizedIndicators');
const analyticsEngine = require('../services/analyticsEngine');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { performance } = require('perf_hooks');
const timeoutHandler = require('../middleware/timeoutHandler');
const { injectIndicator9IntoDataArray } = require('../config/nchadsIndicatorRegistry');
const router = express.Router();

// Simple request deduplication
const pendingRequests = new Map();

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - startTime;
    console.log(`📊 ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
  });
  
  next();
};

router.use(performanceMonitor);
router.use(timeoutHandler(120000)); // 2 minute timeout for indicators

// Helper function to determine period from dates
function determinePeriodFromDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const year = start.getFullYear();
  const month = start.getMonth() + 1; // JavaScript months are 0-based
  
  // Determine quarter based on month
  let quarter = null;
  if (month >= 1 && month <= 3) quarter = 1;
  else if (month >= 4 && month <= 6) quarter = 2;
  else if (month >= 7 && month <= 9) quarter = 3;
  else if (month >= 10 && month <= 12) quarter = 4;
  
  return {
    periodType: 'quarterly',
    periodYear: year,
    periodQuarter: quarter,
    periodMonth: null
  };
}

// Get all indicators (optimized)
router.get('/all', async (req, res) => {
  try {
    const { startDate, endDate, previousEndDate, siteCode } = req.query;
    
    const params = {
      startDate: startDate || '2025-01-01',
      endDate: endDate || '2025-03-31',
      previousEndDate: previousEndDate || '2024-12-31',
      siteCode: siteCode || null
    };

    // Create a unique key for this request
    const requestKey = `all:${JSON.stringify(params)}`;
    
    // Check if there's already a pending request for the same parameters
    if (pendingRequests.has(requestKey)) {
      const existingPromise = pendingRequests.get(requestKey);
      
      try {
        const result = await existingPromise;
        return res.json(result);
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Request failed',
          message: error.message
        });
      }
    }

    // Create a new promise for this request
    const requestPromise = (async () => {
    try {
      const startTime = performance.now();
      
      // Determine period type and parameters for analytics
      const period = determinePeriodFromDates(params.startDate, params.endDate);
      
      // Try to get data from analytics first
      if (params.siteCode) {
        // Single site - try analytics first
        const analyticsResult = await analyticsEngine.getAllIndicatorsForPeriod(params.siteCode, period);
        
        if (analyticsResult.success && analyticsResult.count > 0) {
          console.log(`📊 Using analytics data for site ${params.siteCode} (${analyticsResult.count} indicators)`);
          
          // Convert analytics data to expected format
          const results = injectIndicator9IntoDataArray(Object.values(analyticsResult.data));
          
          return {
            success: true,
            data: results,
            performance: {
              executionTime: performance.now() - startTime,
              successCount: results.length,
              errorCount: 0
            },
            siteCode: params.siteCode,
            fromCache: true,
            analyticsData: true,
            calculatedAt: analyticsResult.calculatedAt
          };
        }
        
        // Fallback to database query
        console.log(`📊 No analytics data found for site ${params.siteCode}, using database query`);
      } else {
        // All sites - try analytics first
        const { Site } = require('../models');
        const sites = await Site.findAll({ where: { status: 1 } });
        
        let allAnalyticsData = {};
        let analyticsCount = 0;
        let totalSites = sites.length;
        
        // Check analytics data for each site
        for (const site of sites) {
          const analyticsResult = await analyticsEngine.getAllIndicatorsForPeriod(site.code, period);
          if (analyticsResult.success && analyticsResult.count > 0) {
            allAnalyticsData[site.code] = analyticsResult.data;
            analyticsCount++;
          }
        }
        
        if (analyticsCount === totalSites && analyticsCount > 0) {
          // All sites have analytics data, aggregate it
          console.log(`📊 Using analytics data for all sites (${analyticsCount}/${totalSites})`);
          
          const indicatorMap = new Map();
          
          // Aggregate analytics data
          Object.entries(allAnalyticsData).forEach(([siteCode, siteData]) => {
            Object.values(siteData).forEach(indicatorData => {
              const indicatorName = indicatorData.Indicator;
              
              if (!indicatorMap.has(indicatorName)) {
                indicatorMap.set(indicatorName, {
                  Indicator: indicatorName,
                  TOTAL: 0,
                  Male_0_14: 0,
                  Female_0_14: 0,
                  Male_over_14: 0,
                  Female_over_14: 0,
                  error: null
                });
              }
              
              const aggregated = indicatorMap.get(indicatorName);
              if (indicatorData.error) {
                aggregated.error = indicatorData.error;
              } else {
                aggregated.TOTAL += Number(indicatorData.TOTAL || 0);
                aggregated.Male_0_14 += Number(indicatorData.Male_0_14 || 0);
                aggregated.Female_0_14 += Number(indicatorData.Female_0_14 || 0);
                aggregated.Male_over_14 += Number(indicatorData.Male_over_14 || 0);
                aggregated.Female_over_14 += Number(indicatorData.Female_over_14 || 0);
              }
            });
          });
          
          const aggregatedResults = injectIndicator9IntoDataArray(Array.from(indicatorMap.values()));
          
          return {
            success: true,
            data: aggregatedResults,
            performance: {
              executionTime: performance.now() - startTime,
              successCount: aggregatedResults.length,
              errorCount: 0
            },
            siteCode: 'all',
            fromCache: true,
            analyticsData: true,
            analyticsSites: analyticsCount
          };
        }
        
        // Fallback to database query
        console.log(`📊 Partial analytics data (${analyticsCount}/${totalSites}), using database query`);
      }
      
      // Database query fallback
      let result;
      
      if (params.siteCode) {
        // Use site-specific service when siteCode is provided
        
        // Validate site exists
        const siteInfo = await siteDatabaseManager.getSiteInfo(params.siteCode);
        if (!siteInfo) {
          throw new Error(`Site ${params.siteCode} not found`);
        }
        
        result = await siteOptimizedIndicators.executeAllSiteIndicators(params.siteCode, params, false);
        
        // Transform the result to match the expected format
        result = {
          results: injectIndicator9IntoDataArray(result.results.map(r => r.data || {})),
          executionTime: result.executionTime,
          successCount: result.successCount,
          errorCount: result.errorCount
        };
      } else {
        // Use site-specific service to aggregate across all sites
        const startTime = performance.now();
        
        // Get all sites
        const sites = await siteDatabaseManager.getAllSites();
        
        // Execute indicators for each site and aggregate
        const siteResults = [];
        const indicatorMap = new Map();
        
        for (const site of sites) {
          try {
            const siteResult = await siteOptimizedIndicators.executeAllSiteIndicators(site.code, params, false);
            
            // Process each indicator result from this site
            siteResult.results.forEach(indicatorResult => {
              const indicatorData = indicatorResult.data;
              const indicatorName = indicatorData.Indicator;
              
              if (!indicatorMap.has(indicatorName)) {
                indicatorMap.set(indicatorName, {
                  Indicator: indicatorName,
                  TOTAL: 0,
                  Male_0_14: 0,
                  Female_0_14: 0,
                  Male_over_14: 0,
                  Female_over_14: 0,
                  error: null
                });
              }
              
              const aggregated = indicatorMap.get(indicatorName);
              if (indicatorData.error) {
                aggregated.error = indicatorData.error;
              } else {
                // Ensure all values are converted to numbers before aggregation
                aggregated.TOTAL += Number(indicatorData.TOTAL || 0);
                aggregated.Male_0_14 += Number(indicatorData.Male_0_14 || 0);
                aggregated.Female_0_14 += Number(indicatorData.Female_0_14 || 0);
                aggregated.Male_over_14 += Number(indicatorData.Male_over_14 || 0);
                aggregated.Female_over_14 += Number(indicatorData.Female_over_14 || 0);
              }
            });
            
            siteResults.push({
              siteCode: site.code,
              siteName: site.name,
              success: true,
              indicatorCount: siteResult.results.length
            });
          } catch (error) {
            siteResults.push({
              siteCode: site.code,
              siteName: site.name,
              success: false,
              error: error.message
            });
          }
        }
        
        // Convert map to array
        const aggregatedResults = injectIndicator9IntoDataArray(Array.from(indicatorMap.values()));
        
        result = {
          results: aggregatedResults,
          executionTime: performance.now() - startTime,
          successCount: siteResults.filter(s => s.success).length,
          errorCount: siteResults.filter(s => !s.success).length,
          siteResults: siteResults
        };
      }

      const response = {
        success: true,
        data: result.results,
        performance: {
          executionTime: result.executionTime,
          successCount: result.successCount,
          errorCount: result.errorCount,
          averageTimePerIndicator: result.executionTime / result.results.length
        },
        period: params
      };

      // Remove from pending requests
      pendingRequests.delete(requestKey);
      return response;
      } catch (error) {
        // Remove from pending requests on error
        pendingRequests.delete(requestKey);
        throw error;
      }
    })();

    // Store the promise
    pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch indicators',
        message: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch indicators',
      message: error.message
    });
  }
});

// Get specific indicator (optimized)
router.get('/:indicatorId', async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const { startDate, endDate, previousEndDate, siteCode } = req.query;
    
    const params = {
      startDate: startDate || '2025-01-01',
      endDate: endDate || '2025-03-31',
      previousEndDate: previousEndDate || '2024-12-31',
      siteCode: siteCode || null
    };

    const result = await optimizedIndicators.executeIndicator(indicatorId, params, false); // Disable caching

    res.json({
      success: true,
      data: result[0] || {},
      period: params
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch indicator',
      message: error.message
    });
  }
});

// Get detailed records for specific indicator
router.get('/:indicatorId/details', async (req, res) => {
  const { indicatorId } = req.params;
  
  try {
    const { startDate, endDate, previousEndDate, page = 1, limit = 100, search = '', gender, ageGroup } = req.query;
    
    const params = {
      startDate: startDate || '2025-01-01',
      endDate: endDate || '2025-03-31',
      previousEndDate: previousEndDate || '2024-12-31',
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100000), // Max 100000 records per page for exports
      search: search.trim(),
      gender: gender || null,
      ageGroup: ageGroup || null
    };
    
    // Aggregate data from all individual sites instead of using main database
    const startTime = performance.now();
    
    // Get all sites
    const sites = await siteDatabaseManager.getAllSites();
    
    // Collect all detail records from all sites
    const allDetailRecords = [];
    const siteResults = [];
    
    for (const site of sites) {
      try {
        const siteDetailResult = await siteOptimizedIndicators.executeSiteIndicatorDetails(
          site.code, 
          indicatorId, 
          params, 
          1, 
          10000, // Get all records from each site
          search, 
          ageGroup, 
          gender
        );
        
        // Add site information to each record
        const recordsWithSite = siteDetailResult.data.map(record => ({
          ...record,
          site_code: site.code,
          site_name: site.name,
          site_province: site.province
        }));
        
        allDetailRecords.push(...recordsWithSite);
        siteResults.push({
          siteCode: site.code,
          siteName: site.name,
          recordCount: siteDetailResult.data.length,
          success: true
        });
      } catch (error) {
        siteResults.push({
          siteCode: site.code,
          siteName: site.name,
          recordCount: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    // Apply pagination to the aggregated results
    const totalRecords = allDetailRecords.length;
    const totalPages = Math.ceil(totalRecords / params.limit);
    const offset = (params.page - 1) * params.limit;
    const paginatedRecords = allDetailRecords.slice(offset, offset + params.limit);
    
    const executionTime = performance.now() - startTime;

    res.json({
      success: true,
      data: paginatedRecords,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalCount: totalRecords,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1
      },
      search: search || '',
      performance: {
        executionTime: executionTime,
        recordCount: paginatedRecords.length,
        sitesProcessed: sites.length,
        successfulSites: siteResults.filter(s => s.success).length
      },
      period: {
        startDate: params.startDate,
        endDate: params.endDate,
        previousEndDate: params.previousEndDate
      },
      siteResults: siteResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed records',
      message: error.message
    });
  }
});


// Get details for a specific indicator with pagination
router.get('/details/:indicatorId', async (req, res) => {
  try {
    const { indicatorId } = req.params;
    const { startDate, endDate, previousEndDate, siteCode, page = 1, limit = 100, search = '', gender, ageGroup } = req.query;
    
    const params = {
      startDate: startDate || '2025-01-01',
      endDate: endDate || '2025-03-31',
      previousEndDate: previousEndDate || '2024-12-31',
      siteCode: siteCode || null,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100000), // Max 100000 records per page for exports
      search: search.trim(),
      gender: gender || null,
      ageGroup: ageGroup || null
    };

    // Create a unique key for this request
    const requestKey = `details:${indicatorId}:${JSON.stringify(params)}`;
    
    // Check if there's already a pending request for the same parameters
    if (pendingRequests.has(requestKey)) {
      const existingPromise = pendingRequests.get(requestKey);
      
      try {
        const result = await existingPromise;
        return res.json(result);
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Request failed',
          message: error.message
        });
      }
    }

    // Create new request promise
    const requestPromise = (async () => {
      const startTime = performance.now();
      
      try {
        // Get sites to query - either specific site or all sites
        let sites;
        if (params.siteCode) {
          // Single site - validate it exists
          const siteInfo = await siteDatabaseManager.getSiteInfo(params.siteCode);
          if (!siteInfo) {
            throw new Error(`Site ${params.siteCode} not found`);
          }
          sites = [siteInfo];
        } else {
          // All sites
          sites = await siteDatabaseManager.getAllSites();
        }
        
        // Collect all detail records from selected sites
        const allDetailRecords = [];
        const siteResults = [];
        
        for (const site of sites) {
          try {
            const siteDetailResult = await siteOptimizedIndicators.executeSiteIndicatorDetails(
              site.code, 
              indicatorId, 
              params, 
              1, 
              10000, // Get all records from each site
              search, 
              ageGroup, 
              gender
            );
            
            // Add site information to each record
            const recordsWithSite = siteDetailResult.data.map(record => ({
              ...record,
              site_code: site.code,
              site_name: site.name,
              site_province: site.province
            }));
            
            allDetailRecords.push(...recordsWithSite);
            siteResults.push({
              siteCode: site.code,
              siteName: site.name,
              recordCount: siteDetailResult.data.length,
              success: true
            });
          } catch (error) {
            siteResults.push({
              siteCode: site.code,
              siteName: site.name,
              recordCount: 0,
              success: false,
              error: error.message
            });
          }
        }
        
        // Apply pagination to the aggregated results
        const totalRecords = allDetailRecords.length;
        const totalPages = Math.ceil(totalRecords / params.limit);
        const offset = (params.page - 1) * params.limit;
        const paginatedRecords = allDetailRecords.slice(offset, offset + params.limit);
        
        const executionTime = performance.now() - startTime;
        
        const result = {
          success: true,
          data: paginatedRecords,
          pagination: {
            page: params.page,
            limit: params.limit,
            totalCount: totalRecords,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1
          },
          search: search || '',
          performance: {
            executionTime: executionTime,
            recordCount: paginatedRecords.length,
            sitesProcessed: sites.length,
            successfulSites: siteResults.filter(s => s.success).length
          },
          period: {
            startDate: params.startDate,
            endDate: params.endDate,
            previousEndDate: params.previousEndDate
          },
          siteResults: siteResults
        };
        
        return result;
      } catch (error) {
        return {
          success: false,
          error: 'Failed to fetch indicator details',
          message: error.message,
          period: params
        };
      } finally {
        // Remove from pending requests
        pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise
    pendingRequests.set(requestKey, requestPromise);
    
    // Wait for the result
    const result = await requestPromise;
    
    // Return appropriate status code
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get performance statistics
router.get('/stats/performance', async (req, res) => {
  try {
    const stats = optimizedIndicators.getStats();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance statistics',
      message: error.message
    });
  }
});

// Clear cache
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern = '.*' } = req.body;
    const clearedCount = optimizedIndicators.clearCache(pattern);
    
    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache entries`,
      clearedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// Performance comparison endpoint
router.get('/compare/performance', async (req, res) => {
  try {
    const { startDate, endDate, previousEndDate } = req.query;
    
    const params = {
      startDate: startDate || '2025-01-01',
      endDate: endDate || '2025-03-31',
      previousEndDate: previousEndDate || '2024-12-31'
    };
    
    // Test optimized approach
    const optimizedStart = performance.now();
    const optimizedResult = await optimizedIndicators.executeAllIndicators(params, false); // No cache
    const optimizedTime = performance.now() - optimizedStart;

    // Test with cache
    const cachedStart = performance.now();
    const cachedResult = await optimizedIndicators.executeAllIndicators(params, true); // With cache
    const cachedTime = performance.now() - cachedStart;

    res.json({
      success: true,
      comparison: {
        optimized: {
          executionTime: optimizedTime,
          successCount: optimizedResult.successCount,
          errorCount: optimizedResult.errorCount
        },
        cached: {
          executionTime: cachedTime,
          successCount: cachedResult.successCount,
          errorCount: cachedResult.errorCount
        },
        improvement: {
          timeSaved: optimizedTime - cachedTime,
          percentageImprovement: ((optimizedTime - cachedTime) / optimizedTime * 100).toFixed(2)
        }
      },
      period: params
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to run performance comparison',
      message: error.message
    });
  }
});

module.exports = router;
