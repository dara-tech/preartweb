import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  TestTube,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
  XCircle,
  Minus,
  FileText,
  User,
  Beaker,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import patientTestApi from '../services/patientTestApi';
import siteApi from '../services/siteApi';

// Helper function to check if current user is a viewer
const isViewerUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decode JWT token (simple base64 decode of payload)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if user role is 'viewer'
    return decodedPayload.role === 'viewer';
  } catch (error) {
    // If there's any error decoding, allow toasts to show
    return false;
  }
};

// Lab Data Entry Comparison Component
const LabDataEntryComparison = ({ patientTests, filters, onMetricsUpdate }) => {
  const [labData, setLabData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonPage, setComparisonPage] = useState(1);
  const [comparisonPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('clinicId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Handle column sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter comparison data by status
  const getFilteredComparisonData = () => {
    if (statusFilter === 'all') return comparisonData;

    return comparisonData.filter(item => {
      switch (statusFilter) {
        case 'missing':
          return !item.patientData;
        case 'incomplete':
          return item.patientData && item.missingFields.length > 0 && item.labData;
        case 'mismatch':
          return item.resultComparison && 
                 item.patientData && 
                 item.labData &&
                 (!item.resultComparison.vlMatch || !item.resultComparison.vlLogMatch);
        case 'complete':
          return item.patientData && 
                 item.labData && 
                 item.missingFields.length === 0 &&
                 (item.resultComparison.vlMatch || !item.resultComparison.labVL);
        case 'missing_lab':
          return !item.labData && item.patientData;
        default:
          return true;
      }
    });
  };

  // Sort comparison data
  const getSortedComparisonData = () => {
    const filteredData = getFilteredComparisonData();
    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'clinicId':
          aValue = a.clinicId || '';
          bValue = b.clinicId || '';
          break;
        case 'labVL':
          aValue = parseFloat(a.labData?.result2) || 0;
          bValue = parseFloat(b.labData?.result2) || 0;
          break;
        case 'patientVL':
          aValue = parseFloat(a.patientData?.HIVLoad) || 0;
          bValue = parseFloat(b.patientData?.HIVLoad) || 0;
          break;
        case 'status':
          // Order: Complete < Incomplete < Missing
          const statusOrder = { 'Complete': 0, 'Incomplete Data': 1, 'Results Don\'t Match': 2, 'Missing Lab Data': 3, 'Missing in Database': 4 };
          const getStatus = (item) => {
            if (!item.patientData) return 'Missing in Database';
            if (!item.labData) return 'Missing Lab Data';
            if (item.resultComparison && (!item.resultComparison.vlMatch || !item.resultComparison.vlLogMatch)) return 'Results Don\'t Match';
            if (item.missingFields.length > 0) return 'Incomplete Data';
            return 'Complete';
          };
          aValue = statusOrder[getStatus(a)] || 99;
          bValue = statusOrder[getStatus(b)] || 99;
          break;
        case 'issues':
          aValue = a.missingFields.length;
          bValue = b.missingFields.length;
          break;
        default:
          aValue = a.clinicId || '';
          bValue = b.clinicId || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  // Fetch lab data when component mounts or filters change
  useEffect(() => {
    const fetchLabData = async () => {
      if (!filters.site || filters.site === 'all') return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Import labTestApi dynamically to avoid circular dependency
        const { labTestApi } = await import('../services/labTestApi');
        
        // Fetch lab data for the selected site and date range
        const labResults = await labTestApi.getTestResults({
          startDate: filters.startDate,
          endDate: filters.endDate,
          type: 'VL', // Viral Load tests
          siteCode: filters.site
        });
        
        setLabData(labResults.data || []);
        
        // For analytics, we need ALL patient data, not just the paginated results
        // Fetch all patient data for the selected site and date range (handle pagination)
        let allPatientData = [];
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const allPatientParams = {
            page: currentPage,
            limit: 100, // Backend max limit is 100
            startDate: filters.startDate,
            endDate: filters.endDate,
            testType: filters.testType,
            site: filters.site
          };
          
          // Remove empty filters and "all" values
          Object.keys(allPatientParams).forEach(key => {
            if (allPatientParams[key] === '' || allPatientParams[key] === null || allPatientParams[key] === undefined || allPatientParams[key] === 'all') {
              delete allPatientParams[key];
            }
          });
          
          console.log(`🔍 Fetching patient data page ${currentPage}:`, allPatientParams);
          
          const allPatientResponse = await patientTestApi.getPatientTests(allPatientParams);
          
          if (!allPatientResponse.success) {
            console.error('❌ Patient API error:', allPatientResponse);
            throw new Error(allPatientResponse.message || 'Failed to fetch patient data for analytics');
          }
          
          const pageData = allPatientResponse.data || [];
          allPatientData = [...allPatientData, ...pageData];
          
          // Check if there are more pages
          const totalPages = allPatientResponse.pagination?.totalPages || 1;
          hasMorePages = currentPage < totalPages;
          currentPage++;
          
          // Safety limit to prevent infinite loops
          if (currentPage > 10) {
            console.warn('⚠️ Reached safety limit of 10 pages for patient data');
            break;
          }
        }
        
        console.log(`🔍 Fetched ${allPatientData.length} total patient records across ${currentPage - 1} pages`);
        
        // Filter patient data by selected site for comparison
        const filteredPatientData = filters.site && filters.site !== 'all' 
          ? allPatientData.filter(patient => patient.siteCode === filters.site)
          : allPatientData;
        
        console.log('🔍 Site filtering debug:', {
          selectedSite: filters.site,
          paginatedPatientData: patientTests.length, // Only first 20 records
          allPatientData: allPatientData.length, // All records fetched for analytics
          filteredPatientData: filteredPatientData.length,
          labDataCount: labResults.data?.length || 0,
          samplePatientIds: filteredPatientData.slice(0, 5).map(p => p.ClinicID),
          sampleLabIds: labResults.data?.slice(0, 5).map(l => l.clinic_id) || [],
          // Check if 638 and 942 exist in filtered data
          has638InFiltered: filteredPatientData.some(p => p.ClinicID === '638'),
          has942InFiltered: filteredPatientData.some(p => p.ClinicID === '942'),
          allClinicIds: filteredPatientData.map(p => p.ClinicID).sort()
        });
        
        // Compare lab data with filtered patient data
        compareDataEntry(filteredPatientData, labResults.data || []);
        
      } catch (err) {
        console.error('Error fetching lab data:', err);
        setError('Failed to fetch lab data for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchLabData();
  }, [filters, patientTests]);

  // Compare lab data flow with database entries
  const compareDataEntry = (patientData, labData) => {
    const comparison = [];
    
    console.log('🔍 Comparing data entry:', {
      patientCount: patientData.length,
      labCount: labData.length,
      samplePatientIds: patientData.slice(0, 5).map(p => p.ClinicID),
      sampleLabIds: labData.slice(0, 5).map(l => l.clinic_id || l.ClinicID)
    });
    
    // Create a map of patient data by Clinic ID for quick lookup
    const patientMap = new Map();
    patientData.forEach(patient => {
      if (patient.ClinicID) {
        const originalId = patient.ClinicID;
        
        // Store original ID
        patientMap.set(originalId, patient);
        
        // Create all possible variations for matching
        if (/^\d+$/.test(originalId)) {
          // Add with different padding lengths (4, 5, 6 digits)
          patientMap.set(originalId.padStart(4, '0'), patient);
          patientMap.set(originalId.padStart(5, '0'), patient);
          patientMap.set(originalId.padStart(6, '0'), patient);
          
          // Add without leading zeros
          const withoutZeros = originalId.replace(/^0+/, '');
          if (withoutZeros !== originalId && withoutZeros !== '') {
            patientMap.set(withoutZeros, patient);
          }
        }
      }
    });
    
    console.log('📋 Patient map created with keys:', Array.from(patientMap.keys()).slice(0, 15));
    console.log('🔍 Sample lab IDs:', labData.slice(0, 5).map(l => l.clinic_id || l.ClinicID));
    
    // Debug specific patient IDs
    console.log('🔍 Patient map debug for 638 and 942:', {
      has638: patientMap.has('638'),
      has0638: patientMap.has('0638'),
      has00638: patientMap.has('00638'),
      has000638: patientMap.has('000638'),
      has942: patientMap.has('942'),
      has0942: patientMap.has('0942'),
      has00942: patientMap.has('00942'),
      has000942: patientMap.has('000942'),
      allKeysWith638: Array.from(patientMap.keys()).filter(k => k.includes('638')),
      allKeysWith942: Array.from(patientMap.keys()).filter(k => k.includes('942')),
      // Check data types
      samplePatientClinicIDs: patientData.slice(0, 3).map(p => ({ id: p.ClinicID, type: typeof p.ClinicID })),
      sampleLabClinicIDs: labData.slice(0, 3).map(l => ({ id: l.clinic_id || l.ClinicID, type: typeof (l.clinic_id || l.ClinicID) }))
    });
    
    // Compare each lab result with patient data
    let matchesFound = 0;
    labData.forEach((labResult, index) => {
      const labClinicId = labResult.clinic_id || labResult.ClinicID;
      
      // Debug specific clinic IDs 942 and 638
      if (labClinicId === '000942' || labClinicId === '942' || labClinicId === '000638' || labClinicId === '638') {
        console.log(`🔍 Debugging clinic ID ${labClinicId}:`, {
          labClinicId,
          patientMapHasDirect: patientMap.has(labClinicId),
          patientMapHasWithoutZeros: patientMap.has(labClinicId.replace(/^0+/, '')),
          patientMapHasWithZeros: patientMap.has(labClinicId.padStart(6, '0')),
          patientMapKeys: Array.from(patientMap.keys()).filter(k => k.includes(labClinicId.replace(/^0+/, '')))
        });
      }
      
      // Try to find matching patient data using multiple strategies
      let patientData = patientMap.get(labClinicId);
      
      if (!patientData && labClinicId) {
        // Try different variations without modifying the original lab ID
        const variations = [
          labClinicId, // Original lab ID
          labClinicId.replace(/^0+/, ''), // Without leading zeros
          labClinicId.padStart(4, '0'), // Padded to 4 digits
          labClinicId.padStart(5, '0'), // Padded to 5 digits
          labClinicId.padStart(6, '0')  // Padded to 6 digits
        ];
        
        // Try each variation
        for (const variation of variations) {
          if (patientMap.has(variation)) {
            patientData = patientMap.get(variation);
            if (labClinicId === '000638' || labClinicId === '000942') {
              console.log(`✅ Found match for ${labClinicId} using variation: ${variation}`);
            }
            break;
          }
        }
        
        // Debug if still no match for our specific IDs
        if (!patientData && (labClinicId === '000638' || labClinicId === '000942')) {
          console.log(`❌ No match found for ${labClinicId}. Tried variations:`, variations);
        }
      }
      
      if (patientData) {
        matchesFound++;
        if (index < 3) { // Log first few matches for debugging
          console.log(`✅ Match found for lab ID ${labClinicId}:`, {
            labId: labClinicId,
            patientId: patientData.ClinicID,
            labVL: labResult.result2,       // result2 = VL (actual viral load)
            labLog: labResult.result1,      // result1 = Log
            patientVL: patientData.HIVLoad,
            patientLog: patientData.HIVLog
          });
        }
      } else if (index < 3) { // Log first few non-matches for debugging
        console.log(`❌ No match for lab ID ${labClinicId}`);
      }
      
      const comparisonItem = {
        clinicId: labClinicId,
        labData: labResult,
        patientData: patientData,
        dataEntryStatus: {
          bloodCollection: !!labResult.collect_blood_dt,
          bloodReceived: !!labResult.receive_blood_dt,
          validated: !!labResult.validated_dt,
          testCompleted: !!labResult.test_blood_dt,
          resultIssued: !!labResult.issued_dt,
          databaseEntry: !!patientData
        },
        missingFields: [],
        dataFlow: {
          collectToReceive: labResult.collect_blood_dt && labResult.receive_blood_dt ? 
            Math.ceil((new Date(labResult.receive_blood_dt) - new Date(labResult.collect_blood_dt)) / (1000 * 60 * 60 * 24)) : null,
          receiveToTest: labResult.receive_blood_dt && labResult.test_blood_dt ? 
            Math.ceil((new Date(labResult.test_blood_dt) - new Date(labResult.receive_blood_dt)) / (1000 * 60 * 60 * 24)) : null,
          testToIssue: labResult.test_blood_dt && labResult.issued_dt ? 
            Math.ceil((new Date(labResult.issued_dt) - new Date(labResult.test_blood_dt)) / (1000 * 60 * 60 * 24)) : null
        },
             resultComparison: {
               labVL: labResult.result2,        // VL (Viral Load) from lab - result2 is the actual VL
               labVLLog: labResult.result1,     // VL log from lab - result1 is the log
               patientHIVLoad: patientData?.HIVLoad,
               patientHIVLog: patientData?.HIVLog,
               vlMatch: false,
               vlLogMatch: false
             }
      };
      
      // Check for missing data entry fields
      if (!patientData) {
        comparisonItem.missingFields.push('Complete Patient Record');
      } else {
        if (!patientData.HIVLoad || patientData.HIVLoad === '0') comparisonItem.missingFields.push('Viral Load Result');
        if (!patientData.Dat) comparisonItem.missingFields.push('Test Date');
        if (!patientData.DaCollect) comparisonItem.missingFields.push('Collection Date');
        
           // Compare VL (Viral Load) if both exist
           // result2 contains the actual VL value
           if (patientData.HIVLoad && labResult.result2 && labResult.result2 !== 'Not Detected') {
             const labVL = parseFloat(labResult.result2);
             const patientVL = parseFloat(patientData.HIVLoad);
             if (!isNaN(labVL) && !isNaN(patientVL)) {
               // Allow for small differences due to rounding
               comparisonItem.resultComparison.vlMatch = Math.abs(labVL - patientVL) <= 1;
             }
           }
           
           // Compare VL Log if both exist
           // result1 contains the log value
           if (patientData.HIVLog && labResult.result1 && labResult.result1 !== 'Not Detected') {
             const labVLLog = parseFloat(labResult.result1);
             const patientVLLog = parseFloat(patientData.HIVLog);
             if (!isNaN(labVLLog) && !isNaN(patientVLLog)) {
               // Allow for small differences due to rounding
               comparisonItem.resultComparison.vlLogMatch = Math.abs(labVLLog - patientVLLog) <= 0.1;
             }
           }
      }
      
      // Check lab workflow completeness
      if (!labResult.collect_blood_dt) comparisonItem.missingFields.push('Blood Collection Date');
      if (!labResult.receive_blood_dt) comparisonItem.missingFields.push('Blood Received Date');
      if (!labResult.validated_dt) comparisonItem.missingFields.push('Validation Date');
      if (!labResult.test_blood_dt) comparisonItem.missingFields.push('Test Date');
      if (!labResult.issued_dt) comparisonItem.missingFields.push('Result Issued Date');
      
      comparison.push(comparisonItem);
    });
    
    // Add patient data that doesn't have lab data
    patientData.forEach(patient => {
      if (patient.ClinicID && patient.HIVLoad && patient.HIVLoad !== '0') {
        const hasLabData = labData.some(lab => {
          const labId = lab.clinic_id || lab.ClinicID;
          if (!labId) return false;
          
          const patientId = patient.ClinicID;
          
          // Create variations for comparison without modifying originals
          const labVariations = [
            labId, // Original lab ID
            labId.replace(/^0+/, ''), // Without leading zeros
            labId.padStart(6, '0'), // Padded to 6 digits
            labId.padStart(4, '0')  // Padded to 4 digits
          ];
          
          const patientVariations = [
            patientId, // Original patient ID
            patientId.replace(/^0+/, ''), // Without leading zeros
            patientId.padStart(6, '0'), // Padded to 6 digits
            patientId.padStart(4, '0')  // Padded to 4 digits
          ];
          
          // Check if any lab variation matches any patient variation
          return labVariations.some(labVar => 
            patientVariations.some(patientVar => labVar === patientVar)
          );
        });
        
        if (!hasLabData) {
          comparison.push({
            clinicId: patient.ClinicID,
            labData: null,
            patientData: patient,
            dataEntryStatus: {
              bloodCollection: false,
              bloodReceived: false,
              validated: false,
              testCompleted: false,
              resultIssued: false,
              databaseEntry: true
            },
            missingFields: ['Complete Lab Workflow'],
            dataFlow: {
              collectToReceive: null,
              receiveToTest: null,
              testToIssue: null
            },
            resultComparison: {
              labVL: null,
              labVLLog: null,
              patientHIVLoad: patient.HIVLoad,
              patientHIVLog: patient.HIVLog,
              vlMatch: false,
              vlLogMatch: false
            }
          });
        }
      }
    });
    
    console.log('📊 Comparison summary:', {
      totalLabRecords: labData.length,
      matchesFound: matchesFound,
      matchRate: `${((matchesFound / labData.length) * 100).toFixed(1)}%`,
      totalComparisons: comparison.length
    });
    
    setComparisonData(comparison);
    setComparisonPage(1); // Reset to first page when data changes
    
    // Calculate metrics and send to parent component
    const totalLabRecords = comparison.filter(item => item.labData).length;
    const completeEntries = comparison.filter(item => 
      item.dataEntryStatus.databaseEntry && 
      item.dataEntryStatus.resultIssued &&
      item.missingFields.length === 0
    );
    const incompleteEntries = comparison.filter(item => 
      item.missingFields.length > 0
    );
    const missingDatabaseEntry = comparison.filter(item => 
      !item.dataEntryStatus.databaseEntry && item.labData
    );
    
    const metrics = {
      entryCompleteness: totalLabRecords > 0 ? ((completeEntries.length / totalLabRecords) * 100).toFixed(1) : '0',
      missingDatabase: totalLabRecords > 0 ? ((missingDatabaseEntry.length / totalLabRecords) * 100).toFixed(1) : '0',
      incompleteEntries: totalLabRecords > 0 ? ((incompleteEntries.length / totalLabRecords) * 100).toFixed(1) : '0',
      actionRequired: incompleteEntries.length + missingDatabaseEntry.length
    };
    
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        Loading lab data for comparison...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Export to CSV
  const exportToCSV = () => {
    const sortedData = getSortedComparisonData();
    
    // CSV Headers
    const headers = [
      'Clinic ID',
      'Lab VL',
      'Lab Log',
      'Lab Test Date',
      'Lab Issued Date',
      'Patient VL',
      'Patient Log',
      'Patient Test Date',
      'Status',
      'Missing Fields',
      'VL Match',
      'Log Match',
      'Blood Collection',
      'Blood Received',
      'Validated',
      'Test Completed',
      'Result Issued',
      'Database Entry'
    ];

    // CSV Rows
    const rows = sortedData.map(item => {
      const getStatus = () => {
        if (!item.patientData) return 'Missing in Database';
        if (!item.labData) return 'Missing Lab Data';
        if (item.resultComparison && (!item.resultComparison.vlMatch || !item.resultComparison.vlLogMatch)) return 'Results Don\'t Match';
        if (item.missingFields.length > 0) return 'Incomplete Data';
        return 'Complete';
      };

      return [
        item.clinicId || '',
        item.labData?.result2 || '',
        item.labData?.result1 || '',
        item.labData?.test_blood_dt || '',
        item.labData?.issued_dt || '',
        item.patientData?.HIVLoad || '',
        item.patientData?.HIVLog || '',
        item.patientData?.Dat || '',
        getStatus(),
        item.missingFields.join('; '),
        item.resultComparison?.vlMatch ? 'Yes' : 'No',
        item.resultComparison?.vlLogMatch ? 'Yes' : 'No',
        item.dataEntryStatus?.bloodCollection ? 'Yes' : 'No',
        item.dataEntryStatus?.bloodReceived ? 'Yes' : 'No',
        item.dataEntryStatus?.validated ? 'Yes' : 'No',
        item.dataEntryStatus?.testCompleted ? 'Yes' : 'No',
        item.dataEntryStatus?.resultIssued ? 'Yes' : 'No',
        item.dataEntryStatus?.databaseEntry ? 'Yes' : 'No'
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells containing commas, quotes, or newlines
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const filterName = statusFilter === 'all' ? 'all' : statusFilter;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `lab-comparison-${filterName}-${timestamp}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sortable Table Head Component
  const SortableTableHead = ({ field, children }) => {
    const isSorted = sortField === field;
    const Icon = isSorted 
      ? (sortDirection === 'asc' ? ArrowUp : ArrowDown)
      : ArrowUpDown;

    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-2">
          <span>{children}</span>
          <Icon className={`h-4 w-4 ${isSorted ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </TableHead>
    );
  };

  // Calculate meaningful metrics
  const totalLabRecords = comparisonData.filter(item => item.labData).length;
  const totalPatientRecords = comparisonData.filter(item => item.patientData).length;
  const completeEntries = comparisonData.filter(item => 
    item.dataEntryStatus.databaseEntry && 
    item.dataEntryStatus.resultIssued &&
    item.missingFields.length === 0
  );
  const incompleteEntries = comparisonData.filter(item => 
    item.missingFields.length > 0
  );
  const missingLabWorkflow = comparisonData.filter(item => 
    !item.labData && item.patientData
  );
  const missingDatabaseEntry = comparisonData.filter(item => 
    !item.dataEntryStatus.databaseEntry && item.labData
  );
  const resultMismatches = comparisonData.filter(item => 
    item.resultComparison && 
    item.resultComparison.labResult2 && 
    item.resultComparison.patientHIVLoad &&
    !item.resultComparison.resultsMatch
  );

  return (
    <div className="space-y-6">
      {/* Clean Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lab Records</p>
                <p className="text-2xl font-bold">{totalLabRecords}</p>
              </div>
              <TestTube className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete</p>
                <p className="text-2xl font-bold text-primary">{completeEntries.length}</p>
                <p className="text-xs text-muted-foreground">
                  {totalLabRecords > 0 ? ((completeEntries.length / totalLabRecords) * 100).toFixed(1) : 0}% complete
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missing</p>
                <p className="text-2xl font-bold text-destructive">{missingDatabaseEntry.length}</p>
                <p className="text-xs text-muted-foreground">Not in database</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mismatches</p>
                <p className="text-2xl font-bold text-warning-foreground">{resultMismatches.length}</p>
                <p className="text-xs text-muted-foreground">Result differences</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clean Data Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Comparison</CardTitle>
              <CardDescription className="mt-1">
                Click column headers to sort • Use filters to focus on specific issues
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={comparisonData.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              All
              <Badge variant="secondary" className="ml-1">
                {comparisonData.length}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'missing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('missing');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Missing in DB
              <Badge variant="destructive" className="ml-1">
                {comparisonData.filter(item => !item.patientData).length}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'incomplete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('incomplete');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Incomplete
              <Badge variant="secondary" className="ml-1 bg-warning/10 text-warning-foreground">
                {comparisonData.filter(item => item.patientData && item.missingFields.length > 0 && item.labData).length}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'mismatch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('mismatch');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Mismatches
              <Badge variant="secondary" className="ml-1 bg-warning/10 text-warning-foreground">
                {comparisonData.filter(item => 
                  item.resultComparison && 
                  item.patientData && 
                  item.labData &&
                  (!item.resultComparison.vlMatch || !item.resultComparison.vlLogMatch)
                ).length}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'complete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('complete');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Complete
              <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">
                {comparisonData.filter(item => 
                  item.patientData && 
                  item.labData && 
                  item.missingFields.length === 0
                ).length}
              </Badge>
            </Button>
            <Button
              variant={statusFilter === 'missing_lab' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('missing_lab');
                setComparisonPage(1);
              }}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Missing Lab Data
              <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground">
                {comparisonData.filter(item => !item.labData && item.patientData).length}
              </Badge>
            </Button>
          </div>

          <div className="rounded-none border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead field="clinicId">Clinic ID</SortableTableHead>
                  <SortableTableHead field="labVL">Lab Result</SortableTableHead>
                  <SortableTableHead field="patientVL">Database Result</SortableTableHead>
                  <SortableTableHead field="status">Status</SortableTableHead>
                  <SortableTableHead field="issues">Issue</SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedComparisonData().slice((comparisonPage - 1) * comparisonPageSize, comparisonPage * comparisonPageSize).map((item, index) => {
                  // Determine the main issue
                  let mainIssue = '';
                  let statusColor = 'green';
                  
                  if (!item.patientData) {
                    mainIssue = 'Missing in Database';
                    statusColor = 'red';
                  } else if (!item.labData) {
                    mainIssue = 'Missing Lab Data';
                    statusColor = 'orange';
                  } else if (item.resultComparison && (!item.resultComparison.vlMatch || !item.resultComparison.vlLogMatch)) {
                    mainIssue = 'Results Don\'t Match';
                    statusColor = 'orange';
                  } else if (item.missingFields.length > 0) {
                    mainIssue = 'Incomplete Data';
                    statusColor = 'yellow';
                  } else {
                    mainIssue = 'Complete';
                    statusColor = 'green';
                  }
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.clinicId}</TableCell>
                      <TableCell>
                        {item.labData ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              VL: {item.labData.result2 || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Log: {item.labData.result1 || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.labData.issued_dt ? new Date(item.labData.issued_dt).toLocaleDateString() : 'No date'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No lab data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.patientData ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              VL: {item.patientData.HIVLoad || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Log: {item.patientData.HIVLog || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.patientData.Dat ? new Date(item.patientData.Dat).toLocaleDateString() : 'No date'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No database entry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={statusColor === 'green' ? 'default' : 'secondary'}
                          className={`${
                            statusColor === 'green' ? 'bg-primary/10 text-primary' :
                            statusColor === 'red' ? 'bg-destructive/10 text-destructive' :
                            statusColor === 'orange' ? 'bg-warning/10 text-warning-foreground' :
                            'bg-muted text-muted-foreground'
                          } w-fit`}
                        >
                          {statusColor === 'green' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                          {mainIssue}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.missingFields.length > 0 ? (
                          <div className="text-sm">
                            {item.missingFields.slice(0, 2).map((field, i) => (
                              <div key={i} className="text-warning-foreground">
                                • {field}
                              </div>
                            ))}
                            {item.missingFields.length > 2 && (
                              <div className="text-warning-foreground">
                                + {item.missingFields.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-primary text-sm">All good</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {getSortedComparisonData().length > comparisonPageSize && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((comparisonPage - 1) * comparisonPageSize) + 1} to {Math.min(comparisonPage * comparisonPageSize, getSortedComparisonData().length)} of {getSortedComparisonData().length} comparisons
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setComparisonPage(prev => Math.max(1, prev - 1))}
                  disabled={comparisonPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(getSortedComparisonData().length / comparisonPageSize) }, (_, i) => {
                    const page = i + 1;
                    const totalPages = Math.ceil(getSortedComparisonData().length / comparisonPageSize);
                    
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= comparisonPage - 1 && page <= comparisonPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === comparisonPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setComparisonPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === comparisonPage - 2 ||
                      page === comparisonPage + 2
                    ) {
                      return (
                        <span key={page} className="text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setComparisonPage(prev => Math.min(Math.ceil(getSortedComparisonData().length / comparisonPageSize), prev + 1))}
                  disabled={comparisonPage >= Math.ceil(getSortedComparisonData().length / comparisonPageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PatientTests = () => {
  const [patientTests, setPatientTests] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Dat');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSortField, setTableSortField] = useState('Dat');
  const [tableSortDirection, setTableSortDirection] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [dataEntryMetrics, setDataEntryMetrics] = useState({
    entryCompleteness: '0',
    missingDatabase: '0',
    incompleteEntries: '0',
    actionRequired: 0
  });
  
  // Enhanced UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickViewDrawer, setQuickViewDrawer] = useState({
    isOpen: false,
    data: null
  });
  const [visibleColumns, setVisibleColumns] = useState({
    test_id: true,
    clinic_id: true,
    test_date: true,
    test_type: true,
    cd4: true,
    viral_load: true,
    hcv: true,
    site: true,
    actions: true
  });
  
  // Helper function to get current fiscal quarter dates
  const getCurrentFiscalQuarter = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Calendar year definition: Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
    let quarterStartMonth, quarterEndMonth, quarterYear;
    
    if (currentMonth >= 0 && currentMonth <= 2) { // Jan-Mar (Q1)
      quarterStartMonth = 0; // January
      quarterEndMonth = 2;   // March
      quarterYear = currentYear;
    } else if (currentMonth >= 3 && currentMonth <= 5) { // Apr-Jun (Q2)
      quarterStartMonth = 3; // April
      quarterEndMonth = 5;   // June
      quarterYear = currentYear;
    } else if (currentMonth >= 6 && currentMonth <= 8) { // Jul-Sep (Q3)
      quarterStartMonth = 6; // July
      quarterEndMonth = 8;   // September
      quarterYear = currentYear;
    } else { // Oct-Dec (Q4)
      quarterStartMonth = 9; // October
      quarterEndMonth = 11;  // December
      quarterYear = currentYear;
    }
    
    // Create dates using ISO string format to avoid timezone issues
    const startDate = `${quarterYear}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
    // Calculate last day of end month
    const lastDay = new Date(quarterYear, quarterEndMonth + 1, 0).getDate();
    const endDate = `${quarterYear}-${String(quarterEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return {
      startDate,
      endDate
    };
  };

  // Get quarter dates based on quarter selection
  const getQuarterDates = (quarterValue) => {
    const currentYear = new Date().getFullYear();
    
    // Handle custom date selection
    if (quarterValue === 'custom') {
      return null; // User will manually set dates
    }
    
    // Handle current quarter
    if (quarterValue === 'current') {
      return getCurrentFiscalQuarter();
    }
    
    // Parse quarter value like "Q1-2025"
    const [quarter, year] = quarterValue.split('-');
    const yearNum = parseInt(year);
    
    let startMonth, endMonth, startYear, endYear;
    
    switch (quarter) {
      case 'Q1': // Jan-Mar
        startMonth = 0; // January (0-indexed)
        endMonth = 2;   // March
        startYear = yearNum;
        endYear = yearNum;
        break;
      case 'Q2': // Apr-Jun
        startMonth = 3; // April
        endMonth = 5;   // June
        startYear = yearNum;
        endYear = yearNum;
        break;
      case 'Q3': // Jul-Sep
        startMonth = 6; // July
        endMonth = 8;   // September
        startYear = yearNum;
        endYear = yearNum;
        break;
      case 'Q4': // Oct-Dec
        startMonth = 9;  // October
        endMonth = 11;   // December
        startYear = yearNum;
        endYear = yearNum;
        break;
      default:
        return getCurrentFiscalQuarter();
    }
    
    const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-01`;
    
    // Calculate last day of end month
    const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return {
      startDate,
      endDate
    };
  };

  // Get fiscal year list (past 5 years + current + next)
  const getFiscalYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  // Get current calendar year
  const getCurrentFiscalYear = () => {
    return new Date().getFullYear();
  };

  // Parse quarter string to get quarter number and year
  const parseQuarterValue = (quarterValue) => {
    if (quarterValue === 'current' || quarterValue === 'custom') {
      return null;
    }
    const [quarter, year] = quarterValue.split('-');
    return { quarter: parseInt(quarter.replace('Q', '')), year: parseInt(year) };
  };

  // Generate quarter display label
  const getQuarterLabel = (quarter, year) => {
    const labels = {
      1: `Q1 ${year} (Jan-Mar ${year})`,
      2: `Q2 ${year} (Apr-Jun ${year})`,
      3: `Q3 ${year} (Jul-Sep ${year})`,
      4: `Q4 ${year} (Oct-Dec ${year})`
    };
    return labels[quarter] || '';
  };

  // Navigate to specific quarter
  const navigateToQuarter = (quarter, year) => {
    setSelectedQuarterNum(quarter);
    setSelectedFiscalYear(year);
    
    const quarterValue = `Q${quarter}-${year}`;
    const quarterDates = getQuarterDates(quarterValue);
    
    if (quarterDates) {
      setFilters(prev => ({
        ...prev,
        selectedQuarter: quarterValue,
        startDate: quarterDates.startDate,
        endDate: quarterDates.endDate
      }));
    }
  };

  // Navigate to previous quarter
  const goToPreviousQuarter = () => {
    let newQuarter = selectedQuarterNum - 1;
    let newYear = selectedFiscalYear;
    
    if (newQuarter < 1) {
      newQuarter = 4;
      newYear -= 1;
    }
    
    navigateToQuarter(newQuarter, newYear);
  };

  // Navigate to next quarter
  const goToNextQuarter = () => {
    let newQuarter = selectedQuarterNum + 1;
    let newYear = selectedFiscalYear;
    
    if (newQuarter > 4) {
      newQuarter = 1;
      newYear += 1;
    }
    
    navigateToQuarter(newQuarter, newYear);
  };

  // Navigate to current quarter
  const goToCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    let quarter;
    
    if (month >= 0 && month <= 2) { // Jan-Mar
      quarter = 1;
    } else if (month >= 3 && month <= 5) { // Apr-Jun
      quarter = 2;
    } else if (month >= 6 && month <= 8) { // Jul-Sep
      quarter = 3;
    } else { // Oct-Dec
      quarter = 4;
    }
    
    navigateToQuarter(quarter, year);
  };

  // Navigate to specific fiscal year (defaults to Q1)
  const goToFiscalYear = (year) => {
    setSelectedFiscalYear(year);
    navigateToQuarter(1, year);
  };

  // Check if we're on current quarter
  const isCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    let currentQuarter;
    
    if (month >= 0 && month <= 2) { // Jan-Mar
      currentQuarter = 1;
    } else if (month >= 3 && month <= 5) { // Apr-Jun
      currentQuarter = 2;
    } else if (month >= 6 && month <= 8) { // Jul-Sep
      currentQuarter = 3;
    } else { // Oct-Dec
      currentQuarter = 4;
    }
    
    return selectedQuarterNum === currentQuarter && selectedFiscalYear === year;
  };

  // Handle quarter selection change
  const handleQuarterChange = (quarterValue) => {
    const quarterDates = getQuarterDates(quarterValue);
    
    if (quarterValue === 'current') {
      goToCurrentQuarter();
      return;
    }
    
    if (quarterDates) {
      const parsed = parseQuarterValue(quarterValue);
      if (parsed) {
        setSelectedQuarterNum(parsed.quarter);
        setSelectedFiscalYear(parsed.year);
      }
      
      setFilters(prev => ({
        ...prev,
        selectedQuarter: quarterValue,
        startDate: quarterDates.startDate,
        endDate: quarterDates.endDate
      }));
    } else {
      // Custom date range - just update selected quarter
      setFilters(prev => ({
        ...prev,
        selectedQuarter: quarterValue
      }));
    }
  };

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(getCurrentFiscalYear());
  const [selectedQuarterNum, setSelectedQuarterNum] = useState(() => {
    const now = new Date();
    const month = now.getMonth();
    if (month >= 0 && month <= 2) return 1; // Jan-Mar
    if (month >= 3 && month <= 5) return 2; // Apr-Jun
    if (month >= 6 && month <= 8) return 3; // Jul-Sep
    return 4; // Oct-Dec
  });
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [currentDecade, setCurrentDecade] = useState(Math.floor(getCurrentFiscalYear() / 10) * 10);
  const pickerRef = useRef(null);

  const [filters, setFilters] = useState(() => {
    const fiscalQuarter = getCurrentFiscalQuarter();
    return {
      site: 'all',
      startDate: fiscalQuarter.startDate,
      endDate: fiscalQuarter.endDate,
      testType: 'viral_load',
      clinicId: '',
      selectedQuarter: 'current' // Track selected quarter
    };
  });

  // Generate years for current decade
  const generateDecadeYears = (decade) => {
    const years = [];
    for (let year = decade - 1; year <= decade + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const decadeYears = generateDecadeYears(currentDecade);
  const isYearInCurrentDecade = (year) => year >= currentDecade && year <= currentDecade + 9;

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPeriodPickerOpen(false);
        setShowYearGrid(false);
      }
    };

    if (isPeriodPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPeriodPickerOpen]);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const sitesData = await siteApi.getAllSites();
        setSites(sitesData.sites || []);
        
        // Ensure dates are set to current fiscal quarter
        const fiscalQuarter = getCurrentFiscalQuarter();
        setFilters(prev => ({
          ...prev,
          startDate: fiscalQuarter.startDate,
          endDate: fiscalQuarter.endDate
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch patient tests
  const fetchPatientTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        sortBy,
        sortOrder,
        ...filters
      };

      // Remove empty filters and "all" values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await patientTestApi.getPatientTests(params);
      
      if (response.success) {
        setPatientTests(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch patient tests');
      }
    } catch (error) {
      console.error('Error fetching patient tests:', error);
      setError('Failed to fetch patient tests');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, filters]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const params = {
        ...filters
      };

      // Remove empty filters and "all" values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === 'all') {
          delete params[key];
        }
      });

      console.log('📊 Fetching stats with params:', params);
      const response = await patientTestApi.getTestStats(params);
      
      if (response.success) {
        console.log('📊 Stats response:', response.data);
        setStats(response.data);
      } else {
        console.error('📊 Stats API error:', response);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [filters]); // Re-add filters dependency

  // Load data when sites are available (only once)
  useEffect(() => {
    if (sites.length > 0) {
      fetchPatientTests();
      fetchStats(); // Initial load only
    }
  }, [sites.length]); // Only depend on sites.length

  const handleSearch = () => {
    console.log('🔍 Manual search triggered with filters:', filters);
    setCurrentPage(1);
    fetchPatientTests();
    fetchStats(); // Also fetch stats when manually searching
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle table sort
  const handleTableSort = (field) => {
    if (tableSortField === field) {
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortField(field);
      setTableSortDirection('asc');
    }
  };

  // Get sorted patient tests
  const getSortedPatientTests = () => {
    return [...patientTests].sort((a, b) => {
      let aValue, bValue;

      switch (tableSortField) {
        case 'TestID':
          aValue = parseInt(a.TestID) || 0;
          bValue = parseInt(b.TestID) || 0;
          break;
        case 'ClinicID':
          aValue = a.ClinicID || '';
          bValue = b.ClinicID || '';
          break;
        case 'Dat':
          aValue = a.Dat ? new Date(a.Dat).getTime() : 0;
          bValue = b.Dat ? new Date(b.Dat).getTime() : 0;
          break;
        case 'CD4':
          aValue = parseFloat(a.CD4) || 0;
          bValue = parseFloat(b.CD4) || 0;
          break;
        case 'HIVLoad':
          aValue = parseFloat(a.HIVLoad) || 0;
          bValue = parseFloat(b.HIVLoad) || 0;
          break;
        case 'HCV':
          aValue = parseFloat(a.HCV) || 0;
          bValue = parseFloat(b.HCV) || 0;
          break;
        case 'siteName':
          aValue = a.siteName || '';
          bValue = b.siteName || '';
          break;
        default:
          aValue = a[tableSortField] || '';
          bValue = b[tableSortField] || '';
      }

      if (tableSortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  // Export test results to CSV (fetch all pages)
  const exportResults = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL data for export (not just current page)
      let allData = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const params = {
          page,
          limit: 100, // Max limit
          search: searchTerm,
          sortBy: tableSortField,
          sortOrder: tableSortDirection.toUpperCase(),
          ...filters
        };

        // Remove empty filters and "all" values
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === 'all') {
            delete params[key];
          }
        });

        const response = await patientTestApi.getPatientTests(params);
        
        if (response.success) {
          const pageData = response.data || [];
          allData = [...allData, ...pageData];
          
          const totalPages = response.pagination?.totalPages || 1;
          hasMore = page < totalPages;
          page++;
          
          // Safety limit
          if (page > 100) break;
        } else {
          break;
        }
      }
      
      // CSV Headers
      const headers = [
        'Test ID',
        'Clinic ID',
        'Test Date',
        'Collection Date',
        'CD4',
        'Viral Load',
        'HIV Log',
        'HCV',
        'WBC',
        'Hemoglobin',
        'Platelet',
        'Creatinine',
        'ALT',
        'AST',
        'Sputum AFB',
        'Site Name',
        'Site Code'
      ];

      // CSV Rows
      const rows = allData.map(test => [
        test.TestID || '',
        test.ClinicID || '',
        test.Dat || '',
        test.DaCollect || '',
        test.CD4 || '',
        test.HIVLoad || '',
        test.HIVLog || '',
        test.HCV || '',
        test.WBC || '',
        test.Hemoglobin || '',
        test.Platelet || '',
        test.Creatinine || '',
        test.ALT || '',
        test.AST || '',
        test.SputumAFB || '',
        test.siteName || '',
        test.siteCode || ''
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const siteName = filters.site === 'all' ? 'all-sites' : filters.site;
      link.download = `patient-tests-${siteName}-${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${allData.length} records to CSV`);
      // Don't show toasts for viewer users
      if (!isViewerUser()) {
        toast.success(`Successfully exported ${allData.length} records to CSV`);
      }
    } catch (error) {
      console.error('Export error:', error);
      // Don't show toasts for viewer users
      if (!isViewerUser()) {
        toast.error('Failed to export data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMetricsUpdate = (metrics) => {
    setDataEntryMetrics(metrics);
  };
  
  // Classify viral load result with visual indicators
  const classifyViralLoad = (viralLoad) => {
    if (!viralLoad || viralLoad === '' || viralLoad === '-') {
      return { label: 'N/A', color: 'gray', bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: Minus };
    }
    
    const value = parseFloat(viralLoad);
    if (isNaN(value)) {
      if (viralLoad?.toString().toLowerCase().includes('not detected')) {
        return { label: 'Not Detected', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: CheckCircle };
      }
      return { label: 'N/A', color: 'gray', bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: Minus };
    }
    
    if (value === 0) {
      return { label: 'Not Detected', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: CheckCircle };
    }
    if (value < 20) {
      return { label: 'Suppressed', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: Check };
    }
    if (value < 1000) {
      return { label: '<1000', color: 'yellow', bgColor: 'bg-warning/10', textColor: 'text-warning-foreground', icon: AlertTriangle };
    }
    return { label: 'High VL', color: 'red', bgColor: 'bg-destructive/10', textColor: 'text-destructive', icon: XCircle };
  };
  
  // Calculate enhanced summary statistics
  const calculateEnhancedStats = () => {
    if (!patientTests || patientTests.length === 0) {
      return {
        total: 0,
        suppressed: 0,
        highVL: 0,
        cd4Tests: 0,
        hcvTests: 0,
        avgCD4: 0,
        suppressionRate: 0
      };
    }
    
    let suppressed = 0;
    let highVL = 0;
    let cd4Tests = 0;
    let hcvTests = 0;
    let cd4Sum = 0;
    let cd4Count = 0;
    
    patientTests.forEach(test => {
      // Count VL classifications
      if (test.HIVLoad && test.HIVLoad !== '' && test.HIVLoad !== '-') {
        const value = parseFloat(test.HIVLoad);
        if (!isNaN(value)) {
          if (value < 20) suppressed++;
          else if (value >= 1000) highVL++;
        } else if (test.HIVLoad?.toString().toLowerCase().includes('not detected')) {
          suppressed++;
        }
      }
      
      // Count CD4 tests
      if (test.CD4 && test.CD4 !== '' && test.CD4 !== '-') {
        cd4Tests++;
        const cd4Value = parseFloat(test.CD4);
        if (!isNaN(cd4Value)) {
          cd4Sum += cd4Value;
          cd4Count++;
        }
      }
      
      // Count HCV tests
      if (test.HCV && test.HCV !== '' && test.HCV !== '-') {
        hcvTests++;
      }
    });
    
    const avgCD4 = cd4Count > 0 ? Math.round(cd4Sum / cd4Count) : 0;
    const suppressionRate = patientTests.length > 0 ? ((suppressed / patientTests.length) * 100).toFixed(1) : 0;
    
    return {
      total: patientTests.length,
      suppressed,
      highVL,
      cd4Tests,
      hcvTests,
      avgCD4,
      suppressionRate
    };
  };

  const formatTestValue = (value, type) => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return value === -1 ? '-' : value.toString();
      default:
        return value.toString();
    }
  };

  const getTestTypeBadge = (test) => {
    const types = [];
    if (test.CD4 && test.CD4 !== '') types.push('CD4');
    if (test.HIVLoad && test.HIVLoad !== '') types.push('VL');
    if (test.HCV && test.HCV !== '') types.push('HCV');
    if (test.WBC && test.WBC !== '') types.push('Hematology');
    if (test.Creatinine && test.Creatinine !== '') types.push('Chemistry');
    if (test.SputumAFB && test.SputumAFB !== -1) types.push('Microbiology');
    
    return types.length > 0 ? types.join(', ') : 'No Data';
  };

  // Sortable Table Head for Test Results
  const TestResultTableHead = ({ field, children }) => {
    const isSorted = tableSortField === field;
    const Icon = isSorted 
      ? (tableSortDirection === 'asc' ? ArrowUp : ArrowDown)
      : ArrowUpDown;

    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => handleTableSort(field)}
      >
        <div className="flex items-center gap-2">
          <span>{children}</span>
          <Icon className={`h-4 w-4 ${isSorted ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </TableHead>
    );
  };

  const FilterPanel = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search Filters
            </CardTitle>
            <CardDescription>
              Filter patient test results by various criteria
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Site Selection */}
          <div className="space-y-2">
            <Label htmlFor="site">Healthcare Facility</Label>
            <Select
              value={filters.site}
              onValueChange={(value) => handleFilterChange('site', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All facilities" />
              </SelectTrigger>
              <SelectContent className="bg-background backdrop-blur-sm">
                <SelectItem value="all">All facilities</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.siteCode || site.code} value={site.siteCode || site.code}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{site.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Type */}
          <div className="space-y-2">
            <Label htmlFor="testType">Test Type</Label>
            <Select
              value={filters.testType}
              onValueChange={(value) => handleFilterChange('testType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All test types" />
              </SelectTrigger>
              <SelectContent className="bg-background backdrop-blur-sm">
                <SelectItem value="all">All test types</SelectItem>
                <SelectItem value="cd4">CD4</SelectItem>
                <SelectItem value="viral_load">Viral Load</SelectItem>
                <SelectItem value="hcv">HCV</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="hematology">Hematology</SelectItem>
                <SelectItem value="microbiology">Microbiology</SelectItem>
                <SelectItem value="dna">DNA Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elegant Period Picker - Popup Style */}
          <div className="space-y-2">
            <Label>Period</Label>
            <div className="relative">
              {/* Combined Year-Quarter Display */}
              <div className="relative">
                <input
                  type="text"
                  value={filters.selectedQuarter === 'custom' 
                    ? 'Custom Range' 
                    : `FY${selectedFiscalYear}-Q${selectedQuarterNum}`}
                  readOnly
                  className="w-full h-9 sm:h-9 px-3 pr-10 text-sm border border-border rounded-md cursor-pointer transition-colors"
                  onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Custom Period Picker Panel */}
              {isPeriodPickerOpen && (
                <div ref={pickerRef} className="absolute top-full left-0 right-0 z-50 mt-2 bg-background backdrop-blur-sm border border-border rounded-md p-6 min-w-[320px] shadow-lg">
                  {/* Year Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      type="button"
                      onClick={() => setCurrentDecade(currentDecade - 10)}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-none hover: transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-primary" />
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setShowYearGrid(!showYearGrid)}
                      variant="ghost"
                      className="px-4 py-2 text-base font-semibold hover:text-primary rounded-none transition-colors cursor-pointer"
                    >
                      FY {selectedFiscalYear}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setCurrentDecade(currentDecade + 10)}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-none hover: transition-colors text-primary"
                    >
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </Button>
                  </div>

                  {/* Year Grid - Conditionally Visible */}
                  {showYearGrid && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {decadeYears.map((year) => {
                        const isSelected = year === selectedFiscalYear;
                        const isCurrentYear = year === getCurrentFiscalYear();
                        const isInCurrentDecade = isYearInCurrentDecade(year);
                        
                        return (
                          <Button
                            key={year}
                            type="button"
                            onClick={() => {
                              navigateToQuarter(selectedQuarterNum, year);
                              setShowYearGrid(false);
                            }}
                            variant={isSelected ? "default" : "ghost"}
                            size="sm"
                            className={`
                              px-3 py-2 text-sm rounded-none transition-all duration-200 relative
                              ${isSelected
                                ? 'bg-primary text-primary-foreground'
                                : isCurrentYear && isInCurrentDecade
                                ? 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                                : isInCurrentDecade
                                ? 'text-muted-foreground hover:bg-muted hover:border-border'
                                : 'text-muted-foreground hover:bg-muted/80'
                              }
                            `}
                          >
                            {year}
                            {isCurrentYear && !isSelected && isInCurrentDecade && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary/60 rounded-full"></div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quarter Selection */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { q: 1, label: 'Jan-Mar' },
                      { q: 2, label: 'Apr-Jun' },
                      { q: 3, label: 'Jul-Sep' },
                      { q: 4, label: 'Oct-Dec' }
                    ].map(({ q, label }) => (
                      <Button
                        key={q}
                        type="button"
                        onClick={() => {
                          navigateToQuarter(q, selectedFiscalYear);
                          setIsPeriodPickerOpen(false);
                          setShowYearGrid(false);
                        }}
                        variant={selectedQuarterNum === q ? "default" : "outline"}
                        size="sm"
                        className={`
                          px-4 py-2 text-sm rounded-none transition-all duration-200 font-medium
                          ${selectedQuarterNum === q
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
                          }
                        `}
                        title={label}
                      >
                        Q{q}
                      </Button>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        goToCurrentQuarter();
                        setIsPeriodPickerOpen(false);
                        setShowYearGrid(false);
                      }}
                      className="flex-1 text-xs"
                    >
                      Current Quarter
                    </Button>
                    <Button
                      type="button"
                      variant={filters.selectedQuarter === 'custom' ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleQuarterChange('custom');
                        setIsPeriodPickerOpen(false);
                        setShowYearGrid(false);
                      }}
                      className="flex-1 text-xs"
                    >
                      Custom Range
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Clear Buttons */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="outline" onClick={() => {
                const fiscalQuarter = getCurrentFiscalQuarter();
                setFilters({
                  site: 'all',
                  startDate: fiscalQuarter.startDate,
                  endDate: fiscalQuarter.endDate,
                  testType: 'viral_load',
                  clinicId: '',
                  selectedQuarter: 'current'
                });
                setSearchTerm('');
                setCurrentPage(1);
              }} className="flex-1">
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Date Range - Only visible when Custom is selected */}
          {filters.selectedQuarter === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2 duration-300">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filtering Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Result Range */}
              <div className="space-y-2">
                <Label>VL Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="suppressed">Suppressed (&lt;20)</SelectItem>
                    <SelectItem value="moderate">Moderate (20-1000)</SelectItem>
                    <SelectItem value="high">High VL (&gt;1000)</SelectItem>
                    <SelectItem value="not_detected">Not Detected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* CD4 Range */}
              <div className="space-y-2">
                <Label>CD4 Range</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All CD4 ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All CD4 Ranges</SelectItem>
                    <SelectItem value="low">&lt;200 (Low)</SelectItem>
                    <SelectItem value="moderate">200-500 (Moderate)</SelectItem>
                    <SelectItem value="normal">&gt;500 (Normal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StatsCards = () => {
    const enhancedStats = calculateEnhancedStats();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{enhancedStats.total}</h3>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TestTube className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Suppressed VL */}
        <Card className="transition-all duration-300 border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suppressed</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{enhancedStats.suppressed}</h3>
                <p className="text-xs text-primary font-medium mt-1">{enhancedStats.suppressionRate}% rate</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* High VL */}
        <Card className="transition-all duration-300 border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High VL</p>
                <h3 className="text-3xl font-bold text-destructive mt-2">{enhancedStats.highVL}</h3>
                <p className="text-xs text-destructive mt-1">&gt;1000 copies</p>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* CD4 Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-info">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CD4 Tests</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">{enhancedStats.cd4Tests}</h3>
                <p className="text-xs text-purple-600 mt-1">Avg: {enhancedStats.avgCD4}</p>
              </div>
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                <Beaker className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* HCV Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">HCV Tests</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">{enhancedStats.hcvTests}</h3>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Droplets className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TestTube className="h-8 w-8 text-primary" />
              Patient Test Results
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage patient laboratory test results
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={exportResults}
              disabled={patientTests.length === 0 || loading}
              className="gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchPatientTests} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

        <TabsContent value="results" className="space-y-6">
          <FilterPanel />
          <StatsCards />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>
                    {totalCount.toLocaleString()} test results found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={exportResults}
                    disabled={patientTests.length === 0 || loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={fetchPatientTests} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Enhanced Search Bar */}
                <div className="flex gap-2 bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="🔍 Search by Clinic ID, Test ID, or Site Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 bg-background border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading} className="px-6 rounded-md">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Results Table */}
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : patientTests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results found
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow className="hover:bg-muted">
                          {visibleColumns.test_id && <TestResultTableHead field="TestID">Test ID</TestResultTableHead>}
                          {visibleColumns.clinic_id && <TestResultTableHead field="ClinicID">Clinic ID</TestResultTableHead>}
                          {visibleColumns.test_date && <TestResultTableHead field="Dat">Test Date</TestResultTableHead>}
                          {visibleColumns.test_type && <TableHead className="font-semibold">Test Type</TableHead>}
                          {visibleColumns.cd4 && <TestResultTableHead field="CD4">CD4</TestResultTableHead>}
                          {visibleColumns.viral_load && <TestResultTableHead field="HIVLoad">Viral Load</TestResultTableHead>}
                          <TableHead className="font-semibold">VL Status</TableHead>
                          {visibleColumns.hcv && <TestResultTableHead field="HCV">HCV</TestResultTableHead>}
                          {visibleColumns.site && <TestResultTableHead field="siteName">Site</TestResultTableHead>}
                          {visibleColumns.actions && <TableHead className="font-semibold">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSortedPatientTests().map((test, index) => {
                          const vlClassification = classifyViralLoad(test.HIVLoad);
                          const StatusIcon = vlClassification.icon;
                          const hasAnomalies = !test.CD4 || test.CD4 === '' || test.CD4 === '-';
                          
                          return (
                            <TableRow 
                              key={test.TestID}
                              className={`
                                ${vlClassification.bgColor}
                                hover:brightness-95
                                transition-all duration-200
                                cursor-pointer
                                ${index % 2 === 0 ? 'bg-opacity-30' : 'bg-opacity-50'}
                                ${hasAnomalies ? 'border-l-4 border-l-warning' : ''}
                              `}
                              onClick={() => setQuickViewDrawer({ isOpen: true, data: test })}
                            >
                              {visibleColumns.test_id && (
                                <TableCell className="font-medium font-mono text-sm">
                                  {test.TestID}
                                </TableCell>
                              )}
                              {visibleColumns.clinic_id && (
                                <TableCell className="font-mono text-sm font-semibold">
                                  {test.ClinicID}
                                </TableCell>
                              )}
                              {visibleColumns.test_date && (
                                <TableCell className="text-sm">
                                  {test.Dat ? new Date(test.Dat).toLocaleDateString() : '-'}
                                </TableCell>
                              )}
                              {visibleColumns.test_type && (
                                <TableCell>
                                  <Badge variant="outline" className="font-medium">
                                    {getTestTypeBadge(test)}
                                  </Badge>
                                </TableCell>
                              )}
                              {visibleColumns.cd4 && (
                                <TableCell className="font-semibold">
                                  {formatTestValue(test.CD4)}
                                </TableCell>
                              )}
                              {visibleColumns.viral_load && (
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-mono font-semibold text-sm">
                                      {formatTestValue(test.HIVLoad)}
                                    </div>
                                    {test.HIVLog && test.HIVLog !== '' && (
                                      <div className="text-xs text-muted-foreground">
                                        Log: {test.HIVLog}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <Badge className={`${vlClassification.bgColor} ${vlClassification.textColor} border-0 gap-1 font-medium`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {vlClassification.label}
                                </Badge>
                              </TableCell>
                              {visibleColumns.hcv && (
                                <TableCell className="font-semibold">
                                  {formatTestValue(test.HCV)}
                                </TableCell>
                              )}
                              {visibleColumns.site && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">{test.siteName}</span>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.actions && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-primary/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickViewDrawer({ isOpen: true, data: test });
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <PaginationComponent />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">

          {/* Lab Data Entry Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Lab Data Entry Comparison
              </CardTitle>
              <CardDescription>
                Compare lab workflow with database entries to ensure complete data entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LabDataEntryComparison 
                patientTests={patientTests}
                filters={filters}
                onMetricsUpdate={handleMetricsUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Quick View Drawer */}
      {quickViewDrawer.isOpen && quickViewDrawer.data && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setQuickViewDrawer({ isOpen: false, data: null })} />
          
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold">Test Details</h3>
                  <p className="text-sm text-muted-foreground">Test ID: {quickViewDrawer.data.TestID}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuickViewDrawer({ isOpen: false, data: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Patient Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Patient Information</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Clinic ID: {quickViewDrawer.data.ClinicID}</p>
                        <p className="text-sm text-muted-foreground">Test #{quickViewDrawer.data.TestID}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Test Date</p>
                        <p className="font-medium">
                          {quickViewDrawer.data.Dat ? new Date(quickViewDrawer.data.Dat).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Collection Date</p>
                        <p className="font-medium">
                          {quickViewDrawer.data.DaCollect ? new Date(quickViewDrawer.data.DaCollect).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Viral Load Results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Viral Load Results</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Viral Load</span>
                      <span className="font-mono font-bold text-lg">
                        {formatTestValue(quickViewDrawer.data.HIVLoad)}
                      </span>
                    </div>
                    {quickViewDrawer.data.HIVLog && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">VL Log</span>
                        <span className="font-mono font-semibold">
                          {quickViewDrawer.data.HIVLog}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {(() => {
                        const classification = classifyViralLoad(quickViewDrawer.data.HIVLoad);
                        const StatusIcon = classification.icon;
                        return (
                          <Badge className={`${classification.bgColor} ${classification.textColor} border-0 gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {classification.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* CD4 & Other Tests */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Other Lab Results</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">CD4 Count</span>
                      <span className="font-semibold">{formatTestValue(quickViewDrawer.data.CD4)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">HCV</span>
                      <span className="font-semibold">{formatTestValue(quickViewDrawer.data.HCV)}</span>
                    </div>
                    {quickViewDrawer.data.WBC && quickViewDrawer.data.WBC !== '' && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">WBC</span>
                        <span className="font-semibold">{formatTestValue(quickViewDrawer.data.WBC)}</span>
                      </div>
                    )}
                    {quickViewDrawer.data.Hemoglobin && quickViewDrawer.data.Hemoglobin !== '' && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Hemoglobin</span>
                        <span className="font-semibold">{formatTestValue(quickViewDrawer.data.Hemoglobin)}</span>
                      </div>
                    )}
                    {quickViewDrawer.data.Platelet && quickViewDrawer.data.Platelet !== '' && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Platelet</span>
                        <span className="font-semibold">{formatTestValue(quickViewDrawer.data.Platelet)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Site Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Healthcare Facility</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{quickViewDrawer.data.siteName || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">Site Code: {quickViewDrawer.data.siteCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Download className="h-4 w-4" />
                      Download Test Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      View Patient History
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      View Patient Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PatientTests;
