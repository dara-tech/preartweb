import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react'
import { Plus, RotateCcw, X } from "lucide-react"

function PatientInformation({ 
  formData, 
  setFormData, 
  handleInputChange, 
  dropdownOptions, 
  familyMembers, 
  setFamilyMembers, 
  newFamilyMember, 
  setNewFamilyMember 
}) {
  // Ensure formData has default values to prevent undefined errors
  const safeFormData = {
    sex: -1,
    referred: -1,
    typeTest: -1,
    offIn: -1,
    feeding: -1,
    ...formData
  }

  // Family member handlers
  const addFamilyMember = () => {
    if (newFamilyMember.familyType.trim()) {
      setFamilyMembers([...familyMembers, { ...newFamilyMember }])
      setNewFamilyMember({
        familyType: '',
        age: '',
        hivStatus: '',
        status: '',
        startingArt: null,
        pregnantStatus: null,
        siteName: '',
        tbHistory: ''
      })
    }
  }

  const clearFamilyMember = () => {
    setNewFamilyMember({
      familyType: '',
      age: '',
      hivStatus: '',
      status: '',
      startingArt: null,
      pregnantStatus: null,
      siteName: '',
      tbHistory: ''
    })
  }

  const removeFamilyMember = (index) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Patient Identification and Visit Details Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ព័ត៌មានអតិថិជន និង ព័ត៌មានការមកពិនិត្យ (Patient Identification and Visit Details)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clinicId" className="text-sm font-semibold text-gray-700">
                លេខកូដអ្នកជំងឺ<br/>Clinic ID Number:
              </Label>
              <Input
                id="clinicId"
                value={safeFormData.clinicId || ''}
                onChange={(e) => handleInputChange('clinicId', e.target.value)}
                placeholder="Enter Clinic ID"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-sm font-semibold text-gray-700">
                ឈ្មោះអ្នកជំងឺ<br/>Patient Name:
              </Label>
              <Input
                id="patientName"
                value={safeFormData.patientName || ''}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Enter patient name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicIdOld" className="text-sm font-semibold text-gray-700">
                ករណីចាស់ ClinicID<br/>Old Case ClinicID:
              </Label>
              <Select
                value={safeFormData.clinicIdOld === -1 || safeFormData.clinicIdOld === null || safeFormData.clinicIdOld === undefined ? "none" : safeFormData.clinicIdOld.toString()}
                onValueChange={(value) => handleInputChange('clinicIdOld', value === "none" ? "" : value)}
              >
                <SelectTrigger className="h-10 border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select old case" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Old Case</SelectItem>
                  <SelectItem value="P001">P001</SelectItem>
                  <SelectItem value="P002">P002</SelectItem>
                  <SelectItem value="P003">P003</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceSiteName" className="text-sm font-semibold text-gray-700">
                ឈ្មោះទីកន្លែងផ្តល់សេវា<br/>Service Site Name:
              </Label>
              <Select
                value={safeFormData.serviceSiteName === -1 || safeFormData.serviceSiteName === null || safeFormData.serviceSiteName === undefined ? "none" : safeFormData.serviceSiteName.toString()}
                onValueChange={(value) => handleInputChange('serviceSiteName', value === "none" ? "" : value)}
              >
                <SelectTrigger className="h-10 border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Service Site</SelectItem>
                  {dropdownOptions.sites?.map((site) => (
                    <SelectItem key={site.code} value={site.code}>
                      {site.code} - {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFirstVisit" className="text-sm font-semibold text-gray-700">
              ថ្ងៃខែឆ្នាំ មកពិនិត្យដំបូង<br/>Date First Visit:
            </Label>
            <Input
              id="dateFirstVisit"
              type="date"
              value={safeFormData.dateFirstVisit || ''}
              onChange={(e) => handleInputChange('dateFirstVisit', e.target.value)}
              className="h-10 border-2 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-none">
            <Checkbox
              id="reLost"
              checked={safeFormData.reLost || false}
              onCheckedChange={(checked) => handleInputChange('reLost', checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="reLost" className="text-sm font-semibold text-gray-700">
              អ្នកជំងឺបាត់មុខហើយត្រឡប់មកវិញ (Patient Lost and Returned)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Demographic Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
         ពត៌មានប្រជាសាស្ត្រ (Demographic Information)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំកំណើត<br/>Date of Birth:
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={safeFormData.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                អាយុ<br/>Age:
              </Label>
              <Input
                id="age"
                type="number"
                value={safeFormData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter age"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ភេទ<br/>Sex:
              </Label>
              <RadioGroup
                value={safeFormData.sex === -1 || safeFormData.sex === null || safeFormData.sex === undefined ? "" : safeFormData.sex.toString()}
                onValueChange={(value) => handleInputChange('sex', parseInt(value))}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="female" className="w-4 h-4" />
                  <Label htmlFor="female" className="text-sm font-medium">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="male" className="w-4 h-4" />
                  <Label htmlFor="male" className="text-sm font-medium">Male</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HIV Test Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ព័ត៌មានតេស្ត HIV (HIV Test Information)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                បានបញ្ជូនមកពី<br/>Referred From:
              </Label>
              <RadioGroup
                value={safeFormData.referred === -1 || safeFormData.referred === null || safeFormData.referred === undefined ? "" : safeFormData.referred.toString()}
                onValueChange={(value) => handleInputChange('referred', parseInt(value))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="0" id="self" className="w-4 h-4" />
                  <Label htmlFor="self" className="text-sm font-medium">Self</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="1" id="hospital" className="w-4 h-4" />
                  <Label htmlFor="hospital" className="text-sm font-medium">Hospital</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="2" id="healthCenter" className="w-4 h-4" />
                  <Label htmlFor="healthCenter" className="text-sm font-medium">Health Center</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="3" id="communityCare" className="w-4 h-4" />
                  <Label htmlFor="communityCare" className="text-sm font-medium">Community Care</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រភេទតេស្ត<br/>Type of Test:
              </Label>
              <RadioGroup
                value={safeFormData.typeTest === -1 || safeFormData.typeTest === null || safeFormData.typeTest === undefined ? "" : safeFormData.typeTest.toString()}
                onValueChange={(value) => handleInputChange('typeTest', parseInt(value))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="0" id="vcct" className="w-4 h-4" />
                  <Label htmlFor="vcct" className="text-sm font-medium">VCCT</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="1" id="tb" className="w-4 h-4" />
                  <Label htmlFor="tb" className="text-sm font-medium">TB Program</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                បានផ្លាស់មកពី<br/>Transfer In:
              </Label>
              <RadioGroup
                value={safeFormData.offIn === -1 || safeFormData.offIn === null || safeFormData.offIn === undefined ? "" : safeFormData.offIn.toString()}
                onValueChange={(value) => handleInputChange('offIn', parseInt(value))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="0" id="no" className="w-4 h-4" />
                  <Label htmlFor="no" className="text-sm font-medium">No</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-none hover:bg-orange-50">
                  <RadioGroupItem value="1" id="yes" className="w-4 h-4" />
                  <Label htmlFor="yes" className="text-sm font-medium">Yes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feeding Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ព័ត៌មានការបំប៉ន (Feeding Information)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              ប្រភេទការបំប៉ន<br/>Feeding Type:
            </Label>
            <RadioGroup
              value={safeFormData.feeding === -1 || safeFormData.feeding === null || safeFormData.feeding === undefined ? "" : safeFormData.feeding.toString()}
              onValueChange={(value) => handleInputChange('feeding', parseInt(value))}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-3 rounded-none hover:bg-purple-50">
                <RadioGroupItem value="0" id="breastfeeding" className="w-4 h-4" />
                <Label htmlFor="breastfeeding" className="text-sm font-medium">Breastfeeding</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-none hover:bg-purple-50">
                <RadioGroupItem value="1" id="formula" className="w-4 h-4" />
                <Label htmlFor="formula" className="text-sm font-medium">Formula</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-none hover:bg-purple-50">
                <RadioGroupItem value="2" id="mixed" className="w-4 h-4" />
                <Label htmlFor="mixed" className="text-sm font-medium">Mixed</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-none hover:bg-purple-50">
                <RadioGroupItem value="3" id="solid" className="w-4 h-4" />
                <Label htmlFor="solid" className="text-sm font-medium">Solid Food</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-none hover:bg-purple-50">
                <RadioGroupItem value="4" id="other" className="w-4 h-4" />
                <Label htmlFor="other" className="text-sm font-medium">Other</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Family History Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            ប្រវត្តិគ្រួសារ (Family History)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Add Family Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="familyType" className="text-sm font-medium">Family Type</Label>
                <Input
                  id="familyType"
                  value={newFamilyMember.familyType}
                  onChange={(e) => setNewFamilyMember({...newFamilyMember, familyType: e.target.value})}
                  placeholder="e.g., Mother, Father"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newFamilyMember.age}
                  onChange={(e) => setNewFamilyMember({...newFamilyMember, age: e.target.value})}
                  placeholder="Age"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hivStatus" className="text-sm font-medium">HIV Status</Label>
                <Input
                  id="hivStatus"
                  value={newFamilyMember.hivStatus}
                  onChange={(e) => setNewFamilyMember({...newFamilyMember, hivStatus: e.target.value})}
                  placeholder="HIV Status"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={addFamilyMember} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button onClick={clearFamilyMember} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {familyMembers.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Family Members</h4>
              <div className="space-y-2">
                {familyMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-none">
                    <div className="flex space-x-4">
                      <span className="font-medium">{member.familyType}</span>
                      <span className="text-gray-600">Age: {member.age}</span>
                      <span className="text-gray-600">HIV: {member.hivStatus}</span>
                    </div>
                    <Button
                      onClick={() => removeFamilyMember(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientInformation