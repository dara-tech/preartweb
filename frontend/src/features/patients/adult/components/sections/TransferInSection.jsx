import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function TransferInSection({ formData, handleInputChange, dropdownOptions }) {
  const formatSiteDisplay = (site) => {
    if (!site) return ''
    if (typeof site === 'string' && site.includes('--')) return site
    return site
  }

  const handleTransferInChange = (value) => {
    handleInputChange('transferIn', parseInt(value))
    if (parseInt(value) !== 1) {
      handleInputChange('transferFrom', '')
      handleInputChange('dateStartART', '')
      handleInputChange('artNumber', '')
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ព័ត៌មានផ្ទេរចូល</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Transfer In Information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ផ្ទេរចូល</Label>
          <RadioGroup
            value={formData.transferIn === -1 ? '' : formData.transferIn.toString()}
            onValueChange={handleTransferInChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="transferNo" className="h-4 w-4" />
              <Label htmlFor="transferNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="transferYes" className="h-4 w-4" />
              <Label htmlFor="transferYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.transferIn === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-6 border-l-2 border-border">
            <div className="space-y-1.5">
              <Label htmlFor="transferFrom" className="text-xs font-medium text-foreground">
                ផ្ទេរពី
              </Label>
              <Select
                value={formData.transferFrom || ''}
                onValueChange={(value) => handleInputChange('transferFrom', value)}
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

            <div className="space-y-1.5">
              <Label htmlFor="dateStartART" className="text-xs font-medium text-foreground">
                កាលបរិច្ឆេទចាប់ផ្តើម ART
              </Label>
              <Input
                id="dateStartART"
                type="date"
                value={formData.dateStartART || ''}
                onChange={(e) => handleInputChange('dateStartART', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="artNumber" className="text-xs font-medium text-foreground">
                លេខ ART <span className="text-red-500">*</span>
              </Label>
              <Input
                id="artNumber"
                value={formData.artNumber || ''}
                onChange={(e) => handleInputChange('artNumber', e.target.value)}
                className="h-9 text-sm"
                required={formData.transferIn === 1}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferInSection;

