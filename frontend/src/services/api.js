import axios from 'axios'

// Determine API / WebSocket base URL (no trailing path; no trailing slash)
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Check if we're in production (HTTPS or specific domains)
  const isProduction = protocol === 'https:' || 
    hostname.includes('nchads.gov.kh') || 
    hostname.includes('yourdomain.com') ||
    import.meta.env.PROD
  
  if (isProduction) {
    // Production: Use HTTPS and same domain
    return `${protocol}//${hostname}`
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Development: Use localhost
    return 'http://localhost:3001'
  } else {
    // Network development: Use same hostname with port 3001
    return `http://${hostname}:3001`
  }
}

let API_BASE_URL = import.meta.env.VITE_API_URL || getApiBaseUrl()

// Clean up API_BASE_URL - remove any trailing /api or /apiv1 to avoid conflicts
if (API_BASE_URL.endsWith('/api') || API_BASE_URL.endsWith('/apiv1')) {
  API_BASE_URL = API_BASE_URL.replace(/\/api(v1)?$/, '')
}

// Add trailing slash if missing
if (!API_BASE_URL.endsWith('/')) {
  API_BASE_URL += '/'
}

// API Base URL configured

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minute timeout for complex indicator queries
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
})

// Request interceptor to add auth token and cache-busting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add cache-busting parameter for GET requests to indicators
    if (config.method === 'get' && config.url?.includes('/indicators-optimized/')) {
      config.params = {
        ...config.params,
        _t: Date.now() // Add timestamp to prevent caching
      }
    }
    
    // Log requests in development (disabled for cleaner console)
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development (disabled for cleaner console)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    
    return Promise.reject(error)
  }
)

export default api
