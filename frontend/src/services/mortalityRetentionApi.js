import api from './api'

export const mortalityRetentionApi = {
  // Get all mortality and retention indicators for a specific site
  getAllIndicators: async (siteCode, params = {}) => {
    const { startDate, endDate, previousEndDate, useCache = true } = params
    const queryParams = {
      startDate,
      endDate,
      previousEndDate,
      useCache
    }
    
    const response = await api.get(`/apiv1/mortality-retention-indicators/sites/${siteCode}`, { 
      params: queryParams 
    })
    return response.data
  },

  // Get specific mortality and retention indicator for a site
  getIndicator: async (siteCode, indicatorId, params = {}) => {
    const { startDate, endDate, previousEndDate, useCache = true } = params
    const queryParams = {
      startDate,
      endDate,
      previousEndDate,
      useCache
    }
    
    const response = await api.get(`/apiv1/mortality-retention-indicators/sites/${siteCode}/indicators/${indicatorId}`, { 
      params: queryParams 
    })
    return response.data
  },

  // Get list of available mortality and retention indicators
  getAvailableIndicators: async () => {
    const response = await api.get('/apiv1/mortality-retention-indicators/indicators')
    return response.data
  },

  // Admin endpoints for managing indicator status
  // Get all indicators with their status (admin only)
  getIndicatorStatuses: async () => {
    const response = await api.get('/apiv1/mortality-retention-indicators/admin/indicators')
    return response.data
  },

  // Update indicator status (admin only)
  updateIndicatorStatus: async (indicatorId, isActive) => {
    const response = await api.put(`/apiv1/mortality-retention-indicators/admin/indicators/${indicatorId}/status`, {
      is_active: isActive
    })
    return response.data
  },

  // Bulk update indicator statuses (admin only)
  bulkUpdateIndicatorStatuses: async (indicators) => {
    const response = await api.put('/apiv1/mortality-retention-indicators/admin/indicators/bulk-status', {
      indicators
    })
    return response.data
  }
}

export default mortalityRetentionApi



