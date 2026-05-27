const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const {
  INDICATOR_FILE_MAP,
  INDICATOR_DETAIL_FILE_MAP,
  INDICATOR_DISPLAY_NAMES,
  toNchadsDownloadFileName,
  fromNchadsDownloadFileName,
  getNchadsIdForFileName
} = require('../config/nchadsIndicatorRegistry');
const router = express.Router();

const WORKBENCH_ADULT_CHILD_DIR = path.join(__dirname, '../sql-workbench/ADULT_CHILD');
const WORKBENCH_ROOT_DIR = path.join(__dirname, '../sql-workbench');

function resolveWorkbenchSqlPath(fileName) {
  const legacyName = fromNchadsDownloadFileName(fileName);
  const candidates = [
    path.join(WORKBENCH_ADULT_CHILD_DIR, legacyName),
    path.join(WORKBENCH_ADULT_CHILD_DIR, fileName),
    path.join(WORKBENCH_ROOT_DIR, legacyName),
    path.join(WORKBENCH_ROOT_DIR, fileName)
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function resolveIndicatorQueryPath(fileName) {
  const legacyName = fromNchadsDownloadFileName(fileName);
  const candidates = [
    path.join(__dirname, '../queries/indicators', legacyName),
    path.join(__dirname, '../queries/indicators', fileName)
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function addWorkbenchDirToArchive(archive, dir, baseDir, zipBasePath) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      addWorkbenchDirToArchive(archive, fullPath, baseDir, zipBasePath);
      continue;
    }
    if (!entry.name.endsWith('.sql') && !entry.name.endsWith('.md')) {
      continue;
    }
    const relativeParts = path.relative(baseDir, fullPath).replace(/\\/g, '/').split('/');
    const fileName = relativeParts[relativeParts.length - 1];
    if (fileName.endsWith('.sql')) {
      relativeParts[relativeParts.length - 1] = toNchadsDownloadFileName(fileName);
    }
    archive.file(fullPath, { name: `${zipBasePath}/${relativeParts.join('/')}` });
  }
}

function enrichSqlScriptEntry(file, category, type, relativeDir) {
  const downloadName = toNchadsDownloadFileName(file);
  const nchadsId = getNchadsIdForFileName(file);
  const displayLabel = nchadsId
    ? `${nchadsId}. ${INDICATOR_DISPLAY_NAMES[nchadsId] || file.replace(/\.sql$/, '').replace(/_/g, ' ')}`
    : file.replace(/\.sql$/, '').replace(/_/g, ' ');
  return {
    name: downloadName,
    legacyName: file,
    nchadsId,
    type,
    category,
    description: getIndicatorSqlDescription(file, nchadsId),
    path: `${relativeDir}/${file}`
  };
}

// Get list of available analysis scripts
router.get('/scripts', authenticateToken, async (req, res) => {
  try {
    const scriptsDir = path.join(__dirname, '../../scripts');
    const queriesDir = path.join(__dirname, '../queries/indicators');
    const servicesDir = path.join(__dirname, '../services');

    const scripts = [];

    // Read backend scripts
    if (fs.existsSync(scriptsDir)) {
      const scriptFiles = fs.readdirSync(scriptsDir);
      scriptFiles.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.sql') || file.endsWith('.sh')) {
          scripts.push({
            name: file,
            type: 'backend-script',
            category: 'Backend Scripts',
            description: getScriptDescription(file),
            path: `scripts/${file}`
          });
        }
      });
    }

    // Read indicator queries
    if (fs.existsSync(queriesDir)) {
      const queryFiles = fs.readdirSync(queriesDir);
      queryFiles.forEach(file => {
        if (file.endsWith('.sql')) {
          scripts.push(
            enrichSqlScriptEntry(file, 'Indicator Queries', 'indicator-query', 'queries/indicators')
          );
        }
      });
    }

    // Read SQL workbench files (ADULT_CHILD indicators)
    if (fs.existsSync(WORKBENCH_ADULT_CHILD_DIR)) {
      const workbenchFiles = fs.readdirSync(WORKBENCH_ADULT_CHILD_DIR);
      workbenchFiles.forEach(file => {
        if (file.endsWith('.sql') || file.endsWith('.md')) {
          const entry = file.endsWith('.sql')
            ? enrichSqlScriptEntry(file, 'SQL Workbench Files', 'sql-workbench', 'sql-workbench/ADULT_CHILD')
            : {
                name: file,
                legacyName: file,
                type: 'sql-workbench',
                category: 'SQL Workbench Files',
                description: getWorkbenchDescription(file),
                path: `sql-workbench/ADULT_CHILD/${file}`
              };
          scripts.push(entry);
        }
      });
    }

    // Read services
    if (fs.existsSync(servicesDir)) {
      const serviceFiles = fs.readdirSync(servicesDir);
      serviceFiles.forEach(file => {
        if (file.endsWith('.js')) {
          scripts.push({
            name: file,
            type: 'service',
            category: 'Analysis Services',
            description: getServiceDescription(file),
            path: `services/${file}`
          });
        }
      });
    }

    res.json({
      success: true,
      scripts: scripts.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    });
  } catch (error) {
    console.error('Error listing scripts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list scripts',
      error: error.message
    });
  }
});

