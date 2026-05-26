const fs = require('fs');
const path = require('path');

// Generate comprehensive SQL workbench files with parameters
function generateSQLWorkbenchFiles() {
  const queriesDir = path.join(__dirname, '../queries/indicators');
  const outputDir = path.join(__dirname, '../sql-workbench/ADULT_CHILD');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all SQL files from the indicators directory
  const sqlFiles = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));
  
  console.log(`📊 Found ${sqlFiles.length} SQL files to process...`);

  // Generate comprehensive SQL workbench file
  const workbenchSQL = generateComprehensiveWorkbenchSQL(sqlFiles, queriesDir);
  const workbenchFile = path.join(outputDir, 'artweb-complete-indicators-workbench.sql');
  fs.writeFileSync(workbenchFile, workbenchSQL);
  console.log(`✅ Generated: ${workbenchFile}`);

  // Generate individual parameterized SQL files
  sqlFiles.forEach(file => {
    const sqlContent = fs.readFileSync(path.join(queriesDir, file), 'utf8');
    const parameterizedSQL = convertToWorkbenchSQL(sqlContent, file);
    const outputFile = path.join(outputDir, file);
    fs.writeFileSync(outputFile, parameterizedSQL);
    console.log(`✅ Generated: ${outputFile}`);
  });

  // Generate README for workbench usage
  const readmeContent = generateWorkbenchReadme(sqlFiles);
  const readmeFile = path.join(outputDir, 'README-WORKBENCH.md');
  fs.writeFileSync(readmeFile, readmeContent);
  console.log(`✅ Generated: ${readmeFile}`);

  console.log(`\n🎉 Generated ${sqlFiles.length + 2} workbench files in: ${outputDir}`);
}

function generateComprehensiveWorkbenchSQL(sqlFiles, queriesDir) {
  let workbenchSQL = `-- =====================================================
-- ART Web Complete Indicators Analysis - Workbench SQL
-- Generated: ${new Date().toISOString()}
-- 
-- This file contains all HIV/AIDS indicators with parameters
-- Ready to use in MySQL Workbench, phpMyAdmin, or any SQL workbench
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running the queries
-- These match the parameters used in the ART Web service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date
SET @reportingPeriod = 'Q1 2024';          -- Reporting period description

-- Status codes (matching service defaults)
SET @lost_code = 0;                        -- Lost to follow-up status code
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code
SET @transfer_in_code = 1;                 -- Transfer in status code
SET @mmd_eligible_code = 0;                -- MMD eligible status code

-- Clinical parameters
SET @mmd_drug_quantity = 60;               -- MMD drug quantity threshold
SET @vl_suppression_threshold = 1000;      -- Viral load suppression threshold
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula
SET @tpt_drug_list = "'Isoniazid','3HP','6H'"; -- TPT drug list

-- =====================================================
-- DATABASE INFORMATION
-- =====================================================
-- This analysis uses the following main tables:
-- - tblaimain: Adult patient data
-- - tblcimain: Child patient data  
-- - tbleimain: Infant patient data
-- - tblavpatientstatus: Patient status data
-- - tblsitename: Site information
-- - tblclinic: Clinic information

-- =====================================================
-- INDICATOR QUERIES
-- =====================================================

`;

  // Add each SQL file content with parameters
  sqlFiles.forEach((file, index) => {
    const sqlContent = fs.readFileSync(path.join(queriesDir, file), 'utf8');
    const indicatorName = file.replace('.sql', '').replace(/_/g, ' ').toUpperCase();
    
    workbenchSQL += `-- =====================================================
-- INDICATOR ${index + 1}: ${indicatorName}
-- File: ${file}
-- =====================================================

${convertToWorkbenchSQL(sqlContent, file)}

-- =====================================================

`;
  });

  workbenchSQL += `-- =====================================================
-- SUMMARY QUERY
-- =====================================================
-- This query provides a summary of all indicators

SELECT 
    'Active ART Previous' as indicator_name,
    'Total active ART patients from previous period' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active Pre-ART Previous' as indicator_name,
    'Total active Pre-ART patients from previous period' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Newly Enrolled' as indicator_name,
    'Total newly enrolled patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Retested Positive' as indicator_name,
    'Total retested positive patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Newly Initiated ART' as indicator_name,
    'Total newly initiated ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Transfer In' as indicator_name,
    'Total transfer in patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Lost and Return' as indicator_name,
    'Total lost and return patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Dead' as indicator_name,
    'Total deceased patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Lost to Follow-up' as indicator_name,
    'Total lost to follow-up patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Transfer Out' as indicator_name,
    'Total transfer out patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active Pre-ART Current' as indicator_name,
    'Currently active Pre-ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Active ART Current' as indicator_name,
    'Currently active ART patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Eligible MMD' as indicator_name,
    'Eligible for multi-month dispensing' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'MMD' as indicator_name,
    'Multi-month dispensing patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TLD' as indicator_name,
    'TLD patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TPT Start' as indicator_name,
    'TPT started patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'TPT Complete' as indicator_name,
    'TPT completed patients' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'Eligible VL Test' as indicator_name,
    'Eligible for viral load testing' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'VL Tested 12M' as indicator_name,
    'Viral load tested in last 12 months' as description,
    'Count' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    'VL Suppression' as indicator_name,
    'Viral load suppression' as description,
    'Count' as metric_type,
    'N/A' as value;

-- =====================================================
-- END OF ANALYSIS
-- =====================================================
-- Generated by ART Web System
-- For support, contact the development team
`;

  return workbenchSQL;
}

function convertToWorkbenchSQL(sqlContent, fileName) {
  // Convert the SQL content to use parameters
  let workbenchSQL = sqlContent;
  
  // Replace hardcoded values with parameters (matching service usage)
  workbenchSQL = workbenchSQL.replace(/'0201'/g, '@siteCode');
  workbenchSQL = workbenchSQL.replace(/'2025-01-01'/g, '@StartDate');
  workbenchSQL = workbenchSQL.replace(/'2025-03-31'/g, '@EndDate');
  workbenchSQL = workbenchSQL.replace(/'2025-01-01 00:00:00'/g, '@StartDate');
  workbenchSQL = workbenchSQL.replace(/'2025-03-31 23:59:59'/g, '@EndDate');
  
  // Convert colon format parameters to at-sign format for workbench
  workbenchSQL = workbenchSQL.replace(/:StartDate/g, '@StartDate');
  workbenchSQL = workbenchSQL.replace(/:EndDate/g, '@EndDate');
  workbenchSQL = workbenchSQL.replace(/:PreviousEndDate/g, '@PreviousEndDate');
  workbenchSQL = workbenchSQL.replace(/:lost_code/g, '@lost_code');
  workbenchSQL = workbenchSQL.replace(/:dead_code/g, '@dead_code');
  workbenchSQL = workbenchSQL.replace(/:transfer_out_code/g, '@transfer_out_code');
  workbenchSQL = workbenchSQL.replace(/:transfer_in_code/g, '@transfer_in_code');
  workbenchSQL = workbenchSQL.replace(/:mmd_eligible_code/g, '@mmd_eligible_code');
  workbenchSQL = workbenchSQL.replace(/:mmd_drug_quantity/g, '@mmd_drug_quantity');
  workbenchSQL = workbenchSQL.replace(/:vl_suppression_threshold/g, '@vl_suppression_threshold');
  workbenchSQL = workbenchSQL.replace(/:tld_regimen_formula/g, '@tld_regimen_formula');
  workbenchSQL = workbenchSQL.replace(/:tpt_drug_list/g, '@tpt_drug_list');
  
  // Add parameter setup and validation (matching service parameters)
  const parameterizedSQL = `-- =====================================================
-- ${fileName.replace('.sql', '').replace(/_/g, ' ').toUpperCase()}
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes (matching service defaults)
SET @lost_code = 0;                        -- Lost to follow-up status code
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code
SET @transfer_in_code = 1;                 -- Transfer in status code
SET @mmd_eligible_code = 0;                -- MMD eligible status code

-- Clinical parameters
SET @mmd_drug_quantity = 60;               -- MMD drug quantity threshold
SET @vl_suppression_threshold = 1000;      -- Viral load suppression threshold
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula
SET @tpt_drug_list = "'Isoniazid','3HP','6H'"; -- TPT drug list

-- =====================================================
-- MAIN QUERY
-- =====================================================
${workbenchSQL}`;

  return parameterizedSQL;
}

function generateWorkbenchReadme(sqlFiles) {
  return `# ART Web SQL Workbench Files

This directory contains SQL files ready to use in any SQL workbench environment (MySQL Workbench, phpMyAdmin, etc.).

## Files Generated

### Main Files
- \`artweb-complete-indicators-workbench.sql\` - Complete analysis with all indicators
- \`README-WORKBENCH.md\` - This documentation file

### Individual Indicator Files
${sqlFiles.map(file => `- \`${file}\` - ${file.replace('.sql', '').replace(/_/g, ' ').toUpperCase()}`).join('\n')}

## Quick Start

### 1. Set Parameters
Before running any queries, set these parameters (matching the service configuration):

\`\`\`sql
-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD) - Q2 2025
SET @PreviousEndDate = '2025-03-31';       -- Previous period end date

-- Status codes (matching service defaults)
SET @lost_code = 0;                        -- Lost to follow-up status code
SET @dead_code = 1;                        -- Dead status code
SET @transfer_out_code = 3;                -- Transfer out status code
SET @transfer_in_code = 1;                 -- Transfer in status code
SET @mmd_eligible_code = 0;                -- MMD eligible status code

-- Clinical parameters
SET @mmd_drug_quantity = 60;               -- MMD drug quantity threshold
SET @vl_suppression_threshold = 1000;      -- Viral load suppression threshold
SET @tld_regimen_formula = '3TC + DTG + TDF'; -- TLD regimen formula
SET @tpt_drug_list = "'Isoniazid','3HP','6H'"; -- TPT drug list
\`\`\`

### 2. Run Complete Analysis
Execute the main file for all indicators:
\`\`\`sql
-- Run: artweb-complete-indicators-workbench.sql
\`\`\`

### 3. Run Individual Indicators
Execute specific indicator files:
\`\`\`sql
-- Run: workbench-01_active_art_previous.sql
-- Run: workbench-02_active_pre_art_previous.sql
-- etc.
\`\`\`

## Available Indicators

| Indicator | File | Description |
|-----------|------|-------------|
| 01 | 01_active_art_previous.sql | Active ART patients from previous period |
| 02 | 02_active_pre_art_previous.sql | Active Pre-ART patients from previous period |
| 03 | 03_newly_enrolled.sql | Newly enrolled patients |
| 04 | 04_retested_positive.sql | Retested positive patients |
| 05 | 05_newly_initiated.sql | Newly initiated ART patients |
| 05.1.1 | 05.1.1_art_same_day.sql | ART same day initiation |
| 05.1.2 | 05.1.2_art_1_7_days.sql | ART 1-7 days initiation |
| 05.1.3 | 05.1.3_art_over_7_days.sql | ART over 7 days initiation |
| 05.2 | 05.2_art_with_tld.sql | ART with TLD |
| 06 | 06_transfer_in.sql | Transfer in patients |
| 07 | 07_lost_and_return.sql | Lost and return patients |
| 08.1 | 08.1_dead.sql | Deceased patients |
| 08.2 | 08.2_lost_to_followup.sql | Lost to follow-up patients |
| 08.3 | 08.3_transfer_out.sql | Transfer out patients |
| 09 | 09_active_pre_art.sql | Currently active Pre-ART patients |
| 10 | 10_active_art_current.sql | Currently active ART patients |
| 10.1 | 10.1_eligible_mmd.sql | Eligible for multi-month dispensing |
| 10.2 | 10.2_mmd.sql | Multi-month dispensing patients |
| 10.3 | 10.3_tld.sql | TLD patients |
| 10.4 | 10.4_tpt_start.sql | TPT started patients |
| 10.5 | 10.5_tpt_complete.sql | TPT completed patients |
| 10.6 | 10.6_eligible_vl_test.sql | Eligible for viral load testing |
| 10.7 | 10.7_vl_tested_12m.sql | Viral load tested in last 12 months |
| 10.8 | 10.8_vl_suppression.sql | Viral load suppression |

## Database Requirements

### Required Tables
- \`tblaimain\` - Adult patient data
- \`tblcimain\` - Child patient data
- \`tbleimain\` - Infant patient data
- \`tblavpatientstatus\` - Patient status data
- \`tblsitename\` - Site information
- \`tblclinic\` - Clinic information

### Required Columns
- \`SiteName\` - Site identifier
- \`DafirstVisit\` - First visit date
- \`DaART\` - ART start date
- \`Sex\` - Patient gender
- \`DaBirth\` - Birth date
- \`ClinicID\` - Clinic identifier

## Usage Examples

### Example 1: Run for specific period
\`\`\`sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

-- Run any indicator query
SOURCE 01_active_art_previous.sql;
\`\`\`

### Example 2: Run complete analysis
\`\`\`sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

SOURCE artweb-complete-indicators-workbench.sql;
\`\`\`

### Example 3: Export results
\`\`\`sql
-- Set all required parameters
SET @StartDate = '2024-01-01';
SET @EndDate = '2024-03-31';
SET @PreviousEndDate = '2023-12-31';
SET @lost_code = 0;
SET @dead_code = 1;
SET @transfer_out_code = 3;
SET @transfer_in_code = 1;
SET @mmd_eligible_code = 0;
SET @mmd_drug_quantity = 60;
SET @vl_suppression_threshold = 1000;
SET @tld_regimen_formula = '3TC + DTG + TDF';
SET @tpt_drug_list = "'Isoniazid','3HP','6H'";

-- Run query and export
SELECT * FROM (
    -- Your indicator query here
) AS results
INTO OUTFILE '/tmp/indicator_results.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\\n';
\`\`\`

## Troubleshooting

### Common Issues
1. **Parameter not set**: Make sure to set @siteCode, @startDate, @endDate before running queries
2. **Table not found**: Ensure all required tables exist in your database
3. **Permission denied**: Check database user permissions for SELECT operations

### Performance Tips
1. **Index optimization**: Ensure proper indexes on SiteName, DafirstVisit, DaART columns
2. **Date filtering**: Use date ranges to limit data processing
3. **Site filtering**: Always filter by specific site codes for better performance

## Support

For technical support or questions about these SQL files, please contact the development team.

## License

This software is licensed under the MIT License.
`;
}

// Run the generator
generateSQLWorkbenchFiles();
