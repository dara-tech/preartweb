#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating all mortality retention indicators to follow standard pattern...');

const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Define the standard patterns for different types of indicators
const standardPatterns = {
  // Status-based indicators (died, lost, reengaged)
  '1_percentage_died.sql': {
    title: 'Indicator 1: Percentage of ART patients who died',
    mainField: 'Deaths',
    statusCode: ':dead_code',
    suffix: 'Deaths'
  },
  '2_percentage_lost_to_followup.sql': {
    title: 'Indicator 2: Percentage of ART patients who were lost to follow-up',
    mainField: 'Lost_to_Followup',
    statusCode: ':lost_code',
    suffix: 'Lost'
  },
  '3_reengaged_within_28_days.sql': {
    title: 'Indicator 3: Percentage reengaged within 28 days',
    mainField: 'Reengaged_Within_28',
    statusCode: ':transfer_in_code',
    suffix: 'Reengaged'
  },
  '4_reengaged_over_28_days.sql': {
    title: 'Indicator 4: Percentage reengaged after 28+ days',
    mainField: 'Reengaged_Over_28',
    statusCode: ':transfer_in_code',
    suffix: 'Reengaged'
  }
};

// Function to create standard SQL pattern
function createStandardSQL(pattern) {
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
Object.keys(standardPatterns).forEach(filename => {
  const pattern = standardPatterns[filename];
  const filePath = path.join(queriesDir, filename);
  
  if (fs.existsSync(filePath)) {
    const newSQL = createStandardSQL(pattern);
    fs.writeFileSync(filePath, newSQL);
    console.log(`✅ Updated: ${filename}`);
  } else {
    console.log(`⚠️  File not found: ${filename}`);
  }
});

console.log('\n🎉 Standard pattern updates completed!');
console.log('📋 Updated indicators:');
Object.keys(standardPatterns).forEach(filename => {
  console.log(`   - ${filename}`);
});



