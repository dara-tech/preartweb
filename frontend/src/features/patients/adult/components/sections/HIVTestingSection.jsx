import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function HIVTestingSection({ formData, handleInputChange, dropdownOptions }) {
  const formatSiteDisplay = (site) => {
    if (!site) return ''
    if (typeof site === 'string' && site.includes('--')) return site
    return site
  }

  const handleDateTestHIVChange = (value) => {
    handleInputChange('dateTestHIV', value)
    const testDate = new Date(value)
    const today = new Date()
    if (testDate > today) {
      alert('Invalid Date of positive confirmatory HIV test')
      handleInputChange('dateTestHIV', '')
      return
    }
    const minDate = new Date('1990-01-01')
    if (testDate < minDate) {
      handleInputChange('vcctSite', '')
      handleInputChange('vcctId', '')
    }
  }

  const handleReferredChange = (value) => {
    handleInputChange('referred', parseInt(value))
    if (parseInt(value) !== 6) {
      handleInputChange('referredOther', '')
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ការពិនិត្យ HIV និងការបញ្ជូន</h3>
        <p className="text-xs text-muted-foreground mt-0.5">HIV Testing & Referral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dateTestHIV" className="text-xs font-medium text-foreground">
            កាលបរិច្ឆេទពិនិត្យ HIV
          </Label>
          <Input
            id="dateTestHIV"
            type="date"
            value={formData.dateTestHIV || ''}
            onChange={(e) => handleDateTestHIVChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vcctSite" className="text-xs font-medium text-foreground">
            ឈ្មោះមណ្ឌល VCCT
          </Label>
          <Select
            value={formData.vcctSite || ''}
            onValueChange={(value) => handleInputChange('vcctSite', value)}
            disabled={!formData.dateTestHIV || new Date(formData.dateTestHIV) < new Date('1990-01-01')}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.vcctSites?.map((site, index) => (
                <SelectItem key={site.id || site.vid || `vcct-${index}`} value={formatSiteDisplay(site.name || `${site.vid} -- ${site.vcctname}`)}>
                  {site.name || `${site.vid} -- ${site.vcctname}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vcctId" className="text-xs font-medium text-foreground">
            លេខកូដអតិថិជន VCCT
          </Label>
          <Input
            id="vcctId"
            value={formData.vcctId || ''}
            onChange={(e) => handleInputChange('vcctId', e.target.value)}
            disabled={!formData.dateTestHIV || new Date(formData.dateTestHIV) < new Date('1990-01-01')}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <Label className="text-xs font-medium text-foreground mb-2 block">បញ្ជូនពី</Label>
          <RadioGroup
            value={formData.referred === -1 ? '' : formData.referred.toString()}
            onValueChange={handleReferredChange}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="referredSelf" className="h-4 w-4" />
              <Label htmlFor="referredSelf" className="text-xs cursor-pointer">មកដោយខ្លួនឯង</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="referredCommunity" className="h-4 w-4" />
              <Label htmlFor="referredCommunity" className="text-xs cursor-pointer">ការថែទាំតាមផ្ទះ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="referredVCCT" className="h-4 w-4" />
              <Label htmlFor="referredVCCT" className="text-xs cursor-pointer">VCCT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="referredPMTCT" className="h-4 w-4" />
              <Label htmlFor="referredPMTCT" className="text-xs cursor-pointer">PMTCT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="referredTB" className="h-4 w-4" />
              <Label htmlFor="referredTB" className="text-xs cursor-pointer">TB Program</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="referredBlood" className="h-4 w-4" />
              <Label htmlFor="referredBlood" className="text-xs cursor-pointer">មផ្ឈមណ្ឌលផ្តល់ឈាម</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6" id="referredOther" className="h-4 w-4" />
              <Label htmlFor="referredOther" className="text-xs cursor-pointer">Other</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.referred === 6 && (
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="referredOther" className="text-xs font-medium text-foreground">
              បញ្ជូនពីផ្សេងទៀត
            </Label>
            <Input
              id="referredOther"
              value={formData.referredOther || ''}
              onChange={(e) => handleInputChange('referredOther', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="previousClinicId" className="text-xs font-medium text-foreground">
            លេខកូដអ្នកជំងឺមុន
          </Label>
          <Input
            id="previousClinicId"
            value={formData.previousClinicId || ''}
            onChange={(e) => {
              const value = e.target.value
              if (value.startsWith('P')) {
                handleInputChange('previousClinicId', value)
              } else if (value) {
                handleInputChange('previousClinicId', `P${value.padStart(6, '0')}`)
              } else {
                handleInputChange('previousClinicId', '')
              }
            }}
            onBlur={(e) => {
              if (e.target.value && !e.target.value.startsWith('P')) {
                handleInputChange('previousClinicId', `P${e.target.value.padStart(6, '0')}`)
              }
            }}
            placeholder="P000000"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default HIVTestingSection;

