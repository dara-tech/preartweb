import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react'
import { Plus, RotateCcw, X } from "lucide-react"

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
    // Handle "none" value for dropdowns - convert to empty string
    const processedValue = value === "none" ? "" : value
    const newDrugTreatments = [...treatmentHistory.drugTreatments]
    newDrugTreatments[index] = {
      ...newDrugTreatments[index],
      [field]: processedValue
    }
    setTreatmentHistory(prev => ({
      ...prev,
      drugTreatments: newDrugTreatments
    }))
  }

  const handleDrugReactionChange = (index, field, value) => {
    // Handle "none" value for dropdowns - convert to empty string
    const processedValue = value === "none" ? "" : value
    const newDrugReactions = [...treatmentHistory.drugReactions]
    newDrugReactions[index] = {
      ...newDrugReactions[index],
      [field]: processedValue
    }
    setTreatmentHistory(prev => ({
      ...prev,
      drugReactions: newDrugReactions
    }))
  }

  return (
    <div className="space-y-6">
      {/* TB Past Medical History and Treatment Section */}
      <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="bg-teal-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-teal-600 font-bold">1</span>
            </div>
            ប្រវត្តិជំងឺរបេង និង ការព្យាបាល (TB Past Medical History and Treatment)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">

              <Label className="text-sm font-semibold text-gray-700">
                ប្រវត្តិនៃជំងឺរបេងកន្លងមក និង ការព្យាបាល<br/>TB Past Medical History and Treatment
              </Label>
              <RadioGroup
                value={safeFormData.tbPast === -1 || safeFormData.tbPast === null || safeFormData.tbPast === undefined ? "" : safeFormData.tbPast.toString()}
                onValueChange={(value) => setFormData({...formData, tbPast: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbNo" className="w-4 h-4" />
                    <Label htmlFor="tbNo" className="text-sm font-medium">គ្មាន</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbYes" className="w-4 h-4" />
                    <Label htmlFor="tbYes" className="text-sm font-medium">មាន</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="tbUnknown" className="w-4 h-4" />
                    <Label htmlFor="tbUnknown" className="text-sm font-medium">មិនដឹង</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ការព្យាបាលបង្ការជំងឺរបេង (TPT) កន្លងទៅ<br/>TPT Past Treatment
              </Label>
              <RadioGroup
                value={safeFormData.tptHistory === -1 || safeFormData.tptHistory === null || safeFormData.tptHistory === undefined ? "" : safeFormData.tptHistory.toString()}
                onValueChange={(value) => setFormData({...formData, tptHistory: parseInt(value)})}
                className="space-y-2"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tptNo" className="w-4 h-4" />
                    <Label htmlFor="tptNo" className="text-sm font-medium">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tptCompleted" className="w-4 h-4" />
                    <Label htmlFor="tptCompleted" className="text-sm font-medium">បញ្ចប់</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="tptOnTreatment" className="w-4 h-4" />
                    <Label htmlFor="tptOnTreatment" className="text-sm font-medium">កំពុងព្យាបាល</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">TPT Regimen</Label>
              <RadioGroup
                value={safeFormData.tptRegimen === -1 || safeFormData.tptRegimen === null || safeFormData.tptRegimen === undefined ? "" : safeFormData.tptRegimen.toString()}
                onValueChange={(value) => setFormData({...formData, tptRegimen: parseInt(value)})}
                className="space-y-2"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="3hp" className="w-4 h-4" />
                    <Label htmlFor="3hp" className="text-sm font-medium">3HP</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="6h" className="w-4 h-4" />
                    <Label htmlFor="6h" className="text-sm font-medium">6H</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="3rh" className="w-4 h-4" />
                    <Label htmlFor="3rh" className="text-sm font-medium">3RH</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tptDateStart" className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំចាប់ផ្តើម<br/>Start Date
              </Label>
              <Input
                id="tptDateStart"
                type="date"
                value={safeFormData.tptDateStart}
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
                value={safeFormData.tptDateEnd}
                onChange={(e) => setFormData({...formData, tptDateEnd: e.target.value})}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រភេទនៃជំងឺរបេង<br/>Type of TB
              </Label>
              <RadioGroup
                value={safeFormData.tbType === -1 || safeFormData.tbType === null || safeFormData.tbType === undefined ? "" : safeFormData.tbType.toString()}
                onValueChange={(value) => setFormData({...formData, tbType: parseInt(value)})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="pulmonary" className="w-4 h-4" />
                    <Label htmlFor="pulmonary" className="text-sm font-medium">របេងសួត(PTB)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="extraPulmonary" className="w-4 h-4" />
                    <Label htmlFor="extraPulmonary" className="text-sm font-medium">របេងក្រៅសួត (EP-TB)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="ml-6 p-4 status-critical rounded-none border border-border">
              <Label className="text-sm font-semibold text-foreground">របេងសួត(PTB)</Label>
              <RadioGroup
                value={safeFormData.tbResult === -1 || safeFormData.tbResult === null || safeFormData.tbResult === undefined ? "" : safeFormData.tbResult.toString()}
                onValueChange={(value) => setFormData({...formData, tbResult: parseInt(value)})}
                className="mt-2"
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="bkPositive" className="w-4 h-4" />
                    <Label htmlFor="bkPositive" className="text-sm font-medium">BK+</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="bkNegative" className="w-4 h-4" />
                    <Label htmlFor="bkNegative" className="text-sm font-medium">BK-</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tbDateOnset" className="text-sm font-medium">ពេលវេលាចាប់ផ្តើមឈឺ Date onset of sickness</Label>
                <Input
                  id="tbDateOnset"
                  type="date"
                  value={safeFormData.tbDateOnset}
                  onChange={(e) => setFormData({...formData, tbDateOnset: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">ព្យាបាលរបេង TB treatment</Label>
                <RadioGroup
                  value={safeFormData.tbTreatment === -1 || safeFormData.tbTreatment === null || safeFormData.tbTreatment === undefined ? "" : safeFormData.tbTreatment.toString()}
                  onValueChange={(value) => setFormData({...formData, tbTreatment: parseInt(value)})}
                  className="mt-2"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="cat1" />
                      <Label htmlFor="cat1">Cat 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="cat2" />
                      <Label htmlFor="cat2">Cat 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="cat3" />
                      <Label htmlFor="cat3">Cat 3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="cat4" />
                      <Label htmlFor="cat4">Cat 4</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="unknown" />
                      <Label htmlFor="unknown">Unknown</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbDateTreatment" className="text-sm font-semibold text-gray-700">
                  ថ្ងៃទីឆ្នាំព្យាបាល<br/>Date of treatment
                </Label>
                <Input
                  id="tbDateTreatment"
                  type="date"
                  value={safeFormData.tbDateTreatment}
                  onChange={(e) => setFormData({...formData, tbDateTreatment: e.target.value})}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tbDateComplete" className="text-sm font-semibold text-gray-700">
                Date of complete treatment
              </Label>
              <Input
                id="tbDateComplete"
                type="date"
                value={safeFormData.tbDateComplete}
                onChange={(e) => setFormData({...formData, tbDateComplete: e.target.value})}
                className="h-10"
              />
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

      {/* Other Medical Treatment History Section */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardTitle className="text-xl font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            ប្រវត្តិនៃការព្យាបាលជំងឺផ្សេងទៀត (Other Medical Treatment History)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">ប្រភេទជំងឺ / Type of illness</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">បញ្ជាក់លម្អិតការព្យាបាលដោយថ្នាំ / Details of drug treatment</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">មន្ទីរពេទ្យ/គ្លីនិក / Clinic/source</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">ថ្ងៃខែឆ្នាំចាប់ផ្តើម / Start date</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">ថ្ងៃខែឆ្នាំបញ្ឈប់ / Stop date</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">កំណត់សម្គាល់</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Diabetes', field: 'diabetes' },
                  { name: 'Hypertension', field: 'hypertension' },
                  { name: 'Abnormal Lipidemia', field: 'abnormal' },
                  { name: 'Renal disease', field: 'renal' },
                  { name: 'Anemia', field: 'anemia' },
                  { name: 'Liver disease', field: 'liver' },
                  { name: 'Hep B/Hep C', field: 'hepatitis' },
                  { name: 'Other', field: 'other' }
                ].map((illness, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData[illness.field] || false}
                          onCheckedChange={(checked) => setFormData({...formData, [illness.field]: checked})}
                        />
                        <span className="text-sm">{illness.name}</span>
                        {illness.field === 'other' && (
                          <Input
                            value={safeFormData.otherIllness || ''}
                            onChange={(e) => setFormData({...formData, otherIllness: e.target.value})}
                            placeholder="Specify other illness"
                            className="ml-2 flex-1"
                          />
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Select
                        value={treatmentHistory.otherTreatments?.[index]?.drugDetails || 'none'}
                        onValueChange={(value) => {
                          const newTreatments = [...(treatmentHistory.otherTreatments || [])]
                          if (!newTreatments[index]) newTreatments[index] = {}
                          newTreatments[index].drugDetails = value === "none" ? "" : value
                          handleTreatmentHistoryChange('otherTreatments', newTreatments)
                        }}
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
                        value={treatmentHistory.otherTreatments?.[index]?.clinic || 'none'}
                        onValueChange={(value) => {
                          const newTreatments = [...(treatmentHistory.otherTreatments || [])]
                          if (!newTreatments[index]) newTreatments[index] = {}
                          newTreatments[index].clinic = value === "none" ? "" : value
                          handleTreatmentHistoryChange('otherTreatments', newTreatments)
                        }}
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
                        value={treatmentHistory.otherTreatments?.[index]?.startDate || ''}
                        onChange={(e) => {
                          const newTreatments = [...(treatmentHistory.otherTreatments || [])]
                          if (!newTreatments[index]) newTreatments[index] = {}
                          newTreatments[index].startDate = e.target.value
                          handleTreatmentHistoryChange('otherTreatments', newTreatments)
                        }}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        type="date"
                        value={treatmentHistory.otherTreatments?.[index]?.stopDate || ''}
                        onChange={(e) => {
                          const newTreatments = [...(treatmentHistory.otherTreatments || [])]
                          if (!newTreatments[index]) newTreatments[index] = {}
                          newTreatments[index].stopDate = e.target.value
                          handleTreatmentHistoryChange('otherTreatments', newTreatments)
                        }}
                        className="border-0 focus:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <Input
                        value={treatmentHistory.otherTreatments?.[index]?.remarks || ''}
                        onChange={(e) => {
                          const newTreatments = [...(treatmentHistory.otherTreatments || [])]
                          if (!newTreatments[index]) newTreatments[index] = {}
                          newTreatments[index].remarks = e.target.value
                          handleTreatmentHistoryChange('otherTreatments', newTreatments)
                        }}
                        placeholder="Enter remarks"
                        className="border-0 focus:ring-0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drug Allergy Section */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardTitle className="text-xl font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">4</span>
            </div>
            ប្រតិកម្មឱសថ (Drug Allergy)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <RadioGroup
                value={treatmentHistory.hasDrugReaction === -1 || treatmentHistory.hasDrugReaction === null || treatmentHistory.hasDrugReaction === undefined ? "" : treatmentHistory.hasDrugReaction.toString()}
                onValueChange={(value) => handleTreatmentHistoryChange('hasDrugReaction', parseInt(value))}
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="reactionNo" className="w-4 h-4" />
                    <Label htmlFor="reactionNo" className="text-sm font-medium">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="reactionYes" className="w-4 h-4" />
                    <Label htmlFor="reactionYes" className="text-sm font-medium">បាទ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="reactionUnknown" className="w-4 h-4" />
                    <Label htmlFor="reactionUnknown" className="text-sm font-medium">មិនដឹង</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - 3 entries */}
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs font-medium">ឈ្មោះឱសថ Drug</Label>
                      <Select
                        value={treatmentHistory.drugReactions[index]?.drug1 || 'none'}
                        onValueChange={(value) => handleDrugReactionChange(index, 'drug1', value)}
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
                        onChange={(e) => handleDrugReactionChange(index, 'reaction1', e.target.value)}
                        placeholder="Enter reaction"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ថ្ងៃខែឆ្នាំ Date</Label>
                      <Input
                        type="date"
                        value={treatmentHistory.drugReactions[index]?.date1 || ''}
                        onChange={(e) => handleDrugReactionChange(index, 'date1', e.target.value)}
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
                        onValueChange={(value) => handleDrugReactionChange(index, 'drug2', value)}
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
                        onChange={(e) => handleDrugReactionChange(index, 'reaction2', e.target.value)}
                        placeholder="Enter reaction"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">ថ្ងៃខែឆ្នាំ Date</Label>
                      <Input
                        type="date"
                        value={treatmentHistory.drugReactions[index]?.date2 || ''}
                        onChange={(e) => handleDrugReactionChange(index, 'date2', e.target.value)}
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
