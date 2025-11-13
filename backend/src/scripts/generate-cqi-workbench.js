const fs = require('fs');
const path = require('path');

// Generate CQI SQL workbench files with parameters
function generateCQIWorkbenchFiles() {
  const queriesDir = path.join(__dirname, '../queries/mortality_retention_indicators');
  const outputDir = path.join(__dirname, '../sql-workbench/cqi');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all SQL files from the mortality_retention_indicators directory
  const sqlFiles = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));
  
  console.log(`📊 Found ${sqlFiles.length} CQI SQL files to process...`);

  // Generate comprehensive CQI workbench file
  const workbenchSQL = generateCQIWorkbenchSQL(sqlFiles, queriesDir);
  const workbenchFile = path.join(outputDir, 'cqi-complete-indicators-workbench.sql');
  fs.writeFileSync(workbenchFile, workbenchSQL);
  console.log(`✅ Generated: ${workbenchFile}`);

  // Generate individual parameterized SQL files
  sqlFiles.forEach(file => {
    const sqlContent = fs.readFileSync(path.join(queriesDir, file), 'utf8');
    const parameterizedSQL = convertToCQIWorkbenchSQL(sqlContent, file);
    const outputFile = path.join(outputDir, `cqi_${file}`);
    fs.writeFileSync(outputFile, parameterizedSQL);
    console.log(`✅ Generated: ${outputFile}`);
  });

  // Generate README for CQI workbench usage
  const readmeContent = generateCQIWorkbenchReadme(sqlFiles);
  const readmeFile = path.join(outputDir, 'README-CQI-WORKBENCH.md');
  fs.writeFileSync(readmeFile, readmeContent);
  console.log(`✅ Generated: ${readmeFile}`);

  console.log(`\n🎉 Generated ${sqlFiles.length + 2} CQI workbench files in: ${outputDir}`);
}

function generateCQIWorkbenchSQL(sqlFiles, queriesDir) {
  let workbenchSQL = `-- =====================================================
-- CQI (Continuous Quality Improvement) Indicators - Workbench SQL
-- Generated: ${new Date().toISOString()}
-- 
-- This file contains all CQI mortality and retention indicators with parameters
-- Ready to use in MySQL Workbench, phpMyAdmin, or any SQL workbench
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching service configuration)
-- =====================================================
-- Set these parameters before running the queries
-- These match the parameters used in the ART Web CQI service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date
SET @reportingPeriod = 'Q1 2025';          -- Reporting period description

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
-- - tblaart: Adult ART data
-- - tblcart: Child ART data
-- - tblavpatientstatus: Adult patient status data
-- - tblcvpatientstatus: Child patient status data
-- - tblavmain: Adult visit data
-- - tblcvmain: Child visit data

-- =====================================================
-- CQI INDICATOR QUERIES
-- =====================================================

`;

  // Add each SQL file content with parameters
  sqlFiles.forEach((file, index) => {
    const sqlContent = fs.readFileSync(path.join(queriesDir, file), 'utf8');
    const indicatorName = file.replace('.sql', '').replace(/_/g, ' ').toUpperCase();
    
    workbenchSQL += `-- =====================================================
-- CQI INDICATOR ${index + 1}: ${indicatorName}
-- File: ${file}
-- =====================================================

${convertToCQIWorkbenchSQL(sqlContent, file)}

-- =====================================================

`;
  });

  workbenchSQL += `-- =====================================================
-- CQI SUMMARY QUERY
-- =====================================================
-- This query provides a summary of all CQI indicators

SELECT 
    '1. Percentage of ART patients who died' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of ART patients who died during the reporting period' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '2. Percentage of ART patients who were lost to follow-up' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of ART patients who were lost to follow-up during the reporting period' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '3. Percentage reengaged within 28 days' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of patients who reengaged in care within 28 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '4. Percentage reengaged over 28 days' as indicator_name,
    'Mortality & Re-engagement' as category,
    'Shows the percentage of patients who reengaged in care after 28 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5a. Late visits beyond buffer' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of late visits beyond ARV supply buffer date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5b. Late visits within buffer' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of late visits within ARV supply buffer date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5c. Visits on schedule' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of visits on schedule among ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '5d. Early visits' as indicator_name,
    'Visit Status' as category,
    'Shows the percentage of early visits among ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '6. Same day ART initiation' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients newly initiating ART on same-day as diagnosed date' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '7. Baseline CD4 before ART' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of HIV infected patients who received a baseline CD4 count before starting ART' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '8a. Cotrimoxazole prophylaxis' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients with CD4 count less than 350 receiving prophylaxis with Cotrimoxazole' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '8b. Fluconazole prophylaxis' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients with CD4 counts less than 100 c/mm3 receiving prophylaxis with Fluconazole' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '9. MMD 3 months' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of ART patients have received MMD ≥ 3 months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '10a. TLD new initiation' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients newly initiating ART with TLD as 1st line regimen' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '10b. TLD cumulative' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients currently on TLD regimen' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '11a. TPT received' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients who received TPT' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '11b. TPT completed' as indicator_name,
    'Treatment & Prevention' as category,
    'Shows the percentage of patients who completed TPT' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12a. VL testing coverage' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load testing coverage' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12b. VL monitored six months' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load monitoring in six months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12c. VL suppression 12 months' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with viral load suppression at 12 months' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12d. VL suppression overall' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with overall viral load suppression' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '12e. VL results 10 days' as indicator_name,
    'Viral Load' as category,
    'Shows the percentage of patients with VL results within 10 days' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13a. Enhanced adherence counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients who received enhanced adherence counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13b. Followup VL after counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients with followup VL after counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '13c. VL suppression after counseling' as indicator_name,
    'Adherence Counseling' as category,
    'Shows the percentage of patients with VL suppression after counseling' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '14a. First line to second line' as indicator_name,
    'Switching & Retention' as category,
    'Shows the percentage of patients switched from first line to second line' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '14b. Second line to third line' as indicator_name,
    'Switching & Retention' as category,
    'Shows the percentage of patients switched from second line to third line' as description,
    'Percentage' as metric_type,
    'N/A' as value
UNION ALL
SELECT 
    '15. Retention rate' as indicator_name,
    'Switching & Retention' as category,
    'Shows the retention rate of ART patients' as description,
    'Percentage' as metric_type,
    'N/A' as value;

-- =====================================================
-- END OF CQI ANALYSIS
-- =====================================================
-- Generated by ART Web CQI System
-- For support, contact the development team
`;

  return workbenchSQL;
}

function convertToCQIWorkbenchSQL(sqlContent, fileName) {
  // Convert the SQL content to use parameters
  let workbenchSQL = sqlContent;
  
  // Replace hardcoded values with parameters (matching service usage)
  workbenchSQL = workbenchSQL.replace(/'1705'/g, '@siteCode');
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
-- CQI: ${fileName.replace('.sql', '').replace(/_/g, ' ').toUpperCase()}
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- =====================================================
-- PARAMETER SETUP (matching CQI service configuration)
-- =====================================================
-- Set these parameters before running this query
-- These match the parameters used in the ART Web CQI service

-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date

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
-- MAIN CQI QUERY
-- =====================================================
${workbenchSQL}`;

  return parameterizedSQL;
}

function generateCQIWorkbenchReadme(sqlFiles) {
  return `# CQI (Continuous Quality Improvement) SQL Workbench Files

This directory contains SQL files for CQI mortality and retention indicators, ready to use in any SQL workbench environment (MySQL Workbench, phpMyAdmin, etc.).

## Files Generated

### Main Files
- \`cqi-complete-indicators-workbench.sql\` - Complete CQI analysis with all indicators
- \`README-CQI-WORKBENCH.md\` - This documentation file

### Individual CQI Indicator Files
${sqlFiles.map(file => `- \`cqi_${file}\` - ${file.replace('.sql', '').replace(/_/g, ' ').toUpperCase()}`).join('\n')}

## Quick Start

### 1. Set Parameters
Before running any queries, set these parameters (matching the CQI service configuration):

\`\`\`sql
-- Date parameters (Quarterly period)
SET @StartDate = '2025-01-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-03-31';               -- End date (YYYY-MM-DD) - Q1 2025
SET @PreviousEndDate = '2024-12-31';       -- Previous period end date

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

### 2. Run Complete CQI Analysis
Execute the main file for all CQI indicators:
\`\`\`sql
-- Run: cqi-complete-indicators-workbench.sql
\`\`\`

### 3. Run Individual CQI Indicators
Execute specific CQI indicator files:
\`\`\`sql
-- Run: cqi_1_percentage_died.sql
-- Run: cqi_2_percentage_lost_to_followup.sql
-- Run: cqi_3_reengaged_within_28_days.sql
-- etc.
\`\`\`

## Available CQI Indicators

| Indicator | File | Category | Description |
|-----------|------|----------|-------------|
| 1 | cqi_1_percentage_died.sql | Mortality & Re-engagement | Percentage of ART patients who died |
| 2 | cqi_2_percentage_lost_to_followup.sql | Mortality & Re-engagement | Percentage of ART patients who were lost to follow-up |
| 3 | cqi_3_reengaged_within_28_days.sql | Mortality & Re-engagement | Percentage reengaged within 28 days |
| 4 | cqi_4_reengaged_over_28_days.sql | Mortality & Re-engagement | Percentage reengaged over 28 days |
| 5a | cqi_5a_late_visits_beyond_buffer.sql | Visit Status | Late visits beyond buffer |
| 5b | cqi_5b_late_visits_within_buffer.sql | Visit Status | Late visits within buffer |
| 5c | cqi_5c_visits_on_schedule.sql | Visit Status | Visits on schedule |
| 5d | cqi_5d_early_visits.sql | Visit Status | Early visits |
| 6 | cqi_6_same_day_art_initiation.sql | Treatment & Prevention | Same day ART initiation |
| 7 | cqi_7_baseline_cd4_before_art.sql | Treatment & Prevention | Baseline CD4 before ART |
| 8a | cqi_8a_cotrimoxazole_prophylaxis.sql | Treatment & Prevention | Cotrimoxazole prophylaxis |
| 8b | cqi_8b_fluconazole_prophylaxis.sql | Treatment & Prevention | Fluconazole prophylaxis |
| 9 | cqi_9_mmd_3_months.sql | Treatment & Prevention | MMD 3 months |
| 10a | cqi_10a_tld_new_initiation.sql | Treatment & Prevention | TLD new initiation |
| 10b | cqi_10b_tld_cumulative.sql | Treatment & Prevention | TLD cumulative |
| 11a | cqi_11a_tpt_received.sql | Treatment & Prevention | TPT received |
| 11b | cqi_11b_tpt_completed.sql | Treatment & Prevention | TPT completed |
| 12a | cqi_12a_vl_testing_coverage.sql | Viral Load | VL testing coverage |
| 12b | cqi_12b_vl_monitored_six_months.sql | Viral Load | VL monitored six months |
| 12c | cqi_12c_vl_suppression_12_months.sql | Viral Load | VL suppression 12 months |
| 12d | cqi_12d_vl_suppression_overall.sql | Viral Load | VL suppression overall |
| 12e | cqi_12e_vl_results_10_days.sql | Viral Load | VL results 10 days |
| 13a | cqi_13a_enhanced_adherence_counseling.sql | Adherence Counseling | Enhanced adherence counseling |
| 13b | cqi_13b_followup_vl_after_counseling.sql | Adherence Counseling | Followup VL after counseling |
| 13c | cqi_13c_vl_suppression_after_counseling.sql | Adherence Counseling | VL suppression after counseling |
| 14a | cqi_14a_first_line_to_second_line.sql | Switching & Retention | First line to second line |
| 14b | cqi_14b_second_line_to_third_line.sql | Switching & Retention | Second line to third line |
| 15 | cqi_15_retention_rate.sql | Switching & Retention | Retention rate |

## Database Requirements

### Required Tables
- \`tblaimain\` - Adult patient data
- \`tblcimain\` - Child patient data
- \`tblaart\` - Adult ART data
- \`tblcart\` - Child ART data
- \`tblavpatientstatus\` - Adult patient status data
- \`tblcvpatientstatus\` - Child patient status data
- \`tblavmain\` - Adult visit data
- \`tblcvmain\` - Child visit data

### Required Columns
- \`ClinicID\` - Clinic identifier
- \`DafirstVisit\` - First visit date
- \`DaART\` - ART start date
- \`Sex\` - Patient gender
- \`DaBirth\` - Birth date
- \`Status\` - Patient status
- \`Da\` - Status date

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

-- Run any CQI indicator query
SOURCE cqi_1_percentage_died.sql;
\`\`\`

### Example 2: Run complete CQI analysis
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

SOURCE cqi-complete-indicators-workbench.sql;
\`\`\`

### Example 3: Export CQI results
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
    -- Your CQI indicator query here
) AS results
INTO OUTFILE '/tmp/cqi_indicator_results.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\\n';
\`\`\`

## CQI Categories

### 1. Mortality & Re-engagement
- Deaths, Lost to follow-up, Reengagement indicators
- Focus on patient retention and mortality tracking

### 2. Visit Status
- Visit timing and adherence patterns
- Late visits, on-schedule visits, early visits

### 3. Treatment & Prevention
- ART initiation, prophylaxis, MMD, TLD, TPT
- Treatment quality and prevention measures

### 4. Viral Load
- VL testing coverage, monitoring, suppression
- Viral load management and monitoring

### 5. Adherence Counseling
- Enhanced adherence counseling and follow-up
- Patient support and adherence improvement

### 6. Switching & Retention
- Regimen switching and patient retention
- Treatment optimization and retention strategies

## Troubleshooting

### Common Issues
1. **Parameter not set**: Make sure to set all @ parameters before running queries
2. **Table not found**: Ensure all required tables exist in your database
3. **Permission denied**: Check database user permissions for SELECT operations

### Performance Tips
1. **Index optimization**: Ensure proper indexes on ClinicID, DaART, Status columns
2. **Date filtering**: Use date ranges to limit data processing
3. **Site filtering**: Always filter by specific site codes for better performance

## Support

For technical support or questions about these CQI SQL files, please contact the development team.

## License

This software is licensed under the MIT License.
`;
}

// Run the generator
generateCQIWorkbenchFiles();



