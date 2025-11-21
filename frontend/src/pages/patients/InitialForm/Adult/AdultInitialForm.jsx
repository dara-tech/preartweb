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

  // Form data matching VB.NET frmAdultIn fields - Complete structure
  const [formData, setFormData] = useState({
    // Basic Information
    clinicId: '',
    dateFirstVisit: '',
    lostReturn: false,
    typeOfReturn: -1, // 0=In, 1=Out
    returnClinicId: '',
    oldSiteName: '',
    
    // Demographics  
    dateOfBirth: '',
    age: '',
    sex: -1, // 0=Female, 1=Male
    education: -1,
    canRead: -1,
    canWrite: -1,
    nationality: '',
    targetGroup: '',
    
    // HIV Testing & Referral
    referred: -1, // 0=Self, 1=Community, 2=VCCT, 3=PMTCT, 4=TB, 5=Blood Bank, 6=Other
    referredOther: '',
    dateTestHIV: '',
    vcctSite: '',
    vcctId: '',
    previousClinicId: '',
    
    // Transfer In Information
    transferIn: -1, // 0=No, 1=Yes
    transferFrom: '',
    dateStartART: '',
    artNumber: '',
    
    // TB Past Medical History
    tbPast: -1, // 0=No, 1=Yes
    tptHistory: -1, // 0=No, 1=Completed, 2=On treatment
    tptRegimen: -1, // 0=3HP, 1=6H, 2=3RH
    tptDateStart: '',
    tptDateEnd: '',
    tbType: -1, // 0=Pulmonary, 1=Extra-pulmonary
    tbResultTest: -1, // 0=BK+, 1=BK-
    tbDateOnset: '',
    tbTreatmentCategory: -1, // 0=Cat1, 1=Cat2, 2=Cat3, 3=Cat4, 4=Unknown
    tbDateTreatment: '',
    tbResultTreatment: -1,
    tbDateComplete: '',
    
    // ARV History
    arvHistory: -1, // 0=No, 1=Yes
    
    // Other Medical History - Checkboxes
    diabetes: false,
    hypertension: false,
    abnormal: false,
    renal: false,
    anemia: false,
    liver: false,
    hepatitis: false,
    other: false,
    
    // Allergies
    allergy: -1, // 0=No, 1=Yes
    
    // Refugee Status
    refugeeStatus: -1,
    refugeeART: '',
    refugeeSite: ''
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

  // ARV Treatment History - Up to 6 ARV drugs
  const [arvTreatmentHistory, setArvTreatmentHistory] = useState(
    Array(6).fill().map(() => ({
      drug: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      note: ''
    }))
  )
  
  // Other Medical Treatments - One per condition
  const [otherMedicalTreatments, setOtherMedicalTreatments] = useState({
    diabetes: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    hypertension: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    abnormal: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    renal: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    anemia: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    liver: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    hepatitis: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
    other: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' }
  })
  
  // Allergies - Up to 6 entries
  const [allergies, setAllergies] = useState(
    Array(6).fill().map(() => ({
      drug: '',
      reaction: '',
      date: ''
    }))
  )

  useEffect(() => {
    console.log('AdultInitialForm useEffect triggered', { id, selectedSite })
    if (selectedSite) {
      loadDropdownData()
    }
    if (id) {
      loadPatientData(id)
      setActiveTab("form")
    }
  }, [id, selectedSite])

  const loadDropdownData = async () => {
    try {
      // Get site code from selectedSite, fallback to null if not available
      const siteCode = selectedSite?.code || null
      const siteParam = siteCode ? { params: { site: siteCode } } : {}
      
      const requests = [
        api.get('/apiv1/lookups/sites', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/vcct-sites', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/drugs', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/clinics', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/reasons', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/allergies', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/nationalities', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/target-groups', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/provinces', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/hospitals', siteParam).catch(() => ({ data: [] })),
        api.get('/apiv1/lookups/drug-treatments', siteParam).catch(() => ({ data: [] }))
      ]

      const [sites, vcctSites, drugs, clinics, reasons, allergies, nationalities, targetGroups, provinces, hospitals, drugTreatments] = await Promise.all(requests)

      setDropdownOptions({
        sites: Array.isArray(sites.data) ? sites.data : [],
        vcctSites: Array.isArray(vcctSites.data) ? vcctSites.data : [],
        drugs: Array.isArray(drugs.data) ? drugs.data : [],
        clinics: Array.isArray(clinics.data) ? clinics.data : [],
        reasons: Array.isArray(reasons.data) ? reasons.data : [],
        allergies: Array.isArray(allergies.data) ? allergies.data : [],
        nationalities: Array.isArray(nationalities.data) ? nationalities.data : [],
        targetGroups: Array.isArray(targetGroups.data) ? targetGroups.data : [],
        provinces: Array.isArray(provinces.data) ? provinces.data : [],
        hospitals: Array.isArray(hospitals.data) ? hospitals.data : [],
        drugTreatments: Array.isArray(drugTreatments.data) ? drugTreatments.data : []
      })
      
      setDropdownsLoaded(true)
    } catch (error) {
      console.error('Error loading dropdown data:', error)
      // Set empty arrays as fallback
      setDropdownOptions({
        sites: [],
        vcctSites: [],
        drugs: [],
        clinics: [],
        reasons: [],
        allergies: [],
        nationalities: [],
        targetGroups: [],
        provinces: [],
        hospitals: [],
        drugTreatments: []
      })
      setDropdownsLoaded(true)
    }
  }


  const loadPatientData = async (clinicId) => {
    try {
      setLoading(true)
      // Get site code from selectedSite, pass as query parameter
      const siteCode = selectedSite?.code || null
      const siteParam = siteCode ? `?site=${siteCode}` : ''
      const response = await api.get(`/apiv1/patients/adult/${clinicId}${siteParam}`)
      const data = response.data
      
      setFormData({
        clinicId: data.clinicId || '',
        dateFirstVisit: data.dateFirstVisit || '',
        lostReturn: data.lostReturn || false,
        typeOfReturn: data.typeOfReturn !== null && data.typeOfReturn !== undefined ? data.typeOfReturn : -1,
        returnClinicId: data.returnClinicId || data.lClinicId || '',
        oldSiteName: data.oldSiteName || data.siteNameOld || '',
        dateOfBirth: data.dateOfBirth || data.daBirth || '',
        age: data.age !== null && data.age !== undefined ? data.age.toString() : '',
        sex: data.sex !== null && data.sex !== undefined ? data.sex : -1,
        education: data.education !== null && data.education !== undefined ? data.education : -1,
        canRead: data.canRead !== null && data.canRead !== undefined ? data.canRead : -1,
        canWrite: data.canWrite !== null && data.canWrite !== undefined ? data.canWrite : -1,
        nationality: data.nationality || '',
        targetGroup: data.targetGroup || '',
        referred: data.referred !== null && data.referred !== undefined ? data.referred : -1,
        referredOther: data.referredOther || data.orefferred || '',
        dateTestHIV: data.dateTestHIV || data.daHIV || '',
        vcctSite: data.vcctSite || data.vcctcode || '',
        vcctId: data.vcctId || data.vcctID || '',
        previousClinicId: data.previousClinicId || data.pclinicID || '',
        transferIn: data.transferIn !== null && data.transferIn !== undefined ? data.transferIn : -1,
        transferFrom: data.transferFrom || data.siteName || '',
        dateStartART: data.dateStartART || data.daART || '',
        artNumber: data.artNumber || data.artnum || '',
        tbPast: data.tbPast !== null && data.tbPast !== undefined ? data.tbPast : -1,
        tptHistory: data.tptHistory !== null && data.tptHistory !== undefined ? data.tptHistory : (data.tpt !== null && data.tpt !== undefined ? data.tpt : -1),
        tptRegimen: data.tptRegimen !== null && data.tptRegimen !== undefined ? data.tptRegimen : (data.tptDrug !== null && data.tptDrug !== undefined ? data.tptDrug : -1),
        tptDateStart: data.tptDateStart || data.daStartTPT || '',
        tptDateEnd: data.tptDateEnd || data.daEndTPT || '',
        tbType: data.tbType !== null && data.tbType !== undefined ? data.tbType : -1,
        tbResultTest: data.tbResultTest !== null && data.tbResultTest !== undefined ? data.tbResultTest : (data.resultTB !== null && data.resultTB !== undefined ? data.resultTB : -1),
        tbDateOnset: data.tbDateOnset || data.daonset || '',
        tbTreatmentCategory: data.tbTreatmentCategory !== null && data.tbTreatmentCategory !== undefined ? data.tbTreatmentCategory : (data.tbtreat !== null && data.tbtreat !== undefined ? data.tbtreat : -1),
        tbDateTreatment: data.tbDateTreatment || data.datreat || '',
        tbResultTreatment: data.tbResultTreatment !== null && data.tbResultTreatment !== undefined ? data.tbResultTreatment : (data.resultTreat !== null && data.resultTreat !== undefined ? data.resultTreat : -1),
        tbDateComplete: data.tbDateComplete || data.daResultTreat || '',
        arvHistory: data.arvHistory !== null && data.arvHistory !== undefined ? data.arvHistory : (data.arVTreatHis !== null && data.arVTreatHis !== undefined ? data.arVTreatHis : -1),
        diabetes: data.diabetes || false,
        hypertension: data.hypertension || data.hyper || false,
        abnormal: data.abnormal || false,
        renal: data.renal || false,
        anemia: data.anemia || false,
        liver: data.liver || false,
        hepatitis: data.hepatitis || data.hepBC || false,
        other: data.other || data.medOther || false,
        allergy: data.allergy !== null && data.allergy !== undefined ? data.allergy : -1,
        refugeeStatus: data.refugeeStatus !== null && data.refugeeStatus !== undefined ? data.refugeeStatus : (data.refugstatus !== null && data.refugstatus !== undefined ? data.refugstatus : -1),
        refugeeART: data.refugeeART || data.refugART || '',
        refugeeSite: data.refugeeSite || data.refugsite || ''
      })

      // Load ARV treatment history
      if (data.arvTreatmentHistory && Array.isArray(data.arvTreatmentHistory)) {
        const arvHistory = [...data.arvTreatmentHistory]
        while (arvHistory.length < 6) {
          arvHistory.push({ drug: '', clinic: '', startDate: '', stopDate: '', note: '' })
        }
        setArvTreatmentHistory(arvHistory.slice(0, 6).map(arv => ({
          drug: arv.drug || arv.drugDetails || '',
          clinic: arv.clinic || '',
          startDate: arv.startDate || '',
          stopDate: arv.stopDate || '',
          note: arv.note || arv.remarks || ''
        })))
      }

      // Load other medical treatments
      if (data.otherMedicalTreatments) {
        setOtherMedicalTreatments({
          diabetes: data.otherMedicalTreatments.diabetes || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          hypertension: data.otherMedicalTreatments.hypertension || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          abnormal: data.otherMedicalTreatments.abnormal || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          renal: data.otherMedicalTreatments.renal || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          anemia: data.otherMedicalTreatments.anemia || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          liver: data.otherMedicalTreatments.liver || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          hepatitis: data.otherMedicalTreatments.hepatitis || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
          other: data.otherMedicalTreatments.other || { drug: '', clinic: '', startDate: '', stopDate: '', note: '' }
        })
      }

      // Load allergies
      if (data.allergies && Array.isArray(data.allergies)) {
        const allergyList = [...data.allergies]
        while (allergyList.length < 6) {
          allergyList.push({ drug: '', reaction: '', date: '' })
        }
        setAllergies(allergyList.slice(0, 6).map(a => ({
          drug: a.drug || a.drug1 || '',
          reaction: a.reaction || a.reaction1 || '',
          date: a.date || a.date1 || ''
        })))
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
      clinicId: '',
      dateFirstVisit: '',
      lostReturn: false,
      typeOfReturn: -1,
      returnClinicId: '',
      oldSiteName: '',
      dateOfBirth: '',
      age: '',
      sex: -1,
      education: -1,
      canRead: -1,
      canWrite: -1,
      nationality: '',
      targetGroup: '',
      referred: -1,
      referredOther: '',
      dateTestHIV: '',
      vcctSite: '',
      vcctId: '',
      previousClinicId: '',
      transferIn: -1,
      transferFrom: '',
      dateStartART: '',
      artNumber: '',
      tbPast: -1,
      tptHistory: -1,
      tptRegimen: -1,
      tptDateStart: '',
      tptDateEnd: '',
      tbType: -1,
      tbResultTest: -1,
      tbDateOnset: '',
      tbTreatmentCategory: -1,
      tbDateTreatment: '',
      tbResultTreatment: -1,
      tbDateComplete: '',
      arvHistory: -1,
      diabetes: false,
      hypertension: false,
      abnormal: false,
      renal: false,
      anemia: false,
      liver: false,
      hepatitis: false,
      other: false,
      allergy: -1,
      refugeeStatus: -1,
      refugeeART: '',
      refugeeSite: ''
    })
    setArvTreatmentHistory(Array(6).fill().map(() => ({
      drug: '',
      clinic: '',
      startDate: '',
      stopDate: '',
      note: ''
    })))
    setOtherMedicalTreatments({
      diabetes: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      hypertension: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      abnormal: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      renal: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      anemia: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      liver: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      hepatitis: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' },
      other: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' }
    })
    setAllergies(Array(6).fill().map(() => ({
      drug: '',
      reaction: '',
      date: ''
    })))
    setError('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validation matching VB.NET form
      if (!formData.clinicId.trim()) {
        setError('Please input Clinic ID')
        return
      }
      
      const firstVisitDate = new Date(formData.dateFirstVisit)
      const minDate = new Date('2000-01-01')
      if (!formData.dateFirstVisit || firstVisitDate < minDate) {
        setError('Please input Date First Visit (must be after 2000)')
        return
      }
      
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 15 || age > 100) {
        setError('Invalid Patient Age! Must be between 15 and 100 years for adult patients')
        return
      }
      
      if (formData.sex === -1) {
        setError('Please select Patient Sex!')
        return
      }
      
      // VCCT validation for dates after 2023-09-18
      const validationDate = new Date('2023-09-18')
      if (firstVisitDate >= validationDate && 
          formData.typeOfReturn !== 1 && 
          formData.transferIn !== 1 && 
          formData.refugeeStatus !== 0) {
        const testDate = new Date(formData.dateTestHIV)
        const minTestDate = new Date('1990-01-01')
        if (!formData.dateTestHIV || testDate < minTestDate) {
          setError('Please input VCCT Test Date (must be after 1990)')
          return
        }
        if (!formData.vcctSite || formData.vcctSite.trim() === '') {
          setError('Please select VCCT site name!')
          return
        }
        if (!formData.vcctId || formData.vcctId.trim() === '' || formData.vcctId === '0') {
          setError('Please input VCCT client code')
          return
        }
      }
      
      // Transfer In validation
      if (formData.transferIn === 1 && (!formData.artNumber || formData.artNumber.trim() === '')) {
        setError('Please input ART Number!')
        return
      }

      const payload = {
        ...formData,
        arvTreatmentHistory: arvTreatmentHistory.filter(arv => arv.drug.trim()),
        otherMedicalTreatments: otherMedicalTreatments,
        allergies: allergies.filter(a => a.drug.trim())
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
          {/* Minimalistic Header */}
          <div className="bg-card border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={backToList} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Adult Patient</h1>
                  <p className="text-xs text-muted-foreground">ការគ្រប់គ្រងអ្នកជំងឺពេញវ័យ</p>
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
                  className="h-8 text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                {id && (
                  <Button 
                    onClick={handleDelete} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4">
            {/* Minimalistic Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                <TabsTrigger value="form" className="text-sm font-medium">
                  Information
                </TabsTrigger>
                <TabsTrigger value="medical" className="text-sm font-medium">
                  Medical History
                </TabsTrigger>
              </TabsList>

              {/* Patient Information Tab */}
              <TabsContent value="form" className="space-y-6 mt-0">
                <PatientInformation
                  formData={formData}
                  setFormData={setFormData}
                  handleInputChange={handleInputChange}
                  dropdownOptions={dropdownOptions}
                />
              </TabsContent>

              {/* Medical & Treatment History Tab */}
              <TabsContent value="medical" className="space-y-6 mt-0">
                <MedicalTreatmentHistory
                  formData={formData}
                  setFormData={setFormData}
                  arvTreatmentHistory={arvTreatmentHistory}
                  setArvTreatmentHistory={setArvTreatmentHistory}
                  otherMedicalTreatments={otherMedicalTreatments}
                  setOtherMedicalTreatments={setOtherMedicalTreatments}
                  allergies={allergies}
                  setAllergies={setAllergies}
                  dropdownOptions={dropdownOptions}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}

export default AdultInitialForm
