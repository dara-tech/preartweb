import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function HIVTestSection({ formData, handleInputChange, dropdownOptions }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">ព័ត៌មានតេស្ត HIV</h3>
        <p className="text-sm text-muted-foreground mt-1">HIV Test Information</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">បានបញ្ជូនមកពី</Label>
          <RadioGroup
            value={formData.referred === -1 || formData.referred === null || formData.referred === undefined ? "" : formData.referred.toString()}
            onValueChange={(value) => handleInputChange('referred', parseInt(value))}
            className="space-y-2 bg-card p-3 border border-border rounded-none"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="self" className="h-4 w-4" />
              <Label htmlFor="self" className="text-sm cursor-pointer">Self</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="hospital" className="h-4 w-4" />
              <Label htmlFor="hospital" className="text-sm cursor-pointer">Hospital</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="healthCenter" className="h-4 w-4" />
              <Label htmlFor="healthCenter" className="text-sm cursor-pointer">Health Center</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="communityCare" className="h-4 w-4" />
              <Label htmlFor="communityCare" className="text-sm cursor-pointer">Community Care</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.referred === 3 && (
          <div className="space-y-2">
            <Label htmlFor="otherReferred" className="text-sm font-medium text-foreground">
              បញ្ជូនពីផ្សេងទៀត
            </Label>
            <Input
              id="otherReferred"
              value={formData.otherReferred || ''}
              onChange={(e) => handleInputChange('otherReferred', e.target.value)}
              className="h-10 text-sm rounded-none"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="dateTest" className="text-sm font-medium text-foreground">
            កាលបរិច្ឆេទតេស្ត
          </Label>
          <Input
            id="dateTest"
            type="date"
            value={formData.dateTest || ''}
            onChange={(e) => handleInputChange('dateTest', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="h-10 text-sm rounded-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">ប្រភេទតេស្ត</Label>
          <RadioGroup
            value={formData.typeTest === -1 || formData.typeTest === null || formData.typeTest === undefined ? "" : formData.typeTest.toString()}
            onValueChange={(value) => handleInputChange('typeTest', parseInt(value))}
            className="flex space-x-6 bg-card p-3 border border-border rounded-none"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="vcct" className="h-4 w-4" />
              <Label htmlFor="vcct" className="text-sm cursor-pointer">VCCT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="tb" className="h-4 w-4" />
              <Label htmlFor="tb" className="text-sm cursor-pointer">TB Program</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.typeTest === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="vcctCode" className="text-sm font-medium text-foreground">
                VCCT Code
              </Label>
              <Select
                value={formData.vcctCode === 'none' || formData.vcctCode === null || formData.vcctCode === undefined ? "" : formData.vcctCode}
                onValueChange={(value) => handleInputChange('vcctCode', value === "none" ? "none" : value)}
              >
                <SelectTrigger className="h-10 text-sm rounded-none">
                  <SelectValue placeholder="Select VCCT" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.vcctSites?.map((site) => (
                    <SelectItem key={site.id || site.vid} value={site.code || `${site.vid} -- ${site.vcctname}`}>
                      {site.code || `${site.vid} -- ${site.vcctname}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vcctId" className="text-sm font-medium text-foreground">
                VCCT ID
              </Label>
              <Input
                id="vcctId"
                value={formData.vcctId || ''}
                onChange={(e) => handleInputChange('vcctId', e.target.value)}
                className="h-10 text-sm rounded-none"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">ផ្ទេរចូល</Label>
          <RadioGroup
            value={formData.offIn === -1 || formData.offIn === null || formData.offIn === undefined ? "" : formData.offIn.toString()}
            onValueChange={(value) => handleInputChange('offIn', parseInt(value))}
            className="flex space-x-6 bg-card p-3 border border-border rounded-none"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="no" className="h-4 w-4" />
              <Label htmlFor="no" className="text-sm cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="yes" className="h-4 w-4" />
              <Label htmlFor="yes" className="text-sm cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.offIn === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-sm font-medium text-foreground">
                ឈ្មោះមណ្ឌល
              </Label>
              <Select
                value={formData.siteName || ''}
                onValueChange={(value) => handleInputChange('siteName', value)}
              >
                <SelectTrigger className="h-10 text-sm rounded-none">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.sites?.map((site) => (
                    <SelectItem key={site.id || site.sid} value={site.name || `${site.sid} -- ${site.sitename}`}>
                      {site.name || `${site.sid} -- ${site.sitename}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateART" className="text-sm font-medium text-foreground">
                កាលបរិច្ឆេទចាប់ផ្តើម ART
              </Label>
              <Input
                id="dateART"
                type="date"
                value={formData.dateART || ''}
                onChange={(e) => handleInputChange('dateART', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="h-10 text-sm rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artNumber" className="text-sm font-medium text-foreground">
                លេខ ART <span className="text-destructive">*</span>
              </Label>
              <Input
                id="artNumber"
                value={formData.artNumber || ''}
                onChange={(e) => handleInputChange('artNumber', e.target.value)}
                className="h-10 text-sm rounded-none"
                required={formData.offIn === 1}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HIVTestSection;

