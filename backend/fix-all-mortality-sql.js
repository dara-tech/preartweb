#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL mortality retention indicator SQL files...');

// Get all SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');
const files = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));

files.forEach(filename => {
  const filePath = path.join(queriesDir, filename);
  console.log(`\n📝 Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix self-joining issues (tblaimain art ON p.ClinicID = p.ClinicID)
  content = content.replace(/JOIN tblaimain art ON p\.ClinicID = p\.ClinicID/g, 'JOIN tblaart art ON p.ClinicID = art.ClinicID');
  content = content.replace(/JOIN tblcimain art ON p\.ClinicID = p\.ClinicID/g, 'JOIN tblcart art ON p.ClinicID = art.ClinicID');
  
  // Fix column references for adults (p.DaART should be art.DaArt when using tblaart)
  content = content.replace(/(FROM tblaimain p[\s\S]*?JOIN tblaart art[\s\S]*?)p\.DaART/g, '$1art.DaArt');
  
  // Fix column references for children (p.DaART should be art.DaArt when using tblcart)
  content = content.replace(/(FROM tblcimain p[\s\S]*?JOIN tblcart art[\s\S]*?)p\.DaART/g, '$1art.DaArt');
  
  // Fix parameter references
  content = content.replace(/:transfer_in_code/g, '1');
  content = content.replace(/:lost_code/g, '0');
  content = content.replace(/:dead_code/g, '1');
  content = content.replace(/:transfer_out_code/g, '3');
  content = content.replace(/:vl_suppression_threshold/g, '1000');
  content = content.replace(/:cd4_threshold_350/g, '350');
  content = content.replace(/:cd4_threshold_100/g, '100');
  content = content.replace(/:buffer_days/g, '30');
  content = content.replace(/:mmd_drug_quantity/g, '60');
  
  // Fix specific issues in retention rate query
  if (filename.includes('15_retention_rate')) {
    // Fix the problematic JOINs in retention rate
    content = content.replace(/JOIN tblaimain art ON p\.ClinicID = art\.ClinicID/g, '');
    content = content.replace(/JOIN tblcart art ON p\.ClinicID = art\.ClinicID/g, '');
    
    // Fix adults section to use p.DaART directly
    content = content.replace(/FROM tblaimain p[\s\S]*?WHERE[\s\S]*?art\.DaArt/g, (match) => {
      return match.replace(/art\.DaArt/g, 'p.DaART');
    });
    
    // Fix children section to use proper JOIN
    content = content.replace(/FROM tblcimain p[\s\S]*?WHERE[\s\S]*?art\.DaArt/g, (match) => {
      return match.replace(/FROM tblcimain p/, 'FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID')
                  .replace(/art\.DaArt/g, 'art.DaArt');
    });
  }
  
  // Write the corrected content back
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filename}`);
});

console.log('\n🎉 All mortality retention indicator SQL files have been fixed!');



