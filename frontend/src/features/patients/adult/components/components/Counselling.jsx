import { Card, CardContent, CardHeader, CardTitle, Checkbox, Label } from "@/components/ui";
import React from 'react';

function Counselling({ formData, handleInputChange, showKhmer = false }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {showKhmer ? 'ការប្រឹក្សាអប់រំ (Counselling)' : 'Counselling'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showKhmer ? 'ការប្រឹក្សាអប់រំអ្នកជំងឺ' : 'Patient counselling and education'}
        </p>
      </div>

      {/* Counselling Topics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ប្រធានបទប្រឹក្សា (Counselling Topics)' : 'Counselling Topics'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="prevention"
                checked={formData.prevention === '1'}
                onCheckedChange={(checked) => handleInputChange('prevention', checked ? '1' : '0')}
              />
              <Label htmlFor="prevention" className="cursor-pointer text-sm">
                {showKhmer ? 'ការបង្ការជំងឺកាមរោគ STI Prevention' : 'STI Prevention'}
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="adherence"
                checked={formData.adherence === '1'}
                onCheckedChange={(checked) => handleInputChange('adherence', checked ? '1' : '0')}
              />
              <Label htmlFor="adherence" className="cursor-pointer text-sm">
                {showKhmer ? 'ការប្រកបដោយភាពស្មោះត្រង់ Adherence' : 'Adherence'}
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="spacing"
                checked={formData.spacing === '1'}
                onCheckedChange={(checked) => handleInputChange('spacing', checked ? '1' : '0')}
              />
              <Label htmlFor="spacing" className="cursor-pointer text-sm">
                {showKhmer ? 'ការគ្រប់គ្រងចម្រុះ Family Planning' : 'Family Planning'}
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="tbInfect"
                checked={formData.tbInfect === '1'}
                onCheckedChange={(checked) => handleInputChange('tbInfect', checked ? '1' : '0')}
              />
              <Label htmlFor="tbInfect" className="cursor-pointer text-sm">
                {showKhmer ? 'ការបង្ការជំងឺរបេង TB Prevention' : 'TB Prevention'}
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="partner"
                checked={formData.partner === '1'}
                onCheckedChange={(checked) => handleInputChange('partner', checked ? '1' : '0')}
              />
              <Label htmlFor="partner" className="cursor-pointer text-sm">
                {showKhmer ? 'ការបង្ការបន្តជំងឺ Partner Notification' : 'Partner Notification'}
              </Label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="condom"
                checked={formData.condom === '1'}
                onCheckedChange={(checked) => handleInputChange('condom', checked ? '1' : '0')}
              />
              <Label htmlFor="condom" className="cursor-pointer text-sm">
                {showKhmer ? 'ការប្រើប្រាស់កុងដូម Condom Use' : 'Condom Use'}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Counselling;