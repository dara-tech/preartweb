import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import React from 'react';

function OtherMedicalSection({ formData, setFormData, otherMedicalTreatments, setOtherMedicalTreatments, dropdownOptions }) {
  const handleOtherMedicalChange = (condition, field, value) => {
    setOtherMedicalTreatments(prev => ({
      ...prev,
      [condition]: {
        ...prev[condition],
        [field]: value === "none" ? "" : value
      }
    }))
  }

  const handleMedicalConditionChange = (condition, checked) => {
    setFormData(prev => ({
      ...prev,
      [condition]: checked
    }))
    if (!checked) {
      setOtherMedicalTreatments(prev => ({
        ...prev,
        [condition]: { drug: '', clinic: '', startDate: '', stopDate: '', note: '' }
      }))
    }
  }

  const isDateEnabled = (dateValue) => {
    return dateValue && dateValue !== '' && dateValue !== '1900-01-01'
  }

  const conditions = [
    { key: 'diabetes', label: 'Diabetes / ជំងឺទឹកនោមផ្អែម' },
    { key: 'hypertension', label: 'Hypertension / ជំងឺសម្ពាធឈាមខ្ពស់' },
    { key: 'abnormal', label: 'Abnormal Lipidemia / ជំងឺខ្លាញ់ក្នុងឈាមមិនប្រក្រតី' },
    { key: 'renal', label: 'Renal Disease / ជំងឺតម្រងនោម' },
    { key: 'anemia', label: 'Anemia / ជំងឺឈាមក្រហមខ្វះ' },
    { key: 'liver', label: 'Liver Disease / ជំងឺថ្លើម' },
    { key: 'hepatitis', label: 'Hep B/Hep C / ជំងឺថ្លើមរលាក' },
    { key: 'other', label: 'Other / ផ្សេងទៀត' }
  ]

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-semibold text-foreground">ប្រវត្តិនៃការព្យាបាលជំងឺផ្សេងទៀត</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Other Medical Treatment History</p>
      </div>

      <div className="border border-border rounded-none overflow-hidden bg-card">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow>
                <TableHead className="text-xs font-medium">ប្រភេទជំងឺ</TableHead>
                <TableHead className="text-xs font-medium">ថ្នាំ</TableHead>
                <TableHead className="text-xs font-medium">មន្ទីរពេទ្យ</TableHead>
                <TableHead className="text-xs font-medium">ចាប់ផ្តើម</TableHead>
                <TableHead className="text-xs font-medium">បញ្ឈប់</TableHead>
                <TableHead className="text-xs font-medium">កំណត់សម្គាល់</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map((illness) => {
                const treatment = otherMedicalTreatments[illness.key]
                return (
                  <TableRow key={illness.key} className="hover:bg-muted transition-colors">
                    <TableCell className="p-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData[illness.key] || false}
                          onCheckedChange={(checked) => handleMedicalConditionChange(illness.key, checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-xs text-foreground">{illness.label.split(' / ')[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <Select
                        value={treatment?.drug || "none"}
                        onValueChange={(value) => handleOtherMedicalChange(illness.key, 'drug', value)}
                        disabled={!formData[illness.key]}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select</SelectItem>
                          {dropdownOptions.drugTreatments?.map((drug) => (
                            <SelectItem key={drug.id || drug.drugid} value={drug.name || drug.drugname}>
                              {drug.name || drug.drugname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-2">
                      <Select
                        value={treatment?.clinic || "none"}
                        onValueChange={(value) => handleOtherMedicalChange(illness.key, 'clinic', value)}
                        disabled={!treatment?.drug || treatment.drug === "none"}
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
                        value={treatment?.startDate || ''}
                        onChange={(e) => handleOtherMedicalChange(illness.key, 'startDate', e.target.value)}
                        disabled={!treatment?.drug || treatment.drug === "none"}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="date"
                        value={treatment?.stopDate || ''}
                        onChange={(e) => handleOtherMedicalChange(illness.key, 'stopDate', e.target.value)}
                        disabled={!isDateEnabled(treatment?.startDate)}
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Select
                        value={treatment?.note || "none"}
                        onValueChange={(value) => handleOtherMedicalChange(illness.key, 'note', value)}
                        disabled={!isDateEnabled(treatment?.startDate)}
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
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default OtherMedicalSection;

