import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  FileText, 
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import api from '../../../services/api';
import toastService from '../../../services/toastService';

const DataViewer = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [editingFileName, setEditingFileName] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingSiteName, setEditingSiteName] = useState(null);
  const [editingSiteNameValue, setEditingSiteNameValue] = useState('');
  const [editingProvince, setEditingProvince] = useState(null);
  const [editingProvinceValue, setEditingProvinceValue] = useState('');

  console.log('DataViewer component rendered');

  const showMessage = (type, message) => {
    // Use toast notifications instead of alerts
    if (type === 'success') {
      toastService.success('Success', message);
    } else if (type === 'error') {
      toastService.error('Error', message);
    } else if (type === 'warning') {
      toastService.warning('Warning', message);
    } else if (type === 'info') {
      toastService.info('Info', message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching sites data...');
      // Fetch all sites (both active and inactive) for management
      const sitesResponse = await api.get('/apiv1/lookups/sites-registry');

      console.log('📡 Sites response:', sitesResponse);
      console.log('📡 Sites data:', sitesResponse.data);

      if (Array.isArray(sitesResponse.data)) {
        // Show all sites in DataViewer for management purposes
        console.log('✅ DataViewer loaded sites:', sitesResponse.data.length);
        console.log('📊 Sites with status:', sitesResponse.data.map(s => `${s.code}: ${s.status === 1 ? 'Active' : 'Inactive'}`));
        setSites(sitesResponse.data);
      } else {
        console.error('❌ Invalid sites data format:', sitesResponse.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      console.error('❌ Error details:', err.response?.data);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const updateSiteStatus = async (siteCode, newStatus) => {
    try {
      setUpdatingStatus(siteCode);
      console.log(`🔄 Updating site ${siteCode} status from ${sites.find(s => s.code === siteCode)?.status} to ${newStatus}`);
      
      const response = await api.put(`/apiv1/site-operations/sites/${siteCode}/status`, {
        status: newStatus
      });
      
      console.log('📡 Status update response:', response);
      console.log('📡 Response data:', response.data);
      
      if (response.data && response.data.success) {
        // Update the local state immediately
        setSites(prevSites => {
          const updatedSites = prevSites.map(site => 
            site.code === siteCode 
              ? { ...site, status: newStatus }
              : site
          );
          console.log('🔄 Updated sites state:', updatedSites.find(s => s.code === siteCode));
          return updatedSites;
        });
        
        const statusText = newStatus === 1 ? 'activated' : 'deactivated';
        showMessage('success', `Site ${siteCode} has been ${statusText} successfully`);
        console.log(`✅ Site ${siteCode} status updated to ${newStatus}`);
      } else {
        console.error('❌ Status update failed:', response.data);
        showMessage('error', response.data?.message || 'Failed to update site status');
      }
    } catch (err) {
      console.error('❌ Error updating site status:', err);
      console.error('❌ Error details:', err.response?.data);
      showMessage('error', `Failed to update site status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const startEditingFileName = (siteCode, currentFileName) => {
    setEditingFileName(siteCode);
    setEditingValue(currentFileName || '');
  };

  const cancelEditingFileName = () => {
    setEditingFileName(null);
    setEditingValue('');
  };

  const saveFileName = async (siteCode) => {
    try {
      console.log(`Updating file name for site ${siteCode} to: ${editingValue.trim()}`);
      
      const response = await api.put(`/apiv1/site-operations/sites/${siteCode}/file-name`, {
        fileName: editingValue.trim()
      });
      
      console.log('File name update response:', response.data);
      
      if (response.data.success) {
        // Update the local state immediately
        setSites(prevSites => 
          prevSites.map(site => 
            site.code === siteCode 
              ? { ...site, fileName: editingValue.trim() }
              : site
          )
        );
        
        showMessage('success', `File name updated for site ${siteCode}`);
        setEditingFileName(null);
        setEditingValue('');
        console.log(`File name updated successfully for site ${siteCode}`);
      } else {
        console.error('File name update failed:', response.data.message);
        showMessage('error', response.data.message || 'Failed to update file name');
      }
    } catch (err) {
      console.error('Error updating file name:', err);
      showMessage('error', 'Failed to update file name. Please try again.');
    }
  };

  const startEditingSiteName = (siteCode, currentSiteName) => {
    setEditingSiteName(siteCode);
    setEditingSiteNameValue(currentSiteName || '');
  };

  const cancelEditingSiteName = () => {
    setEditingSiteName(null);
    setEditingSiteNameValue('');
  };

  const saveSiteName = async (siteCode) => {
    try {
      console.log(`Updating site name for site ${siteCode} to: ${editingSiteNameValue.trim()}`);
      
      const response = await api.put(`/apiv1/site-operations/sites/${siteCode}/name`, {
        name: editingSiteNameValue.trim()
      });
      
      console.log('Site name update response:', response.data);
      
      if (response.data.success) {
        // Update the local state immediately
        setSites(prevSites => 
          prevSites.map(site => 
            site.code === siteCode 
              ? { ...site, name: editingSiteNameValue.trim() }
              : site
          )
        );
        
        showMessage('success', `Site name updated for site ${siteCode}`);
        setEditingSiteName(null);
        setEditingSiteNameValue('');
        console.log(`Site name updated successfully for site ${siteCode}`);
      } else {
        console.error('Site name update failed:', response.data.message);
        showMessage('error', response.data.message || 'Failed to update site name');
      }
    } catch (err) {
      console.error('Error updating site name:', err);
      showMessage('error', 'Failed to update site name. Please try again.');
    }
  };

  const startEditingProvince = (siteCode, currentProvince) => {
    setEditingProvince(siteCode);
    setEditingProvinceValue(currentProvince || '');
  };

  const cancelEditingProvince = () => {
    setEditingProvince(null);
    setEditingProvinceValue('');
  };

  const saveProvince = async (siteCode) => {
    try {
      console.log(`Updating province for site ${siteCode} to: ${editingProvinceValue.trim()}`);
      
      const response = await api.put(`/apiv1/site-operations/sites/${siteCode}/province`, {
        province: editingProvinceValue.trim()
      });
      
      console.log('Province update response:', response.data);
      
      if (response.data.success) {
        // Update the local state immediately
        setSites(prevSites => 
          prevSites.map(site => 
            site.code === siteCode 
              ? { ...site, province: editingProvinceValue.trim() }
              : site
          )
        );
        
        showMessage('success', `Province updated for site ${siteCode}`);
        setEditingProvince(null);
        setEditingProvinceValue('');
        console.log(`Province updated successfully for site ${siteCode}`);
      } else {
        console.error('Province update failed:', response.data.message);
        showMessage('error', response.data.message || 'Failed to update province');
      }
    } catch (err) {
      console.error('Error updating province:', err);
      showMessage('error', 'Failed to update province. Please try again.');
    }
  };

  const deleteSite = async (siteCode) => {
    if (!window.confirm(`Are you sure you want to delete site "${siteCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/apiv1/site-operations/sites/${siteCode}`);
      if (response.data.success) {
        // Refresh the data
        await fetchData();
        showMessage('success', `Site ${siteCode} deleted successfully`);
      } else {
        showMessage('error', response.data.message || 'Failed to delete site');
      }
    } catch (err) {
      console.error('Error deleting site:', err);
      showMessage('error', 'Failed to delete site. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Viewer</h2>
          <p className="text-muted-foreground">Manage all sites (active and inactive) with file names and database information</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sites.filter(site => site.status === 1).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sites.filter(site => site.status === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites Data Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">All Sites Data</h3>
        
        {sites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sites found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card rounded-none border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Site Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Site Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Province</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">File Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Search Terms</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Active Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sites.map((site) => (
                    <tr key={site.code} className="hover:bg-muted/50 group">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                       
                          <span className="text-sm font-medium text-foreground">{site.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingSiteName === site.code ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editingSiteNameValue}
                              onChange={(e) => setEditingSiteNameValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter site name"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveSiteName(site.code);
                                } else if (e.key === 'Escape') {
                                  cancelEditingSiteName();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveSiteName(site.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Save className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingSiteName}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-sm text-foreground truncate max-w-xs" title={site.name}>
                              {site.name}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingSiteName(site.code, site.name)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingProvince === site.code ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editingProvinceValue}
                              onChange={(e) => setEditingProvinceValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter province"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProvince(site.code);
                                } else if (e.key === 'Escape') {
                                  cancelEditingProvince();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveProvince(site.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Save className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingProvince}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-sm text-foreground truncate max-w-xs" title={site.province || 'No province'}>
                              {site.province || 'No province'}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingProvince(site.code, site.province)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {editingFileName === site.code ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-border rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter file name"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveFileName(site.code);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingFileName();
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => saveFileName(site.code)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditingFileName}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 flex-1">
                              <span className="text-sm text-foreground truncate max-w-xs" title={site.fileName || 'No file name'}>
                                {site.fileName || 'No file name'}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingFileName(site.code, site.fileName)}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-3 w-3 text-blue-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">{site.searchTerms}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={site.status === 1 ? "default" : "secondary"}
                            className={site.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {site.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSiteStatus(site.code, site.status === 1 ? 0 : 1)}
                            disabled={updatingStatus === site.code}
                            className="h-6 w-6 p-0"
                          >
                            {updatingStatus === site.code ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : site.status === 1 ? (
                              <XCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSite(site.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DataViewer;
