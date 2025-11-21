import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function DemographicsSection({ formData, handleInputChange, dropdownOptions }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានប្រជាជន</h3>
        <p className="text-xs text-gray-500 mt-0.5">Demographics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth" className="text-xs font-medium text-gray-700">
            កាលបរិច្ឆេទកំណើត
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age" className="text-xs font-medium text-gray-700">
            អាយុ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="14"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="0-14"
            className="h-9 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-700">
            ភេទ <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.sex === -1 || formData.sex === null || formData.sex === undefined ? "" : formData.sex.toString()}
            onValueChange={(value) => handleInputChange('sex', parseInt(value))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="sexFemale" className="h-4 w-4" />
              <Label htmlFor="sexFemale" className="text-xs cursor-pointer">ស្រី</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="sexMale" className="h-4 w-4" />
              <Label htmlFor="sexMale" className="text-xs cursor-pointer">ប្រុស</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nationality" className="text-xs font-medium text-gray-700">
            សញ្ជាតិ
          </Label>
          <Select
            value={formData.nationality === 'none' || formData.nationality === null || formData.nationality === undefined ? "" : formData.nationality.toString()}
            onValueChange={(value) => handleInputChange('nationality', value === "none" ? "none" : value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.nationalities?.map((nat) => (
                <SelectItem key={nat.id || nat.nid} value={String(nat.id || nat.nid)}>
                  {nat.name || nat.nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default DemographicsSection;

