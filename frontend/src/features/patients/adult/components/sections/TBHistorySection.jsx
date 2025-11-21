import { Input, Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function TBHistorySection({ formData, setFormData }) {
  const handleTBPastChange = (value) => {
    setFormData(prev => ({ ...prev, tbPast: parseInt(value) }))
    if (parseInt(value) !== 0) {
      // Enable TB fields
    } else {
      setFormData(prev => ({
        ...prev,
        tbType: -1,
        tbResultTest: -1,
        tbDateOnset: '',
        tbTreatmentCategory: -1,
        tbDateTreatment: '',
        tbResultTreatment: -1,
        tbDateComplete: ''
      }))
    }
  }

  const handleTPTHistoryChange = (value) => {
    setFormData(prev => ({ ...prev, tptHistory: parseInt(value) }))
    if (parseInt(value) === 0) {
      setFormData(prev => ({
        ...prev,
        tptRegimen: -1,
        tptDateStart: '',
        tptDateEnd: ''
      }))
    } else if (parseInt(value) === 2) {
      setFormData(prev => ({ ...prev, tptDateEnd: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ប្រវត្តិជំងឺរបេង</h3>
        <p className="text-xs text-muted-foreground mt-0.5">TB Past Medical History</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ប្រវត្តិនៃជំងឺរបេងកន្លងមក</Label>
          <RadioGroup
            value={formData.tbPast === -1 ? '' : formData.tbPast.toString()}
            onValueChange={handleTBPastChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="tbNo" className="h-4 w-4" />
              <Label htmlFor="tbNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="tbYes" className="h-4 w-4" />
              <Label htmlFor="tbYes" className="text-xs cursor-pointer">មាន</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ការព្យាបាលបង្ការជំងឺរបេង (TPT)</Label>
          <RadioGroup
            value={formData.tptHistory === -1 ? '' : formData.tptHistory.toString()}
            onValueChange={handleTPTHistoryChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="tptNo" className="h-4 w-4" />
              <Label htmlFor="tptNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="tptCompleted" className="h-4 w-4" />
              <Label htmlFor="tptCompleted" className="text-xs cursor-pointer">បញ្ចប់</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="tptOnTreatment" className="h-4 w-4" />
              <Label htmlFor="tptOnTreatment" className="text-xs cursor-pointer">កំពុងព្យាបាល</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.tptHistory !== 0 && formData.tptHistory !== -1 && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">TPT Regimen</Label>
              <RadioGroup
                value={formData.tptRegimen === -1 ? '' : formData.tptRegimen.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tptRegimen: parseInt(value) }))}
                className="space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="3hp" className="h-4 w-4" />
                  <Label htmlFor="3hp" className="text-xs cursor-pointer">3HP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="6h" className="h-4 w-4" />
                  <Label htmlFor="6h" className="text-xs cursor-pointer">6H</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="3rh" className="h-4 w-4" />
                  <Label htmlFor="3rh" className="text-xs cursor-pointer">3RH</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tptDateStart" className="text-xs font-medium text-foreground">ថ្ងៃខែឆ្នាំចាប់ផ្តើម</Label>
              <Input
                id="tptDateStart"
                type="date"
                value={formData.tptDateStart || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tptDateStart: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            {formData.tptHistory === 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="tptDateEnd" className="text-xs font-medium text-foreground">ថ្ងៃខែឆ្នាំបញ្ចប់</Label>
                <Input
                  id="tptDateEnd"
                  type="date"
                  value={formData.tptDateEnd || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tptDateEnd: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            )}
          </>
        )}
      </div>

      {formData.tbPast === 1 && (
        <div className="pt-4 border-t border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">ប្រភេទនៃជំងឺរបេង</Label>
              <RadioGroup
                value={formData.tbType === -1 ? '' : formData.tbType.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tbType: parseInt(value) }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="pulmonary" className="h-4 w-4" />
                  <Label htmlFor="pulmonary" className="text-xs cursor-pointer">របេងសួត (PTB)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="extraPulmonary" className="h-4 w-4" />
                  <Label htmlFor="extraPulmonary" className="text-xs cursor-pointer">របេងក្រៅសួត (EP-TB)</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.tbType === 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">របេងសួត (PTB)</Label>
                <RadioGroup
                  value={formData.tbResultTest === -1 ? '' : formData.tbResultTest.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tbResultTest: parseInt(value) }))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="bkPositive" className="h-4 w-4" />
                    <Label htmlFor="bkPositive" className="text-xs cursor-pointer">BK+</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="bkNegative" className="h-4 w-4" />
                    <Label htmlFor="bkNegative" className="text-xs cursor-pointer">BK-</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tbDateOnset" className="text-xs font-medium text-foreground">ពេលវេលាចាប់ផ្តើមឈឺ</Label>
              <Input
                id="tbDateOnset"
                type="date"
                value={formData.tbDateOnset || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tbDateOnset: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">ព្យាបាលរបេង</Label>
              <RadioGroup
                value={formData.tbTreatmentCategory === -1 ? '' : formData.tbTreatmentCategory.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tbTreatmentCategory: parseInt(value) }))}
                className="space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="cat1" className="h-3 w-3" />
                  <Label htmlFor="cat1" className="text-xs cursor-pointer">Cat 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="cat2" className="h-3 w-3" />
                  <Label htmlFor="cat2" className="text-xs cursor-pointer">Cat 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="cat3" className="h-3 w-3" />
                  <Label htmlFor="cat3" className="text-xs cursor-pointer">Cat 3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="cat4" className="h-3 w-3" />
                  <Label htmlFor="cat4" className="text-xs cursor-pointer">Cat 4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="unknown" className="h-3 w-3" />
                  <Label htmlFor="unknown" className="text-xs cursor-pointer">Unknown</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tbDateTreatment" className="text-xs font-medium text-foreground">ថ្ងៃខែឆ្នាំព្យាបាល</Label>
              <Input
                id="tbDateTreatment"
                type="date"
                value={formData.tbDateTreatment || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tbDateTreatment: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">លទ្ធផលព្យាបាល</Label>
              <RadioGroup
                value={formData.tbResultTreatment === -1 ? '' : formData.tbResultTreatment.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tbResultTreatment: parseInt(value) }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="resultCured" className="h-4 w-4" />
                  <Label htmlFor="resultCured" className="text-xs cursor-pointer">Cured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="resultCompleted" className="h-4 w-4" />
                  <Label htmlFor="resultCompleted" className="text-xs cursor-pointer">Completed</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tbDateComplete" className="text-xs font-medium text-foreground">ថ្ងៃខែឆ្នាំបញ្ចប់ព្យាបាល</Label>
              <Input
                id="tbDateComplete"
                type="date"
                value={formData.tbDateComplete || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tbDateComplete: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TBHistorySection;

