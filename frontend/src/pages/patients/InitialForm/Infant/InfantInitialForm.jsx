import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RotateCcw, Trash2 } from "lucide-react"
import { useSite } from "../../../../contexts/SiteContext"
import PatientList from '../../../../features/patients/infant/components/components/PatientList'
import PatientInformation from '../../../../features/patients/infant/components/components/PatientInformation'
import MedicalTreatmentHistory from '../../../../features/patients/infant/components/components/MedicalTreatmentHistory'
import api from "../../../../services/api" 

function InfantInitialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedSite } = useSite()
  
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('list')
  
  // Load patients list function
  const loadPatientsList = () => {
    // This function would typically refresh the patient list
    // For now, we'll just log that it was called
    console.log('Loading patients list...')
  }
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    clinicId: '',
    dateFirstVisit: '',
    dateOfBirth: '',
    sex: -1,
    addGuardian: '',
    group: '',
    
    // Address Information
    house: '',
    street: '',
    village: '',
    commune: '',
    district: '',
    province: '',
    
    // Contact Information
    nameContact: '',
    addressContact: '',
    phone: '',
    
    // Family Information
    fAge: '',
    fHIV: -1,
    fStatus: -1,
    mAge: '',
    mClinicId: '',
    mArt: -1,
    hospitalName: '',
    mStatus: -1,
    
    // Delivery Information
    catPlaceDelivery: -1,
    placeDelivery: '',
    pmtct: -1,
    dateDelivery: '',
    deliveryStatus: -1,
    lenBaby: '',
    wBaby: '',
    
    // HIV Information
    knownHIV: -1,
    received: -1,
    syrup: -1,
    cotrim: -1,
    offIn: -1,
    siteName: '',
    hivTest: -1,
    mHIV: -1,
    mLastVl: '',
    dateMLastVl: '',
    eoClinicId: ''
  })
  
  // Treatment history state
  const [treatmentHistory, setTreatmentHistory] = useState({
    drugTreatments: [{
      drugDetails: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      remarks: ''
    }]
  })
  
  // Dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    sites: [],
    vcctSites: [],
    provinces: [],
    hospitals: [],
    drugs: [],
    clinics: [],
    reasons: [],
    allergies: [],
    nationalities: [],
    targetGroups: [],
    drugTreatments: []
  })

  useEffect(() => {
    console.log('InfantInitialForm useEffect triggered', { id, selectedSite })
    if (selectedSite) {
      loadDropdownData()
    }
    
    if (id) {
      selectPatient({ clinicId: id })
    }
  }, [id, selectedSite])

  const selectPatient = async (patient) => {
    try {
      setLoading(true)
      // Get site code from selectedSite, pass as query parameter
      const siteCode = selectedSite?.code || null
      const siteParam = siteCode ? `?site=${siteCode}` : ''
      const response = await api.get(`/apiv1/patients/infant/${patient.clinicId}${siteParam}`)
      const data = response.data
      
      setFormData({
        // Basic Information
        clinicId: data.clinicId || '',
        dateFirstVisit: data.dateFirstVisit || '',
        dateOfBirth: data.dateOfBirth || '',
        sex: data.sex !== null && data.sex !== undefined ? data.sex : -1,
        addGuardian: data.addGuardian || '',
        group: data.group || '',
        
        // Address Information
        house: data.house || '',
        street: data.street || '',
        village: data.village || '',
        commune: data.commune || '',
        district: data.district || '',
        province: data.province || '',
        
        // Contact Information
        nameContact: data.nameContact || '',
        addressContact: data.addressContact || '',
        phone: data.phone || '',
        
        // Family Information
        fAge: data.fAge || '',
        fHIV: data.fHIV !== null && data.fHIV !== undefined ? data.fHIV : -1,
        fStatus: data.fStatus !== null && data.fStatus !== undefined ? data.fStatus : -1,
        mAge: data.mAge || '',
        mClinicId: data.mClinicId || '',
        mArt: data.mArt !== null && data.mArt !== undefined ? data.mArt : -1,
        hospitalName: data.hospitalName || '',
        mStatus: data.mStatus !== null && data.mStatus !== undefined ? data.mStatus : -1,
        
        // Delivery Information
        catPlaceDelivery: data.catPlaceDelivery !== null && data.catPlaceDelivery !== undefined ? data.catPlaceDelivery : -1,
        placeDelivery: data.placeDelivery || '',
        pmtct: data.pmtct !== null && data.pmtct !== undefined ? data.pmtct : -1,
        dateDelivery: data.dateDelivery || '',
        deliveryStatus: data.deliveryStatus !== null && data.deliveryStatus !== undefined ? data.deliveryStatus : -1,
        lenBaby: data.lenBaby || '',
        wBaby: data.wBaby || '',
        
        // HIV Information
        knownHIV: data.knownHIV !== null && data.knownHIV !== undefined ? data.knownHIV : -1,
        received: data.received !== null && data.received !== undefined ? data.received : -1,
        syrup: data.syrup !== null && data.syrup !== undefined ? data.syrup : -1,
        cotrim: data.cotrim !== null && data.cotrim !== undefined ? data.cotrim : -1,
        offIn: data.offIn !== null && data.offIn !== undefined ? data.offIn : -1,
        siteName: data.siteName || '',
        hivTest: data.hivTest !== null && data.hivTest !== undefined ? data.hivTest : -1,
        mHIV: data.mHIV !== null && data.mHIV !== undefined ? data.mHIV : -1,
        mLastVl: data.mLastVl || '',
        dateMLastVl: data.dateMLastVl || '',
        eoClinicId: data.eoClinicId || ''
      })
      
      setSelectedPatient(patient)
      setActiveTab('information')
      setError('')
    } catch (error) {
      console.error('Error loading patient:', error)
      if (error.response?.status === 404) {
        setError('Patient not found')
      } else if (error.response?.status === 401) {
        setError('Unauthorized access')
      } else {
        setError('Error loading patient data')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadDropdownData = async () => {
    try {
      // Get site code from selectedSite, fallback to null if not available
      const siteCode = selectedSite?.code || null
      const siteParam = siteCode ? { params: { site: siteCode } } : {}
      
      const [sitesRes, vcctSitesRes, provincesRes, hospitalsRes, drugsRes, clinicsRes, reasonsRes, allergiesRes, nationalitiesRes, targetGroupsRes, drugTreatmentsRes] = await Promise.all([
        api.get('/apiv1/lookups/sites', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/vcct-sites', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/provinces', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/hospitals', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/drugs', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/clinics', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/reasons', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/allergies', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/nationalities', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/target-groups', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/drug-treatments', siteParam).catch(() => ({ data: [] }))
      ])
      
      setDropdownOptions({
        sites: Array.isArray(sitesRes.data) ? sitesRes.data : [],
        vcctSites: Array.isArray(vcctSitesRes.data) ? vcctSitesRes.data : [],
        provinces: Array.isArray(provincesRes.data) ? provincesRes.data : [],
        hospitals: Array.isArray(hospitalsRes.data) ? hospitalsRes.data : [],
        drugs: Array.isArray(drugsRes.data) ? drugsRes.data : [],
        clinics: Array.isArray(clinicsRes.data) ? clinicsRes.data : [],
        reasons: Array.isArray(reasonsRes.data) ? reasonsRes.data : [],
        allergies: Array.isArray(allergiesRes.data) ? allergiesRes.data : [],
        nationalities: Array.isArray(nationalitiesRes.data) ? nationalitiesRes.data : [],
        targetGroups: Array.isArray(targetGroupsRes.data) ? targetGroupsRes.data : [],
        drugTreatments: Array.isArray(drugTreatmentsRes.data) ? drugTreatmentsRes.data : []
      })
    } catch (error) {
      console.error('Error loading dropdown data:', error)
      // Set empty arrays as fallback
      setDropdownOptions({
        sites: [],
        vcctSites: [],
        provinces: [],
        hospitals: [],
        drugs: [],
        clinics: [],
        reasons: [],
        allergies: [],
        nationalities: [],
        targetGroups: [],
        drugTreatments: []
      })
    }
  }

  const handleInputChange = (field, value) => {
    // Convert "none" from dropdowns to appropriate values
    if (value === "none") {
      if (field === 'sex' || field === 'fHIV' || field === 'fStatus' || field === 'mArt' || field === 'mStatus' || 
          field === 'catPlaceDelivery' || field === 'pmtct' || field === 'deliveryStatus' || field === 'knownHIV' || 
          field === 'received' || field === 'syrup' || field === 'cotrim' || field === 'offIn' || field === 'hivTest' || field === 'mHIV') {
        value = -1
      } else {
        value = ""
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validation
      if (!formData.dateOfBirth) {
        setError('Date of Birth is required')
        return
      }
      
      if (formData.sex === -1) {
        setError('Sex is required')
        return
      }
      
      if (!formData.clinicId) {
        setError('Clinic ID is required')
        return
      }
      
      const payload = {
        ...formData,
        sex: parseInt(formData.sex),
        fHIV: parseInt(formData.fHIV),
        fStatus: parseInt(formData.fStatus),
        mArt: parseInt(formData.mArt),
        mStatus: parseInt(formData.mStatus),
        catPlaceDelivery: parseInt(formData.catPlaceDelivery),
        pmtct: parseInt(formData.pmtct),
        deliveryStatus: parseInt(formData.deliveryStatus),
        knownHIV: parseInt(formData.knownHIV),
        received: parseInt(formData.received),
        syrup: parseInt(formData.syrup),
        cotrim: parseInt(formData.cotrim),
        offIn: parseInt(formData.offIn),
        hivTest: parseInt(formData.hivTest),
        mHIV: parseInt(formData.mHIV)
      }
      
      if (id) {
        await api.put(`/apiv1/patients/infant/${id}`, payload)
      } else {
        await api.post('/apiv1/patients/infant', payload)
      }
      
      await loadPatientsList()
      setSelectedPatient(null)
      setFormData({
        clinicId: '',
        dateFirstVisit: '',
        dateOfBirth: '',
        sex: -1,
        addGuardian: '',
        group: '',
        house: '',
        street: '',
        village: '',
        commune: '',
        district: '',
        province: '',
        nameContact: '',
        addressContact: '',
        phone: '',
        fAge: '',
        fHIV: -1,
        fStatus: -1,
        mAge: '',
        mClinicId: '',
        mArt: -1,
        hospitalName: '',
        mStatus: -1,
        catPlaceDelivery: -1,
        placeDelivery: '',
        pmtct: -1,
        dateDelivery: '',
        deliveryStatus: -1,
        lenBaby: '',
        wBaby: '',
        knownHIV: -1,
        received: -1,
        syrup: -1,
        cotrim: -1,
        offIn: -1,
        siteName: '',
        hivTest: -1,
        mHIV: -1,
        mLastVl: '',
        dateMLastVl: '',
        eoClinicId: ''
      })
    } catch (error) {
      console.error('Error saving patient:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('Error saving patient data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      clinicId: '',
      dateFirstVisit: '',
      dateOfBirth: '',
      sex: -1,
      addGuardian: '',
      group: '',
      house: '',
      street: '',
      village: '',
      commune: '',
      district: '',
      province: '',
      nameContact: '',
      addressContact: '',
      phone: '',
      fAge: '',
      fHIV: -1,
      fStatus: -1,
      mAge: '',
      mClinicId: '',
      mArt: -1,
      hospitalName: '',
      mStatus: -1,
      catPlaceDelivery: -1,
      placeDelivery: '',
      pmtct: -1,
      dateDelivery: '',
      deliveryStatus: -1,
      lenBaby: '',
      wBaby: '',
      knownHIV: -1,
      received: -1,
      syrup: -1,
      cotrim: -1,
      offIn: -1,
      siteName: '',
      hivTest: -1,
      mHIV: -1,
      mLastVl: '',
      dateMLastVl: '',
      eoClinicId: ''
    })
    setSelectedPatient(null)
    setError('')
  }

  const handleDelete = async () => {
    if (!id) return
    
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        setLoading(true)
        await api.delete(`/apiv1/patients/infant/${id}`)
        await loadPatientsList()
        setSelectedPatient(null)
        navigate('/patients/infant')
      } catch (error) {
        console.error('Error deleting patient:', error)
        setError('Error deleting patient')
      } finally {
        setLoading(false)
      }
    }
  }

  const backToList = () => {
    setSelectedPatient(null)
    setActiveTab('list')
    setError('')
  }

  const newPatient = () => {
    setSelectedPatient({})
    setActiveTab('information')
    setError('')
  }

  // Pagination logic - filtering is handled in PatientList component

  return (
    <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Show different layouts based on current state */}
        {!id && activeTab === 'list' ? (
          // Patient List View - Clean, no tabs, no extra headers
          <PatientList
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectPatient={selectPatient}
            onNewPatient={newPatient}
          />
        ) : (
          // Form View - Show tabs and action buttons
          <>
            {/* Minimalistic Header */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={backToList} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Infant Patient</h1>
                    <p className="text-xs text-gray-500">ការគ្រប់គ្រងអ្នកជំងឺទារក</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleClear} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Clear
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={loading} 
                    size="sm" 
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  {id && (
                    <Button 
                      onClick={handleDelete} 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Minimalistic Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-white">
                <TabsList className="h-10 bg-transparent p-0 w-auto">
                  <TabsTrigger 
                    value="information" 
                    className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Information
                  </TabsTrigger>
                  <TabsTrigger 
                    value="treatment"
                    className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Medical History
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="information" className="mt-0 pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <PatientInformation
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    dropdownOptions={dropdownOptions}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="treatment" className="mt-0 pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <MedicalTreatmentHistory
                    formData={formData}
                    setFormData={setFormData}
                    treatmentHistory={treatmentHistory}
                    setTreatmentHistory={setTreatmentHistory}
                    dropdownOptions={dropdownOptions}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
    </div>
  )
}

export default InfantInitialForm
