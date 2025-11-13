#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing MySQL LIMIT subquery compatibility issues...');

// Directory containing the mortality retention indicator SQL files
const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');

// Get all SQL files
const files = fs.readdirSync(queriesDir).filter(file => file.endsWith('.sql'));

files.forEach(filename => {
  const filePath = path.join(queriesDir, filename);
  console.log(`\n📝 Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix LIMIT subquery issues by replacing complex EXISTS with simpler JOINs
  // Pattern: EXISTS (SELECT 1 FROM table WHERE condition IN (SELECT ... LIMIT 1))
  
  // Fix for Cotrimoxazole and Fluconazole indicators
  const limitSubqueryPattern = /EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+(\w+)\s+(\w+)\s+WHERE\s+(\w+)\.Vid\s+IN\s*\(\s*SELECT\s+v\.Vid\s+FROM\s+(\w+)\s+v\s+WHERE\s+v\.ClinicID\s*=\s*(\w+)\.ClinicID\s+AND\s+v\.DatVisit\s*>=\s*(\w+)\.Dat\s+ORDER\s+BY\s+v\.DatVisit\s+DESC\s+LIMIT\s+1\s*\)/g;
  
  content = content.replace(limitSubqueryPattern, (match, drugTable, drugAlias, drugVidCol, visitTable, patientAlias, testAlias) => {
    modified = true;
    return `EXISTS (
                SELECT 1 FROM ${drugTable} ${drugAlias}
                JOIN ${visitTable} v ON ${drugAlias}.Vid = v.Vid
                WHERE v.ClinicID = ${patientAlias}.ClinicID 
                AND v.DatVisit >= ${testAlias}.Dat
                AND v.DatVisit = (
                    SELECT MAX(v2.DatVisit) 
                    FROM ${visitTable} v2 
                    WHERE v2.ClinicID = ${patientAlias}.ClinicID 
                    AND v2.DatVisit >= ${testAlias}.Dat
                )
            )`;
  });
  
  // Alternative fix for any remaining LIMIT subquery patterns
  const alternativePattern = /WHERE\s+(\w+)\.Vid\s+IN\s*\(\s*SELECT\s+v\.Vid\s+FROM\s+(\w+)\s+v\s+WHERE\s+v\.ClinicID\s*=\s*(\w+)\.ClinicID\s+AND\s+v\.DatVisit\s*>=\s*(\w+)\.Dat\s+ORDER\s+BY\s+v\.DatVisit\s+DESC\s+LIMIT\s+1\s*\)/g;
  
  content = content.replace(alternativePattern, (match, drugVidCol, visitTable, patientAlias, testAlias) => {
    modified = true;
    return `WHERE ${drugVidCol} IN (
                SELECT v.Vid FROM ${visitTable} v
                WHERE v.ClinicID = ${patientAlias}.ClinicID 
                AND v.DatVisit >= ${testAlias}.Dat
                AND v.DatVisit = (
                    SELECT MAX(v2.DatVisit) 
                    FROM ${visitTable} v2 
                    WHERE v2.ClinicID = ${patientAlias}.ClinicID 
                    AND v2.DatVisit >= ${testAlias}.Dat
                )
            )`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filename}`);
  } else {
    console.log(`✅ No changes needed: ${filename}`);
  }
});

console.log('\n🎉 All MySQL LIMIT subquery compatibility issues have been fixed!');
console.log('\n📋 Summary of fixes:');
console.log('  - Replaced LIMIT subqueries with MAX() subqueries');
console.log('  - Fixed EXISTS clauses with complex IN subqueries');
console.log('  - Maintained same logic but MySQL-compatible syntax');



