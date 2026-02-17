import { Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert, AlertDescription, Skeleton, Card, CardContent } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Search, Filter } from 'lucide-react'
import api from "../../../../../services/api"
import { useSite } from "../../../../../contexts/SiteContext"

function PatientList({
  searchTerm,
  setSearchTerm,
  selectPatient,
  onNewPatient
}) {
  const [patients, setPatients] = useState([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [availableSites, setAvailableSites] = useState([])
  const [userSelectedSite, setUserSelectedSite] = useState(null)
  const [nationalities, setNationalities] = useState([])
  const [availableNationalities, setAvailableNationalities] = useState([])
  // Filter states
  const [dateRange, setDateRange] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ageRange, setAgeRange] = useState('all')
  const [nationalityFilter, setNationalityFilter] = useState('all')
  
  const { isMultiSite, selectedSite } = useSite()

  // Load lookup data
  const loadLookupData = async () => {
    try {
      // Get site code from selectedSite, fallback to null if not available
      const siteCode = selectedSite?.code || null
      const siteParam = siteCode ? { params: { site: siteCode } } : {}
      
      const nationalitiesRes = await api.get('/apiv1/lookups/nationalities', siteParam).catch(() => ({ data: [] }))
      setNationalities(Array.isArray(nationalitiesRes.data) ? nationalitiesRes.data : [])
    } catch (error) {
      console.error('Error loading lookup data:', error)
      setNationalities([])
    }
  }

  // Extract unique nationalities from patient data
  const updateAvailableNationalities = (patientData) => {
    const uniqueNationalities = [...new Set(patientData
      .map(patient => patient.nationality)
      .filter(nationality => nationality !== null && nationality !== undefined && nationality !== '' && nationality !== -1 && nationality !== 0)
    )].map(nationalityId => {
      const nationality = nationalities.find(n => n.id == nationalityId)
      return nationality ? { id: nationalityId, name: nationality.name } : { id: nationalityId, name: `Nationality ${nationalityId}` }
    }).sort((a, b) => a.name.localeCompare(b.name))
    
    setAvailableNationalities(uniqueNationalities)
  }

  // Load patients
  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      if (userSelectedSite?.name) {
        params.append('site', userSelectedSite.name)
      }
      
      // Add filter parameters
      if (dateRange && dateRange !== 'all') {
        params.append('dateRange', dateRange)
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (ageRange && ageRange !== 'all') {
        params.append('ageRange', ageRange)
      }
      
      if (nationalityFilter && nationalityFilter !== 'all') {
        params.append('nationality', nationalityFilter)
      }
      
      
      const response = await api.get(`/apiv1/patients/infant?${params.toString()}`)
      const patientData = response.data.patients || []
      setPatients(patientData)
      setTotalPatients(response.data.total || 0)
      
      // Update available nationalities based on current data
      updateAvailableNationalities(patientData)
    } catch (error) {
      setError('Error loading infant patients')
      setPatients([])
      setTotalPatients(0)
    } finally {
      setLoading(false)
    }
  }

  // Load sites
  const loadSites = async () => {
    try {
      const response = await api.get('/apiv1/lookups/sites-registry')
      setAvailableSites(response.data || [])
    } catch (error) {
      console.error('Error loading sites:', error)
    }
  }

  useEffect(() => {
    if (selectedSite) {
      loadLookupData()
    }
    loadSites()
  }, [selectedSite])

  useEffect(() => {
    const timeoutId = setTimeout(loadPatients, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, userSelectedSite, currentPage, itemsPerPage, selectedSite, dateRange, statusFilter, ageRange, nationalityFilter])

  const handleSiteChange = (siteCode) => {
    if (siteCode === 'all') {
      setUserSelectedSite(null)
    } else {
      const site = availableSites.find(s => s.code === siteCode)
      setUserSelectedSite(site)
    }
  }

  const getStatusBadge = (patient) => {
    const status = patient.status || 'Active'
    const isActive = status === 'Active'
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {status}
      </Badge>
    )
  }

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

  const getNationalityLabel = (nationality) => {
    if (nationality === null || nationality === undefined || nationality === '') return '';
    
    // Handle special case for 0 (Not Specified) - don't show this
    if (nationality === 0) return '';
    
    // Find nationality in loaded data
    const foundNationality = nationalities.find(nat => nat.id == nationality);
    if (foundNationality) {
      return foundNationality.name;
    }
    
    return `Nationality ${nationality}`;
  };


  const totalPages = Math.ceil(totalPatients / itemsPerPage)

  return (
    <div className="min-h-screen bg-muted">
      {/* Minimalistic Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Infant Patients</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalPatients.toLocaleString()} {totalPatients === 1 ? 'patient' : 'patients'} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={loadPatients} 
                variant="outline" 
                size="sm" 
                disabled={loading}
                className="h-9"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={onNewPatient} 
                size="sm"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card px-4 sm:px-6 py-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient ID, ART number, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
                {isMultiSite && (
                  <Select value={userSelectedSite?.code || 'all'} onValueChange={handleSiteChange}>
                    <SelectTrigger className="w-48 h-9 text-sm">
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
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Date Range Filter */}
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Dead">Dead</SelectItem>
                    <SelectItem value="Transferred Out">Transferred Out</SelectItem>
                  </SelectContent>
                </Select>

                {/* Age Range Filter */}
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="0-6">0-6 months</SelectItem>
                    <SelectItem value="6-12">6-12 months</SelectItem>
                    <SelectItem value="12-18">12-18 months</SelectItem>
                    <SelectItem value="18-24">18-24 months</SelectItem>
                  </SelectContent>
                </Select>

                {/* Nationality Filter */}
                <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Nationalities</SelectItem>
                    {availableNationalities.map((nationality) => (
                      <SelectItem key={nationality.id} value={nationality.id.toString()}>
                        {nationality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDateRange('all')
                    setStatusFilter('all')
                    setAgeRange('all')
                    setNationalityFilter('all')
                  }}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Patient List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <Card className="border border-border bg-card">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search or filters' : 'No infant patients registered yet'}
              </p>
              <Button onClick={onNewPatient} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {patients.map((patient, index) => (
              <Card 
                key={`${patient.clinicId}-${patient.site_code || patient.siteName || index}`} 
                className="border border-border bg-card hover:border-border transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          {patient.clinicId || 'N/A'}
                        </h3>
                        {patient.artNumber && (
                          <span className="text-xs text-muted-foreground">ART: {patient.artNumber}</span>
                        )}
                        <Badge 
                          variant={patient.patientStatus === 'Active' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {patient.patientStatus || 'Active'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Site: <span className="font-medium text-foreground">{patient.siteName || 'N/A'}</span></span>
                        <span>Age: <span className="font-medium text-foreground">{getAgeDisplay(patient)}</span></span>
                        {patient.sex && (
                          <span>Sex: <span className="font-medium text-foreground">{patient.sex}</span></span>
                        )}
                      </div>

                      {(patient.nationality || patient.guardian || patient.deliveryStatus) && (
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          {patient.nationality !== null && patient.nationality !== undefined && patient.nationality !== '' && patient.nationality !== -1 && patient.nationality !== 0 && getNationalityLabel(patient.nationality) && (
                            <span className="px-2 py-1 bg-muted text-foreground rounded">
                              {getNationalityLabel(patient.nationality)}
                            </span>
                          )}
                          {patient.guardian && patient.guardian !== '' && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                              Guardian: {patient.guardian}
                            </span>
                          )}
                          {patient.deliveryStatus && patient.deliveryStatus !== '' && (
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">
                              Delivery: {patient.deliveryStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectPatient(patient)}
                        className="h-8 text-xs"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages} ({totalPatients.toLocaleString()} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientList