// Script to fix SQL parameter names to be consistent
const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SQL PARAMETER NAMES');
console.log('=' .repeat(40));

const indicatorsDir = path.join(__dirname, 'src', 'queries', 'mortality_retention_indicators');

// Standard parameter mapping
const parameterMapping = {
  'startDate': 'StartDate',
  'endDate': 'EndDate', 
  'previousEndDate': 'PreviousEndDate',
  'lost_code': 'lost_code',
  'dead_code': 'dead_code',
  'transfer_out_code': 'transfer_out_code',
  'transfer_in_code': 'transfer_in_code',
  'mmd_eligible_code': 'mmd_eligible_code',
  'mmd_drug_quantity': 'mmd_drug_quantity',
  'vl_suppression_threshold': 'vl_suppression_threshold',
  'tld_regimen_formula': 'tld_regimen_formula',
  'tpt_drug_list': 'tpt_drug_list',
  'buffer_days': 'buffer_days',
  'cd4_threshold_350': 'cd4_threshold_350',
  'cd4_threshold_100': 'cd4_threshold_100'
};

function fixSqlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Fix parameter references
    Object.entries(parameterMapping).forEach(([oldParam, newParam]) => {
      const oldPattern = new RegExp(`:${oldParam}\\b`, 'g');
      const newPattern = `:${newParam}`;
      
      if (content.includes(`:${oldParam}`)) {
        content = content.replace(oldPattern, newPattern);
        changed = true;
        console.log(`   ✅ Fixed :${oldParam} → :${newParam}`);
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`📝 Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✅ No changes needed: ${path.basename(filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllSqlFiles() {
  try {
    const files = fs.readdirSync(indicatorsDir).filter(file => file.endsWith('.sql'));
    
    console.log(`📁 Found ${files.length} SQL files to check`);
    
    let fixedCount = 0;
    
    for (const file of files) {
      console.log(`\n🔍 Processing: ${file}`);
      const filePath = path.join(indicatorsDir, file);
      
      if (fixSqlFile(filePath)) {
        fixedCount++;
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(30));
    console.log(`✅ Files processed: ${files.length}`);
    console.log(`🔧 Files updated: ${fixedCount}`);
    console.log(`📋 Files unchanged: ${files.length - fixedCount}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 SQL parameter names have been standardized!');
    } else {
      console.log('\n✅ All SQL files already have correct parameter names!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixAllSqlFiles();



