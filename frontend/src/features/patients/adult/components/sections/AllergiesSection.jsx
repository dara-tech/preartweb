import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function AllergiesSection({ formData, setFormData, allergies, setAllergies, dropdownOptions }) {
  const handleAllergyChange = (index, field, value) => {
    const newAllergies = [...allergies]
    newAllergies[index] = {
      ...newAllergies[index],
      [field]: value === "none" ? "" : value
    }
    setAllergies(newAllergies)
  }

  const isAllergyEnabled = (index) => {
    if (index === 0) return formData.allergy === 1
    return allergies[index - 1]?.drug && allergies[index - 1].drug.trim() !== ''
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ប្រតិកម្មឱសថ</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drug Allergy</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ប្រតិកម្មឱសថ</Label>
          <RadioGroup
            value={formData.allergy === -1 ? '' : formData.allergy.toString()}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, allergy: parseInt(value) }))
              if (parseInt(value) !== 1) {
                setAllergies(Array(6).fill().map(() => ({ drug: '', reaction: '', date: '' })))
              }
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="allergyNo" className="h-4 w-4" />
              <Label htmlFor="allergyNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="allergyYes" className="h-4 w-4" />
              <Label htmlFor="allergyYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.allergy === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allergies.map((allergy, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-muted/50">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">ថ្នាំ</Label>
                    <Select
                      value={allergy.drug || "none"}
                      onValueChange={(value) => handleAllergyChange(index, 'drug', value)}
                      disabled={!isAllergyEnabled(index)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select</SelectItem>
                        {dropdownOptions.allergyDrugs?.filter(drug => drug.type === 0 || !drug.type).map((drug) => (
                          <SelectItem key={drug.id || drug.allergyid} value={drug.name || drug.allergyname}>
                            {drug.name || drug.allergyname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">ប្រតិកម្ម</Label>
                    <Select
                      value={allergy.reaction || "none"}
                      onValueChange={(value) => handleAllergyChange(index, 'reaction', value)}
                      disabled={!allergy.drug || allergy.drug === "none"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select</SelectItem>
                        {dropdownOptions.allergyTypes?.map((type) => (
                          <SelectItem key={type.id || type.allergyid} value={type.name || type.allergyname}>
                            {type.name || type.allergyname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">ថ្ងៃខែឆ្នាំ</Label>
                    <Input
                      type="date"
                      value={allergy.date || ''}
                      onChange={(e) => handleAllergyChange(index, 'date', e.target.value)}
                      disabled={!allergy.drug || allergy.drug === "none"}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllergiesSection;

