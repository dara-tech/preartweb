import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, RotateCcw, ArrowLeft } from "lucide-react"
import { useSite } from "../../../../contexts/SiteContext"
import api from "../../../../services/api"

// Import child components
import PatientList from '../../../../features/patients/adult/components/components/PatientList'
import PatientInformation from '../../../../features/patients/adult/components/components/PatientInformation'
import MedicalTreatmentHistory from '../../../../features/patients/adult/components/components/MedicalTreatmentHistory'

function AdultInitialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedSite, getSiteCode } = useSite()
  const [activeTab, setActiveTab] = useState("list")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
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

  // Form data matching VB.NET frmAdultIn fields
  const [formData, setFormData] = useState({
    // Basic Information
    clinicId: '',
    dateFirstVisit: '',
    lostReturn: false,
    typeOfReturn: -1,
    returnClinicId: '',
    oldSiteName: '',
    patientName: '',
    
    // Demographics  
    dateOfBirth: '',
    age: '',
    sex: -1, // 0=Female, 1=Male
    education: -1,
    canRead: -1,
    canWrite: -1,
    nationality: '',
    
    // HIV Testing & Referral
    referred: -1, // 0=Self, 1=Community, 2=VCCT, 3=PMTCT, 4=TB, 5=Blood Bank, 6=Other
    referredOther: '',
    dateTestHIV: '',
    vcctSite: '',
    vcctId: '',
    previousClinicId: '',
    
    // Target Group and Transfer Information
    targetGroup: -1,
    refugeeStatus: -1,
    childrenClinicId: '',
    
    // ART Information
    artNumber: '',
    dateART: '',
    transferIn: -1, // 0=No, 1=Yes
    transferFrom: '',
    transferDate: '',
    
    // TB Past Medical History
    tbPast: -1, // 0=No, 1=Yes, 2=Unknown
    tptHistory: -1, // 0=No, 1=Completed, 2=On treatment
    tptRegimen: -1, // 0=3HP, 1=6H, 2=3RH
    tptDateStart: '',
    tptDateEnd: '',
    tbType: -1, // 0=Pulmonary, 1=Extra-pulmonary
    tbResult: -1, // 0=BK+, 1=BK-
    tbDateOnset: '',
    tbTreatment: -1, // 0=Cat1, 1=Cat2, 2=Cat3, 3=Cat4, 4=Unknown
    tbDateTreatment: '',
    tbDateComplete: '',
    
    // Other Medical History
    diabetes: false,
    hypertension: false,
    abnormal: false,
    renal: false,
    anemia: false,
    liver: false,
    hepatitis: false,
    other: false,
    otherIllness: '',
    
    // Allergies
    allergy: -1,
    allergyDetails: '',
    
    // Family Information
    familyMembers: [],
    
    // Treatment History
    treatmentHistory: {
      drugTreatments: Array(6).fill().map(() => ({
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      })),
      arvMedication: -1,
      arvDrugs: ['', '', ''],
      otherTreatments: Array(8).fill().map(() => ({
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      })),
      drugReactions: Array(3).fill().map(() => ({
        drug1: '',
        reaction1: '',
        date1: '',
        drug2: '',
        reaction2: '',
        date2: ''
      })),
      hasDrugReaction: -1
    }
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
    drugTreatments: Array(6).fill().map(() => ({
      drugDetails: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      remarks: ''
    })),
    arvMedication: -1,
    arvDrugs: ['', '', ''],
    otherTreatments: Array(8).fill().map(() => ({
      drugDetails: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      remarks: ''
    })),
    drugReactions: Array(3).fill().map(() => ({
      drug1: '',
      reaction1: '',
      date1: '',
      drug2: '',
      reaction2: '',
      date2: ''
    })),
    hasDrugReaction: -1
  })

  useEffect(() => {
    console.log('AdultInitialForm useEffect triggered', { id, selectedSite })
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
      setLoading(true)
      const response = await api.get(`/apiv1/patients/adult/${clinicId}`)
      const data = response.data
      
      setFormData({
        // Basic Information
        clinicId: data.clinicId || '',
        dateFirstVisit: data.dateFirstVisit || '',
        lostReturn: data.lostReturn || false,
        typeOfReturn: data.typeOfReturn !== null && data.typeOfReturn !== undefined ? data.typeOfReturn : -1,
        returnClinicId: data.returnClinicId || '',
        oldSiteName: data.oldSiteName || '',
        
        // Demographics  
        dateOfBirth: data.dateOfBirth || '',
        age: data.age !== null && data.age !== undefined ? data.age : '',
        sex: data.sex !== null && data.sex !== undefined ? data.sex : -1,
        education: data.education !== null && data.education !== undefined ? data.education : -1,
        canRead: data.canRead !== null && data.canRead !== undefined ? data.canRead : -1,
        canWrite: data.canWrite !== null && data.canWrite !== undefined ? data.canWrite : -1,
        
        // HIV Testing & Referral
        referred: data.referred !== null && data.referred !== undefined ? data.referred : -1,
        referredOther: data.referredOther || '',
        dateTestHIV: data.dateTestHIV || '',
        vcctSite: data.vcctSite || '',
        vcctId: data.vcctId || '',
        previousClinicId: data.previousClinicId || '',
        
        // ART Information
        artNumber: data.artNumber || '',
        dateART: data.dateART || '',
        transferIn: data.transferIn !== null && data.transferIn !== undefined ? data.transferIn : -1,
        transferFrom: data.transferFrom || '',
        transferDate: data.transferDate || '',
        
        // Medical History
        tbPast: data.tbPast !== null && data.tbPast !== undefined ? data.tbPast : -1,
        tbType: data.tbType !== null && data.tbType !== undefined ? data.tbType : -1,
        tbResult: data.tbResult !== null && data.tbResult !== undefined ? data.tbResult : -1,
        tbDateOnset: data.tbDateOnset || '',
        tbTreatment: data.tbTreatment !== null && data.tbTreatment !== undefined ? data.tbTreatment : -1,
        tbDateTreatment: data.tbDateTreatment || '',
        tbResultTreatment: data.tbResultTreatment !== null && data.tbResultTreatment !== undefined ? data.tbResultTreatment : -1,
        tbDateResultTreatment: data.tbDateResultTreatment || '',
        
        // TPT Treatment
        inh: data.inh !== null && data.inh !== undefined ? data.inh : -1,
        tptDrug: data.tptDrug !== null && data.tptDrug !== undefined ? data.tptDrug : -1,
        tptDateStart: data.tptDateStart || '',
        tptDateEnd: data.tptDateEnd || '',
        
        // Other Medical History
        otherPast: data.otherPast !== null && data.otherPast !== undefined ? data.otherPast : -1,
        otherPastDetails: data.otherPastDetails || '',
        
        // Current Medications
        cotrimoxazole: data.cotrimoxazole !== null && data.cotrimoxazole !== undefined ? data.cotrimoxazole : -1,
        fluconazole: data.fluconazole !== null && data.fluconazole !== undefined ? data.fluconazole : -1,
        
        // Allergies
        allergy: data.allergy !== null && data.allergy !== undefined ? data.allergy : -1,
        allergyDetails: data.allergyDetails || ''
      })

      if (data.familyMembers) {
        setFamilyMembers(data.familyMembers)
      }

      // Set treatment history with proper structure
      if (data.arvHistory || data.allergies || data.medicalTreatments) {
        setTreatmentHistory({
          drugTreatments: data.arvHistory ? data.arvHistory.map(arv => ({
            drugDetails: arv.drugDetails || '',
            clinic: arv.clinic || '',
            startDate: arv.startDate || '',
            stopDate: arv.stopDate || '',
            remarks: arv.remarks || ''
          })) : Array(6).fill().map(() => ({
            drugDetails: '',
            clinic: '',
            startDate: '',
            stopDate: '',
            remarks: ''
          })),
          arvMedication: -1,
          arvDrugs: ['', '', ''],
          otherTreatments: Array(8).fill().map(() => ({
            drugDetails: '',
            clinic: '',
            startDate: '',
            stopDate: '',
            remarks: ''
          })),
          drugReactions: data.allergies ? data.allergies.map(allergy => ({
            drug1: allergy.drug1 || '',
            reaction1: allergy.reaction1 || '',
            date1: allergy.date1 || '',
            drug2: allergy.drug2 || '',
            reaction2: allergy.reaction2 || '',
            date2: allergy.date2 || ''
          })) : Array(3).fill().map(() => ({
            drug1: '',
            reaction1: '',
            date1: '',
            drug2: '',
            reaction2: '',
            date2: ''
          })),
          hasDrugReaction: data.allergies && data.allergies.length > 0 ? 1 : -1
        })
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
    // Handle "none" value for dropdowns - convert to empty string or -1
    let processedValue = value
    if (value === "none") {
      if (field === 'nationality' || field === 'targetGroup') {
        processedValue = -1
      } else {
        processedValue = ''
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  const handleClear = () => {
    setFormData({
      // Basic Information
      clinicId: '',
      dateFirstVisit: '',
      lostReturn: false,
      typeOfReturn: -1,
      returnClinicId: '',
      oldSiteName: '',
      patientName: '',
      
      // Demographics  
      dateOfBirth: '',
      age: '',
      sex: -1,
      education: -1,
      canRead: -1,
      canWrite: -1,
      nationality: '',
      
      // HIV Testing & Referral
      referred: -1,
      referredOther: '',
      dateTestHIV: '',
      vcctSite: '',
      vcctId: '',
      previousClinicId: '',
      
      // Target Group and Transfer Information
      targetGroup: -1,
      refugeeStatus: -1,
      childrenClinicId: '',
      
      // ART Information
      artNumber: '',
      dateART: '',
      transferIn: -1,
      transferFrom: '',
      transferDate: '',
      
      // TB Past Medical History
      tbPast: -1,
      tptHistory: -1,
      tptRegimen: -1,
      tptDateStart: '',
      tptDateEnd: '',
      tbType: -1,
      tbResult: -1,
      tbDateOnset: '',
      tbTreatment: -1,
      tbDateTreatment: '',
      tbDateComplete: '',
      
      // Other Medical History
      diabetes: false,
      hypertension: false,
      abnormal: false,
      renal: false,
      anemia: false,
      liver: false,
      hepatitis: false,
      other: false,
      otherIllness: '',
      
      // Allergies
      allergy: -1,
      allergyDetails: ''
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
      drugTreatments: Array(6).fill().map(() => ({
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      })),
      arvMedication: -1,
      arvDrugs: ['', '', ''],
      otherTreatments: Array(8).fill().map(() => ({
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      })),
      drugReactions: Array(3).fill().map(() => ({
        drug1: '',
        reaction1: '',
        date1: '',
        drug2: '',
        reaction2: '',
        date2: ''
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
      if (parseInt(formData.age) < 15 || parseInt(formData.age) > 120) {
        setError('Invalid Patient Age! Must be 15+ years for adult patients')
        return
      }
      if (formData.sex === -1) {
        setError('Please select Patient Sex!')
        return
      }

      const payload = {
        ...formData,
        familyMembers: familyMembers.filter(fm => fm.familyType.trim()),
        treatmentHistory: treatmentHistory
      }

      if (id) {
        await api.put(`/apiv1/patients/adult/${id}`, payload)
      } else {
        await api.post('/apiv1/patients/adult', payload)
      }

      handleClear()
      // Update patient in context
      if (id) {
        console.log('Patient updated:', response.data)
      } else {
        console.log('Patient added:', response.data)
      }
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
        
        await api.delete(`/apiv1/patients/adult/${id}`)
        
        // Navigate back to list and refresh
        navigate('/patients/adult')
        setActiveTab("list")
        
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting patient')
        console.error('Error deleting:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const selectPatient = (patient) => {
    navigate(`/patients/adult/${patient.clinicId}`)
    setActiveTab("form") // Switch to form tab when patient is selected
  }

  const backToList = () => {
    navigate('/patients/adult')
    setActiveTab("list")
  }

  const newPatient = () => {
    navigate('/patients/adult')
    setActiveTab("form")
    handleClear() // Clear the form for new patient
  }


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
        <div className="space-y-4">
          <PatientList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectPatient={selectPatient}
          onNewPatient={newPatient}
          selectedSite={selectedSite}
          />
        </div>
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
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">Adult Patient Management</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">ការគ្រប់គ្រងអ្នកជំងឺពេញវ័យ</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 order-1 sm:order-2">
                <Button onClick={handleClear} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                <Button onClick={handleSave} disabled={loading} size="sm" className="flex-1 sm:flex-initial">
                  <Save className="w-4 h-4 mr-2" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </Button>
                {id && (
                  <Button onClick={handleDelete} variant="destructive" size="sm" className="flex-1 sm:flex-initial">
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Delete</span>
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

export default AdultInitialForm
