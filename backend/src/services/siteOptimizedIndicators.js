const { siteDatabaseManager } = require('../config/siteDatabase');
const { cache, cacheKeys } = require('./cache');
const fs = require('fs');
const path = require('path');

/**
 * Site-Optimized Indicators Service
 * Executes indicators on specific site databases with advanced caching and performance optimizations
 */
class SiteOptimizedIndicators {
  constructor() {
    this.queries = new Map();
    this.siteCache = new Map(); // Site-specific cache
    this.loadAllQueries();
  }

  // Load all SQL queries into memory at startup
  loadAllQueries() {
    const queriesDir = path.join(__dirname, '../queries/indicators');
    
    // Only load aggregate queries for the main indicators endpoint
    const aggregateQueryFiles = [
      '01_active_art_previous.sql',
      '02_active_pre_art_previous.sql',
      '03_newly_enrolled.sql',
      '04_retested_positive.sql',
      '05_newly_initiated.sql',
      '05.1.1_art_same_day.sql',
      '05.1.2_art_1_7_days.sql',
      '05.1.3_art_over_7_days.sql',
      '05.2_art_with_tld.sql',
      '06_transfer_in.sql',
      '07_lost_and_return.sql',
      '08.1_dead.sql',
      '08.2_lost_to_followup.sql',
      '08.3_transfer_out.sql',
      '09_active_pre_art.sql',
      '10_active_art_current.sql',
      '10.1_eligible_mmd.sql',
      '10.2_mmd.sql',
      '10.3_tld.sql',
      '10.4_tpt_start.sql',
      '10.5_tpt_complete.sql',
      '10.6_eligible_vl_test.sql',
      '10.7_vl_tested_12m.sql',
      '10.8_vl_suppression.sql'
    ];
    
    // Load detail queries separately
    const detailQueryFiles = [
      '01_active_art_previous_details.sql',
      '02_active_pre_art_previous_details.sql',
      '03_newly_enrolled_details.sql',
      '04_retested_positive_details.sql',
      '05_newly_initiated_details.sql',
      '05.1.1_art_same_day_details.sql',
      '05.1.2_art_1_7_days_details.sql',
      '05.1.3_art_over_7_days_details.sql',
      '05.2_art_with_tld_details.sql',
      '06_transfer_in_details.sql',
      '07_lost_and_return_details.sql',
      '08.1_dead_details.sql',
      '08.2_lost_to_followup_details.sql',
      '08.3_transfer_out_details.sql',
      '09_active_pre_art_details.sql',
      '10_active_art_current_details.sql',
      '10.1_eligible_mmd_details.sql',
      '10.2_mmd_details.sql',
      '10.3_tld_details.sql',
      '10.4_tpt_start_details.sql',
      '10.5_tpt_complete_details.sql',
      '10.6_eligible_vl_test_details.sql',
      '10.7_vl_tested_12m_details.sql',
      '10.8_vl_suppression_details.sql'
    ];

    // Load aggregate queries
    this.loadQueries(aggregateQueryFiles, 'aggregate');
    
    // Load detail queries
    this.loadQueries(detailQueryFiles, 'detail');
  }

  loadQueries(files, type) {
    const queriesDir = path.join(__dirname, '../queries/indicators');
    
    files.forEach(filename => {
      const filePath = path.join(queriesDir, filename);
      if (fs.existsSync(filePath)) {
        const query = fs.readFileSync(filePath, 'utf8');
        const indicatorId = filename.replace('.sql', '');
        this.queries.set(indicatorId, query);
      }
    });
  }


  // Generate cache key for site-specific data
  generateCacheKey(siteCode, indicatorId, params) {
    const paramString = JSON.stringify(params);
    return `site_${siteCode}_${indicatorId}_${Buffer.from(paramString).toString('base64')}`;
  }

