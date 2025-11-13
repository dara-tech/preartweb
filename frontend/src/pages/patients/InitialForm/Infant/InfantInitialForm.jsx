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
    loadDropdownData()
    
    if (id) {
      selectPatient({ clinicId: id })
    }
  }, [id])

  const selectPatient = async (patient) => {
    try {
      setLoading(true)
      const response = await api.get(`/apiv1/patients/infant/${patient.clinicId}`)
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
      const [sitesRes, vcctSitesRes, provincesRes, hospitalsRes, drugsRes, clinicsRes, reasonsRes, allergiesRes, nationalitiesRes, targetGroupsRes, drugTreatmentsRes] = await Promise.all([
        api.get('/apiv1/lookups/sites'),
        api.get('/apiv1/lookups/vcct-sites'),
        api.get('/apiv1/lookups/provinces'),
        api.get('/apiv1/lookups/hospitals'),
        api.get('/apiv1/lookups/drugs'),
        api.get('/apiv1/lookups/clinics'),
        api.get('/apiv1/lookups/reasons'),
        api.get('/apiv1/lookups/allergies'),
        api.get('/apiv1/lookups/nationalities'),
        api.get('/apiv1/lookups/target-groups'),
        api.get('/apiv1/lookups/drug-treatments')
      ])
      
      setDropdownOptions({
        sites: sitesRes.data || [],
        vcctSites: vcctSitesRes.data || [],
        provinces: provincesRes.data || [],
        hospitals: hospitalsRes.data || [],
        drugs: drugsRes.data || [],
        clinics: clinicsRes.data || [],
        reasons: reasonsRes.data || [],
        allergies: allergiesRes.data || [],
        nationalities: nationalitiesRes.data || [],
        targetGroups: targetGroupsRes.data || [],
        drugTreatments: drugTreatmentsRes.data || []
      })
    } catch (error) {
      console.error('Error loading dropdown data:', error)
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
            selectedSite={selectedSite}
          />
        ) : (
          // Form View - Show tabs and action buttons
          <>
            {/* Clean Header with action buttons - only when editing/adding */}
            <div className="bg-white border border-gray-200 rounded-none shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 order-2 sm:order-1">
                  <Button onClick={backToList} variant="outline" size="sm" className="flex-shrink-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Infant Patient Management</h1>
                    <p className="text-muted-foreground text-sm">ការគ្រប់គ្រងអ្នកជំងឺទារក</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 order-1 sm:order-2">
                  <Button onClick={handleClear} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <Button onClick={handleSave} disabled={loading} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
                  </Button>
                  {id && (
                    <Button onClick={handleDelete} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs - only when editing/adding */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information">Patient Information</TabsTrigger>
                <TabsTrigger value="treatment">Medical Treatment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="information" className="space-y-6">
                <PatientInformation
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  dropdownOptions={dropdownOptions}
                />
              </TabsContent>
              
              <TabsContent value="treatment" className="space-y-6">
                <MedicalTreatmentHistory
                  formData={formData}
                  setFormData={setFormData}
                  treatmentHistory={treatmentHistory}
                  setTreatmentHistory={setTreatmentHistory}
                  dropdownOptions={dropdownOptions}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
    </div>
  )
}

export default InfantInitialForm
