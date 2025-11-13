// Check if site 1705 database exists
require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 CHECKING SITE 1705 DATABASE');
console.log('=' .repeat(40));

async function checkSite1705() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to MySQL');
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES LIKE "preart_site_1705"');
    
    if (databases.length > 0) {
      console.log('✅ Database preart_site_1705 EXISTS');
      
      // Check if it has tables
      await connection.execute('USE preart_site_1705');
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📊 Found ${tables.length} tables in database`);
      
      if (tables.length > 0) {
        console.log('✅ Database has tables - site is ready');
      } else {
        console.log('❌ Database exists but has no tables');
      }
      
    } else {
      console.log('❌ Database preart_site_1705 DOES NOT EXIST');
      console.log('💡 You need to create the database for site 1705');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSite1705();
