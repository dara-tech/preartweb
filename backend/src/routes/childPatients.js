const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ChildPatient } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { resolveSite } = require('../utils/siteUtils');
const { Op } = require('sequelize');

const router = express.Router();

// Get child patient status counts
router.get('/status-counts', [authenticateToken], async (req, res, next) => {
  try {
    const { site } = req.query;
    
    let whereCondition = '';
    let replacements = {};
    let conditions = [];
    
    if (site) {
      conditions.push('s.NameEn = :site');
      replacements.site = site;
    }
    
    if (conditions.length > 0) {
      whereCondition = 'WHERE ' + conditions.join(' AND ');
    }
    
    // Get status counts
    const statusCounts = await sequelize.query(`
      SELECT 
        COALESCE(ps.Status, -1) as status,
        COUNT(*) as count
      FROM tblcimain c
      LEFT JOIN tblsitename s ON c._site_code = s.SiteCode
      LEFT JOIN tblcvpatientstatus ps ON c.ClinicID = ps.ClinicID
      ${whereCondition}
      GROUP BY COALESCE(ps.Status, -1)
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get total count
    const totalResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM tblcimain c
      LEFT JOIN tblsitename s ON c._site_code = s.SiteCode
      ${whereCondition}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    // Format status counts
    const counts = {
      total: totalResult[0].total,
      active: 0,
      dead: 0,
      lost: 0,
      transferred_out: 0,
      new: 0,
      return_in: 0,
      return_out: 0
    };
    
    statusCounts.forEach(item => {
      switch (item.status) {
        case -1:
          counts.active = item.count;
          break;
        case 0:
          counts.lost = item.count;
          break;
        case 1:
          counts.dead = item.count;
          break;
        case 3:
          counts.transferred_out = item.count;
          break;
      }
    });
    
    // Child patients don't have TypeofReturn column, so set counts to 0
    counts.new = 0;
    counts.return_in = 0;
    counts.return_out = 0;
    
    res.json({
      success: true,
      counts: counts
    });
    
  } catch (error) {
    next(error);
  }
});

// Get all child patients with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit, search, clinicId, site, status, ageRange, dateRange, nationality } = req.query;
    // Smart pagination: only apply limit/offset if explicitly provided
    const limitNum = limit ? parseInt(limit) : null;
    const offset = limitNum ? (parseInt(page) - 1) * limitNum : 0;
    
    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { clinicId: { [Op.like]: `%${search}%` } },
        sequelize.where(
          sequelize.fn('CONCAT', 
            sequelize.fn('LPAD', sequelize.col('clinicId'), 7, '0')
          ), 
          { [Op.like]: `%${search}%` }
        )
      ];
    }
    
    if (clinicId) {
      whereClause.clinicId = clinicId;
    }
    
    // Build WHERE conditions for raw query
    const conditions = [];
    const replacements = {};
    
    if (search) {
      conditions.push('(c.ClinicID LIKE :search OR CONCAT(LPAD(c.ClinicID, 6, "0")) LIKE :search)');
      replacements.search = `%${search}%`;
    }
    
    if (clinicId) {
      conditions.push('c.ClinicID = :clinicId');
      replacements.clinicId = clinicId;
    }
    
    // Add status filter (based on patient status from tblpatientstatus)
    if (status) {
      if (status === 'active') {
        conditions.push('COALESCE(ps.Status, -1) = -1'); // Active patients
      } else if (status === 'dead') {
        conditions.push('COALESCE(ps.Status, -1) = 1'); // Dead patients
      } else if (status === 'lost') {
        conditions.push('COALESCE(ps.Status, -1) = 0'); // Lost patients
      } else if (status === 'transferred_out') {
        conditions.push('COALESCE(ps.Status, -1) = 3'); // Transferred out patients
      } else if (status === 'new') {
        conditions.push('c.TypeofReturn = -1'); // New patients
      } else if (status === 'return_in') {
        conditions.push('c.TypeofReturn = 0'); // Return In
      } else if (status === 'return_out') {
        conditions.push('c.TypeofReturn = 1'); // Return Out
      }
    }
    
    // Add age range filter
    if (ageRange) {
      const now = new Date();
      if (ageRange === '0-2') {
        conditions.push('YEAR(now()) - YEAR(c.DaBirth) BETWEEN 0 AND 2');
      } else if (ageRange === '2-5') {
        conditions.push('YEAR(now()) - YEAR(c.DaBirth) BETWEEN 2 AND 5');
      } else if (ageRange === '5-10') {
        conditions.push('YEAR(now()) - YEAR(c.DaBirth) BETWEEN 5 AND 10');
      } else if (ageRange === '10-14') {
        conditions.push('YEAR(now()) - YEAR(c.DaBirth) BETWEEN 10 AND 14');
      }
    }
    
    // Add date range filter (first visit date)
    if (dateRange) {
      const now = new Date();
      if (dateRange === '30days') {
        conditions.push('c.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      } else if (dateRange === '90days') {
        conditions.push('c.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 90 DAY)');
      } else if (dateRange === '1year') {
        conditions.push('c.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 1 YEAR)');
      }
    }
    
    // Add nationality filter
    if (nationality) {
      conditions.push('c.Nationality = :nationality');
      replacements.nationality = nationality;
    }
    
    
    const whereCondition = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Determine which database(s) to use
    let siteCodes = [];
    
    // If site is provided, use specific site
    if (site) {
      try {
        const { siteCode: resolvedSiteCode } = await resolveSite(site);
        siteCodes = [resolvedSiteCode];
      } catch (error) {
        return res.status(404).json({
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
      try {
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        const countResult = await siteConnection.query(`
        SELECT COUNT(*) as count
        FROM tblcimain c
        LEFT JOIN tblsitename s ON c.SiteName = s.SiteCode
        LEFT JOIN tblcvpatientstatus ps ON c.ClinicID = ps.ClinicID
        WHERE 1=1
        ${whereCondition ? 'AND ' + whereCondition.replace('WHERE ', '') : ''}
      `, {
        replacements: { 
          ...replacements
        },
        type: siteConnection.QueryTypes.SELECT
      });
      const siteCount = countResult[0]?.count || 0;
      totalCount += siteCount;
      } catch (error) {
        console.error(`Error querying site ${siteCode}:`, error.message);
      }
    }

    // Get patients from all sites
    let allRows = [];
    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
      const rows = await siteConnection.query(`
        SELECT 
          c.ClinicID as clinicId,
        c.DaFirstVisit as dateFirstVisit,
        c.DaBirth as dateOfBirth,
        c.Sex as sex,
        c.Referred as referred,
        c.OffIn as offIn,
        :siteCode as siteCode,
        :siteName as siteName,
        c.Artnum as artNumber,
        c.VcctID as vcctId,
        c.Nationality as nationality,
        COALESCE(ps.Status, -1) as patientStatus,
        ps.Cause as statusCause,
        ps.Da as statusDate
      FROM tblcimain c
      LEFT JOIN tblsitename s ON c.SiteName = s.SiteCode
      LEFT JOIN tblcvpatientstatus ps ON c.ClinicID = ps.ClinicID
      WHERE 1=1
      ${whereCondition ? 'AND ' + whereCondition.replace('WHERE ', '') : ''}
        ORDER BY c.ClinicID DESC
        ${limitNum ? `LIMIT ${limitNum} OFFSET ${offset}` : ''}
      `, {
        replacements: { 
          ...replacements,
          siteCode: siteCode,
          siteName: siteName
        },
        type: siteConnection.QueryTypes.SELECT
      });
      allRows = allRows.concat(rows);
    }
    
    // Sort all results by ClinicID DESC and apply pagination
    allRows.sort((a, b) => b.clinicId - a.clinicId);
    const paginatedRows = limitNum ? allRows.slice(offset, offset + limitNum) : allRows;

    // Format the data like the VB.NET ViewData function
    const formattedRows = paginatedRows.map((row, index) => {
      // Use site information directly from the query results (from registry database)
      const artNumber = row.artNumber || '';
      const extractedSiteCode = row.siteCode || '';
      const siteName = row.siteName || '';
      
      return {
        no: offset + index + 1,
        clinicId: String(row.clinicId).padStart(7, '0'),
        dateFirstVisit: row.dateFirstVisit,
        age: calculateAge(row.dateOfBirth, row.dateFirstVisit),
        sex: row.sex === 0 ? 'Female' : 'Male',
        referred: getReferredText(row.referred),
        transferIn: row.offIn === 1,
        site_code: extractedSiteCode || '',
        siteCode: extractedSiteCode || '',
        siteName: siteName,
        artNumber: artNumber,
        lostReturn: 'N/A', // Child patients don't have TypeofReturn column
        vcctCode: row.vcctId || '',
        nationality: row.nationality || '',
        patientStatus: getPatientStatusText(row.patientStatus, null),
        patientStatusValue: row.patientStatus,
        statusCause: row.statusCause || '',
        statusDate: row.statusDate || ''
      };
    });

    res.json({
      patients: formattedRows,
      total: totalCount,
      page: parseInt(page),
      totalPages: limitNum ? Math.ceil(totalCount / limitNum) : 1
    });

  } catch (error) {
    next(error);
  }
});

// Get single child patient by clinic ID
router.get('/:clinicId', [
  authenticateToken,
  param('clinicId').isLength({ min: 1 }).withMessage('Clinic ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { clinicId } = req.params;
    const { site } = req.query;

    console.log(`[GET /:clinicId] Looking for child patient: ${clinicId}, site: ${site || 'all'}`);

    // Determine which database(s) to use
    let siteCodes = [];
    
    // If site is provided, use specific site
    if (site) {
      // If site is provided as a name (not a code), convert it to code
      if (!/^\d{4}$/.test(site)) {
        const sites = await siteDatabaseManager.getAllSites();
        const foundSite = sites.find(s => 
          s.name.toLowerCase() === site.toLowerCase() ||
          s.name.toLowerCase().includes(site.toLowerCase())
        );
        if (foundSite) {
          siteCodes = [foundSite.code];
          console.log(`[GET /:clinicId] Resolved site name '${site}' to code '${foundSite.code}'`);
        } else {
          return res.status(404).json({
            error: 'Site not found',
            message: `Site '${site}' not found or inactive`,
            availableSites: sites.map(s => ({ code: s.code, name: s.name }))
          });
        }
      } else {
        siteCodes = [site];
        console.log(`[GET /:clinicId] Using site code: ${site}`);
      }
    } else {
      // If no site specified, search all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
      console.log(`[GET /:clinicId] Searching all sites: ${siteCodes.join(', ')}`);
    }

    // Search for the patient in all sites
    for (const siteCode of siteCodes) {
      try {
        console.log(`[GET /:clinicId] Querying site ${siteCode} for patient ${clinicId}`);
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        
        // Use string comparison to handle both numeric and alphanumeric clinic IDs
        const patient = await siteConnection.query(`
          SELECT 
            c.ClinicID as clinicId,
            c.DaFirstVisit as dateFirstVisit,
            c.LClinicID as lClinicId,
            c.SiteNameold as siteNameOld,
            c.DaBirth as dateOfBirth,
            c.Sex as sex,
            c.Referred as referred,
            c.Oreferred as otherReferred,
            c.EClinicID as eClinicId,
            c.DaTest as dateTest,
            c.TypeTest as typeTest,
            c.Vcctcode as vcctCode,
            c.VcctID as vcctId,
            c.OffIn as offIn,
            c.SiteName as siteName,
            c.DaART as dateART,
            c.Artnum as artNumber,
            c.Feeding as feeding,
            c.TbPast as tbPast,
            c.TypeTB as typeTB,
            c.ResultTB as resultTB,
            c.Daonset as dateOnset,
            c.Tbtreat as tbTreat,
            c.Datreat as dateTreat,
            c.ResultTreat as resultTreat,
            c.DaResultTreat as dateResultTreat,
            c.Inh as inh,
            c.TPTdrug as tptDrug,
            c.DaStartTPT as dateStartTPT,
            c.DaEndTPT as dateEndTPT,
            c.OtherPast as otherPast,
            c.Cotrim as cotrim,
            c.Fluco as fluco,
            c.Allergy as allergy,
            c.ClinicIDold as clinicIdOld,
            c.Nationality as nationality
          FROM tblcimain c
          WHERE c.ClinicID = :clinicId
        `, {
          replacements: { clinicId: String(clinicId).trim() },
          type: siteConnection.QueryTypes.SELECT
        });

        console.log(`[GET /:clinicId] Site ${siteCode} returned ${patient?.length || 0} patient(s)`);

        if (patient && patient.length > 0) {
          console.log(`[GET /:clinicId] Found patient ${clinicId} in site ${siteCode}`);
          const patientData = patient[0];
          // Calculate age and add it to the response
          patientData.age = calculateAge(patientData.dateOfBirth, patientData.dateFirstVisit);
          return res.json(patientData);
        }
      } catch (error) {
        console.error(`[GET /:clinicId] Error querying site ${siteCode} for patient ${clinicId}:`, error.message);
        console.error(`[GET /:clinicId] Stack:`, error.stack);
        // Continue to next site
      }
    }

    // Patient not found in any site
    return res.status(404).json({
      error: 'Patient not found',
      message: `Child patient with Clinic ID '${clinicId}' not found`
    });

  } catch (error) {
    next(error);
  }
});

// Create new child patient
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'doctor', 'nurse']),
  
  // Validation matching VB.NET Save() function
  body('clinicId').isNumeric().withMessage('Clinic ID must be numeric'),
  body('dateFirstVisit').isISO8601().withMessage('Please input Date First Visit'),
  body('sex').isIn([0, 1]).withMessage('Please select Patient Sex'),
  body('dateOfBirth').isISO8601().withMessage('Date of birth is required'),
  
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const {
      clinicId,
      dateFirstVisit,
      lClinicId = '',
      dateOfBirth,
      sex,
      referred = -1,
      otherReferred = '',
      eClinicId = '',
      dateTest = '1900-01-01',
      typeTest = -1,
      vcctCode = '',
      vcctId = '',
      offIn = -1,
      siteName = '',
      dateART = '1900-01-01',
      artNumber = '',
      feeding = -1,
      tbPast = -1,
      typeTB = -1,
      resultTB = -1,
      dateOnset = '1900-01-01',
      tbTreat = -1,
      dateTreat = '1900-01-01',
      resultTreat = -1,
      dateResultTreat = '1900-01-01',
      inh = -1,
      tptDrug = -1,
      dateStartTPT = '1900-01-01',
      dateEndTPT = '1900-01-01',
      otherPast = -1,
      cotrim = -1,
      fluco = -1,
      allergy = -1,
      clinicIdOld = '',
      siteNameOld = '',
      nationality = 0,
      reLost = false,
      familyMembers = []
    } = req.body;

    // Additional validation like in VB.NET
    const age = calculateAge(dateOfBirth, dateFirstVisit);
    if (age < 0 || age > 14) {
      return res.status(400).json({
        error: 'Invalid Patient Age',
        message: 'Age must be 0-14 years for child patients'
      });
    }

    if (offIn === 1 && !artNumber.trim()) {
      return res.status(400).json({
        error: 'ART Number Required',
        message: 'Please input ART Number for transfer in patients'
      });
    }

    // Start transaction like VB.NET
    const transaction = await sequelize.transaction();

    try {
      // Insert main record (tblcimain)
      const patient = await ChildPatient.create({
        clinicId: parseInt(clinicId),
        dateFirstVisit,
        lClinicId,
        dateOfBirth,
        sex,
        referred,
        otherReferred,
        eClinicId,
        dateTest,
        typeTest,
        vcctCode,
        vcctId,
        offIn,
        siteName,
        dateART,
        artNumber,
        feeding,
        tbPast,
        typeTB,
        resultTB,
        dateOnset,
        tbTreat,
        dateTreat,
        resultTreat,
        dateResultTreat,
        inh,
        tptDrug,
        dateStartTPT,
        dateEndTPT,
        otherPast,
        cotrim,
        fluco,
        allergy,
        clinicIdOld,
        siteNameOld,
        nationality,
        reLost
      }, { transaction });

      // Insert family members if provided
      if (familyMembers && familyMembers.length > 0) {
        for (const member of familyMembers) {
          if (member.relationship && member.relationship.trim()) {
            await sequelize.query(`
              INSERT INTO tblcifamily 
              (ClinicID, Relationship, Age, HIVStatus, Status, ART, Pregnant, ARTName, TB) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
              replacements: [
                clinicId,
                member.relationship,
                member.age || '',
                member.hivStatus || -1,
                member.status || -1,
                member.art || -1,
                member.pregnant || -1,
                member.artName || '',
                member.tb || -1
              ],
              transaction
            });
          }
        }
      }

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblCImain', '1', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        message: 'Child patient created successfully',
        patient: patient.toJSON()
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Update child patient
router.put('/:clinicId', [
  authenticateToken,
  requireRole(['admin', 'doctor', 'nurse']),
  param('clinicId').isNumeric().withMessage('Clinic ID must be numeric')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { clinicId } = req.params;
    const updateData = req.body;

    // Find existing patient
    const patient = await ChildPatient.findOne({
      where: { clinicId: parseInt(clinicId) }
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Update main record
      await patient.update(updateData, { transaction });

      // Update family members if provided
      if (updateData.familyMembers) {
        // Delete existing family members
        await sequelize.query(`DELETE FROM tblcifamily WHERE ClinicID = ?`, {
          replacements: [clinicId],
          transaction
        });

        // Insert updated family members
        for (const member of updateData.familyMembers) {
          if (member.relationship && member.relationship.trim()) {
            await sequelize.query(`
              INSERT INTO tblcifamily 
              (ClinicID, Relationship, Age, HIVStatus, Status, ART, Pregnant, ARTName, TB) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
              replacements: [
                clinicId,
                member.relationship,
                member.age || '',
                member.hivStatus || -1,
                member.status || -1,
                member.art || -1,
                member.pregnant || -1,
                member.artName || '',
                member.tb || -1
              ],
              transaction
            });
          }
        }
      }

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblCImain', '2', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.json({
        message: 'Child patient updated successfully',
        patient: patient.toJSON()
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Delete child patient
router.delete('/:clinicId', [
  authenticateToken,
  requireRole(['admin']),
  param('clinicId').isNumeric().withMessage('Clinic ID must be numeric')
], async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    const transaction = await sequelize.transaction();

    try {
      // Delete all related records first (like VB.NET Delete function)
      await sequelize.query(`DELETE FROM tblcifamily WHERE ClinicID = ?`, {
        replacements: [clinicId],
        transaction
      });

      // Delete main record
      await sequelize.query(`DELETE FROM tblcimain WHERE ClinicID = ?`, {
        replacements: [clinicId],
        transaction
      });

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblCImain', '3', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.json({
        message: 'Child patient deleted successfully'
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Helper functions
function calculateAge(dateOfBirth, dateFirstVisit) {
  const birth = new Date(dateOfBirth);
  const visit = new Date(dateFirstVisit);
  const age = visit.getFullYear() - birth.getFullYear();
  const monthDiff = visit.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && visit.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
}

function getReferredText(referred) {
  const referredOptions = {
    0: 'Self Referral',
    1: 'Home/Community Care',
    2: 'VCCT',
    3: 'PMTCT',
    4: 'TB Program',
    5: 'Blood Bank',
    6: 'Other'
  };
  return referredOptions[referred] || '';
}

// Helper function to get patient status text
function getPatientStatusText(patientStatus, typeOfReturn) {
  // Patient status from tblpatientstatus: -1 = Active, 0 = Lost, 1 = Dead, 3 = Transferred Out
  if (patientStatus === 1) return 'Dead';
  if (patientStatus === 0) return 'Lost';
  if (patientStatus === 3) return 'Transferred Out';
  if (patientStatus === -1) {
    // Active patients - show type of return if available
    if (typeOfReturn === -1) return 'New';
    if (typeOfReturn === 0) return 'Return In';
    if (typeOfReturn === 1) return 'Return Out';
    return 'Active'; // Default for active patients without typeOfReturn
  }
  return 'Active';
}

module.exports = router;
