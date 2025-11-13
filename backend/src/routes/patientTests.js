const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { PatientTest, PatientTestCXR, PatientTestAbdominal, Patient } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { resolveSite } = require('../utils/siteUtils');
const { Op } = require('sequelize');

const router = express.Router();

// Simple test endpoint
router.get('/test', [
  authenticateToken
], async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Patient test API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    next(error);
  }
});

// Helper function to generate TestID
const generateTestID = (clinicId, testDate) => {
  const date = new Date(testDate);
  const dateStr = date.getDate().toString().padStart(2, '0') + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getFullYear().toString();
  
  if (isNaN(clinicId)) {
    return clinicId.trim() + dateStr;
  } else {
    return clinicId + dateStr;
  }
};

// Get patient test results with pagination and filtering
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('clinicId').optional().isString().withMessage('Clinic ID must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('testType').optional().isIn(['cd4', 'viral_load', 'hcv', 'chemistry', 'hematology', 'microbiology', 'dna']).withMessage('Invalid test type'),
  query('search').optional().isString().withMessage('Search term must be a string'),
  query('site').optional().isString().withMessage('Site must be a string')
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
      site
    } = req.query;

    const limitNum = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitNum;

    // Build where conditions for raw SQL
    let whereConditions = [];
    
    if (clinicId) {
      whereConditions.push(`pt.ClinicID = '${clinicId}'`);
    }
    
    if (startDate) {
      whereConditions.push(`pt.Dat >= '${startDate}'`);
    }
    
    if (endDate) {
      whereConditions.push(`pt.Dat <= '${endDate}'`);
    }
    
    if (search) {
      whereConditions.push(`(pt.ClinicID LIKE '%${search}%' OR pt.TestID LIKE '%${search}%')`);
    }

    // Test type filtering
    if (testType) {
      switch (testType) {
        case 'cd4':
          whereConditions.push(`(pt.CD4 IS NOT NULL AND pt.CD4 != '')`);
          break;
        case 'viral_load':
          whereConditions.push(`(pt.HIVLoad IS NOT NULL AND pt.HIVLoad != '')`);
          break;
        case 'hcv':
          whereConditions.push(`(pt.HCV IS NOT NULL AND pt.HCV != '')`);
          break;
        case 'chemistry':
          whereConditions.push(`(pt.Creatinine IS NOT NULL AND pt.Creatinine != '' OR pt.Glucose IS NOT NULL AND pt.Glucose != '')`);
          break;
        case 'hematology':
          whereConditions.push(`(pt.WBC IS NOT NULL AND pt.WBC != '' OR pt.HGB IS NOT NULL AND pt.HGB != '')`);
          break;
        case 'microbiology':
          whereConditions.push(`(pt.SputumAFB IS NOT NULL OR pt.BloodCulture IS NOT NULL)`);
          break;
        case 'dna':
          // DNA tests - for now, we'll check if there are any DNA-related fields
          // This can be expanded when DNA test fields are added to the database
          whereConditions.push(`(pt.CTNA IS NOT NULL OR pt.GCNA IS NOT NULL)`);
          break;
      }
    }

    const whereCondition = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Determine which database(s) to use
    let siteCodes = [];
    
    // If site is provided, use specific site
    if (site) {
      try {
        const { siteCode: resolvedSiteCode } = await resolveSite(site);
        siteCodes = [resolvedSiteCode];
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Site not found',
          message: error.message,
          availableSites: (await siteDatabaseManager.getAllSites()).map(s => ({ 
            code: s.code, 
            name: s.display_name || s.short_name || s.name 
          }))
        });
      }
    } else {
      // If no site specified, query all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    // Get count from all sites
    let totalCount = 0;
    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      const countQuery = `
        SELECT COUNT(*) as count
        FROM tblpatienttest pt
        ${whereCondition}
      `;
      const countResult = await siteConnection.query(countQuery, {
        type: siteConnection.QueryTypes.SELECT
      });
      totalCount += countResult[0].count;
    }

    // Get patient tests from all sites
    let allPatientTests = [];
    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
      
      const testsQuery = `
        SELECT 
          pt.TestID,
          pt.ClinicID,
          pt.DaArrival,
          pt.Dat,
          pt.DaCollect,
          pt.CD4Rapid,
          pt.CD4,
          pt.CD,
          pt.CD8,
          pt.HIVLoad,
          pt.HIVLog,
          pt.HCV,
          pt.HCVlog,
          pt.HIVAb,
          pt.HBsAg,
          pt.HCVPCR,
          pt.HBeAg,
          pt.TPHA,
          pt.AntiHBcAb,
          pt.RPR,
          pt.AntiHBeAb,
          pt.RPRab,
          pt.HCVAb,
          pt.HBsAb,
          pt.WBC,
          pt.Neutrophils,
          pt.HGB,
          pt.Eosinophis,
          pt.HCT,
          pt.Lymphocyte,
          pt.MCV,
          pt.Monocyte,
          pt.PLT,
          pt.Reticulocte,
          pt.Prothrombin,
          pt.ProReticulocyte,
          pt.Creatinine,
          pt.HDL,
          pt.Bilirubin,
          pt.Glucose,
          pt.Sodium,
          pt.AlPhosphate,
          pt.GotASAT,
          pt.Potassium,
          pt.Amylase,
          pt.GPTALAT,
          pt.Chloride,
          pt.CK,
          pt.CHOL,
          pt.Bicarbonate,
          pt.Lactate,
          pt.Triglyceride,
          pt.Urea,
          pt.Magnesium,
          pt.Phosphorus,
          pt.Calcium,
          pt.BHCG,
          pt.SputumAFB,
          pt.AFBCulture,
          pt.AFBCulture1,
          pt.UrineMicroscopy,
          pt.UrineComment,
          pt.CSFCell,
          pt.CSFGram,
          pt.CSFAFB,
          pt.CSFIndian,
          pt.CSFCCag,
          pt.CSFProtein,
          pt.CSFGlucose,
          pt.BloodCulture,
          pt.BloodCulture0,
          pt.BloodCulture1,
          pt.BloodCulture10,
          pt.CTNA,
          pt.GCNA,
          pt.CXR,
          pt.Abdominal,
          '${siteCode}' as siteCode,
          '${siteName}' as siteName
        FROM tblpatienttest pt
        ${whereCondition}
        ORDER BY pt.Dat DESC
      `;

      const tests = await siteConnection.query(testsQuery, {
        type: siteConnection.QueryTypes.SELECT
      });
      
      allPatientTests = allPatientTests.concat(tests);
    }
    
    // Sort all results and apply pagination
    allPatientTests.sort((a, b) => new Date(b.Dat) - new Date(a.Dat));
    const paginatedTests = allPatientTests.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: paginatedTests,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNextPage: parseInt(page) < Math.ceil(totalCount / limitNum),
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching patient tests:', error);
    next(error);
  }
});

// Get test statistics
router.get('/stats/summary', [
  authenticateToken,
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('site').optional().isString().withMessage('Site must be a string')
], async (req, res, next) => {
  try {
    const { startDate, endDate, site } = req.query;

    // Build where conditions for raw SQL
    let whereConditions = [];
    
    if (startDate) {
      whereConditions.push(`pt.Dat >= '${startDate}'`);
    }
    
    if (endDate) {
      whereConditions.push(`pt.Dat <= '${endDate}'`);
    }

    const whereCondition = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Determine which database(s) to use
    let siteCodes = [];
    
    // If site is provided, use specific site
    if (site) {
      try {
        const { siteCode: resolvedSiteCode } = await resolveSite(site);
        siteCodes = [resolvedSiteCode];
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Site not found',
          message: error.message,
          availableSites: (await siteDatabaseManager.getAllSites()).map(s => ({ 
            code: s.code, 
            name: s.display_name || s.short_name || s.name 
          }))
        });
      }
    } else {
      // If no site specified, query all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    // Get statistics from all sites
    let totalStats = {
      totalTests: 0,
      cd4Tests: 0,
      viralLoadTests: 0,
      hcvTests: 0,
      cxrTests: 0,
      abdominalTests: 0
    };

    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      
      const statsQuery = `
        SELECT 
          COUNT(*) as totalTests,
          COUNT(CASE WHEN CD4 IS NOT NULL AND CD4 != '' THEN 1 END) as cd4Tests,
          COUNT(CASE WHEN HIVLoad IS NOT NULL AND HIVLoad != '' THEN 1 END) as viralLoadTests,
          COUNT(CASE WHEN HCV IS NOT NULL AND HCV != '' THEN 1 END) as hcvTests,
          COUNT(CASE WHEN CXR = 1 THEN 1 END) as cxrTests,
          COUNT(CASE WHEN Abdominal = 1 THEN 1 END) as abdominalTests
        FROM tblpatienttest pt
        ${whereCondition}
      `;

      const stats = await siteConnection.query(statsQuery, {
        type: siteConnection.QueryTypes.SELECT
      });

      if (stats[0]) {
        totalStats.totalTests += parseInt(stats[0].totalTests) || 0;
        totalStats.cd4Tests += parseInt(stats[0].cd4Tests) || 0;
        totalStats.viralLoadTests += parseInt(stats[0].viralLoadTests) || 0;
        totalStats.hcvTests += parseInt(stats[0].hcvTests) || 0;
        totalStats.cxrTests += parseInt(stats[0].cxrTests) || 0;
        totalStats.abdominalTests += parseInt(stats[0].abdominalTests) || 0;
      }
    }

    res.json({
      success: true,
      data: totalStats
    });

  } catch (error) {
    console.error('Error fetching test statistics:', error);
    next(error);
  }
});

// Get a single patient test by TestID
router.get('/detail/:testId', [
  authenticateToken,
  param('testId').notEmpty().withMessage('Test ID is required'),
  query('site').optional().isString().withMessage('Site must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { testId } = req.params;
    const { site } = req.query;

    // Determine which database(s) to use
    let siteCodes = [];
    
    // If site is provided, use specific site
    if (site) {
      try {
        const { siteCode: resolvedSiteCode } = await resolveSite(site);
        siteCodes = [resolvedSiteCode];
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Site not found',
          message: error.message,
          availableSites: (await siteDatabaseManager.getAllSites()).map(s => ({ 
            code: s.code, 
            name: s.display_name || s.short_name || s.name 
          }))
        });
      }
    } else {
      // If no site specified, search all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    // Search for the test in all sites
    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
      
      const testQuery = `
        SELECT 
          pt.*,
          '${siteCode}' as siteCode,
          '${siteName}' as siteName
        FROM tblpatienttest pt
        WHERE pt.TestID = '${testId}'
      `;

      const tests = await siteConnection.query(testQuery, {
        type: siteConnection.QueryTypes.SELECT
      });

      if (tests.length > 0) {
        return res.json({
          success: true,
          data: tests[0]
        });
      }
    }

    res.status(404).json({ 
      success: false, 
      message: 'Patient test not found' 
    });

  } catch (error) {
    console.error('Error fetching patient test detail:', error);
    next(error);
  }
});

// Create a new patient test
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'data_manager']),
  body('ClinicID').notEmpty().withMessage('Clinic ID is required'),
  body('Dat').isISO8601().withMessage('Test Date must be a valid date'),
  query('site').notEmpty().withMessage('Site is required for creating tests')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { site } = req.query;
    const { ClinicID, Dat, ...otherFields } = req.body;

    // Get site-specific database connection
    const { siteCode: resolvedSiteCode } = await resolveSite(site);
    const siteConnection = await siteDatabaseManager.getSiteConnection(resolvedSiteCode);

    const TestID = generateTestID(ClinicID, Dat);

    // Insert into site-specific database
    const insertQuery = `
      INSERT INTO tblpatienttest (
        TestID, ClinicID, DaArrival, Dat, DaCollect, CD4Rapid, CD4, CD, CD8, HIVLoad, HIVLog,
        HCV, HCVlog, HIVAb, HBsAg, HCVPCR, HBeAg, TPHA, AntiHBcAb, RPR, AntiHBeAb, RPRab,
        HCVAb, HBsAb, WBC, Neutrophils, HGB, Eosinophis, HCT, Lymphocyte, MCV, Monocyte,
        PLT, Reticulocte, Prothrombin, ProReticulocyte, Creatinine, HDL, Bilirubin, Glucose,
        Sodium, AlPhosphate, GotASAT, Potassium, Amylase, GPTALAT, Chloride, CK, CHOL,
        Bicarbonate, Lactate, Triglyceride, Urea, Magnesium, Phosphorus, Calcium, BHCG,
        SputumAFB, AFBCulture, AFBCulture1, UrineMicroscopy, UrineComment, CSFCell, CSFGram,
        CSFAFB, CSFIndian, CSFCCag, CSFProtein, CSFGlucose, BloodCulture, BloodCulture0,
        BloodCulture1, BloodCulture10, CTNA, GCNA, CXR, Abdominal
      ) VALUES (
        '${TestID}', '${ClinicID}', 
        ${otherFields.DaArrival ? `'${otherFields.DaArrival}'` : 'NULL'},
        '${Dat}',
        ${otherFields.DaCollect ? `'${otherFields.DaCollect}'` : 'NULL'},
        ${otherFields.CD4Rapid ? 1 : 0},
        ${otherFields.CD4 ? `'${otherFields.CD4}'` : 'NULL'},
        ${otherFields.CD ? `'${otherFields.CD}'` : 'NULL'},
        ${otherFields.CD8 ? `'${otherFields.CD8}'` : 'NULL'},
        ${otherFields.HIVLoad ? `'${otherFields.HIVLoad}'` : 'NULL'},
        ${otherFields.HIVLog ? `'${otherFields.HIVLog}'` : 'NULL'},
        ${otherFields.HCV ? `'${otherFields.HCV}'` : 'NULL'},
        ${otherFields.HCVlog ? `'${otherFields.HCVlog}'` : 'NULL'},
        ${otherFields.HIVAb || 0},
        ${otherFields.HBsAg || 0},
        ${otherFields.HCVPCR || 0},
        ${otherFields.HBeAg || 0},
        ${otherFields.TPHA || 0},
        ${otherFields.AntiHBcAb || 0},
        ${otherFields.RPR || 0},
        ${otherFields.AntiHBeAb || 0},
        ${otherFields.RPRab ? `'${otherFields.RPRab}'` : 'NULL'},
        ${otherFields.HCVAb || 0},
        ${otherFields.HBsAb || 0},
        ${otherFields.WBC ? `'${otherFields.WBC}'` : 'NULL'},
        ${otherFields.Neutrophils ? `'${otherFields.Neutrophils}'` : 'NULL'},
        ${otherFields.HGB ? `'${otherFields.HGB}'` : 'NULL'},
        ${otherFields.Eosinophis ? `'${otherFields.Eosinophis}'` : 'NULL'},
        ${otherFields.HCT ? `'${otherFields.HCT}'` : 'NULL'},
        ${otherFields.Lymphocyte ? `'${otherFields.Lymphocyte}'` : 'NULL'},
        ${otherFields.MCV ? `'${otherFields.MCV}'` : 'NULL'},
        ${otherFields.Monocyte ? `'${otherFields.Monocyte}'` : 'NULL'},
        ${otherFields.PLT ? `'${otherFields.PLT}'` : 'NULL'},
        ${otherFields.Reticulocte ? `'${otherFields.Reticulocte}'` : 'NULL'},
        ${otherFields.Prothrombin ? `'${otherFields.Prothrombin}'` : 'NULL'},
        ${otherFields.ProReticulocyte ? `'${otherFields.ProReticulocyte}'` : 'NULL'},
        ${otherFields.Creatinine ? `'${otherFields.Creatinine}'` : 'NULL'},
        ${otherFields.HDL ? `'${otherFields.HDL}'` : 'NULL'},
        ${otherFields.Bilirubin ? `'${otherFields.Bilirubin}'` : 'NULL'},
        ${otherFields.Glucose ? `'${otherFields.Glucose}'` : 'NULL'},
        ${otherFields.Sodium ? `'${otherFields.Sodium}'` : 'NULL'},
        ${otherFields.AlPhosphate ? `'${otherFields.AlPhosphate}'` : 'NULL'},
        ${otherFields.GotASAT ? `'${otherFields.GotASAT}'` : 'NULL'},
        ${otherFields.Potassium ? `'${otherFields.Potassium}'` : 'NULL'},
        ${otherFields.Amylase ? `'${otherFields.Amylase}'` : 'NULL'},
        ${otherFields.GPTALAT ? `'${otherFields.GPTALAT}'` : 'NULL'},
        ${otherFields.Chloride ? `'${otherFields.Chloride}'` : 'NULL'},
        ${otherFields.CK ? `'${otherFields.CK}'` : 'NULL'},
        ${otherFields.CHOL ? `'${otherFields.CHOL}'` : 'NULL'},
        ${otherFields.Bicarbonate ? `'${otherFields.Bicarbonate}'` : 'NULL'},
        ${otherFields.Lactate ? `'${otherFields.Lactate}'` : 'NULL'},
        ${otherFields.Triglyceride ? `'${otherFields.Triglyceride}'` : 'NULL'},
        ${otherFields.Urea ? `'${otherFields.Urea}'` : 'NULL'},
        ${otherFields.Magnesium ? `'${otherFields.Magnesium}'` : 'NULL'},
        ${otherFields.Phosphorus ? `'${otherFields.Phosphorus}'` : 'NULL'},
        ${otherFields.Calcium ? `'${otherFields.Calcium}'` : 'NULL'},
        ${otherFields.BHCG || 0},
        ${otherFields.SputumAFB || 0},
        ${otherFields.AFBCulture || 0},
        ${otherFields.AFBCulture1 ? `'${otherFields.AFBCulture1}'` : 'NULL'},
        ${otherFields.UrineMicroscopy || 0},
        ${otherFields.UrineComment ? `'${otherFields.UrineComment}'` : 'NULL'},
        ${otherFields.CSFCell ? `'${otherFields.CSFCell}'` : 'NULL'},
        ${otherFields.CSFGram ? `'${otherFields.CSFGram}'` : 'NULL'},
        ${otherFields.CSFAFB ? `'${otherFields.CSFAFB}'` : 'NULL'},
        ${otherFields.CSFIndian || 0},
        ${otherFields.CSFCCag ? `'${otherFields.CSFCCag}'` : 'NULL'},
        ${otherFields.CSFProtein ? `'${otherFields.CSFProtein}'` : 'NULL'},
        ${otherFields.CSFGlucose ? `'${otherFields.CSFGlucose}'` : 'NULL'},
        ${otherFields.BloodCulture || 0},
        ${otherFields.BloodCulture0 ? `'${otherFields.BloodCulture0}'` : 'NULL'},
        ${otherFields.BloodCulture1 || 0},
        ${otherFields.BloodCulture10 ? `'${otherFields.BloodCulture10}'` : 'NULL'},
        ${otherFields.CTNA || 0},
        ${otherFields.GCNA || 0},
        ${otherFields.CXR || 0},
        ${otherFields.Abdominal || 0}
      )
    `;

    await siteConnection.query(insertQuery, {
      type: siteConnection.QueryTypes.INSERT
    });

    res.status(201).json({ 
      success: true, 
      message: 'Patient test created successfully',
      data: { TestID, ClinicID, Dat, siteCode: resolvedSiteCode }
    });

  } catch (error) {
    console.error('Error creating patient test:', error);
    next(error);
  }
});

module.exports = router;