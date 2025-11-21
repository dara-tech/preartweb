import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from "@/components/ui";
import React from 'react';

function PatientIdentificationSection({ formData, handleInputChange, dropdownOptions }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">ព័ត៌មានអតិថិជន</h3>
        <p className="text-sm text-muted-foreground mt-1">Patient Identification</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label htmlFor="clinicId" className="text-sm font-medium text-foreground">
            លេខកូដអ្នកជំងឺ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="clinicId"
            value={formData.clinicId || ''}
            onChange={(e) => handleInputChange('clinicId', e.target.value)}
            placeholder="Enter Clinic ID"
            className="h-10 text-sm rounded-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientName" className="text-sm font-medium text-foreground">
            ឈ្មោះអ្នកជំងឺ
          </Label>
          <Input
            id="patientName"
            value={formData.patientName || ''}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            placeholder="Enter patient name"
            className="h-10 text-sm rounded-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFirstVisit" className="text-sm font-medium text-foreground">
            កាលបរិច្ឆេទមកពិនិត្យដំបូង <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dateFirstVisit"
            type="date"
            value={formData.dateFirstVisit || ''}
            onChange={(e) => handleInputChange('dateFirstVisit', e.target.value)}
            className="h-10 text-sm rounded-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinicIdOld" className="text-sm font-medium text-foreground">
            ករណីចាស់ ClinicID
          </Label>
          <Select
            value={formData.clinicIdOld === -1 || formData.clinicIdOld === null || formData.clinicIdOld === undefined ? "" : formData.clinicIdOld.toString()}
            onValueChange={(value) => handleInputChange('clinicIdOld', value === "none" ? "" : value)}
          >
            <SelectTrigger className="h-10 text-sm rounded-none">
              <SelectValue placeholder="Select old case" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select Old Case</SelectItem>
              <SelectItem value="P001">P001</SelectItem>
              <SelectItem value="P002">P002</SelectItem>
              <SelectItem value="P003">P003</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceSiteName" className="text-sm font-medium text-foreground">
            ឈ្មោះទីកន្លែងផ្តល់សេវា
          </Label>
          <Select
            value={formData.serviceSiteName === -1 || formData.serviceSiteName === null || formData.serviceSiteName === undefined ? "" : formData.serviceSiteName.toString()}
            onValueChange={(value) => handleInputChange('serviceSiteName', value === "none" ? "" : value)}
          >
            <SelectTrigger className="h-10 text-sm rounded-none">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.sites?.map((site) => (
                <SelectItem key={site.id || site.code} value={site.code || site.id}>
                  {site.code || site.id} - {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-6">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="reLost"
            checked={formData.reLost || false}
            onCheckedChange={(checked) => handleInputChange('reLost', checked)}
            className="h-4 w-4 rounded-none"
          />
          <Label htmlFor="reLost" className="text-sm font-medium text-foreground cursor-pointer">
            អ្នកជំងឺបាត់មុខហើយត្រឡប់មកវិញ / Patient Lost and Returned
          </Label>
        </div>
      </div>
    </div>
  );
}

export default PatientIdentificationSection;

