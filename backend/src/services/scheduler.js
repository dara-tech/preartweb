const cron = require('node-cron');
const analyticsEngine = require('./analyticsEngine');
// CQI Analytics Engine removed

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting analytics scheduler...');

    // Schedule quarterly calculations (every quarter)
    this.scheduleQuarterlyCalculations();
    
    // Schedule monthly calculations (every month)
    this.scheduleMonthlyCalculations();
    
    // Schedule CQI quarterly calculations
    this.scheduleCQIQuarterlyCalculations();
    
    // Schedule daily health checks
    this.scheduleHealthChecks();
    
    // Schedule cleanup of old calculations
    this.scheduleCleanup();

    console.log('✅ Analytics scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.warn('Scheduler is not running');
      return;
    }

    this.jobs.forEach((job, name) => {
      job.destroy();
      console.log(`🛑 Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('🛑 Analytics scheduler stopped');
  }

  /**
   * Schedule quarterly calculations
   */
  scheduleQuarterlyCalculations() {
    // Run on the 1st day of each quarter at 2 AM
    const job = cron.schedule('0 2 1 1,4,7,10 *', async () => {
      console.info('📊 Starting quarterly analytics calculations...');
      await this.calculateQuarterlyIndicators();
    }, {
      scheduled: false,
      timezone: 'Asia/Phnom_Penh'
    });

    this.jobs.set('quarterly_calculations', job);
    job.start();
    console.log('📅 Scheduled quarterly calculations: 1st day of each quarter at 2 AM');
  }

  /**
   * Schedule monthly calculations
   */
  scheduleMonthlyCalculations() {
    // Run on the 1st day of each month at 3 AM
    const job = cron.schedule('0 3 1 * *', async () => {
      console.info('📊 Starting monthly analytics calculations...');
      await this.calculateMonthlyIndicators();
    }, {
      scheduled: false,
      timezone: 'Asia/Phnom_Penh'
    });

    this.jobs.set('monthly_calculations', job);
    job.start();
    console.log('📅 Scheduled monthly calculations: 1st day of each month at 3 AM');
  }

  /**
   * Schedule health checks
   */
  scheduleHealthChecks() {
    // Run every 6 hours
    const job = cron.schedule('0 */6 * * *', async () => {
      console.info('🏥 Running analytics health check...');
      await this.performHealthCheck();
    }, {
      scheduled: false,
      timezone: 'Asia/Phnom_Penh'
    });

    this.jobs.set('health_checks', job);
    job.start();
    console.log('📅 Scheduled health checks: every 6 hours');
  }

  /**
   * Schedule CQI quarterly calculations
   */
  scheduleCQIQuarterlyCalculations() {
    // Run on the 1st day of each quarter at 2:30 AM (30 minutes after regular analytics)
    const job = cron.schedule('30 2 1 1,4,7,10 *', async () => {
      console.info('📊 Starting quarterly CQI analytics calculations...');
      await this.calculateCQIQuarterlyIndicators();
    }, {
      scheduled: false,
      timezone: 'Asia/Phnom_Penh'
    });

    this.jobs.set('cqi_quarterly_calculations', job);
    job.start();
    console.log('📅 Scheduled CQI quarterly calculations: 1st day of each quarter at 2:30 AM');
  }

  /**
   * Calculate CQI quarterly indicators for all sites
   */
  async calculateCQIQuarterlyIndicators() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      
      // Calculate for current quarter
      await this.calculateCQIIndicatorsForPeriod('quarterly', currentYear, currentQuarter);
      
      // Calculate for previous quarter if needed
      const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const previousYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
      await this.calculateCQIIndicatorsForPeriod('quarterly', previousYear, previousQuarter);
      
      console.info('✅ CQI Quarterly calculations completed');
    } catch (error) {
      console.error('❌ CQI Quarterly calculations failed:', error);
    }
  }

  /**
   * Calculate CQI indicators for a specific period
   */
  async calculateCQIIndicatorsForPeriod(periodType, year, quarter = null, month = null) {
    const { Site } = require('../models');
    let sites = [];
    
    try {
      const siteRecords = await Site.findAll({ where: { status: 1 } });
      sites = siteRecords.map(site => ({ code: site.code, name: site.name }));
    } catch (error) {
      console.error('Error fetching sites for CQI calculations:', error);
      return;
    }

    const cqiIndicators = [
      '1', '2', '3', '4', 
      '5A', '5B', '5C', '5D', 
      '6', '6A', '6B', '6C', 
      '7', 
      '8A', '8B', 
      '9', '9A', '9B', '9C', '9D', '9E',
      '10A', '10B', 
      '11A', '11B', 
      '12A', '12B', '12C', '12D', '12E',
      '13A', '13B', '13C', 
      '14A', '14B', 
      '15'
    ];

    const period = this.generatePeriod(periodType, year, quarter, month);
    
    const requests = [];
    for (const site of sites) {
      for (const indicatorId of cqiIndicators) {
        requests.push({
          indicatorId,
          siteCode: site.code,
          period: {
            ...period,
            siteName: site.name
          },
          options: { forceRefresh: false }
        });
      }
    }

    console.info(`📊 Calculating ${requests.length} CQI indicators for ${periodType} ${year}${quarter ? ` Q${quarter}` : ''}${month ? ` M${month}` : ''}`);
    
    // CQI Analytics Engine removed - no batch calculation available
    const results = [];
    const errors = [];
    
    console.info(`✅ CQI Batch calculation completed: ${results.length} successful, ${errors.length} failed`);
    
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} CQI calculations failed:`, errors.map(e => e.error));
    }
  }

  /**
   * Schedule cleanup of old calculations
   */
  scheduleCleanup() {
    // Run every Sunday at 4 AM
    const job = cron.schedule('0 4 * * 0', async () => {
      console.info('🧹 Starting analytics cleanup...');
      await this.cleanupOldCalculations();
    }, {
      scheduled: false,
      timezone: 'Asia/Phnom_Penh'
    });

    this.jobs.set('cleanup', job);
    job.start();
    console.info('📅 Scheduled cleanup: every Sunday at 4 AM');
  }

  /**
   * Calculate quarterly indicators for all sites
   */
  async calculateQuarterlyIndicators() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      
      // Calculate for current quarter
      await this.calculateIndicatorsForPeriod('quarterly', currentYear, currentQuarter);
      
      // Calculate for previous quarter if needed
      const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const previousYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
      await this.calculateIndicatorsForPeriod('quarterly', previousYear, previousQuarter);
      
      console.info('✅ Quarterly calculations completed');
    } catch (error) {
      console.error('❌ Quarterly calculations failed:', error);
    }
  }

  /**
   * Calculate monthly indicators for all sites
   */
  async calculateMonthlyIndicators() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Calculate for current month
      await this.calculateIndicatorsForPeriod('monthly', currentYear, null, currentMonth);
      
      // Calculate for previous month if needed
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      await this.calculateIndicatorsForPeriod('monthly', previousYear, null, previousMonth);
      
      console.info('✅ Monthly calculations completed');
    } catch (error) {
      console.error('❌ Monthly calculations failed:', error);
    }
  }

  /**
   * Calculate indicators for a specific period
   */
  async calculateIndicatorsForPeriod(periodType, year, quarter = null, month = null) {
    const sites = [
      { code: '2101', name: 'Takeo PH' },
      { code: '2102', name: 'Kirivong' },
      { code: '2103', name: 'Angroka' },
      { code: '2104', name: 'Preykbas' }
    ];

    const indicators = [
      '1', '2', '3', '4', '5', '5.1.1', '5.1.2', '5.1.3', '5.2',
      '6', '7', '8.1', '8.2', '8.3', '9', '10',
      '10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8'
    ];

    const period = this.generatePeriod(periodType, year, quarter, month);
    
    const requests = [];
    for (const site of sites) {
      for (const indicatorId of indicators) {
        requests.push({
          indicatorId,
          siteCode: site.code,
          period: {
            ...period,
            siteName: site.name
          },
          options: { forceRefresh: false }
        });
      }
    }

    console.info(`📊 Calculating ${requests.length} indicators for ${periodType} ${year}${quarter ? ` Q${quarter}` : ''}${month ? ` M${month}` : ''}`);
    
    const { results, errors } = await analyticsEngine.batchCalculate(requests);
    
    console.info(`✅ Batch calculation completed: ${results.length} successful, ${errors.length} failed`);
    
    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} calculations failed:`, errors.map(e => e.error));
    }
  }

  /**
   * Generate period object
   */
  generatePeriod(periodType, year, quarter = null, month = null) {
    const period = {
      periodType,
      periodYear: year,
      periodQuarter: quarter,
      periodMonth: month
    };

    if (periodType === 'quarterly' && quarter) {
      const quarterStartMonths = [0, 2, 5, 8]; // Jan, Apr, Jul, Oct
      const startMonth = quarterStartMonths[quarter - 1];
      const endMonth = startMonth + 2;
      
      period.startDate = new Date(year, startMonth, 1).toISOString().split('T')[0];
      period.endDate = new Date(year, endMonth + 1, 0).toISOString().split('T')[0];
      
      // Previous quarter end date
      const prevQuarter = quarter === 1 ? 4 : quarter - 1;
      const prevYear = quarter === 1 ? year - 1 : year;
      const prevEndMonth = quarterStartMonths[prevQuarter - 1] + 2;
      period.previousEndDate = new Date(prevYear, prevEndMonth + 1, 0).toISOString().split('T')[0];
    } else if (periodType === 'monthly' && month) {
      period.startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      period.endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Previous month end date
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      period.previousEndDate = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];
    }

    return period;
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const summary = await analyticsEngine.getAnalyticsSummary();
      const healthStatus = summary.failedRecords < summary.totalRecords * 0.1 ? 'healthy' : 'degraded';
      
      console.info(`🏥 Analytics health check: ${healthStatus}`, {
        totalRecords: summary.totalRecords,
        completedRecords: summary.completedRecords,
        failedRecords: summary.failedRecords,
        successRate: summary.successRate
      });

      if (healthStatus === 'degraded') {
        console.warn('⚠️ Analytics engine is in degraded state - consider manual intervention');
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Cleanup old calculations
   */
  async cleanupOldCalculations() {
    try {
      const AnalyticsIndicator = require('../models/AnalyticsIndicator');
      const CQIIndicator = require('../models/CQIIndicator');
      const { Op } = require('sequelize');
      
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2); // Keep 2 years of data
      
      const deletedAnalytics = await AnalyticsIndicator.destroy({
        where: {
          last_updated: {
            [Op.lt]: cutoffDate
          }
        }
      });
      
      const deletedCQI = await CQIIndicator.destroy({
        where: {
          last_updated: {
            [Op.lt]: cutoffDate
          }
        }
      });
      
      console.info(`🧹 Cleanup completed: removed ${deletedAnalytics} analytics and ${deletedCQI} CQI old calculation records`);
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }
}

module.exports = new SchedulerService();
