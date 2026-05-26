const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const siteDb = process.argv[2] || process.env.WORKBENCH_DB || 'preart_0201';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: siteDb,
};

const SKIP_FILES = new Set([
  'variables.sql',
  'artweb-complete-indicators-workbench.sql',
  'simple_tpt_drug_query.sql',
]);

async function runScript(filePath) {
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log(`\n🔍 Running: ${path.basename(filePath)}`);
    console.log('=' .repeat(60));
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract parameter setup and main query
    const lines = content.split('\n');
    const paramStart = lines.findIndex(line => line.includes('-- PARAMETER SETUP'));
    const mainQueryStart = lines.findIndex(line => line.includes('-- MAIN QUERY'));
    
    let results = null;
    
    if (paramStart !== -1 && mainQueryStart !== -1) {
      // Extract parameter setup
      const paramLines = lines.slice(paramStart + 1, mainQueryStart);
      const setStatements = paramLines.filter(line => line.trim().startsWith('SET @'));
      
      // Execute parameter setup
      for (const setStatement of setStatements) {
        if (setStatement.trim()) {
          await connection.execute(setStatement);
        }
      }
      
      // Extract and execute main query
      const mainQueryLines = lines.slice(mainQueryStart + 1);
      const mainQuery = mainQueryLines
        .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
        .join('\n')
        .trim();
      
      if (mainQuery) {
        const [rows] = await connection.execute(mainQuery);
        results = rows;
      }
    } else {
      // Fallback: try to execute the entire content
      const statements = content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          const [rows] = await connection.execute(statement);
          if (Array.isArray(rows) && rows.length > 0) {
            results = rows;
          }
        }
      }
    }
    
    // Display results
    if (results && results.length > 0) {
      const result = results[0];
      console.log('📊 Results:');
      console.log(`   Indicator: ${result.Indicator || 'N/A'}`);
      console.log(`   Total: ${result.TOTAL || 0}`);
      console.log(`   Male 0-14: ${result.Male_0_14 || 0}`);
      console.log(`   Female 0-14: ${result.Female_0_14 || 0}`);
      console.log(`   Male 15+: ${result.Male_over_14 || 0}`);
      console.log(`   Female 15+: ${result.Female_over_14 || 0}`);
    } else {
      console.log('📊 No data returned');
    }
    
    await connection.end();
    return { success: true, results };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function collectAggregateScripts(dir) {
  return fs
    .readdirSync(dir)
    .filter(
      (file) =>
        file.endsWith('.sql') &&
        !file.includes('details') &&
        !SKIP_FILES.has(file)
    )
    .sort();
}

async function runAllScripts() {
  console.log('🚀 Running All SQL Workbench Scripts (V2)');
  console.log('=' .repeat(80));
  console.log(`📡 Database: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`);

  const workbenchDir = path.join(__dirname, '..', 'sql-workbench', 'ADULT_CHILD');
  if (!fs.existsSync(workbenchDir)) {
    throw new Error(`Workbench directory not found: ${workbenchDir}`);
  }

  const files = collectAggregateScripts(workbenchDir);

  console.log(`📁 Found ${files.length} aggregate scripts in ADULT_CHILD\n`);
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(workbenchDir, file);
    const result = await runScript(filePath);
    
    if (result.success) {
      successCount++;
      results.push({
        file: path.basename(file),
        status: 'success',
        data: result.results
      });
    } else {
      failCount++;
      results.push({
        file: path.basename(file),
        status: 'failed',
        error: result.error
      });
    }
    
    // Small delay between scripts
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 SUMMARY REPORT');
  console.log('=' .repeat(80));
  console.log(`✅ Successfully executed: ${successCount} scripts`);
  console.log(`❌ Failed: ${failCount} scripts`);
  console.log(`📁 Total processed: ${files.length} scripts`);
  
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-' .repeat(80));
  
  results.forEach((result, index) => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.file}`);
    if (result.status === 'success' && result.data && result.data.length > 0) {
      const data = result.data[0];
      console.log(`   Total: ${data.TOTAL || 0} | Male 15+: ${data.Male_over_14 || 0} | Female 15+: ${data.Female_over_14 || 0} | Male 0-14: ${data.Male_0_14 || 0} | Female 0-14: ${data.Female_0_14 || 0}`);
    } else if (result.status === 'failed') {
      console.log(`   Error: ${result.error}`);
    } else {
      console.log(`   No data returned`);
    }
  });
  
  console.log('\n🎉 All scripts execution completed!');
}

if (require.main === module) {
  runAllScripts().catch(console.error);
}

module.exports = { runAllScripts, runScript };
