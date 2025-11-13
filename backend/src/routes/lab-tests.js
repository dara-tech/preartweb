const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// External lab API configuration
const LAB_API_CONFIG = {
  baseUrl: 'http://36.37.175.123:9091',
  username: 'mpi.sys',
  password: 'fT.!ga~Ndc8z@EM>7X4B2=F9?'
};

// Helper function to make authenticated requests to external lab API
const makeLabApiRequest = async (endpoint, params = {}) => {
  try {
    const url = `${LAB_API_CONFIG.baseUrl}${endpoint}`;
    
    const response = await axios.get(url, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'username': LAB_API_CONFIG.username,
        'password': LAB_API_CONFIG.password
      },
      timeout: 30000 // 30 second timeout
    });

    return response.data;
  } catch (error) {
    console.error('Lab API request failed:', error.message);
    
    if (error.response) {
      // Server responded with error status
      throw new Error(`Lab API Error: ${error.response.status} - ${error.response.data || error.message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Lab API Error: No response from server');
    } else {
      // Something else happened
      throw new Error(`Lab API Error: ${error.message}`);
    }
  }
};

// Get lab test results
router.post('/results', [
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  body('type').notEmpty().withMessage('Test type is required'),
  body('siteCode').notEmpty().withMessage('Site code is required')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { startDate, endDate, type, siteCode } = req.body;
    
    // Set default dates if not provided (last 30 days)
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Format dates for the external API (YYYYMMDDHHMMSS format)
    const formatDateForLabApi = (date) => {
      return new Date(date).toISOString().replace(/[-:T]/g, '').split('.')[0];
    };

    const start = formatDateForLabApi(defaultStartDate);
    const end = formatDateForLabApi(defaultEndDate);

    console.log(`Fetching lab test results: ${type} for site ${siteCode} from ${start} to ${end}`);

    // Make request to external lab API
    const labResults = await makeLabApiRequest('/test_result', {
      start,
      end,
      type: type, // Use the passed type parameter
      site_code: siteCode
    });

    // Check if the response is an error message
    if (typeof labResults === 'string' && labResults.includes('Incorrect username or password')) {
      return res.status(401).json({
        success: false,
        error: 'External Lab API Authentication Failed',
        message: 'Invalid credentials for external lab system',
        data: [],
        meta: {
          startDate,
          endDate,
          type,
          siteCode,
          fetchedAt: new Date().toISOString()
        }
      });
    }

    // Ensure we return an array for test results
    const resultsArray = Array.isArray(labResults) ? labResults : [];

    res.json({
      success: true,
      data: resultsArray,
      meta: {
        startDate,
        endDate,
        type,
        siteCode,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Lab test results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab test results',
      message: error.message
    });
  }
});

// Get available test types
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const testTypes = [
      { value: 'hiv', label: 'HIV Viral Load', description: 'HIV viral load test results (HIV RNA levels)' },
      { value: 'cd4', label: 'CD4 Count', description: 'CD4 cell count test results' },
      { value: 'viral_load', label: 'Viral Load', description: 'HIV viral load test results (HIV RNA levels)' },
      { value: 'hepatitis', label: 'Hepatitis Test', description: 'Hepatitis test results' },
      { value: 'syphilis', label: 'Syphilis Test', description: 'Syphilis test results' },
      { value: 'tb', label: 'TB Test', description: 'Tuberculosis test results' }
    ];

    res.json({
      success: true,
      data: testTypes
    });
  } catch (error) {
    console.error('Test types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test types',
      message: error.message
    });
  }
});

// Get lab test statistics
router.post('/stats', [
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  body('siteCode').notEmpty().withMessage('Site code is required')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { startDate, endDate, siteCode } = req.body;
    
    // Set default dates if not provided (last 30 days)
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get stats for different test types
    const testTypes = ['hiv', 'cd4', 'viral_load', 'hepatitis', 'syphilis', 'tb'];
    const stats = {};

    for (const type of testTypes) {
      try {
        const formatDateForLabApi = (date) => {
          return new Date(date).toISOString().replace(/[-:T]/g, '').split('.')[0];
        };

      const start = formatDateForLabApi(defaultStartDate);
      const end = formatDateForLabApi(defaultEndDate);

        const results = await makeLabApiRequest('/test_result', {
          start,
          end,
          type,
          site_code: siteCode
        });

        // Check if the response is an error message
        if (typeof results === 'string' && results.includes('Incorrect username or password')) {
          stats[type] = {
            count: 0,
            error: 'Authentication failed',
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Count results (assuming results is an array or has a count property)
          const count = Array.isArray(results) ? results.length : (results.count || 0);
          
          stats[type] = {
            count,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn(`Failed to get stats for ${type}:`, error.message);
        stats[type] = {
          count: 0,
          error: error.message,
          lastUpdated: new Date().toISOString()
        };
      }
    }

    res.json({
      success: true,
      data: {
        siteCode,
        period: { startDate, endDate },
        statistics: stats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Lab test stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab test statistics',
      message: error.message
    });
  }
});

// Test connection to external lab API
router.get('/test-connection', authenticateToken, async (req, res) => {
  try {
    // Test with a simple request
    const testResults = await makeLabApiRequest('/test_result', {
      start: '20250101000000',
      end: '20250101235959',
      type: 'hiv',
      site_code: '2101'
    });

    // Check if the response indicates authentication failure
    if (typeof testResults === 'string' && testResults.includes('Incorrect username or password')) {
      return res.status(401).json({
        success: false,
        error: 'Lab API Authentication Failed',
        message: 'Invalid credentials for external lab system',
        data: {
          connected: false,
          testedAt: new Date().toISOString(),
          error: testResults
        }
      });
    }

    res.json({
      success: true,
      message: 'Lab API connection successful',
      data: {
        connected: true,
        testedAt: new Date().toISOString(),
        response: testResults
      }
    });

  } catch (error) {
    console.error('Lab API connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Lab API connection failed',
      message: error.message,
      data: {
        connected: false,
        testedAt: new Date().toISOString()
      }
    });
  }
});

module.exports = router;
