const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { InfantVisit, InfantPatient } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { resolveSite } = require('../utils/siteUtils');
const { Op } = require('sequelize');

const router = express.Router();

// Helper function to get current fiscal quarter dates
const getCurrentFiscalQuarter = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  let quarterStartMonth, quarterEndMonth, quarterYear;

  if (currentMonth >= 0 && currentMonth <= 2) {
    quarterStartMonth = 0; // January
    quarterEndMonth = 2;   // March
    quarterYear = currentYear;
  } else if (currentMonth >= 3 && currentMonth <= 5) {
    quarterStartMonth = 3; // April
    quarterEndMonth = 5;   // June
    quarterYear = currentYear;
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    quarterStartMonth = 6; // July
    quarterEndMonth = 8;   // September
    quarterYear = currentYear;
  } else {
    quarterStartMonth = 9; // October
    quarterEndMonth = 11;  // December
    quarterYear = currentYear;
  }

  const startDate = `${quarterYear}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(quarterYear, quarterEndMonth + 1, 0).getDate();
  const endDate = `${quarterYear}-${String(quarterEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
};

// Get quarter dates based on quarter selection
const getQuarterDates = (quarterValue) => {
  if (!quarterValue || quarterValue === 'custom') {
    return null;
  }

  // Handle current quarter
  if (quarterValue === 'current') {
    return getCurrentFiscalQuarter();
  }

  // Parse quarter value like "Q1-2025"
  const [quarter, year] = quarterValue.split('-');
  const quarterNum = parseInt(quarter.replace('Q', ''));
  const yearNum = parseInt(year);

  let quarterStartMonth, quarterEndMonth;

  switch (quarterNum) {
    case 1:
      quarterStartMonth = 0; // January
      quarterEndMonth = 2;   // March
      break;
    case 2:
      quarterStartMonth = 3; // April
      quarterEndMonth = 5;   // June
      break;
    case 3:
      quarterStartMonth = 6; // July
      quarterEndMonth = 8;   // September
      break;
    case 4:
      quarterStartMonth = 9; // October
      quarterEndMonth = 11;  // December
      break;
    default:
      return getCurrentFiscalQuarter();
  }

  const startDate = `${yearNum}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(yearNum, quarterEndMonth + 1, 0).getDate();
  const endDate = `${yearNum}-${String(quarterEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
};

// Get infant test results with pagination and filtering
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('clinicId').optional().isString().withMessage('Clinic ID must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('testType').optional().isIn(['dna', 'oi', 'confirmed', 'positive', 'negative', 'hiv', 'cd4', 'viral_load', 'hcv', 'chemistry', 'hematology', 'microbiology']).withMessage('Invalid test type'),
  query('search').optional().isString().withMessage('Search term must be a string'),
  query('site').optional().isString().withMessage('Site must be a string'),
  query('selectedQuarter').optional().isString().withMessage('Selected quarter must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      clinicId,
      startDate,
      endDate,
      testType,
      search,
      site,
      selectedQuarter
    } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    // Process quarter dates if selectedQuarter is provided
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    
    if (selectedQuarter && selectedQuarter !== 'custom') {
      const quarterDates = getQuarterDates(selectedQuarter);
      if (quarterDates) {
        finalStartDate = quarterDates.startDate;
        finalEndDate = quarterDates.endDate;
      }
    }

    // Build where conditions for raw SQL
    let whereConditions = [];
    
    if (clinicId) {
      whereConditions.push(`tt.ClinicID = '${clinicId}'`);
    }
    
    if (finalStartDate && finalEndDate) {
      whereConditions.push(`tt.DaBlood BETWEEN '${finalStartDate}' AND '${finalEndDate}'`);
    }
    
    if (search) {
      whereConditions.push(`(tt.ClinicID LIKE '%${search}%' OR ip.ClinicID LIKE '%${search}%')`);
    }

    // Test type filtering for infant tests
    if (testType) {
      switch (testType) {
        case 'dna':
          whereConditions.push(`(tt.DNAPcr IS NOT NULL AND tt.DNAPcr != -1)`);
          break;
        case 'oi':
          whereConditions.push(`(tt.OI = 'True')`);
          break;
        case 'confirmed':
          whereConditions.push(`(tt.DNAPcr = 4)`);
          break;
        case 'positive':
          whereConditions.push(`(tt.Result = 1)`);
          break;
        case 'negative':
          whereConditions.push(`(tt.Result = 0)`);
          break;
      }
    }

    const whereCondition = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Determine which database(s) to use
    let siteCodes = [];
    if (site && site !== 'all') {
      siteCodes = [site];
    } else {
      // Get all available sites for the user
      const userSites = req.user.assignedSites || [];
      if (userSites.length > 0) {
        siteCodes = userSites;
      } else {
        // If no assigned sites, get all sites
        const allSites = await siteDatabaseManager.getAllSites();
        siteCodes = allSites.map(s => s.code);
      }
    }

    let allResults = [];
    let totalCount = 0;

    // Query each site database
    for (const siteCode of siteCodes) {
      try {
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        if (!siteConnection) continue;

        // Build the SQL query for infant tests
        const countQuery = `
          SELECT COUNT(*) as count
          FROM tbletest tt
          LEFT JOIN tbleimain ip ON tt.ClinicID = ip.ClinicID
          ${whereCondition}
        `;

        const dataQuery = `
          SELECT 
            tt.ClinicID,
            tt.DaBlood as visitDate,
            tt.DNAPcr as dnaTestType,
            tt.DaPcrArr as arrivalDate,
            tt.OI as oiSymptom,
            tt.DaBlood as bloodDate,
            tt.LabID as labId,
            tt.DaReceive as receiveDate,
            tt.DaAnalys as analysisDate,
            tt.Result as result,
            tt.DaRresult as resultDate,
            tt.DBS as dbs,
            tt.Technic as technic,
            tt.ResultIn as resultIn,
            tt.Other as other,
            tt.TID as testId,
            ip.DaBirth as dateOfBirth,
            ip.Sex as patientSex,
            CASE 
              WHEN ip.SiteName IS NOT NULL AND ip.SiteName != '' THEN ip.SiteName 
              ELSE 'Site ${siteCode}' 
            END as siteName,
            '${siteCode}' as siteCode
          FROM tbletest tt
          LEFT JOIN tbleimain ip ON tt.ClinicID = ip.ClinicID
          ${whereCondition}
          ORDER BY tt.DaBlood DESC
          LIMIT ${limitNum} OFFSET ${offset}
        `;

        const countResult = await siteConnection.query(countQuery, {
          type: sequelize.QueryTypes.SELECT
        });
        const count = countResult[0]?.count || 0;
        totalCount += count;

        const results = await siteConnection.query(dataQuery, {
          type: sequelize.QueryTypes.SELECT
        });
        
        // Transform results to include test type information
        const transformedResults = results.map(test => {
          const testTypes = [];
          
          // Check for DNA PCR tests (DNAPcr field has values other than -1)
          if (test.dnaTestType !== null && test.dnaTestType !== -1) {
            testTypes.push('DNA PCR');
          }
          
          // Check for OI tests
          if (test.oiSymptom === 'True') {
            testTypes.push('OI');
          }

          // Helper function to get DNA test type description (based on original VB.NET code)
          const getDnaTestType = (value) => {
            if (value === null || value === undefined) return 'Not Tested';
            if (value === -1) return 'Not Selected';
            if (value === 0) return 'At Birth';
            if (value === 1) return '4-6 Weeks';
            if (value === 2) return '6 Weeks After Stopped Breastfeeding';
            if (value === 3) return 'Other';
            if (value === 4) return 'Confirm';
            if (value === 5) return '9 Months';
            return 'Not Tested';
          };

          // Helper function to get test result description (based on original VB.NET code)
          const getTestResult = (value) => {
            if (value === null || value === undefined) return 'Not Tested';
            if (value === 0) return 'Negative';
            if (value === 1) return 'Positive';
            if (value === 2) return 'Unknown';
            return 'Not Tested';
          };

          return {
            ...test,
            testTypes: testTypes.length > 0 ? testTypes.join(', ') : 'No Tests',
            dnaTestTypeDesc: getDnaTestType(test.dnaTestType),
            testResultDesc: getTestResult(test.result),
            hasOISymptom: test.oiSymptom === 'True',
            isConfirmedTest: test.dnaTestType === 4
          };
        });

        allResults = [...allResults, ...transformedResults];
      } catch (error) {
        console.error(`Error querying site ${siteCode}:`, error);
        continue;
      }
    }

    // Sort all results by visit date
    allResults.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    // Apply pagination to combined results
    const paginatedResults = allResults.slice(0, limitNum);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching infant tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch infant test results'
    });
  }
});

// Get infant test statistics
router.get('/stats/summary', [
  authenticateToken,
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('site').optional().isString().withMessage('Site must be a string'),
  query('selectedQuarter').optional().isString().withMessage('Selected quarter must be a string')
], async (req, res, next) => {
  try {
    const { startDate, endDate, site, selectedQuarter } = req.query;

    // Process quarter dates if selectedQuarter is provided
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    
    if (selectedQuarter && selectedQuarter !== 'custom') {
      const quarterDates = getQuarterDates(selectedQuarter);
      if (quarterDates) {
        finalStartDate = quarterDates.startDate;
        finalEndDate = quarterDates.endDate;
      }
    }

    // Get all available sites for the user
    const userSites = req.user.assignedSites || [];
    let siteCodes = [];
    
    if (site && site !== 'all') {
      siteCodes = [site];
    } else if (userSites.length > 0) {
      siteCodes = userSites;
    } else {
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    let totalTests = 0;
    let dnaTests = 0;
    let oiTests = 0;
    let confirmedTests = 0;
    let positiveTests = 0;
    let negativeTests = 0;

    // Query each site database
    for (const siteCode of siteCodes) {
      try {
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        if (!siteConnection) continue;

        let whereConditions = [];
        if (finalStartDate && finalEndDate) {
          whereConditions.push(`DaBlood BETWEEN '${finalStartDate}' AND '${finalEndDate}'`);
        }
        const whereCondition = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const statsQuery = `
          SELECT 
            COUNT(*) as totalTests,
            SUM(CASE WHEN DNAPcr IS NOT NULL AND DNAPcr != -1 THEN 1 ELSE 0 END) as dnaTests,
            SUM(CASE WHEN OI = 'True' THEN 1 ELSE 0 END) as oiTests,
            SUM(CASE WHEN DNAPcr = 4 THEN 1 ELSE 0 END) as confirmedTests,
            SUM(CASE WHEN Result = 1 THEN 1 ELSE 0 END) as positiveTests,
            SUM(CASE WHEN Result = 0 THEN 1 ELSE 0 END) as negativeTests
          FROM tbletest
          ${whereCondition}
        `;

        const results = await siteConnection.query(statsQuery, {
          type: sequelize.QueryTypes.SELECT
        });
        const stats = results[0];

        totalTests += parseInt(stats.totalTests) || 0;
        dnaTests += parseInt(stats.dnaTests) || 0;
        oiTests += parseInt(stats.oiTests) || 0;
        confirmedTests += parseInt(stats.confirmedTests) || 0;
        positiveTests += parseInt(stats.positiveTests) || 0;
        negativeTests += parseInt(stats.negativeTests) || 0;
      } catch (error) {
        console.error(`Error getting stats for site ${siteCode}:`, error);
        continue;
      }
    }

    res.json({
      success: true,
      data: {
        totalTests,
        dnaTests,
        oiTests,
        confirmedTests,
        positiveTests,
        negativeTests
      }
    });

  } catch (error) {
    console.error('Error fetching infant test statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch infant test statistics'
    });
  }
});

module.exports = router;
