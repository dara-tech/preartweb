const express = require('express');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { authenticateToken } = require('../middleware/auth');
const { getSiteConnection } = require('../utils/siteUtils');

const router = express.Router();

// Get all sites (tblsitename)
router.get('/sites', async (req, res, next) => {
  try {
    const { connection: siteConnection } = await getSiteConnection(req.query.site);
    
    const sites = await siteConnection.query(`
      SELECT SiteCode as code, NameEn as name 
      FROM tblsitename 
      ORDER BY SiteCode
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(sites);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Site not found',
        message: error.message
      });
    }
    next(error);
  }
});

// Get all VCCT sites (tblvcctsite)
router.get('/vcct-sites', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const vcctSites = await siteConnection.query(`
      SELECT Vid as code, SiteName as name 
      FROM tblvcctsite 
      WHERE Status = '1' 
      ORDER BY Vid
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(vcctSites);
  } catch (error) {
    next(error);
  }
});

// Get all drugs (tbldrug)
router.get('/drugs', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const drugs = await siteConnection.query(`
      SELECT Did as id, DrugName as name, TypeDrug as drugtype, Status
      FROM tbldrug 
      ORDER BY DrugName
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(drugs);
  } catch (error) {
    next(error);
  }
});

// Get all clinics (tblclinic)
router.get('/clinics', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const clinics = await siteConnection.query(`
      SELECT Cid as id, ClinicName as name
      FROM tblclinic 
      ORDER BY ClinicName
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(clinics);
  } catch (error) {
    next(error);
  }
});

// Get all reasons (tblreason)
router.get('/reasons', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const reasons = await siteConnection.query(`
      SELECT Rid as id, Reason as name
      FROM tblreason 
      ORDER BY Reason
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(reasons);
  } catch (error) {
    next(error);
  }
});

// Get all allergies (tblallergy)
router.get('/allergies', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const allergies = await siteConnection.query(`
      SELECT Aid as id, AllergyStatus as name, Type as status
      FROM tblallergy 
      ORDER BY Type, AllergyStatus
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(allergies);
  } catch (error) {
    next(error);
  }
});

// Get all drug treatments (tbldrugtreat)
router.get('/drug-treatments', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const drugTreatments = await siteConnection.query(`
      SELECT Tid as id, DrugName as name
      FROM tbldrugtreat 
      ORDER BY DrugName
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(drugTreatments);
  } catch (error) {
    next(error);
  }
});

// Get all nationalities (tblnationality)
router.get('/nationalities', async (req, res, next) => {
  try {
    // Use a default site that has complete nationality data
    // All sites should have the same nationality table, so we'll use 0201 as default
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const nationalities = await siteConnection.query(`
      SELECT nid as id, nationality as name
      FROM tblnationality 
      ORDER BY nationality ASC
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(nationalities);
  } catch (error) {
    next(error);
  }
});

// Get all target groups (tbltargroup)
router.get('/target-groups', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const targetGroups = await siteConnection.query(`
      SELECT Tid as id, Targroup as name
      FROM tbltargroup 
      WHERE Status = '1' 
      ORDER BY Tid
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(targetGroups);
  } catch (error) {
    next(error);
  }
});

// Get provinces (tblprovince)
router.get('/provinces', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const provinces = await siteConnection.query(`
      SELECT pid as id, provinceeng as name
      FROM tblprovince 
      ORDER BY pid
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(provinces);
  } catch (error) {
    next(error);
  }
});

// Get districts by province
router.get('/districts/:provinceId', async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    
    const districts = await siteConnection.query(`
      SELECT d.did as id, d.districteng as name
      FROM tbldistrict d
      INNER JOIN tblprovince p ON p.pid = d.pid
      WHERE p.pid = :provinceId
      ORDER BY d.did
    `, {
      replacements: { provinceId },
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(districts);
  } catch (error) {
    next(error);
  }
});

// Get communes by district
router.get('/communes/:districtId', async (req, res, next) => {
  try {
    const { districtId } = req.params;
    
    const communes = await siteConnection.query(`
      SELECT c.cid as id, c.communeen as name
      FROM tblcommune c
      INNER JOIN tbldistrict d ON d.did = c.did
      WHERE d.did = :districtId
      ORDER BY c.cid
    `, {
      replacements: { districtId },
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(communes);
  } catch (error) {
    next(error);
  }
});

// Get villages by commune
router.get('/villages/:communeId', async (req, res, next) => {
  try {
    const { communeId } = req.params;
    
    const villages = await siteConnection.query(`
      SELECT v.vid as id, v.villageen as name
      FROM tblvillage v
      INNER JOIN tblcommune c ON c.cid = v.cid
      WHERE c.cid = :communeId
      ORDER BY v.vid
    `, {
      replacements: { communeId },
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(villages);
  } catch (error) {
    next(error);
  }
});

// Get all hospitals (from tbleimain HospitalName field)
router.get('/hospitals', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const hospitals = await siteConnection.query(`
      SELECT DISTINCT HospitalName as name, HospitalName as code
      FROM tbleimain 
      WHERE HospitalName IS NOT NULL AND HospitalName != ''
      ORDER BY HospitalName
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(hospitals);
  } catch (error) {
    next(error);
  }
});

// Get all doctors (tbldoctor)
router.get('/doctors', async (req, res, next) => {
  try {
    const siteCode = req.query.site || '0201';
    const siteConnection = await siteDatabaseManager.getSiteConnection(siteCode);
    
    const doctors = await siteConnection.query(`
      SELECT Did as id, Name as name, Name as doctorname, Did as did
      FROM tbldoctor 
      WHERE Status = '1'
      ORDER BY Name
    `, {
      type: siteConnection.QueryTypes.SELECT
    });

    res.json(doctors);
  } catch (error) {
    next(error);
  }
});

// Get all meet times (static list based on tblAppointment.Time field)
router.get('/meet-times', async (req, res, next) => {
  try {
    // Based on schema: Time field values: -1=not selected, 0=Morning, 1=Afternoon
    const meetTimes = [
      { id: 0, tid: 0, name: 'Morning', timename: 'Morning', time: 'Morning' },
      { id: 1, tid: 1, name: 'Afternoon', timename: 'Afternoon', time: 'Afternoon' }
    ];

    res.json(meetTimes);
  } catch (error) {
    next(error);
  }
});

// Get all sites from registry (enhanced with short names) - NEW ROUTE
router.get('/sites-registry', async (req, res, next) => {
  try {
    const sites = await siteDatabaseManager.getAllSitesForManagement();
    
    // Return in the same format as the original API for backward compatibility
    const formattedSites = sites.map(site => ({
      code: site.code,
      name: site.display_name || site.short_name || site.name,
      fullName: site.name,
      shortName: site.short_name,
      searchTerms: site.search_terms,
      fileName: site.file_name,
      province: site.province,
      type: site.type,
      status: site.status,
      database_name: site.database_name
    }));

    res.json(formattedSites);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
