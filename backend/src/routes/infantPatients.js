const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { InfantPatient } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { Op } = require('sequelize');

const router = express.Router();

// Get infant patient status counts
router.get('/status-counts', [authenticateToken], async (req, res, next) => {
  try {
    const { site } = req.query;
    
    let whereCondition = '';
    let replacements = {};
    let conditions = [];
    
    // Convert site name to site code if needed
    let siteCode = site;
    if (site && !/^\d{4}$/.test(site)) {
      const sites = await siteDatabaseManager.getAllSites();
      const foundSite = sites.find(s => 
        s.name.toLowerCase() === site.toLowerCase() ||
        s.name.toLowerCase().includes(site.toLowerCase())
      );
      if (foundSite) {
        siteCode = foundSite.code;
      } else {
        return res.status(404).json({
          error: 'Site not found',
          message: `Site '${site}' not found or inactive`,
          availableSites: sites.map(s => ({ code: s.code, name: s.name }))
        });
      }
    }
    
    if (siteCode) {
      conditions.push('s.SiteCode = :siteCode');
      replacements.siteCode = siteCode;
    }
    
    if (conditions.length > 0) {
      whereCondition = 'WHERE ' + conditions.join(' AND ');
    }
    
    // Get status counts
    const statusCounts = await sequelize.query(`
      SELECT 
        COALESCE(ps.Status, -1) as status,
        COUNT(*) as count
      FROM tbleimain i
      LEFT JOIN tblsitename s ON i._site_code = s.SiteCode
      LEFT JOIN tblevpatientstatus ps ON i.ClinicID = ps.ClinicID
      ${whereCondition}
      GROUP BY COALESCE(ps.Status, -1)
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get total count
    const totalResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM tbleimain i
      LEFT JOIN tblsitename s ON i._site_code = s.SiteCode
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
    
    // Infant patients don't have TypeofReturn column, so set counts to 0
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

// Get all infant patients with search and pagination
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
            sequelize.fn('LPAD', sequelize.col('clinicId'), 10, '0')
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
      conditions.push('(i.ClinicID LIKE :search OR CONCAT(LPAD(i.ClinicID, 6, "0")) LIKE :search)');
      replacements.search = `%${search}%`;
    }
    
    if (clinicId) {
      conditions.push('i.ClinicID = :clinicId');
      replacements.clinicId = clinicId;
    }
    
    if (site) {
      conditions.push('s.NameEn = :site');
      replacements.site = site;
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
        conditions.push('i.TypeofReturn = -1'); // New patients
      } else if (status === 'return_in') {
        conditions.push('i.TypeofReturn = 0'); // Return In
      } else if (status === 'return_out') {
        conditions.push('i.TypeofReturn = 1'); // Return Out
      }
    }
    
    // Add age range filter (for infants, age is in months)
    if (ageRange) {
      if (ageRange === '0-6') {
        conditions.push('TIMESTAMPDIFF(MONTH, i.DaBirth, NOW()) BETWEEN 0 AND 6');
      } else if (ageRange === '6-12') {
        conditions.push('TIMESTAMPDIFF(MONTH, i.DaBirth, NOW()) BETWEEN 6 AND 12');
      } else if (ageRange === '12-18') {
        conditions.push('TIMESTAMPDIFF(MONTH, i.DaBirth, NOW()) BETWEEN 12 AND 18');
      } else if (ageRange === '18-24') {
        conditions.push('TIMESTAMPDIFF(MONTH, i.DaBirth, NOW()) BETWEEN 18 AND 24');
      }
    }
    
    // Add date range filter (first visit date)
    if (dateRange) {
      const now = new Date();
      if (dateRange === '30days') {
        conditions.push('i.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      } else if (dateRange === '90days') {
        conditions.push('i.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 90 DAY)');
      } else if (dateRange === '1year') {
        conditions.push('i.DafirstVisit >= DATE_SUB(NOW(), INTERVAL 1 YEAR)');
      }
    }
    
    // Add nationality filter
    if (nationality) {
      conditions.push('i.Nationality = :nationality');
      replacements.nationality = nationality;
    }
    
    
    const whereCondition = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Determine which database to use
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
        } else {
          return res.status(404).json({
            error: 'Site not found',
            message: `Site '${site}' not found or inactive`,
            availableSites: sites.map(s => ({ code: s.code, name: s.name }))
          });
        }
      } else {
        siteCodes = [site];
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
        FROM tbleimain i
        LEFT JOIN tblsitename s ON i.SiteName = s.SiteCode
        LEFT JOIN tblevpatientstatus ps ON i.ClinicID = ps.ClinicID
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
          i.ClinicID as clinicId,
        i.DafirstVisit as dateFirstVisit,
        i.DaBirth as dateOfBirth,
        i.Sex as sex,
        i.AddGuardian as addGuardian,
        i.DeliveryStatus as deliveryStatus,
        i.Syrup as syrup,
        i.Offin as offIn,
        :siteCode as siteCode,
        :siteName as siteName,
        i.MArt as mArt,
        NULL as nationality,
        COALESCE(ps.Status, -1) as patientStatus,
        NULL as statusCause,
        ps.DaStatus as statusDate
      FROM tbleimain i
      LEFT JOIN tblsitename s ON i.SiteName = s.SiteCode
      LEFT JOIN tblevpatientstatus ps ON i.ClinicID = ps.ClinicID
      WHERE 1=1
      ${whereCondition ? 'AND ' + whereCondition.replace('WHERE ', '') : ''}
        ORDER BY i.ClinicID DESC
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
      const artNumber = row.mArt || '';
      const extractedSiteCode = row.siteCode || '';
      const siteName = row.siteName || '';
      
      return {
        no: offset + index + 1,
        clinicId: String(row.clinicId),
        dateFirstVisit: row.dateFirstVisit || 'N/A',
        age: calculateAgeInMonths(row.dateOfBirth, row.dateFirstVisit),
        sex: row.sex === 0 ? 'Female' : row.sex === 1 ? 'Male' : 'Unknown',
        group: row.targetGroup || 'N/A',
        guardian: getGuardianText(row.addGuardian),
        deliveryStatus: getDeliveryStatusText(row.deliveryStatus),
        syrup: getSyrupText(row.syrup),
        transferIn: row.offIn === 1,
        site_code: extractedSiteCode || '',
        siteCode: extractedSiteCode || '',
        siteName: siteName,
        artNumber: artNumber,
        lostReturn: 'N/A', // Infant patients don't have TypeofReturn column
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

// Get single infant patient by clinic ID
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

    console.log(`[GET /:clinicId] Looking for infant patient: ${clinicId}, site: ${site || 'all'}`);

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
            i.ClinicID as clinicId,
            i.DafirstVisit as dateFirstVisit,
            i.DaBirth as dateOfBirth,
            i.Sex as sex,
            i.AddGuardian as addGuardian,
            i.Grou as \`group\`,
            i.House as house,
            i.Street as street,
            i.Village as village,
            i.Commune as commune,
            i.District as district,
            i.Province as province,
            i.NameContact as nameContact,
            i.AddContact as addressContact,
            i.Phone as phone,
            i.Fage as fAge,
            i.FHIV as fHIV,
            i.Fstatus as fStatus,
            i.Mage as mAge,
            i.MClinicID as mClinicId,
            i.MArt as mArt,
            i.HospitalName as hospitalName,
            i.Mstatus as mStatus,
            i.CatPlaceDelivery as catPlaceDelivery,
            i.PlaceDelivery as placeDelivery,
            i.PMTCT as pmtct,
            i.DaDelivery as dateDelivery,
            i.DeliveryStatus as deliveryStatus,
            i.LenBaby as lenBaby,
            i.WBaby as wBaby,
            i.KnownHIV as knownHIV,
            i.Received as received,
            i.Syrup as syrup,
            i.Cotrim as cotrim,
            i.Offin as offIn,
            i.SiteName as siteName,
            i.HIVtest as hivTest,
            i.MHIV as mHIV,
            i.MLastvl as mLastVl,
            i.DaMLastvl as dateMLastVl,
            i.EOClinicID as eoClinicId
          FROM tbleimain i
          WHERE i.ClinicID = :clinicId
        `, {
          replacements: { clinicId: String(clinicId).trim() },
          type: siteConnection.QueryTypes.SELECT
        });

        console.log(`[GET /:clinicId] Site ${siteCode} returned ${patient?.length || 0} patient(s)`);

        if (patient && patient.length > 0) {
          console.log(`[GET /:clinicId] Found patient ${clinicId} in site ${siteCode}`);
          return res.json(patient[0]);
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
      message: `Infant patient with Clinic ID '${clinicId}' not found`
    });

  } catch (error) {
    next(error);
  }
});

