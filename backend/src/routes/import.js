const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Site } = require('../models');
const { siteDatabaseManager } = require('../config/siteDatabase');
const mysql = require('mysql2/promise');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../temp/uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `import-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/sql' || file.originalname.endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Only SQL files are allowed'), false);
    }
  }
});

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../../temp/uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// Initialize upload directory
ensureUploadDir();

// Extract site information from tblsitename table in SQL file
const extractSiteInfoFromSql = async (filePath) => {
  try {
    const sqlContent = await fs.readFile(filePath, 'utf8');
    
    // Look for INSERT statements into tblsitename table
    const insertMatches = sqlContent.match(/INSERT INTO\s+tblsitename\s*\([^)]+\)\s*VALUES\s*\([^)]+\)/gi);
    
    if (!insertMatches || insertMatches.length === 0) {
      console.log('⚠️ No INSERT statements found for tblsitename table');
      return null;
    }

    // Parse the first INSERT statement to extract site information
    const firstInsert = insertMatches[0];
    console.log('📋 Found tblsitename INSERT:', firstInsert);

    // Extract column names and values
    const columnMatch = firstInsert.match(/INSERT INTO\s+tblsitename\s*\(([^)]+)\)/i);
    const valueMatch = firstInsert.match(/VALUES\s*\(([^)]+)\)/i);

    if (!columnMatch || !valueMatch) {
      console.log('⚠️ Could not parse tblsitename INSERT statement');
      return null;
    }

    const columns = columnMatch[1].split(',').map(col => col.trim().replace(/`/g, ''));
    const values = valueMatch[1].split(',').map(val => val.trim().replace(/['"]/g, ''));

    console.log('📋 Columns:', columns);
    console.log('📋 Values:', values);

    // Map columns to values
    const siteData = {};
    columns.forEach((col, index) => {
      if (values[index]) {
        siteData[col.toLowerCase()] = values[index];
      }
    });

    console.log('📋 Parsed site data:', siteData);

    // Extract site information based on common column names
    const siteInfo = {
      code: siteData.sid || siteData.siteid || siteData.code || siteData.site_code,
      name: siteData.sitename || siteData.site_name || siteData.name,
      province: siteData.province || siteData.prov || siteData.province_name,
      district: siteData.district || siteData.dist || siteData.district_name,
      type: siteData.type || siteData.site_type || 'HC'
    };

    // Validate that we have the essential information
    if (!siteInfo.code || !siteInfo.name) {
      console.log('⚠️ Missing essential site information (code or name)');
      return null;
    }

    // Set defaults for missing fields
    if (!siteInfo.province) siteInfo.province = 'Unknown';
    if (!siteInfo.district) siteInfo.district = 'Unknown';

    console.log('✅ Successfully extracted site info:', siteInfo);
    return siteInfo;

  } catch (error) {
    console.error('Error extracting site info from SQL:', error);
    return null;
  }
};

// Import SQL file endpoint
router.post('/sql', [
  authenticateToken,
  requireRole(['super_admin', 'admin', 'data_manager']),
  upload.single('sqlFile')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No SQL file provided'
      });
    }

    const {
      createNewDatabase,
      targetSite,
      siteCode,
      siteName,
      province,
      district,
      fileName,
      importMode = 'replace'
    } = req.body;

    let databaseName;
    let siteInfo;
    let extractedSiteInfo = null;

    // First, check if SQL file contains tblsitename table
    const sqlContent = await fs.readFile(req.file.path, 'utf8');
    const hasTblSiteName = /CREATE TABLE.*tblsitename/i.test(sqlContent) || 
                          /INSERT INTO.*tblsitename/i.test(sqlContent);

    if (hasTblSiteName) {
      console.log('📋 SQL file contains tblsitename table, extracting site information...');
      
      // Extract site information from tblsitename
      extractedSiteInfo = await extractSiteInfoFromSql(req.file.path);
      
      if (extractedSiteInfo) {
        console.log('✅ Extracted site info:', extractedSiteInfo);
      }
    }

    // Determine site information to use
    let finalSiteCode, finalSiteName, finalProvince, finalDistrict, finalFileName;
    
    if (extractedSiteInfo) {
      // Use extracted information from tblsitename
      finalSiteCode = extractedSiteInfo.code || siteCode;
      finalSiteName = extractedSiteInfo.name || siteName;
      finalProvince = extractedSiteInfo.province || province;
      finalDistrict = extractedSiteInfo.district || district;
      finalFileName = fileName || req.file.originalname; // Use provided fileName or original filename
    } else if (createNewDatabase === 'true') {
      // Use manually provided information
      finalSiteCode = siteCode;
      finalSiteName = siteName;
      finalProvince = province;
      finalDistrict = district;
      finalFileName = fileName || req.file.originalname; // Use provided fileName or original filename
    } else {
      // Use existing site
      siteInfo = await Site.findOne({ where: { code: targetSite } });
      if (!siteInfo) {
        return res.status(404).json({
          success: false,
          message: 'Target site not found'
        });
      }
      databaseName = siteInfo.database_name;
      
      console.log(`🎯 Importing to existing site: ${targetSite} (${databaseName})`);
      console.log(`📋 Import mode: ${importMode}`);
      
      // Handle different import modes for existing sites
      if (importMode === 'replace') {
        console.log(`🔄 REPLACE mode: Dropping and recreating database ${databaseName}`);
        try {
          // Drop existing database
          const { sequelize } = require('../config/database');
          const connection = await sequelize.getQueryInterface().sequelize.connectionManager.getConnection();
          await connection.promise().query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
          console.log(`🗑️ Dropped existing database: ${databaseName}`);
          
          // Create fresh database
          await createSiteDatabase(databaseName);
          console.log(`✅ Created fresh database: ${databaseName}`);
          
          await sequelize.getQueryInterface().sequelize.connectionManager.releaseConnection(connection);
        } catch (error) {
          console.error('Error in REPLACE mode:', error);
          return res.status(500).json({
            success: false,
            message: `Failed to replace database: ${error.message}`
          });
        }
      } else if (importMode === 'append') {
        console.log(`➕ APPEND mode: Adding data to existing database ${databaseName}`);
        // Check if database exists, create if not
        try {
          const { sequelize } = require('../config/database');
          const connection = await sequelize.getQueryInterface().sequelize.connectionManager.getConnection();
          
          const [databases] = await connection.promise().query(`SHOW DATABASES LIKE '${databaseName}'`);
          if (databases.length === 0) {
            console.log(`🔨 Database ${databaseName} doesn't exist, creating...`);
            await createSiteDatabase(databaseName);
            console.log(`✅ Database created: ${databaseName}`);
          } else {
            console.log(`✅ Database exists: ${databaseName}`);
          }
          
          await sequelize.getQueryInterface().sequelize.connectionManager.releaseConnection(connection);
        } catch (error) {
          console.error('Error in APPEND mode:', error);
          return res.status(500).json({
            success: false,
            message: `Failed to prepare database for append: ${error.message}`
          });
        }
      } else if (importMode === 'skip') {
        console.log(`⏭️ SKIP mode: Will skip conflicts in database ${databaseName}`);
        // Check if database exists, create if not
        try {
          const { sequelize } = require('../config/database');
          const connection = await sequelize.getQueryInterface().sequelize.connectionManager.getConnection();
          
          const [databases] = await connection.promise().query(`SHOW DATABASES LIKE '${databaseName}'`);
          if (databases.length === 0) {
            console.log(`🔨 Database ${databaseName} doesn't exist, creating...`);
            await createSiteDatabase(databaseName);
            console.log(`✅ Database created: ${databaseName}`);
          } else {
            console.log(`✅ Database exists: ${databaseName}`);
          }
          
          await sequelize.getQueryInterface().sequelize.connectionManager.releaseConnection(connection);
        } catch (error) {
          console.error('Error in SKIP mode:', error);
          return res.status(500).json({
            success: false,
            message: `Failed to prepare database for skip mode: ${error.message}`
          });
        }
      }
    }

    // Validate required fields for new database
    if (createNewDatabase === 'true' || extractedSiteInfo) {
      if (!finalSiteCode || !finalSiteName || !finalProvince || !finalDistrict || !finalFileName) {
        return res.status(400).json({
          success: false,
          message: 'Site code, name, province, district, and file name are required. Please check if tblsitename table contains complete information or provide manually.'
        });
      }

      // Create new site and database
      databaseName = `preart_${finalSiteCode}`;
      
      // Check if site already exists
      const existingSite = await Site.findOne({ where: { code: finalSiteCode } });
      if (existingSite) {
        // Site exists, check if database is empty
        console.log(`⚠️ Site ${finalSiteCode} already exists, checking database...`);
        siteInfo = existingSite;
        databaseName = existingSite.database_name;
        
        // Check if database has any tables
        try {
          const { sequelize } = require('../config/database');
          const connection = await sequelize.getQueryInterface().sequelize.connectionManager.getConnection();
          
          // Check if database exists and has tables
          const [databases] = await connection.promise().query(`SHOW DATABASES LIKE '${databaseName}'`);
          if (databases.length === 0) {
            console.log(`🔨 Database ${databaseName} doesn't exist, creating...`);
            await createSiteDatabase(databaseName);
            console.log(`✅ Database created successfully: ${databaseName}`);
          } else {
            // Check if database has tables
            const [tables] = await connection.query(`SHOW TABLES FROM \`${databaseName}\``);
            if (tables.length === 0) {
              console.log(`⚠️ Database ${databaseName} exists but is empty, proceeding with import...`);
            } else {
              console.log(`✅ Database ${databaseName} exists with ${tables.length} tables`);
            }
          }
          
          await sequelize.getQueryInterface().sequelize.connectionManager.releaseConnection(connection);
        } catch (error) {
          console.error('Error checking database:', error);
          // If we can't check, try to create the database anyway
          console.log(`🔨 Creating database: ${databaseName}`);
          await createSiteDatabase(databaseName);
          console.log(`✅ Database created successfully: ${databaseName}`);
        }
      } else {
        // Create new site in registry
        siteInfo = await Site.create({
          code: finalSiteCode,
          name: finalSiteName,
          short_name: finalSiteName,
          display_name: finalSiteName,
          search_terms: `${finalSiteName},${finalSiteCode}`,
          file_name: finalFileName,
          province: finalProvince,
          type: 'HC', // Default type for imported sites
          database_name: databaseName,
          status: 1
        });

        // Create new database
        console.log(`🔨 Creating database: ${databaseName}`);
        await createSiteDatabase(databaseName);
        console.log(`✅ Database created successfully: ${databaseName}`);
      }
    }

    // Execute SQL file
    const result = await executeSqlFile(req.file.path, databaseName, importMode);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: `Data imported successfully to ${siteInfo.name} (${siteInfo.code})`,
      site: {
        code: siteInfo.code,
        name: siteInfo.name,
        database: databaseName
      },
      result: {
        tablesCreated: result.tablesCreated,
        recordsInserted: result.recordsInserted,
        recordsSkipped: result.recordsSkipped,
        recordsUpdated: result.recordsUpdated,
        executionTime: result.executionTime,
        importMode: result.importMode
      },
      extractedSiteInfo: extractedSiteInfo ? {
        source: 'tblsitename table',
        extracted: true
      } : null
    });

  } catch (error) {
    console.error('Import error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Import failed',
      error: error.message
    });
  }
});

