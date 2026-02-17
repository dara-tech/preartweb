import api from './api'

export const reportingApi = {
  // Get all indicators (site-specific or all sites combined)
  getAllIndicators: async (params = {}) => {
    const { siteCode, startDate, endDate, previousEndDate, useCache = true } = params
    const queryParams = {
      startDate,
      endDate,
      previousEndDate,
      useCache
    }
    
    if (siteCode) {
      queryParams.siteCode = siteCode
    }
    
    const response = await api.get('/apiv1/indicators-optimized/all', { params: queryParams })
    return response.data
  },

  // Get specific indicator
  getIndicator: async (indicatorId, params = {}) => {
    const { siteCode, startDate, endDate, previousEndDate, useCache = true } = params
    const queryParams = {
      startDate,
      endDate,
      previousEndDate,
      useCache
    }
    
    if (siteCode) {
      queryParams.siteCode = siteCode
    }
    
    const response = await api.get(`/apiv1/indicators-optimized/${indicatorId}`, { params: queryParams })
    return response.data
  },

  // Get indicator details with pagination and filtering
  getIndicatorDetails: async (indicatorId, params = {}) => {
    const { 
      siteCode, 
      startDate, 
      endDate, 
      previousEndDate, 
      page = 1, 
      limit = 50,
      search = '',
      searchTerm = '',
      ageGroup = '',
      gender = '',
      useCache = true 
    } = params
    
    // Use search if provided, otherwise use searchTerm
    const searchParam = search || searchTerm
    
    const queryParams = {
      startDate,
      endDate,
      previousEndDate,
      page,
      limit,
      search: searchParam, // Backend expects 'search' parameter
      ageGroup,
      gender,
      useCache
    }
    
    // Add siteCode if provided
    if (siteCode) {
      queryParams.siteCode = siteCode
    }
    
    
    
    // Use the general endpoint for both specific sites and all sites
    // The backend will handle site filtering based on the siteCode parameter
    try {
      const endpoint = `/apiv1/indicators-optimized/details/${indicatorId}`
      const response = await api.get(endpoint, { params: queryParams })
      return response.data
    } catch (error) {
      // If general endpoint fails, aggregate data from all available sites
      console.log('General endpoint failed, aggregating data from all sites for "All Sites"')
      
      try {
        // Get list of all sites first
        const sitesResponse = await api.get('/apiv1/lookups/sites-registry')
        const sites = sitesResponse.data || []
        
        if (sites.length === 0) {
          throw new Error('No sites available')
        }
        
        // Fetch data from all sites in parallel
        const sitePromises = sites.map(site => 
          api.get(`/apiv1/site-indicators/sites/${site.code}/indicators/${indicatorId}/details`, { 
            params: queryParams 
          }).catch(err => {
            console.warn(`Failed to fetch data from site ${site.code}:`, err.message)
            return { data: { data: [], pagination: { totalCount: 0 } } }
          })
        )
        
        const siteResponses = await Promise.all(sitePromises)
        
        // Aggregate all data
        let allData = []
        let totalCount = 0
        let aggregatedPagination = { page: 1, totalPages: 1, totalCount: 0, hasPrev: false, hasNext: false }
        
        siteResponses.forEach((response, index) => {
          if (response.data && response.data.success && response.data.data) {
            const siteData = response.data.data.map(record => ({
              ...record,
              sourceSite: sites[index].code,
              sourceSiteName: sites[index].name
            }))
            allData = allData.concat(siteData)
            totalCount += response.data.pagination?.totalCount || 0
          }
        })
        
        // Apply pagination to aggregated data
        const page = parseInt(queryParams.page) || 1
        const limit = parseInt(queryParams.limit) || 50
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = allData.slice(startIndex, endIndex)
        
        aggregatedPagination = {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasPrev: page > 1,
          hasNext: endIndex < totalCount
        }
        
        return {
          success: true,
          data: paginatedData,
          pagination: aggregatedPagination,
          isAggregatedData: true,
          sourceSites: sites.map(s => s.code),
          message: `Aggregated data from ${sites.length} sites: ${sites.map(s => s.code).join(', ')}`
        }
        
      } catch (aggregationError) {
        console.error('Failed to aggregate data from all sites:', aggregationError)
        // Final fallback to site 0201
        const fallbackEndpoint = `/apiv1/site-indicators/sites/0201/indicators/${indicatorId}/details`
        const response = await api.get(fallbackEndpoint, { params: queryParams })
        
        return {
          ...response.data,
          isSampleData: true,
          sampleSite: '0201',
          message: 'Showing sample data from site 0201. Full aggregated data not available.'
        }
      }
    }
  }
}

export const infantReportApi = {
  getInfantReport: async (params = {}) => {
    const { siteCode, startDate, endDate, previousEndDate } = params
    if (!siteCode) {
      return { success: false, error: 'Site code is required' }
    }
    const queryParams = { siteCode, startDate, endDate, previousEndDate }
    const response = await api.get('/apiv1/reports/infant-report', { params: queryParams })
    return response.data
  },

  getInfantReportDetails: async (params = {}) => {
    const { siteCode, scriptId, startDate, endDate, previousEndDate } = params
    if (!siteCode || !scriptId) {
      return { success: false, error: 'Site code and scriptId are required', data: [] }
    }
    const queryParams = { siteCode, scriptId, startDate, endDate, previousEndDate }
    const response = await api.get('/apiv1/reports/infant-report/details', { params: queryParams })
    return response.data
  }
}

export const pnttReportApi = {
  getPnttReport: async (params = {}) => {
    const { siteCode, startDate, endDate, previousEndDate } = params
    if (!siteCode) {
      return { success: false, error: 'Site code is required' }
    }
    const queryParams = { siteCode, startDate, endDate, previousEndDate }
    const response = await api.get('/apiv1/reports/pntt-report', { params: queryParams })
    return response.data
  },

  getPnttReportDetails: async (params = {}) => {
    const { siteCode, scriptId, startDate, endDate, previousEndDate } = params
    if (!siteCode || !scriptId) {
      return { success: false, error: 'Site code and scriptId are required', data: [] }
    }
    const queryParams = { siteCode, scriptId, startDate, endDate, previousEndDate }
    const response = await api.get('/apiv1/reports/pntt-report/details', { params: queryParams })
    return response.data
  }
}

export default reportingApi
