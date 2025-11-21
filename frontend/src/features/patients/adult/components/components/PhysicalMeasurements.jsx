import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import React from 'react';

function PhysicalMeasurements({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {showKhmer ? 'ការវាស់វែងរាងកាយ (Physical Measurements)' : 'Physical Measurements'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showKhmer ? 'សញ្ញាជីវិត និងការវាស់វែងរាងកាយ' : 'Vital signs and body measurements'}
        </p>
      </div>

      {/* Basic Measurements */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការវាស់វែងមូលដ្ឋាន (Basic Measurements)' : 'Basic Measurements'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="weight" className="text-sm text-foreground">
              {showKhmer ? 'ទម្ងន់ Weight (kg)' : 'Weight (kg)'}
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="Enter weight"
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm text-foreground">
              {showKhmer ? 'កម្ពស់ Height (cm)' : 'Height (cm)'}
            </Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={formData.height || ''}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder="Enter height"
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="temperature" className="text-sm text-foreground">
              {showKhmer ? 'សីតុណ្ហភាព Temperature (°C)' : 'Temperature (°C)'}
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature || ''}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              placeholder="Enter temperature"
              className="mt-1 border-border"
            />
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'សញ្ញាជីវិត (Vital Signs)' : 'Vital Signs'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="pulse" className="text-sm text-foreground">
              {showKhmer ? 'ជាល់បេះដូង Pulse (bpm)' : 'Pulse (bpm)'}
            </Label>
            <Input
              id="pulse"
              type="number"
              value={formData.pulse || ''}
              onChange={(e) => handleInputChange('pulse', e.target.value)}
              placeholder="Enter pulse rate"
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="respiration" className="text-sm text-foreground">
              {showKhmer ? 'ដង្ហើម Respiration (bpm)' : 'Respiration (bpm)'}
            </Label>
            <Input
              id="respiration"
              type="number"
              value={formData.respiration || ''}
              onChange={(e) => handleInputChange('respiration', e.target.value)}
              placeholder="Enter respiration rate"
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="bloodPressure" className="text-sm text-foreground">
              {showKhmer ? 'សម្ពាធឈាម Blood Pressure' : 'Blood Pressure'}
            </Label>
            <Input
              id="bloodPressure"
              value={formData.bloodPressure || ''}
              onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
              placeholder="e.g., 120/80"
              className="mt-1 border-border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhysicalMeasurements;