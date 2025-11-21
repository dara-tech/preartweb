import { Card, CardContent, CardHeader, CardTitle, Label, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react';

function Symptoms({ formData, handleInputChange, showKhmer = false }) {
  const symptoms = [
    {
      key: 'cough',
      title: showKhmer ? 'ធ្លាប់មានក្អក Cough' : 'Cough',
      description: showKhmer ? 'ក្អករយៈពេលវែង' : 'Persistent cough'
    },
    {
      key: 'fever',
      title: showKhmer ? 'ធ្លាប់មានក្តៅខ្លួន Fever' : 'Fever',
      description: showKhmer ? 'ក្តៅខ្លួនរយៈពេលវែង' : 'Persistent fever'
    },
    {
      key: 'lostWeight',
      title: showKhmer ? 'ធ្លាប់ស្រកទម្ងន់ Lost Weight' : 'Lost Weight',
      description: showKhmer ? 'ស្រកទម្ងន់ដោយមិនដឹងមូលហេតុ' : 'Unexplained weight loss'
    },
    {
      key: 'sweet',
      title: showKhmer ? 'ធ្លាប់ញ័រពេលយប់ Night Sweats' : 'Night Sweats',
      description: showKhmer ? 'ញ័រពេលយប់' : 'Excessive sweating at night'
    },
    {
      key: 'urine',
      title: showKhmer ? 'ធ្លាប់មានជំងឺផ្លូវមុត Urinary Problems' : 'Urinary Problems',
      description: showKhmer ? 'ឈឺចាប់ពេលបន្ទោរទឹក' : 'Painful urination'
    },
    {
      key: 'genital',
      title: showKhmer ? 'ធ្លាប់មានជំងឺផ្លូវភេទ Genital Problems' : 'Genital Problems',
      description: showKhmer ? 'ឈឺចាប់ឬរោគផ្លូវភេទ' : 'Genital pain or discharge'
    },
    {
      key: 'chemnah',
      title: showKhmer ? 'ធ្លាប់មានជំងឺឆ្មា Chemnah' : 'Chemnah',
      description: showKhmer ? 'ជំងឺឆ្មាឬរោគផ្សេងៗ' : 'Other skin conditions'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {showKhmer ? 'រោគសញ្ញា (Symptoms)' : 'Symptoms'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showKhmer ? 'រោគសញ្ញាក្នុងរយៈពេល 4 សប្តាហ៍ចុងក្រោយ' : 'Symptoms experienced in the last 4 weeks'}
        </p>
      </div>

      {/* Symptoms List */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'រោគសញ្ញាផ្សេងៗ (Various Symptoms)' : 'Various Symptoms'}
        </h4>
        <div className="space-y-6">
          {symptoms.map((symptom) => (
            <div key={symptom.key} className="border border-border rounded-none p-4">
              <div className="space-y-3">
                <h5 className="font-medium text-foreground">{symptom.title}</h5>
                <p className="text-sm text-muted-foreground">{symptom.description}</p>
                <RadioGroup
                  value={formData[symptom.key]?.toString() || '0'}
                  onValueChange={(value) => handleInputChange(symptom.key, value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id={`${symptom.key}-no`} />
                    <Label htmlFor={`${symptom.key}-no`} className="cursor-pointer text-sm">
                      {showKhmer ? 'ទេ No' : 'No'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`${symptom.key}-yes`} />
                    <Label htmlFor={`${symptom.key}-yes`} className="cursor-pointer text-sm">
                      {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Symptoms;