// Download individual script
router.get('/scripts/:scriptType/:fileName', authenticateToken, async (req, res) => {
  try {
    const { scriptType, fileName } = req.params;
    
    let filePath;
    switch (scriptType) {
      case 'backend-script':
        filePath = path.join(__dirname, '../../scripts', fileName);
        break;
      case 'indicator-query':
        filePath = resolveIndicatorQueryPath(fileName);
        break;
      case 'sql-workbench':
        filePath = resolveWorkbenchSqlPath(fileName);
        break;
      case 'service':
        filePath = path.join(__dirname, '../services', fileName);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid script type'
        });
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'Script not found'
      });
    }

    const downloadFileName = fileName.endsWith('.sql')
      ? toNchadsDownloadFileName(path.basename(filePath))
      : fileName;

    const content = fs.readFileSync(filePath, 'utf8');
    let workbookContent;
    
    try {
      workbookContent = convertToWorkbookFormat(content, downloadFileName, scriptType);
    } catch (error) {
      console.error('Error converting to workbook format:', error);
      // Fallback to original content if conversion fails
      workbookContent = content;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.send(workbookContent);
  } catch (error) {
    console.error('Error downloading script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download script',
      error: error.message
    });
  }
});

// Download the entire sql-workbench folder as a zip (includes all subfolders)
router.get('/scripts/download-sql-workbench', authenticateToken, async (req, res) => {
  const workbenchDir = WORKBENCH_ROOT_DIR;
  if (!fs.existsSync(workbenchDir)) {
    return res.status(404).json({
      success: false,
      message: 'sql-workbench folder not found'
    });
  }

  try {
    const archiver = require('archiver');
    const archive = archiver('zip', {
      zlib: { level: 1 },
      forceLocalTime: true,
      forceZip64: false
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to create zip file',
          error: err.message
        });
      }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="sql-workbench.zip"');
    archive.pipe(res);

    addWorkbenchDirToArchive(archive, workbenchDir, workbenchDir, 'sql-workbench');
    await archive.finalize();
  } catch (error) {
    console.error('Error creating sql-workbench zip:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create zip file',
        error: error.message
      });
    }
  }
});

// Download all scripts as a zip
router.get('/scripts/download-all', authenticateToken, async (req, res) => {
  try {
    const archiver = require('archiver');
    const archive = archiver('zip', { 
      zlib: { level: 1 }, // Lower compression for better compatibility
      forceLocalTime: true,
      forceZip64: false
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to create zip file',
          error: err.message
        });
      }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="artweb-analysis-scripts.zip"');

    archive.pipe(res);

    if (fs.existsSync(WORKBENCH_ROOT_DIR)) {
      addWorkbenchDirToArchive(archive, WORKBENCH_ROOT_DIR, WORKBENCH_ROOT_DIR, 'sql-workbench');
    }

    // Add README with instructions
    const readmeContent = generateReadmeContent();
    archive.append(readmeContent, { name: 'README.md' });

    await archive.finalize();
  } catch (error) {
    console.error('Error creating zip:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create zip file',
        error: error.message
      });
    }
  }
});

// Generate workbook-compatible analysis script
router.get('/scripts/workbook/:indicatorName', authenticateToken, async (req, res) => {
  try {
    const { indicatorName } = req.params;
    const workbookScript = generateWorkbookScript(indicatorName);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${indicatorName}-workbook.js"`);
    res.send(workbookScript);
  } catch (error) {
    console.error('Error generating workbook script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workbook script',
      error: error.message
    });
  }
});

// Helper functions
function getScriptDescription(fileName) {
  const descriptions = {
    'analyze-art-aggregate-database.js': 'Analyzes ART aggregate database structure and data',
    'validate-indicators.js': 'Validates indicator calculations and data integrity',
    'optimize-system.js': 'System optimization and performance analysis',
    'data-migration.js': 'Data migration and transformation utilities',
    'create-site-databases.js': 'Site database creation and setup',
    'populate-sites.js': 'Site data population and initialization'
  };
  return descriptions[fileName] || 'Backend utility script';
}

function getIndicatorSqlDescription(fileName, nchadsId) {
  const isDetails = fileName.includes('_details');
  if (nchadsId && INDICATOR_DISPLAY_NAMES[nchadsId]) {
    const label = INDICATOR_DISPLAY_NAMES[nchadsId];
    return isDetails
      ? `Indicator ${nchadsId} - ${label} (detailed records)`
      : `Indicator ${nchadsId} - ${label}`;
  }
  const legacyDescriptions = {
    '01_active_art_previous.sql': 'Indicator 1 - Active ART patients from previous period',
    '02_active_pre_art_previous.sql': 'Indicator 2 - Active Pre-ART patients from previous period',
    '03_newly_enrolled.sql': 'Indicator 3 - Newly enrolled patients',
    '04_retested_positive.sql': 'Indicator 4 - Retested positive patients',
    '05_newly_initiated.sql': 'Indicator 5 - Newly initiated ART patients',
    '05.3_art_pregnant.sql': 'Indicator 5.3 - New ART patients who are pregnant',
    '06_transfer_in.sql': 'Indicator 6 - Transfer in patients',
    '07_lost_and_return.sql': 'Indicator 7 - Lost and returned patients',
    '08_tpt_new_start.sql': 'Indicator 8 - TPT started (new start in period)',
    '08.2_dead.sql': 'Indicator 9.1 - Deceased patients',
    '08.3_lost_to_followup.sql': 'Indicator 9.2 - Lost to follow-up patients',
    '08.4_transfer_out.sql': 'Indicator 9.3 - Transfer out patients',
    '09_active_pre_art.sql': 'Indicator 10 - Currently active Pre-ART patients',
    '10_active_art_current.sql': 'Indicator 11 - Currently active ART patients',
    '10.1_eligible_mmd.sql': 'Indicator 11.1 - Eligible for multi-month dispensing',
    '10.2_mmd.sql': 'Indicator 11.2 - Multi-month dispensing patients',
    '10.3_tld.sql': 'Indicator 11.3 - TLD patients',
    '10.4_tpt_start.sql': 'Indicator 11.4 - TPT (TB Preventive Therapy) started',
    '10.5_tpt_complete.sql': 'Indicator 11.5 - TPT completed',
    '10.6_eligible_vl_test.sql': 'Indicator 11.6 - Eligible for viral load testing',
    '10.7_vl_tested_12m.sql': 'Indicator 11.7 - Viral load tested in last 12 months',
    '10.8_vl_suppression.sql': 'Indicator 11.8 - Viral load suppression'
  };
  return legacyDescriptions[fileName] || 'Indicator calculation query';
}

function getServiceDescription(fileName) {
  const descriptions = {
    'enhancedIndicators.js': 'Enhanced indicator calculation service',
    'optimizedIndicators.js': 'Optimized indicator processing service',
    'siteOptimizedIndicators.js': 'Site-specific indicator optimization',
    'siteSwitchingService.js': 'Site switching and management service',
    'cache.js': 'Caching service for performance optimization',
    'performanceMonitor.js': 'Performance monitoring and analytics'
  };
  return descriptions[fileName] || 'Analysis service module';
}

function getWorkbenchDescription(fileName) {
  if (fileName === 'README-WORKBENCH.md') {
    return 'Complete documentation for SQL workbench usage';
  }
  if (fileName === 'artweb-complete-indicators-workbench.sql') {
    return 'Complete analysis with all indicators - ready for workbench';
  }
  if (fileName === 'variables.sql') {
    return 'System variables and parameters - workbench ready';
  }
  const nchadsId = getNchadsIdForFileName(fileName);
  const base = getIndicatorSqlDescription(fileName, nchadsId);
  return fileName.includes('_details') ? `${base} - workbench ready` : `${base} - workbench ready`;
}

function convertToWorkbookFormat(content, fileName, scriptType) {
  let workbookContent = content;
  
  // Add workbook-specific headers and modifications
  if (scriptType === 'indicator-query' && fileName.endsWith('.sql')) {
    workbookContent = `-- ART Web Indicator Analysis Query
-- File: ${fileName}
-- Generated: ${new Date().toISOString()}
-- 
-- This query can be run in any SQL workbook environment
-- Make sure to replace @siteCode, @startDate, @endDate with actual values
--
-- Example usage:
-- SET @siteCode = '0201';
-- SET @startDate = '2025-01-01';
-- SET @endDate = '2025-03-31';

${content}

-- End of query
-- For more information, visit: https://github.com/your-repo/artweb
`;
  } else if (scriptType === 'service' && fileName.endsWith('.js')) {
    workbookContent = `// ART Web Analysis Service
// File: ${fileName}
// Generated: ${new Date().toISOString()}
//
// This service can be adapted for workbook environments
// Requires: Node.js or compatible JavaScript environment
//

${content}

// End of service
// For more information, visit: https://github.com/your-repo/artweb
`;
  } else if (scriptType === 'backend-script' && fileName.endsWith('.js')) {
    workbookContent = `// ART Web Backend Script
// File: ${fileName}
// Generated: ${new Date().toISOString()}
//
// This script can be adapted for workbook environments
// Requires: Node.js, MySQL connection, and required dependencies
//

${content}

// End of script
// For more information, visit: https://github.com/your-repo/artweb
`;
  }
  
  return workbookContent;
}

function generateReadmeContent() {
  return `# ART Web Analysis Scripts

This package contains all the analysis scripts and queries used in the ART Web system for HIV/AIDS indicator analysis.

## Directory Structure

- \`backend-scripts/\` - Backend utility scripts for data management and analysis
- \`indicator-queries/\` - SQL queries for calculating HIV/AIDS indicators
- \`analysis-services/\` - JavaScript services for indicator processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database access
- Required npm packages (see package.json)

### Database Connection

Before running any scripts, ensure you have access to the ART database with the following tables:
- \`tblaimain\` - Adult patient data
- \`tblcimain\` - Child patient data  
- \`tbleimain\` - Infant patient data
- \`tblavpatientstatus\` - Patient status data
- \`tblsitename\` - Site information

### Running Indicator Queries

1. Connect to your MySQL database
2. Set the required variables:
   \`\`\`sql
   SET @siteCode = 'YOUR_SITE_CODE';
   SET @startDate = '2025-01-01';
   SET @endDate = '2025-03-31';
   \`\`\`
3. Execute the desired indicator query

### Running Analysis Scripts

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Configure database connection in the script
3. Run the script:
   \`\`\`bash
   node script-name.js
   \`\`\`

## Indicator Descriptions (NCHADS report numbers)

Downloaded SQL files use NCHADS indicator numbers in filenames (e.g. \`8_tpt_new_start.sql\`, \`9.1_dead.sql\`).

${Object.entries(INDICATOR_FILE_MAP)
  .map(([id, stem]) => {
    const label = INDICATOR_DISPLAY_NAMES[id] || stem.replace(/^[\d.]+_/, '').replace(/_/g, ' ');
  const file = toNchadsDownloadFileName(`${stem}.sql`);
    return `- **${file}** - Indicator ${id}: ${label}`;
  })
  .join('\n')}

## Support

For technical support or questions about these scripts, please contact the development team.

## License

This software is licensed under the MIT License.
`;
}

function generateWorkbookScript(indicatorName) {
  return `// ART Web Workbook Analysis Script
// Indicator: ${indicatorName}
// Generated: ${new Date().toISOString()}

// Configuration
const config = {
  siteCode: 'YOUR_SITE_CODE', // Replace with actual site code
  startDate: '2025-01-01',    // Replace with actual start date
  endDate: '2025-03-31',      // Replace with actual end date
  database: {
    host: 'localhost',
    port: 3306,
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
  }
};

// Database connection (adapt for your environment)
const mysql = require('mysql2/promise');

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(config.database);
    console.log('Connected to database successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Main analysis function
async function analyzeIndicator() {
  let connection;
  
  try {
    connection = await connectToDatabase();
    
    // Your analysis logic here
    // This is a template - replace with actual indicator logic
    
    const query = \`
      SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_patients
      FROM tblaimain 
      WHERE siteCode = ? 
        AND dateCreated BETWEEN ? AND ?
    \`;
    
    const [results] = await connection.execute(query, [
      config.siteCode,
      config.startDate,
      config.endDate
    ]);
    
    console.log('Analysis Results:', results);
    return results;
    
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the analysis
if (require.main === module) {
  analyzeIndicator()
    .then(results => {
      console.log('Analysis completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeIndicator, config };
`;
}

module.exports = router;
