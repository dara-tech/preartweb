import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Database, CheckCircle, AlertCircle, X, FileText, Loader2, Play, Pause } from 'lucide-react';
import siteApi from '../services/siteApi';
import importApi from '../services/importApi';
import toastService from '../services/toastService';

const ImportData = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetSite, setTargetSite] = useState('');
  const [createNewDatabase, setCreateNewDatabase] = useState(false);
  const [newSiteCode, setNewSiteCode] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteProvince, setNewSiteProvince] = useState('');
  const [newSiteDistrict, setNewSiteDistrict] = useState('');
  const [newSiteFileName, setNewSiteFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle'); // idle, importing, success, error
  const [importMessage, setImportMessage] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [extractedSiteInfo, setExtractedSiteInfo] = useState(null);
  const [isActive, setIsActive] = useState(true);
  
  const fileInputRef = useRef(null);

  // Load sites on component mount
  React.useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await siteApi.getAllSites();
      const allSites = response.sites || response.data || response;
      
      // Filter out inactive sites (status = 0)
      const activeSites = (allSites || []).filter(site => site.status === 1);
      setSites(activeSites);
    } catch (error) {
      console.error('Error loading sites:', error);
      setImportStatus('error');
      setImportMessage('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/sql' || file.name.endsWith('.sql')) {
        setSelectedFile(file);
        setValidationErrors([]);
        setImportStatus('idle');
        setExtractedSiteInfo(null);
        
        toastService.success('File Selected', `Selected file: ${file.name}`);
        
        // Check if file contains tblsitename table
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const hasTblSiteName = /CREATE TABLE.*tblsitename/i.test(content) || 
                                /INSERT INTO.*tblsitename/i.test(content);
          
          if (hasTblSiteName) {
            setExtractedSiteInfo({
              detected: true,
              message: 'Site information will be automatically extracted from tblsitename table'
            });
            toastService.info('Site Info Detected', 'Site information will be automatically extracted from tblsitename table');
          }
        };
        reader.readAsText(file);
      } else {
        setValidationErrors(['Please select a valid SQL file (.sql)']);
        toastService.error('Invalid File Type', 'Please select a valid SQL file (.sql)');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/sql' || file.name.endsWith('.sql')) {
        setSelectedFile(file);
        setValidationErrors([]);
        setImportStatus('idle');
        setExtractedSiteInfo(null);
        
        toastService.success('File Dropped', `Dropped file: ${file.name}`);
        
        // Check if file contains tblsitename table
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const hasTblSiteName = /CREATE TABLE.*tblsitename/i.test(content) || 
                                /INSERT INTO.*tblsitename/i.test(content);
          
          if (hasTblSiteName) {
            setExtractedSiteInfo({
              detected: true,
              message: 'Site information will be automatically extracted from tblsitename table'
            });
            toastService.info('Site Info Detected', 'Site information will be automatically extracted from tblsitename table');
          }
        };
        reader.readAsText(file);
      } else {
        setValidationErrors(['Please select a valid SQL file (.sql)']);
        toastService.error('Invalid File Type', 'Please select a valid SQL file (.sql)');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleToggleActive = (newActiveState) => {
    if (importStatus === 'importing') {
      toastService.warning(
        'Cannot Change Status',
        'Import status cannot be changed while an import is in progress.'
      );
      return; // Don't allow changes during import
    }
    
    if (isActive && !newActiveState) {
      // Confirmation when deactivating
      const confirmed = window.confirm(
        'Are you sure you want to deactivate the import function? This will prevent new imports from being processed.'
      );
      if (confirmed) {
        setIsActive(newActiveState);
        toastService.warning(
          'Import Deactivated',
          'Import function has been deactivated. New imports will be blocked.'
        );
      }
    } else {
      setIsActive(newActiveState);
      toastService.success(
        'Import Activated',
        'Import function has been activated. You can now import data.'
      );
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExtractedSiteInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toastService.info('File Removed', 'Selected file has been removed.');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedFile) {
      errors.push('Please select a SQL file to import');
    }
    
    if (!createNewDatabase && !targetSite) {
      errors.push('Please select a target site or choose to create a new database');
    }
    
    if (createNewDatabase) {
      if (!newSiteCode.trim()) {
        errors.push('Site code is required for new database');
      }
      if (!newSiteName.trim()) {
        errors.push('Site name is required for new database');
      }
      if (!newSiteProvince.trim()) {
        errors.push('Province is required for new database');
      }
      if (!newSiteDistrict.trim()) {
        errors.push('District is required for new database');
      }
      if (!newSiteFileName.trim()) {
        errors.push('File name is required for new database');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleImport = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isActive) {
      setImportStatus('error');
      setImportMessage('Import is currently inactive. Please activate the import function first.');
      return;
    }

    setImportStatus('importing');
    setImportProgress(0);
    setImportMessage('Starting import process...');
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('sqlFile', selectedFile);
      
      if (createNewDatabase) {
        formData.append('createNewDatabase', 'true');
        formData.append('siteCode', newSiteCode);
        formData.append('siteName', newSiteName);
        formData.append('province', newSiteProvince);
        formData.append('district', newSiteDistrict);
        formData.append('fileName', newSiteFileName);
      } else {
        formData.append('targetSite', targetSite);
      }

      const response = await importApi.importSqlFile(formData, (progress) => {
        setImportProgress(progress);
        // Update message based on progress
        if (progress < 30) {
          setImportMessage('Uploading file...');
        } else if (progress < 60) {
          setImportMessage('Processing SQL file...');
        } else if (progress < 90) {
          setImportMessage('Creating database and importing data...');
        } else if (progress < 100) {
          setImportMessage('Finalizing import...');
        }
      });

      if (response.success) {
        setImportStatus('success');
        setImportMessage(response.message || 'Data imported successfully!');
        setImportProgress(100);
        
        // Show extracted site info if available
        if (response.extractedSiteInfo) {
          setExtractedSiteInfo({
            detected: true,
            message: 'Site information was successfully extracted from tblsitename table',
            success: true
          });
        }
        
        // Show success toast
        toastService.success(
          'Import Successful!',
          `${response.message || 'Data imported successfully!'}\n\nSite: ${createNewDatabase ? newSiteCode : targetSite}\nFile: ${selectedFile.name}`
        );
        
        // Reset form
        setSelectedFile(null);
        setTargetSite('');
        setCreateNewDatabase(false);
        setNewSiteCode('');
        setNewSiteName('');
        setNewSiteProvince('');
        setNewSiteDistrict('');
        setNewSiteFileName('');
        setExtractedSiteInfo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Reload sites to show the new one
        await loadSites();
      } else {
        setImportStatus('error');
        setImportMessage(response.message || 'Import failed');
        toastService.error(
          'Import Failed!',
          `${response.message || 'Import failed'}\n\nPlease check your file and try again.`
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage(error.message || 'Import failed');
      toastService.error(
        'Import Error!',
        `${error.message || 'Import failed'}\n\nPlease check your file and try again.`
      );
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'importing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto  space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Import Data</h1>
        <p className="text-gray-600">Upload SQL files to import data into your system</p>
        
        {/* Active/Inactive Status Controls */}
        <div className="mt-4 flex justify-center gap-3">
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleActive(true)}
            disabled={importStatus === 'importing'}
            className={`flex items-center gap-2 ${isActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'} ${importStatus === 'importing' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Play className="h-4 w-4" />
            Active
          </Button>
          <Button
            variant={!isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleActive(false)}
            disabled={importStatus === 'importing'}
            className={`flex items-center gap-2 ${!isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-600 text-red-600 hover:bg-red-50'} ${importStatus === 'importing' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Pause className="h-4 w-4" />
            Inactive
          </Button>
        </div>
        
        {/* Status Indicator */}
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {isActive ? 'Import is Active' : 'Import is Inactive'}
          </span>
          {importStatus === 'importing' && (
            <p className="mt-1 text-xs text-gray-500">
              Status controls disabled during import process
            </p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload SQL File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-none p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-gray-600" />
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="font-medium">Drop SQL file here or click to browse</p>
                <p className="text-sm text-gray-500">Maximum file size: 500MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="target"
                checked={!createNewDatabase}
                onChange={() => setCreateNewDatabase(false)}
                className="text-blue-600"
              />
              <span>Import to existing site</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="target"
                checked={createNewDatabase}
                onChange={() => setCreateNewDatabase(true)}
                className="text-blue-600"
              />
              <span>Create new site</span>
            </label>
          </div>

          {!createNewDatabase && (
            <div className="space-y-2">
              <Label>Select Site</Label>
              <Select value={targetSite} onValueChange={setTargetSite} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose target site..." />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.code} value={site.code}>
                      {site.name} ({site.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {createNewDatabase && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site Code</Label>
                <Input
                  value={newSiteCode}
                  onChange={(e) => setNewSiteCode(e.target.value)}
                  placeholder="e.g., 0201"
                />
              </div>
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Health Center Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Input
                  value={newSiteProvince}
                  onChange={(e) => setNewSiteProvince(e.target.value)}
                  placeholder="Province"
                />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={newSiteDistrict}
                  onChange={(e) => setNewSiteDistrict(e.target.value)}
                  placeholder="District"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>File Name</Label>
                <Input
                  value={newSiteFileName}
                  onChange={(e) => setNewSiteFileName(e.target.value)}
                  placeholder="site_data_2024.sql"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {extractedSiteInfo && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>{extractedSiteInfo.message}</AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {importStatus !== 'idle' && (
        <Alert className={importStatus === 'error' ? 'border-red-200 bg-red-50' : importStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription className={importStatus === 'error' ? 'text-red-800' : importStatus === 'success' ? 'text-green-800' : 'text-blue-800'}>
              {importMessage}
            </AlertDescription>
          </div>
          {importStatus === 'importing' && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading & Processing</span>
                <span>{importProgress < 50 ? 'Uploading...' : importProgress < 90 ? 'Processing...' : 'Finalizing...'}</span>
              </div>
            </div>
          )}
        </Alert>
      )}

      {/* Import Button */}
      <Button
        onClick={handleImport}
        disabled={importStatus === 'importing' || !selectedFile || !isActive}
        className={`w-full ${importStatus === 'importing' ? 'bg-blue-600 hover:bg-blue-700' : importStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : importStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : !isActive ? 'bg-gray-400 hover:bg-gray-500' : ''}`}
      >
        {importStatus === 'importing' ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Importing... ({importProgress}%)
          </>
        ) : importStatus === 'success' ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Import Successful
          </>
        ) : importStatus === 'error' ? (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Import Failed - Try Again
          </>
        ) : !isActive ? (
          <>
            <Pause className="h-4 w-4 mr-2" />
            Import Inactive - Activate First
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Import Data
          </>
        )}
      </Button>
    </div>
  );
};

export default ImportData;