// Create new infant patient
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'doctor', 'nurse']),
  
  // Validation matching VB.NET Save() function
  body('clinicId').notEmpty().withMessage('Please input Clinic ID!'),
  body('dateFirstVisit').isISO8601().withMessage('Please input Date First Visit'),
  body('sex').isIn([0, 1]).withMessage('Please Select Patient Sex!'),
  body('dateOfBirth').isISO8601().withMessage('Date of birth is required'),
  body('age').notEmpty().withMessage('Please Input Exposed Infant Age!'),
  body('mAge').notEmpty().withMessage('Please Input Mother Age!'),
  body('lenBaby').notEmpty().withMessage('Please Input Length of baby!'),
  body('wBaby').notEmpty().withMessage('Please Input Weight of baby!'),
  
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
      dateOfBirth,
      sex,
      addGuardian = -1,
      group = '',
      house = '',
      street = '',
      village = '',
      commune = '',
      district = '',
      province = '',
      nameContact = '',
      addressContact = '',
      phone = '',
      fAge = '',
      fHIV = -1,
      fStatus = -1,
      mAge = '',
      mClinicId = '',
      mArt = '',
      hospitalName = '',
      mStatus = -1,
      catPlaceDelivery = '',
      placeDelivery = '',
      pmtct = '',
      dateDelivery = '1900-01-01',
      deliveryStatus = -1,
      lenBaby = '',
      wBaby = '',
      knownHIV = -1,
      received = -1,
      syrup = -1,
      cotrim = -1,
      offIn = -1,
      siteName = '',
      hivTest = -1,
      mHIV = -1,
      mLastVl = '',
      dateMLastVl = '1900-01-01',
      eoClinicId = ''
    } = req.body;

    // Additional validation like in VB.NET
    const age = calculateAgeInMonths(dateOfBirth, dateFirstVisit);
    if (age < 0 || age > 24) {
      return res.status(400).json({
        error: 'Invalid Patient Age',
        message: 'Age must be 0-24 months for infant patients'
      });
    }

    if (dateFirstVisit < dateOfBirth) {
      return res.status(400).json({
        error: 'Invalid Register Date',
        message: 'Date of Birth should be equal to Date of Delivery'
      });
    }

    if (mHIV === 0) {
      if (!mClinicId.trim()) {
        return res.status(400).json({
          error: 'Mother ClinicID Required',
          message: 'Please Input Mother ClinicID!'
        });
      }
      if (!mArt.trim()) {
        return res.status(400).json({
          error: 'Mother ART Number Required',
          message: 'Please Input Mother ART Number!'
        });
      }
    }

    if (dateOfBirth !== dateDelivery) {
      return res.status(400).json({
        error: 'Date Mismatch',
        message: 'Date of Birth should be equal to Date of Delivery'
      });
    }

    // Start transaction like VB.NET
    const transaction = await sequelize.transaction();

    try {
      // Insert main record (tbleimain)
      const patient = await InfantPatient.create({
        clinicId: parseInt(clinicId),
        dateFirstVisit,
        dateOfBirth,
        sex,
        addGuardian,
        group,
        house,
        street,
        village,
        commune,
        district,
        province,
        nameContact,
        addressContact,
        phone,
        fAge: fAge ? parseInt(fAge) : null,
        fHIV,
        fStatus,
        mAge: mAge ? parseInt(mAge) : null,
        mClinicId: mClinicId ? parseInt(mClinicId) : null,
        mArt,
        hospitalName,
        mStatus,
        catPlaceDelivery,
        placeDelivery,
        pmtct,
        dateDelivery,
        deliveryStatus,
        lenBaby: lenBaby ? parseFloat(lenBaby) : null,
        wBaby: wBaby ? parseFloat(wBaby) : null,
        knownHIV,
        received,
        syrup,
        cotrim,
        offIn,
        siteName,
        hivTest,
        mHIV,
        mLastVl,
        dateMLastVl,
        eoClinicId
      }, { transaction });

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblEImain', '1', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        message: 'Infant patient created successfully',
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

// Update infant patient
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
    const patient = await InfantPatient.findOne({
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

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblEImain', '2', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.json({
        message: 'Infant patient updated successfully',
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

// Delete infant patient
router.delete('/:clinicId', [
  authenticateToken,
  requireRole(['admin']),
  param('clinicId').isNumeric().withMessage('Clinic ID must be numeric')
], async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    const transaction = await sequelize.transaction();

    try {
      // Delete main record
      await sequelize.query(`DELETE FROM tbleimain WHERE ClinicID = ?`, {
        replacements: [clinicId],
        transaction
      });

      // Log the action
      await sequelize.query(`
        INSERT INTO tbllog (ClinicID, TableName, Action, DateTime) 
        VALUES (?, 'tblEImain', '3', NOW())
      `, {
        replacements: [clinicId],
        transaction
      });

      await transaction.commit();

      res.json({
        message: 'Infant patient deleted successfully'
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
function calculateAgeInMonths(dateOfBirth, dateFirstVisit) {
  if (!dateOfBirth || !dateFirstVisit) return 'N/A';
  
  const birth = new Date(dateOfBirth);
  const visit = new Date(dateFirstVisit);
  
  if (isNaN(birth.getTime()) || isNaN(visit.getTime())) return 'N/A';
  
  // Calculate age in days
  const timeDiff = visit.getTime() - birth.getTime();
  const ageInDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  if (ageInDays < 0) return 'N/A';
  
  // For infants under 1 month (30 days), show age in days
  if (ageInDays < 30) {
    return `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`;
  }
  
  // For infants 1 month and older, show age in months
  const ageInMonths = Math.floor(ageInDays / 30);
  return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
}

function getDeliveryStatusText(status) {
  const statusOptions = {
    0: 'Normal',
    1: 'Complicated',
    2: 'Unknown'
  };
  return statusOptions[status] || '';
}

function getSyrupText(syrup) {
  const syrupOptions = {
    0: 'No',
    1: 'Yes'
  };
  return syrupOptions[syrup] || '';
}

function getGuardianText(guardian) {
  const guardianOptions = {
    0: 'No',
    1: 'Yes'
  };
  return guardianOptions[guardian] || 'N/A';
}

// Helper function to get patient status text
function getPatientStatusText(patientStatus, typeOfReturn) {
  // Patient status from tblpatientstatus: -1 = Active, 0 = Lost, 1 = Dead, 3 = Transferred Out
  if (patientStatus === 1) return 'Dead';
  if (patientStatus === 0) return 'Lost';
  if (patientStatus === 3) return 'Transferred Out';
  if (patientStatus === -1) {
    // Active patients - show type of return
    if (typeOfReturn === -1) return 'New';
    if (typeOfReturn === 0) return 'Return In';
    if (typeOfReturn === 1) return 'Return Out';
    return 'Active';
  }
  return 'Active';
}

module.exports = router;
