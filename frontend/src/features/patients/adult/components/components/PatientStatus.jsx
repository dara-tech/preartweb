import { Card, CardContent, Input, Label, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import React from 'react';

function PatientStatus({ formData, handleInputChange, showKhmer = false, dropdownOptions = {} }) {
  // Use dropdownOptions if provided
  const reasons = dropdownOptions.reasons || [];
  const sites = dropdownOptions.sites || [];
  
  // Use reasons for cause of death
  const causeDeathOptions = reasons;
  
  // Build transfer out options from sites
  const transferOutOptions = [
    ...sites.map(site => ({
      id: site.code || site.id || site.sid,
      name: site.name || site.sitename || `${site.code || site.id || site.sid} -- ${site.name || site.sitename}`
    })),
    { id: 'Move to other site', name: 'Move to other site' },
    { id: 'Move to other country', name: 'Move to other country' },
    { id: 'Return to old site', name: 'Return to old site' }
  ];

  const handlePatientStatusChange = (value) => {
    handleInputChange('patientStatus', value);
    // Reset dependent fields
    handleInputChange('placeDead', '-1');
    handleInputChange('causeDeathType', '-1');
    handleInputChange('causeDeath', '');
    handleInputChange('outcomeDate', '1900-01-01');
    handleInputChange('otherDead', '');
    handleInputChange('transferOut', '');
  };

  const handleCauseDeathTypeChange = (value) => {
    handleInputChange('causeDeathType', value);
    handleInputChange('causeDeath', '');
    // Filter cause of death options based on type
    // This would need to be implemented based on the API response structure
  };

  const patientStatus = formData.patientStatus?.toString() || '-1';
  const showDeathFields = patientStatus === '1';
  const showTransferFields = patientStatus === '3';
  const showOutcomeDate = patientStatus !== '-1' && patientStatus !== '3';


  return (
    <Card className="border border-border shadow-none bg-card">
      <CardContent className="p-5 sm:p-6">
        <div className="border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {showKhmer ? 'ស្ថានភាពអ្នកជំងឺ (Patient Status)' : 'Patient Status'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {showKhmer ? 'ស្ថានភាពចុងក្រោយរបស់អ្នកជំងឺ' : 'Final patient status'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Patient Status Selection */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              {showKhmer ? 'ស្ថានភាព Patient Status' : 'Patient Status'}
            </Label>
            <RadioGroup
              value={patientStatus}
              onValueChange={handlePatientStatusChange}
              className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border border-border rounded bg-card">
                <RadioGroupItem value="0" id="status-lost" />
                <Label htmlFor="status-lost" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាត់បង់ Lost' : 'Lost'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded bg-card">
                <RadioGroupItem value="1" id="status-death" />
                <Label htmlFor="status-death" className="cursor-pointer text-sm">
                  {showKhmer ? 'ស្លាប់ Death' : 'Death'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded bg-card">
                <RadioGroupItem value="2" id="status-negative" />
                <Label htmlFor="status-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'HIV អវិជ្ជមាន HIV Negative' : 'HIV Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded bg-card">
                <RadioGroupItem value="3" id="status-transfer" />
                <Label htmlFor="status-transfer" className="cursor-pointer text-sm">
                  {showKhmer ? 'ផ្ទេរចេញ Transfer Out' : 'Transfer Out'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Outcome Date */}
          {showOutcomeDate && (
            <div>
              <Label htmlFor="outcomeDate" className="text-sm font-medium text-foreground">
                {showKhmer ? 'កាលបរិច្ឆេទលទ្ធផល Outcome Date' : 'Outcome Date'}
              </Label>
              <Input
                id="outcomeDate"
                type="date"
                value={formData.outcomeDate && formData.outcomeDate !== '1900-01-01' ? formData.outcomeDate : ''}
                onChange={(e) => handleInputChange('outcomeDate', e.target.value)}
                className="h-9 text-sm mt-1"
              />
            </div>
          )}

          {/* Death Fields */}
          {showDeathFields && (
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  {showKhmer ? 'កន្លែងស្លាប់ Place of Death' : 'Place of Death'}
                </Label>
                <RadioGroup
                  value={formData.placeDead?.toString() || '-1'}
                  onValueChange={(value) => handleInputChange('placeDead', value)}
                  className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="place-home" />
                    <Label htmlFor="place-home" className="cursor-pointer text-xs">
                      {showKhmer ? 'ផ្ទះ Home' : 'Home'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="place-hospital" />
                    <Label htmlFor="place-hospital" className="cursor-pointer text-xs">
                      {showKhmer ? 'មន្ទីរពេទ្យ Hospital' : 'Hospital'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="place-other" />
                    <Label htmlFor="place-other" className="cursor-pointer text-xs">
                      {showKhmer ? 'ផ្សេងៗ Other' : 'Other'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.placeDead === '2' && (
                <div>
                  <Label htmlFor="otherDead" className="text-sm font-medium text-foreground">
                    {showKhmer ? 'កន្លែងស្លាប់ផ្សេងៗ Other Place' : 'Other Place'}
                  </Label>
                  <Input
                    id="otherDead"
                    value={formData.otherDead || ''}
                    onChange={(e) => handleInputChange('otherDead', e.target.value)}
                    placeholder="Enter other place"
                    className="h-9 text-sm mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-foreground">
                  {showKhmer ? 'ប្រភេទមូលហេតុស្លាប់ Cause Type' : 'Cause Type'}
                </Label>
                <RadioGroup
                  value={formData.causeDeathType?.toString() || '-1'}
                  onValueChange={handleCauseDeathTypeChange}
                  className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="cause-aids" />
                    <Label htmlFor="cause-aids" className="cursor-pointer text-xs">
                      {showKhmer ? 'ជំងឺអេដស៍ AIDS' : 'AIDS'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="cause-tb" />
                    <Label htmlFor="cause-tb" className="cursor-pointer text-xs">
                      {showKhmer ? 'ជំងឺរបេង TB' : 'TB'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="cause-other" />
                    <Label htmlFor="cause-other" className="cursor-pointer text-xs">
                      {showKhmer ? 'ផ្សេងៗ Other' : 'Other'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="cause-unknown" />
                    <Label htmlFor="cause-unknown" className="cursor-pointer text-xs">
                      {showKhmer ? 'មិនដឹង Unknown' : 'Unknown'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.causeDeathType !== '-1' && (
                <div>
                  <Label htmlFor="causeDeath" className="text-sm font-medium text-foreground">
                    {showKhmer ? 'មូលហេតុស្លាប់ Cause of Death' : 'Cause of Death'}
                  </Label>
                  <Select
                    value={formData.causeDeath || ''}
                    onValueChange={(value) => handleInputChange('causeDeath', value)}
                  >
                    <SelectTrigger className="h-9 text-sm mt-1">
                      <SelectValue placeholder="Select cause of death" />
                    </SelectTrigger>
                    <SelectContent>
                      {causeDeathOptions.map((cause) => (
                        <SelectItem key={cause.id || cause.rid || cause.cid} value={String(cause.id || cause.rid || cause.cid)}>
                          {cause.reason || cause.name || cause.cause}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Transfer Out Fields */}
          {showTransferFields && (
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <div>
                <Label htmlFor="transferOut" className="text-sm font-medium text-foreground">
                  {showKhmer ? 'ផ្ទេរទៅ Transfer To' : 'Transfer To'}
                </Label>
                <Select
                  value={formData.transferOut || ''}
                  onValueChange={(value) => handleInputChange('transferOut', value)}
                >
                  <SelectTrigger className="h-9 text-sm mt-1">
                    <SelectValue placeholder="Select transfer destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferOutOptions.map((option) => (
                      <SelectItem key={option.id || option.name} value={option.id || option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PatientStatus;

