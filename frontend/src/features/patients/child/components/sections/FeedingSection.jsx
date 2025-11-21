import { Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function FeedingSection({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">ព័ត៌មានការបំប៉ន</h3>
        <p className="text-sm text-muted-foreground mt-1">Feeding Information</p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-foreground">ប្រភេទការបំប៉ន</Label>
        <RadioGroup
          value={formData.feeding === -1 || formData.feeding === null || formData.feeding === undefined ? "" : formData.feeding.toString()}
          onValueChange={(value) => handleInputChange('feeding', parseInt(value))}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-card p-4 border border-border rounded-none"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="breastfeeding" className="h-4 w-4" />
            <Label htmlFor="breastfeeding" className="text-sm cursor-pointer">Breastfeeding</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="formula" className="h-4 w-4" />
            <Label htmlFor="formula" className="text-sm cursor-pointer">Formula</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="mixed" className="h-4 w-4" />
            <Label htmlFor="mixed" className="text-sm cursor-pointer">Mixed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="solid" className="h-4 w-4" />
            <Label htmlFor="solid" className="text-sm cursor-pointer">Solid Food</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="other" className="h-4 w-4" />
            <Label htmlFor="other" className="text-sm cursor-pointer">Other</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export default FeedingSection;

