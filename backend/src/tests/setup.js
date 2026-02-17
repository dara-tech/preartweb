// Jest setup file for CQI tests
const { sequelize } = require('../config/database');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Increase timeout for database operations
  jest.setTimeout(30000);
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Test database connection established');
  } catch (error) {
    console.error('❌ Unable to connect to test database:', error);
    throw error;
  }
});

// Global test cleanup
afterAll(async () => {
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database connection:', error);
  }
});

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test utilities
global.testUtils = {
  // Helper to create test dates
  createTestDate: (daysFromNow = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  },
  
  // Helper to create test indicator data
  createTestIndicator: (overrides = {}) => ({
    indicator_code: 'TEST_DEFAULT',
    indicator_name: 'Test Default Indicator',
    indicator_type: 'summary',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    numerator: 50,
    denominator: 100,
    percentage: 50.00,
    male_0_14: 10,
    female_0_14: 15,
    male_over_14: 15,
    female_over_14: 10,
    children_total: 25,
    adults_total: 25,
    ...overrides
  }),
  
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
