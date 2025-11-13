import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button, Input, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from "@/components/ui";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { formatDateForTable } from '@/utils/dateFormatter';
import { getCorrectPatientType } from '@/utils/ageCalculator';
import { toast } from 'sonner';

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

const IndicatorDetailsModal = ({
  isOpen,
  onClose,
  selectedIndicator,
  indicatorDetails = [],
  pagination,
  detailsLoading = false,
  searchLoading = false,
  searchTerm = '',
  onSearchChange,
  onSearch,
  onPageChange,
  currentFilters = {},
  error = null,
  isSampleData = false,
  sampleDataInfo = null,
  selectedSite = null,
  dateRange = null
}) => {
  // Provide default pagination object with safe access
  const safePagination = pagination && typeof pagination === 'object' ? pagination : { page: 1, totalPages: 1, totalCount: 0, hasPrev: false, hasNext: false };
  const [sortField, setSortField] = useState('clinicid')
  const [sortDirection, setSortDirection] = useState('asc')
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const itemsPerPageOptions = [10, 20, 50, 100]

  if (!isOpen) return null;


  // Skeleton loading component for table rows
  const SkeletonRow = () => (
    <TableRow>
      {Array.from({ length: 8 }, (_, index) => (
        <TableCell key={index} className="text-xs px-2 py-2">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );

  // Get column configuration based on indicator type
  const getColumnConfig = (indicatorName) => {
    const baseColumns = [
      { key: 'clinicid', label: 'Clinic ID', type: 'text' },
      { key: 'art_number', label: 'ART Number', type: 'text' },
      { key: 'sex_display', label: 'Sex', type: 'badge' },
      { key: 'patient_type', label: 'Type', type: 'badge' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'DafirstVisit', label: 'First Visit', type: 'date' }
    ];

    const artColumns = [
      { key: 'DaArt', label: 'ART Start', type: 'date' },
      // { key: 'Startartstatus', label: 'ART Duration', type: 'badge' }
    ];

    const vlColumns = [
      { key: 'LastVLDate', label: 'Last VL Date', type: 'date', altKey: 'DateResult' },
      { key: 'LastVLLoad', label: 'Last VL Load', type: 'number', altKey: 'HIVLoad' },
      { key: 'StatusVL', label: 'VL Status', type: 'badge', altKey: 'vlresultstatus' }
    ];

    const tptColumns = [
      { key: 'Tptdrugname', label: 'TPT Drug', type: 'text' },
      { key: 'dateStart', label: 'TPT Start', type: 'date' },
      { key: 'tptstatus', label: 'TPT Status', type: 'badge' }
    ];

    let columns = [...baseColumns];

    // Add columns based on indicator type
    if (indicatorName?.includes('MMD') || indicatorName?.includes('Eligible MMD')) {
      // For MMD indicators, add ART columns (no duplicate ART Number since it's removed from artColumns)
      columns = [...columns, ...artColumns];
    }
    
    // TLD indicators - exclude ART Duration for indicator 5.2
    if (indicatorName?.includes('TLD')) {
      if (indicatorName?.includes('5.2. New ART started with TLD')) {
        // For indicator 5.2, use ART columns without ART Duration
        const artColumnsWithoutDuration = artColumns.filter(col => col.key !== 'Startartstatus');
        columns = [...columns, ...artColumnsWithoutDuration];
      } else {
        // For other TLD indicators, use full ART columns
        columns = [...columns, ...artColumns];
      }
    }
    
    // Special case for Active ART indicators - exclude ART Duration for indicator 1
    if (indicatorName?.includes('Active ART')) {
      if (indicatorName?.includes('1. Active ART patients in previous quarter')) {
        // For indicator 1, use ART columns without ART Duration
        const artColumnsWithoutDuration = artColumns.filter(col => col.key !== 'Startartstatus');
        columns = [...columns, ...artColumnsWithoutDuration];
      } else {
        // For other Active ART indicators, use full ART columns
        columns = [...columns, ...artColumns];
      }
    }

    if (indicatorName?.includes('VL') || indicatorName?.includes('suppression')) {
      columns = [...columns, ...vlColumns];
      
      // Add VL-specific columns for eligible VL test indicator
      if (indicatorName?.includes('Eligible for VL test')) {
        columns = [...columns, 
          { key: 'MonthsOnART', label: 'Months on ART', type: 'number' },
          { key: 'MonthsSinceLastVL', label: 'Months Since Last VL', type: 'number' }
        ];
      }
    }

    if (indicatorName?.includes('TPT')) {
      columns = [...columns, ...tptColumns];
    }

    if (indicatorName?.includes('Lost and Return')) {
      columns = [...columns, 
        { key: 'return_type', label: 'Return Type', type: 'text' }
      ];
    }

    if (indicatorName?.includes('Dead')) {
      columns = [...columns, 
        { key: 'death_date', label: 'Death Date', type: 'date' },
        { key: 'death_place', label: 'Death Place', type: 'text' },
        { key: 'death_reason', label: 'Death Reason', type: 'text' }
      ];
    }

    if (indicatorName?.includes('MMD')) {
      columns = [...columns, 
        { key: 'datevisit', label: 'Visit Date', type: 'date' },
        { key: 'MMDStatus', label: 'MMD Status', type: 'badge' }
      ];
    }

    if (indicatorName?.includes('TLD')) {
      columns = [...columns, 
        { key: 'TLDStatus', label: 'TLD Status', type: 'badge' }
      ];
    }

    return columns;
  };

  const columnConfig = getColumnConfig(selectedIndicator?.Indicator);

  // Add corrected patient type field and convert sex to display text
  const processedRecords = indicatorDetails.map(record => ({
    ...record,
    corrected_patient_type: getCorrectPatientType(record),
    // Handle both old and new field names
    sex_display: record.sex_display || (record.Sex === 1 ? 'Male' : record.Sex === 0 ? 'Female' : 'Unknown'),
    patient_type: record.patient_type || getCorrectPatientType(record),
    // Handle VL field name variations (10.6 uses LastVLDate/LastVLLoad/StatusVL, 10.7 uses DateResult/HIVLoad/vlresultstatus)
    LastVLDate: record.LastVLDate || record.DateResult,
    LastVLLoad: record.LastVLLoad || record.HIVLoad,
    StatusVL: record.StatusVL || record.vlresultstatus,
    // Handle Lost and Return fields
    return_type: record.return_type || record.TypeofReturn || 'N/A',
    art_number: record.art_number || record.Artnum || record.ART || 'N/A'
  }));

  // Sorting functionality
  const sortedRecords = [...processedRecords].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Comprehensive CSV export function that fetches ALL records
  const exportAllRecords = async () => {
    if (!selectedIndicator) return;
    
      // Show loading state
      const button = document.querySelector('[data-export-button]');
      const originalContent = button?.innerHTML;
      if (button) {
        button.innerHTML = '<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>Preparing export...';
        button.disabled = true;
      }
      
      // Show initial toast (only for non-viewers)
      const exportToast = !isViewerUser() ? toast.loading('Preparing export...', {
        description: `Exporting ${selectedIndicator.Indicator} data`
      }) : null;
    
    try {
      const getApiUrl = () => {
        const hostname = window.location.hostname
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3001'
        } else {
          return `http://${hostname}:3001`
        }
      }
      const API_BASE_URL = import.meta.env.VITE_API_URL || getApiUrl();
      const token = localStorage.getItem('token');
      
      if (button) {
        button.innerHTML = '<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>Fetching all records...';
      }
      
      // Map indicator names to their corresponding SQL file names
      const indicatorMap = {
        '1. Active ART patients in previous quarter': '01_active_art_previous',
        '2. Active Pre-ART patients in previous quarter': '02_active_pre_art_previous',
        '3. Newly Enrolled': '03_newly_enrolled',
        '4. Re-tested positive': '04_retested_positive',
        '5. Newly Initiated': '05_newly_initiated',
        '5.1.1. New ART started: Same day': '05.1.1_art_same_day',
        '5.1.2. New ART started: 1-7 days': '05.1.2_art_1_7_days',
        '5.1.3. New ART started: >7 days': '05.1.3_art_over_7_days',
        '5.2. New ART started with TLD': '05.2_art_with_tld',
        '6. Transfer-in patients': '06_transfer_in',
        '7. Lost and Return': '07_lost_and_return',
        '8.1. Dead': '08.1_dead',
        '8.2. Lost to follow up (LTFU)': '08.2_lost_to_followup',
        '8.3. Transfer-out': '08.3_transfer_out',
        '9. Active Pre-ART': '09_active_pre_art',
        '10. Active ART patients in this quarter': '10_active_art_current',
        '10.1. Eligible MMD': '10.1_eligible_mmd',
        '10.2. MMD': '10.2_mmd',
        '10.3. TLD': '10.3_tld',
        '10.4. TPT Start': '10.4_tpt_start',
        '10.5. TPT Complete': '10.5_tpt_complete',
        '10.6. Eligible for VL test': '10.6_eligible_vl_test',
        '10.7. VL tested in 12M': '10.7_vl_tested_12m',
        '10.8. VL suppression': '10.8_vl_suppression',
        // Handle analytics data names (without numbers)
        'Active ART patients in previous quarter': '01_active_art_previous',
        'Active Pre-ART patients in previous quarter': '02_active_pre_art_previous',
        'Newly Enrolled': '03_newly_enrolled',
        'Re-tested positive': '04_retested_positive',
        'Newly Initiated': '05_newly_initiated',
        'New ART started: Same day': '05.1.1_art_same_day',
        'New ART started: 1-7 days': '05.1.2_art_1_7_days',
        'New ART started: >7 days': '05.1.3_art_over_7_days',
        'New ART started with TLD': '05.2_art_with_tld',
        'Transfer-in patients': '06_transfer_in',
        'Lost and Return': '07_lost_and_return',
        'Dead': '08.1_dead',
        'Lost to follow up (LTFU)': '08.2_lost_to_followup',
        'Transfer-out': '08.3_transfer_out',
        'Active Pre-ART': '09_active_pre_art',
        'Active ART patients in this quarter': '10_active_art_current',
        'Eligible MMD': '10.1_eligible_mmd',
        'MMD': '10.2_mmd',
        'TLD': '10.3_tld',
        'TPT Start': '10.4_tpt_start',
        'TPT Complete': '10.5_tpt_complete',
        'Eligible for VL test': '10.6_eligible_vl_test',
        'VL tested in 12M': '10.7_vl_tested_12m',
        'VL suppression': '10.8_vl_suppression'
      };

      // Use the same indicator key as the UI (without _details suffix)
      const indicatorKey = indicatorMap[selectedIndicator.Indicator] || selectedIndicator.Indicator;
      
      // Check if this is analytics data that needs special handling
      if (isSampleData && sampleDataInfo) {
        // For analytics data, we might need to use a different approach
        // For now, we'll try the regular endpoints but with analytics-specific parameters
      }
      
      // Use the same date range as the UI to ensure consistency
      const currentDateRange = dateRange || {
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        previousEndDate: '2024-12-31'
      };
      
      // Build filter parameters for ALL records
      const baseParams = {
        ...currentDateRange,
        search: searchTerm || '',
        _t: Date.now() // Cache busting
      };

      // Add current filters if they exist
      if (currentFilters.gender) {
        baseParams.gender = currentFilters.gender;
      }
      if (currentFilters.ageGroup) {
        baseParams.ageGroup = currentFilters.ageGroup;
      }
      
      // Fetch ALL records using optimized chunked approach
      let allRecords = [];
      let totalCount = 0;
      let page = 1;
      let limit = 5000; // Start with 5k chunks for better performance
      let hasMore = true;
      let consecutiveEmptyPages = 0;
      
      try {
        while (hasMore) {
          if (button) {
            button.innerHTML = `<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>Page ${page}...`;
          }
          
          const filterParams = {
            ...baseParams,
            page,
            limit,
            useCache: 'false' // Disable cache to get fresh data
          };
          
      // Try multiple API endpoints in order of preference
      const apiEndpoints = [];
      
      // If this is analytics data, try analytics endpoints first
      if (isSampleData && sampleDataInfo) {
        
        // Analytics endpoint for pre-calculated data
        apiEndpoints.push({
          url: `${API_BASE_URL}/apiv1/analytics/indicator/${indicatorKey}/${selectedSite?.code || 'all'}?${new URLSearchParams({
            periodType: 'quarterly',
            periodYear: '2025',
            periodQuarter: '3'
          })}`,
          name: 'Analytics API (pre-calculated)'
        });
      }
      
      if (selectedSite) {
        // Primary: Site-specific endpoint
        apiEndpoints.push({
          url: `${API_BASE_URL}/apiv1/site-indicators/sites/${selectedSite.code}/indicators/${indicatorKey}/details?${new URLSearchParams(filterParams)}`,
          name: `Site-specific API for site: ${selectedSite.code}`
        });
      }
      
      // Fallback: General indicators endpoint
      apiEndpoints.push({
        url: `${API_BASE_URL}/apiv1/indicators/${indicatorKey}/details?${new URLSearchParams(filterParams)}`,
        name: 'General indicators API'
      });
      
      // Fallback: Optimized indicators endpoint
      apiEndpoints.push({
        url: `${API_BASE_URL}/apiv1/optimized-indicators/${indicatorKey}/details?${new URLSearchParams(filterParams)}`,
        name: 'Optimized indicators API'
      });
      
          
          // Try each endpoint until one succeeds
          let response = null;
          let data = null;
          let lastError = null;
          
          for (let i = 0; i < apiEndpoints.length; i++) {
            const endpoint = apiEndpoints[i];
            
            try {
              response = await fetch(endpoint.url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.ok) {
                data = await response.json();
                break; // Success, exit the loop
              } else {
                const errorText = await response.text();
                lastError = `Endpoint ${i + 1} failed: ${response.status} - ${errorText}`;
              }
            } catch (error) {
              lastError = `Endpoint ${i + 1} error: ${error.message}`;
            }
          }
          
          if (!data) {
            throw new Error(`All endpoints failed. Last error: ${lastError}`);
          }
          
          if (!data.success) {
            throw new Error('API returned error: ' + (data.error || data.message));
          }
          
          const pageRecords = data.data || [];
          
          // Track total count from first response
          if (page === 1) {
            totalCount = data.pagination?.totalCount || 0;
          }
          
          // Handle empty pages
          if (pageRecords.length === 0) {
            consecutiveEmptyPages++;
            if (consecutiveEmptyPages >= 3) {
              break;
            }
          } else {
            consecutiveEmptyPages = 0;
            allRecords = [...allRecords, ...pageRecords];
          }
          
          // Update progress with better calculation
          if (button && totalCount > 0) {
            const progress = Math.min(100, Math.round((allRecords.length / totalCount) * 100));
            button.innerHTML = `<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>${progress}% (${allRecords.length.toLocaleString()}/${totalCount.toLocaleString()})`;
            
            // Update toast progress (only for non-viewers)
            if (!isViewerUser() && exportToast) {
              toast.loading(`Fetching data... ${progress}%`, {
                id: exportToast,
                description: `${allRecords.length.toLocaleString()}/${totalCount.toLocaleString()} records fetched`
              });
            }
          } else if (button) {
            button.innerHTML = `<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>${allRecords.length.toLocaleString()} records`;
            
            // Update toast progress (only for non-viewers)
            if (!isViewerUser() && exportToast) {
              toast.loading(`Fetching data...`, {
                id: exportToast,
                description: `${allRecords.length.toLocaleString()} records fetched`
              });
            }
          }
          
          // Check if there are more pages
          hasMore = data.pagination?.hasNext || false;
          page++;
          
          // Dynamic limit adjustment for very large datasets
          if (page > 20 && limit > 2000) {
            limit = 2000; // Reduce chunk size for very large datasets
          }
          
          // Safety limit for truly large datasets
          if (page > 200) {
            break;
          }
          
          // Add small delay to prevent overwhelming the server
          if (page % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        } catch (fetchError) {
        
        // If this is analytics data and API calls failed, try to export current displayed data
        if (isSampleData && sampleDataInfo && processedRecords.length > 0) {
          allRecords = processedRecords; // Use the currently displayed records
          totalCount = processedRecords.length;
        } else {
          throw new Error('Failed to fetch all records: ' + fetchError.message);
        }
      }
      
      // Check if we have any records to export
      if (allRecords.length === 0) {
        throw new Error('No records found to export. Please check your filters and try again.');
      }
      
      if (button) {
        button.innerHTML = '<div class="animate-spin rounded-none h-4 w-4 border-b-2 border-gray-900 mr-1"></div>Generating CSV...';
      }
      
      // Update toast to CSV generation (only for non-viewers)
      if (!isViewerUser() && exportToast) {
        toast.loading('Generating CSV...', {
          id: exportToast,
          description: `Processing ${allRecords.length.toLocaleString()} records`
        });
      }
      
      // Process records for export (same as display processing)
      const processedRecords = allRecords.map(record => ({
        ...record,
        corrected_patient_type: getCorrectPatientType(record),
        sex_display: record.sex_display || (record.Sex === 1 ? 'Male' : record.Sex === 0 ? 'Female' : 'Unknown'),
        patient_type: record.patient_type || getCorrectPatientType(record),
        LastVLDate: record.LastVLDate || record.DateResult,
        LastVLLoad: record.LastVLLoad || record.HIVLoad,
        StatusVL: record.StatusVL || record.vlresultstatus,
        // Handle Lost and Return fields
        return_type: record.return_type || record.TypeofReturn || 'N/A',
        art_number: record.art_number || record.Artnum || record.ART || 'N/A'
      }));
      
      // Create CSV content - ONLY the data records
      const csvData = [];
      
      // Add column headers only
      const headers = columnConfig.map(col => col.label);
      csvData.push(headers);
      
      // Add all records
      processedRecords.forEach(record => {
        const row = columnConfig.map(col => {
          const value = record[col.key] || (col.altKey ? record[col.altKey] : null);
          let displayValue = value || 'N/A';
          
          if (col.type === 'date' && value) {
            displayValue = new Date(value).toLocaleDateString();
          }
          
          return displayValue;
        });
        csvData.push(row);
      });
      
      // Convert to CSV
      const csvContent = csvData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fileName = `HIV_Indicator_${selectedIndicator.Indicator.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message (only for non-viewers)
      if (!isViewerUser() && exportToast) {
        toast.success('Export Complete!', {
          id: exportToast,
          description: `📊 ${selectedIndicator.Indicator}\n📋 ${processedRecords.length.toLocaleString()} records exported\n📁 ${fileName}`,
          duration: 5000,
        });
      }
      
    } catch (error) {
      
      let errorTitle = 'Export Failed';
      let errorDescription = error.message;
      
      if (error.message.includes('All endpoints failed')) {
        errorTitle = 'Export Failed - Server Error';
        errorDescription = `Unable to connect to server. Please check if the backend is running and try again.`;
      } else if (error.message.includes('No records found')) {
        errorTitle = 'Export Failed - No Data';
        errorDescription = `No records found to export. Check your filters and date range.`;
      }
      
      // Show error message (only for non-viewers)
      if (!isViewerUser() && exportToast) {
        toast.error(errorTitle, {
          id: exportToast,
          description: errorDescription,
          duration: 8000,
          action: {
            label: 'Retry',
            onClick: () => exportAllRecords()
          }
        });
      }
    } finally {
      // Restore button state
      if (button) {
        button.innerHTML = originalContent || '<Download className="h-4 w-4 mr-1" />CSV';
        button.disabled = false;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-3xl bg-card lg:max-w-5xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="p-1.5 bg-blue-600 rounded-none flex-shrink-0 mt-0.5">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                 <DialogTitle className="text-base sm:text-xl font-semibold text-foreground leading-tight">
                   {detailsLoading ? (
                     <Skeleton className="h-5 w-3/4" />
                   ) : (
                     <>
                       {selectedIndicator?.Indicator}
                       {currentFilters.gender && currentFilters.ageGroup && (
                         <span className="block text-sm font-normal text-primary mt-1">
                           {currentFilters.gender === 'male' ? 'Male' : 'Female'} patients aged {currentFilters.ageGroup === '0-14' ? '0-14' : '15+'} years
                         </span>
                       )}
                     </>
                   )}
                 </DialogTitle>
                 <DialogDescription className="text-xs sm:text-base text-muted-foreground mt-1">
                   {detailsLoading ? (
                     <span className="inline-block h-4 w-1/2 bg-gray-200 rounded-none animate-pulse" />
                   ) : (
                     <>
                       {processedRecords.length.toLocaleString()} of {(safePagination?.totalCount || 0).toLocaleString()} records
                       {currentFilters.gender && currentFilters.ageGroup && (
                         <span className="block text-xs text-primary">
                           Filtered by: {currentFilters.gender} • {currentFilters.ageGroup}
                         </span>
                       )}
                     </>
                   )}
                 </DialogDescription>
              </div>
            </div>
           
          </div>{/* Search and Controls */}
              <div className="flex flex-row items-center gap-2">
                <div className="relative flex-1">
                  {searchLoading ? (
                    <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 h-9"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onSearch(1, searchTerm);
                      }
                    }}
                    disabled={detailsLoading || searchLoading}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {detailsLoading ? (
                    <>
                      <Skeleton className="w-16 h-9" />
                      <Skeleton className="w-20 h-9" />
                    </>
                  ) : (
                    <>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                        <SelectTrigger className="w-16 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemsPerPageOptions.map(option => (
                            <SelectItem key={option} value={option.toString()}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={exportAllRecords} 
                        variant="outline"
                        size="sm"
                        className="h-9 whitespace-nowrap"
                        data-export-button
                        disabled={!selectedIndicator}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export All
                      </Button>
                    </>
                  )}
                </div>
              </div>
        </DialogHeader> 
        
        {/* Sample Data Warning */}
        {isSampleData && sampleDataInfo && (
          <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-none">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Sample Data Display</p>
                <p className="text-amber-700 mt-1">
                  {sampleDataInfo.message} This shows patients from site {sampleDataInfo.sampleSite} as an example.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <div className="p-4 ">
             

              {/* Records Table */}
              <div className="border overflow-hidden">
                {detailsLoading || searchLoading ? (
                  <div className="overflow-auto scrollbar-hide">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 border-b border-primary/30">
                        <TableRow className="bg-muted">
                          {Array.from({ length: 8 }, (_, index) => (
                            <TableHead 
                              key={index}
                              className="text-xs px-2 py-3 whitespace-nowrap"
                            >
                              <Skeleton className="h-4 w-16" />
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: itemsPerPage }, (_, index) => (
                          <SkeletonRow key={index} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Data</h3>
                    <p className="text-destructive mb-4">
                      {error}
                    </p>
                    <Button 
                      onClick={() => onSearch(1, searchTerm)}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : processedRecords.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Records Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No records match your search criteria.' : 'No records found for this indicator.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto scrollbar-hide" style={{ maxHeight: 'calc(95vh - 300px)' }}>
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow className=" border-b-2 border-primary/30">
                          {columnConfig.map((column, index) => (
                            <TableHead 
                              key={index}
                              className={`cursor-pointer hover:/20 text-xs px-2 py-3 whitespace-nowrap text-primary font-medium ${index < columnConfig.length - 1 ? 'border-r border-primary/30' : ''}`}
                              onClick={() => handleSort(column.key)}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="truncate max-w-[80px]">{column.label}</span>
                                {sortField === column.key && (
                                  sortDirection === 'asc' ? <SortAsc className="h-3 w-3 flex-shrink-0" /> : <SortDesc className="h-3 w-3 flex-shrink-0" />
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRecords.map((record, index) => (
                          <TableRow key={index} className="hover:bg-muted/50 border-b border-border">
                            {columnConfig.map((column, colIndex) => {
                              const value = record[column.key] || (column.altKey ? record[column.altKey] : null);
                              let displayValue = value || 'N/A';
                              
                              if (column.type === 'date' && value) {
                                displayValue = formatDateForTable(value);
                              }
                              
                              return (
                                <TableCell key={colIndex} className={`text-xs px-2 py-2 max-w-[100px] ${colIndex < columnConfig.length - 1 ? 'border-r border-border' : ''}`}>
                                  {column.type === 'badge' ? (
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs px-1 py-0 ${
                                        column.key === 'sex_display' 
                                          ? displayValue === 'Male' 
                                            ? 'badge-male' 
                                            : 'badge-female'
                                          : column.key === 'patient_type'
                                          ? displayValue === 'Adult' 
                                            ? 'badge-adult'
                                            : displayValue === 'Child'
                                            ? 'badge-child'
                                            : 'badge-infant'
                                          : column.key === 'Startartstatus'
                                          ? displayValue === 'New' 
                                            ? 'badge-primary'
                                            : displayValue === 'Continuing'
                                            ? 'badge-secondary'
                                            : 'badge-muted'
                                          : column.key === 'StatusVL'
                                          ? displayValue === 'DO VL' || displayValue === 'Do_VL_in_12M'
                                            ? 'badge-warning'
                                            : displayValue === 'VL-Suppression'
                                            ? 'badge-success'
                                            : displayValue === 'Not-Suppression'
                                            ? 'badge-destructive'
                                            : 'badge-muted'
                                          : column.key === 'tptstatus'
                                          ? displayValue === 'TPT Complete' 
                                            ? 'badge-success'
                                            : displayValue === 'Not complete'
                                            ? 'badge-warning'
                                            : 'badge-muted'
                                          : 'badge-muted'
                                      }`}
                                    >
                                      <span className="truncate">{displayValue}</span>
                                    </Badge>
                                  ) : column.key === 'clinicid' ? (
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium truncate text-primary">{displayValue}</span>
                                    </div>
                                  ) : column.key === 'age' ? (
                                    <span className="truncate block font-medium text-foreground" title={displayValue}>{displayValue}</span>
                                  ) : column.type === 'date' ? (
                                    <span className="truncate block text-muted-foreground" title={displayValue}>{displayValue}</span>
                                  ) : (
                                    <span className="truncate block" title={displayValue}>{displayValue}</span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>

           {/* Pagination - Fixed at bottom */}
           {(safePagination?.totalPages || 0) > 1 && !detailsLoading && (
             <div className="border-t bg-card p-4 flex-shrink-0">
               <div className="flex items-center justify-between">
                 <div className="text-xs text-muted-foreground">
                   Page {safePagination?.page || 1} of {safePagination?.totalPages || 1}
                 </div>
                 <div className="flex items-center space-x-1">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => onPageChange((safePagination?.page || 1) - 1)}
                     disabled={!safePagination?.hasPrev || detailsLoading}
                     className="h-8 w-8 p-0"
                   >
                     <ChevronLeft className="h-4 w-4" />
                   </Button>
                   
                   {/* Mobile: Show only current page and adjacent pages */}
                   <div className="flex items-center space-x-1 sm:hidden">
                     {[(safePagination?.page || 1) - 1, safePagination?.page || 1, (safePagination?.page || 1) + 1]
                       .filter(page => page >= 1 && page <= (safePagination?.totalPages || 1))
                       .map(pageNum => (
                         <Button
                           key={pageNum}
                           variant={(safePagination?.page || 1) === pageNum ? "default" : "outline"}
                           size="sm"
                           onClick={() => onPageChange(pageNum)}
                           disabled={detailsLoading}
                           className="w-8 h-8 p-0 text-xs"
                         >
                           {pageNum}
                         </Button>
                       ))
                     }
                   </div>
 
                   {/* Desktop: Show more pages */}
                   <div className="hidden sm:flex items-center space-x-1">
                     {Array.from({ length: Math.min(5, safePagination?.totalPages || 1) }, (_, i) => {
                       const pageNum = Math.max(1, Math.min((safePagination?.totalPages || 1) - 4, (safePagination?.page || 1) - 2)) + i;
                       if (pageNum > (safePagination?.totalPages || 1)) return null;
                       
                       return (
                         <Button
                           key={pageNum}
                           variant={(safePagination?.page || 1) === pageNum ? "default" : "outline"}
                           size="sm"
                           onClick={() => onPageChange(pageNum)}
                           disabled={detailsLoading}
                           className="w-8 h-8 p-0"
                         >
                           {pageNum}
                         </Button>
                       );
                     })}
                   </div>
                   
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => onPageChange((safePagination?.page || 1) + 1)}
                     disabled={!safePagination?.hasNext || detailsLoading}
                     className="h-8 w-8 p-0"
                   >
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
           )}
           
           {/* Skeleton pagination during loading */}
           {detailsLoading && (
             <div className="border-t bg-card p-4 flex-shrink-0">
               <div className="flex items-center justify-between">
                 <Skeleton className="h-4 w-24" />
                 <div className="flex items-center space-x-1">
                   <Skeleton className="h-8 w-8" />
                   <Skeleton className="h-8 w-8" />
                   <Skeleton className="h-8 w-8" />
                   <Skeleton className="h-8 w-8" />
                 </div>
               </div>
             </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndicatorDetailsModal;