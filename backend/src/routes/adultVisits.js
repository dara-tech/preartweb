const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { AdultVisit } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { resolveSite } = require('../utils/siteUtils');

const router = express.Router();

// Get all adult visits (for visit list)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit, search, sortBy = 'visitDate', sortOrder = 'DESC', site, ageRange, dateRange, nationality } = req.query;
    const limitNum = limit ? parseInt(limit) : 50; // Default to 50 items per page
    const offset = (parseInt(page) - 1) * limitNum;

    let whereClause = {};
    
    // Add search functionality
    if (search) {
      whereClause = {
        [Op.or]: [
          { clinicId: { [Op.like]: `%${search}%` } },
          { artNumber: { [Op.like]: `%${search}%` } },
          { visitDate: { [Op.like]: `%${search}%` } },
          { targetGroup: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // Validate sortBy field and map to actual database column names
    const fieldMapping = {
      'visitDate': 'DatVisit',
      'clinicId': 'ClinicID', 
      'artNumber': 'ARTnum',
      'whoStage': 'WHO',
      'hivViral': 'ReVL',
      'visitId': 'Vid'
    };
    const allowedSortFields = ['visitDate', 'clinicId', 'artNumber', 'whoStage', 'hivViral', 'visitId'];
    const sortField = allowedSortFields.includes(sortBy) ? fieldMapping[sortBy] : 'DatVisit';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Use raw SQL to include patient status
    let whereConditions = [];
    
    // Add search condition
    if (search) {
      whereConditions.push(`(v.ClinicID LIKE '%${search}%' OR v.ARTnum LIKE '%${search}%' OR v.DatVisit LIKE '%${search}%' OR v.TestID LIKE '%${search}%')`);
    }
    
    // Site filtering is handled by connecting to the correct site database
    // No need to filter by _site_code since we're already in the correct database
    
    // Add status filter condition
    if (req.query.statusFilter && req.query.statusFilter !== 'all') {
      const statusFilter = req.query.statusFilter.toLowerCase();
      switch (statusFilter) {
        case 'active':
          whereConditions.push(`(COALESCE(ps.Status, -1) = -1 OR ps.Status IS NULL)`);
          break;
        case 'lost':
          whereConditions.push(`COALESCE(ps.Status, -1) = 0`);
          break;
        case 'dead':
          whereConditions.push(`COALESCE(ps.Status, -1) = 1`);
          break;
        case 'transferred out':
          whereConditions.push(`COALESCE(ps.Status, -1) = 3`);
          break;
      }
    }
    
    // Add age range filter condition
    if (ageRange && ageRange !== 'all') {
      switch (ageRange) {
        case '0-17':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) BETWEEN 0 AND 17`);
          break;
        case '18-24':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) BETWEEN 18 AND 24`);
          break;
        case '25-34':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) BETWEEN 25 AND 34`);
          break;
        case '35-44':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) BETWEEN 35 AND 44`);
          break;
        case '45-54':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) BETWEEN 45 AND 54`);
          break;
        case '55+':
          whereConditions.push(`TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) >= 55`);
          break;
      }
    }
    
    // Add date range filter condition
    if (dateRange && dateRange !== 'all') {
      switch (dateRange) {
        case 'today':
          whereConditions.push(`DATE(v.DatVisit) = CURDATE()`);
          break;
        case 'week':
          whereConditions.push(`v.DatVisit >= DATE_SUB(NOW(), INTERVAL 1 WEEK)`);
          break;
        case 'month':
          whereConditions.push(`v.DatVisit >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`);
          break;
        case 'year':
          whereConditions.push(`v.DatVisit >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`);
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
        FROM tblavmain v
        LEFT JOIN tblaimain p ON v.ClinicID = p.ClinicID
        LEFT JOIN tblavpatientstatus ps ON v.ClinicID = ps.ClinicID
        WHERE 1=1
        ${whereCondition ? 'AND ' + whereCondition.replace('WHERE ', '') : ''}
      `;
      const countResult = await siteConnection.query(countQuery, {
        type: siteConnection.QueryTypes.SELECT
      });
      totalCount += countResult[0].count;
    }

    // Get visits from all sites
    let allVisits = [];
    for (const siteCode of siteCodes) {
      const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
      const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
      const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
      const visitsQuery = `
        SELECT 
          v.ClinicID as clinicId,
          v.ARTnum as artNumber,
          v.DatVisit as visitDate,
          v.TypeVisit as visitStatus,
          v.Weight as weight,
          v.Height as height,
          v.WHO as whoStage,
          v.Eligible as eligible,
          COALESCE(pt.HIVLoad, v.ReVL) as hivViral,
          COALESCE(pt.HIVLog, '') as hivViralLog,
          v.ReCD4 as cd4,
          v.Vid as visitId,
          v.DaApp as nextAppointment,
          COALESCE(ps.Status, -1) as patientStatus,
          TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) as age,
          ps.Status as rawPatientStatus,
          ps.Da as patientStatusDate,
          ps.Place as statusPlace,
          ps.OPlace as statusOtherPlace,
          ps.Cause as statusCause,
          p.Sex as sex,
          p.ClinicID as patientId,
          NULL as notes,
          '${siteCode}' as siteCode,
          '${siteName}' as siteName
        FROM tblavmain v
        LEFT JOIN tblaimain p ON v.ClinicID = p.ClinicID
        LEFT JOIN (
          SELECT ClinicID, HIVLoad, HIVLog, Dat,
                 ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY Dat DESC) as rn
          FROM tblpatienttest
          WHERE HIVLoad IS NOT NULL AND HIVLoad != '' AND HIVLoad != '0'
        ) pt ON v.ClinicID = pt.ClinicID AND pt.rn = 1
        LEFT JOIN (
          SELECT ClinicID, Status, Da, Place, OPlace, Cause,
                 ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY Da DESC) as rn
          FROM tblavpatientstatus
        ) ps ON v.ClinicID = ps.ClinicID AND ps.rn = 1
        WHERE 1=1
        ${whereCondition ? 'AND ' + whereCondition.replace('WHERE ', '') : ''}
      `;

      const visits = await siteConnection.query(visitsQuery, {
        type: siteConnection.QueryTypes.SELECT
      });
      
      allVisits = allVisits.concat(visits);
    }
    
    // Sort all results and apply pagination
    allVisits.sort((a, b) => {
      if (sortBy === 'visitDate') {
        return sortOrder === 'asc' ? new Date(a.visitDate) - new Date(b.visitDate) : new Date(b.visitDate) - new Date(a.visitDate);
      }
      if (sortBy === 'clinicId') {
        return sortOrder === 'asc' ? a.clinicId - b.clinicId : b.clinicId - a.clinicId;
      }
      return new Date(b.visitDate) - new Date(a.visitDate);
    });
    
    const paginatedVisits = limitNum ? allVisits.slice(offset, offset + limitNum) : allVisits;

    // Map status values to readable text (matching old system)
    const statusMap = {
      '-1': 'Active',
      0: 'Lost',
      1: 'Dead', 
      3: 'Transferred Out'
    };

    // Get cause of death lookup
    const causeLookup = {};
    try {
      const causeData = await siteConnection.query('SELECT ID, Ctype, Cause FROM tblcausedeath WHERE Status = 1', {
        type: siteConnection.QueryTypes.SELECT
      });
      
      causeData.forEach(cause => {
        const key = `${cause.Ctype}/${cause.ID}`;
        causeLookup[key] = cause.Cause.trim();
      });
    } catch (error) {
      console.log('Error loading cause of death lookup:', error.message);
    }

    const formattedVisits = paginatedVisits.map(visit => {
      // Use site information directly from the query results (from registry database)
      const artNumber = visit.artNumber || '';
      const extractedSiteCode = visit.siteCode || '';
      const siteName = visit.siteName || '';
      
      // Map sex values to readable text (-1=not selected, 0=Female, 1=Male)
      const sexMap = {
        1: 'Male',
        0: 'Female',
        '-1': 'Not Selected'
      };
      const sexText = sexMap[visit.sex] || 'Not Selected';
      
      // Map patient status values for Adult Visits (-1=not selected, 0=Lost, 1=Dead, 3=Transferred out)
      const statusMap = {
        '-1': 'Active',
        '0': 'Lost',
        '1': 'Dead',
        '3': 'Transferred Out'
      };
      
      let statusText = statusMap[visit.patientStatus] || 'Active';
      
      // If patient is dead, create advanced status display with cause and place
      if (visit.patientStatus === 1) {
        let causeText = '';
        let placeText = '';
        
        // Handle cause
        if (visit.statusCause) {
          const cause = visit.statusCause.toString().trim();
          
          if (cause === '' || cause === 'null' || cause === 'undefined') {
            causeText = 'Unknown cause';
          } else if (cause.includes('/')) {
            // Handle different code formats
            if (cause.endsWith('/')) {
              // Incomplete code like "0/" - show "Unknown cause"
              causeText = 'Unknown cause';
            } else if (causeLookup[cause]) {
              causeText = causeLookup[cause];
            } else {
              // Try to extract just the ID part for lookup
              const parts = cause.split('/');
              if (parts.length === 2 && parts[1]) {
                const fallbackKey = `0/${parts[1]}`;
                if (causeLookup[fallbackKey]) {
                  causeText = causeLookup[fallbackKey];
                } else {
                  causeText = 'Unknown cause';
                }
              } else {
                causeText = 'Unknown cause';
              }
            }
          } else {
            // Direct text (e.g., Khmer text) - use as is
            causeText = cause;
          }
        } else {
          causeText = 'Unknown cause';
        }
        
        // Handle place
        if (visit.statusPlace !== null && visit.statusPlace !== undefined && visit.statusPlace >= 0) {
          switch (visit.statusPlace) {
            case 0:
              placeText = ' (Home)';
              break;
            case 1:
              placeText = ' (Hospital)';
              break;
            case 2:
              placeText = visit.statusOtherPlace ? ` (${visit.statusOtherPlace})` : ' (Other)';
              break;
            default:
              placeText = '';
          }
        }
        
        // Combine cause and place
        statusText = causeText + placeText;
      }
      
      return {
        ...visit,
        siteName: siteName,
        site_code: extractedSiteCode,
        patientStatus: statusText,
        sex: sexText
      };
    });

    res.json({
      visits: formattedVisits,
      total: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limitNum),
      limit: limitNum,
      hasNextPage: parseInt(page) < Math.ceil(totalCount / limitNum),
      hasPrevPage: parseInt(page) > 1
    });
  } catch (error) {
    next(error);
  }
});

