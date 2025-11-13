#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

console.log('🔧 Comprehensive fix for mortality retention indicator SQL files...');

// Get all SQL files
const files = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));

files.forEach(filename => {
  const filePath = path.join(queriesDir, filename);
  console.log(`\n📝 Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix self-joining issues
  content = content.replace(/JOIN tblaimain art ON p\.ClinicID = p\.ClinicID/g, '');
  content = content.replace(/JOIN tblcimain art ON p\.ClinicID = p\.ClinicID/g, '');
  
  // Fix children ART references - children need tblcart table
  content = content.replace(/FROM tblcimain p[\s\S]*?WHERE[\s\S]*?p\.DaART/g, (match) => {
    return match.replace(/FROM tblcimain p/, 'FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID')
                .replace(/p\.DaART/g, 'art.DaArt');
  });
  
  // Fix children WHERE clauses
  content = content.replace(/p\.DaART <= :EndDate/g, (match, offset) => {
    const beforeMatch = content.substring(0, offset);
    const afterMatch = content.substring(offset + match.length);
    
    // Check if this is in the children section (after UNION ALL)
    const beforeUnion = beforeMatch.lastIndexOf('UNION ALL');
    const afterUnion = afterMatch.indexOf('FROM tblcimain');
    
    if (beforeUnion > -1 && afterUnion > -1 && beforeUnion < offset) {
      return 'art.DaArt <= :EndDate';
    }
    return match;
  });
  
  // Fix children WHERE clauses more systematically
  content = content.replace(/(FROM tblcimain p[\s\S]*?WHERE[\s\S]*?)p\.DaART/g, '$1art.DaArt');
  content = content.replace(/(FROM tblcimain p[\s\S]*?WHERE[\s\S]*?)p\.DaART/g, '$1art.DaArt');
  
  // Remove any remaining incorrect JOINs
  content = content.replace(/JOIN tblcart art ON p\.ClinicID = p\.ClinicID/g, 'JOIN tblcart art ON p.ClinicID = art.ClinicID');
  
  // Fix parameter references
  content = content.replace(/:transfer_in_code/g, '1');
  content = content.replace(/:lost_code/g, '0');
  content = content.replace(/:dead_code/g, '1');
  content = content.replace(/:transfer_out_code/g, '3');
  
  // Write the corrected content back
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filename}`);
});

console.log('\n🎉 All mortality retention indicator SQL files have been comprehensively fixed!');