  // Process query with parameters
  processQuery(query, params) {
    let processedQuery = query;
    
    // Replace parameter placeholders (both @ and : formats)
    const replacements = {
      '@StartDate': `'${params.startDate}'`,
      '@EndDate': `'${params.endDate}'`,
      '@PreviousEndDate': params.previousEndDate ? `'${params.previousEndDate}'` : 'NULL',
      '@lost_code': params.lost_code || 0,
      '@dead_code': params.dead_code || 1,
      '@transfer_out_code': params.transfer_out_code || 3,
      '@mmd_eligible_code': params.mmd_eligible_code || 0,
      '@mmd_drug_quantity': params.mmd_drug_quantity || 60,
      '@vl_suppression_threshold': params.vl_suppression_threshold || 1000,
      '@tld_regimen_formula': `'${params.tld_regimen_formula || '3TC + DTG + TDF'}'`,
      '@transfer_in_code': params.transfer_in_code || 1,
      '@tpt_drug_list': params.tpt_drug_list || "'Isoniazid','3HP','6H'",
      // Also handle : format placeholders
      ':StartDate': `'${params.startDate}'`,
      ':EndDate': `'${params.endDate}'`,
      ':PreviousEndDate': params.previousEndDate ? `'${params.previousEndDate}'` : 'NULL',
      ':lost_code': params.lost_code || 0,
      ':dead_code': params.dead_code || 1,
      ':transfer_out_code': params.transfer_out_code || 3,
      ':mmd_eligible_code': params.mmd_eligible_code || 0,
      ':mmd_drug_quantity': params.mmd_drug_quantity || 60,
      ':vl_suppression_threshold': params.vl_suppression_threshold || 1000,
      ':tld_regimen_formula': `'${params.tld_regimen_formula || '3TC + DTG + TDF'}'`,
      ':transfer_in_code': params.transfer_in_code || 1,
      ':tpt_drug_list': params.tpt_drug_list || "'Isoniazid','3HP','6H'"
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      // Escape special regex characters in the placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processedQuery = processedQuery.replace(new RegExp(escapedPlaceholder, 'g'), value);
    });

