import { Card, CardContent } from "@/components/ui";
import React from 'react';
import PatientIdentificationSection from '../sections/PatientIdentificationSection';
import DemographicsSection from '../sections/DemographicsSection';
import HIVTestSection from '../sections/HIVTestSection';
import FeedingSection from '../sections/FeedingSection';
import FamilyHistorySection from '../sections/FamilyHistorySection';

function PatientInformation({ 
  formData, 
  setFormData, 
  handleInputChange, 
  dropdownOptions, 
  familyMembers, 
  setFamilyMembers, 
  newFamilyMember, 
  setNewFamilyMember 
}) {
  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-none bg-card rounded-none">
        <CardContent className="p-6">
          <PatientIdentificationSection
            formData={formData}
            handleInputChange={handleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <DemographicsSection
            formData={formData}
            handleInputChange={handleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <HIVTestSection
            formData={formData}
            handleInputChange={handleInputChange}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <FeedingSection
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <FamilyHistorySection
            familyMembers={familyMembers}
            setFamilyMembers={setFamilyMembers}
            newFamilyMember={newFamilyMember}
            setNewFamilyMember={setNewFamilyMember}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientInformation
