import { Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
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
    <div className="space-y-5">
      {/* TB Past Medical History and Treatment Section */}
      <Card className="border border-gray-200 shadow-none bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រវត្តិជំងឺរបេង</h3>
              <p className="text-xs text-gray-500 mt-0.5">TB Past Medical History</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រវត្តិជំងឺរបេង</Label>
                <RadioGroup
                  value={safeFormData.tbPast === -1 || safeFormData.tbPast === null || safeFormData.tbPast === undefined ? "" : safeFormData.tbPast.toString()}
                  onValueChange={(value) => setFormData({...formData, tbPast: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tbNo" className="h-4 w-4" />
                    <Label htmlFor="tbNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tbYes" className="h-4 w-4" />
                    <Label htmlFor="tbYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រវត្តិ TPT</Label>
                <RadioGroup
                  value={safeFormData.inh === -1 || safeFormData.inh === null || safeFormData.inh === undefined ? "" : safeFormData.inh.toString()}
                  onValueChange={(value) => setFormData({...formData, inh: parseInt(value)})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="tptNo" className="h-4 w-4" />
                    <Label htmlFor="tptNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="tptYes" className="h-4 w-4" />
                    <Label htmlFor="tptYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {(safeFormData.inh === 1) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <Label htmlFor="tptDateStart" className="text-xs font-medium text-gray-700">
                    ថ្ងៃខែឆ្នាំចាប់ផ្តើម
                  </Label>
                  <Input
                    id="tptDateStart"
                    type="date"
                    value={safeFormData.dateStartTPT || ''}
                    onChange={(e) => setFormData({...formData, dateStartTPT: e.target.value})}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tptDateEnd" className="text-xs font-medium text-gray-700">
                    ថ្ងៃខែឆ្នាំបញ្ចប់
                  </Label>
                  <Input
                    id="tptDateEnd"
                    type="date"
                    value={safeFormData.dateEndTPT || ''}
                    onChange={(e) => setFormData({...formData, dateEndTPT: e.target.value})}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">TPT Drug</Label>
                  <RadioGroup
                    value={safeFormData.tptDrug === -1 || safeFormData.tptDrug === null || safeFormData.tptDrug === undefined ? "" : safeFormData.tptDrug.toString()}
                    onValueChange={(value) => setFormData({...formData, tptDrug: parseInt(value)})}
                    className="space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="3hp" className="h-3 w-3" />
                      <Label htmlFor="3hp" className="text-xs cursor-pointer">3HP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="6h" className="h-3 w-3" />
                      <Label htmlFor="6h" className="text-xs cursor-pointer">6H</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="3rh" className="h-3 w-3" />
                      <Label htmlFor="3rh" className="text-xs cursor-pointer">3RH</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {safeFormData.tbPast === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">ប្រភេទជំងឺរបេង</Label>
                  <RadioGroup
                    value={safeFormData.typeTB === -1 || safeFormData.typeTB === null || safeFormData.typeTB === undefined ? "" : safeFormData.typeTB.toString()}
                    onValueChange={(value) => setFormData({...formData, typeTB: parseInt(value)})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="tbPulmonary" className="h-4 w-4" />
                      <Label htmlFor="tbPulmonary" className="text-xs cursor-pointer">Pulmonary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="tbExtra" className="h-4 w-4" />
                      <Label htmlFor="tbExtra" className="text-xs cursor-pointer">Extra-pulmonary</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">លទ្ធផល</Label>
                  <RadioGroup
                    value={safeFormData.resultTB === -1 || safeFormData.resultTB === null || safeFormData.resultTB === undefined ? "" : safeFormData.resultTB.toString()}
                    onValueChange={(value) => setFormData({...formData, resultTB: parseInt(value)})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="tbCured" className="h-4 w-4" />
                      <Label htmlFor="tbCured" className="text-xs cursor-pointer">Cured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="tbCompleted" className="h-4 w-4" />
                      <Label htmlFor="tbCompleted" className="text-xs cursor-pointer">Completed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="tbFailed" className="h-4 w-4" />
                      <Label htmlFor="tbFailed" className="text-xs cursor-pointer">Failed</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">ការព្យាបាល</Label>
                  <RadioGroup
                    value={safeFormData.tbTreat === -1 || safeFormData.tbTreat === null || safeFormData.tbTreat === undefined ? "" : safeFormData.tbTreat.toString()}
                    onValueChange={(value) => setFormData({...formData, tbTreat: parseInt(value)})}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="tbNoTreatment" className="h-4 w-4" />
                      <Label htmlFor="tbNoTreatment" className="text-xs cursor-pointer">No Treatment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="tbTreated" className="h-4 w-4" />
                      <Label htmlFor="tbTreated" className="text-xs cursor-pointer">Treated</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {safeFormData.tbPast === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <Label htmlFor="dateOnset" className="text-xs font-medium text-gray-700">
                    ពេលវេលាចាប់ផ្តើមឈឺ
                  </Label>
                  <Input
                    id="dateOnset"
                    type="date"
                    value={safeFormData.dateOnset || ''}
                    onChange={(e) => setFormData({...formData, dateOnset: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateTreat" className="text-xs font-medium text-gray-700">
                    ថ្ងៃខែឆ្នាំព្យាបាល
                  </Label>
                  <Input
                    id="dateTreat"
                    type="date"
                    value={safeFormData.dateTreat || ''}
                    onChange={(e) => setFormData({...formData, dateTreat: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateResultTreat" className="text-xs font-medium text-gray-700">
                    ថ្ងៃខែឆ្នាំបញ្ចប់ព្យាបាល
                  </Label>
                  <Input
                    id="dateResultTreat"
                    type="date"
                    value={safeFormData.dateResultTreat || ''}
                    onChange={(e) => setFormData({...formData, dateResultTreat: e.target.value})}
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
      <Card className="border border-gray-200 shadow-none bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំARV</h3>
              <p className="text-xs text-gray-500 mt-0.5">ARV Treatment History</p>
            </div>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">ថ្នាំ</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">មន្ទីរពេទ្យ</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">ចាប់ផ្តើម</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">បញ្ឈប់</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">កំណត់សំគាល់</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentHistory.drugTreatments.map((treatment, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <Select
                          value={treatment.drugDetails || "none"}
                          onValueChange={(value) => updateDrugTreatment(index, 'drugDetails', value === "none" ? "" : value)}
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
                          onValueChange={(value) => updateDrugTreatment(index, 'clinic', value === "none" ? "" : value)}
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
                          onChange={(e) => updateDrugTreatment(index, 'startDate', e.target.value)}
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="date"
                          value={treatment.stopDate}
                          onChange={(e) => updateDrugTreatment(index, 'stopDate', e.target.value)}
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          value={treatment.remarks}
                          onChange={(e) => updateDrugTreatment(index, 'remarks', e.target.value)}
                          placeholder="Remarks"
                          className="h-8 text-xs border-0 focus:ring-0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-gray-100">
              <Label className="text-xs font-medium text-gray-700">ឱសថ ARV ដែលប្រើកន្លងមក</Label>
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

      {/* Drug Allergy Section */}
      <Card className="border border-gray-200 shadow-none bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900">ប្រតិកម្មឱសថ</h3>
              <p className="text-xs text-gray-500 mt-0.5">Drug Allergy</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">ប្រតិកម្មឱសថ</Label>
              <RadioGroup
                value={safeFormData.allergy === -1 || safeFormData.allergy === null || safeFormData.allergy === undefined ? "" : safeFormData.allergy.toString()}
                onValueChange={(value) => setFormData({...formData, allergy: parseInt(value)})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="allergyNo" className="h-4 w-4" />
                  <Label htmlFor="allergyNo" className="text-xs cursor-pointer">ទេ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="allergyYes" className="h-4 w-4" />
                  <Label htmlFor="allergyYes" className="text-xs cursor-pointer">បាទ</Label>
                </div>
              </RadioGroup>
            </div>

            {safeFormData.allergy === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">ថ្នាំ</Label>
                        <Select
                          value={treatmentHistory.drugReactions[index]?.drug1 || 'none'}
                          onValueChange={(value) => updateDrugReaction(index, 'drug1', value === "none" ? "" : value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.allergyDrugs?.map((drug) => (
                              <SelectItem key={drug.id || drug.allergyid} value={drug.name || drug.allergyname}>
                                {drug.name || drug.allergyname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">ប្រតិកម្ម</Label>
                        <Input
                          value={treatmentHistory.drugReactions[index]?.reaction1 || ''}
                          onChange={(e) => updateDrugReaction(index, 'reaction1', e.target.value)}
                          placeholder="Reaction"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600">ថ្ងៃខែឆ្នាំ</Label>
                        <Input
                          type="date"
                          value={treatmentHistory.drugReactions[index]?.date1 || ''}
                          onChange={(e) => updateDrugReaction(index, 'date1', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MedicalTreatmentHistory