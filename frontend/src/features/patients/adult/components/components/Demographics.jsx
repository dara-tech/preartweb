import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function Demographics({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-gray-300 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {showKhmer ? 'ព័ត៌មានបុគ្គល (Demographics)' : 'Demographics'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {showKhmer ? 'ព័ត៌មានផ្ទាល់ខ្លួន និងស្ថានភាពមានផ្ទៃពោះ' : 'Personal information and pregnancy status'}
        </p>
      </div>

      {/* Basic Demographics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ព័ត៌មានមូលដ្ឋាន (Basic Information)' : 'Basic Information'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="name" className="text-sm text-gray-700">
              {showKhmer ? 'ឈ្មោះ Name' : 'Name'}
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter patient name"
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="age" className="text-sm text-gray-700">
              {showKhmer ? 'អាយុ Age' : 'Age'}
            </Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ភេទ Gender' : 'Gender'}
            </Label>
            <RadioGroup
              value={formData.gender?.toString() || ''}
              onValueChange={(value) => handleInputChange('gender', value)}
              className="mt-2 flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="male" />
                <Label htmlFor="male" className="cursor-pointer text-sm">
                  {showKhmer ? 'ប្រុស Male' : 'Male'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="female" />
                <Label htmlFor="female" className="cursor-pointer text-sm">
                  {showKhmer ? 'ស្រី Female' : 'Female'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Pregnancy Status */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ស្ថានភាពមានផ្ទៃពោះ (Pregnancy Status)' : 'Pregnancy Status'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ស្ថានភាពមានផ្ទៃពោះ Pregnancy Status' : 'Pregnancy Status'}
            </Label>
            <RadioGroup
              value={formData.pregnantStatus?.toString() || '0'}
              onValueChange={(value) => handleInputChange('pregnantStatus', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="not-pregnant" />
                <Label htmlFor="not-pregnant" className="cursor-pointer text-sm">
                  {showKhmer ? 'មិនមានផ្ទៃពោះ Not Pregnant' : 'Not Pregnant'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="pregnant" />
                <Label htmlFor="pregnant" className="cursor-pointer text-sm">
                  {showKhmer ? 'មានផ្ទៃពោះ Pregnant' : 'Pregnant'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.pregnantStatus === '1' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm text-gray-700">
                  {showKhmer ? 'ប្រភេទមានផ្ទៃពោះ Type of Pregnancy' : 'Type of Pregnancy'}
                </Label>
                <RadioGroup
                  value={formData.typePregnant?.toString() || '0'}
                  onValueChange={(value) => handleInputChange('typePregnant', value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="0" id="single" />
                    <Label htmlFor="single" className="cursor-pointer text-sm">
                      {showKhmer ? 'មានផ្ទៃពោះតែមួយ Single' : 'Single'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="1" id="twin" />
                    <Label htmlFor="twin" className="cursor-pointer text-sm">
                      {showKhmer ? 'ផ្ទៃពោះភ្លោះ Twin' : 'Twin'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="pregnantDate" className="text-sm text-gray-700">
                  {showKhmer ? 'កាលបរិច្ឆេទមានផ្ទៃពោះ Pregnancy Date' : 'Pregnancy Date'}
                </Label>
                <Input
                  id="pregnantDate"
                  type="date"
                  value={formData.pregnantDate || ''}
                  onChange={(e) => handleInputChange('pregnantDate', e.target.value)}
                  className="mt-1 border-gray-300"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'ស្ថានភាព ANC ANC Status' : 'ANC Status'}
            </Label>
            <RadioGroup
              value={formData.ancStatus?.toString() || '0'}
              onValueChange={(value) => handleInputChange('ancStatus', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-anc" />
                <Label htmlFor="no-anc" className="cursor-pointer text-sm">
                  {showKhmer ? 'មិនមាន ANC No ANC' : 'No ANC'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="has-anc" />
                <Label htmlFor="has-anc" className="cursor-pointer text-sm">
                  {showKhmer ? 'មាន ANC Has ANC' : 'Has ANC'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demographics;