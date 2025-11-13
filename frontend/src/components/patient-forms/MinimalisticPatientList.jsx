import { Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert, AlertDescription, Skeleton } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import api from "../../services/api"
import { useSite } from "../../contexts/SiteContext"

/**
 * Minimalistic Patient List Component
 * Clean, simple patient list with essential functionality only
 */
function MinimalisticPatientList({
  patientType,
  apiEndpoint,
  searchTerm,
  setSearchTerm,
  selectPatient,
  onNewPatient,
  selectedSite
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
  const [targetGroups, setTargetGroups] = useState([])
  const { isMultiSite } = useSite()

  // Load lookup data
  const loadLookupData = async () => {
    try {
      const [nationalitiesRes, targetGroupsRes] = await Promise.all([
        api.get('/apiv1/lookups/nationalities'),
        api.get('/apiv1/lookups/target-groups')
      ])
      setNationalities(nationalitiesRes.data || [])
      setTargetGroups(targetGroupsRes.data || [])
    } catch (error) {
      console.error('Error loading lookup data:', error)
    }
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
      
      const response = await api.get(`${apiEndpoint}?${params.toString()}`)
      setPatients(response.data.patients || [])
      setTotalPatients(response.data.total || 0)
    } catch (error) {
      setError(`Error loading ${patientType} patients`)
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
    loadLookupData()
    loadSites()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(loadPatients, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, userSelectedSite, currentPage, itemsPerPage, selectedSite])

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

  const getTargetGroupLabel = (targetGroup) => {
    if (targetGroup === null || targetGroup === undefined || targetGroup === '') return '';
    
    // Handle special case for 0 (General Population)
    if (targetGroup === 0) return 'General Population';
    
    // First try to find in loaded target groups
    const foundGroup = targetGroups.find(tg => tg.id == targetGroup);
    if (foundGroup) {
      return foundGroup.name;
    }
    
    // Fallback to hardcoded mapping
    const targetGroupMap = {
      1: 'FEW',      // Female Entertainment Workers
      2: 'MSM',      // Men who have Sex with Men
      3: 'TG',       // Transgender
      4: 'PWUD',     // People Who Use Drugs
      5: 'PWID',     // People Who Inject Drugs
      6: 'GP',       // General Population
      7: 'MEW',      // Men Entertainment Workers
      8: 'PPW'       // Pregnant/Parenting Women
    };
    return targetGroupMap[targetGroup] || `Group ${targetGroup}`;
  };

  const getNationalityLabel = (nationality) => {
    if (nationality === null || nationality === undefined || nationality === '') return '';
    
    // Handle special case for 0 (Not Specified)
    if (nationality === 0) return 'Not Specified';
    
    // Find nationality in loaded data
    const foundNationality = nationalities.find(nat => nat.id == nationality);
    if (foundNationality) {
      return foundNationality.name;
    }
    
    return `Nationality ${nationality}`;
  };

  const totalPages = Math.ceil(totalPatients / itemsPerPage)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">{patientType} Patients</h2>
          <Badge variant="outline">{totalPatients.toLocaleString()}</Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadPatients} variant="outline" size="sm" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={onNewPatient} size="sm">
            New
          </Button>
        </div>
      </div>

      {/* Search and Site Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder={`Search ${patientType} patients...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isMultiSite && (
          <Select value={userSelectedSite?.code || 'all'} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-48">
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

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Patient List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-none animate-pulse">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-none" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search' : `No ${patientType} patients registered yet`}
          </p>
          <Button onClick={onNewPatient}>
            Add First Patient
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient, index) => (
            <div key={`${patient.clinicId}-${patient.site_code || patient.siteName || index}`} className="p-4 border rounded-none hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      Patient {patient.clinicId}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Site: {patient.siteName || 'N/A'}</span>
                    <span>ID: {patient.clinicId}</span>
                    <span>Age: {getAgeDisplay(patient)}</span>
                    {patient.artNumber && <span>ART: {patient.artNumber}</span>}
                  </div>
                  <div className="flex items-center space-x-4 text-sm mt-1">
                    <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                      patient.sex === 'Male' ? 'status-active' : 'status-warning'
                    }`}>
                      {patient.sex || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-none text-xs font-medium ${
                      patient.patientStatus === 'Active' ? 'status-active' :
                      patient.patientStatus === 'Dead' ? 'status-critical' :
                      patient.patientStatus === 'Lost' ? 'status-warning' :
                      patient.patientStatus === 'Transferred Out' ? 'status-inactive' :
                      'status-inactive'
                    }`}>
                      {patient.patientStatus || 'Unknown'}
                    </span>
                    {patient.targetGroup !== null && patient.targetGroup !== undefined && patient.targetGroup !== '' && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium viral-load-undetectable">
                        {getTargetGroupLabel(patient.targetGroup)}
                      </span>
                    )}
                    {patient.nationality !== null && patient.nationality !== undefined && patient.nationality !== '' && patient.nationality !== -1 && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium cd4-low">
                        {getNationalityLabel(patient.nationality)}
                      </span>
                    )}
                    {patient.hivViral && patient.hivViral !== '0' && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium viral-load-high">
                        VL: {patient.hivViral}
                      </span>
                    )}
                    {patient.cd4 && (
                      <span className="px-2 py-1 rounded-none text-xs font-medium cd4-high">
                        CD4: {patient.cd4}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectPatient(patient)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MinimalisticPatientList
