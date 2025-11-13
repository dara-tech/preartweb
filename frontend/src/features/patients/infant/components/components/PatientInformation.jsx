import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
import React from 'react'

function PatientInformation({ 
  formData, 
  setFormData, 
  handleInputChange, 
  dropdownOptions 
}) {
  // Ensure formData has default values to prevent undefined errors
  const safeFormData = {
    clinicId: '',
    dateFirstVisit: '',
    dateOfBirth: '',
    sex: -1,
    addGuardian: '',
    group: '',
    house: '',
    street: '',
    village: '',
    commune: '',
    district: '',
    province: '',
    nameContact: '',
    addressContact: '',
    phone: '',
    fAge: '',
    fHIV: -1,
    fStatus: -1,
    mAge: '',
    mClinicId: '',
    mArt: -1,
    hospitalName: '',
    mStatus: -1,
    catPlaceDelivery: -1,
    placeDelivery: '',
    pmtct: -1,
    dateDelivery: '',
    deliveryStatus: -1,
    lenBaby: '',
    wBaby: '',
    knownHIV: -1,
    received: -1,
    syrup: -1,
    cotrim: -1,
    offIn: -1,
    siteName: '',
    hivTest: -1,
    mHIV: -1,
    mLastVl: '',
    dateMLastVl: '',
    eoClinicId: '',
    ...formData
  }

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-purple-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">1</span>
            </div>
            ព័ត៌មានមូលដ្ឋាន / Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                លេខកូដគ្លីនិក / Clinic ID
              </Label>
              <Input
                value={safeFormData.clinicId || ''}
                onChange={(e) => handleInputChange('clinicId', e.target.value)}
                placeholder="Enter Clinic ID"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំចាប់ផ្តើម / Date of First Visit
              </Label>
              <Input
                type="date"
                value={safeFormData.dateFirstVisit || ''}
                onChange={(e) => handleInputChange('dateFirstVisit', e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំកំណើត / Date of Birth
              </Label>
              <Input
                type="date"
                value={safeFormData.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ភេទ / Sex
              </Label>
              <RadioGroup
                value={safeFormData.sex === -1 ? "" : safeFormData.sex.toString()}
                onValueChange={(value) => handleInputChange('sex', parseInt(value))}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="female" className="w-4 h-4" />
                  <Label htmlFor="female" className="text-sm font-medium">ស្រី / Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="male" className="w-4 h-4" />
                  <Label htmlFor="male" className="text-sm font-medium">ប្រុស / Male</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ឈ្មោះអ្នកថែទាំ / Guardian Name
              </Label>
              <Input
                value={safeFormData.addGuardian || ''}
                onChange={(e) => handleInputChange('addGuardian', e.target.value)}
                placeholder="Enter Guardian Name"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ក្រុម / Group
              </Label>
              <Select
                value={safeFormData.group || "none"}
                onValueChange={(value) => handleInputChange('group', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Group</SelectItem>
                  {dropdownOptions.targetGroups?.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.id} - {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            ព័ត៌មានអាសយដ្ឋាន / Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ផ្ទះលេខ / House Number
              </Label>
              <Input
                value={safeFormData.house || ''}
                onChange={(e) => handleInputChange('house', e.target.value)}
                placeholder="Enter House Number"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ផ្លូវ / Street
              </Label>
              <Input
                value={safeFormData.street || ''}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Enter Street"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ភូមិ / Village
              </Label>
              <Input
                value={safeFormData.village || ''}
                onChange={(e) => handleInputChange('village', e.target.value)}
                placeholder="Enter Village"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ឃុំ / Commune
              </Label>
              <Input
                value={safeFormData.commune || ''}
                onChange={(e) => handleInputChange('commune', e.target.value)}
                placeholder="Enter Commune"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ស្រុក / District
              </Label>
              <Input
                value={safeFormData.district || ''}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="Enter District"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ខេត្ត / Province
              </Label>
              <Select
                value={safeFormData.province || "none"}
                onValueChange={(value) => handleInputChange('province', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Province</SelectItem>
                  {dropdownOptions.provinces?.map((province) => (
                    <SelectItem key={province.id} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            ព័ត៌មានទំនាក់ទំនង / Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ឈ្មោះទំនាក់ទំនង / Contact Name
              </Label>
              <Input
                value={safeFormData.nameContact || ''}
                onChange={(e) => handleInputChange('nameContact', e.target.value)}
                placeholder="Enter Contact Name"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                អាសយដ្ឋានទំនាក់ទំនង / Contact Address
              </Label>
              <Input
                value={safeFormData.addressContact || ''}
                onChange={(e) => handleInputChange('addressContact', e.target.value)}
                placeholder="Enter Contact Address"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ទូរស័ព្ទ / Phone
              </Label>
              <Input
                value={safeFormData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter Phone Number"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-orange-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-orange-600 font-bold">4</span>
            </div>
            ព័ត៌មានគ្រួសារ / Family Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                អាយុឪពុក / Father's Age
              </Label>
              <Input
                value={safeFormData.fAge || ''}
                onChange={(e) => handleInputChange('fAge', e.target.value)}
                placeholder="Enter Father's Age"
                className="h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ឪពុកមាន HIV / Father HIV Status
              </Label>
              <RadioGroup
                value={safeFormData.fHIV === -1 ? "" : safeFormData.fHIV.toString()}
                onValueChange={(value) => handleInputChange('fHIV', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="fHIVNo" className="w-4 h-4" />
                  <Label htmlFor="fHIVNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="fHIVYes" className="w-4 h-4" />
                  <Label htmlFor="fHIVYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ស្ថានភាពឪពុក / Father's Status
              </Label>
              <RadioGroup
                value={safeFormData.fStatus === -1 ? "" : safeFormData.fStatus.toString()}
                onValueChange={(value) => handleInputChange('fStatus', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="fStatusAlive" className="w-4 h-4" />
                  <Label htmlFor="fStatusAlive" className="text-sm font-medium">រស់ / Alive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="fStatusDead" className="w-4 h-4" />
                  <Label htmlFor="fStatusDead" className="text-sm font-medium">ស្លាប់ / Dead</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                អាយុម្តាយ / Mother's Age
              </Label>
              <Input
                value={safeFormData.mAge || ''}
                onChange={(e) => handleInputChange('mAge', e.target.value)}
                placeholder="Enter Mother's Age"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                លេខកូដម្តាយ / Mother's Clinic ID
              </Label>
              <Input
                value={safeFormData.mClinicId || ''}
                onChange={(e) => handleInputChange('mClinicId', e.target.value)}
                placeholder="Enter Mother's Clinic ID"
                className="h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ម្តាយប្រើ ART / Mother on ART
              </Label>
              <RadioGroup
                value={safeFormData.mArt === -1 ? "" : safeFormData.mArt.toString()}
                onValueChange={(value) => handleInputChange('mArt', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="mArtNo" className="w-4 h-4" />
                  <Label htmlFor="mArtNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="mArtYes" className="w-4 h-4" />
                  <Label htmlFor="mArtYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ឈ្មោះមន្ទីរពេទ្យ / Hospital Name
              </Label>
              <Select
                value={safeFormData.hospitalName || "none"}
                onValueChange={(value) => handleInputChange('hospitalName', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Hospital</SelectItem>
                  {dropdownOptions.hospitals?.map((hospital) => (
                    <SelectItem key={hospital.code} value={hospital.name}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ស្ថានភាពម្តាយ / Mother's Status
              </Label>
              <RadioGroup
                value={safeFormData.mStatus === -1 ? "" : safeFormData.mStatus.toString()}
                onValueChange={(value) => handleInputChange('mStatus', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="mStatusAlive" className="w-4 h-4" />
                  <Label htmlFor="mStatusAlive" className="text-sm font-medium">រស់ / Alive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="mStatusDead" className="w-4 h-4" />
                  <Label htmlFor="mStatusDead" className="text-sm font-medium">ស្លាប់ / Dead</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-red-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold">5</span>
            </div>
            ព័ត៌មានការកើត / Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រភេទកន្លែងកើត / Place of Delivery Category
              </Label>
              <RadioGroup
                value={safeFormData.catPlaceDelivery === -1 ? "" : safeFormData.catPlaceDelivery.toString()}
                onValueChange={(value) => handleInputChange('catPlaceDelivery', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="catPlaceHome" className="w-4 h-4" />
                  <Label htmlFor="catPlaceHome" className="text-sm font-medium">ផ្ទះ / Home</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="catPlaceHospital" className="w-4 h-4" />
                  <Label htmlFor="catPlaceHospital" className="text-sm font-medium">មន្ទីរពេទ្យ / Hospital</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                កន្លែងកើត / Place of Delivery
              </Label>
              <Input
                value={safeFormData.placeDelivery || ''}
                onChange={(e) => handleInputChange('placeDelivery', e.target.value)}
                placeholder="Enter Place of Delivery"
                className="h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                PMTCT / PMTCT
              </Label>
              <RadioGroup
                value={safeFormData.pmtct === -1 ? "" : safeFormData.pmtct.toString()}
                onValueChange={(value) => handleInputChange('pmtct', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="pmtctNo" className="w-4 h-4" />
                  <Label htmlFor="pmtctNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="pmtctYes" className="w-4 h-4" />
                  <Label htmlFor="pmtctYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំកើត / Date of Delivery
              </Label>
              <Input
                type="date"
                value={safeFormData.dateDelivery || ''}
                onChange={(e) => handleInputChange('dateDelivery', e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ស្ថានភាពកើត / Delivery Status
              </Label>
              <RadioGroup
                value={safeFormData.deliveryStatus === -1 ? "" : safeFormData.deliveryStatus.toString()}
                onValueChange={(value) => handleInputChange('deliveryStatus', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="deliveryAlive" className="w-4 h-4" />
                  <Label htmlFor="deliveryAlive" className="text-sm font-medium">រស់ / Alive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="deliveryDead" className="w-4 h-4" />
                  <Label htmlFor="deliveryDead" className="text-sm font-medium">ស្លាប់ / Dead</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ប្រវែងទារក / Baby Length (cm)
              </Label>
              <Input
                value={safeFormData.lenBaby || ''}
                onChange={(e) => handleInputChange('lenBaby', e.target.value)}
                placeholder="Enter Baby Length"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ទម្ងន់ទារក / Baby Weight (kg)
              </Label>
              <Input
                value={safeFormData.wBaby || ''}
                onChange={(e) => handleInputChange('wBaby', e.target.value)}
                placeholder="Enter Baby Weight"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HIV Information Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-indigo-600 text-white">
          <CardTitle className="text-lg font-bold flex items-center">
            <div className="w-8 h-8 bg-white rounded-none flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-bold">6</span>
            </div>
            ព័ត៌មាន HIV / HIV Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ដឹង HIV / Known HIV
              </Label>
              <RadioGroup
                value={safeFormData.knownHIV === -1 ? "" : safeFormData.knownHIV.toString()}
                onValueChange={(value) => handleInputChange('knownHIV', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="knownHIVNo" className="w-4 h-4" />
                  <Label htmlFor="knownHIVNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="knownHIVYes" className="w-4 h-4" />
                  <Label htmlFor="knownHIVYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ទទួលបាន / Received
              </Label>
              <RadioGroup
                value={safeFormData.received === -1 ? "" : safeFormData.received.toString()}
                onValueChange={(value) => handleInputChange('received', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="receivedNo" className="w-4 h-4" />
                  <Label htmlFor="receivedNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="receivedYes" className="w-4 h-4" />
                  <Label htmlFor="receivedYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                សុីរ៉ុប / Syrup
              </Label>
              <RadioGroup
                value={safeFormData.syrup === -1 ? "" : safeFormData.syrup.toString()}
                onValueChange={(value) => handleInputChange('syrup', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="syrupNo" className="w-4 h-4" />
                  <Label htmlFor="syrupNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="syrupYes" className="w-4 h-4" />
                  <Label htmlFor="syrupYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                កូត្រីម៉ាសាឡី / Cotrimoxazole
              </Label>
              <RadioGroup
                value={safeFormData.cotrim === -1 ? "" : safeFormData.cotrim.toString()}
                onValueChange={(value) => handleInputChange('cotrim', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="cotrimNo" className="w-4 h-4" />
                  <Label htmlFor="cotrimNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="cotrimYes" className="w-4 h-4" />
                  <Label htmlFor="cotrimYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ផ្ទេរ / Transfer In
              </Label>
              <RadioGroup
                value={safeFormData.offIn === -1 ? "" : safeFormData.offIn.toString()}
                onValueChange={(value) => handleInputChange('offIn', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="offInNo" className="w-4 h-4" />
                  <Label htmlFor="offInNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="offInYes" className="w-4 h-4" />
                  <Label htmlFor="offInYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ឈ្មោះគេហទំព័រ / Site Name
              </Label>
              <Select
                value={safeFormData.siteName || "none"}
                onValueChange={(value) => handleInputChange('siteName', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">Select Site</SelectItem>
                  {dropdownOptions.sites?.map((site) => (
                    <SelectItem key={site.code} value={site.name}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ការធ្វើតេស្ត HIV / HIV Test
              </Label>
              <RadioGroup
                value={safeFormData.hivTest === -1 ? "" : safeFormData.hivTest.toString()}
                onValueChange={(value) => handleInputChange('hivTest', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="hivTestNo" className="w-4 h-4" />
                  <Label htmlFor="hivTestNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="hivTestYes" className="w-4 h-4" />
                  <Label htmlFor="hivTestYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                ម្តាយមាន HIV / Mother HIV
              </Label>
              <RadioGroup
                value={safeFormData.mHIV === -1 ? "" : safeFormData.mHIV.toString()}
                onValueChange={(value) => handleInputChange('mHIV', parseInt(value))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="mHIVNo" className="w-4 h-4" />
                  <Label htmlFor="mHIVNo" className="text-sm font-medium">ទេ / No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="mHIVYes" className="w-4 h-4" />
                  <Label htmlFor="mHIVYes" className="text-sm font-medium">បាទ / Yes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ម្តាយ VL ចុងក្រោយ / Mother Last VL
              </Label>
              <Input
                value={safeFormData.mLastVl || ''}
                onChange={(e) => handleInputChange('mLastVl', e.target.value)}
                placeholder="Enter Mother Last VL"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                ថ្ងៃខែឆ្នាំ VL ចុងក្រោយ / Date Last VL
              </Label>
              <Input
                type="date"
                value={safeFormData.dateMLastVl || ''}
                onChange={(e) => handleInputChange('dateMLastVl', e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                លេខកូដ EO / EO Clinic ID
              </Label>
              <Input
                value={safeFormData.eoClinicId || ''}
                onChange={(e) => handleInputChange('eoClinicId', e.target.value)}
                placeholder="Enter EO Clinic ID"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientInformation
