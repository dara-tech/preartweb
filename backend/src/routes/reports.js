const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { QueryTypes } = require('sequelize');
const infantReportService = require('../services/infantReportService');
const pnttReportService = require('../services/pnttReportService');

const router = express.Router();

/**
 * @route GET /apiv1/reports/infant-report
 * @desc Get infant report data (aggregates from INFANT_AGGREGATE_SCRIPTS) for a site and period
 * @access Authenticated users
 */
router.get('/infant-report',
  authenticateToken,
  [
    query('siteCode').notEmpty().withMessage('Site code is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('previousEndDate').optional().isISO8601().withMessage('Previous end date must be a valid ISO date')
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
      const { siteCode, startDate, endDate, previousEndDate } = req.query;
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      if (!siteInfo) {
        return res.status(404).json({
          success: false,
          error: `Site ${siteCode} not found`
        });
      }
      const result = await infantReportService.getReportData(siteCode, {
        startDate: startDate || '2025-01-01',
        endDate: endDate || '2025-03-31',
        previousEndDate: previousEndDate || '2024-12-31'
      });
      return res.json(result);
    } catch (error) {
      console.error('Error fetching infant report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch infant report',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/reports/infant-report/details
 * @desc Get infant report detail records for a section (runs INFANT_DETAIL_SCRIPTS)
 * @access Authenticated users
 */
router.get('/infant-report/details',
  authenticateToken,
  [
    query('siteCode').notEmpty().withMessage('Site code is required'),
    query('scriptId').notEmpty().withMessage('Detail scriptId is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('previousEndDate').optional().isISO8601().withMessage('Previous end date must be a valid ISO date')
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
      const { siteCode, scriptId, startDate, endDate, previousEndDate } = req.query;
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      if (!siteInfo) {
        return res.status(404).json({
          success: false,
          error: `Site ${siteCode} not found`
        });
      }
      const result = await infantReportService.runDetailScript(siteCode, scriptId, {
        startDate: startDate || '2025-01-01',
        endDate: endDate || '2025-03-31',
        previousEndDate: previousEndDate || '2024-12-31'
      });
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
          data: []
        });
      }
      return res.json({
        success: true,
        data: result.rows || []
      });
    } catch (error) {
      console.error('Error fetching infant report details:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch infant report details',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/reports/pntt-report
 * @desc Get PNTT report data (aggregates from PNTT_AGGREGATE_SCRIPTS) for a site and period
 * @access Authenticated users
 */
router.get('/pntt-report',
  authenticateToken,
  [
    query('siteCode').notEmpty().withMessage('Site code is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('previousEndDate').optional().isISO8601().withMessage('Previous end date must be a valid ISO date')
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
      const { siteCode, startDate, endDate, previousEndDate } = req.query;
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      if (!siteInfo) {
        return res.status(404).json({
          success: false,
          error: `Site ${siteCode} not found`
        });
      }
      const result = await pnttReportService.getReportData(siteCode, {
        startDate: startDate || '2025-01-01',
        endDate: endDate || '2025-03-31',
        previousEndDate: previousEndDate || '2024-12-31'
      });
      return res.json(result);
    } catch (error) {
      console.error('Error fetching PNTT report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch PNTT report',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/reports/pntt-report/details
 * @desc Get PNTT report detail records for a section (runs PNTT_DETAIL_SCRIPTS)
 * @access Authenticated users
 */
router.get('/pntt-report/details',
  authenticateToken,
  [
    query('siteCode').notEmpty().withMessage('Site code is required'),
    query('scriptId').notEmpty().withMessage('Detail scriptId is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('previousEndDate').optional().isISO8601().withMessage('Previous end date must be a valid ISO date')
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
      const { siteCode, scriptId, startDate, endDate, previousEndDate } = req.query;
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      if (!siteInfo) {
        return res.status(404).json({
          success: false,
          error: `Site ${siteCode} not found`
        });
      }
      const result = await pnttReportService.runDetailScript(siteCode, scriptId, {
        startDate: startDate || '2025-01-01',
        endDate: endDate || '2025-03-31',
        previousEndDate: previousEndDate || '2024-12-31'
      });
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
          data: []
        });
      }
      return res.json({
        success: true,
        data: result.rows || []
      });
    } catch (error) {
      console.error('Error fetching PNTT report details:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch PNTT report details',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /apiv1/reports/idpoor-duplicated-artid
 * @desc Get IDpoor patients among active patients with duplicated ART IDs
 * @access Authenticated users
 */
router.get('/idpoor-duplicated-artid',
  authenticateToken,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    query('siteId').optional().isString().withMessage('Site ID must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search term must be a string')
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
        page = 1,
        pageSize = 20,
        search = null
      } = req.query;

      // Default to current date if not provided
      const endDateValue = endDate || new Date().toISOString().split('T')[0];
      const startDateValue = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

      // Get sites to query
      let sitesToQuery = [];
      if (siteId && siteId !== 'all') {
        const siteInfo = await siteDatabaseManager.getSiteInfo(siteId);
        if (!siteInfo) {
          return res.status(404).json({
            success: false,
            error: 'Site not found'
          });
        }
        sitesToQuery = [{ code: siteId, name: siteInfo.name }];
        console.log(`🔍 Querying single site: ${siteId}`);
      } else {
        const allSites = await siteDatabaseManager.getAllSites();
        sitesToQuery = allSites.map(site => ({ code: site.code, name: site.name }));
        console.log(`🌐 Querying ALL sites: ${sitesToQuery.length} sites found`);
      }

      const allResults = [];
      
      // First, collect all active IDpoor patients from all sites
      for (const site of sitesToQuery) {
        try {
          const siteConnection = await siteDatabaseManager.getSiteConnection(site.code);
          
          // Query to find active IDpoor patients (following the active patient script pattern)
          // NOTE: This query assumes IDPoor and IDPoorCard columns exist in tblaimain and tblcimain tables
          // If these columns don't exist or have different names, the query will need to be adjusted
          // Please verify the actual column names in your database tables
          const query = `
            WITH tblvisit AS (
              -- Get most recent visit for each patient up to endDate
              SELECT 
                clinicid,
                DatVisit,
                ARTnum,
                DaApp,
                vid,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
              FROM tblavmain 
              WHERE DatVisit <= :endDate
              
              UNION ALL 
              
              SELECT 
                clinicid,
                DatVisit,
                ARTnum,
                DaApp,
                vid,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
              FROM tblcvmain 
              WHERE DatVisit <= :endDate
            ),
            tblimain AS (
              -- Adult patients
              SELECT 
                a.ClinicID,
                a.DafirstVisit,
                "15+" AS typepatients,
                a.TypeofReturn,
                a.LClinicID,
                a.SiteNameold,
                a.DaBirth,
                TIMESTAMPDIFF(YEAR, a.DaBirth, :endDate) AS age,
                a.Sex,
                a.DaHIV,
                a.OffIn,
                COALESCE(a.SiteName, '') AS SiteName
              FROM tblaimain a
              WHERE a.DafirstVisit <= :endDate
              
              UNION ALL 
              
              -- Child patients
              SELECT 
                c.ClinicID,
                c.DafirstVisit,
                "≤14" AS typepatients,
                '' AS TypeofReturn,
                c.LClinicID,
                c.SiteNameold,
                c.DaBirth,
                TIMESTAMPDIFF(YEAR, c.DaBirth, :endDate) AS age,
                c.Sex,
                c.DaTest AS DaHIV,
                c.OffIn,
                COALESCE(c.SiteName, '') AS SiteName
              FROM tblcimain c
              WHERE c.DafirstVisit <= :endDate
            ),
            idpoor_links AS (
              -- IDpoor links from tblalink table (used for all patient types: adults, children, and infants)
              -- Typecode values might be: 'ID poor', 'IDPoor', 'ID_Poor', 'idpoor', etc.
              SELECT 
                ClinicID,
                Codes AS idpoor_card_number,
                Typecode
              FROM tblalink
              WHERE UPPER(TRIM(Typecode)) LIKE '%ID%POOR%' 
                 OR UPPER(TRIM(Typecode)) LIKE '%POOR%ID%'
            ),
            tblart AS (
              -- Adult ART records
              SELECT 
                ClinicID,
                ART,
                DaArt
              FROM tblaart 
              WHERE DaArt <= :endDate
              
              UNION ALL 
              
              -- Child ART records
              SELECT 
                ClinicID,
                ART,
                DaArt
              FROM tblcart 
              WHERE DaArt <= :endDate
            ),
            tblexit AS (
              -- Patient exit statuses
              SELECT 
                clinicid,
                Status,
                da
              FROM tblavpatientstatus 
              WHERE da <= :endDate
              
              UNION ALL 
              
              SELECT 
                clinicid,
                Status,
                da
              FROM tblcvpatientstatus  
              WHERE da <= :endDate
            ),
            active_patients AS (
              -- First get ALL active patients: have visit, on ART, no exit status
              SELECT 
                i.ClinicID as clinic_id,
                i.DafirstVisit as date_first_visit,
                i.DaBirth as date_of_birth,
                i.age,
                i.Sex as sex,
                a.ART as art_number,
                a.DaArt as date_art_start,
                i.SiteName as site_name,
                CASE WHEN idl.ClinicID IS NOT NULL THEN 'Yes' ELSE 'No' END as idpoor_status,
                idl.idpoor_card_number,
                CASE WHEN i.typepatients = '15+' THEN 'Adult' ELSE 'Child' END as patient_type,
                v.DatVisit as last_visit_date
              FROM tblvisit v
              INNER JOIN tblimain i ON i.ClinicID = v.clinicid
              INNER JOIN tblart a ON a.ClinicID = v.clinicid
              LEFT JOIN idpoor_links idl ON i.ClinicID = idl.ClinicID
              LEFT JOIN tblexit e ON v.clinicid = e.clinicid
              WHERE v.id = 1 
                AND e.Status IS NULL 
                AND a.ART IS NOT NULL
            )
            SELECT 
              ap.*,
              :siteCode as site_code,
              CASE 
                WHEN ap.sex = 1 THEN 'Male'
                WHEN ap.sex = 0 THEN 'Female'
                ELSE 'Unknown'
              END as patient_sex_display,
              ap.idpoor_status as idpoor_status_display,
              'Active' as patient_status
            FROM active_patients ap
            WHERE ap.art_number IS NOT NULL 
              AND ap.art_number != ''
              -- Filter by date range: patients active during the period
              AND ap.last_visit_date >= :startDate
              AND ap.last_visit_date <= :endDate
              -- Filter for IDpoor patients only
              AND ap.idpoor_status = 'Yes'
            ORDER BY ap.art_number, ap.clinic_id
          `;

          const results = await siteConnection.query(query, {
            replacements: {
              startDate: startDateValue,
              endDate: endDateValue,
              siteCode: site.code
            },
            type: QueryTypes.SELECT
          });

          // Transform results
          // Helper function to format dates (handles both Date objects and strings)
          const formatDate = (dateValue) => {
            if (!dateValue) return null;
            if (dateValue instanceof Date) {
              return dateValue.toISOString().split('T')[0];
            }
            if (typeof dateValue === 'string') {
              // If already in YYYY-MM-DD format, return as is
              if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
                return dateValue.split('T')[0]; // Handle datetime strings
              }
              // Try to parse and format
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
            }
            return null;
          };

          const transformedResults = results.map(row => ({
            id: row.clinic_id,
            clinic_id: String(row.clinic_id).padStart(6, '0'),
            art_number: row.art_number || '',
            patient_name: `Patient ${String(row.clinic_id).padStart(6, '0')}`,
            patient_sex: row.sex,
            patient_sex_display: row.patient_sex_display || (row.sex === 1 ? 'Male' : 'Female'),
            patient_age: row.age,
            date_first_visit: formatDate(row.date_first_visit),
            date_art_start: formatDate(row.date_art_start),
            idpoor_status: row.idpoor_status_display || (row.idpoor_status ? 'Yes' : 'No'),
            idpoor_card_number: row.idpoor_card_number || '',
            site_code: row.site_code || site.code,
            site_name: row.site_name || site.name,
            last_visit_date: formatDate(row.last_visit_date),
            patient_status: row.patient_status || 'Active',
            patient_type: row.patient_type || 'Adult'
          }));

          allResults.push(...transformedResults);
          console.log(`✅ Site ${site.code}: Found ${transformedResults.length} active IDpoor patients`);
        } catch (siteError) {
          console.error(`❌ Error querying site ${site.code}:`, siteError.message);
          console.error(`   Full error:`, siteError);
          
          // Check if error is related to missing IDPoor columns
          if (siteError.message && (siteError.message.includes('IDPoor') || siteError.message.includes('Unknown column'))) {
            console.error(`   ⚠️ Possible issue: IDPoor or IDPoorCard columns may not exist in tblaimain/tblcimain tables`);
            console.error(`   Please verify the actual column names for IDpoor data in your database`);
          }
          
          // Continue with other sites even if one fails
        }
      }

      console.log(`📊 Total active IDpoor patients collected: ${allResults.length}`);

      // Now find duplicates across ALL sites (or within single site if siteId specified)
      const artNumberCounts = {};
      allResults.forEach(patient => {
        if (patient.art_number) {
          if (!artNumberCounts[patient.art_number]) {
            artNumberCounts[patient.art_number] = [];
          }
          artNumberCounts[patient.art_number].push(patient);
        }
      });

      // Filter to only patients with duplicated ART numbers
      const duplicatedResults = [];
      Object.keys(artNumberCounts).forEach(artNumber => {
        if (artNumberCounts[artNumber].length > 1) {
          const duplicateCount = artNumberCounts[artNumber].length;
          artNumberCounts[artNumber].forEach(patient => {
            duplicatedResults.push({
              ...patient,
              duplicate_count: duplicateCount
            });
          });
        }
      });

      console.log(`🔍 Found ${duplicatedResults.length} patients with duplicated ART IDs (${Object.keys(artNumberCounts).filter(an => artNumberCounts[an].length > 1).length} unique duplicated ART numbers)`);

      // Apply search filter if provided
      let filteredResults = duplicatedResults;
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase();
        filteredResults = duplicatedResults.filter(r => 
          r.clinic_id?.toLowerCase().includes(searchTerm) ||
          r.art_number?.toLowerCase().includes(searchTerm) ||
          r.patient_name?.toLowerCase().includes(searchTerm) ||
          r.idpoor_card_number?.toLowerCase().includes(searchTerm) ||
          r.site_code?.toLowerCase().includes(searchTerm) ||
          r.site_name?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const total = filteredResults.length;
      const offset = (page - 1) * pageSize;
      const paginatedResults = filteredResults.slice(offset, offset + parseInt(pageSize));

      res.json({
        success: true,
        data: paginatedResults,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize),
        period: {
          startDate: startDateValue,
          endDate: endDateValue
        },
        siteId: siteId || 'all',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching IDpoor duplicated ARTId report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch report data',
        message: error.message
      });
    }
  }
);

module.exports = router;

