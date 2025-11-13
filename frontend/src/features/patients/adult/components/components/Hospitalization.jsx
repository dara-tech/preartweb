import { Card, CardContent, CardHeader, CardTitle, Label, Input, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function Hospitalization({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-gray-300 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {showKhmer ? 'ការសម្រាកពេទ្យ (Hospitalization)' : 'Hospitalization'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {showKhmer ? 'ព័ត៌មានអំពីការសម្រាកពេទ្យ' : 'Information about hospitalization'}
        </p>
      </div>

      {/* Hospitalization Status */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {showKhmer ? 'ស្ថានភាពសម្រាកពេទ្យ (Hospitalization Status)' : 'Hospitalization Status'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">
              {showKhmer ? 'តើធ្លាប់សម្រាកពេទ្យមកឬទេ? Have you been hospitalized?' : 'Have you been hospitalized?'}
            </Label>
            <RadioGroup
              value={formData.hospital?.toString() || '0'}
              onValueChange={(value) => handleInputChange('hospital', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hospital" />
                <Label htmlFor="no-hospital" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hospital" />
                <Label htmlFor="yes-hospital" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hospital === '1' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="numHospital" className="text-sm text-gray-700">
                  {showKhmer ? 'ចំនួនដងសម្រាកពេទ្យ Number of Hospitalizations' : 'Number of Hospitalizations'}
                </Label>
                <Input
                  id="numHospital"
                  type="number"
                  value={formData.numHospital || ''}
                  onChange={(e) => handleInputChange('numHospital', e.target.value)}
                  placeholder="Enter number of hospitalizations"
                  className="mt-1 border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="reasonHospital" className="text-sm text-gray-700">
                  {showKhmer ? 'មូលហេតុសម្រាកពេទ្យ Reason for Hospitalization' : 'Reason for Hospitalization'}
                </Label>
                <Input
                  id="reasonHospital"
                  value={formData.reasonHospital || ''}
                  onChange={(e) => handleInputChange('reasonHospital', e.target.value)}
                  placeholder="Enter reason for hospitalization"
                  className="mt-1 border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hospitalization;