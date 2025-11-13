// Check if there's patient data in the database
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log('🗄️  CHECKING DATABASE FOR PATIENT DATA');
console.log('=' .repeat(50));

// Load database configuration
let dbConfig;
try {
  // Try to load from environment or config
  if (fs.existsSync(path.join(__dirname, 'backend', '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
  }
  
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'artweb',
    port: process.env.DB_PORT || 3306
  };
  
  console.log('📋 Database Configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
} catch (error) {
  console.log('❌ Error loading database config:', error.message);
  console.log('💡 Make sure .env file exists in backend folder');
  process.exit(1);
}

// Check database connection and data
const checkDatabaseData = async () => {
  let connection;
  
  try {
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');
    
    // Check if main tables exist
    console.log('\n📋 Checking main tables...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('tblaimain', 'tblcimain', 'tblavmain', 'tblcvmain')
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log(`✅ Found ${tables.length} main tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    if (tables.length === 0) {
      console.log('❌ No main tables found!');
      console.log('💡 You need to run database setup first');
      return;
    }
    
    // Check for data in each table
    console.log('\n📊 Checking data in tables...');
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
        const rowCount = count[0].count;
        
        if (rowCount > 0) {
          console.log(`✅ ${table.TABLE_NAME}: ${rowCount} records`);
        } else {
          console.log(`❌ ${table.TABLE_NAME}: 0 records (empty)`);
        }
      } catch (error) {
        console.log(`❌ ${table.TABLE_NAME}: Error checking data (${error.message})`);
      }
    }
    
    // Check for sites
    console.log('\n🏥 Checking sites...');
    try {
      const [sites] = await connection.execute(`
        SELECT COUNT(*) as count FROM tblsites
      `);
      const siteCount = sites[0].count;
      
      if (siteCount > 0) {
        console.log(`✅ Found ${siteCount} sites`);
        
        // Get site details
        const [siteDetails] = await connection.execute(`
          SELECT SiteCode, SiteName FROM tblsites LIMIT 5
        `);
        
        console.log('   Sample sites:');
        siteDetails.forEach(site => {
          console.log(`   - ${site.SiteCode}: ${site.SiteName}`);
        });
      } else {
        console.log('❌ No sites found in database');
      }
    } catch (error) {
      console.log('❌ Error checking sites:', error.message);
    }
    
    // Check for patient status data
    console.log('\n📋 Checking patient status tables...');
    const statusTables = ['tblavpatientstatus', 'tblcvpatientstatus'];
    
    for (const table of statusTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = count[0].count;
        
        if (rowCount > 0) {
          console.log(`✅ ${table}: ${rowCount} records`);
        } else {
          console.log(`❌ ${table}: 0 records (empty)`);
        }
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error (${error.message})`);
      }
    }
    
    // Check for ART data
    console.log('\n💊 Checking ART-related data...');
    try {
      const [artAdults] = await connection.execute(`
        SELECT COUNT(*) as count FROM tblaimain WHERE ARTStartDate IS NOT NULL
      `);
      
      const [artChildren] = await connection.execute(`
        SELECT COUNT(*) as count FROM tblcimain WHERE ARTStartDate IS NOT NULL
      `);
      
      const adultART = artAdults[0].count;
      const childART = artChildren[0].count;
      
      if (adultART > 0 || childART > 0) {
        console.log(`✅ Found ART patients:`);
        console.log(`   - Adults: ${adultART}`);
        console.log(`   - Children: ${childART}`);
        console.log(`   - Total: ${adultART + childART}`);
      } else {
        console.log('❌ No ART patients found');
      }
    } catch (error) {
      console.log('❌ Error checking ART data:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if MySQL server is running');
    console.log('   2. Verify database credentials in .env file');
    console.log('   3. Make sure database exists');
    console.log('   4. Check network connectivity');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
};

// Run the check
checkDatabaseData().catch(console.error);