// Create site database
const createSiteDatabase = async (databaseName) => {
  try {
    // Create a new Sequelize instance for database creation
    const { Sequelize } = require('sequelize');
    
    // Connect to MySQL without specifying a database
    const tempSequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      dialect: 'mysql',
      logging: false
    });
    
    // Create database
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    
    // Close the temporary connection
    await tempSequelize.close();
    
    console.log(`✅ Database ${databaseName} created successfully`);
  } catch (error) {
    console.error('Error creating database:', error);
    throw new Error(`Failed to create database: ${error.message}`);
  }
};

// Execute SQL file
const executeSqlFile = async (filePath, databaseName, importMode = 'replace') => {
  try {
    const startTime = Date.now();

    // Read SQL file
    const sqlContent = await fs.readFile(filePath, 'utf8');

    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Get Sequelize instance and create a new connection for the specific database
    const { sequelize } = require('../config/database');
    const { Sequelize } = require('sequelize');
    
    // Create a new Sequelize instance for the specific database
    const siteSequelize = new Sequelize({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: databaseName,
      dialect: 'mysql',
      logging: false
    });
    
    let tablesCreated = 0;
    let recordsInserted = 0;
    let recordsSkipped = 0;
    let recordsUpdated = 0;

    console.log(`🚀 Executing SQL with mode: ${importMode}`);

    // Execute each statement
    for (const statement of statements) {
      try {
        let modifiedStatement = statement;
        
        // Modify INSERT statements based on import mode
        if (importMode === 'skip' && statement.toUpperCase().includes('INSERT INTO')) {
          // Convert INSERT INTO to INSERT IGNORE INTO to skip conflicts
          modifiedStatement = statement.replace(/INSERT INTO/gi, 'INSERT IGNORE INTO');
          console.log(`⏭️ Modified INSERT to IGNORE: ${statement.substring(0, 50)}...`);
        } else if (importMode === 'append' && statement.toUpperCase().includes('INSERT INTO')) {
          // For append mode, use INSERT ... ON DUPLICATE KEY UPDATE
          // This will update existing records instead of failing
          if (statement.toUpperCase().includes('ON DUPLICATE KEY UPDATE')) {
            // Already has ON DUPLICATE KEY UPDATE, use as is
            modifiedStatement = statement;
          } else {
            // Add basic ON DUPLICATE KEY UPDATE to prevent conflicts
            modifiedStatement = statement.replace(/;$/gi, ' ON DUPLICATE KEY UPDATE id=id;');
            console.log(`➕ Modified INSERT for append mode: ${statement.substring(0, 50)}...`);
          }
        }
        
        // Skip problematic statements
        if (statement.toUpperCase().includes('CREATE ALGORITHM') || 
            statement.toUpperCase().includes('SET CHARACTER_SET_CLIENT') ||
            statement.toUpperCase().includes('DEFINER=')) {
          console.log(`⏭️ Skipping problematic statement: ${statement.substring(0, 50)}...`);
          continue;
        }
        
        const result = await siteSequelize.query(modifiedStatement);
        
        // Count tables created
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          tablesCreated++;
        }
        
        // Count records inserted/updated
        if (result[1] && typeof result[1] === 'number') {
          if (importMode === 'skip' && result[1] === 0) {
            recordsSkipped++;
          } else if (importMode === 'append' && result[1] === 2) {
            recordsUpdated++;
          } else {
            recordsInserted += result[1];
          }
        }
      } catch (stmtError) {
        if (importMode === 'skip') {
          console.warn(`⏭️ Skipped statement (conflict): ${statement.substring(0, 100)}...`);
          recordsSkipped++;
        } else if (stmtError.message.includes('already exists')) {
          console.warn(`⚠️ Table already exists, skipping: ${statement.substring(0, 100)}...`);
          recordsSkipped++;
        } else if (stmtError.message.includes('Validation error')) {
          console.warn(`⚠️ Validation error, skipping: ${statement.substring(0, 100)}...`);
          recordsSkipped++;
        } else {
          console.warn(`Warning: Statement failed: ${statement.substring(0, 100)}...`);
          console.warn(`Error: ${stmtError.message}`);
        }
        // Continue with other statements
      }
    }

    // Close the site-specific connection
    await siteSequelize.close();

    const executionTime = Date.now() - startTime;

    return {
      tablesCreated,
      recordsInserted,
      recordsSkipped,
      recordsUpdated,
      executionTime,
      importMode
    };

  } catch (error) {
    console.error('Error executing SQL file:', error);
    throw new Error(`Failed to execute SQL file: ${error.message}`);
  }
};

// Validate SQL file endpoint
router.post('/validate', [
  authenticateToken,
  requireRole(['super_admin', 'admin', 'data_manager']),
  upload.single('sqlFile')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No SQL file provided'
      });
    }

    // Read and validate SQL content
    const sqlContent = await fs.readFile(req.file.path, 'utf8');
    
    // Basic validation
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      tables: [],
      statements: 0
    };

    // Count statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    validation.statements = statements.length;

    // Extract table names
    const tableMatches = sqlContent.match(/CREATE TABLE\s+`?(\w+)`?/gi);
    if (tableMatches) {
      validation.tables = tableMatches.map(match => 
        match.replace(/CREATE TABLE\s+`?(\w+)`?/i, '$1')
      );
    }

    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP DATABASE/i,
      /DROP SCHEMA/i,
      /TRUNCATE TABLE/i,
      /DELETE FROM/i
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sqlContent)) {
        validation.warnings.push(`Potentially dangerous operation detected: ${pattern.source}`);
      }
    });

    // Clean up file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('Validation error:', error);
    
    // Clean up file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
});

// Get available sites for import
router.get('/sites', authenticateToken, async (req, res) => {
  try {
    const sites = await Site.findAll({
      attributes: ['code', 'name', 'province', 'database_name'],
      where: { status: 1 },
      order: [['name', 'ASC']]
    });

    // Transform the data to match expected format
    const transformedSites = sites.map(site => ({
      code: site.code,
      name: site.name,
      province: site.province,
      district: 'Unknown', // District not stored in sites table
      database_name: site.database_name
    }));

    res.json({
      success: true,
      sites: transformedSites
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sites',
      error: error.message
    });
  }
});

// Get import history
router.get('/history', [
  authenticateToken,
  requireRole(['super_admin', 'admin', 'data_manager'])
], async (req, res) => {
  try {
    // This would typically come from a database table
    // For now, return a placeholder
    res.json({
      success: true,
      history: []
    });
  } catch (error) {
    console.error('Error fetching import history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch import history',
      error: error.message
    });
  }
});

module.exports = router;