// Get all adult visits for a patient
router.get('/:clinicId', [authenticateToken], async (req, res, next) => {
  try {
    const { clinicId } = req.params;
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
          error: 'Site not found',
          message: error.message
        });
      }
    } else {
      // If no site specified, search all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    // Search for visits in all sites
    let allVisits = [];
    const clinicIdStr = String(clinicId).trim();
    
    for (const siteCode of siteCodes) {
      try {
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
        const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
        
        const visits = await siteConnection.query(`
          SELECT 
            v.ClinicID as clinicId,
            v.ARTnum as artNumber,
            v.DatVisit as visitDate,
            v.TypeVisit as visitStatus,
            v.Weight as weight,
            v.Height as height,
            v.WHO as whoStage,
            v.Eligible as eligible,
            COALESCE(pt.HIVLoad, v.ReVL) as hivViral,
            COALESCE(pt.HIVLog, '') as hivViralLog,
            v.ReCD4 as cd4,
            v.Vid as visitId,
            v.DaApp as nextAppointment,
            COALESCE(ps.Status, -1) as patientStatus,
            TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) as age,
            ps.Status as rawPatientStatus,
            ps.Da as patientStatusDate,
            ps.Place as statusPlace,
            ps.OPlace as statusOtherPlace,
            ps.Cause as statusCause,
            p.Sex as sex,
            p.ClinicID as patientId,
            '${siteCode}' as siteCode,
            '${siteName}' as siteName
          FROM tblavmain v
          LEFT JOIN tblaimain p ON v.ClinicID = p.ClinicID
          LEFT JOIN (
            SELECT ClinicID, HIVLoad, HIVLog, Dat,
                   ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY Dat DESC) as rn
            FROM tblpatienttest
            WHERE HIVLoad IS NOT NULL AND HIVLoad != '' AND HIVLoad != '0'
          ) pt ON v.ClinicID = pt.ClinicID AND pt.rn = 1
          LEFT JOIN (
            SELECT ClinicID, Status, Da, Place, OPlace, Cause,
                   ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY Da DESC) as rn
            FROM tblavpatientstatus
          ) ps ON v.ClinicID = ps.ClinicID AND ps.rn = 1
          WHERE v.ClinicID = :clinicId
          ORDER BY v.DatVisit DESC
        `, {
          replacements: { clinicId: clinicIdStr },
          type: siteConnection.QueryTypes.SELECT
        });
        
        allVisits = allVisits.concat(visits);
      } catch (error) {
        console.error(`Error querying site ${siteCode} for visits:`, error.message);
        // Continue searching other sites
      }
    }

    res.json({ visits: allVisits });
  } catch (error) {
    next(error);
  }
});

