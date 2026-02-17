const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

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
          scripts.push({
            name: file,
            type: 'indicator-query',
            category: 'Indicator Queries',
            description: getQueryDescription(file),
            path: `queries/indicators/${file}`
          });
        }
      });
    }

    // Read SQL workbench files
    const workbenchDir = path.join(__dirname, '../sql-workbench');
    if (fs.existsSync(workbenchDir)) {
      const workbenchFiles = fs.readdirSync(workbenchDir);
      workbenchFiles.forEach(file => {
        if (file.endsWith('.sql') || file.endsWith('.md')) {
          scripts.push({
            name: file,
            type: 'sql-workbench',
            category: 'SQL Workbench Files',
            description: getWorkbenchDescription(file),
            path: `sql-workbench/${file}`
          });
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
        filePath = path.join(__dirname, '../queries/indicators', fileName);
        break;
      case 'sql-workbench':
        filePath = path.join(__dirname, '../sql-workbench', fileName);
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

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Script not found'
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let workbookContent;
    
    try {
      workbookContent = convertToWorkbookFormat(content, fileName, scriptType);
    } catch (error) {
      console.error('Error converting to workbook format:', error);
      // Fallback to original content if conversion fails
      workbookContent = content;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
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
  const workbenchDir = path.join(__dirname, '../sql-workbench');
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

    function addDirToArchive(dir, baseDir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        if (entry.isDirectory()) {
          addDirToArchive(fullPath, baseDir);
        } else {
          try {
            archive.file(fullPath, { name: `sql-workbench/${relativePath}` });
          } catch (fileErr) {
            console.error('Error adding file to archive:', fullPath, fileErr);
          }
        }
      }
    }

    addDirToArchive(workbenchDir, workbenchDir);
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

    // Add SQL workbench files (main focus)
    const workbenchDir = path.join(__dirname, '../sql-workbench');
    
    if (fs.existsSync(workbenchDir)) {
      const files = fs.readdirSync(workbenchDir);
      
      // Add each file individually to ensure they're included
      files.forEach(file => {
        const filePath = path.join(workbenchDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          archive.file(filePath, { name: `sql-workbench/${file}` });
        }
      });
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

function getQueryDescription(fileName) {
  const descriptions = {
    '01_active_art_previous.sql': 'Active ART patients from previous period',
    '02_active_pre_art_previous.sql': 'Active Pre-ART patients from previous period',
    '03_newly_enrolled.sql': 'Newly enrolled patients',
    '04_retested_positive.sql': 'Retested positive patients',
    '05_newly_initiated.sql': 'Newly initiated ART patients',
    '06_transfer_in.sql': 'Transfer in patients',
    '07_lost_and_return.sql': 'Lost and returned patients',
    '08.1_dead.sql': 'Deceased patients',
    '08.2_lost_to_followup.sql': 'Lost to follow-up patients',
    '08.3_transfer_out.sql': 'Transfer out patients',
    '09_active_pre_art.sql': 'Currently active Pre-ART patients',
    '10_active_art_current.sql': 'Currently active ART patients',
    '10.1_eligible_mmd.sql': 'Eligible for multi-month dispensing',
    '10.2_mmd.sql': 'Multi-month dispensing patients',
    '10.3_tld.sql': 'TLD (Tenofovir/Lamivudine/Dolutegravir) patients',
    '10.4_tpt_start.sql': 'TPT (TB Preventive Therapy) started',
    '10.5_tpt_complete.sql': 'TPT completed',
    '10.6_eligible_vl_test.sql': 'Eligible for viral load testing',
    '10.7_vl_tested_12m.sql': 'Viral load tested in last 12 months',
    '10.8_vl_suppression.sql': 'Viral load suppression'
  };
  return descriptions[fileName] || 'Indicator calculation query';
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
  const descriptions = {
    'artweb-complete-indicators-workbench.sql': 'Complete analysis with all indicators - ready for workbench',
    '01_active_art_previous.sql': 'Active ART patients from previous period - workbench ready',
    '01_active_art_previous_details.sql': 'Active ART patients from previous period - detailed records',
    '02_active_pre_art_previous.sql': 'Active Pre-ART patients from previous period - workbench ready',
    '02_active_pre_art_previous_details.sql': 'Active Pre-ART patients from previous period - detailed records',
    '03_newly_enrolled.sql': 'Newly enrolled patients - workbench ready',
    '03_newly_enrolled_details.sql': 'Newly enrolled patients - detailed records',
    '04_retested_positive.sql': 'Retested positive patients - workbench ready',
    '04_retested_positive_details.sql': 'Retested positive patients - detailed records',
    '05_newly_initiated.sql': 'Newly initiated ART patients - workbench ready',
    '05_newly_initiated_details.sql': 'Newly initiated ART patients - detailed records',
    '05.1.1_art_same_day.sql': 'ART same day initiation - workbench ready',
    '05.1.1_art_same_day_details.sql': 'ART same day initiation - detailed records',
    '05.1.2_art_1_7_days.sql': 'ART initiation 1-7 days - workbench ready',
    '05.1.2_art_1_7_days_details.sql': 'ART initiation 1-7 days - detailed records',
    '05.1.3_art_over_7_days.sql': 'ART initiation over 7 days - workbench ready',
    '05.1.3_art_over_7_days_details.sql': 'ART initiation over 7 days - detailed records',
    '05.2_art_with_tld.sql': 'ART with TLD regimen - workbench ready',
    '05.2_art_with_tld_details.sql': 'ART with TLD regimen - detailed records',
    '06_transfer_in.sql': 'Transfer in patients - workbench ready',
    '06_transfer_in_details.sql': 'Transfer in patients - detailed records',
    '07_lost_and_return.sql': 'Lost and return patients - workbench ready',
    '07_lost_and_return_details.sql': 'Lost and return patients - detailed records',
    '08.1_dead.sql': 'Deceased patients - workbench ready',
    '08.1_dead_details.sql': 'Deceased patients - detailed records',
    '08.2_lost_to_followup.sql': 'Lost to follow-up patients - workbench ready',
    '08.2_lost_to_followup_details.sql': 'Lost to follow-up patients - detailed records',
    '08.3_transfer_out.sql': 'Transfer out patients - workbench ready',
    '08.3_transfer_out_details.sql': 'Transfer out patients - detailed records',
    '09_active_pre_art.sql': 'Currently active Pre-ART patients - workbench ready',
    '09_active_pre_art_details.sql': 'Currently active Pre-ART patients - detailed records',
    '10_active_art_current.sql': 'Currently active ART patients - workbench ready',
    '10_active_art_current_details.sql': 'Currently active ART patients - detailed records',
    '10.1_eligible_mmd.sql': 'Eligible for multi-month dispensing - workbench ready',
    '10.1_eligible_mmd_details.sql': 'Eligible for multi-month dispensing - detailed records',
    '10.2_mmd.sql': 'Multi-month dispensing patients - workbench ready',
    '10.2_mmd_details.sql': 'Multi-month dispensing patients - detailed records',
    '10.3_tld.sql': 'TLD patients - workbench ready',
    '10.3_tld_details.sql': 'TLD patients - detailed records',
    '10.4_tpt_start.sql': 'TPT started patients - workbench ready',
    '10.4_tpt_start_details.sql': 'TPT started patients - detailed records',
    '10.5_tpt_complete.sql': 'TPT completed patients - workbench ready',
    '10.5_tpt_complete_details.sql': 'TPT completed patients - detailed records',
    '10.6_eligible_vl_test.sql': 'Eligible for viral load testing - workbench ready',
    '10.6_eligible_vl_test_details.sql': 'Eligible for viral load testing - detailed records',
    '10.7_vl_tested_12m.sql': 'Viral load tested in last 12 months - workbench ready',
    '10.7_vl_tested_12m_details.sql': 'Viral load tested in last 12 months - detailed records',
    '10.8_vl_suppression.sql': 'Viral load suppression - workbench ready',
    '10.8_vl_suppression_details.sql': 'Viral load suppression - detailed records',
    'variables.sql': 'System variables and parameters - workbench ready',
    'README-WORKBENCH.md': 'Complete documentation for SQL workbench usage'
  };
  return descriptions[fileName] || 'SQL workbench file with parameters';
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

## Indicator Descriptions

- **01_active_art_previous** - Active ART patients from previous period
- **02_active_pre_art_previous** - Active Pre-ART patients from previous period
- **03_newly_enrolled** - Newly enrolled patients
- **04_retested_positive** - Retested positive patients
- **05_newly_initiated** - Newly initiated ART patients
- **06_transfer_in** - Transfer in patients
- **07_lost_and_return** - Lost and returned patients
- **08.1_dead** - Deceased patients
- **08.2_lost_to_followup** - Lost to follow-up patients
- **08.3_transfer_out** - Transfer out patients
- **09_active_pre_art** - Currently active Pre-ART patients
- **10_active_art_current** - Currently active ART patients
- **10.1_eligible_mmd** - Eligible for multi-month dispensing
- **10.2_mmd** - Multi-month dispensing patients
- **10.3_tld** - TLD (Tenofovir/Lamivudine/Dolutegravir) patients
- **10.4_tpt_start** - TPT (TB Preventive Therapy) started
- **10.5_tpt_complete** - TPT completed
- **10.6_eligible_vl_test** - Eligible for viral load testing
- **10.7_vl_tested_12m** - Viral load tested in last 12 months
- **10.8_vl_suppression** - Viral load suppression

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
