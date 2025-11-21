import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Checkbox } from "@/components/ui";
import React from 'react';

function BasicInformationSection({ formData, handleInputChange, dropdownOptions }) {
  const formatSiteDisplay = (site) => {
    if (!site) return ''
    if (typeof site === 'string' && site.includes('--')) return site
    return site
  }

  // Calculate age from DOB and first visit
  const calculateAge = () => {
    if (!formData.dateOfBirth || !formData.dateFirstVisit) return ''
    const dob = new Date(formData.dateOfBirth)
    const firstVisit = new Date(formData.dateFirstVisit)
    if (isNaN(dob.getTime()) || isNaN(firstVisit.getTime())) return ''
    const age = firstVisit.getFullYear() - dob.getFullYear()
    const monthDiff = firstVisit.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && firstVisit.getDate() < dob.getDate())) {
      return age - 1
    }
    return age
  }

  // Handle date changes that affect age
  const handleDateChange = (field, value) => {
    handleInputChange(field, value)
    if ((field === 'dateOfBirth' || field === 'dateFirstVisit') && formData.dateOfBirth && formData.dateFirstVisit) {
      const age = calculateAge()
      if (age >= 15 && age <= 100) {
        handleInputChange('age', age.toString())
      }
    }
  }

  // Handle age change - calculate DOB
  const handleAgeChange = (value) => {
    handleInputChange('age', value)
    if (value && formData.dateFirstVisit) {
      const firstVisit = new Date(formData.dateFirstVisit)
      if (!isNaN(firstVisit.getTime())) {
        const dob = new Date(firstVisit)
        dob.setFullYear(dob.getFullYear() - parseInt(value))
        handleInputChange('dateOfBirth', dob.toISOString().split('T')[0])
      }
    }
  }

  const handleLostReturnChange = (checked) => {
    handleInputChange('lostReturn', checked)
    if (!checked) {
      handleInputChange('typeOfReturn', -1)
      handleInputChange('returnClinicId', '')
      handleInputChange('oldSiteName', '')
    }
  }

  const handleTypeOfReturnChange = (value) => {
    handleInputChange('typeOfReturn', parseInt(value))
    if (parseInt(value) !== 1) {
      handleInputChange('oldSiteName', '')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ព័ត៌មានមូលដ្ឋាន</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Basic Information</p>
      </div>

      {/* Main Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clinicId" className="text-xs font-medium text-foreground">
            លេខកូដអ្នកជំងឺ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clinicId"
            value={formData.clinicId || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (value.length <= 6) {
                handleInputChange('clinicId', value)
              }
            }}
            onBlur={(e) => {
              if (e.target.value && e.target.value.length <= 6) {
                handleInputChange('clinicId', e.target.value.padStart(6, '0'))
              }
            }}
            placeholder="000000"
            className="h-9 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateFirstVisit" className="text-xs font-medium text-foreground">
            កាលបរិច្ឆេទមកពិនិត្យដំបូង <span className="text-red-500">*</span>
          </Label>
            <Input
              id="dateFirstVisit"
              type="date"
              value={formData.dateFirstVisit || ''}
              onChange={(e) => handleDateChange('dateFirstVisit', e.target.value)}
              className="h-9 text-sm"
              required
            />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age" className="text-xs font-medium text-foreground">
            អាយុ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="15"
            max="100"
            value={formData.age || ''}
            onChange={(e) => handleAgeChange(e.target.value)}
            placeholder="15-100"
            className="h-9 text-sm"
            required
          />
        </div>
      </div>

      {/* Lost/Return Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="lostReturn"
            checked={formData.lostReturn || false}
            onCheckedChange={handleLostReturnChange}
            className="h-4 w-4"
          />
          <Label htmlFor="lostReturn" className="text-sm font-medium text-foreground cursor-pointer">
            បាត់បង់/ត្រឡប់មកវិញ / Lost/Return
          </Label>
        </div>

        {formData.lostReturn && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">ប្រភេទត្រឡប់មកវិញ</Label>
              <RadioGroup
                value={formData.typeOfReturn === -1 ? '' : formData.typeOfReturn.toString()}
                onValueChange={handleTypeOfReturnChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="returnIn" className="h-4 w-4" />
                  <Label htmlFor="returnIn" className="text-xs cursor-pointer">In</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="returnOut" className="h-4 w-4" />
                  <Label htmlFor="returnOut" className="text-xs cursor-pointer">Out</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="returnClinicId" className="text-xs font-medium text-muted-foreground">
                លេខកូដអ្នកជំងឺត្រឡប់មកវិញ
              </Label>
              <Input
                id="returnClinicId"
                value={formData.returnClinicId || ''}
                onChange={(e) => handleInputChange('returnClinicId', e.target.value)}
                placeholder="000000"
                className="h-9 text-sm"
              />
            </div>

            {formData.typeOfReturn === 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="oldSiteName" className="text-xs font-medium text-muted-foreground">
                  ឈ្មោះមណ្ឌលចាស់
                </Label>
                <Select
                  value={formData.oldSiteName || ''}
                  onValueChange={(value) => handleInputChange('oldSiteName', value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.sites?.map((site) => (
                      <SelectItem key={site.id || site.sid} value={formatSiteDisplay(site.name || `${site.sid} -- ${site.sitename}`)}>
                        {site.name || `${site.sid} -- ${site.sitename}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BasicInformationSection;

