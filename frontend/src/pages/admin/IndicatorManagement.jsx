import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings, 
  RefreshCw, 
  Search, 
  Power, 
  PowerOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  BarChart3,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import mortalityRetentionApi from '@/services/mortalityRetentionApi';

const IndicatorManagement = () => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [pendingChanges, setPendingChanges] = useState({});

  // Load indicators on mount
  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    try {
      setLoading(true);
      const response = await mortalityRetentionApi.getIndicatorStatuses();
      if (response.success) {
        setIndicators(response.indicators || []);
        setPendingChanges({});
      } else {
        toast.error(response.error || "Failed to load indicators");
      }
    } catch (error) {
      console.error('Error loading indicators:', error);
      toast.error(error.message || "Failed to load indicators");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIndicator = (indicatorId, currentStatus) => {
    const newStatus = !currentStatus;
    setPendingChanges(prev => ({
      ...prev,
      [indicatorId]: newStatus
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const changes = Object.entries(pendingChanges).map(([indicatorId, isActive]) => ({
        indicator_id: indicatorId,
        is_active: isActive
      }));

      if (changes.length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await mortalityRetentionApi.bulkUpdateIndicatorStatuses(changes);
      
      if (response.success) {
        toast.success(`Updated ${response.results.filter(r => r.success).length} indicators`);
        
        // Update local state
        setIndicators(prev => prev.map(indicator => {
          const change = pendingChanges[indicator.id];
          if (change !== undefined) {
            return { ...indicator, is_active: change };
          }
          return indicator;
        }));
        
        setPendingChanges({});
      } else {
        toast.error(response.error || "Failed to update indicators");
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (indicatorId, isActive) => {
    try {
      const response = await mortalityRetentionApi.updateIndicatorStatus(indicatorId, isActive);
      
      if (response.success) {
        toast.success(response.message || `Indicator ${isActive ? 'activated' : 'deactivated'}`);
        
        // Update local state
        setIndicators(prev => prev.map(indicator => 
          indicator.id === indicatorId 
            ? { ...indicator, is_active: isActive }
            : indicator
        ));
        
        // Remove from pending changes
        setPendingChanges(prev => {
          const newPending = { ...prev };
          delete newPending[indicatorId];
          return newPending;
        });
      } else {
        toast.error(response.error || "Failed to update indicator");
      }
    } catch (error) {
      console.error('Error updating indicator:', error);
      toast.error(error.message || "Failed to update indicator");
    }
  };

  const handleActivateAll = () => {
    const changes = {};
    filteredIndicators.forEach(indicator => {
      if (!indicator.is_active) {
        changes[indicator.id] = true;
      }
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  const handleDeactivateAll = () => {
    const changes = {};
    filteredIndicators.forEach(indicator => {
      if (indicator.is_active) {
        changes[indicator.id] = false;
      }
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  const handleReset = () => {
    setPendingChanges({});
  };

  // Filter indicators
  const filteredIndicators = indicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && (pendingChanges[indicator.id] !== undefined ? pendingChanges[indicator.id] : indicator.is_active)) ||
                         (statusFilter === 'inactive' && !(pendingChanges[indicator.id] !== undefined ? pendingChanges[indicator.id] : indicator.is_active));
    return matchesSearch && matchesStatus;
  });

  // Get indicator status (considering pending changes)
  const getIndicatorStatus = (indicator) => {
    if (pendingChanges[indicator.id] !== undefined) {
      return pendingChanges[indicator.id];
    }
    return indicator.is_active;
  };

  // Counts
  const activeCount = indicators.filter(ind => getIndicatorStatus(ind)).length;
  const inactiveCount = indicators.length - activeCount;
  const pendingCount = Object.keys(pendingChanges).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading indicators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Indicator Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage active/inactive status of mortality retention indicators for faster development and testing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadIndicators}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Indicators</p>
                <p className="text-2xl font-bold">{indicators.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Changes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search Indicators</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleActivateAll}
                disabled={pendingCount > 0}
              >
                <Power className="h-4 w-4 mr-2" />
                Activate All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeactivateAll}
                disabled={pendingCount > 0}
              >
                <PowerOff className="h-4 w-4 mr-2" />
                Deactivate All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes Banner */}
      {pendingCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click "Save Changes" to apply or "Reset" to discard
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Indicators ({filteredIndicators.length})</CardTitle>
          <CardDescription>
            Toggle indicators on/off to control which ones are executed during development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No indicators found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIndicators.map((indicator) => {
                    const isActive = getIndicatorStatus(indicator);
                    const hasPendingChange = pendingChanges[indicator.id] !== undefined;
                    
                    return (
                      <TableRow 
                        key={indicator.id}
                        className={hasPendingChange ? 'border-orange-600' : ''}
                      >
                        <TableCell>
                          {hasPendingChange && (
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{indicator.id}</TableCell>
                        <TableCell className="font-medium">{indicator.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {indicator.description || 'No description'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={isActive ? "default" : "outline"}
                            className={isActive ? "bg-green-600" : "text-gray-500"}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={isActive}
                              onCheckedChange={(checked) => {
                                if (pendingCount === 0) {
                                  // Save immediately if no other pending changes
                                  handleSaveSingle(indicator.id, checked);
                                } else {
                                  // Add to pending changes
                                  handleToggleIndicator(indicator.id, indicator.is_active);
                                }
                              }}
                            />
                            {hasPendingChange && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveSingle(indicator.id, isActive)}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {/* <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Performance Impact</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Disabling indicators significantly reduces execution time during development:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>All 28 indicators active: ~30-60 seconds</li>
                <li>Only 3 indicators active: ~3-6 seconds</li>
                <li>Only 1 indicator active: ~1-2 seconds</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Note:</strong> Inactive indicators are completely skipped during execution, 
                so no database queries are executed for them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default IndicatorManagement;

