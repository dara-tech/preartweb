import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Separator } from "@/components/ui";
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Pill, 
  Calendar,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ArvDrugsSection = ({ visitId }) => {
  console.log('ArvDrugsSection visitId:', visitId);
  const [arvDrugs, setArvDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [newDrug, setNewDrug] = useState({
    drugName: '',
    dose: '',
    quantity: '',
    frequency: '',
    form: '',
    status: 0,
    date: '',
    reason: '',
    remarks: ''
  });

  // Status options
  const statusOptions = [
    { value: 0, label: 'សកម្ម (Active)', color: 'green', icon: CheckCircle },
    { value: 1, label: 'បញ្ឈប់ (Discontinued)', color: 'red', icon: XCircle },
    { value: 2, label: 'ផ្អាក (On Hold)', color: 'yellow', icon: AlertCircle }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'qd', label: 'ម្តងក្នុងមួយថ្ងៃ (Once Daily - QD)' },
    { value: 'bid', label: 'ពីរដងក្នុងមួយថ្ងៃ (Twice Daily - BID)' },
    { value: 'tid', label: 'បីដងក្នុងមួយថ្ងៃ (Three Times Daily - TID)' },
    { value: 'qid', label: 'បួនដងក្នុងមួយថ្ងៃ (Four Times Daily - QID)' }
  ];

  // Load ARV drugs
  const loadArvDrugs = async () => {
    if (!visitId) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/visits/${visitId}/arv-drugs`);
      const data = await response.json();
      
      if (data.success) {
        setArvDrugs(data.data || []);
        console.log('ARV drugs loaded:', data.data);
      } else {
        console.error('Error loading ARV drugs:', data.message);
      }
    } catch (error) {
      console.error('Error loading ARV drugs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new ARV drug
  const createArvDrug = async () => {
    if (!visitId || !newDrug.drugName) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/visits/${visitId}/arv-drugs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDrug),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewDrug({
          drugName: '',
          dose: '',
          quantity: '',
          frequency: '',
          form: '',
          status: 0,
          date: '',
          reason: '',
          remarks: ''
        });
        loadArvDrugs();
      } else {
        console.error('Error creating ARV drug:', data.message);
      }
    } catch (error) {
      console.error('Error creating ARV drug:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete ARV drug
  const deleteArvDrug = async (drugName) => {
    if (!visitId || !drugName) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/visits/${visitId}/arv-drugs/${drugName}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadArvDrugs();
      } else {
        console.error('Error deleting ARV drug:', data.message);
      }
    } catch (error) {
      console.error('Error deleting ARV drug:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update ARV drug
  const updateArvDrug = async (drugName, updatedData) => {
    if (!visitId || !drugName) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/visits/${visitId}/arv-drugs/${drugName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEditingDrug(null);
        loadArvDrugs();
      } else {
        console.error('Error updating ARV drug:', data.message);
      }
    } catch (error) {
      console.error('Error updating ARV drug:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArvDrugs();
  }, [visitId]);

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  return (
    <div className="space-y-6">
      {/* Add New Drug Form */}
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            បន្ថែមថ្នាំ ARV ថ្មី (Add New ARV Drug)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-drugName">ឈ្មោះថ្នាំ (Drug Name) *</Label>
              <Input
                id="new-drugName"
                value={newDrug.drugName}
                onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
                placeholder="e.g., TDF, 3TC, DTG"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-dose">កម្រិត (Dose)</Label>
              <Input
                id="new-dose"
                value={newDrug.dose}
                onChange={(e) => setNewDrug({ ...newDrug, dose: e.target.value })}
                placeholder="e.g., 300mg, 150mg"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-quantity">បរិមាណ (Quantity)</Label>
              <Input
                id="new-quantity"
                type="number"
                value={newDrug.quantity}
                onChange={(e) => setNewDrug({ ...newDrug, quantity: e.target.value })}
                placeholder="e.g., 30, 60"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-frequency">ដង (Frequency)</Label>
              <Select value={newDrug.frequency} onValueChange={(value) => setNewDrug({ ...newDrug, frequency: value })}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-form">ទម្រង់ (Form)</Label>
              <Input
                id="new-form"
                value={newDrug.form}
                onChange={(e) => setNewDrug({ ...newDrug, form: e.target.value })}
                placeholder="e.g., tablet, capsule"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-status">ស្ថានភាព (Status)</Label>
              <Select value={newDrug.status.toString()} onValueChange={(value) => setNewDrug({ ...newDrug, status: parseInt(value) })}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        {React.createElement(option.icon, { className: `w-4 h-4 text-${option.color}-600` })}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-date">ថ្ងៃខែឆ្នាំ (Date)</Label>
              <Input
                id="new-date"
                type="date"
                value={newDrug.date}
                onChange={(e) => setNewDrug({ ...newDrug, date: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-reason">ហេតុ (Reason)</Label>
              <Input
                id="new-reason"
                value={newDrug.reason}
                onChange={(e) => setNewDrug({ ...newDrug, reason: e.target.value })}
                placeholder="Reason for prescription"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-remarks">ចំណាំ (Remarks)</Label>
              <Input
                id="new-remarks"
                value={newDrug.remarks}
                onChange={(e) => setNewDrug({ ...newDrug, remarks: e.target.value })}
                placeholder="Additional notes"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={createArvDrug} 
              disabled={loading || !newDrug.drugName}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              បន្ថែមថ្នាំ (Add Drug)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing ARV Drugs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            ថ្នាំ ARV បច្ចុប្បន្ន (Current ARV Drugs) ({arvDrugs.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">កំពុងផ្ទុកថ្នាំ ARV... (Loading ARV drugs...)</p>
          </div>
        ) : arvDrugs.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">រកមិនឃើញថ្នាំ ARV សម្រាប់ការពិនិត្យនេះ។ (No ARV drugs found for this visit.)</p>
              <p className="text-sm text-muted-foreground">បន្ថែមថ្នាំថ្មីដោយប្រើទម្រង់ខាងលើ។ (Add a new drug using the form above.)</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {arvDrugs.map((drug, index) => (
              <Card key={`${drug.drugName}-${index}`} className="border border-border hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-none bg-blue-100 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">{drug.drugName}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${
                              getStatusInfo(drug.status).color === 'green' ? 'border-green-300 text-green-700 bg-green-50' :
                              getStatusInfo(drug.status).color === 'red' ? 'border-red-300 text-red-700 bg-red-50' :
                              'border-yellow-300 text-yellow-700 bg-yellow-50'
                            }`}
                          >
                            {React.createElement(getStatusInfo(drug.status).icon, { className: "w-3 h-3 mr-1" })}
                            {getStatusInfo(drug.status).label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">កម្រិត (Dose):</span>
                          <span className="font-medium">{drug.dose || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">បរិមាណ (Quantity):</span>
                          <span className="font-medium">{drug.quantity || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">ដង (Frequency):</span>
                          <span className="font-medium">{drug.frequency || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">ថ្ងៃ (Date):</span>
                          <span className="font-medium">{formatDate(drug.date)}</span>
                        </div>
                      </div>
                      
                      {(drug.form || drug.reason || drug.remarks) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {drug.form && (
                              <div>
                                <span className="text-muted-foreground">ទម្រង់ (Form):</span>
                                <span className="ml-2 font-medium">{drug.form}</span>
                              </div>
                            )}
                            {drug.reason && (
                              <div>
                                <span className="text-muted-foreground">ហេតុ (Reason):</span>
                                <span className="ml-2 font-medium">{drug.reason}</span>
                              </div>
                            )}
                            {drug.remarks && (
                              <div>
                                <span className="text-muted-foreground">ចំណាំ (Remarks):</span>
                                <span className="ml-2 font-medium">{drug.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteArvDrug(drug.drugName)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArvDrugsSection;