    return processedQuery;
  }

  // Execute single indicator for analytics (no cache)
  async executeSiteIndicatorForAnalytics(siteCode, indicatorId, params) {
    const startTime = performance.now();
    
    try {
      // Get query
      const query = this.queries.get(indicatorId);
      if (!query) {
        throw new Error(`Indicator ${indicatorId} not found`);
      }

      // Process query with parameters
      const processedQuery = this.processQuery(query, params);
      
      // Execute on site database
      const results = await siteDatabaseManager.executeSiteQuery(siteCode, processedQuery);
      
      if (!results || results.length === 0) {
        return {
          success: true,
          data: {
            Indicator: indicatorId,
            TOTAL: 0,
            Male_0_14: 0,
            Female_0_14: 0,
            Male_over_14: 0,
            Female_over_14: 0
          }
        };
      }

      const result = results[0];
      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        success: true,
        data: result,
        duration: duration
      };
    } catch (error) {
      console.error(`Error executing indicator ${indicatorId} for site ${siteCode}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Execute single indicator for a specific site
  async executeSiteIndicator(siteCode, indicatorId, params, useCache = true) {
    const startTime = performance.now();
    
    try {
      // Check cache first
      if (useCache) {
        try {
          const cacheKey = this.generateCacheKey(siteCode, indicatorId, params);
          // Simple cache check without using the cache service
          if (cache && cache.get) {
            const cached = cache.get(cacheKey);
            if (cached) {
              return cached;
            }
          }
        } catch (error) {
          console.log('[SiteOptimizedIndicators] Cache error, continuing without cache:', error.message);
        }
      }

      // Get query
      const query = this.queries.get(indicatorId);
      if (!query) {
        throw new Error(`Indicator ${indicatorId} not found`);
      }

      // Process query with parameters
      const processedQuery = this.processQuery(query, params);
      
      // Execute on site database
      const results = await siteDatabaseManager.executeSiteQuery(siteCode, processedQuery);
      
      const executionTime = performance.now() - startTime;
      
      // Ensure consistent data types for numeric fields
      const processedResults = results.map(row => {
        if (row && typeof row === 'object') {
          return {
            ...row,
            TOTAL: Number(row.TOTAL || 0),
            Male_0_14: Number(row.Male_0_14 || 0),
            Female_0_14: Number(row.Female_0_14 || 0),
            Male_over_14: Number(row.Male_over_14 || 0),
            Female_over_14: Number(row.Female_over_14 || 0)
          };
        }
        return row;
      });

      const result = {
        siteCode,
        indicatorId,
        data: processedResults,
        executionTime: Math.round(executionTime),
        timestamp: new Date().toISOString()
      };

      // Cache the result
      if (useCache) {
        const cacheKey = this.generateCacheKey(siteCode, indicatorId, params);
        cache.set('short', cacheKey, result, 300); // 5 minutes cache
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Execute all indicators for a specific site
  async executeAllSiteIndicators(siteCode, params, useCache = true) {
    const startTime = performance.now();

    // Get only aggregate indicator IDs (exclude detail queries)
    const aggregateIndicatorIds = Array.from(this.queries.keys()).filter(id => !id.includes('_details'));
    
    // Separate fast and slow queries for better batching
    const fastQueries = aggregateIndicatorIds.filter(id => 
      !id.includes('vl') && !id.includes('10.6') && !id.includes('10.7') && !id.includes('10.8')
    );
    const slowQueries = aggregateIndicatorIds.filter(id => 
      id.includes('vl') || id.includes('10.6') || id.includes('10.7') || id.includes('10.8')
    );

    // Execute fast queries first (batch of 8)
    const fastPromises = fastQueries.map(async (indicatorId) => {
      try {
        const result = await this.executeSiteIndicator(siteCode, indicatorId, params, useCache);
        return {
          indicatorId,
          data: result.data[0] || {},
          success: true,
          executionTime: result.executionTime
        };
      } catch (error) {
        return {
          indicatorId,
          data: {
            Indicator: indicatorId.replace(/^\d+\.?\d*_/, '').replace(/_/g, ' '),
            TOTAL: 0,
            Male_0_14: 0,
            Female_0_14: 0,
            Male_over_14: 0,
            Female_over_14: 0,
            error: error.message
          },
          success: false,
          executionTime: 0
        };
      }
    });

    // Execute slow queries in smaller batches (batch of 2)
    const slowPromises = slowQueries.map(async (indicatorId) => {
      try {
        const result = await this.executeSiteIndicator(siteCode, indicatorId, params, useCache);
        return {
          indicatorId,
          data: result.data[0] || {},
          success: true,
          executionTime: result.executionTime
        };
      } catch (error) {
        return {
          indicatorId,
          data: {
            Indicator: indicatorId.replace(/^\d+\.?\d*_/, '').replace(/_/g, ' '),
            TOTAL: 0,
            Male_0_14: 0,
            Female_0_14: 0,
            Male_over_14: 0,
            Female_over_14: 0,
            error: error.message
          },
          success: false,
          executionTime: 0
        };
      }
    });

    // Execute all promises
    const [fastResults, slowResults] = await Promise.all([
      Promise.all(fastPromises),
      Promise.all(slowPromises)
    ]);

    const allResults = [...fastResults, ...slowResults];
    const executionTime = performance.now() - startTime;
    const successCount = allResults.filter(r => r.success).length;
    const errorCount = allResults.filter(r => !r.success).length;

    return {
      siteCode,
      results: allResults,
      executionTime: Math.round(executionTime),
      successCount,
      errorCount,
      averageTimePerIndicator: Math.round(executionTime / allResults.length),
      timestamp: new Date().toISOString()
    };
  }

  // Execute indicators for all sites in parallel
  async executeAllSitesIndicators(params, useCache = true) {
    const startTime = performance.now();

    try {
      // Get all active sites
      const sites = await siteDatabaseManager.getAllSites();
      
      // Execute indicators for each site in parallel
      const sitePromises = sites.map(async (site) => {
        try {
          const result = await this.executeAllSiteIndicators(site.code, params, useCache);
          return {
            site: {
              code: site.code,
              name: site.name,
              province: site.province,
              type: site.type
            },
            ...result
          };
        } catch (error) {
          return {
            site: {
              code: site.code,
              name: site.name,
              province: site.province,
              type: site.type
            },
            results: [],
            executionTime: 0,
            successCount: 0,
            errorCount: 1,
            error: error.message
          };
        }
      });

      const siteResults = await Promise.all(sitePromises);
      const executionTime = performance.now() - startTime;

      // Calculate totals
      const totalSuccess = siteResults.reduce((sum, site) => sum + site.successCount, 0);
      const totalErrors = siteResults.reduce((sum, site) => sum + site.errorCount, 0);

      return {
        sites: siteResults,
        executionTime: Math.round(executionTime),
        totalSuccess,
        totalErrors,
        siteCount: sites.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // Get site-specific indicator details
  async executeSiteIndicatorDetails(siteCode, indicatorId, params, page = 1, limit = 50, search = '', ageGroup = '', gender = '') {
    // Map short indicator ID to full detail query name
    const detailQueryMapping = {
      '1': '01_active_art_previous_details',
      '2': '02_active_pre_art_previous_details',
      '3': '03_newly_enrolled_details',
      '4': '04_retested_positive_details',
      '5': '05_newly_initiated_details',
      '5.1.1': '05.1.1_art_same_day_details',
      '5.1.2': '05.1.2_art_1_7_days_details',
      '5.1.3': '05.1.3_art_over_7_days_details',
      '5.2': '05.2_art_with_tld_details',
      '6': '06_transfer_in_details',
      '7': '07_lost_and_return_details',
      '8.1': '08.1_dead_details',
      '8.2': '08.2_lost_to_followup_details',
      '8.3': '08.3_transfer_out_details',
      '9': '09_active_pre_art_details',
      '10': '10_active_art_current_details',
      '10.1': '10.1_eligible_mmd_details',
      '10.2': '10.2_mmd_details',
      '10.3': '10.3_tld_details',
      '10.4': '10.4_tpt_start_details',
      '10.5': '10.5_tpt_complete_details',
      '10.6': '10.6_eligible_vl_test_details',
      '10.7': '10.7_vl_tested_12m_details',
      '10.8': '10.8_vl_suppression_details'
    };
    
    const detailIndicatorId = detailQueryMapping[indicatorId] || `${indicatorId}_details`;
    const query = this.queries.get(detailIndicatorId);
    
    if (!query) {
      throw new Error(`Detail indicator ${detailIndicatorId} not found`);
    }

    const processedQuery = this.processQuery(query, params);
    
    // Get total count first (without filters)
    const cleanQuery = processedQuery.trim().replace(/;+$/, '');
    const countQuery = `SELECT COUNT(*) as total FROM (${cleanQuery}) as count_query`;
    const countResult = await siteDatabaseManager.executeSiteQuery(siteCode, countQuery);
    const totalRecords = countResult[0].total;
    
    // Execute the query to get all records (without pagination)
    const allResults = await siteDatabaseManager.executeSiteQuery(siteCode, cleanQuery);
    
    // Apply filters to all results
    let filteredResults = this.applySiteFilters(allResults, { search, ageGroup, gender });
    
    // Apply pagination to filtered results
    const offset = (page - 1) * limit;
    const paginatedResults = filteredResults.slice(offset, offset + limit);
    
    // Calculate pagination based on filtered results
    const filteredTotal = filteredResults.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    
    return {
      siteCode,
      indicatorId: detailIndicatorId,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: filteredTotal, // Use filtered total for accurate pagination
        totalCount: filteredTotal, // Add totalCount for frontend compatibility
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  // Apply filters to data (gender, age group, search) - similar to optimizedIndicators.js
  applySiteFilters(data, filters) {
    let filteredData = [...data];

    // Apply search filter if provided
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      
      filteredData = filteredData.filter(record => {
        // Search across common fields
        const searchableFields = [
          record.clinicid,
          record.LClinicID,
          record.SiteNameold,
          record.sex_display,
          record.typepatients,
          record.transfer_status
        ].filter(field => field !== null && field !== undefined);
        
        return searchableFields.some(field => 
          field.toString().toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply gender filter if provided
    if (filters.gender) {
      filteredData = filteredData.filter(record => {
        // Check both sex field (0/1) and sex_display field
        const isMale = record.sex === 1 || record.sex_display === 'Male' || record.sex_display === 'male';
        const isFemale = record.sex === 0 || record.sex_display === 'Female' || record.sex_display === 'female';
        
        if (filters.gender === 'Male' || filters.gender === 'male') {
          return isMale;
        } else if (filters.gender === 'Female' || filters.gender === 'female') {
          return isFemale;
        }
        return true;
      });
    }

    // Apply age group filter if provided
    if (filters.ageGroup) {
      filteredData = filteredData.filter(record => {
        // Use typepatients field to match aggregate query logic
        const typepatients = record.typepatients;
        let correctAgeGroup = '15+';
        
        // Map typepatients field to age groups
        if (typepatients === '≤14') {
          correctAgeGroup = '0-14';
        } else if (typepatients === '15+') {
          correctAgeGroup = '15+';
        } else {
          // Fallback to actual age calculation if typepatients is not available
          const age = parseInt(record.age) || 0;
          if (age >= 0 && age <= 14) {
            correctAgeGroup = '0-14';
          } else if (age > 14) {
            correctAgeGroup = '15+';
          }
        }
        
        const shouldInclude = (filters.ageGroup === '≤14' || filters.ageGroup === '0-14') ? 
          (correctAgeGroup === '0-14') : 
          (filters.ageGroup === '15+' || filters.ageGroup === '>14') ? 
          (correctAgeGroup === '15+') : true;
        
        return shouldInclude;
      });
    }

    return filteredData;
  }

  // Clear site-specific cache
  clearSiteCache(siteCode) {
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.startsWith(`site_${siteCode}_`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cache.del(key));
  }

  // Clear all cache
  clearAllCache() {
    cache.flushAll();
  }
}

// Create singleton instance
const siteOptimizedIndicators = new SiteOptimizedIndicators();

module.exports = siteOptimizedIndicators;
