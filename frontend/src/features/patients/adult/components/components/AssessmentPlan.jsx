import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem, Checkbox, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@/components/ui";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

function AssessmentPlan({ formData, handleInputChange, visitId, showKhmer = false, dropdownOptions = {} }) {
  // Filter drugs by type: ARV=0, OI=1, TB=2, HCV=3, TPT=4
  const arvDrugs = dropdownOptions.drugs?.filter(drug => (drug.drugtype === 0 || drug.drugtype === '0' || drug.DrugType === 0 || drug.DrugType === '0')) || [];
  const oiDrugs = dropdownOptions.drugs?.filter(drug => (drug.drugtype === 1 || drug.drugtype === '1' || drug.DrugType === 1 || drug.DrugType === '1')) || [];
  const tbDrugs = dropdownOptions.drugs?.filter(drug => (drug.drugtype === 2 || drug.drugtype === '2' || drug.DrugType === 2 || drug.DrugType === '2')) || [];
  const hcvDrugs = dropdownOptions.drugs?.filter(drug => (drug.drugtype === 3 || drug.drugtype === '3' || drug.DrugType === 3 || drug.DrugType === '3')) || [];
  const tptDrugs = dropdownOptions.drugs?.filter(drug => (drug.drugtype === 4 || drug.drugtype === '4' || drug.DrugType === 4 || drug.DrugType === '4')) || [];
  const reasons = dropdownOptions.reasons || [];

  // Helper function to get all unique TPT drug names from formData (for cases where saved drugs aren't in dropdown)
  const getTPTDrugOptions = (index) => {
    const savedDrugName = formData[`tptDrug${index}`];
    const options = [...tptDrugs];
    
    // If there's a saved drug name that's not in the dropdown options, add it
    if (savedDrugName && !options.find(d => (d.drugname || d.name || d.DrugName) === savedDrugName)) {
      options.push({ 
        id: `saved-${index}`, 
        drugname: savedDrugName, 
        name: savedDrugName, 
        DrugName: savedDrugName 
      });
    }
    
    return options;
  };

  // State for dynamic drug entries
  const [arvDrugCount, setArvDrugCount] = useState(1);
  const [oiDrugCount, setOiDrugCount] = useState(1);
  const [tbDrugCount, setTbDrugCount] = useState(1);
  const [hcvDrugCount, setHcvDrugCount] = useState(1);
  const [tptDrugCount, setTptDrugCount] = useState(1);

  // Initialize drug counts based on existing form data
  useEffect(() => {
    // Count how many ARV drugs have values
    let arvCount = 1;
    for (let i = 1; i <= 8; i++) {
      if (formData[`arvDrug${i}`]) arvCount = i + 1;
    }
    setArvDrugCount(Math.min(arvCount, 8));

    // Count OI drugs
    let oiCount = 1;
    for (let i = 1; i <= 5; i++) {
      if (formData[`oiDrug${i}`]) oiCount = i + 1;
    }
    setOiDrugCount(Math.min(oiCount, 5));

    // Count TB drugs
    let tbCount = 1;
    for (let i = 1; i <= 3; i++) {
      if (formData[`tbDrug${i}`]) tbCount = i + 1;
    }
    setTbDrugCount(Math.min(tbCount, 3));

    // Count HCV drugs
    let hcvCount = 1;
    for (let i = 1; i <= 3; i++) {
      if (formData[`hcvDrug${i}`]) hcvCount = i + 1;
    }
    setHcvDrugCount(Math.min(hcvCount, 3));

    // Count TPT drugs
    let tptCount = 1;
    for (let i = 1; i <= 4; i++) {
      if (formData[`tptDrug${i}`]) tptCount = i + 1;
    }
    setTptDrugCount(Math.min(tptCount, 4));
  }, [formData]);

  const addDrugEntry = (type) => {
    if (type === 'arv' && arvDrugCount < 8) setArvDrugCount(prev => prev + 1);
    if (type === 'oi' && oiDrugCount < 5) setOiDrugCount(prev => prev + 1);
    if (type === 'tb' && tbDrugCount < 3) setTbDrugCount(prev => prev + 1);
    if (type === 'hcv' && hcvDrugCount < 3) setHcvDrugCount(prev => prev + 1);
    if (type === 'tpt' && tptDrugCount < 4) setTptDrugCount(prev => prev + 1);
  };

  const removeDrugEntry = (type, index) => {
    if (type === 'arv' && arvDrugCount > 1) {
      // Clear the fields for this entry
      handleInputChange(`arvDrug${index}`, '');
      handleInputChange(`arvDose${index}`, '');
      handleInputChange(`arvQuantity${index}`, '');
      handleInputChange(`arvFrequency${index}`, '');
      handleInputChange(`arvForm${index}`, '');
      handleInputChange(`arvStart${index}`, '1900-01-01');
      handleInputChange(`arvStop${index}`, '');
      handleInputChange(`arvContinue${index}`, '');
      handleInputChange(`arvDate${index}`, '1900-01-01');
      handleInputChange(`arvReason${index}`, '');
      handleInputChange(`arvRemarks${index}`, '');
      setArvDrugCount(prev => prev - 1);
    }
    if (type === 'oi' && oiDrugCount > 1) {
      handleInputChange(`oiDrug${index}`, '');
      handleInputChange(`oiDose${index}`, '');
      handleInputChange(`oiQuantity${index}`, '');
      handleInputChange(`oiFrequency${index}`, '');
      handleInputChange(`oiForm${index}`, '');
      handleInputChange(`oiStart${index}`, '1900-01-01');
      handleInputChange(`oiStop${index}`, '');
      handleInputChange(`oiContinue${index}`, '');
      handleInputChange(`oiDate${index}`, '1900-01-01');
      handleInputChange(`oiReason${index}`, '');
      handleInputChange(`oiRemarks${index}`, '');
      setOiDrugCount(prev => prev - 1);
    }
    if (type === 'tb' && tbDrugCount > 1) {
      handleInputChange(`tbDrug${index}`, '');
      handleInputChange(`tbDose${index}`, '');
      handleInputChange(`tbQuantity${index}`, '');
      handleInputChange(`tbFrequency${index}`, '');
      handleInputChange(`tbForm${index}`, '');
      handleInputChange(`tbStart${index}`, '1900-01-01');
      handleInputChange(`tbStop${index}`, '');
      handleInputChange(`tbContinue${index}`, '');
      handleInputChange(`tbDate${index}`, '1900-01-01');
      handleInputChange(`tbReason${index}`, '');
      handleInputChange(`tbRemarks${index}`, '');
      setTbDrugCount(prev => prev - 1);
    }
    if (type === 'hcv' && hcvDrugCount > 1) {
      handleInputChange(`hcvDrug${index}`, '');
      handleInputChange(`hcvDose${index}`, '');
      handleInputChange(`hcvQuantity${index}`, '');
      handleInputChange(`hcvFrequency${index}`, '');
      handleInputChange(`hcvForm${index}`, '');
      handleInputChange(`hcvStart${index}`, '1900-01-01');
      handleInputChange(`hcvStop${index}`, '');
      handleInputChange(`hcvContinue${index}`, '');
      handleInputChange(`hcvDate${index}`, '1900-01-01');
      handleInputChange(`hcvReason${index}`, '');
      handleInputChange(`hcvRemarks${index}`, '');
      setHcvDrugCount(prev => prev - 1);
    }
    if (type === 'tpt' && tptDrugCount > 1) {
      handleInputChange(`tptDrug${index}`, '');
      handleInputChange(`tptDose${index}`, '');
      handleInputChange(`tptQuantity${index}`, '');
      handleInputChange(`tptFrequency${index}`, '');
      handleInputChange(`tptForm${index}`, '');
      handleInputChange(`tptStart${index}`, '1900-01-01');
      handleInputChange(`tptStop${index}`, '');
      handleInputChange(`tptContinue${index}`, '');
      handleInputChange(`tptDate${index}`, '1900-01-01');
      handleInputChange(`tptReason${index}`, '');
      handleInputChange(`tptRemarks${index}`, '');
      setTptDrugCount(prev => prev - 1);
    }
  };
  return (
    <div className="space-y-8">
      {/* Simple Section Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">
          {showKhmer ? 'ផែនការព្យាបាល (Treatment Plan)' : 'Treatment Plan'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showKhmer ? 'ផែនការព្យាបាល និងការតាមដាន' : 'Treatment plan and follow-up'}
        </p>
      </div>

      {/* ARV Treatment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ព្យាបាល ARV (ARV Treatment)' : 'ARV Treatment'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'បន្ទាត់ព្យាបាល ARV ARV Line' : 'ARV Line'}
            </Label>
            <RadioGroup
              value={formData.arvLine?.toString() || '0'}
              onValueChange={(value) => handleInputChange('arvLine', value)}
              className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="0" id="arv-first" />
                <Label htmlFor="arv-first" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 1 First Line' : 'First Line'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="1" id="arv-second" />
                <Label htmlFor="arv-second" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 2 Second Line' : 'Second Line'}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-none bg-card">
                <RadioGroupItem value="2" id="arv-third" />
                <Label htmlFor="arv-third" className="cursor-pointer text-sm">
                  {showKhmer ? 'បន្ទាត់ទី 3 Third Line' : 'Third Line'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* ARV Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium text-foreground">
              {showKhmer ? 'ថ្នាំ ARV (ARV Drugs)' : 'ARV Drugs'}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {arvDrugCount}
            </Badge>
          </div>
          {arvDrugCount < 8 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDrugEntry('arv')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {showKhmer ? 'បន្ថែម Add' : 'Add'}
            </Button>
          )}
        </div>
        <div className="border border-border rounded-none overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium sticky left-0 bg-muted z-20 border-r border-border">{showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ចំនួន Dose' : 'Dose'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ទម្រង់ Form' : 'Form'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ស្ថានភាព Status' : 'Status'}</TableHead>
                  <TableHead className="w-[130px] text-xs font-medium">{showKhmer ? 'កាលបរិច្ឆេទ Date' : 'Date'}</TableHead>
                  <TableHead className="w-[180px] text-xs font-medium">{showKhmer ? 'ហេតុផល Reason' : 'Reason'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'កំណត់សម្គាល់ Remarks' : 'Remarks'}</TableHead>
                  <TableHead className="w-[60px] text-xs font-medium text-center">{showKhmer ? 'សកម្មភាព Action' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arvDrugCount === 0 || (arvDrugCount === 1 && !formData.arvDrug1) ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                      {showKhmer ? 'មិនមានថ្នាំ ARV នៅឡើយ No ARV drugs added yet' : 'No ARV drugs added yet. Click "Add" to add a drug.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from({ length: arvDrugCount }, (_, i) => i + 1).map((index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2 sticky left-0 bg-card dark:bg-card z-10 border-r border-border">
                    <Select
                      value={formData[`arvDrug${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`arvDrug${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select drug" />
                      </SelectTrigger>
                      <SelectContent>
                        {arvDrugs.map((drug) => (
                          <SelectItem key={drug.id || drug.drugid || drug.Did} value={drug.drugname || drug.name || drug.DrugName}>
                            {drug.drugname || drug.name || drug.DrugName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`arvDose${index}`] || ''}
                      onChange={(e) => handleInputChange(`arvDose${index}`, e.target.value)}
                      placeholder="Dose"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={formData[`arvQuantity${index}`] || ''}
                      onChange={(e) => handleInputChange(`arvQuantity${index}`, e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`arvFrequency${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`arvFrequency${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Freq" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bid">BID</SelectItem>
                        <SelectItem value="qd">QD</SelectItem>
                        <SelectItem value="tid">TID</SelectItem>
                        <SelectItem value="qid">QID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`arvForm${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`arvForm${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="tab">Tablet</SelectItem>
                        <SelectItem value="cap">Capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <RadioGroup
                      value={formData[`arvStatus${index}`]?.toString() || '-1'}
                      onValueChange={(value) => handleInputChange(`arvStatus${index}`, value)}
                      className="flex flex-row gap-3"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="0" id={`arv-status-start-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`arv-status-start-${index}`} className="cursor-pointer text-xs">S</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="1" id={`arv-status-stop-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`arv-status-stop-${index}`} className="cursor-pointer text-xs">St</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="2" id={`arv-status-continue-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`arv-status-continue-${index}`} className="cursor-pointer text-xs">C</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="date"
                      value={formData[`arvDate${index}`] && formData[`arvDate${index}`] !== '1900-01-01' ? formData[`arvDate${index}`] : ''}
                      onChange={(e) => handleInputChange(`arvDate${index}`, e.target.value)}
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`arvReason${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`arvReason${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id || reason.rid} value={reason.reason || reason.name}>
                            {reason.reason || reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`arvRemarks${index}`] || ''}
                      onChange={(e) => handleInputChange(`arvRemarks${index}`, e.target.value)}
                      placeholder="Remarks"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    {arvDrugCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugEntry('arv', index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* OI Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium text-foreground">
              {showKhmer ? 'ថ្នាំ OI (OI Drugs)' : 'OI Drugs'}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {oiDrugCount}
            </Badge>
          </div>
          {oiDrugCount < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDrugEntry('oi')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {showKhmer ? 'បន្ថែម Add' : 'Add'}
            </Button>
          )}
        </div>
        <div className="border border-border rounded-none overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium sticky left-0 bg-muted z-20 border-r border-border">{showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ចំនួន Dose' : 'Dose'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ទម្រង់ Form' : 'Form'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ស្ថានភាព Status' : 'Status'}</TableHead>
                  <TableHead className="w-[130px] text-xs font-medium">{showKhmer ? 'កាលបរិច្ឆេទ Date' : 'Date'}</TableHead>
                  <TableHead className="w-[180px] text-xs font-medium">{showKhmer ? 'ហេតុផល Reason' : 'Reason'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'កំណត់សម្គាល់ Remarks' : 'Remarks'}</TableHead>
                  <TableHead className="w-[60px] text-xs font-medium text-center">{showKhmer ? 'សកម្មភាព Action' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oiDrugCount === 0 || (oiDrugCount === 1 && !formData.oiDrug1) ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                      {showKhmer ? 'មិនមានថ្នាំ OI នៅឡើយ No OI drugs added yet' : 'No OI drugs added yet. Click "Add" to add a drug.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from({ length: oiDrugCount }, (_, i) => i + 1).map((index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2 sticky left-0 bg-card dark:bg-card z-10 border-r border-border">
                        <Select
                          value={formData[`oiDrug${index}`] || ''}
                          onValueChange={(value) => handleInputChange(`oiDrug${index}`, value)}
                        >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select drug" />
                      </SelectTrigger>
                      <SelectContent>
                        {oiDrugs.map((drug) => (
                          <SelectItem key={drug.id || drug.drugid || drug.Did} value={drug.drugname || drug.name || drug.DrugName}>
                            {drug.drugname || drug.name || drug.DrugName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`oiDose${index}`] || ''}
                      onChange={(e) => handleInputChange(`oiDose${index}`, e.target.value)}
                      placeholder="Dose"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={formData[`oiQuantity${index}`] || ''}
                      onChange={(e) => handleInputChange(`oiQuantity${index}`, e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`oiFrequency${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`oiFrequency${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Freq" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bid">BID</SelectItem>
                        <SelectItem value="qd">QD</SelectItem>
                        <SelectItem value="tid">TID</SelectItem>
                        <SelectItem value="qid">QID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`oiForm${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`oiForm${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="tab">Tablet</SelectItem>
                        <SelectItem value="cap">Capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <RadioGroup
                      value={formData[`oiStatus${index}`]?.toString() || '-1'}
                      onValueChange={(value) => {
                        handleInputChange(`oiStatus${index}`, value);
                        if (value === '0') {
                          handleInputChange(`oiStart${index}`, formData.visitDate || '');
                          handleInputChange(`oiStop${index}`, '');
                          handleInputChange(`oiContinue${index}`, '');
                        } else if (value === '1') {
                          handleInputChange(`oiStop${index}`, formData.visitDate || '');
                          handleInputChange(`oiStart${index}`, '');
                          handleInputChange(`oiContinue${index}`, '');
                        } else if (value === '2') {
                          handleInputChange(`oiContinue${index}`, '1');
                          handleInputChange(`oiStart${index}`, '');
                          handleInputChange(`oiStop${index}`, '');
                        }
                      }}
                      className="flex flex-row gap-3"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="0" id={`oi-status-start-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`oi-status-start-${index}`} className="cursor-pointer text-xs">S</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="1" id={`oi-status-stop-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`oi-status-stop-${index}`} className="cursor-pointer text-xs">St</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="2" id={`oi-status-continue-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`oi-status-continue-${index}`} className="cursor-pointer text-xs">C</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="date"
                      value={formData[`oiDate${index}`] && formData[`oiDate${index}`] !== '1900-01-01' ? formData[`oiDate${index}`] : ''}
                      onChange={(e) => handleInputChange(`oiDate${index}`, e.target.value)}
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`oiReason${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`oiReason${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id || reason.rid} value={reason.reason || reason.name}>
                            {reason.reason || reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`oiRemarks${index}`] || ''}
                      onChange={(e) => handleInputChange(`oiRemarks${index}`, e.target.value)}
                      placeholder="Remarks"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    {oiDrugCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugEntry('oi', index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* HCV Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium text-foreground">
              {showKhmer ? 'ថ្នាំ HCV (HCV Drugs)' : 'HCV Drugs'}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {hcvDrugCount}
            </Badge>
          </div>
          {hcvDrugCount < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDrugEntry('hcv')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {showKhmer ? 'បន្ថែម Add' : 'Add'}
            </Button>
          )}
        </div>
        <div className="border border-border rounded-none overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium sticky left-0 bg-muted z-20 border-r border-border">{showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ចំនួន Dose' : 'Dose'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ទម្រង់ Form' : 'Form'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ស្ថានភាព Status' : 'Status'}</TableHead>
                  <TableHead className="w-[130px] text-xs font-medium">{showKhmer ? 'កាលបរិច្ឆេទ Date' : 'Date'}</TableHead>
                  <TableHead className="w-[180px] text-xs font-medium">{showKhmer ? 'ហេតុផល Reason' : 'Reason'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'កំណត់សម្គាល់ Remarks' : 'Remarks'}</TableHead>
                  <TableHead className="w-[60px] text-xs font-medium text-center">{showKhmer ? 'សកម្មភាព Action' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hcvDrugCount === 0 || (hcvDrugCount === 1 && !formData.hcvDrug1) ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                      {showKhmer ? 'មិនមានថ្នាំ HCV នៅឡើយ No HCV drugs added yet' : 'No HCV drugs added yet. Click "Add" to add a drug.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from({ length: hcvDrugCount }, (_, i) => i + 1).map((index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2 sticky left-0 bg-card dark:bg-card z-10 border-r border-border">
                        <Select
                          value={formData[`hcvDrug${index}`] || ''}
                          onValueChange={(value) => handleInputChange(`hcvDrug${index}`, value)}
                        >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select drug" />
                      </SelectTrigger>
                      <SelectContent>
                        {hcvDrugs.map((drug) => (
                          <SelectItem key={drug.id || drug.drugid || drug.Did} value={drug.drugname || drug.name || drug.DrugName}>
                            {drug.drugname || drug.name || drug.DrugName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`hcvDose${index}`] || ''}
                      onChange={(e) => handleInputChange(`hcvDose${index}`, e.target.value)}
                      placeholder="Dose"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={formData[`hcvQuantity${index}`] || ''}
                      onChange={(e) => handleInputChange(`hcvQuantity${index}`, e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`hcvFrequency${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`hcvFrequency${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Freq" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bid">BID</SelectItem>
                        <SelectItem value="qd">QD</SelectItem>
                        <SelectItem value="tid">TID</SelectItem>
                        <SelectItem value="qid">QID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`hcvForm${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`hcvForm${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="tab">Tablet</SelectItem>
                        <SelectItem value="cap">Capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <RadioGroup
                      value={formData[`hcvStatus${index}`]?.toString() || '-1'}
                      onValueChange={(value) => {
                        handleInputChange(`hcvStatus${index}`, value);
                        if (value === '0') {
                          handleInputChange(`hcvStart${index}`, formData.visitDate || '');
                          handleInputChange(`hcvStop${index}`, '');
                          handleInputChange(`hcvContinue${index}`, '');
                        } else if (value === '1') {
                          handleInputChange(`hcvStop${index}`, formData.visitDate || '');
                          handleInputChange(`hcvStart${index}`, '');
                          handleInputChange(`hcvContinue${index}`, '');
                        } else if (value === '2') {
                          handleInputChange(`hcvContinue${index}`, '1');
                          handleInputChange(`hcvStart${index}`, '');
                          handleInputChange(`hcvStop${index}`, '');
                        }
                      }}
                      className="flex flex-row gap-3"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="0" id={`hcv-status-start-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`hcv-status-start-${index}`} className="cursor-pointer text-xs">S</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="1" id={`hcv-status-stop-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`hcv-status-stop-${index}`} className="cursor-pointer text-xs">St</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="2" id={`hcv-status-continue-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`hcv-status-continue-${index}`} className="cursor-pointer text-xs">C</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="date"
                      value={formData[`hcvDate${index}`] && formData[`hcvDate${index}`] !== '1900-01-01' ? formData[`hcvDate${index}`] : ''}
                      onChange={(e) => handleInputChange(`hcvDate${index}`, e.target.value)}
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`hcvReason${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`hcvReason${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id || reason.rid} value={reason.reason || reason.name}>
                            {reason.reason || reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`hcvRemarks${index}`] || ''}
                      onChange={(e) => handleInputChange(`hcvRemarks${index}`, e.target.value)}
                      placeholder="Remarks"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    {hcvDrugCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugEntry('hcv', index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* TPT Treatment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ព្យាបាល TPT (TPT Treatment)' : 'TPT Treatment'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'តើអ្នកជំងឺត្រូវព្យាបាល TPT ឬទេ? Does patient need TPT treatment?' : 'Does patient need TPT treatment?'}
            </Label>
            <RadioGroup
              value={formData.tpt?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tpt', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-tpt" />
                <Label htmlFor="no-tpt" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-tpt" />
                <Label htmlFor="yes-tpt" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* TPT Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium text-foreground">
              {showKhmer ? 'ថ្នាំ TPT (TPT Drugs)' : 'TPT Drugs'}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {tptDrugCount}
            </Badge>
          </div>
          {tptDrugCount < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDrugEntry('tpt')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {showKhmer ? 'បន្ថែម Add' : 'Add'}
            </Button>
          )}
        </div>
        <div className="border border-border rounded-none overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium sticky left-0 bg-muted z-20 border-r border-border">{showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ចំនួន Dose' : 'Dose'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ទម្រង់ Form' : 'Form'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ស្ថានភាព Status' : 'Status'}</TableHead>
                  <TableHead className="w-[130px] text-xs font-medium">{showKhmer ? 'កាលបរិច្ឆេទ Date' : 'Date'}</TableHead>
                  <TableHead className="w-[180px] text-xs font-medium">{showKhmer ? 'ហេតុផល Reason' : 'Reason'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'កំណត់សម្គាល់ Remarks' : 'Remarks'}</TableHead>
                  <TableHead className="w-[60px] text-xs font-medium text-center">{showKhmer ? 'សកម្មភាព Action' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tptDrugCount === 0 || (tptDrugCount === 1 && !formData.tptDrug1) ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                      {showKhmer ? 'មិនមានថ្នាំ TPT នៅឡើយ No TPT drugs added yet' : 'No TPT drugs added yet. Click "Add" to add a drug.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from({ length: tptDrugCount }, (_, i) => i + 1).map((index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2 sticky left-0 bg-card dark:bg-card z-10 border-r border-border">
                        <Select
                          value={formData[`tptDrug${index}`] || ''}
                          onValueChange={(value) => handleInputChange(`tptDrug${index}`, value)}
                        >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select drug" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTPTDrugOptions(index).map((drug) => (
                          <SelectItem key={drug.id || drug.drugid || drug.Did || `tpt-${index}-${drug.drugname || drug.name || drug.DrugName}`} value={drug.drugname || drug.name || drug.DrugName}>
                            {drug.drugname || drug.name || drug.DrugName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`tptDose${index}`] || ''}
                      onChange={(e) => handleInputChange(`tptDose${index}`, e.target.value)}
                      placeholder="Dose"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={formData[`tptQuantity${index}`] || ''}
                      onChange={(e) => handleInputChange(`tptQuantity${index}`, e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tptFrequency${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tptFrequency${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Freq" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bid">BID</SelectItem>
                        <SelectItem value="qd">QD</SelectItem>
                        <SelectItem value="tid">TID</SelectItem>
                        <SelectItem value="qid">QID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tptForm${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tptForm${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="tab">Tablet</SelectItem>
                        <SelectItem value="cap">Capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <RadioGroup
                      value={formData[`tptStatus${index}`]?.toString() || '-1'}
                      onValueChange={(value) => {
                        handleInputChange(`tptStatus${index}`, value);
                        if (value === '0') {
                          handleInputChange(`tptStart${index}`, formData.visitDate || '');
                          handleInputChange(`tptStop${index}`, '');
                          handleInputChange(`tptContinue${index}`, '');
                        } else if (value === '1') {
                          handleInputChange(`tptStop${index}`, formData.visitDate || '');
                          handleInputChange(`tptStart${index}`, '');
                          handleInputChange(`tptContinue${index}`, '');
                        } else if (value === '2') {
                          handleInputChange(`tptContinue${index}`, '1');
                          handleInputChange(`tptStart${index}`, '');
                          handleInputChange(`tptStop${index}`, '');
                        }
                      }}
                      className="flex flex-row gap-3"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="0" id={`tpt-status-start-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tpt-status-start-${index}`} className="cursor-pointer text-xs">S</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="1" id={`tpt-status-stop-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tpt-status-stop-${index}`} className="cursor-pointer text-xs">St</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="2" id={`tpt-status-continue-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tpt-status-continue-${index}`} className="cursor-pointer text-xs">C</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="date"
                      value={formData[`tptDate${index}`] && formData[`tptDate${index}`] !== '1900-01-01' ? formData[`tptDate${index}`] : ''}
                      onChange={(e) => handleInputChange(`tptDate${index}`, e.target.value)}
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tptReason${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tptReason${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id || reason.rid} value={reason.reason || reason.name}>
                            {reason.reason || reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tptRemarks${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tptRemarks${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Remarks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1º">1º</SelectItem>
                        <SelectItem value="2º">2º</SelectItem>
                        <SelectItem value="T">T</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    {tptDrugCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugEntry('tpt', index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* TB Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-md font-medium text-foreground">
              {showKhmer ? 'ថ្នាំ TB (TB Drugs)' : 'TB Drugs'}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {tbDrugCount}
            </Badge>
          </div>
          {tbDrugCount < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDrugEntry('tb')}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {showKhmer ? 'បន្ថែម Add' : 'Add'}
            </Button>
          )}
        </div>
        <div className="border border-border rounded-none overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[180px] text-xs font-medium sticky left-0 bg-muted z-20 border-r border-border">{showKhmer ? 'ឈ្មោះថ្នាំ Drug Name' : 'Drug Name'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ចំនួន Dose' : 'Dose'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'បរិមាណ Quantity' : 'Quantity'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ភាពញឹក Frequency' : 'Frequency'}</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium">{showKhmer ? 'ទម្រង់ Form' : 'Form'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'ស្ថានភាព Status' : 'Status'}</TableHead>
                  <TableHead className="w-[130px] text-xs font-medium">{showKhmer ? 'កាលបរិច្ឆេទ Date' : 'Date'}</TableHead>
                  <TableHead className="w-[180px] text-xs font-medium">{showKhmer ? 'ហេតុផល Reason' : 'Reason'}</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium">{showKhmer ? 'កំណត់សម្គាល់ Remarks' : 'Remarks'}</TableHead>
                  <TableHead className="w-[60px] text-xs font-medium text-center">{showKhmer ? 'សកម្មភាព Action' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tbDrugCount === 0 || (tbDrugCount === 1 && !formData.tbDrug1) ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                      {showKhmer ? 'មិនមានថ្នាំ TB នៅឡើយ No TB drugs added yet' : 'No TB drugs added yet. Click "Add" to add a drug.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.from({ length: tbDrugCount }, (_, i) => i + 1).map((index) => (
                    <TableRow key={index} className="hover:bg-muted transition-colors">
                      <TableCell className="p-2 sticky left-0 bg-card dark:bg-card z-10 border-r border-border">
                        <Select
                          value={formData[`tbDrug${index}`] || ''}
                          onValueChange={(value) => handleInputChange(`tbDrug${index}`, value)}
                        >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select drug" />
                      </SelectTrigger>
                      <SelectContent>
                        {tbDrugs.map((drug) => (
                          <SelectItem key={drug.id || drug.drugid || drug.Did} value={drug.drugname || drug.name || drug.DrugName}>
                            {drug.drugname || drug.name || drug.DrugName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`tbDose${index}`] || ''}
                      onChange={(e) => handleInputChange(`tbDose${index}`, e.target.value)}
                      placeholder="Dose"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      value={formData[`tbQuantity${index}`] || ''}
                      onChange={(e) => handleInputChange(`tbQuantity${index}`, e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tbFrequency${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tbFrequency${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Freq" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bid">BID</SelectItem>
                        <SelectItem value="qd">QD</SelectItem>
                        <SelectItem value="tid">TID</SelectItem>
                        <SelectItem value="qid">QID</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tbForm${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tbForm${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="tab">Tablet</SelectItem>
                        <SelectItem value="cap">Capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <RadioGroup
                      value={formData[`tbStatus${index}`]?.toString() || '-1'}
                      onValueChange={(value) => {
                        handleInputChange(`tbStatus${index}`, value);
                        if (value === '0') {
                          handleInputChange(`tbStart${index}`, formData.visitDate || '');
                          handleInputChange(`tbStop${index}`, '');
                          handleInputChange(`tbContinue${index}`, '');
                        } else if (value === '1') {
                          handleInputChange(`tbStop${index}`, formData.visitDate || '');
                          handleInputChange(`tbStart${index}`, '');
                          handleInputChange(`tbContinue${index}`, '');
                        } else if (value === '2') {
                          handleInputChange(`tbContinue${index}`, '1');
                          handleInputChange(`tbStart${index}`, '');
                          handleInputChange(`tbStop${index}`, '');
                        }
                      }}
                      className="flex flex-row gap-3"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="0" id={`tb-status-start-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tb-status-start-${index}`} className="cursor-pointer text-xs">S</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="1" id={`tb-status-stop-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tb-status-stop-${index}`} className="cursor-pointer text-xs">St</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="2" id={`tb-status-continue-${index}`} className="w-3.5 h-3.5" />
                        <Label htmlFor={`tb-status-continue-${index}`} className="cursor-pointer text-xs">C</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="date"
                      value={formData[`tbDate${index}`] && formData[`tbDate${index}`] !== '1900-01-01' ? formData[`tbDate${index}`] : ''}
                      onChange={(e) => handleInputChange(`tbDate${index}`, e.target.value)}
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Select
                      value={formData[`tbReason${index}`] || ''}
                      onValueChange={(value) => handleInputChange(`tbReason${index}`, value)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id || reason.rid} value={reason.reason || reason.name}>
                            {reason.reason || reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={formData[`tbRemarks${index}`] || ''}
                      onChange={(e) => handleInputChange(`tbRemarks${index}`, e.target.value)}
                      placeholder="Remarks"
                      className="h-9 text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-2 text-center">
                    {tbDrugCount > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugEntry('tb', index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Function Assessment */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការវាយតម្លៃមុខងារ (Function Assessment)' : 'Function Assessment'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'មុខងាររាងកាយ Physical Function' : 'Physical Function'}
            </Label>
            <RadioGroup
              value={formData.function?.toString() || '0'}
              onValueChange={(value) => handleInputChange('function', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="function-normal" />
                <Label htmlFor="function-normal" className="cursor-pointer text-sm">
                  {showKhmer ? 'ធម្មតា Normal' : 'Normal'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="function-impaired" />
                <Label htmlFor="function-impaired" className="cursor-pointer text-sm">
                  {showKhmer ? 'ខូច Impaired' : 'Impaired'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'លទ្ធផលពិនិត្យអាកាសធាតុ TB Test Result' : 'TB Test Result'}
            </Label>
            <RadioGroup
              value={formData.tbOut?.toString() || '0'}
              onValueChange={(value) => handleInputChange('tbOut', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="tb-out-negative" />
                <Label htmlFor="tb-out-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'អវិជ្ជមាន Negative' : 'Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="tb-out-positive" />
                <Label htmlFor="tb-out-positive" className="cursor-pointer text-sm">
                  {showKhmer ? 'វិជ្ជមាន Positive' : 'Positive'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការតាមដាន (Follow-up)' : 'Follow-up'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="appointmentDate" className="text-sm text-foreground">
              {showKhmer ? 'កាលបរិច្ឆេទណាត់ជួប Appointment Date' : 'Appointment Date'}
            </Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate && formData.appointmentDate !== '1900-01-01' ? formData.appointmentDate : ''}
              onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
              className="mt-1 border-border h-9 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="doctorId" className="text-sm text-foreground">
              {showKhmer ? 'វេជ្ជបណ្ឌិត Doctor' : 'Doctor'}
            </Label>
            <Select
              value={formData.doctorId || ''}
              onValueChange={(value) => handleInputChange('doctorId', value)}
            >
              <SelectTrigger className="h-9 text-sm mt-1">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.doctors?.map((doctor) => (
                  <SelectItem key={doctor.id || doctor.did} value={String(doctor.id || doctor.did)}>
                    {doctor.name || doctor.doctorname || `${doctor.id || doctor.did} / ${doctor.name || doctor.doctorname}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="meetTime" className="text-sm text-foreground">
              {showKhmer ? 'ពេលជួប Meet Time' : 'Meet Time'}
            </Label>
            <Select
              value={formData.meetTime || ''}
              onValueChange={(value) => handleInputChange('meetTime', value)}
            >
              <SelectTrigger className="h-9 text-sm mt-1">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.meetTimes?.map((time, index) => (
                  <SelectItem key={time.id || time.tid || index} value={String(time.id || time.tid || index)}>
                    {time.name || time.timename || time.time || `Time ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'កម្មវិធីការងារ Field Worker' : 'Field Worker'}
            </Label>
            <RadioGroup
              value={formData.foWorker?.toString() || '0'}
              onValueChange={(value) => handleInputChange('foWorker', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-fo" />
                <Label htmlFor="no-fo" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-fo" />
                <Label htmlFor="yes-fo" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Side Effects */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ផលប៉ះពាល់ (Side Effects)' : 'Side Effects'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">
              {showKhmer ? 'ផលប៉ះពាល់ពីថ្នាំ (Drug Side Effects)' : 'Drug Side Effects'}
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="moderate"
                  checked={formData.moderate === '1'}
                  onCheckedChange={(checked) => handleInputChange('moderate', checked ? '1' : '0')}
                />
                <Label htmlFor="moderate" className="cursor-pointer text-sm">
                  {showKhmer ? 'ផលប៉ះពាល់មធ្យម Moderate' : 'Moderate'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="tdf"
                  checked={formData.tdf === '1'}
                  onCheckedChange={(checked) => handleInputChange('tdf', checked ? '1' : '0')}
                />
                <Label htmlFor="tdf" className="cursor-pointer text-sm">
                  {showKhmer ? 'TDF Side Effects' : 'TDF Side Effects'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="rash"
                  checked={formData.rash === '1'}
                  onCheckedChange={(checked) => handleInputChange('rash', checked ? '1' : '0')}
                />
                <Label htmlFor="rash" className="cursor-pointer text-sm">
                  {showKhmer ? 'រោគស្បែក Rash' : 'Rash'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hepatitis"
                  checked={formData.hepatitis === '1'}
                  onCheckedChange={(checked) => handleInputChange('hepatitis', checked ? '1' : '0')}
                />
                <Label htmlFor="hepatitis" className="cursor-pointer text-sm">
                  {showKhmer ? 'រោគថ្លើម Hepatitis' : 'Hepatitis'}
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">
              {showKhmer ? 'ផលប៉ះពាល់ផ្សេងទៀត (Other Side Effects)' : 'Other Side Effects'}
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="peripheral"
                  checked={formData.peripheral === '1'}
                  onCheckedChange={(checked) => handleInputChange('peripheral', checked ? '1' : '0')}
                />
                <Label htmlFor="peripheral" className="cursor-pointer text-sm">
                  {showKhmer ? 'ជំងឺប្រព័ន្ធប្រសាទ Peripheral Neuropathy' : 'Peripheral Neuropathy'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="azt"
                  checked={formData.azt === '1'}
                  onCheckedChange={(checked) => handleInputChange('azt', checked ? '1' : '0')}
                />
                <Label htmlFor="azt" className="cursor-pointer text-sm">
                  {showKhmer ? 'AZT Side Effects' : 'AZT Side Effects'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="lactic"
                  checked={formData.lactic === '1'}
                  onCheckedChange={(checked) => handleInputChange('lactic', checked ? '1' : '0')}
                />
                <Label htmlFor="lactic" className="cursor-pointer text-sm">
                  {showKhmer ? 'អាស៊ីដឡាក់ទិក Lactic Acidosis' : 'Lactic Acidosis'}
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="mediOther" className="text-sm text-foreground">
            {showKhmer ? 'ផលប៉ះពាល់ផ្សេងទៀត Other Side Effects' : 'Other Side Effects'}
          </Label>
          <Input
            id="mediOther"
            value={formData.mediOther || ''}
            onChange={(e) => handleInputChange('mediOther', e.target.value)}
            placeholder="Enter other side effects"
            className="mt-1 border-border"
          />
        </div>
      </div>

      {/* Laboratory Tests */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការពិនិត្យមន្ទីរពិសោធន៍ (Laboratory Tests)' : 'Laboratory Tests'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'ការពិនិត្យ HIV HIV Test' : 'HIV Test'}
            </Label>
            <RadioGroup
              value={formData.testHIV?.toString() || '0'}
              onValueChange={(value) => handleInputChange('testHIV', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hiv-test" />
                <Label htmlFor="no-hiv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hiv-test" />
                <Label htmlFor="yes-hiv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'លទ្ធផល HIV HIV Result' : 'HIV Result'}
            </Label>
            <RadioGroup
              value={formData.resultHIV?.toString() || '0'}
              onValueChange={(value) => handleInputChange('resultHIV', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="hiv-negative" />
                <Label htmlFor="hiv-negative" className="cursor-pointer text-sm">
                  {showKhmer ? 'អវិជ្ជមាន Negative' : 'Negative'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="hiv-positive" />
                <Label htmlFor="hiv-positive" className="cursor-pointer text-sm">
                  {showKhmer ? 'វិជ្ជមាន Positive' : 'Positive'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cd4Date" className="text-sm text-foreground">
              {showKhmer ? 'កាលបរិច្ឆេទពិនិត្យ CD4 CD4 Test Date' : 'CD4 Test Date'}
            </Label>
            <Input
              id="cd4Date"
              type="date"
              value={formData.cd4Date || ''}
              onChange={(e) => handleInputChange('cd4Date', e.target.value)}
              className="mt-1 border-border"
            />
          </div>
          <div>
            <Label htmlFor="viralLoadDate" className="text-sm text-foreground">
              {showKhmer ? 'កាលបរិច្ឆេទពិនិត្យ Viral Load Viral Load Date' : 'Viral Load Date'}
            </Label>
            <Input
              id="viralLoadDate"
              type="date"
              value={formData.viralLoadDate || ''}
              onChange={(e) => handleInputChange('viralLoadDate', e.target.value)}
              className="mt-1 border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'ការពិនិត្យ CD4 CD4 Test' : 'CD4 Test'}
            </Label>
            <RadioGroup
              value={formData.cd4Test?.toString() || '0'}
              onValueChange={(value) => handleInputChange('cd4Test', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-cd4-test" />
                <Label htmlFor="no-cd4-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-cd4-test" />
                <Label htmlFor="yes-cd4-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'ការពិនិត្យ HIV Viral HIV Viral Test' : 'HIV Viral Test'}
            </Label>
            <RadioGroup
              value={formData.hivViralTest?.toString() || '0'}
              onValueChange={(value) => handleInputChange('hivViralTest', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hiv-viral-test" />
                <Label htmlFor="no-hiv-viral-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hiv-viral-test" />
                <Label htmlFor="yes-hiv-viral-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'ការពិនិត្យ HCV HCV Test' : 'HCV Test'}
            </Label>
            <RadioGroup
              value={formData.hcvViralTest?.toString() || '0'}
              onValueChange={(value) => handleInputChange('hcvViralTest', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-hcv-test" />
                <Label htmlFor="no-hcv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-hcv-test" />
                <Label htmlFor="yes-hcv-test" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Referral */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          {showKhmer ? 'ការបញ្ជូន (Referral)' : 'Referral'}
        </h4>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-foreground">
              {showKhmer ? 'តើត្រូវបញ្ជូនអ្នកជំងឺឬទេ? Does patient need referral?' : 'Does patient need referral?'}
            </Label>
            <RadioGroup
              value={formData.refer?.toString() || '0'}
              onValueChange={(value) => handleInputChange('refer', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="0" id="no-refer" />
                <Label htmlFor="no-refer" className="cursor-pointer text-sm">
                  {showKhmer ? 'ទេ No' : 'No'}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="1" id="yes-refer" />
                <Label htmlFor="yes-refer" className="cursor-pointer text-sm">
                  {showKhmer ? 'បាទ/ចាស Yes' : 'Yes'}
                </Label>
              </div>
            </RadioGroup>
          </div>
          {formData.refer === '1' && (
            <div>
              <Label htmlFor="referOther" className="text-sm text-foreground">
                {showKhmer ? 'មូលហេតុបញ្ជូន Referral Reason' : 'Referral Reason'}
              </Label>
              <Input
                id="referOther"
                value={formData.referOther || ''}
                onChange={(e) => handleInputChange('referOther', e.target.value)}
                placeholder="Enter referral reason"
                className="mt-1 border-border"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPlan;