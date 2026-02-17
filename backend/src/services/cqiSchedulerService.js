const cron = require('node-cron');
const { sequelize } = require('../config/database');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { QueryTypes } = require('sequelize');
const cqiIndicatorService = require('./cqiIndicatorService');
const cqiValidationService = require('./cqiValidationService');

class CQISchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
    this.defaultSchedules = {
      daily_update: '0 2 * * *',        // 2 AM daily
      weekly_validation: '0 3 * * 0',   // 3 AM every Sunday
      monthly_cleanup: '0 4 1 * *',     // 4 AM on 1st of every month
      quarterly_report: '0 5 1 */3 *'   // 5 AM on 1st of every quarter
    };
  }

  /**
   * Initialize the scheduler service
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[CQI Scheduler] Already initialized');
      return;
    }

    try {
      console.log('[CQI Scheduler] Initializing scheduler service...');
      
      // Load job configurations from database
      await this.loadJobConfigurations();
      
      // Start default jobs
      await this.startDefaultJobs();
      
      this.isInitialized = true;
      console.log('[CQI Scheduler] Scheduler service initialized successfully');
    } catch (error) {
      console.error('[CQI Scheduler] Failed to initialize scheduler service:', error);
      throw error;
    }
  }

  /**
   * Load job configurations from database
   */
  async loadJobConfigurations() {
    try {
      // Check if scheduler config table exists
      const tableExists = await this.checkSchedulerTableExists();
      
      if (!tableExists) {
        console.log('[CQI Scheduler] Creating scheduler configuration table...');
        await this.createSchedulerTable();
      }

      // Load existing configurations
      const configs = await sequelize.query(`
        SELECT * FROM cqi_scheduler_config WHERE is_active = 1
      `, { type: QueryTypes.SELECT });

      console.log(`[CQI Scheduler] Loaded ${configs.length} job configurations`);
      return configs;
    } catch (error) {
      console.error('[CQI Scheduler] Error loading job configurations:', error);
      return [];
    }
  }

  /**
   * Check if scheduler table exists
   */
  async checkSchedulerTableExists() {
    try {
      const result = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
          AND table_name = 'cqi_scheduler_config'
      `, { type: QueryTypes.SELECT });

      return result[0].count > 0;
    } catch (error) {
      console.error('[CQI Scheduler] Error checking scheduler table:', error);
      return false;
    }
  }

  /**
   * Create scheduler configuration table
   */
  async createSchedulerTable() {
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS cqi_scheduler_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          job_name VARCHAR(100) NOT NULL UNIQUE,
          job_type ENUM('data_update', 'validation', 'cleanup', 'report') NOT NULL,
          cron_expression VARCHAR(50) NOT NULL,
          description TEXT,
          site_id VARCHAR(20) NULL,
          parameters JSON NULL,
          is_active TINYINT(1) DEFAULT 1,
          last_run TIMESTAMP NULL,
          last_status ENUM('success', 'error', 'running') NULL,
          last_error TEXT NULL,
          run_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_job_type (job_type),
          INDEX idx_is_active (is_active),
          INDEX idx_last_run (last_run)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `, { type: QueryTypes.RAW });

      // Insert default job configurations
      await this.insertDefaultJobConfigurations();
      
      console.log('[CQI Scheduler] Scheduler configuration table created successfully');
    } catch (error) {
      console.error('[CQI Scheduler] Error creating scheduler table:', error);
      throw error;
    }
  }

  /**
   * Insert default job configurations
   */
  async insertDefaultJobConfigurations() {
    const defaultJobs = [
      {
        job_name: 'daily_cqi_update',
        job_type: 'data_update',
        cron_expression: this.defaultSchedules.daily_update,
        description: 'Daily update of CQI indicators for current quarter',
        parameters: JSON.stringify({
          period_type: 'current_quarter',
          auto_fix: true
        })
      },
      {
        job_name: 'weekly_validation',
        job_type: 'validation',
        cron_expression: this.defaultSchedules.weekly_validation,
        description: 'Weekly validation of CQI data quality',
        parameters: JSON.stringify({
          period_type: 'current_quarter',
          auto_fix: true,
          send_report: true
        })
      },
      {
        job_name: 'monthly_cleanup',
        job_type: 'cleanup',
        cron_expression: this.defaultSchedules.monthly_cleanup,
        description: 'Monthly cleanup of old CQI data and logs',
        parameters: JSON.stringify({
          retain_months: 24,
          cleanup_logs: true
        })
      },
      {
        job_name: 'quarterly_report',
        job_type: 'report',
        cron_expression: this.defaultSchedules.quarterly_report,
        description: 'Quarterly CQI performance report generation',
        parameters: JSON.stringify({
          report_type: 'quarterly_summary',
          include_trends: true,
          email_recipients: []
        })
      }
    ];

    for (const job of defaultJobs) {
      try {
        await sequelize.query(`
          INSERT IGNORE INTO cqi_scheduler_config 
          (job_name, job_type, cron_expression, description, parameters)
          VALUES (?, ?, ?, ?, ?)
        `, {
          replacements: [job.job_name, job.job_type, job.cron_expression, job.description, job.parameters],
          type: QueryTypes.INSERT
        });
      } catch (error) {
        console.error(`[CQI Scheduler] Error inserting default job ${job.job_name}:`, error);
      }
    }
  }

  /**
   * Start default jobs
   */
  async startDefaultJobs() {
    try {
      const configs = await sequelize.query(`
        SELECT * FROM cqi_scheduler_config WHERE is_active = 1
      `, { type: QueryTypes.SELECT });

      for (const config of configs) {
        await this.scheduleJob(config);
      }

      console.log(`[CQI Scheduler] Started ${configs.length} scheduled jobs`);
    } catch (error) {
      console.error('[CQI Scheduler] Error starting default jobs:', error);
    }
  }

  /**
   * Schedule a job
   */
  async scheduleJob(config) {
    try {
      // Stop existing job if running
      if (this.jobs.has(config.job_name)) {
        this.jobs.get(config.job_name).destroy();
      }

      // Create new cron job
      const job = cron.schedule(config.cron_expression, async () => {
        await this.executeJob(config);
      }, {
        scheduled: false,
        timezone: 'UTC'
      });

      // Start the job
      job.start();
      this.jobs.set(config.job_name, job);

      console.log(`[CQI Scheduler] Scheduled job: ${config.job_name} (${config.cron_expression})`);
    } catch (error) {
      console.error(`[CQI Scheduler] Error scheduling job ${config.job_name}:`, error);
    }
  }

  /**
   * Execute a scheduled job
   */
  async executeJob(config) {
    const startTime = new Date();
    console.log(`[CQI Scheduler] Starting job: ${config.job_name} at ${startTime.toISOString()}`);

    try {
      // Update job status to running
      await this.updateJobStatus(config.job_name, 'running', null, startTime);

      let result;
      const parameters = config.parameters ? JSON.parse(config.parameters) : {};

      switch (config.job_type) {
        case 'data_update':
          result = await this.executeDataUpdateJob(config, parameters);
          break;
        case 'validation':
          result = await this.executeValidationJob(config, parameters);
          break;
        case 'cleanup':
          result = await this.executeCleanupJob(config, parameters);
          break;
        case 'report':
          result = await this.executeReportJob(config, parameters);
          break;
        default:
          throw new Error(`Unknown job type: ${config.job_type}`);
      }

      // Update job status to success
      await this.updateJobStatus(config.job_name, 'success', null, startTime);
      
      const duration = new Date() - startTime;
      console.log(`[CQI Scheduler] Completed job: ${config.job_name} in ${duration}ms`);

    } catch (error) {
      console.error(`[CQI Scheduler] Job failed: ${config.job_name}`, error);
      
      // Update job status to error
      await this.updateJobStatus(config.job_name, 'error', error.message, startTime);
    }
  }

  /**
   * Execute data update job
   */
  async executeDataUpdateJob(config, parameters) {
    const { period_type = 'current_quarter', auto_fix = false } = parameters;
    
    // Calculate date range based on period type
    const dateRange = this.calculateDateRange(period_type);
    
    // Get all sites or specific site
    const sites = config.site_id ? [config.site_id] : await this.getAllSiteCodes();
    
    const results = [];
    
    for (const siteId of sites) {
      try {
        // Populate CQI indicators
        const populateResult = await cqiIndicatorService.populateAllIndicators({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          siteId: siteId === 'all' ? null : siteId,
          deadCode: 4,
          lostCode: 3,
          transferInCode: 1,
          transferOutCode: 2
        });

        // Auto-fix issues if enabled
        if (auto_fix) {
          const fixResult = await cqiValidationService.autoFixIssues({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            siteId: siteId === 'all' ? null : siteId
          });
          
          populateResult.auto_fix_result = fixResult;
        }

        results.push({
          site_id: siteId,
          status: 'success',
          result: populateResult
        });

      } catch (error) {
        console.error(`[CQI Scheduler] Error updating data for site ${siteId}:`, error);
        results.push({
          site_id: siteId,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      job_type: 'data_update',
      period: dateRange,
      sites_processed: results.length,
      successful_sites: results.filter(r => r.status === 'success').length,
      failed_sites: results.filter(r => r.status === 'error').length,
      results
    };
  }

  /**
   * Execute validation job
   */
  async executeValidationJob(config, parameters) {
    const { period_type = 'current_quarter', auto_fix = false, send_report = false } = parameters;
    
    const dateRange = this.calculateDateRange(period_type);
    const sites = config.site_id ? [config.site_id] : await this.getAllSiteCodes();
    
    const results = [];
    
    for (const siteId of sites) {
      try {
        // Run validation
        const validationResult = await cqiValidationService.runAllValidations({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          siteId: siteId === 'all' ? null : siteId
        });

        // Auto-fix issues if enabled
        if (auto_fix && validationResult.summary.error_count > 0) {
          const fixResult = await cqiValidationService.autoFixIssues({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            siteId: siteId === 'all' ? null : siteId
          });
          
          validationResult.auto_fix_result = fixResult;
        }

        results.push({
          site_id: siteId,
          status: 'success',
          result: validationResult
        });

      } catch (error) {
        console.error(`[CQI Scheduler] Error validating data for site ${siteId}:`, error);
        results.push({
          site_id: siteId,
          status: 'error',
          error: error.message
        });
      }
    }

    // Send report if enabled
    if (send_report) {
      await this.sendValidationReport(results, dateRange);
    }

    return {
      job_type: 'validation',
      period: dateRange,
      sites_processed: results.length,
      successful_sites: results.filter(r => r.status === 'success').length,
      failed_sites: results.filter(r => r.status === 'error').length,
      total_issues: results.reduce((sum, r) => sum + (r.result?.summary?.total_issues || 0), 0),
      results
    };
  }

  /**
   * Execute cleanup job
   */
  async executeCleanupJob(config, parameters) {
    const { retain_months = 24, cleanup_logs = true } = parameters;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retain_months);
    
    const results = [];
    
    try {
      // Clean up old CQI indicator data
      const cleanupQuery = `
        DELETE FROM cqi_indicator 
        WHERE created_at < ? 
          AND (? IS NULL OR site_id = ?)
      `;
      
      const cleanupResult = await sequelize.query(cleanupQuery, {
        replacements: [cutoffDate, config.site_id, config.site_id],
        type: QueryTypes.DELETE
      });
      
      results.push({
        operation: 'cleanup_cqi_data',
        status: 'success',
        records_deleted: cleanupResult[1] || 0
      });

      // Clean up old scheduler logs if enabled
      if (cleanup_logs) {
        const logCleanupQuery = `
          UPDATE cqi_scheduler_config 
          SET last_error = NULL 
          WHERE last_run < ?
        `;
        
        await sequelize.query(logCleanupQuery, {
          replacements: [cutoffDate],
          type: QueryTypes.UPDATE
        });
        
        results.push({
          operation: 'cleanup_scheduler_logs',
          status: 'success',
          message: 'Old error logs cleared'
        });
      }

    } catch (error) {
      console.error('[CQI Scheduler] Error during cleanup:', error);
      results.push({
        operation: 'cleanup',
        status: 'error',
        error: error.message
      });
    }

    return {
      job_type: 'cleanup',
      cutoff_date: cutoffDate,
      operations: results
    };
  }

  /**
   * Execute report job
   */
  async executeReportJob(config, parameters) {
    const { report_type = 'quarterly_summary', include_trends = true, email_recipients = [] } = parameters;
    
    // This is a placeholder for report generation
    // In a real implementation, you would generate comprehensive reports
    
    return {
      job_type: 'report',
      report_type,
      status: 'completed',
      message: 'Report generation not yet implemented'
    };
  }

  /**
   * Calculate date range based on period type
   */
  calculateDateRange(periodType) {
    const now = new Date();
    let startDate, endDate;

    switch (periodType) {
      case 'current_quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last_30_days':
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        // Default to current quarter
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Get all site codes
   */
  async getAllSiteCodes() {
    try {
      const sites = await siteDatabaseManager.getAllSites();
      return ['all', ...sites.map(site => site.code)];
    } catch (error) {
      console.error('[CQI Scheduler] Error getting site codes:', error);
      return ['all'];
    }
  }

  /**
   * Update job status in database
   */
  async updateJobStatus(jobName, status, error = null, lastRun = null) {
    try {
      await sequelize.query(`
        UPDATE cqi_scheduler_config 
        SET last_status = ?, 
            last_error = ?, 
            last_run = ?,
            run_count = run_count + 1,
            updated_at = NOW()
        WHERE job_name = ?
      `, {
        replacements: [status, error, lastRun, jobName],
        type: QueryTypes.UPDATE
      });
    } catch (error) {
      console.error(`[CQI Scheduler] Error updating job status for ${jobName}:`, error);
    }
  }

  /**
   * Send validation report (placeholder)
   */
  async sendValidationReport(results, dateRange) {
    // Placeholder for email/notification functionality
    console.log(`[CQI Scheduler] Validation report generated for period ${dateRange.startDate} to ${dateRange.endDate}`);
    console.log(`[CQI Scheduler] Total sites processed: ${results.length}`);
    console.log(`[CQI Scheduler] Total issues found: ${results.reduce((sum, r) => sum + (r.result?.summary?.total_issues || 0), 0)}`);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobName = null) {
    try {
      let query = 'SELECT * FROM cqi_scheduler_config';
      let replacements = [];

      if (jobName) {
        query += ' WHERE job_name = ?';
        replacements.push(jobName);
      }

      query += ' ORDER BY last_run DESC';

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT
      });

      return results.map(job => ({
        ...job,
        parameters: job.parameters ? JSON.parse(job.parameters) : null,
        is_running: this.jobs.has(job.job_name)
      }));
    } catch (error) {
      console.error('[CQI Scheduler] Error getting job status:', error);
      return [];
    }
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName) {
    try {
      const configs = await sequelize.query(`
        SELECT * FROM cqi_scheduler_config WHERE job_name = ? AND is_active = 1
      `, {
        replacements: [jobName],
        type: QueryTypes.SELECT
      });

      if (configs.length === 0) {
        throw new Error(`Job '${jobName}' not found or inactive`);
      }

      const config = configs[0];
      
      // Execute job immediately
      await this.executeJob(config);
      
      return {
        success: true,
        message: `Job '${jobName}' triggered successfully`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[CQI Scheduler] Error triggering job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  async stopAllJobs() {
    try {
      for (const [jobName, job] of this.jobs) {
        job.destroy();
        console.log(`[CQI Scheduler] Stopped job: ${jobName}`);
      }
      
      this.jobs.clear();
      console.log('[CQI Scheduler] All jobs stopped');
    } catch (error) {
      console.error('[CQI Scheduler] Error stopping jobs:', error);
    }
  }

  /**
   * Restart scheduler service
   */
  async restart() {
    try {
      await this.stopAllJobs();
      this.isInitialized = false;
      await this.initialize();
      console.log('[CQI Scheduler] Scheduler service restarted');
    } catch (error) {
      console.error('[CQI Scheduler] Error restarting scheduler:', error);
      throw error;
    }
  }
}

module.exports = new CQISchedulerService();
