import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function RefugeeStatusSection({ formData, handleInputChange, dropdownOptions }) {
  const formatSiteDisplay = (site) => {
    if (!site) return ''
    if (typeof site === 'string' && site.includes('--')) return site
    return site
  }

  const handleRefugeeStatusChange = (value) => {
    handleInputChange('refugeeStatus', parseInt(value))
    if (parseInt(value) !== 0) {
      handleInputChange('refugeeART', '')
      handleInputChange('refugeeSite', '')
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ស្ថានភាពជនភៀសខ្លួន</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Refugee Status</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ជនភៀសខ្លួន</Label>
          <RadioGroup
            value={formData.refugeeStatus === -1 ? '' : formData.refugeeStatus.toString()}
            onValueChange={handleRefugeeStatusChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="refugeeYes" className="h-4 w-4" />
              <Label htmlFor="refugeeYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="refugeeNo" className="h-4 w-4" />
              <Label htmlFor="refugeeNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.refugeeStatus === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-border">
            <div className="space-y-1.5">
              <Label htmlFor="refugeeART" className="text-xs font-medium text-foreground">
                លេខ ART ជនភៀសខ្លួន
              </Label>
              <Input
                id="refugeeART"
                value={formData.refugeeART || ''}
                onChange={(e) => handleInputChange('refugeeART', e.target.value)}
                placeholder="9-10 digits"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="refugeeSite" className="text-xs font-medium text-foreground">
                មណ្ឌលជនភៀសខ្លួន
              </Label>
              <Select
                value={formData.refugeeSite || ''}
                onValueChange={(value) => handleInputChange('refugeeSite', value)}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default RefugeeStatusSection;

