#!/usr/bin/env node
/**
 * Create preart_sites_registry on local MySQL with sites + tbluser tables.
 * Usage: node scripts/setup-local-registry.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const REGISTRY_DB = process.env.DB_NAME || 'preart_sites_registry';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function setup() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL at ${dbConfig.host}:${dbConfig.port}`);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${REGISTRY_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database ready: ${REGISTRY_DB}`);

    await connection.query(`USE \`${REGISTRY_DB}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id INT NOT NULL AUTO_INCREMENT,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(100) DEFAULT NULL,
        display_name VARCHAR(100) DEFAULT NULL,
        search_terms TEXT DEFAULT NULL,
        file_name VARCHAR(255) DEFAULT NULL,
        province VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        database_name VARCHAR(50) NOT NULL,
        status TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY code_unique (code),
        UNIQUE KEY database_name_unique (database_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table ready: sites');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tbluser (
        Uid INT NOT NULL AUTO_INCREMENT,
        User VARCHAR(40) NOT NULL,
        Pass VARCHAR(255) NOT NULL,
        Fullname VARCHAR(40) NOT NULL,
        Status INT NOT NULL DEFAULT 1,
        Role ENUM(
          'super_admin','admin','doctor','nurse',
          'data_entry','viewer','site_manager','data_manager'
        ) NOT NULL DEFAULT 'viewer',
        AssignedSites JSON DEFAULT NULL,
        lastLogin DATETIME DEFAULT NULL,
        lastActivity DATETIME DEFAULT NULL,
        loginCount INT NOT NULL DEFAULT 0,
        lastIP VARCHAR(45) DEFAULT NULL,
        userAgent TEXT DEFAULT NULL,
        PRIMARY KEY (Uid),
        UNIQUE KEY user_unique (User)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table ready: tbluser');

    const demoDb = 'preart_local';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${demoDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    const [existingSites] = await connection.query('SELECT COUNT(*) AS n FROM sites');
    if (existingSites[0].n === 0) {
      await connection.query(
        `INSERT INTO sites (code, name, short_name, display_name, search_terms, province, type, database_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          'LOCAL',
          'Local Development Site',
          'Local Dev',
          'Local Dev',
          'local,dev,development',
          'Local',
          'DEV',
          demoDb,
        ]
      );
      console.log(`✅ Sample site registered: LOCAL → ${demoDb}`);
    } else {
      console.log(`ℹ️  sites already has ${existingSites[0].n} row(s); skipped sample insert`);
    }

    const [existingUsers] = await connection.query('SELECT COUNT(*) AS n FROM tbluser');
    if (existingUsers[0].n === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await connection.query(
        `INSERT INTO tbluser (User, Pass, Fullname, Status, Role, AssignedSites)
         VALUES (?, ?, ?, 1, 'super_admin', NULL)`,
        ['admin', hash, 'System Administrator']
      );
      console.log('✅ Default user: admin / admin123 (change after first login)');
    } else {
      console.log(`ℹ️  tbluser already has ${existingUsers[0].n} user(s); skipped admin insert`);
    }

    const [sites] = await connection.query(
      'SELECT code, display_name, database_name, status FROM sites ORDER BY code'
    );
    const [users] = await connection.query(
      'SELECT Uid, User, Fullname, Role, Status FROM tbluser ORDER BY Uid'
    );

    console.log('\n📋 Sites:');
    console.table(sites);
    console.log('\n👤 Users:');
    console.table(users);
    console.log('\n🎉 Local registry setup complete.');
    console.log('   Restart the backend, then log in with admin / admin123');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  setup();
}

module.exports = { setup };
