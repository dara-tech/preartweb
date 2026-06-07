import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YearlyAnalytics from '../../components/analytics/YearlyAnalytics';
import analyticsApi from '../../services/analyticsApi';
import api from '../../services/api';
import { 
  RefreshCw,
  Activity,
  Download,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Database,
  Filter,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import { NCHADS_INDICATOR_KHMER } from '../../config/nchadsIndicatorLabels';

// Function to get bilingual indicator names (Khmer/English) - same as IndicatorsTable
const getDisplayIndicatorName = (backendName) => {
  const nameMap = {
    '1. Active ART patients in previous quarter': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
    '2. Active Pre-ART patients in previous quarter': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
    '3. Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
    '4. Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
    '5. Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
    '5.1.1. New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
    '5.1.2. New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
    '5.1.3. New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
    '5.2. New ART started with TLD': '5.2. ចំនួនអ្នកជំងឹចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
    '5.3. New ART patients who are pregnant': '5.3. ចំនួនអ្នកជំងឺ ART ថ្មីដែលមានផ្ទៃពោះ (Number of new ART patients who are pregnant)',
    '6. Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
    '7. Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
    '7.1. In the same ART site': '7.1. នៅក្នុងសេវា ART តែមួយ (In the same ART site)',
    '7.2. From other ART site': '7.2. មកពីសេវា ART ផ្សេង (From other ART site)',
    ...NCHADS_INDICATOR_KHMER
  };
  return nameMap[backendName] || backendName;
};

const AnalyticsAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    // Always use the last completed quarter
    const lastCompletedQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const lastCompletedYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    
    return {
      indicatorId: 'all',
      siteCode: 'all',
      periodType: 'quarterly',
      periodQuarter: lastCompletedQuarter,
      periodYear: lastCompletedYear.toString()
    };
  });

  // Time picker states
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [currentDecade, setCurrentDecade] = useState(2020);
  const pickerRef = useRef(null);

  // Helper functions for time picker
  const generateDecadeYears = () => {
    const years = [];
    for (let i = currentDecade; i < currentDecade + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const decadeYears = generateDecadeYears();

  const isYearAvailable = (year) => {
    return years.some(y => y.period_year === year);
  };

  const isYearInCurrentDecade = (year) => {
    return year >= currentDecade && year < currentDecade + 10;
  };

  const availableQuarters = [
    { value: 1, label: 'Q1', disabled: false },
    { value: 2, label: 'Q2', disabled: false },
    { value: 3, label: 'Q3', disabled: false },
    { value: 4, label: 'Q4', disabled: false }
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPeriodPickerOpen(false);
        setShowYearGrid(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Time picker handlers
  const onYearChange = (year) => {
    setFilters({...filters, periodYear: year});
    setShowYearGrid(false);
  };

  const onQuarterChange = (quarter) => {
    setFilters({...filters, periodQuarter: parseInt(quarter)});
    setIsPeriodPickerOpen(false);
    setShowYearGrid(false);
  };

  // Fetch analytics summary
  const fetchSummary = async () => {
    try {
      const data = await analyticsApi.getAnalyticsSummary();
      
      if (data.success) {
        setSummary(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch analytics summary');
      }
    } catch (err) {
      setError('Failed to connect to analytics service');
      console.error('Analytics summary error:', err);
    }
  };

  // Fetch analytics data with filters
  const fetchAnalyticsData = async (overrideFilters = null) => {
    try {
      setLoading(true);
      const appliedFilters = overrideFilters || filters;
      
      // Process filters to handle "all" values
      const processedFilters = {
        indicatorId: appliedFilters.indicatorId === 'all' ? '' : appliedFilters.indicatorId,
        siteCode: appliedFilters.siteCode === 'all' ? '' : appliedFilters.siteCode,
        periodType: appliedFilters.periodType,
        periodQuarter: appliedFilters.periodQuarter === 'all' ? '' : appliedFilters.periodQuarter,
        periodYear: appliedFilters.periodYear === 'all' ? '' : appliedFilters.periodYear
      };
      
      console.log('🔍 Analytics Admin - Fetching data with filters:', processedFilters);

      const data = await analyticsApi.getAllAnalyticsData(processedFilters);
      

      
      if (data.success) {
        setAnalyticsData(data.data);
        setError(null);
        console.log('🔍 Analytics Admin - Set analytics data:', data.data.length, 'records');
      } else {
        setError(data.message || 'Failed to fetch analytics data');
        console.error('🔍 Analytics Admin - API error:', data.message);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('🔍 Analytics Admin - Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  // Download SQL Workbench folder as zip
  const [downloadingWorkbench, setDownloadingWorkbench] = useState(false);
  const downloadSqlWorkbench = async () => {
    try {
      setDownloadingWorkbench(true);
      const res = await api.get('/apiv1/scripts/scripts/download-sql-workbench', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sql-workbench.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download sql-workbench failed:', err);
      const msg = err.response?.data instanceof Blob
        ? 'Download failed (check console)'
        : (err.response?.data?.message || err.message || 'Failed to download sql-workbench');
      alert(msg);
    } finally {
      setDownloadingWorkbench(false);
    }
  };

  // Export analytics data
  const exportAnalyticsData = () => {
    const csvContent = [
      ['Indicator ID', 'Indicator Name', 'Site Code', 'Site Name', 'Period Type', 'Period Year', 'Period Quarter', 'Total', 'Male 0-14', 'Female 0-14', 'Male 15+', 'Female 15+', 'Status', 'Last Updated'],
      ...analyticsData.map(record => [
        record.indicator_id,
        record.indicator_name,
        record.site_code,
        record.site_name,
        record.period_type,
        record.period_year,
        record.period_quarter || '',
        record.total,
        record.male_0_14,
        record.female_0_14,
        record.male_over_14,
        record.female_over_14,
        record.calculation_status,
        new Date(record.last_updated).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear cache function (now includes auto-increment reset)
  const clearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached analytics data and reset auto-increment IDs? This action cannot be undone.')) {
      try {
        // Clear cache first
        const clearResponse = await analyticsApi.clearCache();
        
        if (clearResponse.success) {
          // Then reset auto-increment IDs
          const resetResponse = await analyticsApi.resetAutoIncrement();
          
          if (resetResponse.success) {
            alert('Cache cleared and auto-increment IDs reset successfully!');
            // Refresh the data
            fetchAnalyticsData();
            fetchSummary();
          } else {
            alert('Cache cleared but failed to reset auto-increment IDs');
            // Still refresh data since cache was cleared
            fetchAnalyticsData();
            fetchSummary();
          }
        } else {
          alert('Failed to clear cache');
        }
      } catch (error) {
        console.error('Error clearing cache and resetting IDs:', error);
        alert('Error clearing cache and resetting IDs');
      }
    }
  };


  // Fetch sites for dropdown
  const fetchSites = async () => {
    try {
      const data = await analyticsApi.getAnalyticsSites();
      if (data.success) {
        setSites(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sites:', err);
    }
  };

  // Fetch available indicators
  const fetchIndicators = async () => {
    try {
      const data = await analyticsApi.getAnalyticsIndicators();
      if (data.success) {
        setIndicators(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch indicators:', err);
    }
  };

  // Fetch available years from analytics data
  const fetchYears = async () => {
    try {
      const data = await analyticsApi.getAnalyticsYears();
      if (data.success) {
        setYears(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch years:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchAnalyticsData();
    fetchSites();
    fetchIndicators();
    fetchYears();
  }, []);

  useEffect(() => {
    const nextFilters = {
      indicatorId: searchParams.get('indicator') || 'all',
      siteCode: searchParams.get('site') || 'all',
      periodType: 'quarterly',
      periodQuarter: searchParams.get('quarter') || filters.periodQuarter,
      periodYear: searchParams.get('year') || filters.periodYear,
    };
    setFilters(nextFilters);
  }, [searchParams]);

  useEffect(() => {
    const applyFilters = () => {
      fetchAnalyticsData(filters);
      fetchSummary();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('analytics-apply-filters', applyFilters);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('analytics-apply-filters', applyFilters);
      }
    };
  }, [filters]);


  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin"></div>
            <BarChart3 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Loading analytics...</p>
            <p className="text-sm text-muted-foreground">Preparing your data insights...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeView = searchParams.get('view') || 'data';

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-background p-4 space-y-4">
      <Tabs value={activeView} className="w-full flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex justify-between items-center bg-card p-2 border border-border rounded-none shadow-sm shrink-0">
          <TabsList className="grid grid-cols-2 max-w-sm rounded-none bg-muted/50 p-1">
            <TabsTrigger 
              value="data" 
              onClick={() => setSearchParams({ view: 'data' })}
              className="rounded-none text-xs font-semibold py-1.5 px-4 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Analytics Data
            </TabsTrigger>
            <TabsTrigger 
              value="yearly" 
              onClick={() => setSearchParams({ view: 'yearly' })}
              className="rounded-none text-xs font-semibold py-1.5 px-4 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Yearly Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Enhanced Analytics Data Tab */}
        <TabsContent value="data" className="flex-1 flex flex-col min-h-0 space-y-3 data-[state=inactive]:hidden">
          {true && (
          <Card className="border border-border bg-card shadow-none rounded-none">
            <CardHeader className="pb-4 border-b border-border bg-muted/10">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs font-bold text-foreground">Data Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Indicator Filter */}
                <div className="space-y-2">
                
                  <Select value={filters.indicatorId} onValueChange={(value) => setFilters({...filters, indicatorId: value})}>
                    <SelectTrigger className="h-8 w-full bg-background border border-border text-xs">
                      <SelectValue placeholder="សុចនាករ Indicator" />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto max-h-48 bg-background border border-border">
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-none"></div>
                          <span>សុចនាករទាំងអស់ All Indicators</span>
                        </div>
                      </SelectItem>
                      {indicators.map((indicator) => (
                        <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                          {getDisplayIndicatorName(indicator.indicator_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Site Filter */}
                <div className="space-y-2">
                 
                  <Select value={filters.siteCode} onValueChange={(value) => setFilters({...filters, siteCode: value})}>
                    <SelectTrigger className="h-8 w-full bg-background border border-border text-xs">
                      <SelectValue placeholder="Site" />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto max-h-48 scrollbar-hide bg-background border border-border">
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-none"></div>
                          <span>All Sites</span>
                        </div>
                      </SelectItem>
                      {sites.map((site) => (
                        <SelectItem key={site.site_code} value={site.site_code}>
                          <div className="flex flex-col">
                            <span className="font-medium">{site.site_name}</span>
                            <span className="text-xs text-muted-foreground">{site.site_code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Time Picker */}
                <div className="space-y-2">
                
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.periodYear === 'all' ? 'All Years' : `${filters.periodYear}-Q${filters.periodQuarter}`}
                      readOnly
                      className="w-full h-8 px-2.5 pr-8 text-xs bg-background border border-border rounded-none cursor-pointer"
                      onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>

                    {/* Enhanced Period Picker Panel */}
                    {isPeriodPickerOpen && (
                      <div ref={pickerRef} className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-none p-3 min-w-[320px]">
                        {/* Year Navigation */}
                        <div className="flex items-center justify-between mb-6">
                          <Button
                            type="button"
                            onClick={() => setCurrentDecade(currentDecade - 10)}
                            variant="ghost"
                            size="sm"
                            className="p-1 rounded-none"
                          >
                            <ChevronLeft className="w-4 h-4 text-primary" />
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => setShowYearGrid(!showYearGrid)}
                            variant="ghost"
                            className="px-3 py-1 text-sm font-medium hover:text-primary rounded-none cursor-pointer"
                          >
                            {filters.periodYear === 'all' ? 'All Years' : filters.periodYear}
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => setCurrentDecade(currentDecade + 10)}
                            variant="ghost"
                            size="sm"
                            className="p-1 rounded-none"
                          >
                            <ChevronRight className="w-4 h-4 text-primary" />
                          </Button>
                        </div>

                        {/* Year Grid - Conditionally Visible */}
                        {showYearGrid && (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <Button
                              key="all"
                              type="button"
                              onClick={() => onYearChange('all')}
                              variant={filters.periodYear === 'all' ? "default" : "ghost"}
                              size="sm"
                              className={`
                                px-2.5 py-1.5 text-xs rounded-none transition-colors
                                ${filters.periodYear === 'all'
                                  ? ' text-primary-foreground'
                                  : 'text-foreground hover:bg-muted hover:border-border'
                                }
                              `}
                            >
                              All
                            </Button>
                            {decadeYears.map((year) => {
                              const isSelected = year.toString() === filters.periodYear;
                              const isAvailable = isYearAvailable(year);
                              const isCurrentYear = year === new Date().getFullYear();
                              const isInCurrentDecade = isYearInCurrentDecade(year);
                              
                              return (
                                <Button
                                  key={year}
                                  type="button"
                                  onClick={() => {
                                    if (isAvailable) {
                                      onYearChange(year.toString());
                                    }
                                  }}
                                  disabled={!isAvailable}
                                  variant={isSelected ? "default" : "ghost"}
                                  size="sm"
                                  className={`
                                    px-2.5 py-1.5 text-xs rounded-none transition-colors relative
                                    ${isSelected
                                      ? ' text-primary-foreground'
                                      : isCurrentYear && isAvailable && isInCurrentDecade
                                      ? 'bg-muted text-foreground border border-border hover:bg-muted/80'
                                      : isAvailable && isInCurrentDecade
                                      ? 'text-foreground hover:bg-muted hover:border-border'
                                      : isAvailable && !isInCurrentDecade
                                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                      : 'text-muted-foreground/50 cursor-not-allowed'
                                    }
                                  `}
                                >
                                  {year}
                                  {isCurrentYear && isAvailable && !isSelected && isInCurrentDecade && (
                                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-none"></div>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        )}

                        {/* Quarter Selection */}
                        <div className="grid grid-cols-4 gap-2">
                          {availableQuarters.map(quarter => (
                            <Button
                              key={quarter.value}
                              type="button"
                              onClick={() => onQuarterChange(quarter.value.toString())}
                              disabled={quarter.disabled}
                              variant={filters.periodQuarter === quarter.value ? "default" : "outline"}
                              size="sm"
                              className={`
                                px-3 py-1.5 text-xs rounded-none transition-colors font-medium
                                ${filters.periodQuarter === quarter.value
                                  ? ' text-primary-foreground'
                                  : quarter.disabled
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                  : 'bg-background text-foreground hover:bg-muted hover:border-border'
                                }
                              `}
                            >
                              Q{quarter.value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 md:col-span-2 lg:col-span-2">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={fetchAnalyticsData} 
                      disabled={loading} 
                      className="flex-1 text-primary-foreground"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Apply Filters
                    </Button>
                    <Button 
                      onClick={clearCache} 
                      variant="outline" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" 
                      title="Clear cache and reset auto-increment IDs"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear & Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Data Table */}
          <Card className="border border-border shadow-none rounded-none">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-muted/20 border-b border-border">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-foreground">សុចនាករ Indicator</th>
                      <th className="text-left px-3 py-2 font-medium text-foreground">កន្លែង Site</th>
                      <th className="text-left px-3 py-2 font-medium text-foreground">រយៈពេល Period</th>
                      <th className="text-right px-3 py-2 font-medium text-foreground">សរុប Total</th>
                      <th className="text-center px-3 py-2 font-medium text-foreground">ស្ថានភាព Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-none animate-spin"></div>
                            </div>
                            <p className="text-muted-foreground">Loading analytics data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : analyticsData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-10 h-10 bg-muted/30 rounded-none flex items-center justify-center">
                              <Search className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">No data found</p>
                              <p className="text-muted-foreground">Try adjusting your filters to see results</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      analyticsData.map((record) => (
                        <tr key={record.id} className="border-b border-border bg-background hover:bg-muted/15 transition-colors">
                          <td className="px-3 py-2 align-top">
                            <div className="space-y-0.5">
                              <div className="font-medium text-foreground leading-tight">{getDisplayIndicatorName(record.indicator_name)}</div>
                              <div className="text-[11px] text-muted-foreground">{record.indicator_id}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="space-y-0.5">
                              <div className="font-medium text-foreground">{record.site_name}</div>
                              <div className="text-[11px] text-muted-foreground">{record.site_code}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="space-y-0.5">
                              <div className="font-medium text-foreground">{record.period_type} {record.period_year}</div>
                              <div className="text-[11px] text-primary">
                                Q{record.period_quarter}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right align-top">
                            <div className="space-y-0.5">
                              <div className="text-sm font-semibold text-foreground">{record.total.toLocaleString()}</div>
                              <div className="text-[11px] text-muted-foreground">
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 mr-1">M: {record.male_0_14 + record.male_over_14}</span>
                                <span className="bg-muted text-muted-foreground px-1.5 py-0.5">F: {record.female_0_14 + record.female_over_14}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-top">
                            <Badge 
                              variant={record.calculation_status === 'completed' ? 'default' : 'secondary'} 
                              className={`text-[11px] font-medium px-1.5 py-0.5 ${
                                record.calculation_status === 'completed' 
                                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {record.calculation_status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Analytics Tab */}
        <TabsContent value="yearly" className="flex-1 space-y-4 data-[state=inactive]:hidden">
          <YearlyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsAdmin;
