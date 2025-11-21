import { Card, CardContent } from "@/components/ui";
import React from 'react';
import TBHistorySection from '../sections/TBHistorySection';
import ARVHistorySection from '../sections/ARVHistorySection';
import OtherMedicalSection from '../sections/OtherMedicalSection';
import AllergiesSection from '../sections/AllergiesSection';

function MedicalTreatmentHistory({ 
  formData, 
  setFormData, 
  arvTreatmentHistory,
  setArvTreatmentHistory,
  otherMedicalTreatments,
  setOtherMedicalTreatments,
  allergies,
  setAllergies,
  dropdownOptions 
}) {
  return (
    <div className="space-y-5">
      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <TBHistorySection
            formData={formData}
            setFormData={setFormData}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <ARVHistorySection
            formData={formData}
            setFormData={setFormData}
            arvTreatmentHistory={arvTreatmentHistory}
            setArvTreatmentHistory={setArvTreatmentHistory}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <OtherMedicalSection
            formData={formData}
            setFormData={setFormData}
            otherMedicalTreatments={otherMedicalTreatments}
            setOtherMedicalTreatments={setOtherMedicalTreatments}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>

      <Card className="border border-border shadow-none bg-card">
        <CardContent className="p-5 sm:p-6">
          <AllergiesSection
            formData={formData}
            setFormData={setFormData}
            allergies={allergies}
            setAllergies={setAllergies}
            dropdownOptions={dropdownOptions}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalTreatmentHistory
