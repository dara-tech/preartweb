import { Button, Card, CardContent, CardHeader, CardTitle, Separator, Tabs, TabsContent, TabsList, TabsTrigger, Progress, Badge } from "@/components/ui";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../../services/api";

// Import form components
import PatientInformation from '../../../../features/patients/adult/components/components/PatientInformation';
import Demographics from '../../../../features/patients/adult/components/components/Demographics';
import PhysicalMeasurements from '../../../../features/patients/adult/components/components/PhysicalMeasurements';
import Assessment from '../../../../features/patients/adult/components/components/Assessment';
import AssessmentPlan from '../../../../features/patients/adult/components/components/AssessmentPlan';
import Counselling from '../../../../features/patients/adult/components/components/Counselling';
import Symptoms from '../../../../features/patients/adult/components/components/Symptoms';
import Hospitalization from '../../../../features/patients/adult/components/components/Hospitalization';
import Adherence from '../../../../features/patients/adult/components/components/Adherence';

function AdultVisitForm() {
  const { clinicId, visitId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKhmerLabels, setShowKhmerLabels] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
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
    appointmentDate: '1900-01-01',
    foWorker: '0',
    countryId: '0'
  });

  // Load visit data if editing
  useEffect(() => {
    const loadVisitData = async () => {
      if (visitId) {
        setLoading(true);
        try {
          // Load visit data
          const visitResponse = await api.get(`/visits/adult/${clinicId}/${visitId}`);
          if (visitResponse.data && visitResponse.data.visit) {
            console.log('Visit data loaded:', visitResponse.data.visit);
            console.log('Visit status from API:', visitResponse.data.visit.visitStatus, 'type:', typeof visitResponse.data.visit.visitStatus);
            console.log('Counselling data from API:', {
              prevention: visitResponse.data.visit.prevention,
              adherence: visitResponse.data.visit.adherence,
              spacing: visitResponse.data.visit.spacing,
              tbInfect: visitResponse.data.visit.tbInfect,
              partner: visitResponse.data.visit.partner,
              condom: visitResponse.data.visit.condom
            });
            console.log('Symptoms data from API:', {
              cough: visitResponse.data.visit.cough,
              fever: visitResponse.data.visit.fever,
              lostWeight: visitResponse.data.visit.lostWeight,
              sweet: visitResponse.data.visit.sweet,
              urine: visitResponse.data.visit.urine,
              genital: visitResponse.data.visit.genital,
              chemnah: visitResponse.data.visit.chemnah
            });
            
            // Log ARV regimen data from API
            console.log('ARV regimen data from API:', {
              arvRegimen: visitResponse.data.visit.arvRegimen
            });
            
            setFormData(prev => ({ ...prev, ...visitResponse.data.visit }));
          }
          
          // Load patient data to get age, gender, etc.
          if (clinicId) {
            try {
              const patientResponse = await api.get(`/apiv1/patients/adult/${clinicId}`);
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
              console.error('Error loading patient data:', patientError);
            }
          }
        } catch (error) {
          console.error('Error loading visit data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadVisitData();
  }, [visitId, clinicId]);

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
    try {
      const payload = {
        ...formData,
        isDraft,
        lastUpdated: new Date().toISOString()
      };

      if (visitId) {
        // Update existing visit
        await api.put(`/apiv1/visits/adult/${visitId}`, payload);
      } else {
        // Create new visit
        await api.post('/apiv1/visits/adult', payload);
      }
      
      alert(isDraft ? 'Visit saved as draft!' : 'Visit saved successfully!');
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Error saving visit. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  const handleBack = () => {
    navigate('/visits/adult');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="bg-white p-8 border border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Visit Data</h3>
            <p className="text-gray-600">Please wait while we load the patient information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate form completion progress
  const calculateProgress = () => {
    const requiredFields = [
      'artNumber', 'visitDate', 'name', 'age', 'gender', 'weight', 'height',
      'whoStage', 'cd4', 'hivViral', 'arvLine'
    ];
    const completedFields = requiredFields.filter(field => 
      formData[field] && formData[field] !== '' && formData[field] !== '0' && formData[field] !== '1900-01-01'
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  const sections = [
    { id: 'patient-info', title: 'Patient Information', description: 'Basic information and demographics' },
    { id: 'demographics', title: 'Assessment', description: 'Symptoms, counselling and adherence' },
    { id: 'treatment', title: 'Treatment Plan', description: 'Medical assessment and follow-up' }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-6">
            <PatientInformation formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <Demographics formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <PhysicalMeasurements formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <Counselling formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <Symptoms formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <Hospitalization formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <Adherence formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
            <Assessment formData={formData} handleInputChange={handleInputChange} showKhmer={showKhmerLabels} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <AssessmentPlan formData={formData} handleInputChange={handleInputChange} visitId={visitId} showKhmer={showKhmerLabels} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-300">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={handleBack} 
                className="text-gray-600 hover:text-gray-900 text-sm mb-2"
              >
                ← Back to visits
              </button>
              <h1 className="text-2xl font-medium text-gray-900">
                Adult Patient Visit Form
              </h1>
              <p className="text-gray-600 mt-1">
                {clinicId && `Patient ID: ${clinicId}`}
                {formData.name && ` • ${formData.name}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Progress: {progress}%
              </div>
              <div className="w-32 h-1 bg-gray-200">
                <div 
                  className="h-1 bg-gray-600" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Section Navigation */}
      <div className="border-b border-gray-300">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex space-x-12">
            {sections.map((section, index) => {
              const isActive = currentSection === index;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`py-4 text-left border-b-2 transition-colors ${
                    isActive 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-gray-500">{section.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Paper Style */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white border border-gray-300">
          <div className="p-12">
            {renderCurrentSection()}
          </div>

          {/* Simple Footer */}
          <div className="bg-gray-50 px-12 py-6 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {saving ? 'Saving...' : 'Auto-saved'} • Last saved: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showKhmerLabels}
                    onChange={(e) => setShowKhmerLabels(e.target.checked)}
                    className="mr-2"
                  />
                  Show Khmer Labels
                </label>
                {currentSection > 0 && (
                  <button 
                    onClick={() => setCurrentSection(currentSection - 1)}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                <button 
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Draft
                </button>
                {currentSection < sections.length - 1 ? (
                  <button 
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="px-6 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-6 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Save & Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdultVisitForm;
