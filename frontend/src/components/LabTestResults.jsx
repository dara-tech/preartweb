import React, { useState, useEffect, useRef } from 'react';
import { labTestApi } from '../services/labTestApi';
import { siteApi } from '../services/siteApi';
import { 
  Calendar as CalendarIcon, 
  Search, 
  TestTube, 
  AlertCircle, 
  RefreshCw, 
  Download,
  Eye,
  User,
  TrendingUp,
  MapPin,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  BarChart3,
  Users,
  AlertTriangle,
  Clock,
  Filter,
  X,
  Check,
  Minus
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const LabTestResults = () => {
  const [testResults, setTestResults] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('test_blood_dt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Connection test modal state
  const [connectionModal, setConnectionModal] = useState({
    isOpen: false,
    success: false,
    message: ''
  });
  
  // Enhanced UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    lab_id: true,
    clinic_id: true,
    patient: true,
    test_type: true,
    results: true,
    test_date: true,
    physician: true,
    actions: true
  });
  const [quickViewDrawer, setQuickViewDrawer] = useState({
    isOpen: false,
    data: null
  });
  
  // Helper function to get current calendar quarter
  const getCurrentFiscalYear = () => {
    return new Date().getFullYear();
  };

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
    
    // Create dates using ISO string format
    const startDate = `${quarterYear}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(quarterYear, quarterEndMonth + 1, 0).getDate();
    const endDate = `${quarterYear}-${String(quarterEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return {
      startDate,
      endDate,
      quarter: Math.floor(currentMonth / 3) + 1,
      year: currentYear
    };
  };

  // Time period picker states - initialize with current calendar quarter
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

  // Get quarter dates based on quarter selection
  const getQuarterDates = (quarterValue) => {
    if (quarterValue === 'custom') {
      return null;
    }
    
    if (quarterValue === 'current') {
      return getCurrentFiscalQuarter();
    }
    
    const [quarter, year] = quarterValue.split('-');
    const yearNum = parseInt(year);
    
    let startMonth, endMonth;
    
    switch (quarter) {
      case 'Q1': startMonth = 0; endMonth = 2; break; // Jan-Mar
      case 'Q2': startMonth = 3; endMonth = 5; break; // Apr-Jun
      case 'Q3': startMonth = 6; endMonth = 8; break; // Jul-Sep
      case 'Q4': startMonth = 9; endMonth = 11; break; // Oct-Dec
      default: return getCurrentFiscalQuarter();
    }
    
    const startDate = `${yearNum}-${String(startMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(yearNum, endMonth + 1, 0).getDate();
    const endDate = `${yearNum}-${String(endMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return { startDate, endDate };
  };

  // Generate years for decade
  const generateDecadeYears = (decade) => {
    const years = [];
    for (let year = decade - 1; year <= decade + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const decadeYears = generateDecadeYears(currentDecade);
  const isYearInCurrentDecade = (year) => year >= currentDecade && year <= currentDecade + 9;

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

  // Navigate to current quarter
  const goToCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    let quarter;
    if (month >= 0 && month <= 2) quarter = 1;
    else if (month >= 3 && month <= 5) quarter = 2;
    else if (month >= 6 && month <= 8) quarter = 3;
    else quarter = 4;
    
    navigateToQuarter(quarter, year);
  };

  // Check if current quarter
  const isCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    let currentQuarter;
    if (month >= 0 && month <= 2) currentQuarter = 1;
    else if (month >= 3 && month <= 5) currentQuarter = 2;
    else if (month >= 6 && month <= 8) currentQuarter = 3;
    else currentQuarter = 4;
    
    return selectedQuarterNum === currentQuarter && selectedFiscalYear === year;
  };

  // Handle quarter selection
  const handleQuarterChange = (quarterValue) => {
    const quarterDates = getQuarterDates(quarterValue);
    
    if (quarterValue === 'custom') {
      setFilters(prev => ({ ...prev, selectedQuarter: quarterValue }));
      return;
    }
    
    if (quarterValue === 'current') {
      goToCurrentQuarter();
      return;
    }
    
    if (quarterDates) {
      const parsed = quarterValue.split('-');
      if (parsed.length === 2) {
        setSelectedQuarterNum(parseInt(parsed[0].replace('Q', '')));
        setSelectedFiscalYear(parseInt(parsed[1]));
      }
      
      setFilters(prev => ({
        ...prev,
        selectedQuarter: quarterValue,
        startDate: quarterDates.startDate,
        endDate: quarterDates.endDate
      }));
    }
  };

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

  // Form state
  const [filters, setFilters] = useState(() => {
    const fiscalQuarter = getCurrentFiscalQuarter();
    return {
      startDate: fiscalQuarter.startDate,
      endDate: fiscalQuarter.endDate,
      type: 'hiv',
      siteCode: '',
      selectedQuarter: 'current'
    };
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const sitesData = await siteApi.getAllSites();
      
      setSites(sitesData.sites || []);
      
      // Set default site if available
      if (sitesData.sites && sitesData.sites.length > 0) {
        setFilters(prev => ({
          ...prev,
          siteCode: sitesData.sites[0].siteCode || sitesData.sites[0].code
        }));
      }
    } catch (err) {
      setError('Failed to load initial data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = React.useCallback(async () => {
    if (!filters.siteCode) {
      setError('Please select a site');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the dates from filters (already calculated by quarter picker)
      const searchParams = {
        type: filters.type,
        siteCode: filters.siteCode,
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const results = await labTestApi.getTestResults(searchParams);
      
      // Handle results response
      if (results.success) {
        const testResultsData = results.data;
        if (Array.isArray(testResultsData)) {
          setTestResults(testResultsData);
        } else if (testResultsData && typeof testResultsData === 'object') {
          const possibleArray = testResultsData.results || testResultsData.data || testResultsData.items || [];
          setTestResults(Array.isArray(possibleArray) ? possibleArray : []);
        } else {
          setTestResults([]);
        }
      } else {
        setError(results.message || 'Failed to fetch lab test results');
        setTestResults([]);
      }
    } catch (err) {
      setError('Failed to fetch lab test results: ' + err.message);
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const result = await labTestApi.testConnection();
      
      if (result.success) {
        setConnectionModal({
          isOpen: true,
          success: true,
          message: 'Lab API connection is active and responding!'
        });
      } else {
        setConnectionModal({
          isOpen: true,
          success: false,
          message: result.message || 'Unable to establish connection. Please check the API endpoint.'
        });
      }
    } catch (err) {
      setConnectionModal({
        isOpen: true,
        success: false,
        message: err.message || 'Connection failed. Please verify the server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Helper functions
  
  // Classify viral load result
  const classifyViralLoad = (result1, result2) => {
    const value = parseFloat(result1 || result2);
    if (isNaN(value)) return { label: 'N/A', color: 'gray', bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: Minus };
    
    if (value === 0 || result1?.toLowerCase().includes('not detected')) {
      return { label: 'Not Detected', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: CheckCircle2 };
    }
    if (value < 20) {
      return { label: 'Suppressed', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: Check };
    }
    if (value < 1000) {
      return { label: '<1000', color: 'yellow', bgColor: 'bg-warning/10', textColor: 'text-warning-foreground', icon: AlertTriangle };
    }
    return { label: 'High VL', color: 'red', bgColor: 'bg-destructive/10', textColor: 'text-destructive', icon: XCircle };
  };
  
  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const total = filteredResults.length;
    let suppressed = 0;
    let highVL = 0;
    let notDetected = 0;
    let missingPhysician = 0;
    
    filteredResults.forEach(result => {
      const value = parseFloat(result.result1 || result.result2);
      
      if (!result.hospital_physician_name || result.hospital_physician_name === 'N/A') {
        missingPhysician++;
      }
      
      if (isNaN(value)) return;
      
      if (value === 0 || result.result1?.toLowerCase().includes('not detected')) {
        notDetected++;
      } else if (value < 20) {
        suppressed++;
      } else if (value >= 1000) {
        highVL++;
      }
    });
    
    return { total, suppressed: suppressed + notDetected, highVL, missingPhysician };
  };

  const formatResult = (result1, result2) => {
    if (result1 && result2) {
      return `${result1} / ${result2}`;
    }
    if (result1) return result1;
    if (result2) return result2;
    return 'N/A';
  };

  const filteredResults = testResults.filter(result => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      result.clinic_id?.toLowerCase().includes(searchLower) ||
      result.laboratory_id?.toLowerCase().includes(searchLower) ||
      result.hospital_physician_name?.toLowerCase().includes(searchLower) ||
      result.issued_by_user?.toLowerCase().includes(searchLower) ||
      result.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const exportResults = () => {
    const csvContent = [
      ['Lab ID', 'Clinic ID', 'Age', 'Sex', 'Test Type', 'Result 1', 'Result 2', 'Test Date', 'Physician'],
      ...testResults.map(result => [
        result.laboratory_id,
        result.clinic_id,
        result.age,
        result.sex,
        result.type,
        result.result1 || '',
        result.result2 || '',
        result.test_blood_dt,
        result.hospital_physician_name || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-results-${filters.startDate}-to-${filters.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Auto-search when component loads with default fiscal quarter
  React.useEffect(() => {
    if (sites.length > 0 && !filters.siteCode) {
      // Set the first site as default
      setFilters(prev => ({ ...prev, siteCode: sites[0].siteCode || sites[0].code }));
    }
  }, [sites]);

  // Auto-search only when component loads with default site
  React.useEffect(() => {
    if (filters.siteCode && sites.length > 0) {
      handleSearch();
    }
  }, [filters.siteCode, sites.length]);


  // Summary Stats Cards Component
  const SummaryCards = () => {
    const stats = calculateSummaryStats();
    const suppressionRate = stats.total > 0 ? ((stats.suppressed / stats.total) * 100).toFixed(1) : 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Tests */}
        <Card className="transition-all duration-300 border border-border border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stats.total}</h3>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TestTube className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Suppressed */}
        <Card className="transition-all duration-300 border border-border border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suppressed</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{stats.suppressed}</h3>
                <p className="text-xs text-primary font-medium mt-1">{suppressionRate}% rate</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* High Viral Load */}
        <Card className="transition-all duration-300 border border-border border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High VL</p>
                <h3 className="text-3xl font-bold text-destructive mt-2">{stats.highVL}</h3>
                <p className="text-xs text-destructive mt-1">&gt;1000 copies</p>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Missing Physician */}
        <Card className="transition-all duration-300 border border-border border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missing Physician</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">{stats.missingPhysician}</h3>
                <p className="text-xs text-amber-600 mt-1">Need assignment</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Time Period Filter Panel Component
  const FilterPanel = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters
              </CardTitle>
              <CardDescription>
                Filter lab test results by site and time period
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
                value={filters.siteCode}
                onValueChange={(value) => setFilters(prev => ({ ...prev, siteCode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent className="bg-background backdrop-blur-sm">
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
                value={filters.type}
                onValueChange={async (value) => {
                  setFilters(prev => ({ ...prev, type: value }));
                  // Trigger search with the new type
                  if (filters.siteCode && sites.length > 0) {
                    try {
                      setLoading(true);
                      setError(null);
                      
                      const searchParams = {
                        type: value, // Use the new value directly
                        siteCode: filters.siteCode,
                        startDate: filters.startDate,
                        endDate: filters.endDate
                      };
                      
                      const results = await labTestApi.getTestResults(searchParams);
                      
                      if (results.success) {
                        const testResultsData = results.data;
                        if (Array.isArray(testResultsData)) {
                          setTestResults(testResultsData);
                        } else if (testResultsData && typeof testResultsData === 'object') {
                          const possibleArray = testResultsData.results || testResultsData.data || testResultsData.items || [];
                          setTestResults(Array.isArray(possibleArray) ? possibleArray : []);
                        } else {
                          setTestResults([]);
                        }
                      } else {
                        setError(results.message || 'Failed to fetch test results');
                        setTestResults([]);
                      }
                    } catch (err) {
                      setError('Failed to fetch test results: ' + err.message);
                      setTestResults([]);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent className="bg-background backdrop-blur-sm">
                  <SelectItem value="hiv">HIV Viral Load</SelectItem>
                  <SelectItem value="cd4">CD4 Count</SelectItem>
                  <SelectItem value="viral_load">Viral Load</SelectItem>
                  <SelectItem value="hepatitis">Hepatitis</SelectItem>
                  <SelectItem value="syphilis">Syphilis</SelectItem>
                  <SelectItem value="tb">TB Test</SelectItem>
                  <SelectItem value="dna">DNA Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Elegant Period Picker - Popup Style */}
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="relative ">
                <div className="relative">
                  <input
                    type="text"
                    value={filters.selectedQuarter === 'custom' 
                      ? 'Custom Range' 
                      : `${selectedFiscalYear}-Q${selectedQuarterNum}`}
                    readOnly
                    className="w-full h-9 px-3 pr-10 text-sm border border-border rounded-md cursor-pointer transition-colors"
                    onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CalendarIcon className="w-4 h-4 text-primary" />
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
                        {selectedFiscalYear}
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
                                  : 'text-muted-foreground hover:text-muted-foreground hover:bg-muted'
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
                    startDate: fiscalQuarter.startDate,
                    endDate: fiscalQuarter.endDate,
                    type: 'hiv',
                    siteCode: filters.siteCode,
                    selectedQuarter: 'current'
                  });
                  goToCurrentQuarter();
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
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
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
                
                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="0-14">0-14 years</SelectItem>
                      <SelectItem value="15-24">15-24 years</SelectItem>
                      <SelectItem value="25-49">25-49 years</SelectItem>
                      <SelectItem value="50+">50+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Result Type */}
                <div className="space-y-2">
                  <Label>Result Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="suppressed">Suppressed (&lt;20)</SelectItem>
                      <SelectItem value="high">High VL (&gt;1000)</SelectItem>
                      <SelectItem value="not_detected">Not Detected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Pagination Component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-end gap-4 px-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedResults.length)} of {sortedResults.length} results
        </p>
        <div className="flex items-center space-x-2">
          <Label htmlFor="itemsPerPage" className="text-sm">Rows per page:</Label>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
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
          
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => (
              page === '...' ? (
                <span key={index} className="px-2 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )
            ))}
          </div>
          
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
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TestTube className="h-8 w-8 text-primary" />
              Laboratory Test Results
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive lab test management and analysis system
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
            {testResults.length > 0 && (
              <Button onClick={exportResults} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
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


          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Filter Panel */}
            <FilterPanel />
            
            {/* Summary Cards */}
            {testResults.length > 0 && !loading && <SummaryCards />}

            {/* Results Table */}
            <Card className="border border-border">
              <div className="flex flex-col sm:flex-row gap-4 px-6 py-4 bg-muted/30 border-b border-border">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="🔍 Search by clinic ID, lab ID, physician, or patient name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border border-border rounded-md focus:border-primary focus:ring-2 focus:ring-ring/20 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-background border-border rounded-md">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background backdrop-blur-sm">
                      <SelectItem value="test_blood_dt">📅 Test Date</SelectItem>
                      <SelectItem value="laboratory_id">🔬 Lab ID</SelectItem>
                      <SelectItem value="clinic_id">🏥 Clinic ID</SelectItem>
                      <SelectItem value="age">👤 Age</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="bg-background border-border rounded-md"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    <TrendingUp className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Test Results
                  {sortedResults.length > 0 && (
                    <Badge variant="secondary">
                      {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
                      {searchTerm && (
                        <span className="ml-1 text-xs">(filtered)</span>
                      )}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-none" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedResults.length === 0 ? (
                  <div className="text-center py-12">
                    <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria or date range.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted z-10">
                          <TableRow className="hover:bg-muted">
                            {visibleColumns.lab_id && (
                              <TableHead className="font-semibold">Lab ID</TableHead>
                            )}
                            {visibleColumns.clinic_id && (
                              <TableHead className="font-semibold">Clinic ID</TableHead>
                            )}
                            {visibleColumns.patient && (
                              <TableHead className="font-semibold">Patient</TableHead>
                            )}
                            {visibleColumns.test_type && (
                              <TableHead className="font-semibold">Test Type</TableHead>
                            )}
                            {visibleColumns.results && (
                              <TableHead className="font-semibold">Results</TableHead>
                            )}
                            <TableHead className="font-semibold">Status</TableHead>
                            {visibleColumns.test_date && (
                              <TableHead className="font-semibold">Test Date</TableHead>
                            )}
                            {visibleColumns.physician && (
                              <TableHead className="font-semibold">Physician</TableHead>
                            )}
                            {visibleColumns.actions && (
                              <TableHead className="font-semibold">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedResults.map((result, index) => {
                            const classification = classifyViralLoad(result.result1, result.result2);
                            const isAnomalous = !result.hospital_physician_name || result.hospital_physician_name === 'N/A';
                            const StatusIcon = classification.icon;
                            
                            return (
                              <TableRow 
                                key={index} 
                                className={`
                                  ${classification.bgColor} 
                                  hover:brightness-95 
                                  transition-all duration-200
                                  cursor-pointer
                                  ${index % 2 === 0 ? 'bg-opacity-30' : 'bg-opacity-50'}
                                  ${isAnomalous ? 'border-l-4 border-l-warning' : ''}
                                `}
                                onClick={() => setQuickViewDrawer({ isOpen: true, data: result })}
                              >
                                {visibleColumns.lab_id && (
                                  <TableCell className="font-medium font-mono text-sm">
                                    {result.laboratory_id}
                                  </TableCell>
                                )}
                                {visibleColumns.clinic_id && (
                                  <TableCell className="font-mono text-sm">{result.clinic_id}</TableCell>
                                )}
                                {visibleColumns.patient && (
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-sm">{result.age}y, {result.sex}</div>
                                        {result.full_name && (
                                          <div className="text-xs text-muted-foreground">{result.full_name}</div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                )}
                                {visibleColumns.test_type && (
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {result.type?.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                )}
                                {visibleColumns.results && (
                                  <TableCell className="font-mono text-sm font-semibold">
                                    {formatResult(result.result1, result.result2)}
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Badge className={`${classification.bgColor} ${classification.textColor} border-0 gap-1 font-medium`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {classification.label}
                                  </Badge>
                                </TableCell>
                                {visibleColumns.test_date && (
                                  <TableCell>
                                    <div className="flex items-center gap-2 text-sm">
                                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatDate(result.test_blood_dt)}</span>
                                    </div>
                                  </TableCell>
                                )}
                                {visibleColumns.physician && (
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {!result.hospital_physician_name || result.hospital_physician_name === 'N/A' ? (
                                        <>
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                          <span className="text-sm text-amber-600 font-medium">Not Assigned</span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Stethoscope className="h-4 w-4 text-primary" />
                                          </div>
                                          <span className="text-sm font-medium">
                                            {result.hospital_physician_name}
                                          </span>
                                        </>
                                      )}
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
                                        setQuickViewDrawer({ isOpen: true, data: result });
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
                    
                    {/* Pagination */}
                     <div className="flex mt-4 items-center justify-between py-4">
                      <PaginationComponent />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Analytics</CardTitle>
                <CardDescription>
                  Comprehensive analysis of laboratory test results and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
                  <p className="text-sm text-muted-foreground">Lab ID: {quickViewDrawer.data.laboratory_id}</p>
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
                        <p className="font-medium">{quickViewDrawer.data.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {quickViewDrawer.data.age} years, {quickViewDrawer.data.sex}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Clinic ID</p>
                        <p className="font-mono font-medium">{quickViewDrawer.data.clinic_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lab ID</p>
                        <p className="font-mono font-medium">{quickViewDrawer.data.laboratory_id}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Test Results */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Test Results</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Test Type</span>
                      <Badge variant="outline">{quickViewDrawer.data.type?.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Result</span>
                      <span className="font-mono font-bold text-lg">
                        {formatResult(quickViewDrawer.data.result1, quickViewDrawer.data.result2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {(() => {
                        const classification = classifyViralLoad(quickViewDrawer.data.result1, quickViewDrawer.data.result2);
                        const StatusIcon = classification.icon;
                        return (
                          <Badge className={`${classification.bgColor} ${classification.textColor} border-0 gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {classification.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Test Date</span>
                      <span className="text-sm font-medium">{formatDate(quickViewDrawer.data.test_blood_dt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Physician Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Physician</h4>
                  <div className="bg-muted rounded-lg p-4">
                    {!quickViewDrawer.data.hospital_physician_name || quickViewDrawer.data.hospital_physician_name === 'N/A' ? (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">No physician assigned</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{quickViewDrawer.data.hospital_physician_name}</p>
                          <p className="text-sm text-muted-foreground">Attending Physician</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      View Patient Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Assign Physician
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Connection Test Modal */}
      <Dialog open={connectionModal.isOpen} onOpenChange={(open) => setConnectionModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              {/* Animated Icon */}
              <div className={`relative ${connectionModal.success ? 'animate-bounce' : 'animate-pulse'}`}>
                <div className={`absolute inset-0 rounded-full ${connectionModal.success ? 'bg-primary/10' : 'bg-destructive/10'} blur-xl opacity-70 animate-pulse`}></div>
                <div className={`relative rounded-full p-4 ${connectionModal.success ? 'bg-primary/10' : 'bg-destructive/10'} border-2 ${connectionModal.success ? 'border-primary/30' : 'border-destructive/30'}`}>
                  {connectionModal.success ? (
                    <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={2} />
                  ) : (
                    <XCircle className="h-16 w-16 text-destructive" strokeWidth={2} />
                  )}
                </div>
              </div>
              
              {/* Title */}
              <DialogTitle className={`text-2xl font-bold text-center ${connectionModal.success ? 'text-primary' : 'text-destructive'}`}>
                {connectionModal.success ? 'Connection Successful!' : 'Connection Failed'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {/* Message */}
          <div className="py-4">
            <DialogDescription className="text-center text-base text-muted-foreground leading-relaxed">
              {connectionModal.message}
            </DialogDescription>
            
            {/* Additional Info */}
            {connectionModal.success && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Status
                  </span>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-primary" />
                    Endpoint
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">Lab API</span>
                </div>
              </div>
            )}
            
            {!connectionModal.success && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">
                  <strong>Troubleshooting:</strong>
                </p>
                <ul className="mt-2 text-sm text-destructive space-y-1 list-disc list-inside">
                  <li>Verify the backend server is running</li>
                  <li>Check your network connection</li>
                  <li>Confirm API endpoint configuration</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setConnectionModal(prev => ({ ...prev, isOpen: false }))}
              className={`w-full sm:w-auto px-8 ${
                connectionModal.success 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-destructive hover:bg-destructive/90'
              }`}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTestResults;
