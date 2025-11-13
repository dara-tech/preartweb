import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert, AlertDescription, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, Skeleton } from "@/components/ui";
import React, { useState, useEffect, useCallback } from 'react'
import api from "../../services/api"
import { 
  RefreshCw, 
  Users, 
  Eye,
  Edit,
  MoreVertical,
  Download,
  Plus,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle,
  SortAsc,
  SortDesc,
  Menu,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui"
import { useSite } from "../../contexts/SiteContext"

/**
 * Unified Patient List Component
 * Provides consistent patient list functionality for all patient types
 */
function UnifiedPatientList({
  patientType, // 'adult', 'child', 'infant'
  apiEndpoint, // '/apiv1/patients/adult', '/apiv1/patients/child', '/apiv1/patients/infant'
  searchTerm,
  setSearchTerm,
  selectPatient,
  onNewPatient,
  selectedSite,
  patientConfig // Patient-specific configuration
}) {
  // Track if we're currently filtering by site
  const [isFilteringBySite, setIsFilteringBySite] = useState(false)
  // Track if user has explicitly chosen to filter by site
  const [userSelectedSite, setUserSelectedSite] = useState(null)
  // Internal state for data management
  const [patients, setPatients] = useState([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25) // Show 25 patients per page by default for better performance
  const { isMultiSite } = useSite()
  // State for available sites
  const [availableSites, setAvailableSites] = useState([])
  const [sortBy, setSortBy] = useState('clinicId')
  const [sortOrder, setSortOrder] = useState('asc')
  const [filters, setFilters] = useState({
    gender: 'all',
    status: 'all',
    siteCode: 'all',
    ageRange: 'all',
    referral: 'all',
    artNumber: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  // Debug: Force refresh to clear cache issues
  console.log(`${patientType} PatientList component loaded - unified version`)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Skeleton loading component
  const PatientSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-none" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Debounced search to reduce API calls
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  // Load patients data with pagination and filtering
  const loadPatientsList = async (page = currentPage, limit = itemsPerPage, immediate = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Build API URL with pagination and filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      
      // Add search term
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      // Add site filter only if user has explicitly selected a site (not for initial forms)
      // For initial forms, we want to show all sites by default
      if (userSelectedSite?.name) {
        params.append('site', userSelectedSite.name)
        setIsFilteringBySite(true)
      } else {
        setIsFilteringBySite(false)
      }
      
      // Add other filters
      if (filters.gender !== 'all') {
        params.append('gender', filters.gender)
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.ageRange !== 'all') {
        params.append('ageRange', filters.ageRange)
      }
      if (filters.referral !== 'all') {
        params.append('referral', filters.referral)
      }
      if (filters.artNumber) {
        params.append('artNumber', filters.artNumber)
      }
      
      const url = `${apiEndpoint}?${params.toString()}`
      console.log(`Loading ${patientType} patients from URL:`, url)
      
      const response = await api.get(url)
      console.log(`${patientType} patients response:`, response.data)
      
      setPatients(response.data.patients || [])
      setTotalPatients(response.data.total || 0)
      setCurrentPage(page)
      
    } catch (error) {
      console.error(`Error loading ${patientType} patients:`, error)
      setError(`Error loading ${patientType} patients list`)
      setPatients([])
      setTotalPatients(0)
    } finally {
      setLoading(false)
    }
  }

  // Load available sites
  const loadAvailableSites = async () => {
    try {
      const response = await api.get('/apiv1/lookups/sites-registry')
      setAvailableSites(response.data || [])
    } catch (err) {
      console.error('Error loading sites:', err)
    }
  }

  // Effects
  useEffect(() => {
    loadAvailableSites()
  }, [])

  useEffect(() => {
    if (immediate) {
      loadPatientsList(1, itemsPerPage, true)
    } else {
      // Debounce search
      const timeoutId = setTimeout(() => {
        loadPatientsList(1, itemsPerPage)
      }, 300)
      setSearchTimeout(timeoutId)
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, userSelectedSite, filters, sortBy, sortOrder])

  // Handle site selection
  const handleSiteChange = (siteCode) => {
    if (siteCode === 'all') {
      setUserSelectedSite(null)
    } else {
      const site = availableSites.find(s => s.code === siteCode)
      setUserSelectedSite(site)
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: 'all',
      status: 'all',
      siteCode: 'all',
      ageRange: 'all',
      referral: 'all',
      artNumber: ''
    })
    setUserSelectedSite(null)
    setSearchTerm('')
  }

  // Handle pagination
  const handlePageChange = (page) => {
    loadPatientsList(page, itemsPerPage)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    loadPatientsList(1, newItemsPerPage)
  }

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Refresh data
  const handleRefresh = () => {
    setLastRefresh(new Date())
    loadPatientsList(currentPage, itemsPerPage, true)
  }

  // Get patient status badge
  const getStatusBadge = (patient) => {
    const status = patient.status || 'Active'
    const statusMap = {
      'Active': { variant: 'default', icon: CheckCircle },
      'Dead': { variant: 'destructive', icon: AlertCircle },
      'Lost': { variant: 'secondary', icon: AlertCircle },
      'Transferred Out': { variant: 'outline', icon: AlertCircle }
    }
    
    const statusInfo = statusMap[status] || statusMap['Active']
    const Icon = statusInfo.icon
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  // Get patient age display
  const getAgeDisplay = (patient) => {
    if (patient.age !== null && patient.age !== undefined) {
      return `${patient.age} years`
    }
    if (patient.dateOfBirth) {
      const birthDate = new Date(patient.dateOfBirth)
      const today = new Date()
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
      return `${age} years`
    }
    return 'N/A'
  }

  // Calculate pagination info
  const totalPages = Math.ceil(totalPatients / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalPatients)

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {patientConfig.title} Registry
            </h2>
          </div>
          <Badge variant="outline" className="text-sm">
            {totalPatients.toLocaleString()} patients
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onNewPatient} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={`Search ${patientType} patients...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Site Filter */}
        {isMultiSite && (
          <div className="w-full lg:w-64">
            <Select value={userSelectedSite?.code || 'all'} onValueChange={handleSiteChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {availableSites.map((site) => (
                  <SelectItem key={site.code} value={site.code}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full lg:w-auto"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Gender</label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="transferred_out">Transferred Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Age Range</label>
                <Select value={filters.ageRange} onValueChange={(value) => handleFilterChange('ageRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    {patientConfig.ageRanges?.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ART Number Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">ART Number</label>
                <Input
                  placeholder="Enter ART number"
                  value={filters.artNumber}
                  onChange={(e) => handleFilterChange('artNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Patient List */}
      <div className="space-y-4">
        {loading ? (
          <PatientSkeleton />
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '') 
                  ? 'Try adjusting your search or filters'
                  : `No ${patientType} patients have been registered yet`
                }
              </p>
              <Button onClick={onNewPatient}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Patient Cards */}
            <div className="space-y-3">
              {patients.map((patient, index) => (
                <Card key={patient.clinicId || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Patient Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 status-active rounded-none flex items-center justify-center">
                            <User className="w-5 h-5 text-foreground" />
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {patient.patientName || `Patient ${patient.clinicId}`}
                            </h3>
                            {getStatusBadge(patient)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Building2 className="w-3 h-3 mr-1" />
                              {patient.siteName || 'N/A'}
                            </span>
                            <span className="font-medium text-foreground">ID: {patient.clinicId}</span>
                            <span>Age: {getAgeDisplay(patient)}</span>
                            {patient.artNumber && (
                              <span>ART: {patient.artNumber}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectPatient(patient)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => selectPatient(patient)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex} to {endIndex} of {totalPatients.toLocaleString()} patients
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UnifiedPatientList
