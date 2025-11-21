import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function DemographicsSection({ formData, handleInputChange, dropdownOptions }) {
  const handleSexChange = (value) => {
    handleInputChange('sex', parseInt(value))
    if (formData.targetGroup) {
      const targetGroupParts = formData.targetGroup.split('--')
      const targetGroupName = targetGroupParts[1]?.trim() || ''
      if (parseInt(value) === 0 && (targetGroupName === 'MSM' || targetGroupName === 'TG' || targetGroupName === 'MEW')) {
        alert('Female can not be MSM or TG or MEW')
        handleInputChange('targetGroup', '')
      } else if (parseInt(value) === 1 && (targetGroupName === 'FEW' || targetGroupName === 'PPW')) {
        alert('Male can not be FEW or PPW')
        handleInputChange('targetGroup', '')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ព័ត៌មានប្រជាជន</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Demographics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">
            កាលបរិច្ឆេទកំណើត
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => {
              handleInputChange('dateOfBirth', e.target.value)
              // Calculate age if both DOB and first visit are set
              if (e.target.value && formData.dateFirstVisit) {
                const dob = new Date(e.target.value)
                const firstVisit = new Date(formData.dateFirstVisit)
                if (!isNaN(dob.getTime()) && !isNaN(firstVisit.getTime())) {
                  const age = firstVisit.getFullYear() - dob.getFullYear()
                  const monthDiff = firstVisit.getMonth() - dob.getMonth()
                  const calculatedAge = (monthDiff < 0 || (monthDiff === 0 && firstVisit.getDate() < dob.getDate())) ? age - 1 : age
                  if (calculatedAge >= 15 && calculatedAge <= 100) {
                    handleInputChange('age', calculatedAge.toString())
                  }
                }
              }
            }}
            max={new Date().toISOString().split('T')[0]}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            ភេទ <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.sex === -1 ? '' : formData.sex.toString()}
            onValueChange={handleSexChange}
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
          <Label htmlFor="education" className="text-xs font-medium text-foreground">
            ការអប់រំ
          </Label>
          <Select
            value={formData.education === -1 ? '' : formData.education.toString()}
            onValueChange={(value) => handleInputChange('education', parseInt(value))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Select</SelectItem>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="1">Primary</SelectItem>
              <SelectItem value="2">Secondary</SelectItem>
              <SelectItem value="3">High School</SelectItem>
              <SelectItem value="4">University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">អាចអាន</Label>
          <RadioGroup
            value={formData.canRead === -1 ? '' : formData.canRead.toString()}
            onValueChange={(value) => handleInputChange('canRead', parseInt(value))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="readNo" className="h-4 w-4" />
              <Label htmlFor="readNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="readYes" className="h-4 w-4" />
              <Label htmlFor="readYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">អាចសរសេរ</Label>
          <RadioGroup
            value={formData.canWrite === -1 ? '' : formData.canWrite.toString()}
            onValueChange={(value) => handleInputChange('canWrite', parseInt(value))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="writeNo" className="h-4 w-4" />
              <Label htmlFor="writeNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="writeYes" className="h-4 w-4" />
              <Label htmlFor="writeYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nationality" className="text-xs font-medium text-foreground">
            សញ្ជាតិ
          </Label>
          <Select
            value={formData.nationality || ''}
            onValueChange={(value) => handleInputChange('nationality', value)}
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

        <div className="space-y-1.5">
          <Label htmlFor="targetGroup" className="text-xs font-medium text-foreground">
            ក្រុមគោលដៅ
          </Label>
          <Select
            value={formData.targetGroup || ''}
            onValueChange={(value) => handleInputChange('targetGroup', value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.targetGroups?.map((tg) => (
                <SelectItem key={tg.id || tg.tid} value={`${tg.id || tg.tid}--${tg.name || tg.targroupname}`}>
                  {tg.name || tg.targroupname}
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

