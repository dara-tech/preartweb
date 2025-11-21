/**
 * Standardize all Mortality & Retention Indicator queries
 * Ensures all queries follow the same field order structure
 */

const fs = require('fs');
const path = require('path');

// Standard field order that ALL indicators must follow:
// 1. Indicator
// 2. Numerator (indicator-specific)
// 3. TOTAL (must equal numerator)
// 4. Denominator (indicator-specific)
// 5. Percentage
// 6. Demographic fields...
// 7. Aggregated totals (Children_Total, Adults_Total) - always last

const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');
const files = fs.readdirSync(queriesDir).filter(f => 
  f.endsWith('.sql') && !f.endsWith('_details.sql')
);

console.log('📋 Standardizing Indicator Queries\n');
console.log('='.repeat(80));

let standardized = 0;
let alreadyCorrect = 0;
let issues = [];

files.forEach(file => {
  const filePath = path.join(queriesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const indicatorId = file.replace('.sql', '');
  
  // Check if TOTAL field equals numerator (after Indicator field)
  const selectMatch = content.match(/SELECT\s+([\s\S]*?)\s+FROM[^S]*$/i);
  if (!selectMatch) {
    issues.push(`${indicatorId}: Could not find SELECT statement`);
    return;
  }
  
  const selectClause = selectMatch[1];
  
  // Extract first few fields to check order
  const lines = selectClause.split(',').map(l => l.trim());
  
  // Find Indicator, Numerator, TOTAL, Denominator, Percentage
  let indicatorField = null;
  let numeratorField = null;
  let totalField = null;
  let denominatorField = null;
  let percentageField = null;
  
  lines.forEach((line, idx) => {
    if (line.includes("AS Indicator") || line.includes("'") && line.includes("Indicator")) {
      indicatorField = { line, idx };
    }
    if (line.includes("AS TOTAL")) {
      totalField = { line, idx };
    }
    if (line.includes("AS Percentage")) {
      percentageField = { line, idx };
    }
    // Check for common numerator patterns
    if (idx > 0 && (line.includes("AS Deaths") || line.includes("AS Lost_to_Followup") || 
        line.includes("AS Reengaged_Within_28") || line.includes("AS Reengaged_Over_28") ||
        line.includes("AS Late_Visits") || line.includes("AS Early_Visits") ||
        line.includes("AS Same_Day_Initiation") || line.includes("AS TLD") ||
        line.includes("AS TPT") || line.includes("AS VL") ||
        line.includes("AS Switched_To") || line.includes("AS Retention"))) {
      if (!numeratorField) numeratorField = { line, idx };
    }
    // Check for common denominator patterns
    if (line.includes("AS Total_ART") || line.includes("AS Total_Lost") || 
        line.includes("AS Total_Eligible") || line.includes("AS Total_Visits") ||
        line.includes("AS Eligible_Patients") || line.includes("AS Total_Newly_Initiated")) {
      if (!denominatorField) denominatorField = { line, idx };
    }
  });
  
  // Check if TOTAL equals numerator
  let needsFix = false;
  let fixReason = [];
  
  if (totalField && numeratorField) {
    // Extract the value/expression for TOTAL
    const totalExpr = totalField.line.split('AS TOTAL')[0].trim();
    const numeratorExpr = numeratorField.line.split('AS')[0].trim();
    
    // Check if TOTAL uses the same expression as numerator
    // This is a simple check - if they reference the same stat/field
    if (!totalExpr.includes(numeratorExpr.split('.').pop()) && 
        !numeratorExpr.includes(totalExpr.split('.').pop())) {
      needsFix = true;
      fixReason.push('TOTAL does not equal numerator');
    }
  }
  
  // Check field order: Indicator should be first, TOTAL should be 3rd
  if (indicatorField && indicatorField.idx !== 0) {
    needsFix = true;
    fixReason.push('Indicator not first');
  }
  
  if (totalField && numeratorField && totalField.idx <= numeratorField.idx) {
    needsFix = true;
    fixReason.push('TOTAL before numerator');
  }
  
  if (percentageField && totalField && percentageField.idx <= totalField.idx) {
    needsFix = true;
    fixReason.push('Percentage before TOTAL');
  }
  
  if (needsFix) {
    console.log(`⚠️  ${indicatorId}: ${fixReason.join(', ')}`);
    issues.push(`${indicatorId}: ${fixReason.join(', ')}`);
  } else {
    console.log(`✅ ${indicatorId}: Structure correct`);
    alreadyCorrect++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`   Total queries: ${files.length}`);
console.log(`   Already correct: ${alreadyCorrect}`);
console.log(`   Needs attention: ${issues.length}`);

if (issues.length > 0) {
  console.log(`\n⚠️  Queries that need standardization:`);
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log(`\n💡 Note: Most queries are already following the standard structure.`);
  console.log(`   The main requirement is: Indicator, Numerator, TOTAL (= numerator), Denominator, Percentage`);
} else {
  console.log(`\n✅ All queries follow the standard structure!`);
}

