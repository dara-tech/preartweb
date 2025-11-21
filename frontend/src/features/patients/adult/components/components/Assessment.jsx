import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import React from 'react';

function Assessment({ formData, handleInputChange, showKhmer = false, dropdownOptions = {} }) {
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {showKhmer ? 'ការវាយតម្លៃគ្លីនិក (Clinical Assessment)' : 'Clinical Assessment'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showKhmer ? 'ការចំណាត់ថ្នាក់ WHO, រោគសញ្ញា, និងការរកឃើញគ្លីនិក' : 'WHO staging, symptoms, and clinical findings'}
        </p>
      </div>

      {/* WHO Staging */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ចំណាត់ថ្នាក់ WHO (WHO Staging)' : 'WHO Staging'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'ជ្រើសរើសចំណាត់ថ្នាក់ WHO Select WHO Stage' : 'Select WHO Stage'}
            </Label>
            <RadioGroup
              value={formData.whoStage?.toString() || '0'}
              onValueChange={(value) => handleInputChange('whoStage', value)}
              className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="0" id="stage-0" />
                <Label htmlFor="stage-0" className="cursor-pointer text-sm">
                  {showKhmer ? 'ដំណាក់កាល 0 Stage 0' : 'Stage 0'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="1" id="stage-1" />
                <Label htmlFor="stage-1" className="cursor-pointer text-sm">
                  {showKhmer ? 'ដំណាក់កាល 1 Stage 1' : 'Stage 1'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="2" id="stage-2" />
                <Label htmlFor="stage-2" className="cursor-pointer text-sm">
                  {showKhmer ? 'ដំណាក់កាល 2 Stage 2' : 'Stage 2'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="3" id="stage-3" />
                <Label htmlFor="stage-3" className="cursor-pointer text-sm">
                  {showKhmer ? 'ដំណាក់កាល 3 Stage 3' : 'Stage 3'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="4" id="stage-4" />
                <Label htmlFor="stage-4" className="cursor-pointer text-sm">
                  {showKhmer ? 'ដំណាក់កាល 4 Stage 4' : 'Stage 4'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'សមត្ថភាព (Eligibility)' : 'Eligibility'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'តើអ្នកជំងឺសមរួបសម្រាប់ព្យាបាល ARV ឬទេ? Is patient eligible for ARV treatment?' : 'Is patient eligible for ARV treatment?'}
            </Label>
            <RadioGroup
              value={formData.eligible?.toString() || '0'}
              onValueChange={(value) => handleInputChange('eligible', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="not-eligible" />
                <Label htmlFor="not-eligible" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ Not Eligible' : 'Not Eligible'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="eligible" />
                <Label htmlFor="eligible" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Eligible' : 'Eligible'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* TB Assessment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការវាយតម្លៃជំងឺរបេង (TB Assessment)' : 'TB Assessment'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'តើមានរោគសញ្ញាជំងឺរបេងឬទេ? TB Symptoms?' : 'TB Symptoms?'}
            </Label>
            <RadioGroup
              value={formData.tb?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tb', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-tb" />
                <Label htmlFor="no-tb" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-tb" />
                <Label htmlFor="yes-tb" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'លទ្ធផលពិនិត្យជំងឺរបេង TB Test Result' : 'TB Test Result'}
            </Label>
            <RadioGroup
              value={formData.tbResult?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tbResult', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="tb-negative" />
                <Label htmlFor="tb-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'អវិជ្ជមាន Negative' : 'Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="tb-positive" />
                <Label htmlFor="tb-positive" className="cursor-pointer text-sm">
                  {showKhmer ? 'វិជ្ជមាន Positive' : 'Positive'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Laboratory Tests */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការពិនិត្យមន្ទីរពិសោធន៍ (Laboratory Tests)' : 'Laboratory Tests'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cd4" className="text-sm text-foreground">
              {showKhmer ? 'CD4 Count' : 'CD4 Count'}
            </Label>
            <Input
              id="cd4"
              type="number"
              value={formData.cd4 || ''}
              onChange={(e) => handleInputChange('cd4', e.target.value)}
              placeholder="Enter CD4 count"
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="hivViral" className="text-sm text-foreground">
              {showKhmer ? 'HIV Viral Load' : 'HIV Viral Load'}
            </Label>
            <Input
              id="hivViral"
              type="number"
              value={formData.hivViral || ''}
              onChange={(e) => handleInputChange('hivViral', e.target.value)}
              placeholder="Enter viral load"
              className="mt-1 border-border"
            />
          </div>
        </div>
      </div>

      {/* Target Group */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ក្រុមគោលដៅ (Target Group)' : 'Target Group'}
        </h4>
        <div>
          <Label htmlFor="targetGroup" className="text-sm text-foreground">
            {showKhmer ? 'ក្រុមគោលដៅ Target Group' : 'Target Group'}
          </Label>
          <Select
            value={formData.targetGroup || ''}
            onValueChange={(value) => handleInputChange('targetGroup', value)}
          >
            <SelectTrigger className="h-9 text-sm mt-1">
              <SelectValue placeholder="Select target group" />
            </SelectTrigger>
            <SelectContent>
              {dropdownOptions.targetGroups?.map((tg) => (
                <SelectItem key={tg.id || tg.tid} value={String(tg.id || tg.tid)}>
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

export default Assessment;