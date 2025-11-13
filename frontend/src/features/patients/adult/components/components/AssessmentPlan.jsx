import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem, Checkbox, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import React from 'react';

function AssessmentPlan({ formData, handleInputChange, visitId, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-gray-300 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {showKhmer ? 'ផែនការព្យាបាល (Treatment Plan)' : 'Treatment Plan'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {showKhmer ? 'ផែនការព្យាបាល និងការតាមដាន' : 'Treatment plan and follow-up'}
        </p>
      </div>

      {/* ARV Treatment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ព្យាបាល ARV (ARV Treatment)' : 'ARV Treatment'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'បន្ទាត់ព្យាបាល ARV ARV Line' : 'ARV Line'}
            </Label>
            <RadioGroup
              value={formData.arvLine?.toString() || '0'}
              onValueChange={(value) => handleInputChange('arvLine', value)}
              className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
                <RadioGroupItem value="0" id="arv-first" />
                <Label htmlFor="arv-first" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 1 First Line' : 'First Line'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
                <RadioGroupItem value="1" id="arv-second" />
                <Label htmlFor="arv-second" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 2 Second Line' : 'Second Line'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
                <RadioGroupItem value="2" id="arv-third" />
                <Label htmlFor="arv-third" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 3 Third Line' : 'Third Line'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* ARV Drugs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ថ្នាំ ARV (ARV Drugs)' : 'ARV Drugs'}
        </h4>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div key={index} className="border border-gray-300 rounded-none p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {showKhmer ? `ថ្នាំ ARV ${index} ARV Drug ${index}` : `ARV Drug ${index}`}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`arvDrug${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}
                  </Label>
                  <Input
                    id={`arvDrug${index}`}
                    value={formData[`arvDrug${index}`] || ''}
                    onChange={(e) => handleInputChange(`arvDrug${index}`, e.target.value)}
                    placeholder="Enter drug name"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`arvDose${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ចំនួន Dose' : 'Dose'}
                  </Label>
                  <Input
                    id={`arvDose${index}`}
                    value={formData[`arvDose${index}`] || ''}
                    onChange={(e) => handleInputChange(`arvDose${index}`, e.target.value)}
                    placeholder="Enter dose"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`arvQuantity${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}
                  </Label>
                  <Input
                    id={`arvQuantity${index}`}
                    value={formData[`arvQuantity${index}`] || ''}
                    onChange={(e) => handleInputChange(`arvQuantity${index}`, e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`arvFrequency${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}
                  </Label>
                  <Input
                    id={`arvFrequency${index}`}
                    value={formData[`arvFrequency${index}`] || ''}
                    onChange={(e) => handleInputChange(`arvFrequency${index}`, e.target.value)}
                    placeholder="e.g., Daily"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OI Drugs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ថ្នាំ OI (OI Drugs)' : 'OI Drugs'}
        </h4>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="border border-gray-300 rounded-none p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {showKhmer ? `ថ្នាំ OI ${index} OI Drug ${index}` : `OI Drug ${index}`}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`oiDrug${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}
                  </Label>
                  <Input
                    id={`oiDrug${index}`}
                    value={formData[`oiDrug${index}`] || ''}
                    onChange={(e) => handleInputChange(`oiDrug${index}`, e.target.value)}
                    placeholder="Enter drug name"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`oiDose${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ចំនួន Dose' : 'Dose'}
                  </Label>
                  <Input
                    id={`oiDose${index}`}
                    value={formData[`oiDose${index}`] || ''}
                    onChange={(e) => handleInputChange(`oiDose${index}`, e.target.value)}
                    placeholder="Enter dose"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`oiQuantity${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}
                  </Label>
                  <Input
                    id={`oiQuantity${index}`}
                    value={formData[`oiQuantity${index}`] || ''}
                    onChange={(e) => handleInputChange(`oiQuantity${index}`, e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`oiFrequency${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}
                  </Label>
                  <Input
                    id={`oiFrequency${index}`}
                    value={formData[`oiFrequency${index}`] || ''}
                    onChange={(e) => handleInputChange(`oiFrequency${index}`, e.target.value)}
                    placeholder="e.g., Daily"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HCV Drugs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ថ្នាំ HCV (HCV Drugs)' : 'HCV Drugs'}
        </h4>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border border-gray-300 rounded-none p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {showKhmer ? `ថ្នាំ HCV ${index} HCV Drug ${index}` : `HCV Drug ${index}`}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`hcvDrug${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}
                  </Label>
                  <Input
                    id={`hcvDrug${index}`}
                    value={formData[`hcvDrug${index}`] || ''}
                    onChange={(e) => handleInputChange(`hcvDrug${index}`, e.target.value)}
                    placeholder="Enter drug name"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`hcvDose${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ចំនួន Dose' : 'Dose'}
                  </Label>
                  <Input
                    id={`hcvDose${index}`}
                    value={formData[`hcvDose${index}`] || ''}
                    onChange={(e) => handleInputChange(`hcvDose${index}`, e.target.value)}
                    placeholder="Enter dose"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`hcvQuantity${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}
                  </Label>
                  <Input
                    id={`hcvQuantity${index}`}
                    value={formData[`hcvQuantity${index}`] || ''}
                    onChange={(e) => handleInputChange(`hcvQuantity${index}`, e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`hcvFrequency${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}
                  </Label>
                  <Input
                    id={`hcvFrequency${index}`}
                    value={formData[`hcvFrequency${index}`] || ''}
                    onChange={(e) => handleInputChange(`hcvFrequency${index}`, e.target.value)}
                    placeholder="e.g., Daily"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TPT Treatment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ព្យាបាល TPT (TPT Treatment)' : 'TPT Treatment'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'តើអ្នកជំងឺត្រូវព្យាបាល TPT ឬទេ? Does patient need TPT treatment?' : 'Does patient need TPT treatment?'}
            </Label>
            <RadioGroup
              value={formData.tpt?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tpt', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-tpt" />
                <Label htmlFor="no-tpt" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-tpt" />
                <Label htmlFor="yes-tpt" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* TPT Drugs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ថ្នាំ TPT (TPT Drugs)' : 'TPT Drugs'}
        </h4>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="border border-gray-300 rounded-none p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {showKhmer ? `ថ្នាំ TPT ${index} TPT Drug ${index}` : `TPT Drug ${index}`}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`tptDrug${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}
                  </Label>
                  <Input
                    id={`tptDrug${index}`}
                    value={formData[`tptDrug${index}`] || ''}
                    onChange={(e) => handleInputChange(`tptDrug${index}`, e.target.value)}
                    placeholder="Enter drug name"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tptDose${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ចំនួន Dose' : 'Dose'}
                  </Label>
                  <Input
                    id={`tptDose${index}`}
                    value={formData[`tptDose${index}`] || ''}
                    onChange={(e) => handleInputChange(`tptDose${index}`, e.target.value)}
                    placeholder="Enter dose"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tptQuantity${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}
                  </Label>
                  <Input
                    id={`tptQuantity${index}`}
                    value={formData[`tptQuantity${index}`] || ''}
                    onChange={(e) => handleInputChange(`tptQuantity${index}`, e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tptFrequency${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}
                  </Label>
                  <Input
                    id={`tptFrequency${index}`}
                    value={formData[`tptFrequency${index}`] || ''}
                    onChange={(e) => handleInputChange(`tptFrequency${index}`, e.target.value)}
                    placeholder="e.g., Daily"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TB Drugs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ថ្នាំ TB (TB Drugs)' : 'TB Drugs'}
        </h4>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border border-gray-300 rounded-none p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                {showKhmer ? `ថ្នាំ TB ${index} TB Drug ${index}` : `TB Drug ${index}`}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`tbDrug${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}
                  </Label>
                  <Input
                    id={`tbDrug${index}`}
                    value={formData[`tbDrug${index}`] || ''}
                    onChange={(e) => handleInputChange(`tbDrug${index}`, e.target.value)}
                    placeholder="Enter drug name"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tbDose${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ចំនួន Dose' : 'Dose'}
                  </Label>
                  <Input
                    id={`tbDose${index}`}
                    value={formData[`tbDose${index}`] || ''}
                    onChange={(e) => handleInputChange(`tbDose${index}`, e.target.value)}
                    placeholder="Enter dose"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tbQuantity${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}
                  </Label>
                  <Input
                    id={`tbQuantity${index}`}
                    value={formData[`tbQuantity${index}`] || ''}
                    onChange={(e) => handleInputChange(`tbQuantity${index}`, e.target.value)}
                    placeholder="Enter quantity"
                    className="mt-1 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor={`tbFrequency${index}`} className="text-sm text-gray-600">
                    {showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}
                  </Label>
                  <Input
                    id={`tbFrequency${index}`}
                    value={formData[`tbFrequency${index}`] || ''}
                    onChange={(e) => handleInputChange(`tbFrequency${index}`, e.target.value)}
                    placeholder="e.g., Daily"
                    className="mt-1 border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Group */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ក្រុមគោលដៅ (Target Group)' : 'Target Group'}
        </h4>
        <div>
          <Label htmlFor="targetGroup" className="text-sm text-gray-700">
            {showKhmer ? 'ក្រុមគោលដៅ Target Group' : 'Target Group'}
          </Label>
          <Input
            id="targetGroup"
            value={formData.targetGroup || ''}
            onChange={(e) => handleInputChange('targetGroup', e.target.value)}
            placeholder="Enter target group"
            className="mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* Function Assessment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ការវាយតម្លៃមុខងារ (Function Assessment)' : 'Function Assessment'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'មុខងាររាងកាយ Physical Function' : 'Physical Function'}
            </Label>
            <RadioGroup
              value={formData.function?.toString() || '0'}
              onValueChange={(value) => handleInputChange('function', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="function-normal" />
                <Label htmlFor="function-normal" className="cursor-pointer text-sm">
                  {showKhmer ? 'ធម្មតា Normal' : 'Normal'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="function-impaired" />
                <Label htmlFor="function-impaired" className="cursor-pointer text-sm">
                  {showKhmer ? 'ខូច Impaired' : 'Impaired'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'លទ្ធផលពិនិត្យអាកាសធាតុ TB Test Result' : 'TB Test Result'}
            </Label>
            <RadioGroup
              value={formData.tbOut?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tbOut', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="tb-out-negative" />
                <Label htmlFor="tb-out-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'អវិជ្ជមាន Negative' : 'Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="tb-out-positive" />
                <Label htmlFor="tb-out-positive" className="cursor-pointer text-sm">
                  {showKhmer ? 'វិជ្ជមាន Positive' : 'Positive'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ការតាមដាន (Follow-up)' : 'Follow-up'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="appointmentDate" className="text-sm text-gray-700">
              {showKhmer ? 'កាលបរិច្ឆេទណាត់ជួប Appointment Date' : 'Appointment Date'}
            </Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate || ''}
              onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'កម្មវិធីការងារ Field Worker' : 'Field Worker'}
            </Label>
            <RadioGroup
              value={formData.foWorker?.toString() || '0'}
              onValueChange={(value) => handleInputChange('foWorker', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-fo" />
                <Label htmlFor="no-fo" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-fo" />
                <Label htmlFor="yes-fo" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Side Effects */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ផលប៉ះពាល់ (Side Effects)' : 'Side Effects'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              {showKhmer ? 'ផលប៉ះពាល់ពីថ្នាំ (Drug Side Effects)' : 'Drug Side Effects'}
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="moderate"
                  checked={formData.moderate === '1'}
                  onCheckedChange={(checked) => handleInputChange('moderate', checked ? '1' : '0')}
                />
                <Label htmlFor="moderate" className="cursor-pointer text-sm">
                  {showKhmer ? 'ផលប៉ះពាល់មធ្យម Moderate' : 'Moderate'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="tdf"
                  checked={formData.tdf === '1'}
                  onCheckedChange={(checked) => handleInputChange('tdf', checked ? '1' : '0')}
                />
                <Label htmlFor="tdf" className="cursor-pointer text-sm">
                  {showKhmer ? 'TDF Side Effects' : 'TDF Side Effects'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="rash"
                  checked={formData.rash === '1'}
                  onCheckedChange={(checked) => handleInputChange('rash', checked ? '1' : '0')}
                />
                <Label htmlFor="rash" className="cursor-pointer text-sm">
                  {showKhmer ? 'រោគស្បែក Rash' : 'Rash'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hepatitis"
                  checked={formData.hepatitis === '1'}
                  onCheckedChange={(checked) => handleInputChange('hepatitis', checked ? '1' : '0')}
                />
                <Label htmlFor="hepatitis" className="cursor-pointer text-sm">
                  {showKhmer ? 'រោគថ្លើម Hepatitis' : 'Hepatitis'}
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              {showKhmer ? 'ផលប៉ះពាល់ផ្សេងទៀត (Other Side Effects)' : 'Other Side Effects'}
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="peripheral"
                  checked={formData.peripheral === '1'}
                  onCheckedChange={(checked) => handleInputChange('peripheral', checked ? '1' : '0')}
                />
                <Label htmlFor="peripheral" className="cursor-pointer text-sm">
                  {showKhmer ? 'ជំងឺប្រព័ន្ធប្រសាទ Peripheral Neuropathy' : 'Peripheral Neuropathy'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="azt"
                  checked={formData.azt === '1'}
                  onCheckedChange={(checked) => handleInputChange('azt', checked ? '1' : '0')}
                />
                <Label htmlFor="azt" className="cursor-pointer text-sm">
                  {showKhmer ? 'AZT Side Effects' : 'AZT Side Effects'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="lactic"
                  checked={formData.lactic === '1'}
                  onCheckedChange={(checked) => handleInputChange('lactic', checked ? '1' : '0')}
                />
                <Label htmlFor="lactic" className="cursor-pointer text-sm">
                  {showKhmer ? 'អាស៊ីដឡាក់ទិក Lactic Acidosis' : 'Lactic Acidosis'}
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="mediOther" className="text-sm text-gray-700">
            {showKhmer ? 'ផលប៉ះពាល់ផ្សេងទៀត Other Side Effects' : 'Other Side Effects'}
          </Label>
          <Input
            id="mediOther"
            value={formData.mediOther || ''}
            onChange={(e) => handleInputChange('mediOther', e.target.value)}
            placeholder="Enter other side effects"
            className="mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* Laboratory Tests */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ការពិនិត្យមន្ទីរពិសោធន៍ (Laboratory Tests)' : 'Laboratory Tests'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ការពិនិត្យ HIV HIV Test' : 'HIV Test'}
            </Label>
            <RadioGroup
              value={formData.testHIV?.toString() || '0'}
              onValueChange={(value) => handleInputChange('testHIV', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hiv-test" />
                <Label htmlFor="no-hiv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hiv-test" />
                <Label htmlFor="yes-hiv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'លទ្ធផល HIV HIV Result' : 'HIV Result'}
            </Label>
            <RadioGroup
              value={formData.resultHIV?.toString() || '0'}
              onValueChange={(value) => handleInputChange('resultHIV', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="hiv-negative" />
                <Label htmlFor="hiv-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'អវិជ្ជមាន Negative' : 'Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="hiv-positive" />
                <Label htmlFor="hiv-positive" className="cursor-pointer text-sm">
                  {showKhmer ? 'វិជ្ជមាន Positive' : 'Positive'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cd4Date" className="text-sm text-gray-700">
              {showKhmer ? 'កាលបរិច្ឆេទពិនិត្យ CD4 CD4 Test Date' : 'CD4 Test Date'}
            </Label>
            <Input
              id="cd4Date"
              type="date"
              value={formData.cd4Date || ''}
              onChange={(e) => handleInputChange('cd4Date', e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="viralLoadDate" className="text-sm text-gray-700">
              {showKhmer ? 'កាលបរិច្ឆេទពិនិត្យ Viral Load Viral Load Date' : 'Viral Load Date'}
            </Label>
            <Input
              id="viralLoadDate"
              type="date"
              value={formData.viralLoadDate || ''}
              onChange={(e) => handleInputChange('viralLoadDate', e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ការពិនិត្យ CD4 CD4 Test' : 'CD4 Test'}
            </Label>
            <RadioGroup
              value={formData.cd4Test?.toString() || '0'}
              onValueChange={(value) => handleInputChange('cd4Test', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-cd4-test" />
                <Label htmlFor="no-cd4-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-cd4-test" />
                <Label htmlFor="yes-cd4-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ការពិនិត្យ HIV Viral HIV Viral Test' : 'HIV Viral Test'}
            </Label>
            <RadioGroup
              value={formData.hivViralTest?.toString() || '0'}
              onValueChange={(value) => handleInputChange('hivViralTest', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hiv-viral-test" />
                <Label htmlFor="no-hiv-viral-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hiv-viral-test" />
                <Label htmlFor="yes-hiv-viral-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ការពិនិត្យ HCV HCV Test' : 'HCV Test'}
            </Label>
            <RadioGroup
              value={formData.hcvViralTest?.toString() || '0'}
              onValueChange={(value) => handleInputChange('hcvViralTest', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hcv-test" />
                <Label htmlFor="no-hcv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hcv-test" />
                <Label htmlFor="yes-hcv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Referral */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ការបញ្ជូន (Referral)' : 'Referral'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'តើត្រូវបញ្ជូនអ្នកជំងឺឬទេ? Does patient need referral?' : 'Does patient need referral?'}
            </Label>
            <RadioGroup
              value={formData.refer?.toString() || '0'}
              onValueChange={(value) => handleInputChange('refer', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-refer" />
                <Label htmlFor="no-refer" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-refer" />
                <Label htmlFor="yes-refer" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          {formData.refer === '1' && (
            <div>
              <Label htmlFor="referOther" className="text-sm text-gray-700">
                {showKhmer ? 'មូលហេតុបញ្ជូន Referral Reason' : 'Referral Reason'}
              </Label>
              <Input
                id="referOther"
                value={formData.referOther || ''}
                onChange={(e) => handleInputChange('referOther', e.target.value)}
                placeholder="Enter referral reason"
                className="mt-1 border-gray-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPlan;