#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating all mortality retention indicators to use TOTAL field...');

const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Define the updated patterns with TOTAL field
const updatedPatterns = {
  '1_percentage_died.sql': {
    title: 'Indicator 1: Percentage of ART patients who died',
    mainField: 'TOTAL',
    statusCode: ':dead_code',
    suffix: 'Deaths'
  },
  '2_percentage_lost_to_followup.sql': {
    title: 'Indicator 2: Percentage of ART patients who were lost to follow-up',
    mainField: 'TOTAL',
    statusCode: ':lost_code',
    suffix: 'Lost'
  },
  '3_reengaged_within_28_days.sql': {
    title: 'Indicator 3: Percentage reengaged within 28 days',
    mainField: 'TOTAL',
    statusCode: ':transfer_in_code',
    suffix: 'Reengaged'
  },
  '4_reengaged_over_28_days.sql': {
    title: 'Indicator 4: Percentage reengaged after 28+ days',
    mainField: 'TOTAL',
    statusCode: ':transfer_in_code',
    suffix: 'Reengaged'
  }
};

// Function to create standard SQL pattern with TOTAL
function createStandardSQLWithTotal(pattern) {
  return `-- ${pattern.title}
SELECT
    '${pattern.title}' AS Indicator,
    IFNULL(COUNT(*), 0) AS ${pattern.mainField},
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14_${pattern.suffix},
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14_${pattern.suffix},
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14_${pattern.suffix},
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14_${pattern.suffix}
FROM (
    SELECT 'Adult' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblaimain main JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN :StartDate AND :EndDate AND s.Status = ${pattern.statusCode}
    UNION ALL
    SELECT 'Child' as type, IF(main.Sex=0, 'Female', 'Male') as Sex FROM tblcimain main JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID WHERE s.Da BETWEEN :StartDate AND :EndDate AND s.Status = ${pattern.statusCode}
) AS PatientList;`;
}

// Update the files
Object.keys(updatedPatterns).forEach(filename => {
  const pattern = updatedPatterns[filename];
  const filePath = path.join(queriesDir, filename);
  
  if (fs.existsSync(filePath)) {
    const newSQL = createStandardSQLWithTotal(pattern);
    fs.writeFileSync(filePath, newSQL);
    console.log(`✅ Updated: ${filename} - Now uses TOTAL field`);
  } else {
    console.log(`⚠️  File not found: ${filename}`);
  }
});

console.log('\n🎉 All indicators now use TOTAL field!');
console.log('📋 Updated indicators:');
Object.keys(updatedPatterns).forEach(filename => {
  console.log(`   - ${filename}`);
});



