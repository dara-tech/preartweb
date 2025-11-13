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
  Stethoscope
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
        alert('Lab API connection successful!');
      } else {
        alert(`Lab API connection failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Lab API connection failed: ' + err.message);
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


  // Time Period Filter Panel Component
  const FilterPanel = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <CardDescription>
            Filter lab test results by site and time period
          </CardDescription>
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
                        <MapPin className="h-4 w-4 text-gray-400" />
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
                    className="w-full h-9 px-3 pr-10 text-sm border shadow-sm  rounded-none cursor-pointer transition-colors "
                    onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* Custom Period Picker Panel */}
                {isPeriodPickerOpen && (
                  <div ref={pickerRef} className="absolute top-full left-0 right-0 z-50 mt-2 bg-background backdrop-blur-sm border border-border rounded-none shadow-xl p-6 min-w-[320px]">
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
                        className="px-4 py-2 text-base font-semibold hover:text-blue-500 rounded-none transition-colors cursor-pointer"
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
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : isCurrentYear && isInCurrentDecade
                                  ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                  : isInCurrentDecade
                                  ? 'text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }
                              `}
                            >
                              {year}
                              {isCurrentYear && !isSelected && isInCurrentDecade && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-none"></div>
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
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300'
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
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
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
    <div >
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laboratory Test Results</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive lab test management and analysis system
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>


          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Filter Panel */}
            <FilterPanel />

            {/* Results Table */}
            <Card>
            <div className="flex flex-col sm:flex-row gap-4 px-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by clinic ID, lab ID, physician, or staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-background backdrop-blur-sm">
                        <SelectItem value="test_blood_dt">Test Date</SelectItem>
                        <SelectItem value="laboratory_id">Lab ID</SelectItem>
                        <SelectItem value="clinic_id">Clinic ID</SelectItem>
                        <SelectItem value="age">Age</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <TrendingUp className="h-4 w-4" />
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
                    <TestTube className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or date range.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-none border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lab ID</TableHead>
                            <TableHead>Clinic ID</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Test Type</TableHead>
                            <TableHead>Results</TableHead>
                            <TableHead>Test Date</TableHead>
                            <TableHead>Physician</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {result.laboratory_id}
                            </TableCell>
                            <TableCell>{result.clinic_id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">{result.age}y, {result.sex}</div>
                                  {result.full_name && (
                                    <div className="text-sm text-gray-500">{result.full_name}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{result.type?.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {formatResult(result.result1, result.result2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                {formatDate(result.test_blood_dt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {result.hospital_physician_name || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
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
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-500">
                    Advanced analytics and reporting features will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LabTestResults;
