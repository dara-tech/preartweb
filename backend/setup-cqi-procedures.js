/**
 * Setup Script to Create CQI Stored Procedures
 * Run this script to create all required CQI indicators stored procedures
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'preart_sites_registry',
  multipleStatements: true,
  connectTimeout: 60000
};

async function setupCQIProcedures() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully\n');

    // 1. Create CQI Indicator Table (if not exists)
    console.log('📊 Step 1: Creating cqi_indicator table...');
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'src/migrations/create_cqi_indicator_table.sql'),
      'utf8'
    );
    await connection.query(createTableSQL);
    console.log('✅ Table created/verified\n');

    // 2. Create Helper Functions
    console.log('🔧 Step 2: Creating helper functions...');
    const helperFunctionsSQL = fs.readFileSync(
      path.join(__dirname, 'src/functions/cqi_helper_functions.sql'),
      'utf8'
    );
    
    // Split and execute each function separately
    const functionStatements = helperFunctionsSQL.split('DELIMITER ;');
    for (const statement of functionStatements) {
      if (statement.trim()) {
        const cleanStatement = statement.replace(/DELIMITER \$\$/g, '').trim();
        if (cleanStatement) {
          try {
            await connection.query(cleanStatement);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.warn(`   ⚠️  Warning: ${err.message.substring(0, 100)}`);
            }
          }
        }
      }
    }
    console.log('✅ Helper functions created\n');

    // 3. Create Stored Procedures
    console.log('🔄 Step 3: Creating stored procedures...');
    console.log('   This may take a few moments...');
    
    const proceduresSQL = fs.readFileSync(
      path.join(__dirname, 'src/procedures/populate_cqi_indicators.sql'),
      'utf8'
    );

    // Drop existing procedures first
    console.log('   Dropping existing procedures (if any)...');
    const proceduresToDrop = [
      'PopulateAllCQIIndicators',
      'PopulateIndicator1',
      'PopulateIndicator2',
      'PopulateIndicator3',
      'PopulateIndicator4',
      'PopulateIndicator5a',
      'PopulateIndicator5b',
      'PopulateIndicator5c',
      'PopulateIndicator5d',
      'PopulateIndicator6a',
      'PopulateIndicator6b',
      'PopulateIndicator6c',
      'PopulateIndicator7',
      'PopulateIndicator8a',
      'PopulateIndicator8b',
      'PopulateIndicator8c',
      'PopulateIndicator8d',
      'PopulateIndicator9a',
      'PopulateIndicator9b',
      'PopulateIndicator10a',
      'PopulateIndicator10b',
      'PopulateIndicator10c',
      'PopulateIndicator11a',
      'PopulateIndicator11b',
      'PopulateIndicator12a',
      'PopulateIndicator12b',
      'PopulateIndicator12c',
      'PopulateIndicator12d',
      'PopulateIndicator12e',
      'PopulateIndicator13a',
      'PopulateIndicator13b',
      'PopulateIndicator13c',
      'PopulateIndicator14a',
      'PopulateIndicator14b',
      'PopulateIndicator15'
    ];

    for (const proc of proceduresToDrop) {
      try {
        await connection.query(`DROP PROCEDURE IF EXISTS ${proc}`);
      } catch (err) {
        // Ignore errors
      }
    }

    // Better SQL parsing - handle DELIMITER properly
    // Split by DELIMITER sections
    const sections = proceduresSQL.split(/DELIMITER/i);
    
    let successCount = 0;
    let failCount = 0;
    let procedures = [];

    // Parse procedures from the SQL
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      
      // Skip empty sections or comment-only sections
      if (!section || section.startsWith('--')) continue;
      
      // Check if this is a procedure definition section (contains $$)
      if (section.includes('$$')) {
        // Extract the procedure definition between CREATE PROCEDURE and END$$
        const match = section.match(/(CREATE\s+PROCEDURE[\s\S]*?END)\s*\$\$/i);
        if (match) {
          // Replace $$ with ; for standard SQL
          const procSQL = match[1].trim() + ';';
          procedures.push(procSQL);
        }
      }
    }

    console.log(`   Found ${procedures.length} procedures to create`);

    // Execute each procedure
    for (const procSQL of procedures) {
      try {
        // Extract procedure name for logging
        const procNameMatch = procSQL.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
        const procName = procNameMatch ? procNameMatch[1] : 'Unknown';
        
        await connection.query(procSQL);
        console.log(`   ✅ Created: ${procName}`);
        successCount++;
      } catch (err) {
        const procNameMatch = procSQL.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
        const procName = procNameMatch ? procNameMatch[1] : 'Unknown';
        console.error(`   ❌ Failed: ${procName}`);
        console.error(`      Error: ${err.message.substring(0, 150)}`);
        failCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully created: ${successCount} procedures`);
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount} procedures`);
    }

    // 4. Verify main procedure
    console.log('\n🔍 Step 4: Verifying PopulateAllCQIIndicators...');
    const [procedures] = await connection.query(
      `SHOW PROCEDURE STATUS WHERE Db = ? AND Name = 'PopulateAllCQIIndicators'`,
      [dbConfig.database]
    );

    if (procedures.length > 0) {
      console.log('✅ PopulateAllCQIIndicators exists and is ready to use!');
      console.log(`   Created: ${procedures[0].Created}`);
      console.log(`   Modified: ${procedures[0].Modified}`);
    } else {
      console.log('❌ PopulateAllCQIIndicators was not created successfully');
      console.log('   Please check the SQL file for syntax errors');
    }

    console.log('\n✨ Setup complete!');
    console.log('\n📝 Test the procedure with:');
    console.log('   CALL PopulateAllCQIIndicators(\'2025-01-01\', \'2025-12-31\', NULL, 4, 3, 1, 2);');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the setup
console.log('════════════════════════════════════════════════════════');
console.log('   CQI Indicators Stored Procedures Setup');
console.log('════════════════════════════════════════════════════════\n');

setupCQIProcedures()
  .then(() => {
    console.log('\n✅ All done! You can now use the CQI Dashboard.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

