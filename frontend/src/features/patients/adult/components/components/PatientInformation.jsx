import { Card, CardContent } from "@/components/ui";
import React from 'react';
import BasicInformationSection from '../sections/BasicInformationSection';
import DemographicsSection from '../sections/DemographicsSection';
import HIVTestingSection from '../sections/HIVTestingSection';
import TransferInSection from '../sections/TransferInSection';
import RefugeeStatusSection from '../sections/RefugeeStatusSection';

function PatientInformation({ formData, setFormData, handleInputChange, dropdownOptions }) {
  // Calculate age from DOB and first visit date
  const calculateAge = () => {
    if (!formData.dateOfBirth || !formData.dateFirstVisit) return ''
    const dob = new Date(formData.dateOfBirth)
    const firstVisit = new Date(formData.dateFirstVisit)
    if (isNaN(dob.getTime()) || isNaN(firstVisit.getTime())) return ''
    const age = firstVisit.getFullYear() - dob.getFullYear()
    const monthDiff = firstVisit.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && firstVisit.getDate() < dob.getDate())) {
      return age - 1
    }
    return age
  }

  // Enhanced handleInputChange with age calculation
  const enhancedHandleInputChange = (field, value) => {
    handleInputChange(field, value)
    
    // Auto-calculate age when DOB or first visit changes
    if (field === 'dateOfBirth' || field === 'dateFirstVisit') {
      const dob = field === 'dateOfBirth' ? value : formData.dateOfBirth
      const firstVisit = field === 'dateFirstVisit' ? value : formData.dateFirstVisit
      if (dob && firstVisit) {
        const age = calculateAge()
        if (age >= 15 && age <= 100) {
          handleInputChange('age', age.toString())
        }
      }
    }
    
    // Calculate DOB when age changes
    if (field === 'age' && value && formData.dateFirstVisit) {
      const firstVisit = new Date(formData.dateFirstVisit)
      if (!isNaN(firstVisit.getTime())) {
        const dob = new Date(firstVisit)
        dob.setFullYear(dob.getFullYear() - parseInt(value))
        handleInputChange('dateOfBirth', dob.toISOString().split('T')[0])
      }
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <BasicInformationSection
            formData={formData}
            handleInputChange={enhancedHandleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <DemographicsSection
            formData={formData}
            handleInputChange={enhancedHandleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <HIVTestingSection
            formData={formData}
            handleInputChange={enhancedHandleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <TransferInSection
            formData={formData}
            handleInputChange={enhancedHandleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <RefugeeStatusSection
            formData={formData}
            handleInputChange={enhancedHandleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default PatientInformation;
