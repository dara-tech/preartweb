import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function PatientInformation({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-gray-300 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {showKhmer ? 'ព័ត៌មានអ្នកជំងឺ (Patient Information)' : 'Patient Information'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {showKhmer ? 'ព័ត៌មានមូលដ្ឋាន និងព័ត៌មានការពិនិត្យ' : 'Basic information and visit details'}
        </p>
      </div>

      {/* Patient Name */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ឈ្មោះអ្នកជំងឺ (Patient Name)' : 'Patient Name'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-sm text-gray-700">
              {showKhmer ? 'ឈ្មោះអ្នកជំងឺ Patient Name' : 'Patient Name'}
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter patient name"
              className="mt-1 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ព័ត៌មានមូលដ្ឋាន (Basic Information)' : 'Basic Information'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="clinicId" className="text-sm text-gray-700">
              {showKhmer ? 'លេខកូដអ្នកជំងឺ Clinic ID' : 'Clinic ID'}
            </Label>
            <Input
              id="clinicId"
              value={formData.clinicId || ''}
              onChange={(e) => handleInputChange('clinicId', e.target.value)}
              placeholder="Enter Clinic ID"
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="artNumber" className="text-sm text-gray-700">
              {showKhmer ? 'លេខ ART ART Number' : 'ART Number'}
            </Label>
            <Input
              id="artNumber"
              value={formData.artNumber || ''}
              onChange={(e) => handleInputChange('artNumber', e.target.value)}
              placeholder="Enter ART Number"
              className="mt-1 border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="visitDate" className="text-sm text-gray-700">
              {showKhmer ? 'កាលបរិច្ឆេទពិនិត្យ Visit Date' : 'Visit Date'}
            </Label>
            <Input
              id="visitDate"
              type="date"
              value={formData.visitDate || ''}
              onChange={(e) => handleInputChange('visitDate', e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Visit Status */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ប្រភេទមកពិនិត្យ (Visit Status)' : 'Visit Status'}
        </h4>
        <RadioGroup
          value={formData.visitStatus?.toString() || '0'}
          onValueChange={(value) => handleInputChange('visitStatus', value)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
            <RadioGroupItem value="0" id="visit-0" />
            <Label htmlFor="visit-0" className="cursor-pointer text-sm">
              {showKhmer ? 'មកពិនិត្យដំបូង (First Visit)' : 'First Visit'}
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
            <RadioGroupItem value="1" id="visit-1" />
            <Label htmlFor="visit-1" className="cursor-pointer text-sm">
              {showKhmer ? 'មកមុនពេលកំណត់ (Early Visit)' : 'Early Visit'}
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
            <RadioGroupItem value="2" id="visit-2" />
            <Label htmlFor="visit-2" className="cursor-pointer text-sm">
              {showKhmer ? 'មកពិនិត្យតាមការកំណត់ (Scheduled Visit)' : 'Scheduled Visit'}
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-none">
            <RadioGroupItem value="3" id="visit-3" />
            <Label htmlFor="visit-3" className="cursor-pointer text-sm">
              {showKhmer ? 'មកពិនិត្យយឺត (Late Visit)' : 'Late Visit'}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export default PatientInformation;