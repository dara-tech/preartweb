import api from './api';

const analyticsApi = {
  // Get analytics health status
  getAnalyticsHealth: async () => {
    try {
      const response = await api.get('/apiv1/analytics/health');
      return response.data;
    } catch (error) {
      console.error('Analytics health check failed:', error);
      throw error;
    }
  },

  // Get analytics summary
  getAnalyticsSummary: async () => {
    try {
      const response = await api.get('/apiv1/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Analytics summary failed:', error);
      throw error;
    }
  },

  // Run yearly analytics
  runYearlyAnalytics: async (year, siteCode = null) => {
    try {
      const response = await api.post('/apiv1/analytics/run-yearly', {
        year,
        siteCode
      });
      return response.data;
    } catch (error) {
      console.error('Yearly analytics failed:', error);
      throw error;
    }
  },

  // Enable analytics engine
  enableAnalytics: async () => {
    try {
      const response = await api.post('/apiv1/analytics/enable');
      return response.data;
    } catch (error) {
      console.error('Enable analytics failed:', error);
      throw error;
    }
  },

  // Disable analytics engine
  disableAnalytics: async () => {
    try {
      const response = await api.post('/apiv1/analytics/disable');
      return response.data;
    } catch (error) {
      console.error('Disable analytics failed:', error);
      throw error;
    }
  },

  // Get analytics data for a specific period
  getAnalyticsData: async (siteCode, periodType, periodYear, periodQuarter = null, periodMonth = null) => {
    try {
      const params = new URLSearchParams({
        periodType,
        periodYear: periodYear.toString()
      });
      
      if (periodQuarter) params.append('periodQuarter', periodQuarter.toString());
      if (periodMonth) params.append('periodMonth', periodMonth.toString());

      const response = await api.get(`/apiv1/analytics/indicators/${siteCode}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get analytics data failed:', error);
      throw error;
    }
  },

  // Get single indicator data
  getIndicatorData: async (indicatorId, siteCode, periodType, periodYear, periodQuarter = null, periodMonth = null) => {
    try {
      const params = new URLSearchParams({
        periodType,
        periodYear: periodYear.toString()
      });
      
      if (periodQuarter) params.append('periodQuarter', periodQuarter.toString());
      if (periodMonth) params.append('periodMonth', periodMonth.toString());

      const response = await api.get(`/apiv1/analytics/indicator/${indicatorId}/${siteCode}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get indicator data failed:', error);
      throw error;
    }
  },

  // Batch calculate indicators
  batchCalculate: async (calculations) => {
    try {
      const response = await api.post('/apiv1/analytics/batch-calculate', {
        calculations
      });
      return response.data;
    } catch (error) {
      console.error('Batch calculate failed:', error);
      throw error;
    }
  },

  // Get all analytics data with filters
  getAllAnalyticsData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.indicatorId) params.append('indicatorId', filters.indicatorId);
      if (filters.siteCode) params.append('siteCode', filters.siteCode);
      if (filters.periodType) params.append('periodType', filters.periodType);
      if (filters.periodYear) params.append('periodYear', filters.periodYear);
      if (filters.periodQuarter && filters.periodQuarter !== '') params.append('periodQuarter', filters.periodQuarter);

      const response = await api.get(`/apiv1/analytics/data?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get all analytics data failed:', error);
      throw error;
    }
  },

  // Get unique sites from analytics_indicators table
  getAnalyticsSites: async () => {
    try {
      const response = await api.get('/apiv1/analytics/sites');
      return response.data;
    } catch (error) {
      console.error('Get analytics sites failed:', error);
      throw error;
    }
  },

  // Get unique indicators from analytics_indicators table
  getAnalyticsIndicators: async () => {
    try {
      const response = await api.get('/apiv1/analytics/indicators');
      return response.data;
    } catch (error) {
      console.error('Get analytics indicators failed:', error);
      throw error;
    }
  },

  // Get unique years from analytics_indicators table
  getAnalyticsYears: async () => {
    try {
      const response = await api.get('/apiv1/analytics/years');
      return response.data;
    } catch (error) {
      console.error('Get analytics years failed:', error);
      throw error;
    }
  },

  // Clear analytics cache
  clearCache: async () => {
    try {
      const response = await api.post('/apiv1/analytics/clear-cache');
      return response.data;
    } catch (error) {
      console.error('Clear cache failed:', error);
      throw error;
    }
  },

  // Reset auto-increment counters
  resetAutoIncrement: async () => {
    try {
      const response = await api.post('/apiv1/admin/reset-auto-increment');
      return response.data;
    } catch (error) {
      console.error('Reset auto-increment failed:', error);
      throw error;
    }
  },

  // Get warehouse status
  getAnalyticsStatus: async ({ periodType, year, quarter, month } = {}) => {
    try {
      const params = new URLSearchParams();
      if (periodType) params.append('periodType', periodType);
      if (year) params.append('year', year.toString());
      if (quarter) params.append('quarter', quarter.toString());
      if (month) params.append('month', month.toString());
      const response = await api.get(`/apiv1/analytics/status?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get analytics status failed:', error);
      throw error;
    }
  },

  // Get country analytics rollup
  getCountryAnalytics: async ({ periodType, year, quarter, month } = {}) => {
    try {
      const params = new URLSearchParams();
      if (periodType) params.append('periodType', periodType);
      if (year) params.append('year', year.toString());
      if (quarter) params.append('quarter', quarter.toString());
      if (month) params.append('month', month.toString());
      const response = await api.get(`/apiv1/analytics/country?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get country analytics failed:', error);
      throw error;
    }
  },

  // Get province analytics rollup
  getProvinceAnalytics: async ({ periodType, year, quarter, month } = {}) => {
    try {
      const params = new URLSearchParams();
      if (periodType) params.append('periodType', periodType);
      if (year) params.append('year', year.toString());
      if (quarter) params.append('quarter', quarter.toString());
      if (month) params.append('month', month.toString());
      const response = await api.get(`/apiv1/analytics/province?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get province analytics failed:', error);
      throw error;
    }
  },

  // Get ETL run history log
  getEtlHistory: async ({ limit = 20 } = {}) => {
    try {
      const response = await api.get(`/apiv1/analytics/etl-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get ETL history failed:', error);
      throw error;
    }
  },

  // Trigger ETL refresh
  triggerAnalyticsRefresh: async ({ periodType, year, quarter, month, periods } = {}) => {
    try {
      const payload = periods && periods.length > 0
        ? { periods }
        : { periodType, year, quarter, month };
      const response = await api.post('/apiv1/analytics/refresh', payload);
      return response.data;
    } catch (error) {
      console.error('Trigger analytics refresh failed:', error);
      throw error;
    }
  },

  // Clear analytics data
  clearAnalyticsData: async ({ periodType, year, quarter, month, clearAll } = {}) => {
    try {
      const response = await api.post('/apiv1/analytics/clear', { periodType, year, quarter, month, clearAll });
      return response.data;
    } catch (error) {
      console.error('Clear analytics data failed:', error);
      throw error;
    }
  }
};

export default analyticsApi;
