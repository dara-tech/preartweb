import api from './api'

export const siteApi = {
  // Get all sites (using new site-operations endpoint)
  getAllSites: async () => {
    const response = await api.get('/apiv1/site-operations/sites')
    return response.data
  },

  // Get sites (alias for getAllSites for compatibility)
  getSites: async () => {
    const response = await api.get('/apiv1/site-operations/sites')
    return response.data
  },

  // Get active sites only
  getActiveSites: async () => {
    const response = await api.get('/apiv1/site-operations/sites')
    return response.data
  },

  // Get sites by province
  getSitesByProvince: async (provinceCode) => {
    const response = await api.get('/apiv1/site-operations/sites')
    const allSites = response.data.sites || response.data
    return {
      sites: allSites.filter(site => site.province === provinceCode)
    }
  },

  // Get site statistics
  getSiteStats: async (siteCode) => {
    if (siteCode) {
      const response = await api.get(`/apiv1/site-operations/sites/${siteCode}/stats`)
      return response.data
    } else {
      const response = await api.get('/apiv1/site-operations/sites')
      return response.data
    }
  },

  // Create new site
  createSite: async (siteData) => {
    const response = await api.post('/apiv1/sites', siteData)
    return response.data
  },

  // Update site
  updateSite: async (siteCode, siteData) => {
    const response = await api.put(`/apiv1/sites/${siteCode}`, siteData)
    return response.data
  },

  // Delete site
  deleteSite: async (siteCode) => {
    const response = await api.delete(`/apiv1/sites/${siteCode}`)
    return response.data
  },

  // Get site details
  getSiteDetails: async (siteCode) => {
    const response = await api.get(`/apiv1/site-operations/sites/${siteCode}/stats`)
    return response.data
  },

  // Get sites that have data in the database
  getSitesWithData: async () => {
    const response = await api.get('/apiv1/site-operations/sites')
    return response.data
  },

  // Test site connection
  testSiteConnection: async (siteCode) => {
    const response = await api.get(`/apiv1/site-operations/sites/${siteCode}/test`)
    return response.data
  },

  // Execute custom query on site
  executeSiteQuery: async (siteCode, query) => {
    const response = await api.post(`/apiv1/site-operations/sites/${siteCode}/query`, { query })
    return response.data
  }
}

export default siteApi
