import { Button, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSite } from "../../contexts/SiteContext"
import api from "../../services/api"
import MinimalisticPatientList from './MinimalisticPatientList'

/**
 * Minimalistic Unified Initial Form Component
 * Clean, simple structure for all patient types
 */
function UnifiedInitialForm({ 
  patientType, // 'adult', 'child', 'infant'
  apiEndpoint, // '/apiv1/patients/adult', '/apiv1/patients/child', '/apiv1/patients/infant'
  formFields, // Patient-specific form field definitions
  validationRules, // Patient-specific validation rules
  PatientListComponent, // Patient-specific list component
  PatientInformationComponent, // Patient-specific information component
  MedicalTreatmentHistoryComponent // Patient-specific medical history component
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedSite } = useSite()
  
  // Minimal state management
  const [activeTab, setActiveTab] = useState("list")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState(formFields.initialState)
  const [familyMembers, setFamilyMembers] = useState([])
  const [treatmentHistory, setTreatmentHistory] = useState(formFields.treatmentHistoryInitialState)
  const [dropdownOptions, setDropdownOptions] = useState({})

  // Patient type specific configurations
  const patientConfig = {
    adult: {
      title: "Adult Patient Management",
      titleKh: "ការគ្រប់គ្រងអ្នកជំងឺពេញវ័យ",
      route: "/patients/adult",
      ageRange: "15+ years"
    },
    child: {
      title: "Child Patient Management", 
      titleKh: "ការគ្រប់គ្រងអ្នកជំងឺកុមារ",
      route: "/patients/child",
      ageRange: "0-14 years"
    },
    infant: {
      title: "Infant Patient Management",
      titleKh: "ការគ្រប់គ្រងអ្នកជំងឺទារក", 
      route: "/patients/infant",
      ageRange: "0-2 years"
    }
  }

  const config = patientConfig[patientType]

  // Effects
  useEffect(() => {
    loadDropdownData()
    if (id) {
      loadPatientData(id)
      setActiveTab("form")
    }
  }, [id])

  // Simplified data loading
  const loadDropdownData = async () => {
    try {
      const [sites, drugs, clinics] = await Promise.all([
        api.get('/apiv1/lookups/sites-registry'),
        api.get('/apiv1/lookups/drugs'),
        api.get('/apiv1/lookups/clinics')
      ])

      setDropdownOptions({
        sites: sites.data || [],
        drugs: drugs.data || [],
        clinics: clinics.data || []
      })
    } catch (error) {
      console.error('Error loading dropdown data:', error)
    }
  }

  const loadPatientData = async (clinicId) => {
    try {
      setLoading(true)
      const response = await api.get(`${apiEndpoint}/${clinicId}`)
      const mappedData = formFields.mapApiDataToFormData(response.data)
      setFormData(mappedData)
      setError('')
    } catch (error) {
      setError('Error loading patient data')
    } finally {
      setLoading(false)
    }
  }

  // Simplified event handlers
  const handleInputChange = (field, value) => {
    const processedValue = formFields.processInputValue(field, value)
    setFormData(prev => ({ ...prev, [field]: processedValue }))
  }

  const handleClear = () => {
    setFormData(formFields.initialState)
    setFamilyMembers([])
    setTreatmentHistory(formFields.treatmentHistoryInitialState)
    setError('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      const validationError = validationRules.validate(formData)
      if (validationError) {
        setError(validationError)
        return
      }

      const payload = { ...formData, familyMembers, treatmentHistory }
      
      if (id) {
        await api.put(`${apiEndpoint}/${id}`, payload)
      } else {
        await api.post(apiEndpoint, payload)
      }

      handleClear()
      setActiveTab("list")
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving patient data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this patient?')) return
    
    try {
      setLoading(true)
      await api.delete(`${apiEndpoint}/${id}`)
      navigate(config.route)
      setActiveTab("list")
    } catch (error) {
      setError('Error deleting patient')
    } finally {
      setLoading(false)
    }
  }

  const selectPatient = (patient) => {
    navigate(`${config.route}/${patient.clinicId}`)
    setActiveTab("form")
  }

  const backToList = () => {
    navigate(config.route)
    setActiveTab("list")
  }

  const newPatient = () => {
    navigate(config.route)
    setActiveTab("form")
    handleClear()
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!id && activeTab === 'list' ? (
        <MinimalisticPatientList
          patientType={patientType}
          apiEndpoint={apiEndpoint}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectPatient={selectPatient}
          onNewPatient={newPatient}
          selectedSite={selectedSite}
        />
      ) : (
        <>
          {/* Minimal Header */}
          <div className="flex items-center justify-between p-4 bg-white border rounded-none">
            <div className="flex items-center space-x-3">
              <Button onClick={backToList} variant="outline" size="sm">
                Back
              </Button>
              <h1 className="text-lg font-semibold">{config.title}</h1>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleClear} variant="outline" size="sm">
                Clear
              </Button>
              <Button onClick={handleSave} disabled={loading} size="sm">
                {loading ? 'Saving...' : 'Save'}
              </Button>
              {id && (
                <Button onClick={handleDelete} variant="destructive" size="sm">
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Simple Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Information</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="mt-4">
              <PatientInformationComponent
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                dropdownOptions={dropdownOptions}
                familyMembers={familyMembers}
                setFamilyMembers={setFamilyMembers}
                patientType={patientType}
              />
            </TabsContent>

            <TabsContent value="medical" className="mt-4">
              <MedicalTreatmentHistoryComponent
                formData={formData}
                setFormData={setFormData}
                treatmentHistory={treatmentHistory}
                setTreatmentHistory={setTreatmentHistory}
                dropdownOptions={dropdownOptions}
                patientType={patientType}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default UnifiedInitialForm
