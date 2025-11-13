import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, RotateCcw, Search, ArrowLeft } from "lucide-react"
import { useSite } from "../../../../contexts/SiteContext"
import api from "../../../../services/api"

// Import child components
import PatientList from '../../../../features/patients/child/components/components/PatientList'
import PatientInformation from '../../../../features/patients/child/components/components/PatientInformation'
import MedicalTreatmentHistory from '../../../../features/patients/child/components/components/MedicalTreatmentHistory'

function ChildInitialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedSite } = useSite()
  const [activeTab, setActiveTab] = useState("list")
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [dropdownOptions, setDropdownOptions] = useState({
    sites: [],
    vcctSites: [],
    drugs: [],
    clinics: [],
    reasons: [],
    allergyTypes: [],
    allergyDrugs: [],
    nationalities: [],
    targetGroups: []
  })
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false)

  // Load patients list function
  const loadPatientsList = () => {
    // This function would typically refresh the patient list
    // For now, we'll just log that it was called
    console.log('Loading patients list...')
  }

  // Form data matching VB.NET frmChildIn fields
  const [formData, setFormData] = useState({
    clinicId: '',
    patientName: '',
    dateFirstVisit: '',
    lClinicId: '',
    clinicIdOld: '',
    serviceSiteName: '',
    dateOfBirth: '',
    age: '',
    sex: -1,
    nationality: 'none',
    referred: -1,
    otherReferred: '',
    eClinicId: '',
    dateTest: '',
    typeTest: -1,
    vcctCode: 'none',
    vcctId: '',
    offIn: -1,
    siteName: '',
    dateART: '',
    artNumber: '',
    feeding: -1,
    tbPast: -1,
    typeTB: -1,
    resultTB: -1,
    dateOnset: '',
    tbTreat: -1,
    dateTreat: '',
    resultTreat: -1,
    dateResultTreat: '',
    inh: -1,
    tptDrug: -1,
    dateStartTPT: '',
    dateEndTPT: '',
    otherPast: -1,
    cotrim: -1,
    fluco: -1,
    allergy: -1,
    siteNameOld: '',
    reLost: false
  })

  // Family members array
  const [familyMembers, setFamilyMembers] = useState([])
  
  // New family member form state
  const [newFamilyMember, setNewFamilyMember] = useState({
    familyType: '',
    age: '',
    hivStatus: '',
    status: '',
    startingArt: null,
    pregnantStatus: null,
    siteName: '',
    tbHistory: ''
  })

  // Treatment history data
  const [treatmentHistory, setTreatmentHistory] = useState({
    drugTreatments: Array(7).fill().map(() => ({
      drugDetails: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      remarks: ''
    })),
    arvMedication: -1,
    arvDrugs: ['', '', ''],
    cotrimoxazole: -1,
    fluconazole: -1,
    drugReactions: Array(3).fill().map(() => ({
      drug1: '',
      reaction1: '',
      drug2: '',
      reaction2: ''
    })),
    hasDrugReaction: -1
  })

  useEffect(() => {
    loadDropdownData()
    if (id) {
      loadPatientData(id)
      setActiveTab("form")
    }
  }, [id])

  const loadDropdownData = async () => {
    try {
      const [sites, vcctSites, drugs, clinics, reasons, allergies, nationalities, targetGroups, provinces, hospitals, drugTreatments] = await Promise.all([
        api.get('/apiv1/lookups/sites'),
        api.get('/apiv1/lookups/vcct-sites'),
        api.get('/apiv1/lookups/drugs'),
        api.get('/apiv1/lookups/clinics'),
        api.get('/apiv1/lookups/reasons'),
        api.get('/apiv1/lookups/allergies'),
        api.get('/apiv1/lookups/nationalities'),
        api.get('/apiv1/lookups/target-groups'),
        api.get('/apiv1/lookups/provinces'),
        api.get('/apiv1/lookups/hospitals'),
        api.get('/apiv1/lookups/drug-treatments')
      ])

      setDropdownOptions({
        sites: sites.data || [],
        vcctSites: vcctSites.data || [],
        drugs: drugs.data || [],
        clinics: clinics.data || [],
        reasons: reasons.data || [],
        allergies: allergies.data || [],
        nationalities: nationalities.data || [],
        targetGroups: targetGroups.data || [],
        provinces: provinces.data || [],
        hospitals: hospitals.data || [],
        drugTreatments: drugTreatments.data || []
      })
      setDropdownsLoaded(true)
    } catch (error) {
      console.error('Error loading dropdown data:', error)
      setDropdownsLoaded(true)
    }
  }

  const loadPatientData = async (clinicId) => {
    try {
      const response = await api.get(`/apiv1/patients/child/${clinicId}`)
      const data = response.data
      
      
      setFormData({
        clinicId: data.clinicId || '',
        patientName: data.patientName || '',
        dateFirstVisit: data.dateFirstVisit || '',
        lClinicId: data.lClinicId || '',
        clinicIdOld: data.clinicIdOld || '',
        serviceSiteName: data.serviceSiteName || '',
        dateOfBirth: data.dateOfBirth || '',
        age: data.age !== null && data.age !== undefined ? data.age : '',
        sex: data.sex !== null && data.sex !== undefined ? data.sex : -1,
        nationality: data.nationality?.toString() || 'none',
        referred: data.referred !== null && data.referred !== undefined ? data.referred : -1,
        otherReferred: data.otherReferred || '',
        eClinicId: data.eClinicId || '',
        dateTest: data.dateTest || '',
        typeTest: data.typeTest !== null && data.typeTest !== undefined ? data.typeTest : -1,
        vcctCode: data.vcctCode || 'none',
        vcctId: data.vcctId || '',
        offIn: data.offIn !== null && data.offIn !== undefined ? data.offIn : -1,
        siteName: data.siteName || '',
        dateART: data.dateART || '',
        artNumber: data.artNumber || '',
        feeding: data.feeding !== null && data.feeding !== undefined ? data.feeding : -1,
        tbPast: data.tbPast !== null && data.tbPast !== undefined ? data.tbPast : -1,
        typeTB: data.typeTB !== null && data.typeTB !== undefined ? data.typeTB : -1,
        resultTB: data.resultTB !== null && data.resultTB !== undefined ? data.resultTB : -1,
        dateOnset: data.dateOnset || '',
        tbTreat: data.tbTreat !== null && data.tbTreat !== undefined ? data.tbTreat : -1,
        dateTreat: data.dateTreat || '',
        resultTreat: data.resultTreat !== null && data.resultTreat !== undefined ? data.resultTreat : -1,
        dateResultTreat: data.dateResultTreat || '',
        inh: data.inh !== null && data.inh !== undefined ? data.inh : -1,
        tptDrug: data.tptDrug !== null && data.tptDrug !== undefined ? data.tptDrug : -1,
        dateStartTPT: data.dateStartTPT || '',
        dateEndTPT: data.dateEndTPT || '',
        otherPast: data.otherPast !== null && data.otherPast !== undefined ? data.otherPast : -1,
        cotrim: data.cotrim !== null && data.cotrim !== undefined ? data.cotrim : -1,
        fluco: data.fluco !== null && data.fluco !== undefined ? data.fluco : -1,
        allergy: data.allergy !== null && data.allergy !== undefined ? data.allergy : -1,
        siteNameOld: data.siteNameOld || '',
        reLost: data.reLost || false
      })

      if (data.familyMembers) {
        setFamilyMembers(data.familyMembers)
      }

      if (data.treatmentHistory) {
        setTreatmentHistory(data.treatmentHistory)
      }

      setError('')
    } catch (error) {
      setError('Error loading patient data')
      console.error('Error loading patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClear = () => {
    setFormData({
      clinicId: '',
      patientName: '',
      dateFirstVisit: '',
      lClinicId: '',
      clinicIdOld: '',
      serviceSiteName: '',
      dateOfBirth: '',
      age: '',
      sex: -1,
      nationality: 'none',
      referred: -1,
      otherReferred: '',
      eClinicId: '',
      dateTest: '',
      typeTest: -1,
      vcctCode: 'none',
      vcctId: '',
      offIn: -1,
      siteName: '',
      dateART: '',
      artNumber: '',
      feeding: -1,
      tbPast: -1,
      typeTB: -1,
      resultTB: -1,
      dateOnset: '',
      tbTreat: -1,
      dateTreat: '',
      resultTreat: -1,
      dateResultTreat: '',
      inh: -1,
      tptDrug: -1,
      dateStartTPT: '',
      dateEndTPT: '',
      otherPast: -1,
      cotrim: -1,
      fluco: -1,
      allergy: -1,
      siteNameOld: '',
      reLost: false
    })
    setFamilyMembers([])
    setNewFamilyMember({
      familyType: '',
      age: '',
      hivStatus: '',
      status: '',
      startingArt: null,
      pregnantStatus: null,
      siteName: '',
      tbHistory: ''
    })
    setTreatmentHistory({
      drugTreatments: Array(7).fill().map(() => ({
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      })),
      arvMedication: -1,
      arvDrugs: ['', '', ''],
      cotrimoxazole: -1,
      fluconazole: -1,
      drugReactions: Array(3).fill().map(() => ({
        drug1: '',
        reaction1: '',
        drug2: '',
        reaction2: ''
      })),
      hasDrugReaction: -1
    })
    setError('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validation
      if (!formData.clinicId.trim()) {
        setError('Please input Clinic ID')
        return
      }
      if (!formData.dateFirstVisit) {
        setError('Please input Date First Visit')
        return
      }
      if (parseInt(formData.age) < 0 || parseInt(formData.age) > 14) {
        setError('Invalid Patient Age! Must be 0-14 years for child patients')
        return
      }
      if (formData.sex === -1) {
        setError('Please select Patient Sex!')
        return
      }
      if (formData.offIn === 1 && !formData.artNumber.trim()) {
        setError('Please input ART Number for transfer in patients!')
        return
      }

      const payload = {
        ...formData,
        familyMembers: familyMembers.filter(fm => fm.familyType.trim()),
        nationality: formData.nationality === 'none' ? 0 : parseInt(formData.nationality),
        treatmentHistory: treatmentHistory
      }

      if (id) {
        await api.put(`/apiv1/patients/child/${id}`, payload)
      } else {
        await api.post('/apiv1/patients/child', payload)
      }

      handleClear()
      loadPatientsList()
      setActiveTab("list")

    } catch (error) {
      setError(error.response?.data?.message || 'Error saving patient data')
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        setLoading(true)
        setError('')
        
        await api.delete(`/apiv1/patients/child/${id}`)
        
        // Navigate back to list and refresh
        navigate('/patients/child')
        setActiveTab("list")
        loadPatientsList()
        
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting patient')
        console.error('Error deleting:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const selectPatient = (patient) => {
    navigate(`/patients/child/${patient.clinicId}`)
    setActiveTab("form") // Switch to form tab when patient is selected
  }

  const backToList = () => {
    navigate('/patients/child')
    setActiveTab("list")
  }

  const newPatient = () => {
    navigate('/patients/child')
    setActiveTab("form")
    handleClear() // Clear the form for new patient
  }

  // Pagination logic - filtering is handled in PatientList component


  return (
    <div className="space-y-6">
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
          <div className="bg-white border border-gray-200 rounded-none shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button onClick={backToList} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Child Patient Management</h1>
                  <p className="text-muted-foreground text-sm">ការគ្រប់គ្រងអ្នកជំងឺកុមារ</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleClear} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                {id && (
                  <Button onClick={handleDelete} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs - only when editing/adding */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="form">Patient Information</TabsTrigger>
              <TabsTrigger value="medical">Medical & Treatment History</TabsTrigger>
            </TabsList>

            {/* Patient Information Tab */}
            <TabsContent value="form" className="space-y-8">
              <PatientInformation
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                dropdownOptions={dropdownOptions}
                familyMembers={familyMembers}
                setFamilyMembers={setFamilyMembers}
                newFamilyMember={newFamilyMember}
                setNewFamilyMember={setNewFamilyMember}
              />
            </TabsContent>

            {/* Medical & Treatment History Tab */}
            <TabsContent value="medical" className="space-y-6">
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

export default ChildInitialForm
    