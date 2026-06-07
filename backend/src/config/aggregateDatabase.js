const { Sequelize } = require('sequelize');
require('dotenv').config();

let aggregateSequelize = null;

function getAggregateSequelize() {
  if (aggregateSequelize) return aggregateSequelize;

  const dbName = process.env.AGGREGATE_DB_NAME || 'preart_sites_registry';
  const dbUser = process.env.AGGREGATE_DB_USER || 'root';
  const dbPass = process.env.AGGREGATE_DB_PASSWORD || '';
  const dbHost = process.env.AGGREGATE_DB_HOST || 'localhost';
  const dbPort = Number(process.env.AGGREGATE_DB_PORT || 3306);

  console.log(`[Database] Initializing aggregate connection to ${dbName} on ${dbHost}:${dbPort}`);

  aggregateSequelize = new Sequelize(
    dbName,
    dbUser,
    dbPass,
    {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: Number(process.env.DB_POOL_MAX || 5),
        min: 0,
        idle: 10000,
        acquire: 30000
      },
      dialectOptions: {
        connectTimeout: 15000,
        multipleStatements: true
      }
    }
  );

  return aggregateSequelize;
}

module.exports = { getAggregateSequelize };
