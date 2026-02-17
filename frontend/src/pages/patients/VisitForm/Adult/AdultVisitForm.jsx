import { Button, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import api from "../../../../services/api";
import { useSite } from "../../../../contexts/SiteContext";

// Import form components
import Demographics from '../../../../features/patients/adult/components/components/Demographics';
import PhysicalMeasurements from '../../../../features/patients/adult/components/components/PhysicalMeasurements';
import Assessment from '../../../../features/patients/adult/components/components/Assessment';
import AssessmentPlan from '../../../../features/patients/adult/components/components/AssessmentPlan';
import PatientStatus from '../../../../features/patients/adult/components/components/PatientStatus';
import Counselling from '../../../../features/patients/adult/components/components/Counselling';
import Symptoms from '../../../../features/patients/adult/components/components/Symptoms';
import Hospitalization from '../../../../features/patients/adult/components/components/Hospitalization';
import Adherence from '../../../../features/patients/adult/components/components/Adherence';
import { Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

function AdultVisitForm() {
  const { clinicId, visitId } = useParams();
  const navigate = useNavigate();
  const { selectedSite } = useSite();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showKhmerLabels, setShowKhmerLabels] = useState(false);
  const [activeTab, setActiveTab] = useState('visit-info');
  const [dropdownOptions, setDropdownOptions] = useState({
    targetGroups: [],
    drugs: [],
    reasons: [],
    sites: [],
    doctors: [],
    meetTimes: []
  });
  // Initialize drug fields
  const initializeDrugFields = () => {
    const drugFields = {};
    
      // ARV drugs - Note: These fields don't exist in the database yet
      // for (let i = 1; i <= 8; i++) {
      //   drugFields[`arvDrug${i}`] = '';
      //   drugFields[`arvDose${i}`] = '';
      //   drugFields[`arvQuantity${i}`] = '';
      //   drugFields[`arvFrequency${i}`] = '';
      //   drugFields[`arvForm${i}`] = '';
      //   drugFields[`arvStatus${i}`] = '0';
      //   drugFields[`arvDate${i}`] = '1900-01-01';
      //   drugFields[`arvReason${i}`] = '';
      //   drugFields[`arvRemarks${i}`] = '';
      // }
    
    // OI drugs
    for (let i = 1; i <= 5; i++) {
      drugFields[`oiDrug${i}`] = '';
      drugFields[`oiDose${i}`] = '';
      drugFields[`oiQuantity${i}`] = '';
      drugFields[`oiFrequency${i}`] = '';
      drugFields[`oiForm${i}`] = '';
      drugFields[`oiStart${i}`] = '';
      drugFields[`oiStop${i}`] = '';
      drugFields[`oiContinue${i}`] = '';
      drugFields[`oiDate${i}`] = '1900-01-01';
      drugFields[`oiReason${i}`] = '';
      drugFields[`oiRemarks${i}`] = '';
    }
    
    // HCV drugs
    for (let i = 1; i <= 3; i++) {
      drugFields[`hcvDrug${i}`] = '';
      drugFields[`hcvDose${i}`] = '';
      drugFields[`hcvQuantity${i}`] = '';
      drugFields[`hcvFrequency${i}`] = '';
      drugFields[`hcvForm${i}`] = '';
      drugFields[`hcvStart${i}`] = '';
      drugFields[`hcvStop${i}`] = '';
      drugFields[`hcvContinue${i}`] = '';
      drugFields[`hcvDate${i}`] = '1900-01-01';
      drugFields[`hcvReason${i}`] = '';
      drugFields[`hcvRemarks${i}`] = '';
    }
    
    // TPT drugs
    for (let i = 1; i <= 4; i++) {
      drugFields[`tptDrug${i}`] = '';
      drugFields[`tptDose${i}`] = '';
      drugFields[`tptQuantity${i}`] = '';
      drugFields[`tptFrequency${i}`] = '';
      drugFields[`tptForm${i}`] = '';
      drugFields[`tptStatus${i}`] = '-1';
      drugFields[`tptStart${i}`] = '';
      drugFields[`tptStop${i}`] = '';
      drugFields[`tptContinue${i}`] = '';
      drugFields[`tptDate${i}`] = '1900-01-01';
      drugFields[`tptReason${i}`] = '';
      drugFields[`tptRemarks${i}`] = '';
    }
    
    // TB drugs
    for (let i = 1; i <= 3; i++) {
      drugFields[`tbDrug${i}`] = '';
      drugFields[`tbDose${i}`] = '';
      drugFields[`tbQuantity${i}`] = '';
      drugFields[`tbFrequency${i}`] = '';
      drugFields[`tbForm${i}`] = '';
      drugFields[`tbStatus${i}`] = '-1';
      drugFields[`tbStart${i}`] = '';
      drugFields[`tbStop${i}`] = '';
      drugFields[`tbContinue${i}`] = '';
      drugFields[`tbDate${i}`] = '1900-01-01';
      drugFields[`tbReason${i}`] = '';
      drugFields[`tbRemarks${i}`] = '';
    }
    
    return drugFields;
  };

  const [formData, setFormData] = useState({
    // Patient Information
    clinicId: clinicId || '',
    artNumber: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitStatus: '0', // Default to first visit
    visitId: '',
    
    // Demographics
    name: '',
    age: '',
    gender: '',
    pregnantStatus: '0',
    typePregnant: '0',
    pregnantDate: '1900-01-01',
    ancStatus: '0',
    
    // Physical Measurements
    weight: '0',
    height: '0',
    temperature: '0',
    pulse: '0',
    respiration: '0',
    bloodPressure: '0/0',
    
    // Counselling
    prevention: '0',
    adherence: '0',
    spacing: '0',
    tbInfect: '0',
    partner: '0',
    condom: '0',
    
    // Contraceptive Methods
    typeClient: '0',
    useDate: '1900-01-01',
    condomCount: '0',
    cocCount: '0',
    pocCount: '0',
    drugCount: '0',
    placeService: '0',
    condomUsed: '0',
    cocUsed: '0',
    pocUsed: '0',
    drugUsed: '0',
    otherUsed: '0',
    
    // Symptoms (Last 4 weeks)
    cough: '0',
    fever: '0',
    lostWeight: '0',
    sweet: '0',
    urine: '0',
    genital: '0',
    chemnah: '0',
    
    // Hospitalization
    hospital: '0',
    numHospital: '0',
    reasonHospital: '',
    
    // Adherence
    missARV: '0',
    missTime: '0',
    
    // Assessment
    whoStage: '0',
    eligible: '0',
    targetGroup: '',
    function: '0',
    tb: '0',
    tbResult: '0',
    tbTreat: '0',
    tbDate: '1900-01-01',
    cd4Date: '1900-01-01',
    
    // Include drug fields in initial state
    ...initializeDrugFields(),
    viralLoadDate: '1900-01-01',
    cd4Test: '0',
    hivViralTest: '0',
    hcvViralTest: '0',
    
    // HIV Testing
    testHIV: '0',
    resultHIV: '0',
    cd4: '0',
    hivViral: '0',
    hcvViral: '0',
    grAG: '0',
    resultCrAG: '0',
    viralDetect: '0',
    
    // Referral
    refer: '0',
    referOther: '',
    
    // Side Effects
    moderate: '0',
    tdf: '0',
    rash: '0',
    hepatitis: '0',
    peripheral: '0',
    azt: '0',
    lpv: '0',
    lactic: '0',
    abc: '0',
    atv: '0',
    mediOther: '',
    
    // Treatment
    arvLine: '0',
    resultHype: '0',
    tpt: '0',
    tbOut: '0',
    
    // Follow-up
    appointmentDate: '',
    doctorId: '',
    meetTime: '',
    foWorker: '0',
    countryId: '0',
    
    // Patient Status
    patientStatus: '-1',
    placeDead: '-1',
    causeDeathType: '-1',
    causeDeath: '',
    outcomeDate: '1900-01-01',
    otherDead: '',
    transferOut: ''
  });

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      if (!selectedSite) return;
      
      try {
        const siteCode = selectedSite?.code || null;
        const siteParam = siteCode ? { params: { site: siteCode } } : {};
        
        const requests = [
          api.get('/apiv1/lookups/target-groups', siteParam).catch(() => ({ data: [] })),
          api.get('/apiv1/lookups/drugs', siteParam).catch(() => ({ data: [] })),
          api.get('/apiv1/lookups/reasons', siteParam).catch(() => ({ data: [] })),
          api.get('/apiv1/lookups/sites', siteParam).catch(() => ({ data: [] })),
          api.get('/apiv1/lookups/doctors', siteParam).catch(() => ({ data: [] })),
          api.get('/apiv1/lookups/meet-times', siteParam).catch(() => ({ data: [] }))
        ];

        const [targetGroupsRes, drugsRes, reasonsRes, sitesRes, doctorsRes, meetTimesRes] = await Promise.all(requests);

        setDropdownOptions({
          targetGroups: Array.isArray(targetGroupsRes.data) ? targetGroupsRes.data : [],
          drugs: Array.isArray(drugsRes.data) ? drugsRes.data : [],
          reasons: Array.isArray(reasonsRes.data) ? reasonsRes.data : [],
          sites: Array.isArray(sitesRes.data) ? sitesRes.data : [],
          doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data : [],
          meetTimes: Array.isArray(meetTimesRes.data) ? meetTimesRes.data : []
        });
      } catch (error) {
        console.error('Error loading dropdown data:', error);
        setDropdownOptions({
          targetGroups: [],
          drugs: [],
          reasons: [],
          sites: [],
          doctors: [],
          meetTimes: []
        });
      }
    };

    loadDropdownData();
  }, [selectedSite]);

  // Load visit data if editing
  useEffect(() => {
    const loadVisitData = async () => {
      if (visitId && clinicId && selectedSite) {
        setLoading(true);
        try {
          const siteCode = selectedSite?.code || null;
          const siteParam = siteCode ? `?site=${siteCode}` : '';
          
          // Load visit data
          try {
            const visitResponse = await api.get(`/apiv1/visits/adult/${clinicId}/${visitId}${siteParam}`);
            if (visitResponse.data && visitResponse.data.visit) {
              console.log('Visit data loaded:', visitResponse.data.visit);
              const visitData = visitResponse.data.visit;
              // Map appointment date field (backend returns as appointmentDate or nextAppointment)
              let appointmentDate = visitData.appointmentDate || visitData.nextAppointment || visitData.DaAppoint || visitData.daApp || visitData.DaApp || '';
              // Format date properly
              if (appointmentDate && appointmentDate !== '1900-01-01' && appointmentDate !== '1900-01-01T00:00:00.000Z') {
                if (typeof appointmentDate === 'string' && appointmentDate.includes('T')) {
                  appointmentDate = appointmentDate.split('T')[0];
                } else if (typeof appointmentDate === 'string' && appointmentDate.length === 10) {
                  appointmentDate = appointmentDate;
                } else if (appointmentDate instanceof Date) {
                  appointmentDate = appointmentDate.toISOString().split('T')[0];
                } else {
                  appointmentDate = '';
                }
              } else {
                appointmentDate = '';
              }
              // Map targetGroup if it's a number (TID) to string
              const targetGroup = visitData.targetGroup ? String(visitData.targetGroup) : '';
              // Map doctor and meet time
              const doctorId = visitData.doctorId || visitData.Doctore || '';
              const meetTime = visitData.meetTime !== null && visitData.meetTime !== undefined ? String(visitData.meetTime) : '';
              
              setFormData(prev => ({ 
                ...prev, 
                ...visitData,
                appointmentDate: appointmentDate || prev.appointmentDate,
                targetGroup: targetGroup || prev.targetGroup,
                doctorId: doctorId || prev.doctorId,
                meetTime: meetTime || prev.meetTime
              }));
            }
          } catch (visitError) {
            // If visit not found (404), it's okay - might be a new visit
            if (visitError.response?.status !== 404) {
              console.error('Error loading visit data:', visitError);
            }
          }
          
          // Load patient data to get age, gender, etc.
          if (clinicId) {
            try {
              const patientSiteParam = siteCode ? `?site=${siteCode}` : '';
              const patientResponse = await api.get(`/apiv1/patients/adult/${clinicId}${patientSiteParam}`);
              if (patientResponse.data) {
                console.log('Patient data loaded:', patientResponse.data);
                setFormData(prev => ({
                  ...prev,
                  age: patientResponse.data.age || '',
                  gender: patientResponse.data.sex?.toString() || '',
                  name: patientResponse.data.patientName || ''
                }));
              }
            } catch (patientError) {
              // If patient not found (404), log but don't show error
              if (patientError.response?.status !== 404) {
                console.error('Error loading patient data:', patientError);
              }
            }
          }
        } catch (error) {
          // Only log non-404 errors
          if (error.response?.status !== 404) {
            console.error('Error loading visit data:', error);
          }
        } finally {
          setLoading(false);
        }
      } else if (clinicId && selectedSite && !visitId) {
        // If we have clinicId but no visitId, just load patient data
        setLoading(true);
        try {
          const siteCode = selectedSite?.code || null;
          const patientSiteParam = siteCode ? `?site=${siteCode}` : '';
          const patientResponse = await api.get(`/apiv1/patients/adult/${clinicId}${patientSiteParam}`);
          if (patientResponse.data) {
            setFormData(prev => ({
              ...prev,
              age: patientResponse.data.age || '',
              gender: patientResponse.data.sex?.toString() || '',
              name: patientResponse.data.patientName || ''
            }));
          }
        } catch (patientError) {
          if (patientError.response?.status !== 404) {
            console.error('Error loading patient data:', patientError);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadVisitData();
  }, [visitId, clinicId, selectedSite]);

  // Monitor form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);


  const handleInputChange = (field, value) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handleSave = async (isDraft = false) => {
    setSaving(true);
    setError('');
    try {
      const siteCode = selectedSite?.code || null;
      const payload = {
        ...formData,
        site: siteCode,
        isDraft,
        lastUpdated: new Date().toISOString()
      };

      if (visitId && clinicId) {
        // Update existing visit
        const siteParam = siteCode ? `?site=${siteCode}` : '';
        await api.put(`/apiv1/visits/adult/${clinicId}/${visitId}${siteParam}`, payload);
      } else {
        // Create new visit
        await api.post('/apiv1/visits/adult', payload);
      }
      
      if (!isDraft) {
        navigate('/visits/adult');
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      setError(error.response?.data?.message || 'Error saving visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  const handleBack = () => {
    navigate('/visits/adult');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-card border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleBack} 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Adult Visit</h1>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading visit data...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Minimalistic Header - Matching Initial Form */}
      <div className="bg-card border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleBack} 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Adult Visit</h1>
              <p className="text-xs text-muted-foreground">
                {clinicId && `Patient ID: ${clinicId}`}
                {formData.name && ` • ${formData.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="h-8 text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="h-8 text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs - Two tabs matching old form structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
            <TabsTrigger value="visit-info" className="text-sm font-medium">
              Visit Information
            </TabsTrigger>
            <TabsTrigger value="treatment-plan" className="text-sm font-medium">
              Treatment Plan
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Visit Information */}
          <TabsContent value="visit-info" className="space-y-6 mt-0">
            {/* Patient Information - Visit Specific */}
            <Card className="border border-border bg-card">
              <CardContent className="p-5 sm:p-6">
                <div className="border-b border-border pb-3 mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Patient Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">Basic patient and visit information</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="clinicId" className="text-xs font-medium text-foreground">Clinic ID</Label>
                    <Input
                      id="clinicId"
                      value={formData.clinicId || ''}
                      onChange={(e) => handleInputChange('clinicId', e.target.value)}
                      className="h-9 text-sm mt-1"
                      disabled={!!clinicId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="artNumber" className="text-xs font-medium text-foreground">ART Number</Label>
                    <Input
                      id="artNumber"
                      value={formData.artNumber || ''}
                      onChange={(e) => handleInputChange('artNumber', e.target.value)}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitDate" className="text-xs font-medium text-foreground">Visit Date</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      value={formData.visitDate || ''}
                      onChange={(e) => handleInputChange('visitDate', e.target.value)}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitStatus" className="text-xs font-medium text-foreground">Type of Visit</Label>
                    <Select
                      value={formData.visitStatus?.toString() || '0'}
                      onValueChange={(value) => handleInputChange('visitStatus', value)}
                    >
                      <SelectTrigger className="h-9 text-sm mt-1">
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">First Visit</SelectItem>
                        <SelectItem value="1">Early Visit</SelectItem>
                        <SelectItem value="2">Scheduled Visit</SelectItem>
                        <SelectItem value="3">Late Visit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-xs font-medium text-foreground">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-xs font-medium text-foreground">Sex</Label>
                    <Select
                      value={formData.gender?.toString() || ''}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger className="h-9 text-sm mt-1">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Female</SelectItem>
                        <SelectItem value="1">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Demographics */}
            <Demographics formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Physical Measurements */}
            <PhysicalMeasurements formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Counselling */}
            <Counselling formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Symptoms */}
            <Symptoms formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Hospitalization */}
            <Hospitalization formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Adherence */}
            <Adherence formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            
            {/* Assessment */}
            <Assessment formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} dropdownOptions={dropdownOptions} />
          </TabsContent>

          {/* Tab 2: Treatment Plan */}
          <TabsContent value="treatment-plan" className="space-y-6 mt-0">
            {/* Assessment Plan / Treatment Plan */}
            <AssessmentPlan formData={formData} handleInputChange={handleInputChange} visitId={visitId} showKhmer={showKhmerLabels} dropdownOptions={dropdownOptions} />
            
            {/* Patient Status - End Section */}
            <PatientStatus formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} dropdownOptions={dropdownOptions} />
          </TabsContent>
        </Tabs>

        {/* Khmer Labels Toggle */}
        <div className="flex items-center justify-end pt-4">
          <label className="flex items-center text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showKhmerLabels}
              onChange={(e) => setShowKhmerLabels(e.target.checked)}
              className="mr-2 h-3.5 w-3.5"
            />
            Show Khmer Labels
          </label>
        </div>
      </div>
    </div>
  );
}

export default AdultVisitForm;
