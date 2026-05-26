#!/usr/bin/env node
/**
 * Create analytics_indicators (and optional indicator_status) in preart_sites_registry.
 * Usage: node scripts/setup-local-analytics.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const REGISTRY_DB = process.env.DB_NAME || 'preart_sites_registry';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS n FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [REGISTRY_DB, tableName]
  );
  return rows[0].n > 0;
}

async function setup() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL at ${dbConfig.host}:${dbConfig.port}`);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${REGISTRY_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${REGISTRY_DB}\``);

    const analyticsSql = fs.readFileSync(
      path.join(__dirname, '../migrations/001_create_analytics_indicators.sql'),
      'utf8'
    );
    // Run only CREATE TABLE (skip sample INSERTs for clean local)
    const createOnly = analyticsSql.split('-- Insert sample data')[0];
    await connection.query(createOnly);
    console.log('✅ Table ready: analytics_indicators');

    const indicatorStatusPath = path.join(
      __dirname,
      '../src/migrations/002_create_indicator_status.sql'
    );
    if (fs.existsSync(indicatorStatusPath) && !(await tableExists(connection, 'indicator_status'))) {
      const statusSql = fs.readFileSync(indicatorStatusPath, 'utf8');
      await connection.query(statusSql);
      console.log('✅ Table ready: indicator_status');
    } else if (await tableExists(connection, 'indicator_status')) {
      console.log('ℹ️  indicator_status already exists');
    }

    const [count] = await connection.query(
      'SELECT COUNT(*) AS n FROM analytics_indicators'
    );
    console.log(`\n📊 analytics_indicators rows: ${count[0].n}`);
    console.log('\n🎉 Analytics tables ready. Re-run yearly analytics from Admin.');
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
