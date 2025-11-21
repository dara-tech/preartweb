import { Button, Input, Label } from "@/components/ui";
import React from 'react';
import { Plus, RotateCcw, X } from "lucide-react";

function FamilyHistorySection({ familyMembers, setFamilyMembers, newFamilyMember, setNewFamilyMember }) {
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
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">ប្រវត្តិគ្រួសារ</h3>
        <p className="text-sm text-muted-foreground mt-1">Family History</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label htmlFor="familyType" className="text-sm font-medium text-foreground">
              Family Type
            </Label>
            <Input
              id="familyType"
              value={newFamilyMember.familyType}
              onChange={(e) => setNewFamilyMember({...newFamilyMember, familyType: e.target.value})}
              placeholder="e.g., Mother, Father"
              className="h-10 text-sm rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium text-foreground">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              value={newFamilyMember.age}
              onChange={(e) => setNewFamilyMember({...newFamilyMember, age: e.target.value})}
              placeholder="Age"
              className="h-10 text-sm rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hivStatus" className="text-sm font-medium text-foreground">
              HIV Status
            </Label>
            <Input
              id="hivStatus"
              value={newFamilyMember.hivStatus}
              onChange={(e) => setNewFamilyMember({...newFamilyMember, hivStatus: e.target.value})}
              placeholder="HIV Status"
              className="h-10 text-sm rounded-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              onClick={addFamilyMember} 
              size="sm" 
              className="h-10 text-sm rounded-none flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button 
              onClick={clearFamilyMember} 
              size="sm" 
              variant="ghost"
              className="h-10 w-10 p-0 rounded-none"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {familyMembers.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <Label className="text-sm font-medium text-foreground">Family Members</Label>
            <div className="space-y-2">
              {familyMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-none border border-border">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-foreground">{member.familyType}</span>
                    {member.age && <span className="text-muted-foreground">Age: {member.age}</span>}
                    {member.hivStatus && <span className="text-muted-foreground">HIV: {member.hivStatus}</span>}
                  </div>
                  <Button
                    onClick={() => removeFamilyMember(index)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-none text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FamilyHistorySection;

