#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

console.log('🔧 Fixing mortality retention indicator SQL files to match actual database schema...');

// Get all SQL files
const files = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));

files.forEach(filename => {
  const filePath = path.join(queriesDir, filename);
  console.log(`\n📝 Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix ART table references
  // Replace tblaart with tblaimain and use DaART instead of DaArt
  content = content.replace(/tblaart/g, 'tblaimain');
  content = content.replace(/art\.DaArt/g, 'p.DaART');
  content = content.replace(/art\.ClinicID/g, 'p.ClinicID');
  
  // Fix ART stop date references (remove non-existent DaArtStop)
  content = content.replace(/AND \(art\.DaArtStop IS NULL OR art\.DaArtStop > :EndDate\)/g, '');
  content = content.replace(/AND \(p\.ARTStopDate IS NULL OR p\.ARTStopDate > :EndDate\)/g, '');
  
  // Fix ART start date references
  content = content.replace(/p\.ARTStartDate/g, 'p.DaART');
  
  // Fix JOIN statements for ART
  content = content.replace(/JOIN tblaart art ON p\.ClinicID = art\.ClinicID/g, '');
  content = content.replace(/JOIN tblcart art ON p\.ClinicID = art\.ClinicID/g, '');
  
  // Fix WHERE clauses for ART
  content = content.replace(/art\.DaArt <= :EndDate/g, 'p.DaART <= :EndDate');
  content = content.replace(/art\.DaArt IS NOT NULL/g, 'p.DaART IS NOT NULL');
  content = content.replace(/art\.DaArt >= :StartDate/g, 'p.DaART >= :StartDate');
  
  // Fix parameter names to match SQL expectations
  content = content.replace(/:startDate/g, ':StartDate');
  content = content.replace(/:endDate/g, ':EndDate');
  content = content.replace(/:previousEndDate/g, ':PreviousEndDate');
  
  // Write the corrected content back
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filename}`);
});

console.log('\n🎉 All mortality retention indicator SQL files have been fixed!');
console.log('\n📋 Summary of fixes:');
console.log('  - Changed tblaart/tblcart references to tblaimain/tblcimain');
console.log('  - Updated DaArt references to DaART');
console.log('  - Removed non-existent DaArtStop references');
console.log('  - Fixed parameter names to match SQL expectations');
console.log('  - Updated JOIN and WHERE clauses');



