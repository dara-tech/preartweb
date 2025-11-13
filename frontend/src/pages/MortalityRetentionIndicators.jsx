import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import siteApi from '../services/siteApi';
import mortalityRetentionApi from '../services/mortalityRetentionApi';
import { useAuth } from '../contexts/AuthContext';
import {
  ReportHeader,
  ReportConfiguration,
  generateAvailableYears,
  generateAvailableQuarters,
  getDateRangeForYearQuarter,
} from '../components/indicators';

const MortalityRetentionIndicators = () => {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isLoadingRef = useRef(false);
  
  // Check if user is a viewer (read-only access)
  const isViewer = user?.role === 'viewer';
  // Check if user is super admin (can print reports)
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    previousEndDate: '2024-12-31'
  });
  
  // Year and Quarter selection
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    return currentQuarter === 1 ? currentYear - 1 : currentYear;
  });
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    return currentQuarter === 1 ? 4 : currentQuarter - 1;
  });
  
  // Site filtering
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [sitesLoading, setSitesLoading] = useState(false);

  // Generate available years and quarters
  const availableYears = generateAvailableYears();
  const availableQuarters = generateAvailableQuarters(selectedYear);

  // Handle year and quarter changes
  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
    const newQuarter = 1; // Reset to Q1 when year changes
    setSelectedQuarter(newQuarter);
    
    const { startDate, endDate, previousEndDate } = getDateRangeForYearQuarter(year, newQuarter);
    setDateRange({ startDate, endDate, previousEndDate });
  }, []);

  const handleQuarterChange = useCallback((quarter) => {
    setSelectedQuarter(quarter);
    
    const { startDate, endDate, previousEndDate } = getDateRangeForYearQuarter(selectedYear, quarter);
    setDateRange({ startDate, endDate, previousEndDate });
  }, [selectedYear]);

  // Load sites
  useEffect(() => {
    const loadSites = async () => {
      setSitesLoading(true);
      try {
        const response = await siteApi.getAllSites();
        // Handle different response structures
        const sites = response.sites || response.data || response || [];
        setSites(sites);
        
        // Auto-select first site
        if (sites && sites.length > 0) {
          setSelectedSite(sites[0]);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
        setError('Failed to load sites. Please refresh the page.');
      } finally {
        setSitesLoading(false);
      }
    };

    loadSites();
  }, []);

  // Fetch mortality and retention indicators
  const fetchMortalityRetentionIndicators = useCallback(async () => {
    if (!selectedSite || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        siteCode: selectedSite.site_code || selectedSite.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      };

      console.log('Fetching mortality indicators with params:', params);

      // Use the dedicated mortality retention API to get all indicators at once
      const siteCode = selectedSite.code || selectedSite.site_code || selectedSite.id;
      console.log('Using site code:', siteCode, 'from site:', selectedSite);
      console.log('API URL will be:', `/apiv1/mortality-retention-indicators/sites/${siteCode}`);
      
      const response = await mortalityRetentionApi.getAllIndicators(siteCode, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      });
      
      if (response.data && Array.isArray(response.data)) {
        // The API returns data directly in the data array
        const transformedData = response.data.filter(item => item && item.Indicator);
        
        setIndicators(transformedData);
        console.log('Loaded indicators:', transformedData.length);
        console.log('Sample indicator data:', transformedData[0]);
      } else {
        console.log('No data received from API. Response structure:', response);
        setIndicators([]);
      }
      
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error fetching mortality and retention indicators:', error);
      setError(`Failed to load mortality and retention indicators: ${error.message}`);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedSite, dateRange]);

  // Fetch data when site selection or date range changes
  useEffect(() => {
    if (!selectedSite) return;
    
    // For initial load, fetch immediately
    if (isInitialLoad) {
      fetchMortalityRetentionIndicators();
      return;
    }
    
    // For subsequent changes, debounce the fetch
      const timeoutId = setTimeout(() => {
        fetchMortalityRetentionIndicators();
      }, 300);

      return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSite, dateRange.startDate, dateRange.endDate, dateRange.previousEndDate, isInitialLoad]);

  const handleRefresh = () => {
    setIndicators([]);
    fetchMortalityRetentionIndicators();
  };

  const exportToCSV = () => {
    if (indicators.length === 0) return;
    
    const csvContent = [
      ['Indicator', 'Value', 'Percentage', 'Male 0-14', 'Female 0-14', 'Male 15+', 'Female 15+'],
      ...indicators.map(indicator => [
        indicator.Indicator || 'N/A',
        indicator.TOTAL || indicator.Deaths || indicator.Lost_to_Followup || indicator.Reengaged_Within_28 || 'N/A',
        indicator.Percentage || 'N/A',
        indicator.Male_0_14 || indicator.Male_0_14_Deaths || indicator.Male_0_14_Lost || '0',
        indicator.Female_0_14 || indicator.Female_0_14_Deaths || indicator.Female_0_14_Lost || '0',
        indicator.Male_over_14 || indicator.Male_over_14_Deaths || indicator.Male_over_14_Lost || '0',
        indicator.Female_over_14 || indicator.Female_over_14_Deaths || indicator.Female_over_14_Lost || '0'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortality-retention-indicators-${selectedSite?.name || 'all-sites'}-${selectedYear}-Q${selectedQuarter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getIndicatorCategory = (indicatorName) => {
    if (indicatorName.includes('died') || indicatorName.includes('lost') || indicatorName.includes('reengaged')) {
      return { category: 'Mortality & Re-engagement', color: 'bg-red-100 text-red-800' };
    }
    if (indicatorName.includes('visit') || indicatorName.includes('schedule') || indicatorName.includes('early')) {
      return { category: 'Visit Status', color: 'bg-blue-100 text-blue-800' };
    }
    if (indicatorName.includes('ART') || indicatorName.includes('CD4') || indicatorName.includes('Cotrimoxazole') || indicatorName.includes('Fluconazole') || indicatorName.includes('MMD') || indicatorName.includes('TLD') || indicatorName.includes('TPT')) {
      return { category: 'Treatment & Prevention', color: 'bg-green-100 text-green-800' };
    }
    if (indicatorName.includes('viral load') || indicatorName.includes('VL') || indicatorName.includes('suppression')) {
      return { category: 'Viral Load', color: 'bg-purple-100 text-purple-800' };
    }
    if (indicatorName.includes('adherence') || indicatorName.includes('counseling')) {
      return { category: 'Adherence Counseling', color: 'bg-orange-100 text-orange-800' };
    }
    if (indicatorName.includes('switching') || indicatorName.includes('retention') || indicatorName.includes('line')) {
      return { category: 'Switching & Retention', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { category: 'Other', color: 'bg-gray-100 text-gray-800' };
  };

  const getIndicatorValue = (indicator) => {
    // Debug: Log the entire indicator object
    console.log('getIndicatorValue called with:', indicator);
    console.log('Indicator name:', indicator.Indicator);
    console.log('Available fields:', Object.keys(indicator));
    
    // For specific indicators, prioritize their main field
    if (indicator.Indicator && indicator.Indicator.includes('lost to follow-up')) {
      if (indicator.Lost_to_Followup !== undefined && indicator.Lost_to_Followup !== null) {
        console.log('Found Lost_to_Followup:', indicator.Lost_to_Followup);
        return indicator.Lost_to_Followup;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('reengaged within 28 days')) {
      // For reengagement indicator, show reengaged count as main value
      if (indicator.Reengaged_Within_28 !== undefined && indicator.Reengaged_Within_28 !== null) {
        console.log('Found Reengaged_Within_28:', indicator.Reengaged_Within_28);
        return indicator.Reengaged_Within_28;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('reengaged after 28+ days')) {
      // For reengagement over 28 days indicator, show reengaged count as main value
      if (indicator.Reengaged_Over_28 !== undefined && indicator.Reengaged_Over_28 !== null) {
        console.log('Found Reengaged_Over_28:', indicator.Reengaged_Over_28);
        return indicator.Reengaged_Over_28;
      }
    }
    
    // Visit status indicators (5a-5d)
    if (indicator.Indicator && indicator.Indicator.includes('late visits beyond')) {
      if (indicator.Late_Visits_Beyond_Buffer !== undefined && indicator.Late_Visits_Beyond_Buffer !== null) {
        return indicator.Late_Visits_Beyond_Buffer;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('late visits within')) {
      if (indicator.Late_Visits_Within_Buffer !== undefined && indicator.Late_Visits_Within_Buffer !== null) {
        return indicator.Late_Visits_Within_Buffer;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('visits on schedule')) {
      if (indicator.On_Schedule_Visits !== undefined && indicator.On_Schedule_Visits !== null) {
        return indicator.On_Schedule_Visits;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('early visits')) {
      if (indicator.Early_Visits !== undefined && indicator.Early_Visits !== null) {
        return indicator.Early_Visits;
      }
    }
    
    // Same-day ART initiation indicator (6a)
    if (indicator.Indicator && indicator.Indicator.includes('same-day') && indicator.Indicator.includes('0 day')) {
      if (indicator.Same_Day_Initiation !== undefined && indicator.Same_Day_Initiation !== null) {
        return indicator.Same_Day_Initiation;
      }
    }
    
    // ART initiation 1-7 days indicator (6b)
    if (indicator.Indicator && indicator.Indicator.includes('1-7 days') && indicator.Indicator.includes('initiating ART')) {
      if (indicator.Initiation_1_7_Days !== undefined && indicator.Initiation_1_7_Days !== null) {
        return indicator.Initiation_1_7_Days;
      }
    }
    
    // ART initiation >7 days indicator (6c)
    if (indicator.Indicator && indicator.Indicator.includes('>7 days') && indicator.Indicator.includes('initiating ART')) {
      if (indicator.Initiation_Over_7_Days !== undefined && indicator.Initiation_Over_7_Days !== null) {
        return indicator.Initiation_Over_7_Days;
      }
    }
    
    // Legacy same-day ART initiation indicator
    if (indicator.Indicator && (indicator.Indicator.includes('same-day') || indicator.Indicator.includes('initiating ART'))) {
      if (indicator.Same_Day_Initiation !== undefined && indicator.Same_Day_Initiation !== null) {
        return indicator.Same_Day_Initiation;
      }
    }
    
    // Try different possible field names for the main value
    const possibleValueFields = [
      'Deaths', 'Lost_to_Followup', 'Reengaged_Within_28', 'Reengaged_Over_28',
      'Late_Visits_Beyond_Buffer', 'Late_Visits_Within_Buffer', 'On_Schedule_Visits', 'Early_Visits',
      'Same_Day_Initiation', 'Initiation_1_7_Days', 'Initiation_Over_7_Days', 'With_Baseline_CD4', 'Receiving_Cotrimoxazole', 'Receiving_Fluconazole',
      'MMD_3_Plus_Months', 'Less_Than_3M', 'Three_Months', 'Four_Months', 'Five_Months', 'Six_Plus_Months',
      'TLD_New_Initiation', 'TLD_Cumulative', 'TPT_Received', 'TPT_Completed',
      'VL_Tested_12M', 'VL_Monitored_6M', 'VL_Suppressed_12M', 'VL_Suppressed_Overall', 'Within_10_Days',
      'Received_Counseling', 'Followup_Received', 'Achieved_Suppression', 'Switched_To_Second_Line', 'Switched_To_Third_Line',
      'Total_Retained', 'TOTAL'
    ];
    
    for (const field of possibleValueFields) {
      if (indicator[field] !== undefined && indicator[field] !== null) {
        console.log(`Found value for ${field}:`, indicator[field]);
        return indicator[field];
      }
    }
    // If no specific field found, try TOTAL as fallback
    if (indicator.TOTAL !== undefined && indicator.TOTAL !== null) {
      console.log('Using TOTAL fallback:', indicator.TOTAL);
      return indicator.TOTAL;
    }
    console.log('No value found, returning N/A. Available fields:', Object.keys(indicator));
    return 'N/A';
  };

  // Helper function to get age/gender values
  const getAgeGenderValue = (indicator, baseField) => {
    // For same-day ART initiation indicator, use total newly initiated as the base value
    const isSameDayIndicator = indicator.Indicator?.includes('same-day') || indicator.Indicator?.includes('initiating ART');
    
    const possibleFields = [
      baseField,
      `${baseField}_Deaths`,
      `${baseField}_Lost`,
      `${baseField}_Reengaged`,
      `${baseField}_Late`,
      `${baseField}_OnSchedule`,
      `${baseField}_Early`,
      `${baseField}_Same_Day`,
      `${baseField}_With_CD4`,
      `${baseField}_Receiving`,
      `${baseField}_MMD_3_Plus`,
      `${baseField}_Less_3M`,
      `${baseField}_3M`,
      `${baseField}_4M`,
      `${baseField}_5M`,
      `${baseField}_6M_Plus`,
      `${baseField}_TLD`,
      `${baseField}_TPT_Received`,
      `${baseField}_TPT_Completed`,
      `${baseField}_Tested`,
      `${baseField}_Monitored`,
      `${baseField}_Suppressed`,
      `${baseField}_Within_10_Days`,
      `${baseField}_Received`,
      `${baseField}_Followup`,
      `${baseField}_Switched`,
      `${baseField}_Retained`
    ];
    
    for (const field of possibleFields) {
      if (indicator[field] !== undefined && indicator[field] !== null && indicator[field] !== '') {
        return indicator[field];
      }
    }
    return 0;
  };
  
  // Helper function to get same-day count for age/gender (for indicator 6)
  const getAgeGenderSameDay = (indicator, baseField) => {
    const sameDayField = `${baseField}_Same_Day`;
    if (indicator[sameDayField] !== undefined && indicator[sameDayField] !== null && indicator[sameDayField] !== '') {
      return indicator[sameDayField];
    }
    return 0;
  };

  // Helper function to get reengaged count for age/gender (for indicator 3)
  const getAgeGenderReengaged = (indicator, baseField) => {
    const reengagedField = `${baseField}_Reengaged`;
    if (indicator[reengagedField] !== undefined && indicator[reengagedField] !== null && indicator[reengagedField] !== '') {
      return indicator[reengagedField];
    }
    return 0;
  };

  // Helper function to get "With CD4" values for baseline CD4 indicator (7)
  const getAgeGenderWithCD4 = (indicator, baseField) => {
    const withCDField = `${baseField}_With_CD4`;
    if (indicator[withCDField] !== undefined && indicator[withCDField] !== null && indicator[withCDField] !== '') {
      return indicator[withCDField];
    }
    return 0;
  };

  // Helper function to format numbers
  const formatNumber = (value) => {
    if (value === undefined || value === null || value === '') return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  // Helper function to format indicator names
  const formatIndicatorName = (name) => {
    if (!name) return 'Unknown Indicator';
    // Remove leading numbers and make more user-friendly
    let formatted = name.replace(/^\d+[a-z]?\.\s*/, '');
    
    // Make reengagement indicators more clear
    if (formatted.includes('reengaged within 28 days')) {
      return 'Early Reengagement (Within 28 Days)';
    }
    if (formatted.includes('reengaged after 28+ days')) {
      return 'Late Reengagement (After 28+ Days)';
    }
    
    // Make visit status indicators more clear
    if (formatted.includes('late visits beyond')) {
      return 'Late Visits Beyond Buffer (>5 days)';
    }
    if (formatted.includes('late visits within')) {
      return 'Late Visits Within Buffer (1-5 days)';
    }
    if (formatted.includes('visits on schedule')) {
      return 'Visits On Schedule';
    }
    if (formatted.includes('early visits')) {
      return 'Early Visits';
    }
    
    // Make same-day ART initiation more clear
    if (formatted.includes('same-day') && formatted.includes('0 day')) {
      return 'Same-Day ART Initiation (0 day)';
    }
    if (formatted.includes('1-7 days') && formatted.includes('initiating ART')) {
      return 'ART Initiation (1-7 days)';
    }
    if (formatted.includes('>7 days') && formatted.includes('initiating ART')) {
      return 'ART Initiation (>7 days)';
    }
    
    // Make baseline CD4 indicator more clear
    if (formatted.includes('baseline CD4')) {
      return 'Baseline CD4 Before ART';
    }
    
    // Make TLD indicators more clear
    if (formatted.includes('TLD') && formatted.includes('newly initiating')) {
      return 'TLD Initiation';
    }
    if (formatted.includes('TLD') && formatted.includes('cumulative')) {
      return 'TLD Cumulative';
    }
    if (formatted.includes('TLD')) {
      return 'TLD';
    }
    
    if (formatted.includes('same-day') || formatted.includes('initiating ART')) {
      return 'Same-Day ART Initiation';
    }
    
    return formatted;
  };

  // Get indicator description/insight
  const getIndicatorInsight = (indicator) => {
    if (indicator.Indicator?.includes('reengaged within 28 days')) {
      return {
        title: 'Early Reengagement Rate',
        description: 'Shows how many patients returned to care quickly (within 28 days) after missing an appointment.',
        calculation: 'Reengaged within 28 days ÷ Total missed appointments'
      };
    }
    if (indicator.Indicator?.includes('reengaged after 28+ days')) {
      return {
        title: 'Late Reengagement Rate',
        description: 'Shows how many patients returned to care after 28+ days. Only counts patients who did NOT return within 28 days.',
        calculation: 'Reengaged after 28+ days ÷ (Total missed - Reengaged within 28 days)'
      };
    }
    if (indicator.Indicator?.includes('late visits beyond')) {
      return {
        title: 'Late Visits Beyond Buffer',
        description: 'Shows visits that occurred more than 5 days after the previous appointment date. These visits indicate patients who missed their medication supply buffer period.',
        calculation: 'Late visits (>5 days) ÷ Total visits'
      };
    }
    if (indicator.Indicator?.includes('late visits within')) {
      return {
        title: 'Late Visits Within Buffer',
        description: 'Shows visits that occurred 1-5 days after the previous appointment date. These are late but still within the medication supply buffer period.',
        calculation: 'Late visits (1-5 days) ÷ Total visits'
      };
    }
    if (indicator.Indicator?.includes('visits on schedule')) {
      return {
        title: 'On Schedule Visits',
        description: 'Shows visits that occurred exactly on the previous appointment date. These indicate good adherence to scheduled appointments.',
        calculation: 'On schedule visits ÷ Total visits'
      };
    }
    if (indicator.Indicator?.includes('early visits')) {
      return {
        title: 'Early Visits',
        description: 'Shows visits that occurred before the previous appointment date. These may indicate proactive care-seeking or medication stock-outs.',
        calculation: 'Early visits ÷ Total visits'
      };
    }
    if (indicator.Indicator?.includes('same-day') && indicator.Indicator?.includes('0 day')) {
      return {
        title: 'Same-Day ART Initiation (0 day)',
        description: 'Shows the percentage of patients who started ART on the same day as their HIV diagnosis. This is a key indicator of rapid treatment initiation.',
        calculation: 'Same-day initiations (0 day) ÷ Total newly initiated patients'
      };
    }
    if (indicator.Indicator?.includes('1-7 days') && indicator.Indicator?.includes('initiating ART')) {
      return {
        title: 'ART Initiation (1-7 days)',
        description: 'Shows the percentage of patients who started ART within 1-7 days of their HIV diagnosis.',
        calculation: 'Initiations (1-7 days) ÷ Total newly initiated patients'
      };
    }
    if (indicator.Indicator?.includes('>7 days') && indicator.Indicator?.includes('initiating ART')) {
      return {
        title: 'ART Initiation (>7 days)',
        description: 'Shows the percentage of patients who started ART more than 7 days after their HIV diagnosis.',
        calculation: 'Initiations (>7 days) ÷ Total newly initiated patients'
      };
    }
    if (indicator.Indicator?.includes('same-day') || indicator.Indicator?.includes('initiating ART')) {
      return {
        title: 'Same-Day ART Initiation',
        description: 'Shows the percentage of patients who started ART on the same day as their HIV diagnosis. This is a key indicator of rapid treatment initiation.',
        calculation: 'Same-day initiations ÷ Total newly initiated patients'
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen mx-auto lg:max-w-[300mm]  dark:bg-gray-900">
      <div className="space-y-6 p-6">
        {/* Configuration */}
        <ReportConfiguration
          sites={sites}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          sitesLoading={sitesLoading}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          onYearChange={handleYearChange}
          onQuarterChange={handleQuarterChange}
          availableYears={availableYears}
          availableQuarters={availableQuarters}
          onRefresh={handleRefresh}
          onExport={exportToCSV}
          onPreview={() => {}}
          onPrint={() => {}}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
          isViewer={isViewer}
        />

        <ReportHeader 
          selectedSite={selectedSite}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
        />

        {/* Error */}
        {error && (
          <div className=" dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Indicators Table */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Indicators</h2>
              <span className="text-sm text-muted-foreground">{indicators.length} items</span>
            </div>
          </div>
          
          <div className="bg-card">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : indicators.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-muted border-b-2 border-border">
                    <tr>
                      <th className="px-4 py-4 text-center text-sm font-bold text-foreground border-r border-border">
                        Indicator
                      </th>
                      <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-24 border-r border-border">
                        Age
                      </th>
                      <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-32 border-r border-border">
                        Male
                      </th>
                      <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-32 border-r border-border">
                        Female
                      </th>
                      <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-32 border-r border-border">
                        Total
                      </th>
                      {indicators.some(ind => 
                        ind.Indicator?.includes('reengaged') || 
                        ind.Indicator?.includes('same-day') || 
                        ind.Indicator?.includes('initiating ART') ||
                        ind.Indicator?.includes('1-7 days') ||
                        ind.Indicator?.includes('>7 days') ||
                        ind.Indicator?.includes('baseline CD4') ||
                        ind.Indicator?.includes('Cotrimoxazole') ||
                        ind.Indicator?.includes('Fluconazole') ||
                        ind.Indicator?.includes('MMD')
                      ) && (
                        <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-24">
                          %
                        </th>
                      )}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="bg-card divide-y divide-border">
                {indicators.map((indicator, index) => {
                  const mainValue = getIndicatorValue(indicator);
                  const percentage = indicator.Percentage;
                      const isReengagementIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('reengaged within 28 days') ||
                        indicator.Indicator.includes('reengaged after 28+ days')
                      );
                      const isSameDayIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('same-day') && indicator.Indicator.includes('0 day')
                      );
                      const isArtInitiationIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('initiating ART') ||
                        indicator.Indicator.includes('1-7 days') ||
                        indicator.Indicator.includes('>7 days')
                      );
                      const isBaselineCD4Indicator = indicator.Indicator && (
                        indicator.Indicator.includes('baseline CD4')
                      );
                      const isProphylaxisIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('Cotrimoxazole') ||
                        indicator.Indicator.includes('Fluconazole')
                      );
                      const isMMDIndicator = indicator.Indicator && indicator.Indicator.includes('MMD');
                      const isTLDIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('TLD') || 
                        indicator.Indicator.includes('tld')
                      );
                  
                      // For MMD indicators, get totals first (denominator for percentage)
                      const male014TotalMMD = isMMDIndicator ? getAgeGenderValue(indicator, 'Male_0_14') : null;
                      const female014TotalMMD = isMMDIndicator ? getAgeGenderValue(indicator, 'Female_0_14') : null;
                      const male15PlusTotalMMD = isMMDIndicator ? getAgeGenderValue(indicator, 'Male_over_14') : null;
                      const female15PlusTotalMMD = isMMDIndicator ? getAgeGenderValue(indicator, 'Female_over_14') : null;
                      
                      // For MMD indicators, get the category-specific counts (numerator for display and percentage)
                      // The category-specific fields (Male_0_14_Less_3M, etc.) contain the counts to display
                      const male014Category = isMMDIndicator ? (
                        indicator.Male_0_14_Less_3M || 
                        indicator.Male_0_14_3M || 
                        indicator.Male_0_14_4M || 
                        indicator.Male_0_14_5M || 
                        indicator.Male_0_14_6M_Plus || 
                        0
                      ) : null;
                      const female014Category = isMMDIndicator ? (
                        indicator.Female_0_14_Less_3M || 
                        indicator.Female_0_14_3M || 
                        indicator.Female_0_14_4M || 
                        indicator.Female_0_14_5M || 
                        indicator.Female_0_14_6M_Plus || 
                        0
                      ) : null;
                      const male15PlusCategory = isMMDIndicator ? (
                        indicator.Male_over_14_Less_3M || 
                        indicator.Male_over_14_3M || 
                        indicator.Male_over_14_4M || 
                        indicator.Male_over_14_5M || 
                        indicator.Male_over_14_6M_Plus || 
                        0
                      ) : null;
                      const female15PlusCategory = isMMDIndicator ? (
                        indicator.Female_over_14_Less_3M || 
                        indicator.Female_over_14_3M || 
                        indicator.Female_over_14_4M || 
                        indicator.Female_over_14_5M || 
                        indicator.Female_over_14_6M_Plus || 
                        0
                      ) : null;
                      
                      // For TLD indicators, get TLD-specific counts and totals
                      const male014TLD = isTLDIndicator ? (indicator.Male_0_14_TLD || 0) : null;
                      const female014TLD = isTLDIndicator ? (indicator.Female_0_14_TLD || 0) : null;
                      const male15PlusTLD = isTLDIndicator ? (indicator.Male_over_14_TLD || 0) : null;
                      const female15PlusTLD = isTLDIndicator ? (indicator.Female_over_14_TLD || 0) : null;
                      const male014TotalTLD = isTLDIndicator ? getAgeGenderValue(indicator, 'Male_0_14') : null;
                      const female014TotalTLD = isTLDIndicator ? getAgeGenderValue(indicator, 'Female_0_14') : null;
                      const male15PlusTotalTLD = isTLDIndicator ? getAgeGenderValue(indicator, 'Male_over_14') : null;
                      const female15PlusTotalTLD = isTLDIndicator ? getAgeGenderValue(indicator, 'Female_over_14') : null;
                      
                      // For non-MMD, non-TLD indicators, use the regular values
                      // For TLD indicators, display TLD counts (numerator)
                      // For MMD indicators, display category counts
                      const male014 = isTLDIndicator ? (male014TLD || 0) : (isMMDIndicator ? (male014Category || 0) : getAgeGenderValue(indicator, 'Male_0_14'));
                      const female014 = isTLDIndicator ? (female014TLD || 0) : (isMMDIndicator ? (female014Category || 0) : getAgeGenderValue(indicator, 'Female_0_14'));
                      const male15Plus = isTLDIndicator ? (male15PlusTLD || 0) : (isMMDIndicator ? (male15PlusCategory || 0) : getAgeGenderValue(indicator, 'Male_over_14'));
                      const female15Plus = isTLDIndicator ? (female15PlusTLD || 0) : (isMMDIndicator ? (female15PlusCategory || 0) : getAgeGenderValue(indicator, 'Female_over_14'));
                      
                      // For reengagement indicator, get reengaged counts
                      const male014Reengaged = isReengagementIndicator ? getAgeGenderReengaged(indicator, 'Male_0_14') : null;
                      const female014Reengaged = isReengagementIndicator ? getAgeGenderReengaged(indicator, 'Female_0_14') : null;
                      const male15PlusReengaged = isReengagementIndicator ? getAgeGenderReengaged(indicator, 'Male_over_14') : null;
                      const female15PlusReengaged = isReengagementIndicator ? getAgeGenderReengaged(indicator, 'Female_over_14') : null;
                      
                      // For baseline CD4 indicator, get "with CD4" counts
                      const male014WithCD4 = isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Male_0_14') : null;
                      const female014WithCD4 = isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Female_0_14') : null;
                      const male15PlusWithCD4 = isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Male_over_14') : null;
                      const female15PlusWithCD4 = isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Female_over_14') : null;
                      
                      // For same-day ART initiation indicator (6a only), get same-day counts
                      const male014SameDay = isSameDayIndicator ? getAgeGenderSameDay(indicator, 'Male_0_14') : null;
                      const female014SameDay = isSameDayIndicator ? getAgeGenderSameDay(indicator, 'Female_0_14') : null;
                      const male15PlusSameDay = isSameDayIndicator ? getAgeGenderSameDay(indicator, 'Male_over_14') : null;
                      const female15PlusSameDay = isSameDayIndicator ? getAgeGenderSameDay(indicator, 'Female_over_14') : null;
                      
                      // Get total newly initiated for percentage calculation (for 6a, 6b, 6c)
                      // Sum all three indicators (6a + 6b + 6c) to get the total denominator
                      const allArtInitiationIndicators = indicators.filter(ind => 
                        ind.Indicator?.includes('initiating ART') ||
                        (ind.Indicator?.includes('same-day') && ind.Indicator?.includes('0 day')) ||
                        ind.Indicator?.includes('1-7 days') ||
                        ind.Indicator?.includes('>7 days')
                      );
                      const totalNewlyInitiated = allArtInitiationIndicators.reduce((sum, ind) => {
                        const total = Number(ind.TOTAL || 0);
                        return sum + total;
                      }, 0);
                      
                      // Calculate total newly initiated per age group for percentage calculation
                      const total014NewlyInitiated = allArtInitiationIndicators.reduce((sum, ind) => {
                        const male014 = Number(getAgeGenderValue(ind, 'Male_0_14') || 0);
                        const female014 = Number(getAgeGenderValue(ind, 'Female_0_14') || 0);
                        return sum + male014 + female014;
                      }, 0);
                      const total15PlusNewlyInitiated = allArtInitiationIndicators.reduce((sum, ind) => {
                        const male15Plus = Number(getAgeGenderValue(ind, 'Male_over_14') || 0);
                        const female15Plus = Number(getAgeGenderValue(ind, 'Female_over_14') || 0);
                        return sum + male15Plus + female15Plus;
                      }, 0);
                      
                      // For MMD indicators, use category counts for display totals
                      // For non-MMD indicators, use regular values
                      const total014 = Number(male014 || 0) + Number(female014 || 0);
                      const total15Plus = Number(male15Plus || 0) + Number(female15Plus || 0);
                      const totalMale = Number(male014 || 0) + Number(male15Plus || 0);
                      const totalFemale = Number(female014 || 0) + Number(female15Plus || 0);
                      const grandTotal = total014 + total15Plus;
                      
                      // For MMD indicators, calculate totals for percentage calculation
                      // Use total counts (denominator) for percentage calculation
                      const total014MMD = isMMDIndicator && male014TotalMMD !== null && female014TotalMMD !== null 
                        ? (Number(male014TotalMMD) + Number(female014TotalMMD)) 
                        : null;
                      const total15PlusMMD = isMMDIndicator && male15PlusTotalMMD !== null && female15PlusTotalMMD !== null 
                        ? (Number(male15PlusTotalMMD) + Number(female15PlusTotalMMD)) 
                        : null;
                      const grandTotalMMD = isMMDIndicator && total014MMD !== null && total15PlusMMD !== null 
                        ? (total014MMD + total15PlusMMD) 
                        : null;
                      
                      // For TLD indicators, calculate totals for percentage calculation
                      // Total counts (Male_0_14, etc.) are the denominator (all ART patients)
                      // TLD counts (Male_0_14_TLD, etc.) are the numerator (patients on TLD)
                      const total014TLD = isTLDIndicator && male014TLD !== null && female014TLD !== null 
                        ? (Number(male014TLD) + Number(female014TLD)) 
                        : null;
                      const total15PlusTLD = isTLDIndicator && male15PlusTLD !== null && female15PlusTLD !== null 
                        ? (Number(male15PlusTLD) + Number(female15PlusTLD)) 
                        : null;
                      const grandTotalTLD = isTLDIndicator && total014TLD !== null && total15PlusTLD !== null 
                        ? (total014TLD + total15PlusTLD) 
                        : null;
                      const total014TLDDenominator = isTLDIndicator && male014TotalTLD !== null && female014TotalTLD !== null 
                        ? (Number(male014TotalTLD) + Number(female014TotalTLD)) 
                        : null;
                      const total15PlusTLDDenominator = isTLDIndicator && male15PlusTotalTLD !== null && female15PlusTotalTLD !== null 
                        ? (Number(male15PlusTotalTLD) + Number(female15PlusTotalTLD)) 
                        : null;
                      const grandTotalTLDDenominator = isTLDIndicator && total014TLDDenominator !== null && total15PlusTLDDenominator !== null 
                        ? (total014TLDDenominator + total15PlusTLDDenominator) 
                        : null;
                      
                      // For reengagement, calculate totals
                      const total014Reengaged = isReengagementIndicator ? (Number(male014Reengaged || 0) + Number(female014Reengaged || 0)) : null;
                      const total15PlusReengaged = isReengagementIndicator ? (Number(male15PlusReengaged || 0) + Number(female15PlusReengaged || 0)) : null;
                      const totalMaleReengaged = isReengagementIndicator ? (Number(male014Reengaged || 0) + Number(male15PlusReengaged || 0)) : null;
                      const totalFemaleReengaged = isReengagementIndicator ? (Number(female014Reengaged || 0) + Number(female15PlusReengaged || 0)) : null;
                      const grandTotalReengaged = isReengagementIndicator ? (total014Reengaged + total15PlusReengaged) : null;
                      
                      // For baseline CD4, calculate totals
                      const total014WithCD4 = isBaselineCD4Indicator ? (Number(male014WithCD4 || 0) + Number(female014WithCD4 || 0)) : null;
                      const total15PlusWithCD4 = isBaselineCD4Indicator ? (Number(male15PlusWithCD4 || 0) + Number(female15PlusWithCD4 || 0)) : null;
                      const totalMaleWithCD4 = isBaselineCD4Indicator ? (Number(male014WithCD4 || 0) + Number(male15PlusWithCD4 || 0)) : null;
                      const totalFemaleWithCD4 = isBaselineCD4Indicator ? (Number(female014WithCD4 || 0) + Number(female15PlusWithCD4 || 0)) : null;
                      const grandTotalWithCD4 = isBaselineCD4Indicator ? (total014WithCD4 + total15PlusWithCD4) : null;
                      
                      // For same-day ART initiation (6a only), calculate totals
                      const total014SameDay = isSameDayIndicator ? (Number(male014SameDay || 0) + Number(female014SameDay || 0)) : null;
                      const total15PlusSameDay = isSameDayIndicator ? (Number(male15PlusSameDay || 0) + Number(female15PlusSameDay || 0)) : null;
                      const totalMaleSameDay = isSameDayIndicator ? (Number(male014SameDay || 0) + Number(male15PlusSameDay || 0)) : null;
                      const totalFemaleSameDay = isSameDayIndicator ? (Number(female014SameDay || 0) + Number(female15PlusSameDay || 0)) : null;
                      const grandTotalSameDay = isSameDayIndicator ? (total014SameDay + total15PlusSameDay) : null;
                      
                      // Calculate percentage for ART initiation indicators (6a, 6b, 6c)
                      // Percentage = (indicator count / total of all newly initiated) * 100
                      const calculatedPercentage = isArtInitiationIndicator && grandTotal > 0 && totalNewlyInitiated > 0 
                        ? Math.round((grandTotal / totalNewlyInitiated) * 100) 
                        : (isArtInitiationIndicator ? 0 : (percentage !== undefined && percentage !== null ? percentage : null));
                  
                  return (
                        <React.Fragment key={index}>
                          {/* Indicator Header Row with Name */}
                          <tr className="border-b border-border">
                            {/* Indicator Name - spans 3 rows */}
                            <td className="px-4 py-4 text-sm text-foreground align-middle text-left border-r border-border" rowSpan="3">
                              <div className="font-medium leading-tight text-left">
                            {formatIndicatorName(indicator.Indicator || 'Unknown')}
                              </div>
                              {isReengagementIndicator && indicator.Total_Lost !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total Missed: {formatNumber(indicator.Total_Lost || 0)}
                                </div>
                              )}
                              {(isSameDayIndicator || isArtInitiationIndicator) && indicator.Total_Newly_Initiated !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total Initiated: {formatNumber(indicator.Total_Newly_Initiated || 0)}
                                </div>
                              )}
                              {(isSameDayIndicator || isArtInitiationIndicator) && !indicator.Total_Newly_Initiated && indicator.TOTAL !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total: {formatNumber(indicator.TOTAL || 0)}
                                </div>
                              )}
                              {isBaselineCD4Indicator && indicator.Total_Newly_Initiated !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total Initiated: {formatNumber(indicator.Total_Newly_Initiated || 0)}
                                </div>
                              )}
                              {percentage !== undefined && percentage !== null && (
                                <div className="mt-1 text-xs font-semibold text-green-600">
                                  {formatNumber(percentage)}%
                                </div>
                              )}
                            </td>

                            {/* Age 0-14 */}
                            <td className="px-3 py-4 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                              0-14
                            </td>

                            {/* Male 0-14 */}
                            <td className="px-3 py-4 text-right border-r border-border">
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : 'text-blue-600 dark:text-blue-400'}`}>
                                {formatNumber(male014)}
                                {isReengagementIndicator && male014Reengaged !== null && male014 > 0 && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    ({formatNumber(male014Reengaged)} returned)
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Female 0-14 */}
                            <td className="px-3 py-4 text-right border-r border-border">
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : 'text-pink-600 dark:text-pink-400'}`}>
                                {formatNumber(female014)}
                                {isReengagementIndicator && female014Reengaged !== null && female014 > 0 && (
                                  <div className="text-xs text-pink-600 dark:text-pink-400">
                                    ({formatNumber(female014Reengaged)} returned)
                                  </div>
                                )}
                        </div>
                            </td>

                            {/* Total 0-14 */}
                            <td className="px-3 py-4 text-right border-r border-border">
                              <div className="text-lg text-foreground">
                                {formatNumber(total014)}
                                {isReengagementIndicator && total014Reengaged !== null && total014 > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    ({formatNumber(total014Reengaged)} returned)
                            </div>
                                )}
                          </div>
                            </td>

                            {/* Percentage column for reengagement, ART initiation, and baseline CD4 indicators */}
                            {indicators.some(ind => 
                              ind.Indicator?.includes('reengaged') || 
                              ind.Indicator?.includes('same-day') || 
                              ind.Indicator?.includes('initiating ART') ||
                              ind.Indicator?.includes('1-7 days') ||
                              ind.Indicator?.includes('>7 days') ||
                              ind.Indicator?.includes('baseline CD4') ||
                              ind.Indicator?.includes('Cotrimoxazole') ||
                              ind.Indicator?.includes('Fluconazole') ||
                              ind.Indicator?.includes('MMD') ||
                              ind.Indicator?.includes('TLD')
                            ) && (
                              <td className="px-3 py-4 text-right">
                                {isReengagementIndicator && total014 > 0 && total014Reengaged !== null ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014Reengaged / total014) * 100)}%
                                  </div>
                                ) : isBaselineCD4Indicator && total014 > 0 && total014WithCD4 !== null ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014WithCD4 / total014) * 100)}%
                                  </div>
                                ) : isBaselineCD4Indicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isProphylaxisIndicator && total014 > 0 && percentage !== null && percentage !== undefined ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round(percentage)}%
                                  </div>
                                ) : isProphylaxisIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isMMDIndicator && total014MMD !== null && total014MMD > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014MMD) * 100)}%
                            </div>
                                ) : isMMDIndicator && total014MMD !== null && total014MMD > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isMMDIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTLDIndicator && total014TLDDenominator !== null && total014TLDDenominator > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014TLDDenominator) * 100)}%
                                  </div>
                                ) : isTLDIndicator && total014TLDDenominator !== null && total014TLDDenominator > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTLDIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isArtInitiationIndicator && total014NewlyInitiated > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014NewlyInitiated) * 100)}%
                          </div>
                                ) : isArtInitiationIndicator ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">—</div>
                                )}
                              </td>
                            )}
                          </tr>

                          {/* 15+ Age Group Row */}
                          <tr className="bg-muted border-b border-border">
                            <td className="px-3 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                              {'>'}14
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : 'text-blue-600 dark:text-blue-400'}`}>
                                {formatNumber(male15Plus)}
                                {isReengagementIndicator && male15PlusReengaged !== null && male15Plus > 0 && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    ({formatNumber(male15PlusReengaged)} returned)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : 'text-pink-600 dark:text-pink-400'}`}>
                                {formatNumber(female15Plus)}
                                {isReengagementIndicator && female15PlusReengaged !== null && female15Plus > 0 && (
                                  <div className="text-xs text-pink-600 dark:text-pink-400">
                                    ({formatNumber(female15PlusReengaged)} returned)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className="text-lg text-foreground">
                                {formatNumber(total15Plus)}
                                {isReengagementIndicator && total15PlusReengaged !== null && total15Plus > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    ({formatNumber(total15PlusReengaged)} returned)
                            </div>
                          )}
                        </div>
                            </td>
                              {indicators.some(ind => 
                                ind.Indicator?.includes('reengaged') || 
                                ind.Indicator?.includes('same-day') || 
                                ind.Indicator?.includes('initiating ART') ||
                                ind.Indicator?.includes('1-7 days') ||
                                ind.Indicator?.includes('>7 days') ||
                                ind.Indicator?.includes('baseline CD4') ||
                                ind.Indicator?.includes('Cotrimoxazole') ||
                                ind.Indicator?.includes('Fluconazole') ||
                                ind.Indicator?.includes('MMD')
                              ) && (
                                <td className="px-3 py-3 text-right">
                                  {isReengagementIndicator && total15Plus > 0 && total15PlusReengaged !== null ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15PlusReengaged / total15Plus) * 100)}%
                                    </div>
                                  ) : isBaselineCD4Indicator && total15Plus > 0 && total15PlusWithCD4 !== null ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15PlusWithCD4 / total15Plus) * 100)}%
                                    </div>
                                  ) : isBaselineCD4Indicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isProphylaxisIndicator && total15Plus > 0 && percentage !== null && percentage !== undefined ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round(percentage)}%
                                    </div>
                                  ) : isProphylaxisIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isMMDIndicator && total15PlusMMD !== null && total15PlusMMD > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusMMD) * 100)}%
                                    </div>
                                  ) : isMMDIndicator && total15PlusMMD !== null && total15PlusMMD > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isMMDIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTLDIndicator && total15PlusTLDDenominator !== null && total15PlusTLDDenominator > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusTLDDenominator) * 100)}%
                                    </div>
                                  ) : isTLDIndicator && total15PlusTLDDenominator !== null && total15PlusTLDDenominator > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTLDIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isArtInitiationIndicator && total15PlusNewlyInitiated > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusNewlyInitiated) * 100)}%
                                    </div>
                                  ) : isArtInitiationIndicator ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">—</div>
                                  )}
                                </td>
                              )}
                          </tr>

                          {/* Sub-Total Row for this indicator */}
                          <tr className="bg-muted border-b-2 border-border font-bold">
                            <td className="px-3 py-3 text-center text-sm font-bold text-muted-foreground bg-muted/50 border-r border-border">
                              Total
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className={`text-lg font-bold ${isReengagementIndicator ? 'text-foreground' : 'text-blue-700 dark:text-blue-400'}`}>
                                {formatNumber(totalMale)}
                                {isReengagementIndicator && totalMaleReengaged !== null && totalMale > 0 && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    ({formatNumber(totalMaleReengaged)} returned)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className={`text-lg font-bold ${isReengagementIndicator ? 'text-foreground' : 'text-pink-700 dark:text-pink-400'}`}>
                                {formatNumber(totalFemale)}
                                {isReengagementIndicator && totalFemaleReengaged !== null && totalFemale > 0 && (
                                  <div className="text-xs text-pink-600 dark:text-pink-400">
                                    ({formatNumber(totalFemaleReengaged)} returned)
                                  </div>
                                )}
                            </div>
                            </td>
                            <td className="px-3 py-3 text-right border-r border-border">
                              <div className="text-xl font-bold text-foreground">
                                {formatNumber(grandTotal)}
                                {isReengagementIndicator && grandTotalReengaged !== null && grandTotal > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    ({formatNumber(grandTotalReengaged)} returned)
                            </div>
                                )}
                            </div>
                            </td>
                              {indicators.some(ind => 
                                ind.Indicator?.includes('reengaged') || 
                                ind.Indicator?.includes('same-day') || 
                                ind.Indicator?.includes('initiating ART') ||
                                ind.Indicator?.includes('1-7 days') ||
                                ind.Indicator?.includes('>7 days') ||
                                ind.Indicator?.includes('baseline CD4') ||
                                ind.Indicator?.includes('Cotrimoxazole') ||
                                ind.Indicator?.includes('Fluconazole') ||
                                ind.Indicator?.includes('MMD')
                              ) && (
                                <td className="px-3 py-3 text-right">
                                  {isReengagementIndicator && grandTotal > 0 && grandTotalReengaged !== null ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotalReengaged / grandTotal) * 100)}%
                            </div>
                                  ) : isBaselineCD4Indicator && grandTotal > 0 && grandTotalWithCD4 !== null ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotalWithCD4 / grandTotal) * 100)}%
                          </div>
                                  ) : isBaselineCD4Indicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isProphylaxisIndicator && grandTotal > 0 && percentage !== null && percentage !== undefined ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round(percentage)}%
                        </div>
                                  ) : isProphylaxisIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isMMDIndicator && grandTotalMMD !== null && grandTotalMMD > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalMMD) * 100)}%
                      </div>
                                  ) : isMMDIndicator && grandTotalMMD !== null && grandTotalMMD > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isMMDIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTLDIndicator && grandTotalTLDDenominator !== null && grandTotalTLDDenominator > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalTLDDenominator) * 100)}%
                                    </div>
                                  ) : isTLDIndicator && grandTotalTLDDenominator !== null && grandTotalTLDDenominator > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTLDIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isArtInitiationIndicator && totalNewlyInitiated > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {grandTotal > 0 ? Math.round((grandTotal / totalNewlyInitiated) * 100) : 0}%
                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">—</div>
                                  )}
                                </td>
                              )}
                          </tr>
                        </React.Fragment>
                  );
                })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortalityRetentionIndicators;
