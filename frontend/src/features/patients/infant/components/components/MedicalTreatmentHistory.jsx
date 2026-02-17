import { Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Button } from "@/components/ui";
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
    <div className="space-y-5">
      {/* TB History Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រវត្តិជំងឺរបេង</h3>
              <p className="text-xs text-gray-500 mt-0.5">TB History</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺរបេងកន្លងមក</Label>
                <RadioGroup
                  value={safeFormData.tbPast === -1 ? "" : safeFormData.tbPast.toString()}
                  onValueChange={(value) => setFormData({...formData, tbPast: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbPastNo" className="h-4 w-4" />
                    <Label htmlFor="tbPastNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbPastYes" className="h-4 w-4" />
                    <Label htmlFor="tbPastYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រវត្តិ TPT</Label>
                <RadioGroup
                  value={safeFormData.tptHistory === -1 ? "" : safeFormData.tptHistory.toString()}
                  onValueChange={(value) => setFormData({...formData, tptHistory: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tptHistoryNo" className="h-4 w-4" />
                    <Label htmlFor="tptHistoryNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tptHistoryYes" className="h-4 w-4" />
                    <Label htmlFor="tptHistoryYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">របប TPT</Label>
                <RadioGroup
                  value={safeFormData.tptRegimen === -1 ? "" : safeFormData.tptRegimen.toString()}
                  onValueChange={(value) => setFormData({...formData, tptRegimen: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tptRegimenNo" className="h-4 w-4" />
                    <Label htmlFor="tptRegimenNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tptRegimenYes" className="h-4 w-4" />
                    <Label htmlFor="tptRegimenYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រភេទរបេង</Label>
                <RadioGroup
                  value={safeFormData.tbType === -1 ? "" : safeFormData.tbType.toString()}
                  onValueChange={(value) => setFormData({...formData, tbType: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbTypePulmonary" className="h-4 w-4" />
                    <Label htmlFor="tbTypePulmonary" className="text-xs cursor-pointer">សួត</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbTypeExtra" className="h-4 w-4" />
                    <Label htmlFor="tbTypeExtra" className="text-xs cursor-pointer">ក្រៅសួត</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">លទ្ធផលរបេង</Label>
                <RadioGroup
                  value={safeFormData.tbResult === -1 ? "" : safeFormData.tbResult.toString()}
                  onValueChange={(value) => setFormData({...formData, tbResult: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbResultNegative" className="h-4 w-4" />
                    <Label htmlFor="tbResultNegative" className="text-xs cursor-pointer">អវិជ្ជមាន</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbResultPositive" className="h-4 w-4" />
                    <Label htmlFor="tbResultPositive" className="text-xs cursor-pointer">វិជ្ជមាន</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ព្យាបាលរបេង</Label>
                <RadioGroup
                  value={safeFormData.tbTreatment === -1 ? "" : safeFormData.tbTreatment.toString()}
                  onValueChange={(value) => setFormData({...formData, tbTreatment: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbTreatmentNo" className="h-4 w-4" />
                    <Label htmlFor="tbTreatmentNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbTreatmentYes" className="h-4 w-4" />
                    <Label htmlFor="tbTreatmentYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {safeFormData.tbTreatment === 1 && (
              <div className="pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <Label htmlFor="tbDateComplete" className="text-xs font-medium text-gray-700">
                    ថ្ងៃខែឆ្នាំបញ្ចប់ព្យាបាល
                  </Label>
                  <Input
                    id="tbDateComplete"
                    type="date"
                    value={safeFormData.tbDateComplete || ''}
                    onChange={(e) => setFormData({...formData, tbDateComplete: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ARV Treatment History Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំARV</h3>
              <p className="text-xs text-gray-500 mt-0.5">ARV Treatment History</p>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">ថ្នាំ</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">មន្ទីរពេទ្យ</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">ចាប់ផ្តើម</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">បញ្ឈប់</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">កំណត់សំគាល់</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentHistory.drugTreatments.map((treatment, index) => (
                    <tr key={index} className="border-b border-border hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <Select
                          value={treatment.drugDetails || "none"}
                          onValueChange={(value) => handleDrugTreatmentChange(index, 'drugDetails', value)}
                        >
                          <SelectTrigger className="h-8 text-xs border-0 focus:ring-0">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.drugs?.map((drug) => (
                              <SelectItem key={drug.id || drug.drugid} value={drug.name || drug.drugname}>
                                {drug.name || drug.drugname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3">
                        <Select
                          value={treatment.clinic || "none"}
                          onValueChange={(value) => handleDrugTreatmentChange(index, 'clinic', value)}
                        >
                          <SelectTrigger className="h-8 text-xs border-0 focus:ring-0">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.clinics?.map((clinic) => (
                              <SelectItem key={clinic.id || clinic.clinicid} value={clinic.name || clinic.clinicname}>
                                {clinic.name || clinic.clinicname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="date"
                          value={treatment.startDate}
                          onChange={(e) => handleDrugTreatmentChange(index, 'startDate', e.target.value)}
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="date"
                          value={treatment.stopDate}
                          onChange={(e) => handleDrugTreatmentChange(index, 'stopDate', e.target.value)}
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={treatment.remarks}
                          onChange={(e) => handleDrugTreatmentChange(index, 'remarks', e.target.value)}
                          placeholder="Remarks"
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDrugTreatment(index)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-border">
              <Button 
                onClick={addDrugTreatment} 
                variant="ghost" 
                size="sm"
                className="h-8 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Treatment
              </Button>
            </div>
            
            <div className="space-y-1.5 pt-4 border-t border-border">
              <Label className="text-xs font-medium text-gray-700">
                ឱសថ ARV ដែលប្រើកន្លងមក
              </Label>
              <RadioGroup
                value={safeFormData.arvMedication === -1 || safeFormData.arvMedication === null || safeFormData.arvMedication === undefined ? "" : safeFormData.arvMedication.toString()}
                onValueChange={(value) => setFormData({...formData, arvMedication: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="arvNo" className="h-4 w-4" />
                  <Label htmlFor="arvNo" className="text-xs cursor-pointer">ទេ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="arvYes" className="h-4 w-4" />
                  <Label htmlFor="arvYes" className="text-xs cursor-pointer">បាទ</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Medical Treatment History Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រវត្តិព្យាបាលវេជ្ជសាស្ត្រផ្សេងទៀត</h3>
              <p className="text-xs text-gray-500 mt-0.5">Other Medical Treatment History</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺទឹកនោមផ្អែម</Label>
                <RadioGroup
                  value={safeFormData.diabetes ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, diabetes: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="diabetesNo" className="h-4 w-4" />
                    <Label htmlFor="diabetesNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="diabetesYes" className="h-4 w-4" />
                    <Label htmlFor="diabetesYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺសម្ពាធឈាម</Label>
                <RadioGroup
                  value={safeFormData.hypertension ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, hypertension: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="hypertensionNo" className="h-4 w-4" />
                    <Label htmlFor="hypertensionNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="hypertensionYes" className="h-4 w-4" />
                    <Label htmlFor="hypertensionYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ការវិវត្តមិនធម្មតា</Label>
                <RadioGroup
                  value={safeFormData.abnormal ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, abnormal: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="abnormalNo" className="h-4 w-4" />
                    <Label htmlFor="abnormalNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="abnormalYes" className="h-4 w-4" />
                    <Label htmlFor="abnormalYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺគ្រុនក្នុង</Label>
                <RadioGroup
                  value={safeFormData.renal ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, renal: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="renalNo" className="h-4 w-4" />
                    <Label htmlFor="renalNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="renalYes" className="h-4 w-4" />
                    <Label htmlFor="renalYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺអាកាសយាវ</Label>
                <RadioGroup
                  value={safeFormData.anemia ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, anemia: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="anemiaNo" className="h-4 w-4" />
                    <Label htmlFor="anemiaNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="anemiaYes" className="h-4 w-4" />
                    <Label htmlFor="anemiaYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺថ្លើម</Label>
                <RadioGroup
                  value={safeFormData.liver ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, liver: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="liverNo" className="h-4 w-4" />
                    <Label htmlFor="liverNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="liverYes" className="h-4 w-4" />
                    <Label htmlFor="liverYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ជំងឺរលាកថ្លើម</Label>
                <RadioGroup
                  value={safeFormData.hepatitis ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, hepatitis: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="hepatitisNo" className="h-4 w-4" />
                    <Label htmlFor="hepatitisNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="hepatitisYes" className="h-4 w-4" />
                    <Label htmlFor="hepatitisYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ផ្សេងទៀត</Label>
                <RadioGroup
                  value={safeFormData.other ? "1" : "0"}
                  onValueChange={(value) => setFormData({...formData, other: value === "1"})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="otherNo" className="h-4 w-4" />
                    <Label htmlFor="otherNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="otherYes" className="h-4 w-4" />
                    <Label htmlFor="otherYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalTreatmentHistory
