#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TPT table JOIN issues...');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Get all SQL files
const files = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));

files.forEach(filename => {
  const filePath = path.join(queriesDir, filename);
  console.log(`\n📝 Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix TPT JOIN issues for adults
  // Replace direct JOIN with proper JOIN through visit table
  content = content.replace(
    /LEFT JOIN tblavtptdrug tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblavtptdrug tpt ON v.vid = tpt.Vid'
  );
  
  // Fix TPT JOIN issues for children
  content = content.replace(
    /LEFT JOIN tblcvtptdrug tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblcvtptdrug tpt ON v.vid = tpt.Vid'
  );
  
  // Fix ARV drug JOIN issues for adults
  content = content.replace(
    /LEFT JOIN tblavardrug tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblavardrug tpt ON v.vid = tpt.Vid'
  );
  
  // Fix ARV drug JOIN issues for children
  content = content.replace(
    /LEFT JOIN tblcvardrug tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblcvardrug tpt ON v.vid = tpt.Vid'
  );
  
  // Fix Cotrimoxazole JOIN issues for adults
  content = content.replace(
    /LEFT JOIN tblavcotrimoxazole tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblavcotrimoxazole tpt ON v.vid = tpt.Vid'
  );
  
  // Fix Cotrimoxazole JOIN issues for children
  content = content.replace(
    /LEFT JOIN tblcvcotrimoxazole tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblcvcotrimoxazole tpt ON v.vid = tpt.Vid'
  );
  
  // Fix Fluconazole JOIN issues for adults
  content = content.replace(
    /LEFT JOIN tblavfluconazole tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblavmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblavfluconazole tpt ON v.vid = tpt.Vid'
  );
  
  // Fix Fluconazole JOIN issues for children
  content = content.replace(
    /LEFT JOIN tblcvfluconazole tpt ON p\.ClinicID = tpt\.ClinicID/g,
    'LEFT JOIN tblcvmain v ON p.ClinicID = v.ClinicID LEFT JOIN tblcvfluconazole tpt ON v.vid = tpt.Vid'
  );
  
  // Write the corrected content back
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filename}`);
});

console.log('\n🎉 All TPT JOIN issues have been fixed!');
console.log('\n📋 Summary of fixes:');
console.log('  - Fixed TPT table JOINs to use Vid through visit tables');
console.log('  - Fixed ARV drug table JOINs');
console.log('  - Fixed Cotrimoxazole table JOINs');
console.log('  - Fixed Fluconazole table JOINs');
console.log('  - Updated both adult and children table JOINs');



