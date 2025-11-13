const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

/**
 * Run migration to create indicator_status table
 * This script creates the table and populates it with all mortality retention indicators
 */
async function runMigration() {
  try {
    console.log('🔄 Running indicator status migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../src/migrations/002_create_indicator_status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Step 1: Create table
    console.log('📋 Step 1: Creating indicator_status table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`indicator_status\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`indicator_id\` VARCHAR(100) NOT NULL UNIQUE,
        \`indicator_name\` VARCHAR(255) NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
        \`description\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_indicator_id\` (\`indicator_id\`),
        INDEX \`idx_is_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
      await sequelize.query(createTableSQL, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Table created successfully');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('⚠️  Table already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    // Step 2: Execute the INSERT statement from migration SQL file
    console.log('📋 Step 2: Inserting/updating indicators from migration file...');
    
    // Extract the INSERT statement (it starts after the CREATE TABLE statement)
    // Find the line that starts with INSERT INTO and get everything until the semicolon
    const lines = migrationSQL.split('\n');
    let insertStartIndex = -1;
    let insertEndIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('INSERT INTO')) {
        insertStartIndex = i;
      }
      if (insertStartIndex >= 0 && lines[i].trim().endsWith(';')) {
        insertEndIndex = i + 1;
        break;
      }
    }
    
    if (insertStartIndex === -1) {
      throw new Error('Could not find INSERT statement in migration file');
    }
    
    let insertSQL = lines.slice(insertStartIndex, insertEndIndex).join('\n');
    // Ensure it ends with semicolon
    if (!insertSQL.trim().endsWith(';')) {
      insertSQL += ';';
    }
    
    try {
      // Execute the INSERT statement
      await sequelize.query(insertSQL, { type: sequelize.QueryTypes.RAW });
      console.log('✅ Indicators inserted/updated successfully');
    } catch (error) {
      console.error('❌ Error executing migration SQL:', error.message);
      throw error;
    }
    
    console.log('✅ Migration SQL executed successfully!');
    
    // Wait a bit for database to catch up
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify table exists and show count
    try {
      const [results] = await sequelize.query(
        'SELECT COUNT(*) as count FROM indicator_status',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log(`✅ Indicator status table contains ${results.count} indicators`);
      
      // Show active/inactive counts
      const [activeCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM indicator_status WHERE is_active = 1',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const [inactiveCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM indicator_status WHERE is_active = 0',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log(`📊 Active indicators: ${activeCount.count}`);
      console.log(`📊 Inactive indicators: ${inactiveCount.count}`);
      
      // Show MMD indicators
      const [mmdIndicators] = await sequelize.query(
        "SELECT indicator_id, indicator_name, is_active FROM indicator_status WHERE indicator_id LIKE '9%' ORDER BY indicator_id",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (mmdIndicators && mmdIndicators.length > 0) {
        console.log('\n📋 MMD Indicators:');
        mmdIndicators.forEach(ind => {
          console.log(`   - ${ind.indicator_id}: ${ind.indicator_name} (${ind.is_active ? 'Active' : 'Inactive'})`);
        });
      }
    } catch (verifyError) {
      console.error('⚠️  Could not verify table:', verifyError.message);
      console.log('⚠️  Please check the table manually');
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
