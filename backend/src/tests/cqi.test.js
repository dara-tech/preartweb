const request = require('supertest');
const { sequelize } = require('../config/database');
const cqiIndicatorService = require('../services/cqiIndicatorService');
const cqiValidationService = require('../services/cqiValidationService');
const cqiSchedulerService = require('../services/cqiSchedulerService');

// Mock authentication middleware for testing
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireRole: (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
  }
}));

describe('CQI System Tests', () => {
  let app;
  
  beforeAll(async () => {
    // Import app after mocking auth
    app = require('../server');
    
    // Wait for database connection
    await sequelize.authenticate();
    
    // Create test tables if they don't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS cqi_indicator (
        id INT AUTO_INCREMENT PRIMARY KEY,
        indicator_code VARCHAR(10) NOT NULL,
        indicator_name VARCHAR(255) NOT NULL,
        indicator_type ENUM('summary', 'detail') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        site_id VARCHAR(20) NULL,
        numerator INT UNSIGNED DEFAULT 0,
        denominator INT UNSIGNED DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        male_0_14 INT UNSIGNED DEFAULT 0,
        female_0_14 INT UNSIGNED DEFAULT 0,
        male_over_14 INT UNSIGNED DEFAULT 0,
        female_over_14 INT UNSIGNED DEFAULT 0,
        male_0_14_total INT UNSIGNED DEFAULT 0,
        female_0_14_total INT UNSIGNED DEFAULT 0,
        male_over_14_total INT UNSIGNED DEFAULT 0,
        female_over_14_total INT UNSIGNED DEFAULT 0,
        children_total INT UNSIGNED DEFAULT 0,
        adults_total INT UNSIGNED DEFAULT 0,
        clinic_id VARCHAR(20) NULL,
        art_number VARCHAR(50) NULL,
        patient_sex CHAR(1) NULL,
        patient_sex_display VARCHAR(10) NULL,
        patient_type VARCHAR(50) NULL,
        patient_age INT NULL,
        date_first_visit DATE NULL,
        event_date DATE NULL,
        event_value VARCHAR(255) NULL,
        secondary_date DATE NULL,
        secondary_value VARCHAR(255) NULL,
        indicator_specific_data JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_indicator_period (indicator_code, start_date, end_date),
        INDEX idx_indicator_type (indicator_type),
        INDEX idx_site_id (site_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  });

  afterAll(async () => {
    // Clean up test data
    await sequelize.query('DELETE FROM cqi_indicator WHERE indicator_code LIKE "TEST_%"');
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await sequelize.query('DELETE FROM cqi_indicator WHERE indicator_code LIKE "TEST_%"');
  });

  describe('CQI Indicator Service', () => {
    test('should get available indicators', async () => {
      const indicators = await cqiIndicatorService.getAvailableIndicators();
      
      expect(Array.isArray(indicators)).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
      expect(indicators[0]).toHaveProperty('code');
      expect(indicators[0]).toHaveProperty('name');
      expect(indicators[0]).toHaveProperty('category');
    });

    test('should handle empty summary data gracefully', async () => {
      const result = await cqiIndicatorService.getAllIndicatorsSummary({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should validate input parameters', async () => {
      await expect(
        cqiIndicatorService.getIndicatorSummary({
          indicatorCode: '',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          siteId: null
        })
      ).rejects.toThrow();
    });
  });

  describe('CQI Validation Service', () => {
    beforeEach(async () => {
      // Insert test data with known issues
      await sequelize.query(`
        INSERT INTO cqi_indicator (
          indicator_code, indicator_name, indicator_type, start_date, end_date,
          numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14
        ) VALUES 
        ('TEST_1', 'Test Indicator 1', 'summary', '2024-01-01', '2024-01-31', 50, 100, 50.00, 10, 15, 15, 10),
        ('TEST_2', 'Test Indicator 2', 'summary', '2024-01-01', '2024-01-31', 30, 100, 35.00, 5, 10, 10, 5)
      `);
    });

    test('should run all validation checks', async () => {
      const result = await cqiValidationService.runAllValidations({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });

      expect(result).toHaveProperty('overall_status');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('validation_results');
      expect(result.summary).toHaveProperty('total_rules');
      expect(result.summary).toHaveProperty('total_issues');
    });

    test('should detect percentage calculation errors', async () => {
      // Insert data with incorrect percentage
      await sequelize.query(`
        INSERT INTO cqi_indicator (
          indicator_code, indicator_name, indicator_type, start_date, end_date,
          numerator, denominator, percentage
        ) VALUES ('TEST_ERROR', 'Test Error', 'summary', '2024-01-01', '2024-01-31', 25, 100, 30.00)
      `);

      const result = await cqiValidationService.runValidationRule('percentage_calculation_accuracy', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });

      expect(result.status).toBe('FAIL');
      expect(result.count).toBeGreaterThan(0);
    });

    test('should calculate data quality score', async () => {
      const result = await cqiValidationService.getDataQualityScore({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('grade');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('recommendations');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should auto-fix percentage calculation errors', async () => {
      // Insert data with incorrect percentage
      await sequelize.query(`
        INSERT INTO cqi_indicator (
          indicator_code, indicator_name, indicator_type, start_date, end_date,
          numerator, denominator, percentage
        ) VALUES ('TEST_FIX', 'Test Fix', 'summary', '2024-01-01', '2024-01-31', 25, 100, 30.00)
      `);

      const result = await cqiValidationService.autoFixIssues({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null,
        ruleIds: ['percentage_calculation_accuracy']
      });

      expect(result.total_fixed).toBeGreaterThan(0);
      
      // Verify the fix
      const [fixed] = await sequelize.query(`
        SELECT percentage FROM cqi_indicator 
        WHERE indicator_code = 'TEST_FIX' AND indicator_type = 'summary'
      `);
      
      expect(fixed[0].percentage).toBe(25.00);
    });
  });

  describe('CQI API Endpoints', () => {
    beforeEach(async () => {
      // Insert test data
      await sequelize.query(`
        INSERT INTO cqi_indicator (
          indicator_code, indicator_name, indicator_type, start_date, end_date,
          numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14,
          children_total, adults_total
        ) VALUES 
        ('TEST_API', 'Test API Indicator', 'summary', '2024-01-01', '2024-01-31', 75, 100, 75.00, 20, 25, 15, 15, 45, 30)
      `);
    });

    test('GET /apiv1/cqi-indicators/summary should return summary data', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/summary')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    test('GET /apiv1/cqi-indicators/:indicatorCode/summary should return specific indicator', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/TEST_API/summary')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('indicator_code', 'TEST_API');
      expect(response.body.data).toHaveProperty('percentage', 75.00);
    });

    test('GET /apiv1/cqi-indicators/:indicatorCode/demographics should return demographics', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/TEST_API/demographics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('demographics');
      expect(response.body.data.demographics).toHaveProperty('children');
      expect(response.body.data.demographics).toHaveProperty('adults');
    });

    test('GET /apiv1/cqi-indicators/validation/summary should return validation summary', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/validation/summary')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overall_status');
      expect(response.body.data).toHaveProperty('quality_score');
      expect(response.body.data).toHaveProperty('summary');
    });

    test('GET /apiv1/cqi-indicators/health should return health status', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.data).toHaveProperty('database_connection');
      expect(response.body.data).toHaveProperty('cqi_table_exists');
    });

    test('should handle invalid date parameters', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/summary')
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should handle missing required parameters', async () => {
      const response = await request(app)
        .get('/apiv1/cqi-indicators/summary')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('CQI Scheduler Service', () => {
    test('should calculate date ranges correctly', () => {
      const scheduler = cqiSchedulerService;
      
      // Test current quarter calculation
      const quarterRange = scheduler.calculateDateRange('current_quarter');
      expect(quarterRange).toHaveProperty('startDate');
      expect(quarterRange).toHaveProperty('endDate');
      expect(new Date(quarterRange.startDate)).toBeLessThan(new Date(quarterRange.endDate));
      
      // Test current month calculation
      const monthRange = scheduler.calculateDateRange('current_month');
      expect(monthRange).toHaveProperty('startDate');
      expect(monthRange).toHaveProperty('endDate');
      expect(new Date(monthRange.startDate)).toBeLessThan(new Date(monthRange.endDate));
    });

    test('should handle job status retrieval', async () => {
      const status = await cqiSchedulerService.getJobStatus();
      expect(Array.isArray(status)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete CQI workflow', async () => {
      // 1. Insert test data
      await sequelize.query(`
        INSERT INTO cqi_indicator (
          indicator_code, indicator_name, indicator_type, start_date, end_date,
          numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14,
          children_total, adults_total
        ) VALUES 
        ('TEST_WORKFLOW', 'Test Workflow', 'summary', '2024-01-01', '2024-01-31', 80, 100, 80.00, 20, 30, 15, 15, 50, 30)
      `);

      // 2. Get summary data
      const summary = await cqiIndicatorService.getAllIndicatorsSummary({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });
      
      expect(summary.length).toBeGreaterThan(0);
      
      // 3. Run validation
      const validation = await cqiValidationService.runAllValidations({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });
      
      expect(validation).toHaveProperty('overall_status');
      
      // 4. Get quality score
      const qualityScore = await cqiValidationService.getDataQualityScore({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });
      
      expect(qualityScore.score).toBeGreaterThanOrEqual(0);
      expect(qualityScore.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalQuery = sequelize.query;
      sequelize.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        cqiIndicatorService.getAllIndicatorsSummary({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          siteId: null
        })
      ).rejects.toThrow('Failed to get indicators summary');

      // Restore original method
      sequelize.query = originalQuery;
    });

    test('should handle invalid indicator codes', async () => {
      const result = await cqiIndicatorService.getIndicatorSummary({
        indicatorCode: 'INVALID_CODE',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        siteId: null
      });

      expect(result).toBeNull();
    });
  });
});

// Performance Tests
describe('CQI Performance Tests', () => {
  test('should handle large datasets efficiently', async () => {
    // Insert a larger dataset for performance testing
    const insertPromises = [];
    for (let i = 0; i < 100; i++) {
      insertPromises.push(
        sequelize.query(`
          INSERT INTO cqi_indicator (
            indicator_code, indicator_name, indicator_type, start_date, end_date,
            numerator, denominator, percentage
          ) VALUES ('TEST_PERF_${i}', 'Test Performance ${i}', 'summary', '2024-01-01', '2024-01-31', ${i}, 100, ${i}.00)
        `)
      );
    }
    
    await Promise.all(insertPromises);

    const startTime = Date.now();
    
    const result = await cqiIndicatorService.getAllIndicatorsSummary({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      siteId: null
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    expect(result.length).toBeGreaterThanOrEqual(100);
    expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    
    // Clean up performance test data
    await sequelize.query('DELETE FROM cqi_indicator WHERE indicator_code LIKE "TEST_PERF_%"');
  });
});

module.exports = {
  // Export test utilities for other test files
  setupTestData: async () => {
    await sequelize.query(`
      INSERT INTO cqi_indicator (
        indicator_code, indicator_name, indicator_type, start_date, end_date,
        numerator, denominator, percentage, male_0_14, female_0_14, male_over_14, female_over_14,
        children_total, adults_total
      ) VALUES 
      ('TEST_UTIL', 'Test Utility', 'summary', '2024-01-01', '2024-01-31', 60, 100, 60.00, 15, 20, 12, 13, 35, 25)
    `);
  },
  
  cleanupTestData: async () => {
    await sequelize.query('DELETE FROM cqi_indicator WHERE indicator_code LIKE "TEST_%"');
  }
};