// Get a specific visit
router.get('/:clinicId/:visitId', [authenticateToken], async (req, res, next) => {
  try {
    const { clinicId, visitId } = req.params;
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
          error: 'Site not found',
          message: error.message
        });
      }
    } else {
      // If no site specified, search all available sites
      const allSites = await siteDatabaseManager.getAllSites();
      siteCodes = allSites.map(s => s.code);
    }

    // Search for the visit in all sites
    const clinicIdStr = String(clinicId).trim();
    const visitIdStr = String(visitId).trim();
    
    for (const siteCode of siteCodes) {
      try {
        const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
        const siteInfo = await siteDatabaseManager.getSiteInfo(siteCode);
        const siteName = siteInfo?.display_name || siteInfo?.short_name || siteInfo?.name || siteCode;
        
        // Get main visit data with all columns
        const visitResults = await siteConnection.query(`
          SELECT v.*,
            TIMESTAMPDIFF(YEAR, p.DaBirth, v.DatVisit) as age,
            p.Sex as sex,
            p.ClinicID as patientId,
            app.Doctore as doctorId,
            app.Time as meetTime,
            '${siteCode}' as siteCode,
            '${siteName}' as siteName
          FROM tblavmain v
          LEFT JOIN tblaimain p ON v.ClinicID = p.ClinicID
          LEFT JOIN tblAppointment app ON v.Vid = app.Vid
          WHERE v.ClinicID = :clinicId AND v.Vid = :visitId
          LIMIT 1
        `, {
          replacements: { clinicId: clinicIdStr, visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });
        
        if (!visitResults || visitResults.length === 0) {
          continue; // Try next site
        }

        const visit = visitResults[0];

        // Get ARV drugs - Old system filters by Status IN ('0','1','2') to exclude -1
        // Note: Old system uses string comparison with quotes, but Status is integer in DB
        const arvDrugs = await siteConnection.query(`
          SELECT * FROM tblavarvdrug 
          WHERE Vid = :visitId AND Status IN (0, 1, 2)
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });

        // Get OI drugs - Same Status filter
        const oiDrugs = await siteConnection.query(`
          SELECT * FROM tblavoidrug 
          WHERE Vid = :visitId AND Status IN (0, 1, 2)
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });

        // Get TB drugs - Same Status filter
        const tbDrugs = await siteConnection.query(`
          SELECT * FROM tblavtbdrug 
          WHERE Vid = :visitId AND Status IN (0, 1, 2)
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });

        // Get HCV drugs - Same Status filter
        const hcvDrugs = await siteConnection.query(`
          SELECT * FROM tblavhydrug 
          WHERE Vid = :visitId AND Status IN (0, 1, 2)
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });

        // Get TPT drugs - Same Status filter
        const tptDrugs = await siteConnection.query(`
          SELECT * FROM tblavtptdrug 
          WHERE Vid = :visitId AND Status IN (0, 1, 2)
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });
        
        console.log(`[DEBUG] Drug counts for visit ${visitIdStr}: ARV=${arvDrugs?.length || 0}, OI=${oiDrugs?.length || 0}, TB=${tbDrugs?.length || 0}, HCV=${hcvDrugs?.length || 0}, TPT=${tptDrugs?.length || 0}`);

        // Get test data
        const testData = await siteConnection.query(`
          SELECT * FROM tblpatienttest WHERE TestID = :testId LIMIT 1
        `, {
          replacements: { testId: visit.TestID || '' },
          type: siteConnection.QueryTypes.SELECT
        });

        // Get patient status
        const patientStatus = await siteConnection.query(`
          SELECT * FROM tblavpatientstatus WHERE Vid = :visitId LIMIT 1
        `, {
          replacements: { visitId: visitIdStr },
          type: siteConnection.QueryTypes.SELECT
        });

        // Map all data to frontend format
        const visitData = {
          // Main visit fields - map all columns from tblavmain
          clinicId: visit.ClinicID,
          artNumber: visit.ARTnum || '',
          visitDate: visit.DatVisit,
          visitStatus: visit.TypeVisit,
          visitId: visit.Vid,
          
          // Demographics
          pregnantStatus: visit.Womenstatus !== null && visit.Womenstatus !== undefined ? visit.Womenstatus : -1,
          typePregnant: visit.PregStatus !== null && visit.PregStatus !== undefined ? visit.PregStatus : -1,
          pregnantDate: visit.DaPreg || '1900-01-01',
          ancStatus: visit.ANCservice !== null && visit.ANCservice !== undefined ? visit.ANCservice : -1,
          
          // Physical Measurements
          weight: visit.Weight || 0,
          height: visit.Height || 0,
          temperature: visit.Temp || 0,
          pulse: visit.Pulse || 0,
          respiration: visit.Resp || 0,
          bloodPressure: visit.Blood || '0/0',
          
          // Counselling
          prevention: visit.STIPreven === 'True' || visit.STIPreven === true ? '1' : '0',
          adherence: visit.ARTAdher === 'True' || visit.ARTAdher === true ? '1' : '0',
          spacing: visit.Birthspac === 'True' || visit.Birthspac === true ? '1' : '0',
          tbInfect: visit.TBinfect === 'True' || visit.TBinfect === true ? '1' : '0',
          partner: visit.Partner === 'True' || visit.Partner === true ? '1' : '0',
          condom: visit.Condoms === 'True' || visit.Condoms === true ? '1' : '0',
          
          // Contraceptive Methods
          typeClient: visit.CMTypeClient !== null && visit.CMTypeClient !== undefined ? visit.CMTypeClient : -1,
          useDate: visit.CMDaUse || '1900-01-01',
          condomCount: visit.CMCondom || '0',
          cocCount: visit.CoC || '0',
          pocCount: visit.Poc || '0',
          drugCount: visit.CMVaccine || '0',
          placeService: visit.UseOther === 'True' || visit.UseOther === true ? '1' : '0',
          condomUsed: visit.OCMcondom || '0',
          cocUsed: visit.OCoc || '0',
          pocUsed: visit.OPoC || '0',
          drugUsed: visit.OCMVaccin || '0',
          otherUsed: visit.OCMother || '0',
          
          // Symptoms
          cough: visit.Cough !== null && visit.Cough !== undefined ? visit.Cough : -1,
          fever: visit.Fever !== null && visit.Fever !== undefined ? visit.Fever : -1,
          lostWeight: visit.Wlost !== null && visit.Wlost !== undefined ? visit.Wlost : -1,
          sweet: visit.Drenching !== null && visit.Drenching !== undefined ? visit.Drenching : -1,
          urine: visit.Urine !== null && visit.Urine !== undefined ? visit.Urine : -1,
          genital: visit.Genital !== null && visit.Genital !== undefined ? visit.Genital : -1,
          chemnah: visit.Chemnah !== null && visit.Chemnah !== undefined ? visit.Chemnah : -1,
          
          // Hospitalization
          hospital: visit.Hospital !== null && visit.Hospital !== undefined ? visit.Hospital : -1,
          numHospital: visit.NumDay || '0',
          reasonHospital: visit.CauseHospital || '',
          
          // Adherence
          missARV: visit.MissARV !== null && visit.MissARV !== undefined ? visit.MissARV : -1,
          missTime: visit.MissTime || '0',
          
          // Assessment
          whoStage: visit.WHO !== null && visit.WHO !== undefined ? visit.WHO : 0,
          eligible: visit.Eligible !== null && visit.Eligible !== undefined ? visit.Eligible : -1,
          function: visit.Function !== null && visit.Function !== undefined ? visit.Function : -1,
          tb: visit.TB !== null && visit.TB !== undefined ? visit.TB : -1,
          tbResult: visit.TypeTB !== null && visit.TypeTB !== undefined ? visit.TypeTB : -1,
          tbTreat: visit.TBtreat !== null && visit.TBtreat !== undefined ? visit.TBtreat : -1,
          tbDate: visit.DaTBtreat || '1900-01-01',
          
          // HIV Testing
          testHIV: visit.TestHIV === 'True' || visit.TestHIV === true ? '1' : '0',
          resultHIV: visit.ResultHIV !== null && visit.ResultHIV !== undefined ? visit.ResultHIV : -1,
          cd4Test: visit.ReCD4 !== null && visit.ReCD4 !== undefined ? visit.ReCD4 : -1,
          hivViralTest: visit.ReVL !== null && visit.ReVL !== undefined ? visit.ReVL : -1,
          hcvViralTest: visit.ReHCV !== null && visit.ReHCV !== undefined ? visit.ReHCV : -1,
          grAG: visit.CrAG === 'True' || visit.CrAG === true ? '1' : '0',
          resultCrAG: visit.CrAGResult !== null && visit.CrAGResult !== undefined ? visit.CrAGResult : -1,
          viralDetect: visit.VLDetectable !== null && visit.VLDetectable !== undefined ? visit.VLDetectable : -1,
          
          // Referral
          refer: visit.Referred !== null && visit.Referred !== undefined ? visit.Referred : -1,
          referOther: visit.OReferred || '',
          
          // Side Effects
          moderate: visit.Moderate === 'True' || visit.Moderate === true ? '1' : '0',
          tdf: visit.Renal === 'True' || visit.Renal === true ? '1' : '0',
          rash: visit.Rash === 'True' || visit.Rash === true ? '1' : '0',
          hepatitis: visit.Hepatitis === 'True' || visit.Hepatitis === true ? '1' : '0',
          peripheral: visit.Peripheral === 'True' || visit.Peripheral === true ? '1' : '0',
          azt: visit.Neutropenia === 'True' || visit.Neutropenia === true ? '1' : '0',
          lpv: visit.Hyperlipidemia === 'True' || visit.Hyperlipidemia === true ? '1' : '0',
          lactic: visit.Lactic === 'True' || visit.Lactic === true ? '1' : '0',
          abc: visit.Hypersensitivity === 'True' || visit.Hypersensitivity === true ? '1' : '0',
          atv: visit.Jaundice === 'True' || visit.Jaundice === true ? '1' : '0',
          mediOther: visit.MTother || '',
          
          // Treatment
          arvLine: visit.ARVreg !== null && visit.ARVreg !== undefined ? visit.ARVreg : -1,
          resultHype: visit.ResultHC !== null && visit.ResultHC !== undefined ? visit.ResultHC : -1,
          tpt: visit.TPTout !== null && visit.TPTout !== undefined ? visit.TPTout : -1,
          tbOut: visit.TBout !== null && visit.TBout !== undefined ? visit.TBout : -1,
          
          // Follow-up
          appointmentDate: visit.DaApp || '',
          doctorId: visit.doctorId || '',
          meetTime: visit.meetTime !== null && visit.meetTime !== undefined ? String(visit.meetTime) : '',
          
          // Patient info
          age: visit.age,
          gender: visit.sex !== null && visit.sex !== undefined ? String(visit.sex) : '',
          
          // Test data
          cd4: testData && testData.length > 0 ? (testData[0].CD4 || -1) : (visit.ReCD4 === 0 ? -1 : -1),
          cd4Date: testData && testData.length > 0 ? (testData[0].Dat || '1900-01-01') : '1900-01-01',
          hivViral: testData && testData.length > 0 ? (testData[0].HIVLoad || '-1') : '-1',
          viralLoadDate: testData && testData.length > 0 ? (testData[0].Dat || '1900-01-01') : '1900-01-01',
          
          // Patient Status
          patientStatus: patientStatus && patientStatus.length > 0 ? patientStatus[0].Status : -1,
          placeDead: patientStatus && patientStatus.length > 0 ? patientStatus[0].Place : -1,
          causeDeath: patientStatus && patientStatus.length > 0 ? (patientStatus[0].Cause || '') : '',
          outcomeDate: patientStatus && patientStatus.length > 0 ? (patientStatus[0].Da || '1900-01-01') : '1900-01-01',
          otherDead: patientStatus && patientStatus.length > 0 ? (patientStatus[0].OPlace || '') : '',
          transferOut: patientStatus && patientStatus.length > 0 && patientStatus[0].Status === 3 ? (patientStatus[0].Cause || '') : '',
          
          // Drug arrays
          arvDrugs: arvDrugs || [],
          oiDrugs: oiDrugs || [],
          tbDrugs: tbDrugs || [],
          hcvDrugs: hcvDrugs || [],
          tptDrugs: tptDrugs || [],
          
          // Site info
          siteCode: visit.siteCode,
          siteName: visit.siteName
        };

        // Map drug arrays to numbered fields (for frontend compatibility)
        arvDrugs.forEach((drug, index) => {
          if (index < 8) {
            visitData[`arvDrug${index + 1}`] = drug.DrugName || '';
            visitData[`arvDose${index + 1}`] = drug.Dose || '';
            visitData[`arvQuantity${index + 1}`] = drug.Quantity || '';
            visitData[`arvFrequency${index + 1}`] = drug.Freq || '';
            visitData[`arvForm${index + 1}`] = drug.Form || '';
            visitData[`arvStatus${index + 1}`] = drug.Status !== null && drug.Status !== undefined ? String(drug.Status) : '-1';
            visitData[`arvDate${index + 1}`] = drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '';
            visitData[`arvReason${index + 1}`] = drug.Reason || '';
            visitData[`arvRemarks${index + 1}`] = drug.Remark || '';
          }
        });

        oiDrugs.forEach((drug, index) => {
          if (index < 5) {
            visitData[`oiDrug${index + 1}`] = drug.DrugName || '';
            visitData[`oiDose${index + 1}`] = drug.Dose || '';
            visitData[`oiQuantity${index + 1}`] = drug.Quantity || '';
            visitData[`oiFrequency${index + 1}`] = drug.Freq || '';
            visitData[`oiForm${index + 1}`] = drug.Form || '';
            visitData[`oiStatus${index + 1}`] = drug.Status !== null && drug.Status !== undefined ? String(drug.Status) : '-1';
            visitData[`oiDate${index + 1}`] = drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '';
            visitData[`oiReason${index + 1}`] = drug.Reason || '';
            visitData[`oiRemarks${index + 1}`] = drug.Remark || '';
            visitData[`oiStart${index + 1}`] = drug.Status === 0 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`oiStop${index + 1}`] = drug.Status === 1 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`oiContinue${index + 1}`] = drug.Status === 2 ? '1' : '';
          }
        });

        tbDrugs.forEach((drug, index) => {
          if (index < 3) {
            visitData[`tbDrug${index + 1}`] = drug.DrugName || '';
            visitData[`tbDose${index + 1}`] = drug.Dose || '';
            visitData[`tbQuantity${index + 1}`] = drug.Quantity || '';
            visitData[`tbFrequency${index + 1}`] = drug.Freq || '';
            visitData[`tbForm${index + 1}`] = drug.Form || '';
            visitData[`tbStatus${index + 1}`] = drug.Status !== null && drug.Status !== undefined ? String(drug.Status) : '-1';
            visitData[`tbDate${index + 1}`] = drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '';
            visitData[`tbReason${index + 1}`] = drug.Reason || '';
            visitData[`tbRemarks${index + 1}`] = drug.Remark || '';
            visitData[`tbStart${index + 1}`] = drug.Status === 0 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`tbStop${index + 1}`] = drug.Status === 1 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`tbContinue${index + 1}`] = drug.Status === 2 ? '1' : '';
          }
        });

        hcvDrugs.forEach((drug, index) => {
          if (index < 3) {
            visitData[`hcvDrug${index + 1}`] = drug.DrugName || '';
            visitData[`hcvDose${index + 1}`] = drug.Dose || '';
            visitData[`hcvQuantity${index + 1}`] = drug.Quantity || '';
            visitData[`hcvFrequency${index + 1}`] = drug.Freq || '';
            visitData[`hcvForm${index + 1}`] = drug.Form || '';
            visitData[`hcvStatus${index + 1}`] = drug.Status !== null && drug.Status !== undefined ? String(drug.Status) : '-1';
            visitData[`hcvDate${index + 1}`] = drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '';
            visitData[`hcvReason${index + 1}`] = drug.Reason || '';
            visitData[`hcvRemarks${index + 1}`] = drug.Remark || '';
            visitData[`hcvStart${index + 1}`] = drug.Status === 0 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`hcvStop${index + 1}`] = drug.Status === 1 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
            visitData[`hcvContinue${index + 1}`] = drug.Status === 2 ? '1' : '';
          }
        });

        // Map TPT drugs
        if (tptDrugs && tptDrugs.length > 0) {
          console.log(`[DEBUG] Found ${tptDrugs.length} TPT drugs for visit ${visitIdStr}`);
          tptDrugs.forEach((drug, index) => {
            if (index < 4) {
              visitData[`tptDrug${index + 1}`] = drug.DrugName || '';
              visitData[`tptDose${index + 1}`] = drug.Dose || '';
              visitData[`tptQuantity${index + 1}`] = drug.Quantity || '';
              visitData[`tptFrequency${index + 1}`] = drug.Freq || '';
              visitData[`tptForm${index + 1}`] = drug.Form || '';
              visitData[`tptStatus${index + 1}`] = drug.Status !== null && drug.Status !== undefined ? String(drug.Status) : '-1';
              visitData[`tptDate${index + 1}`] = drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '';
              visitData[`tptReason${index + 1}`] = drug.Reason || '';
              visitData[`tptRemarks${index + 1}`] = drug.Remark || '';
              visitData[`tptStart${index + 1}`] = drug.Status === 0 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
              visitData[`tptStop${index + 1}`] = drug.Status === 1 ? (drug.Da && drug.Da !== '1900-01-01' ? drug.Da : '') : '';
              visitData[`tptContinue${index + 1}`] = drug.Status === 2 ? '1' : '';
            }
          });
        } else {
          console.log(`[DEBUG] No TPT drugs found for visit ${visitIdStr}`);
        }
        
        return res.json({ visit: visitData });
      } catch (error) {
        console.error(`Error querying site ${siteCode} for visit:`, error.message);
        // Continue searching other sites
      }
    }

    return res.status(404).json({ error: 'Visit not found' });
  } catch (error) {
    next(error);
  }
});

// Create a new visit
router.post('/', [
  authenticateToken,
  body('clinicId').notEmpty().withMessage('Clinic ID is required'),
  body('artNumber').notEmpty().withMessage('ART Number is required'),
  body('visitDate').isISO8601().withMessage('Valid visit date is required'),
  body('visitId').notEmpty().withMessage('Visit ID is required'),
  body('site').notEmpty().withMessage('Site is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const visitData = req.body;
    const { site } = visitData;
    
    // Resolve site code
    let siteCode;
    try {
      const { siteCode: resolvedSiteCode } = await resolveSite(site);
      siteCode = resolvedSiteCode;
    } catch (error) {
      return res.status(404).json({
        error: 'Site not found',
        message: error.message
      });
    }

    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    // Check if visit already exists
    const existingVisit = await siteConnection.query(`
      SELECT * FROM tblavmain 
      WHERE ClinicID = :clinicId AND Vid = :visitId
      LIMIT 1
    `, {
      replacements: { 
        clinicId: String(visitData.clinicId).trim(), 
        visitId: String(visitData.visitId).trim() 
      },
      type: siteConnection.QueryTypes.SELECT
    });

    if (existingVisit && existingVisit.length > 0) {
      return res.status(400).json({ error: 'Visit already exists' });
    }

    // Insert visit - map frontend fields to database columns
    await siteConnection.query(`
      INSERT INTO tblavmain (
        ClinicID, DatVisit, ARTnum, DaApp, Vid,
        TypeVisit, Weight, Height, WHO, Eligible, ReCD4, ReVL
      ) VALUES (
        :clinicId, :visitDate, :artNumber, :nextAppointment, :visitId,
        :visitStatus, :weight, :height, :whoStage, :eligible, :cd4, :hivViral
      )
    `, {
      replacements: {
        clinicId: String(visitData.clinicId).trim(),
        visitDate: visitData.visitDate || new Date().toISOString().split('T')[0],
        artNumber: visitData.artNumber || '',
        nextAppointment: visitData.nextAppointment || visitData.visitDate || new Date().toISOString().split('T')[0],
        visitId: String(visitData.visitId).trim(),
        visitStatus: visitData.visitStatus ?? -1,
        weight: visitData.weight ?? null,
        height: visitData.height ?? null,
        whoStage: visitData.whoStage ?? -1,
        eligible: visitData.eligible ?? -1,
        cd4: visitData.cd4 ?? -1,
        hivViral: visitData.hivViral ?? -1
      }
    });

    // Fetch the created visit
    const createdVisit = await siteConnection.query(`
      SELECT * FROM tblavmain 
      WHERE ClinicID = :clinicId AND Vid = :visitId
      LIMIT 1
    `, {
      replacements: { 
        clinicId: String(visitData.clinicId).trim(), 
        visitId: String(visitData.visitId).trim() 
      },
      type: siteConnection.QueryTypes.SELECT
    });

    res.status(201).json({ visit: createdVisit[0] });
  } catch (error) {
    next(error);
  }
});

// Update a visit
router.put('/:clinicId/:visitId', [
  authenticateToken,
  body('visitDate').optional().isISO8601().withMessage('Valid visit date is required'),
  body('site').notEmpty().withMessage('Site is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clinicId, visitId } = req.params;
    const updateData = req.body;
    const { site } = updateData;
    
    // Resolve site code
    let siteCode;
    try {
      const { siteCode: resolvedSiteCode } = await resolveSite(site);
      siteCode = resolvedSiteCode;
    } catch (error) {
      return res.status(404).json({
        error: 'Site not found',
        message: error.message
      });
    }

    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    const clinicIdStr = String(clinicId).trim();
    const visitIdStr = String(visitId).trim();

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const replacements = { clinicId: clinicIdStr, visitId: visitIdStr };

    if (updateData.visitDate !== undefined) {
      updateFields.push('DatVisit = :visitDate');
      replacements.visitDate = updateData.visitDate;
    }
    if (updateData.artNumber !== undefined) {
      updateFields.push('ARTnum = :artNumber');
      replacements.artNumber = updateData.artNumber;
    }
    if (updateData.nextAppointment !== undefined) {
      updateFields.push('DaApp = :nextAppointment');
      replacements.nextAppointment = updateData.nextAppointment;
    }
    if (updateData.visitStatus !== undefined) {
      updateFields.push('TypeVisit = :visitStatus');
      replacements.visitStatus = updateData.visitStatus;
    }
    if (updateData.weight !== undefined) {
      updateFields.push('Weight = :weight');
      replacements.weight = updateData.weight;
    }
    if (updateData.height !== undefined) {
      updateFields.push('Height = :height');
      replacements.height = updateData.height;
    }
    if (updateData.whoStage !== undefined) {
      updateFields.push('WHO = :whoStage');
      replacements.whoStage = updateData.whoStage;
    }
    if (updateData.eligible !== undefined) {
      updateFields.push('Eligible = :eligible');
      replacements.eligible = updateData.eligible;
    }
    if (updateData.cd4 !== undefined) {
      updateFields.push('ReCD4 = :cd4');
      replacements.cd4 = updateData.cd4;
    }
    if (updateData.hivViral !== undefined) {
      updateFields.push('ReVL = :hivViral');
      replacements.hivViral = updateData.hivViral;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateQuery = `
      UPDATE tblavmain 
      SET ${updateFields.join(', ')}
      WHERE ClinicID = :clinicId AND Vid = :visitId
    `;

    const [results, metadata] = await siteConnection.query(updateQuery, {
      replacements
    });

    if (metadata.affectedRows === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Fetch the updated visit
    const updatedVisit = await siteConnection.query(`
      SELECT * FROM tblavmain 
      WHERE ClinicID = :clinicId AND Vid = :visitId
      LIMIT 1
    `, {
      replacements: { clinicId: clinicIdStr, visitId: visitIdStr },
      type: siteConnection.QueryTypes.SELECT
    });

    res.json({ visit: updatedVisit[0] });
  } catch (error) {
    next(error);
  }
});

// Delete a visit
router.delete('/:clinicId/:visitId', [authenticateToken], async (req, res, next) => {
  try {
    const { clinicId, visitId } = req.params;
    const { site } = req.query;

    if (!site) {
      return res.status(400).json({ error: 'Site parameter is required' });
    }

    // Resolve site code
    let siteCode;
    try {
      const { siteCode: resolvedSiteCode } = await resolveSite(site);
      siteCode = resolvedSiteCode;
    } catch (error) {
      return res.status(404).json({
        error: 'Site not found',
        message: error.message
      });
    }

    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    const clinicIdStr = String(clinicId).trim();
    const visitIdStr = String(visitId).trim();

    const [results, metadata] = await siteConnection.query(`
      DELETE FROM tblavmain 
      WHERE ClinicID = :clinicId AND Vid = :visitId
    `, {
      replacements: { clinicId: clinicIdStr, visitId: visitIdStr }
    });

    if (metadata.affectedRows === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
