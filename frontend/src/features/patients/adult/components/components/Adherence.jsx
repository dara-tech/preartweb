import { Card, CardContent, CardHeader, CardTitle, Label, Input, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function Adherence({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-gray-300 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {showKhmer ? 'ការវាយតម្លៃលើការលេបថ្នាំ (Adherence Assessment)' : 'Adherence Assessment'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {showKhmer ? 'ការពិនិត្យការលេបថ្នាំអោយត្រឹមត្រូវ' : 'Assessment of medication adherence'}
        </p>
      </div>

      {/* Adherence Questions */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">
            {showKhmer ? 'សំណួរវាយតម្លៃ (Assessment Questions)' : 'Assessment Questions'}
          </h4>
          
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-none p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                {showKhmer ? 'តើអ្នកធ្លាប់ភ្លេចលេបថ្នាំ ARV ឬទេ? Have you missed any ARV doses?' : 'Have you missed any ARV doses?'}
              </h5>
              <RadioGroup
                value={formData.missARV?.toString() || '0'}
                onValueChange={(value) => handleInputChange('missARV', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="0" id="no-miss" />
                  <Label htmlFor="no-miss" className="cursor-pointer text-sm">
                    {showKhmer ? 'ទេ មិនធ្លាប់ភ្លេច No, never missed' : 'No, never missed'}
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="1" id="yes-miss" />
                  <Label htmlFor="yes-miss" className="cursor-pointer text-sm">
                    {showKhmer ? 'បាទ/ចាស ធ្លាប់ភ្លេច Yes, have missed' : 'Yes, have missed'}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border border-gray-300 rounded-none p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                {showKhmer ? 'តើអ្នកធ្លាប់លេបថ្នាំមិនទាន់ពេលវេលាឬទេ? Have you taken medication at wrong times?' : 'Have you taken medication at wrong times?'}
              </h5>
              <RadioGroup
                value={formData.missTime?.toString() || '0'}
                onValueChange={(value) => handleInputChange('missTime', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="0" id="no-time" />
                  <Label htmlFor="no-time" className="cursor-pointer text-sm">
                    {showKhmer ? 'ទេ លេបត្រឹមត្រូវ No, always on time' : 'No, always on time'}
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="1" id="yes-time" />
                  <Label htmlFor="yes-time" className="cursor-pointer text-sm">
                    {showKhmer ? 'បាទ/ចាស ធ្លាប់លេបមិនទាន់ពេល Yes, sometimes late' : 'Yes, sometimes late'}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adherence;