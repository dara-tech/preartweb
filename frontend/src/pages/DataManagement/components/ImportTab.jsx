import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  FileText,
  CloudUpload,
  Zap,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
  X,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Globe,
  Building,
  MapPin,
  FileCode,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import importApi from "../../../services/importApi";

const ImportTab = ({ 
  sites, 
  loading, 
  setLoading, 
  showMessage
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImportSite, setSelectedImportSite] = useState('');
  const [createNewDatabase, setCreateNewDatabase] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle');
  const [importMessage, setImportMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [extractedSiteInfo, setExtractedSiteInfo] = useState(null);
  
  // New site form fields
  const [newSiteCode, setNewSiteCode] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteProvince, setNewSiteProvince] = useState('');
  const [newSiteDistrict, setNewSiteDistrict] = useState('');
  const [newSiteFileName, setNewSiteFileName] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // Advanced UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.sql') || file.name.endsWith('.h149')) {
        setSelectedFile(file);
      } else {
        showMessage('error', 'Please select a valid SQL file (.sql or .h149)');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/sql' || file.name.endsWith('.sql') || file.name.endsWith('.h149')) {
        setSelectedFile(file);
        setValidationErrors([]);
        setImportStatus('idle');
        setExtractedSiteInfo(null);
        setCurrentStep(2);
        
        // Advanced file analysis
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const fileSize = (file.size / 1024 / 1024).toFixed(2);
          
          // Analyze file content
          const analysis = {
            size: fileSize,
            lines: content.split('\n').length,
            tables: (content.match(/CREATE TABLE/gi) || []).length,
            inserts: (content.match(/INSERT INTO/gi) || []).length,
            hasTblSiteName: /CREATE TABLE.*tblsitename/i.test(content) || 
                           /INSERT INTO.*tblsitename/i.test(content),
            estimatedTime: Math.max(30, Math.round(file.size / 1024 / 1024 * 2)) // 2 seconds per MB
          };
          
          setFileAnalysis(analysis);
          setEstimatedTime(analysis.estimatedTime);
          
          if (analysis.hasTblSiteName) {
            setExtractedSiteInfo({
              detected: true,
              message: 'Site information will be automatically extracted from tblsitename table',
              success: true
            });
          }
        };
        reader.readAsText(file);
      } else {
        showMessage('error', 'Please select a valid SQL file (.sql or .h149)');
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedFile) {
      errors.push('Please select a SQL file to import');
    }
    
    if (!createNewDatabase && !selectedImportSite) {
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
      showMessage('error', validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setImportStatus('importing');
    setImportProgress(0);
    setImportMessage('Starting import process...');
    setValidationErrors([]);

    const formData = new FormData();
    formData.append('sqlFile', selectedFile);
    
    if (createNewDatabase) {
      formData.append('createNewDatabase', 'true');
      formData.append('siteCode', newSiteCode);
      formData.append('siteName', newSiteName);
      formData.append('province', newSiteProvince);
      formData.append('district', newSiteDistrict);
      formData.append('fileName', newSiteFileName);
      console.log('Creating new database with:', { newSiteCode, newSiteName, newSiteProvince, newSiteDistrict, newSiteFileName });
    } else {
      formData.append('createNewDatabase', 'false');
      formData.append('targetSite', selectedImportSite);
      console.log('Importing to existing site:', selectedImportSite);
      console.log('Available sites:', sites);
    }
    
    // Debug: Log all form data
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const result = await importApi.importSqlFile(formData, (progress) => {
        setImportProgress(progress);
        // Update message based on progress
        if (progress < 30) {
          setImportMessage('Uploading file...');
        } else if (progress < 60) {
          setImportMessage('Processing SQL file...');
        } else if (progress < 90) {
          setImportMessage('Importing data to database...');
        } else if (progress < 100) {
          setImportMessage('Finalizing import...');
        }
      });
      
      console.log('Import result:', result);
      
      if (result.success) {
        setImportStatus('success');
        setImportMessage(`Import completed! ${result.statistics?.successful || result.message || 'Success'}`);
        showMessage('success', `Import completed! ${result.statistics?.successful || result.message || 'Success'}`);
        
        // Show extracted site info if available
        if (result.extractedSiteInfo) {
          setExtractedSiteInfo({
            detected: true,
            message: 'Site information was successfully extracted from tblsitename table',
            success: true
          });
        }
        
        // Reset form
        setSelectedFile(null);
        setSelectedImportSite('');
        setNewSiteCode('');
        setNewSiteName('');
        setNewSiteProvince('');
        setNewSiteDistrict('');
        setNewSiteFileName('');
        setCreateNewDatabase(false);
        setValidationErrors([]);
        setExtractedSiteInfo(null);
        setCurrentStep(1);
        if (document.getElementById('fileInput')) {
          document.getElementById('fileInput').value = '';
        }
      } else {
        setImportStatus('error');
        setImportMessage(result.message || 'Import failed');
        showMessage('error', result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage(`Import failed: ${error.message}`);
      showMessage('error', `Import failed: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setImportStatus('idle');
        setImportProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 p-3 md:p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 ${
              currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded-md transition-all duration-300 ${
                currentStep > step ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <Card className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-md flex items-center justify-center mb-4">
              <CloudUpload className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Upload Your SQL File</CardTitle>
            <p className="text-muted-foreground">Drag and drop your SQL file or click to browse</p>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-md p-12 text-center transition-all duration-300 group ${
                dragActive
                  ? 'border-primary/5 scale-105'
                  : selectedFile
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="fileInput"
                type="file"
                accept=".sql,.h149"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileAnalysis(null);
                      setCurrentStep(1);
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove file
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-md flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">SQL files (.sql, .h149) up to 100MB</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secure upload
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Fast processing
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Validated
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: File Analysis & Configuration */}
      {currentStep === 2 && selectedFile && (
        <div className="space-y-2">
          {/* File Analysis Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                File Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-md">
                  <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{fileAnalysis?.lines || 0}</p>
                  <p className="text-xs text-muted-foreground">Lines of Code</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-md">
                  <Database className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{fileAnalysis?.tables || 0}</p>
                  <p className="text-xs text-muted-foreground">Tables</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-md">
                  <Layers className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{fileAnalysis?.inserts || 0}</p>
                  <p className="text-xs text-muted-foreground">Insert Statements</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-md">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{estimatedTime}s</p>
                  <p className="text-xs text-muted-foreground">Est. Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Configuration */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Target Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Import Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    !createNewDatabase 
                      ? 'ring-2 ring-primary/5 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCreateNewDatabase(false)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Import to Existing Site</h3>
                    <p className="text-sm text-muted-foreground">Add data to an existing database</p>
                    <Badge variant="outline" className="mt-2">
                      {sites?.length || 0} sites available
                    </Badge>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    createNewDatabase 
                      ? 'ring-2 ring-primary/5 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCreateNewDatabase(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Create New Site</h3>
                    <p className="text-sm text-muted-foreground">Set up a new database and site</p>
                    <Badge variant="outline" className="mt-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Site Selection */}
              {!createNewDatabase && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <Label className="text-base font-medium">Select Target Site</Label>
                  </div>
                  <Select value={selectedImportSite} onValueChange={setSelectedImportSite} disabled={loading}>
                    <SelectTrigger className="w-full h-12 bg-background/50">
                      <SelectValue placeholder="Choose target site..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {sites && sites.length > 0 ? (
                        sites.map((site) => (
                          <SelectItem key={site.code} value={site.code}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-md" />
                              <span className="font-medium">{site.code}</span>
                              <span className="text-muted-foreground">- {site.fileName || site.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-sites" disabled>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            No sites available
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* Site Selection Error */}
                  {validationErrors.some(error => error.includes('target site')) && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        Please select a target site to import your data
                      </span>
                    </div>
                  )}
                  
                  {/* Sites Loading State */}
                  {!sites && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-primary">Loading available sites...</span>
                    </div>
                  )}
                </div>
              )}

              {/* New Site Form */}
              {createNewDatabase && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <Label className="text-base font-medium">New Site Details</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Site Code</Label>
                      <Input
                        value={newSiteCode}
                        onChange={(e) => setNewSiteCode(e.target.value)}
                        placeholder="e.g., 0201"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Site Name</Label>
                      <Input
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        placeholder="Health Center Name"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Province</Label>
                      <Input
                        value={newSiteProvince}
                        onChange={(e) => setNewSiteProvince(e.target.value)}
                        placeholder="Province"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">District</Label>
                      <Input
                        value={newSiteDistrict}
                        onChange={(e) => setNewSiteDistrict(e.target.value)}
                        placeholder="District"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium">File Name</Label>
                      <Input
                        value={newSiteFileName}
                        onChange={(e) => setNewSiteFileName(e.target.value)}
                        placeholder="site_data_2024.sql"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={(!createNewDatabase && !selectedImportSite) || (createNewDatabase && (!newSiteCode || !newSiteName))}
                  className="flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Import Execution */}
      {currentStep === 3 && selectedFile && (
        <Card className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Ready to Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-md p-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Import Summary</h3>
                  <p className="text-sm text-muted-foreground">Review your import configuration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">File</p>
                  <p className="font-medium">{selectedFile?.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="font-medium">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Target</p>
                  <p className="font-medium">
                    {createNewDatabase ? `New Site: ${newSiteCode}` : selectedImportSite}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Est. Time</p>
                  <p className="font-medium">{estimatedTime} seconds</p>
                </div>
              </div>
            </div>

            {/* Extracted Site Info */}
            {extractedSiteInfo && (
              <div className="bg-primary/10 border border-primary/30 rounded-md p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {extractedSiteInfo.message}
                    </p>
                    <p className="text-xs text-primary">
                      Site information will be automatically processed
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-destructive/10 rounded-md flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Please fix the following errors:
                    </h4>
                  </div>
                </div>
                <ul className="text-sm text-destructive space-y-1 ml-11">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-destructive rounded-md" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Import Progress */}
            {importStatus !== 'idle' && (
              <div className="bg-muted/50 rounded-md p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center">
                      {importStatus === 'importing' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : importStatus === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {importStatus === 'importing' ? 'Importing...' : 
                         importStatus === 'success' ? 'Import Complete' : 'Import Failed'}
                      </p>
                      <p className="text-sm text-muted-foreground">{importMessage}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {Math.round(importProgress)}%
                  </Badge>
                </div>
                <Progress value={importProgress} className="h-2" />
                
                {/* Debug Information for Errors */}
                {importStatus === 'error' && (
                  <div className="mt-4 p-3 bg-muted/50 border border-border rounded-md">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Debug Information:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Selected Site: {selectedImportSite || 'None'}</p>
                      <p>Create New: {createNewDatabase ? 'Yes' : 'No'}</p>
                      <p>File: {selectedFile?.name || 'None'}</p>
                      <p>Available Sites: {sites?.length || 0}</p>
                      {sites && sites.length > 0 && (
                        <p>Site Codes: {sites.map(s => s.code).join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={!selectedFile || (!createNewDatabase && !selectedImportSite) || (createNewDatabase && (!newSiteCode || !newSiteName || !newSiteProvince || !newSiteDistrict || !newSiteFileName)) || loading}
                className="flex items-center gap-2 bg-cyan-700 hover:from-primary/90 hover:to-secondary/90 text-white transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Import
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportTab;