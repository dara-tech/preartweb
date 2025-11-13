import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react'

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
    ...formData
  }

  // Treatment history handlers
  const updateDrugTreatment = (index, field, value) => {
    const newTreatments = [...treatmentHistory.drugTreatments]
    newTreatments[index] = { ...newTreatments[index], [field]: value }
    setTreatmentHistory({ ...treatmentHistory, drugTreatments: newTreatments })
  }

  const updateArvDrug = (index, value) => {
    const newArvDrugs = [...treatmentHistory.arvDrugs]
    newArvDrugs[index] = value
    setTreatmentHistory({ ...treatmentHistory, arvDrugs: newArvDrugs })
  }

  const updateDrugReaction = (index, field, value) => {
    const newReactions = [...treatmentHistory.drugReactions]
    newReactions[index] = { ...newReactions[index], [field]: value }
    setTreatmentHistory({ ...treatmentHistory, drugReactions: newReactions })
  }

  return (
    <div className="space-y-6">
      {/* TB Past Medical History and Treatment Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ប្រវត្តិនៃជំងឺរបេងកន្លងមក និង ការព្យាបាល (TB Past Medical History and Treatment)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រវត្តិជំងឺរបេង (TB History)
              </Label>
              <RadioGroup
                value={safeFormData.tbPast === -1 || safeFormData.tbPast === null || safeFormData.tbPast === undefined ? "" : safeFormData.tbPast.toString()}
                onValueChange={(value) => setFormData({...formData, tbPast: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="0" id="tbNo" className="w-4 h-4" />
                  <Label htmlFor="tbNo" className="text-sm font-medium">ទេ (No)</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="1" id="tbYes" className="w-4 h-4" />
                  <Label htmlFor="tbYes" className="text-sm font-medium">បាទ (Yes)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រវត្តិ TPT (TPT History)
              </Label>
              <RadioGroup
                value={safeFormData.tptHistory === -1 || safeFormData.tptHistory === null || safeFormData.tptHistory === undefined ? "" : safeFormData.tptHistory.toString()}
                onValueChange={(value) => setFormData({...formData, tptHistory: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="0" id="tptNo" className="w-4 h-4" />
                  <Label htmlFor="tptNo" className="text-sm font-medium">ទេ (No)</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="1" id="tptYes" className="w-4 h-4" />
                  <Label htmlFor="tptYes" className="text-sm font-medium">បាទ (Yes)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tptDateStart" className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំចាប់ផ្តើម<br/>Start Date
              </Label>
              <Input
                id="tptDateStart"
                type="date"
                value={safeFormData.tptDateStart || ''}
                onChange={(e) => setFormData({...formData, tptDateStart: e.target.value})}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tptDateEnd" className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំបញ្ចប់<br/>End Date
              </Label>
              <Input
                id="tptDateEnd"
                type="date"
                value={safeFormData.tptDateEnd || ''}
                onChange={(e) => setFormData({...formData, tptDateEnd: e.target.value})}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រភេទជំងឺរបេង (TB Type)
              </Label>
              <RadioGroup
                value={safeFormData.tbType === -1 || safeFormData.tbType === null || safeFormData.tbType === undefined ? "" : safeFormData.tbType.toString()}
                onValueChange={(value) => setFormData({...formData, tbType: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="0" id="tbPulmonary" className="w-4 h-4" />
                  <Label htmlFor="tbPulmonary" className="text-sm font-medium">Pulmonary</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="1" id="tbExtra" className="w-4 h-4" />
                  <Label htmlFor="tbExtra" className="text-sm font-medium">Extra-pulmonary</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                លទ្ធផល (TB Result)
              </Label>
              <RadioGroup
                value={safeFormData.tbResult === -1 || safeFormData.tbResult === null || safeFormData.tbResult === undefined ? "" : safeFormData.tbResult.toString()}
                onValueChange={(value) => setFormData({...formData, tbResult: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="0" id="tbCured" className="w-4 h-4" />
                  <Label htmlFor="tbCured" className="text-sm font-medium">Cured</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="1" id="tbCompleted" className="w-4 h-4" />
                  <Label htmlFor="tbCompleted" className="text-sm font-medium">Completed</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="2" id="tbFailed" className="w-4 h-4" />
                  <Label htmlFor="tbFailed" className="text-sm font-medium">Failed</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ការព្យាបាល (TB Treatment)
              </Label>
              <RadioGroup
                value={safeFormData.tbTreatment === -1 || safeFormData.tbTreatment === null || safeFormData.tbTreatment === undefined ? "" : safeFormData.tbTreatment.toString()}
                onValueChange={(value) => setFormData({...formData, tbTreatment: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="0" id="tbNoTreatment" className="w-4 h-4" />
                  <Label htmlFor="tbNoTreatment" className="text-sm font-medium">No Treatment</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-red-50">
                  <RadioGroupItem value="1" id="tbTreated" className="w-4 h-4" />
                  <Label htmlFor="tbTreated" className="text-sm font-medium">Treated</Label>
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
                </tr>
              </thead>
              <tbody>
                {treatmentHistory.drugTreatments.map((treatment, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">
                      <Select
                        value={treatment.drugDetails || "none"}
                        onValueChange={(value) => updateDrugTreatment(index, 'drugDetails', value === "none" ? "" : value)}
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
                        onValueChange={(value) => updateDrugTreatment(index, 'clinic', value === "none" ? "" : value)}
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
                        onChange={(e) => updateDrugTreatment(index, 'startDate', e.target.value)}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        type="date"
                        value={treatment.stopDate}
                        onChange={(e) => updateDrugTreatment(index, 'stopDate', e.target.value)}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        value={treatment.remarks}
                        onChange={(e) => updateDrugTreatment(index, 'remarks', e.target.value)}
                        placeholder="Enter remarks"
                        className="border-0 focus:ring-0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Drug Allergy Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ប្រតិកម្មឱសថ (Drug Allergy)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Drug Reactions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - 3 entries */}
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs font-medium">ឈ្មោះឱសថ Drug</Label>
                      <Select
                        value={treatmentHistory.drugReactions[index]?.drug1 || 'none'}
                        onValueChange={(value) => updateDrugReaction(index, 'drug1', value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue placeholder="Select Drug" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">Select Drug</SelectItem>
                          {dropdownOptions.allergyDrugs?.map((drug) => (
                            <SelectItem key={drug.id} value={drug.name}>
                              {drug.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ប្រតិកម្ម Allergy</Label>
                      <Input
                        value={treatmentHistory.drugReactions[index]?.reaction1 || ''}
                        onChange={(e) => updateDrugReaction(index, 'reaction1', e.target.value)}
                        placeholder="Enter reaction"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ថ្ងៃខែឆ្នាំ Date</Label>
                      <Input
                        type="date"
                        value={treatmentHistory.drugReactions[index]?.date1 || ''}
                        onChange={(e) => updateDrugReaction(index, 'date1', e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side - 3 entries */}
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs font-medium">ឈ្មោះឱសថ Drug</Label>
                      <Select
                        value={treatmentHistory.drugReactions[index]?.drug2 || 'none'}
                        onValueChange={(value) => updateDrugReaction(index, 'drug2', value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="mt-1 text-xs">
                          <SelectValue placeholder="Select Drug" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="none">Select Drug</SelectItem>
                          {dropdownOptions.allergyDrugs?.map((drug) => (
                            <SelectItem key={drug.id} value={drug.name}>
                              {drug.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ប្រតិកម្ម Allergy</Label>
                      <Input
                        value={treatmentHistory.drugReactions[index]?.reaction2 || ''}
                        onChange={(e) => updateDrugReaction(index, 'reaction2', e.target.value)}
                        placeholder="Enter reaction"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ថ្ងៃខែឆ្នាំ Date</Label>
                      <Input
                        type="date"
                        value={treatmentHistory.drugReactions[index]?.date2 || ''}
                        onChange={(e) => updateDrugReaction(index, 'date2', e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalTreatmentHistory