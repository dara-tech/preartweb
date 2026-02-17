import { Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem } from "@/components/ui";
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
    <div className="space-y-5">
      {/* Basic Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានមូលដ្ឋាន</h3>
              <p className="text-xs text-gray-500 mt-0.5">Basic Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  លេខកូដគ្លីនិក <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={safeFormData.clinicId || ''}
                  onChange={(e) => handleInputChange('clinicId', e.target.value)}
                  placeholder="Enter Clinic ID"
                  className="h-9 text-sm"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  ថ្ងៃខែឆ្នាំចាប់ផ្តើម
                </Label>
                <Input
                  type="date"
                  value={safeFormData.dateFirstVisit || ''}
                  onChange={(e) => handleInputChange('dateFirstVisit', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  ថ្ងៃខែឆ្នាំកំណើត <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={safeFormData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="h-9 text-sm"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  ភេទ <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={safeFormData.sex === -1 ? "" : safeFormData.sex.toString()}
                  onValueChange={(value) => handleInputChange('sex', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="female" className="h-4 w-4" />
                    <Label htmlFor="female" className="text-xs cursor-pointer">ស្រី</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="male" className="h-4 w-4" />
                    <Label htmlFor="male" className="text-xs cursor-pointer">ប្រុស</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  ឈ្មោះអ្នកថែទាំ
                </Label>
                <Input
                  value={safeFormData.addGuardian || ''}
                  onChange={(e) => handleInputChange('addGuardian', e.target.value)}
                  placeholder="Enter Guardian Name"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  ក្រុម
                </Label>
                <Select
                  value={safeFormData.group || "none"}
                  onValueChange={(value) => handleInputChange('group', value === "none" ? "" : value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.targetGroups?.map((group) => (
                      <SelectItem key={group.id || group.tid} value={String(group.id || group.tid)}>
                        {group.name || group.targroupname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានអាសយដ្ឋាន</h3>
              <p className="text-xs text-gray-500 mt-0.5">Address Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ផ្ទះលេខ</Label>
                <Input
                  value={safeFormData.house || ''}
                  onChange={(e) => handleInputChange('house', e.target.value)}
                  placeholder="Enter House Number"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ផ្លូវ</Label>
                <Input
                  value={safeFormData.street || ''}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Enter Street"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ភូមិ</Label>
                <Input
                  value={safeFormData.village || ''}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  placeholder="Enter Village"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ឃុំ</Label>
                <Input
                  value={safeFormData.commune || ''}
                  onChange={(e) => handleInputChange('commune', e.target.value)}
                  placeholder="Enter Commune"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ស្រុក</Label>
                <Input
                  value={safeFormData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter District"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ខេត្ត</Label>
                <Select
                  value={safeFormData.province || "none"}
                  onValueChange={(value) => handleInputChange('province', value === "none" ? "" : value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.provinces?.map((province) => (
                      <SelectItem key={province.id || province.pid} value={province.name || province.provincename}>
                        {province.name || province.provincename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានទំនាក់ទំនង</h3>
              <p className="text-xs text-gray-500 mt-0.5">Contact Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ឈ្មោះទំនាក់ទំនង</Label>
                <Input
                  value={safeFormData.nameContact || ''}
                  onChange={(e) => handleInputChange('nameContact', e.target.value)}
                  placeholder="Enter Contact Name"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">អាសយដ្ឋានទំនាក់ទំនង</Label>
                <Input
                  value={safeFormData.addressContact || ''}
                  onChange={(e) => handleInputChange('addressContact', e.target.value)}
                  placeholder="Enter Contact Address"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ទូរស័ព្ទ</Label>
                <Input
                  value={safeFormData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter Phone Number"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានគ្រួសារ</h3>
              <p className="text-xs text-gray-500 mt-0.5">Family Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">អាយុឪពុក</Label>
                <Input
                  value={safeFormData.fAge || ''}
                  onChange={(e) => handleInputChange('fAge', e.target.value)}
                  placeholder="Enter Father's Age"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ឪពុកមាន HIV</Label>
                <RadioGroup
                  value={safeFormData.fHIV === -1 ? "" : safeFormData.fHIV.toString()}
                  onValueChange={(value) => handleInputChange('fHIV', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="fHIVNo" className="h-4 w-4" />
                    <Label htmlFor="fHIVNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="fHIVYes" className="h-4 w-4" />
                    <Label htmlFor="fHIVYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ស្ថានភាពឪពុក</Label>
                <RadioGroup
                  value={safeFormData.fStatus === -1 ? "" : safeFormData.fStatus.toString()}
                  onValueChange={(value) => handleInputChange('fStatus', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="fStatusAlive" className="h-4 w-4" />
                    <Label htmlFor="fStatusAlive" className="text-xs cursor-pointer">រស់</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="fStatusDead" className="h-4 w-4" />
                    <Label htmlFor="fStatusDead" className="text-xs cursor-pointer">ស្លាប់</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">អាយុម្តាយ</Label>
                <Input
                  value={safeFormData.mAge || ''}
                  onChange={(e) => handleInputChange('mAge', e.target.value)}
                  placeholder="Enter Mother's Age"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">លេខកូដម្តាយ</Label>
                <Input
                  value={safeFormData.mClinicId || ''}
                  onChange={(e) => handleInputChange('mClinicId', e.target.value)}
                  placeholder="Enter Mother's Clinic ID"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ម្តាយប្រើ ART</Label>
                <RadioGroup
                  value={safeFormData.mArt === -1 ? "" : safeFormData.mArt.toString()}
                  onValueChange={(value) => handleInputChange('mArt', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="mArtNo" className="h-4 w-4" />
                    <Label htmlFor="mArtNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="mArtYes" className="h-4 w-4" />
                    <Label htmlFor="mArtYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ឈ្មោះមន្ទីរពេទ្យ</Label>
                <Select
                  value={safeFormData.hospitalName || "none"}
                  onValueChange={(value) => handleInputChange('hospitalName', value === "none" ? "" : value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.hospitals?.map((hospital) => (
                      <SelectItem key={hospital.id || hospital.code} value={hospital.name || hospital.hospitalname}>
                        {hospital.name || hospital.hospitalname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ស្ថានភាពម្តាយ</Label>
                <RadioGroup
                  value={safeFormData.mStatus === -1 ? "" : safeFormData.mStatus.toString()}
                  onValueChange={(value) => handleInputChange('mStatus', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="mStatusAlive" className="h-4 w-4" />
                    <Label htmlFor="mStatusAlive" className="text-xs cursor-pointer">រស់</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="mStatusDead" className="h-4 w-4" />
                    <Label htmlFor="mStatusDead" className="text-xs cursor-pointer">ស្លាប់</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មានការកើត</h3>
              <p className="text-xs text-gray-500 mt-0.5">Delivery Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រភេទកន្លែងកើត</Label>
                <RadioGroup
                  value={safeFormData.catPlaceDelivery === -1 ? "" : safeFormData.catPlaceDelivery.toString()}
                  onValueChange={(value) => handleInputChange('catPlaceDelivery', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="catPlaceHome" className="h-4 w-4" />
                    <Label htmlFor="catPlaceHome" className="text-xs cursor-pointer">ផ្ទះ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="catPlaceHospital" className="h-4 w-4" />
                    <Label htmlFor="catPlaceHospital" className="text-xs cursor-pointer">មន្ទីរពេទ្យ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">កន្លែងកើត</Label>
                <Input
                  value={safeFormData.placeDelivery || ''}
                  onChange={(e) => handleInputChange('placeDelivery', e.target.value)}
                  placeholder="Enter Place of Delivery"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">PMTCT</Label>
                <RadioGroup
                  value={safeFormData.pmtct === -1 ? "" : safeFormData.pmtct.toString()}
                  onValueChange={(value) => handleInputChange('pmtct', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="pmtctNo" className="h-4 w-4" />
                    <Label htmlFor="pmtctNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="pmtctYes" className="h-4 w-4" />
                    <Label htmlFor="pmtctYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ថ្ងៃខែឆ្នាំកើត</Label>
                <Input
                  type="date"
                  value={safeFormData.dateDelivery || ''}
                  onChange={(e) => handleInputChange('dateDelivery', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ស្ថានភាពកើត</Label>
                <RadioGroup
                  value={safeFormData.deliveryStatus === -1 ? "" : safeFormData.deliveryStatus.toString()}
                  onValueChange={(value) => handleInputChange('deliveryStatus', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="deliveryAlive" className="h-4 w-4" />
                    <Label htmlFor="deliveryAlive" className="text-xs cursor-pointer">រស់</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="deliveryDead" className="h-4 w-4" />
                    <Label htmlFor="deliveryDead" className="text-xs cursor-pointer">ស្លាប់</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ប្រវែងទារក (cm)</Label>
                <Input
                  value={safeFormData.lenBaby || ''}
                  onChange={(e) => handleInputChange('lenBaby', e.target.value)}
                  placeholder="Enter Baby Length"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ទម្ងន់ទារក (kg)</Label>
                <Input
                  value={safeFormData.wBaby || ''}
                  onChange={(e) => handleInputChange('wBaby', e.target.value)}
                  placeholder="Enter Baby Weight"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HIV Information Section */}
      <Card className="border border-border bg-white">
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-gray-900">ព័ត៌មាន HIV</h3>
              <p className="text-xs text-gray-500 mt-0.5">HIV Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ដឹង HIV</Label>
                <RadioGroup
                  value={safeFormData.knownHIV === -1 ? "" : safeFormData.knownHIV.toString()}
                  onValueChange={(value) => handleInputChange('knownHIV', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="knownHIVNo" className="h-4 w-4" />
                    <Label htmlFor="knownHIVNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="knownHIVYes" className="h-4 w-4" />
                    <Label htmlFor="knownHIVYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ទទួលបាន</Label>
                <RadioGroup
                  value={safeFormData.received === -1 ? "" : safeFormData.received.toString()}
                  onValueChange={(value) => handleInputChange('received', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="receivedNo" className="h-4 w-4" />
                    <Label htmlFor="receivedNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="receivedYes" className="h-4 w-4" />
                    <Label htmlFor="receivedYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">សុីរ៉ុប</Label>
                <RadioGroup
                  value={safeFormData.syrup === -1 ? "" : safeFormData.syrup.toString()}
                  onValueChange={(value) => handleInputChange('syrup', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="syrupNo" className="h-4 w-4" />
                    <Label htmlFor="syrupNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="syrupYes" className="h-4 w-4" />
                    <Label htmlFor="syrupYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">កូត្រីម៉ាសាឡី</Label>
                <RadioGroup
                  value={safeFormData.cotrim === -1 ? "" : safeFormData.cotrim.toString()}
                  onValueChange={(value) => handleInputChange('cotrim', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="cotrimNo" className="h-4 w-4" />
                    <Label htmlFor="cotrimNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="cotrimYes" className="h-4 w-4" />
                    <Label htmlFor="cotrimYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ផ្ទេរ</Label>
                <RadioGroup
                  value={safeFormData.offIn === -1 ? "" : safeFormData.offIn.toString()}
                  onValueChange={(value) => handleInputChange('offIn', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="offInNo" className="h-4 w-4" />
                    <Label htmlFor="offInNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="offInYes" className="h-4 w-4" />
                    <Label htmlFor="offInYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {safeFormData.offIn === 1 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">ឈ្មោះគេហទំព័រ</Label>
                  <Select
                    value={safeFormData.siteName || "none"}
                    onValueChange={(value) => handleInputChange('siteName', value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select Site" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownOptions.sites?.map((site) => (
                        <SelectItem key={site.id || site.sid || site.code} value={site.name || `${site.sid} -- ${site.sitename}`}>
                          {site.name || `${site.sid} -- ${site.sitename}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ការធ្វើតេស្ត HIV</Label>
                <RadioGroup
                  value={safeFormData.hivTest === -1 ? "" : safeFormData.hivTest.toString()}
                  onValueChange={(value) => handleInputChange('hivTest', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="hivTestNo" className="h-4 w-4" />
                    <Label htmlFor="hivTestNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="hivTestYes" className="h-4 w-4" />
                    <Label htmlFor="hivTestYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ម្តាយមាន HIV</Label>
                <RadioGroup
                  value={safeFormData.mHIV === -1 ? "" : safeFormData.mHIV.toString()}
                  onValueChange={(value) => handleInputChange('mHIV', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="mHIVNo" className="h-4 w-4" />
                    <Label htmlFor="mHIVNo" className="text-xs cursor-pointer">ទេ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="mHIVYes" className="h-4 w-4" />
                    <Label htmlFor="mHIVYes" className="text-xs cursor-pointer">បាទ</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ម្តាយ VL ចុងក្រោយ</Label>
                <Input
                  value={safeFormData.mLastVl || ''}
                  onChange={(e) => handleInputChange('mLastVl', e.target.value)}
                  placeholder="Enter Mother Last VL"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">ថ្ងៃខែឆ្នាំ VL ចុងក្រោយ</Label>
                <Input
                  type="date"
                  value={safeFormData.dateMLastVl || ''}
                  onChange={(e) => handleInputChange('dateMLastVl', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">លេខកូដ EO</Label>
                <Input
                  value={safeFormData.eoClinicId || ''}
                  onChange={(e) => handleInputChange('eoClinicId', e.target.value)}
                  placeholder="Enter EO Clinic ID"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientInformation
