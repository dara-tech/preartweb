import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Button } from "@/components/ui";
import React from 'react'
import { Plus, Trash2 } from "lucide-react"

function MedicalTreatmentHistory({ 
  formData, 
  setFormData, 
  treatmentHistory, 
  setTreatmentHistory, 
  dropdownOptions 
}) {
  // Ensure formData has default values to prevent undefined errors
  const safeFormData = {
    tbPast: -1,
    tptHistory: -1,
    tptRegimen: -1,
    tbType: -1,
    tbResult: -1,
    tbTreatment: -1,
    tbDateComplete: '',
    arvMedication: -1,
    diabetes: false,
    hypertension: false,
    abnormal: false,
    renal: false,
    anemia: false,
    liver: false,
    hepatitis: false,
    other: false,
    ...formData
  }

  const handleTreatmentHistoryChange = (field, value) => {
    setTreatmentHistory(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDrugTreatmentChange = (index, field, value) => {
    if (value === "none") {
      value = field === 'drugDetails' || field === 'clinic' ? "" : value
    }
    
    setTreatmentHistory(prev => ({
      ...prev,
      drugTreatments: prev.drugTreatments.map((treatment, i) => 
        i === index ? { ...treatment, [field]: value } : treatment
      )
    }))
  }

  const addDrugTreatment = () => {
    setTreatmentHistory(prev => ({
      ...prev,
      drugTreatments: [...prev.drugTreatments, {
        drugDetails: '',
        clinic: '',
        startDate: '',
        stopDate: '',
        remarks: ''
      }]
    }))
  }

  const removeDrugTreatment = (index) => {
    setTreatmentHistory(prev => ({
      ...prev,
      drugTreatments: prev.drugTreatments.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* TB History Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-yellow-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-yellow-600 font-bold">1</span>
            </div>
            ប្រវត្តិជំងឺរបេង / TB History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺរបេងកន្លងមក / Past TB
              </Label>
              <RadioGroup
                value={safeFormData.tbPast === -1 ? "" : safeFormData.tbPast.toString()}
                onValueChange={(value) => setFormData({...formData, tbPast: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tbPastNo" className="w-4 h-4" />
                  <Label htmlFor="tbPastNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tbPastYes" className="w-4 h-4" />
                  <Label htmlFor="tbPastYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រវត្តិ TPT / TPT History
              </Label>
              <RadioGroup
                value={safeFormData.tptHistory === -1 ? "" : safeFormData.tptHistory.toString()}
                onValueChange={(value) => setFormData({...formData, tptHistory: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tptHistoryNo" className="w-4 h-4" />
                  <Label htmlFor="tptHistoryNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tptHistoryYes" className="w-4 h-4" />
                  <Label htmlFor="tptHistoryYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                របប TPT / TPT Regimen
              </Label>
              <RadioGroup
                value={safeFormData.tptRegimen === -1 ? "" : safeFormData.tptRegimen.toString()}
                onValueChange={(value) => setFormData({...formData, tptRegimen: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tptRegimenNo" className="w-4 h-4" />
                  <Label htmlFor="tptRegimenNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tptRegimenYes" className="w-4 h-4" />
                  <Label htmlFor="tptRegimenYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រភេទរបេង / TB Type
              </Label>
              <RadioGroup
                value={safeFormData.tbType === -1 ? "" : safeFormData.tbType.toString()}
                onValueChange={(value) => setFormData({...formData, tbType: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tbTypePulmonary" className="w-4 h-4" />
                  <Label htmlFor="tbTypePulmonary" className="text-sm font-medium">សួត / Pulmonary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tbTypeExtra" className="w-4 h-4" />
                  <Label htmlFor="tbTypeExtra" className="text-sm font-medium">ក្រៅសួត / Extra-pulmonary</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                លទ្ធផលរបេង / TB Result
              </Label>
              <RadioGroup
                value={safeFormData.tbResult === -1 ? "" : safeFormData.tbResult.toString()}
                onValueChange={(value) => setFormData({...formData, tbResult: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tbResultNegative" className="w-4 h-4" />
                  <Label htmlFor="tbResultNegative" className="text-sm font-medium">អវិជ្ជមាន / Negative</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tbResultPositive" className="w-4 h-4" />
                  <Label htmlFor="tbResultPositive" className="text-sm font-medium">វិជ្ជមាន / Positive</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ព្យាបាលរបេង / TB Treatment
              </Label>
              <RadioGroup
                value={safeFormData.tbTreatment === -1 ? "" : safeFormData.tbTreatment.toString()}
                onValueChange={(value) => setFormData({...formData, tbTreatment: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="tbTreatmentNo" className="w-4 h-4" />
                  <Label htmlFor="tbTreatmentNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tbTreatmentYes" className="w-4 h-4" />
                  <Label htmlFor="tbTreatmentYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date of Complete Treatment Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Date of complete treatment
            </Label>
            <Input
              type="date"
              value={safeFormData.tbDateComplete || ''}
              onChange={(e) => setFormData({...formData, tbDateComplete: e.target.value})}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* ARV Treatment History Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំARV (ARV Treatment History)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    បញ្ជាក់លម្អិតការព្យាបាលដោយថ្នាំ / Details of drug treatment
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    មន្ទីរពេទ្យ/គ្លីនិក / Clinic/source
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    ថ្ងៃខែឆ្នាំចាប់ផ្តើម / Start date
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    ថ្ងៃខែឆ្នាំបញ្ឈប់ / Stop date
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    កំណត់សំគាល់
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {treatmentHistory.drugTreatments.map((treatment, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">
                      <Select
                        value={treatment.drugDetails || "none"}
                        onValueChange={(value) => handleDrugTreatmentChange(index, 'drugDetails', value)}
                      >
                        <SelectTrigger className="border-0 focus:ring-0">
                          <SelectValue placeholder="Select Drug" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">Select Drug</SelectItem>
                          {dropdownOptions.drugs?.map((drug) => (
                            <SelectItem key={drug.id} value={drug.name}>
                              {drug.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Select
                        value={treatment.clinic || "none"}
                        onValueChange={(value) => handleDrugTreatmentChange(index, 'clinic', value)}
                      >
                        <SelectTrigger className="border-0 focus:ring-0">
                          <SelectValue placeholder="Select Clinic" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">Select Clinic</SelectItem>
                          {dropdownOptions.clinics?.map((clinic) => (
                            <SelectItem key={clinic.id} value={clinic.name}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        type="date"
                        value={treatment.startDate}
                        onChange={(e) => handleDrugTreatmentChange(index, 'startDate', e.target.value)}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        type="date"
                        value={treatment.stopDate}
                        onChange={(e) => handleDrugTreatmentChange(index, 'stopDate', e.target.value)}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        value={treatment.remarks}
                        onChange={(e) => handleDrugTreatmentChange(index, 'remarks', e.target.value)}
                        placeholder="Enter remarks"
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugTreatment(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={addDrugTreatment} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Treatment
            </Button>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              ឱសថ ARV ដែលប្រើកន្លងមក
            </Label>
            <RadioGroup
              value={safeFormData.arvMedication === -1 || safeFormData.arvMedication === null || safeFormData.arvMedication === undefined ? "" : safeFormData.arvMedication.toString()}
              onValueChange={(value) => setFormData({...formData, arvMedication: parseInt(value)})}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="arvNo" className="w-4 h-4" />
                <Label htmlFor="arvNo" className="text-sm font-medium">ទេ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="arvYes" className="w-4 h-4" />
                <Label htmlFor="arvYes" className="text-sm font-medium">បាទ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Other Medical Treatment History Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            ប្រវត្តិព្យាបាលវេជ្ជសាស្ត្រផ្សេងទៀត / Other Medical Treatment History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺទឹកនោមផ្អែម / Diabetes
              </Label>
              <RadioGroup
                value={safeFormData.diabetes ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, diabetes: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="diabetesNo" className="w-4 h-4" />
                  <Label htmlFor="diabetesNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="diabetesYes" className="w-4 h-4" />
                  <Label htmlFor="diabetesYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺសម្ពាធឈាម / Hypertension
              </Label>
              <RadioGroup
                value={safeFormData.hypertension ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, hypertension: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="hypertensionNo" className="w-4 h-4" />
                  <Label htmlFor="hypertensionNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="hypertensionYes" className="w-4 h-4" />
                  <Label htmlFor="hypertensionYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ការវិវត្តមិនធម្មតា / Abnormal Development
              </Label>
              <RadioGroup
                value={safeFormData.abnormal ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, abnormal: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="abnormalNo" className="w-4 h-4" />
                  <Label htmlFor="abnormalNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="abnormalYes" className="w-4 h-4" />
                  <Label htmlFor="abnormalYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺគ្រុនក្នុង / Renal Disease
              </Label>
              <RadioGroup
                value={safeFormData.renal ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, renal: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="renalNo" className="w-4 h-4" />
                  <Label htmlFor="renalNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="renalYes" className="w-4 h-4" />
                  <Label htmlFor="renalYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺអាកាសយាវ / Anemia
              </Label>
              <RadioGroup
                value={safeFormData.anemia ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, anemia: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="anemiaNo" className="w-4 h-4" />
                  <Label htmlFor="anemiaNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="anemiaYes" className="w-4 h-4" />
                  <Label htmlFor="anemiaYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺថ្លើម / Liver Disease
              </Label>
              <RadioGroup
                value={safeFormData.liver ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, liver: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="liverNo" className="w-4 h-4" />
                  <Label htmlFor="liverNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="liverYes" className="w-4 h-4" />
                  <Label htmlFor="liverYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ជំងឺរលាកថ្លើម / Hepatitis
              </Label>
              <RadioGroup
                value={safeFormData.hepatitis ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, hepatitis: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="hepatitisNo" className="w-4 h-4" />
                  <Label htmlFor="hepatitisNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="hepatitisYes" className="w-4 h-4" />
                  <Label htmlFor="hepatitisYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ផ្សេងទៀត / Other
              </Label>
              <RadioGroup
                value={safeFormData.other ? "1" : "0"}
                onValueChange={(value) => setFormData({...formData, other: value === "1"})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="otherNo" className="w-4 h-4" />
                  <Label htmlFor="otherNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="otherYes" className="w-4 h-4" />
                  <Label htmlFor="otherYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalTreatmentHistory
