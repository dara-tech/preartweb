// Check if site 1705 has the required tables
require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 CHECKING TABLES IN SITE 1705');
console.log('=' .repeat(40));

async function checkTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: 'preart_site_1705'
    });
    
    console.log('✅ Connected to preart_site_1705');
    
    // Check required tables
    const requiredTables = [
      'tblaimain', 'tblcimain', 
      'tblavmain', 'tblcvmain',
      'tblaart', 'tblcart',
      'tblavpatientstatus', 'tblcvpatientstatus'
    ];
    
    console.log('\n📋 Checking required tables...');
    
    for (const table of requiredTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = rows[0].count;
        
        if (count > 0) {
          console.log(`✅ ${table}: ${count} records`);
        } else {
          console.log(`⚠️  ${table}: 0 records (empty)`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();



