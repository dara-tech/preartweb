import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import React from 'react';

function ARVHistorySection({ formData, setFormData, arvTreatmentHistory, setArvTreatmentHistory, dropdownOptions }) {
  const handleArvTreatmentChange = (index, field, value) => {
    const newHistory = [...arvTreatmentHistory]
    newHistory[index] = {
      ...newHistory[index],
      [field]: value === "none" ? "" : value
    }
    setArvTreatmentHistory(newHistory)
  }

  const isArvDrugEnabled = (index) => {
    if (index === 0) return formData.arvHistory === 1
    return arvTreatmentHistory[index - 1]?.drug && arvTreatmentHistory[index - 1].drug.trim() !== ''
  }

  const isDateEnabled = (dateValue) => {
    return dateValue && dateValue !== '' && dateValue !== '1900-01-01'
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំARV</h3>
        <p className="text-xs text-muted-foreground mt-0.5">ARV Treatment History</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">ឱសថ ARV ដែលប្រើកន្លងមក</Label>
          <RadioGroup
            value={formData.arvHistory === -1 ? '' : formData.arvHistory.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, arvHistory: parseInt(value) }))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="arvNo" className="h-4 w-4" />
              <Label htmlFor="arvNo" className="text-xs cursor-pointer">ទេ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="arvYes" className="h-4 w-4" />
              <Label htmlFor="arvYes" className="text-xs cursor-pointer">បាទ</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.arvHistory === 1 && (
          <div className="border border-border rounded-none overflow-hidden bg-card">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    <TableHead className="text-xs font-medium">ថ្នាំ</TableHead>
                    <TableHead className="text-xs font-medium">មន្ទីរពេទ្យ</TableHead>
                    <TableHead className="text-xs font-medium">ចាប់ផ្តើម</TableHead>
                    <TableHead className="text-xs font-medium">បញ្ឈប់</TableHead>
                    <TableHead className="text-xs font-medium">កំណត់សំគាល់</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arvTreatmentHistory.map((arv, index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2">
                        <Select
                          value={arv.drug || "none"}
                          onValueChange={(value) => handleArvTreatmentChange(index, 'drug', value)}
                          disabled={!isArvDrugEnabled(index)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.drugs?.filter(drug => drug.type === 0 || !drug.type).map((drug) => (
                              <SelectItem key={drug.id || drug.drugid} value={drug.name || drug.drugname}>
                                {drug.name || drug.drugname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2">
                        <Select
                          value={arv.clinic || "none"}
                          onValueChange={(value) => handleArvTreatmentChange(index, 'clinic', value)}
                          disabled={!arv.drug || arv.drug === "none"}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.clinics?.map((clinic) => (
                              <SelectItem key={clinic.id || clinic.clinicid} value={clinic.name || clinic.clinicname}>
                                {clinic.name || clinic.clinicname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="date"
                          value={arv.startDate || ''}
                          onChange={(e) => handleArvTreatmentChange(index, 'startDate', e.target.value)}
                          disabled={!arv.drug || arv.drug === "none"}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="date"
                          value={arv.stopDate || ''}
                          onChange={(e) => handleArvTreatmentChange(index, 'stopDate', e.target.value)}
                          disabled={!isDateEnabled(arv.startDate)}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Select
                          value={arv.note || "none"}
                          onValueChange={(value) => handleArvTreatmentChange(index, 'note', value)}
                          disabled={!isDateEnabled(arv.startDate)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {dropdownOptions.reasons?.map((reason) => (
                              <SelectItem key={reason.id || reason.reasonid} value={reason.name || reason.reasonname}>
                                {reason.name || reason.reasonname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ARVHistorySection;

