import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, RefreshCw, BarChart3, Table2 } from 'lucide-react';
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
import { IndicatorDetailsModal } from '../components/modals';
import IndicatorChart from '../components/indicators/IndicatorChart';
import { Switch } from '../components/ui/switch';
import { formatDateForTable } from '@/utils/dateFormatter';

const mortalityIndicatorMap = {
  '1': '1_percentage_died',
  '2': '2_percentage_lost_to_followup',
  '3': '3_reengaged_within_28_days',
  '4': '4_reengaged_over_28_days',
  '5a': '5a_late_visits_beyond_buffer',
  '5b': '5b_late_visits_within_buffer',
  '5c': '5c_visits_on_schedule',
  '5d': '5d_early_visits',
  '6a': '6a_same_day_art_initiation',
  '6b': '6b_art_initiation_1_7_days',
  '6c': '6c_art_initiation_over_7_days',
  '7': '7_baseline_cd4_before_art',
  '8a': '8a_cotrimoxazole_prophylaxis',
  '8b': '8b_fluconazole_prophylaxis',
  '9a': '9a_mmd_less_than_3_months',
  '9b': '9b_mmd_3_months',
  '9c': '9c_mmd_4_months',
  '9d': '9d_mmd_5_months',
  '9e': '9e_mmd_6_plus_months',
  '10a': '10a_tld_new_initiation',
  '10b': '10b_tld_cumulative',
  '11a': '11a_tpt_received',
  '11b': '11b_tpt_completed',
  '12a': '12a_vl_testing_coverage',
  '12b': '12b_vl_monitored_six_months',
  '12c': '12c_vl_suppression_12_months',
  '12d': '12d_vl_suppression_overall',
  '12e': '12e_vl_results_10_days',
  '13a': '13a_enhanced_adherence_counseling',
  '13b': '13b_followup_vl_after_counseling',
  '13c': '13c_vl_suppression_after_counseling',
  '14a': '14a_first_line_to_second_line',
  '14b': '14b_second_line_to_third_line',
  '15': '15_retention_rate'
};

const getMortalityIndicatorKey = (indicatorName = '') => {
  if (!indicatorName) return null;
  const trimmed = indicatorName.trim();
  const match = trimmed.match(/^(\d+(?:[a-e]?))/i);
  if (!match) return null;
  const code = match[1].toLowerCase();
  return mortalityIndicatorMap[code] || null;
};

const MortalityRetentionIndicators = () => {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isLoadingRef = useRef(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorDetails, setIndicatorDetails] = useState([]);
  const [pagination, setPagination] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [detailsError, setDetailsError] = useState(null);
  const [isSampleData] = useState(false);
  const [sampleDataInfo] = useState(null);
  const [chartViewIndicators, setChartViewIndicators] = useState(new Set());
  
  const toggleChartView = (indicatorIndex) => {
    setChartViewIndicators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indicatorIndex)) {
        newSet.delete(indicatorIndex);
      } else {
        newSet.add(indicatorIndex);
      }
      return newSet;
    });
  };
  
  // Helper function to determine if indicator has percentage column
  const hasPercentageColumn = (indicator) => {
    if (!indicator?.Indicator) return false;
    const indicatorName = indicator.Indicator.toLowerCase();
    return indicatorName.includes('reengaged') || 
           indicatorName.includes('same-day') || 
           indicatorName.includes('initiating art') ||
           indicatorName.includes('1-7 days') ||
           indicatorName.includes('>7 days') ||
           indicatorName.includes('baseline cd4') ||
           indicatorName.includes('cotrimoxazole') ||
           indicatorName.includes('fluconazole') ||
           indicatorName.includes('mmd') ||
           indicatorName.includes('tld') ||
           indicatorName.includes('tpt') ||
           indicatorName.includes('vl') ||
           indicatorName.includes('retention') ||
           indicatorName.includes('first line') ||
           indicatorName.includes('second line') ||
           indicatorName.includes('third line') ||
           indicatorName.includes('switch');
  };
  
  // Calculate column span for chart view
  const getChartColumnSpan = () => {
    return hasPercentageColumn(indicators[0]) ? 6 : 5;
  };
  
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


      // Use the dedicated mortality retention API to get all indicators at once
      const siteCode = selectedSite.code || selectedSite.site_code || selectedSite.id;
      
      const response = await mortalityRetentionApi.getAllIndicators(siteCode, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      });
      
      if (response.data && Array.isArray(response.data)) {
        // The API returns data directly in the data array
        const transformedData = response.data.filter(item => item && item.Indicator);
        
        setIndicators(transformedData);
      } else {
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

  const fetchIndicatorDetails = useCallback(
    async (indicatorData, page = 1, search = '', filters = {}) => {
      if (!indicatorData || !selectedSite) {
        setIndicatorDetails([]);
        return;
      }

      const siteCode = selectedSite.code || selectedSite.site_code || selectedSite.id;
      if (!siteCode) {
        setDetailsError('Unable to determine site code for detail lookup.');
        setIndicatorDetails([]);
        return;
      }

      const indicatorKey = getMortalityIndicatorKey(indicatorData.Indicator);
      if (!indicatorKey) {
        setDetailsError('Unable to map indicator to backend query.');
        setIndicatorDetails([]);
        return;
      }

      const isSearchRequest = Boolean(search?.trim()) || page !== 1;
      if (isSearchRequest) {
        setSearchLoading(true);
      } else {
        setDetailsLoading(true);
      }
      setDetailsError(null);

      try {
        const response = await mortalityRetentionApi.getIndicatorDetails(siteCode, indicatorKey, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          previousEndDate: dateRange.previousEndDate,
          page,
          limit: 50,
          search,
          gender: filters.gender,
          ageGroup: filters.ageGroup
        });

        if (response?.success) {
          setIndicatorDetails(response.data || []);
          setPagination(response.pagination || {});
          setDetailsError(null);
        } else {
          setIndicatorDetails([]);
          setPagination({});
          setDetailsError(response?.message || 'Failed to fetch indicator details');
        }
      } catch (detailsError) {
        console.error('Error fetching mortality indicator details:', detailsError);
        setIndicatorDetails([]);
        setPagination({});
        setDetailsError(detailsError.response?.data?.message || detailsError.message || 'Failed to load indicator details.');
      } finally {
        setDetailsLoading(false);
        setSearchLoading(false);
      }
    },
    [selectedSite, dateRange]
  );

  const handleIndicatorClick = useCallback(
    (indicatorData, filters = {}) => {
      if (!indicatorData) return;

      const decoratedIndicator = {
        ...indicatorData,
        _displayName: formatIndicatorName(indicatorData.Indicator || 'Indicator'),
        _primaryValue: getIndicatorValue(indicatorData),
        _category: getIndicatorCategory(indicatorData.Indicator || '')
      };

      setSelectedIndicator(decoratedIndicator);
      setCurrentFilters(filters);
      setSearchTerm('');
      setShowDetailsModal(true);
      fetchIndicatorDetails(decoratedIndicator, 1, '', filters);
    },
    [fetchIndicatorDetails]
  );

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setSelectedIndicator(null);
    setIndicatorDetails([]);
    setPagination({});
    setSearchTerm('');
    setCurrentFilters({});
    setDetailsError(null);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Auto-fetch details for indicator 1 when in chart view
  useEffect(() => {
    if (indicators.length > 0) {
      const firstIndicator = indicators[0];
      const isDiedIndicator = firstIndicator?.Indicator?.toLowerCase().includes('died') || firstIndicator?.Indicator?.toLowerCase().includes('dead');
      const isChartView = chartViewIndicators.has(0);
      
      if (isChartView && isDiedIndicator && !indicatorDetails.length && !detailsLoading) {
        const decoratedIndicator = {
          ...firstIndicator,
          _displayName: formatIndicatorName(firstIndicator.Indicator || 'Indicator'),
          _primaryValue: getIndicatorValue(firstIndicator),
          _category: getIndicatorCategory(firstIndicator.Indicator || '')
        };
        fetchIndicatorDetails(decoratedIndicator, 1, '', {});
      }
    }
  }, [chartViewIndicators, indicators, indicatorDetails.length, detailsLoading, fetchIndicatorDetails]);

  const handleSearch = async (page = 1, search = searchTerm) => {
    if (!selectedIndicator) return;
    await fetchIndicatorDetails(selectedIndicator, page, search, currentFilters);
  };

  const handlePageChange = async (page) => {
    if (!selectedIndicator) return;
    await fetchIndicatorDetails(selectedIndicator, page, searchTerm, currentFilters);
  };

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

  function getIndicatorCategory(indicatorName) {
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
  }

  function getIndicatorValue(indicator) {
    // Debug: Log the entire indicator object
    
    // For specific indicators, prioritize their main field
    if (indicator.Indicator && indicator.Indicator.includes('lost to follow-up')) {
      if (indicator.Lost_to_Followup !== undefined && indicator.Lost_to_Followup !== null) {
        return indicator.Lost_to_Followup;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('reengaged within 28 days')) {
      // For reengagement indicator, show reengaged count as main value
      if (indicator.Reengaged_Within_28 !== undefined && indicator.Reengaged_Within_28 !== null) {
        return indicator.Reengaged_Within_28;
      }
    }
    
    if (indicator.Indicator && indicator.Indicator.includes('reengaged after 28+ days')) {
      // For reengagement over 28 days indicator, show reengaged count as main value
      if (indicator.Reengaged_Over_28 !== undefined && indicator.Reengaged_Over_28 !== null) {
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
      'Retention_Quarter_Percentage',
      'Total_Retained', 'TOTAL'
    ];
    
    for (const field of possibleValueFields) {
      if (indicator[field] !== undefined && indicator[field] !== null) {
        return indicator[field];
      }
    }
    // If no specific field found, try TOTAL as fallback
    if (indicator.TOTAL !== undefined && indicator.TOTAL !== null) {
      return indicator.TOTAL;
    }
    return 'N/A';
  }

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
      // Check if field exists and is not null/undefined
      // Allow 0 as a valid value (don't check for empty string, as 0 is valid)
      if (indicator[field] !== undefined && indicator[field] !== null) {
        const value = Number(indicator[field]);
        // Return the value even if it's 0 (0 is a valid count)
        return isNaN(value) ? 0 : value;
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
    // Check if _With_CD4 field exists (even if 0, it's a valid value)
    if (indicator[withCDField] !== undefined && indicator[withCDField] !== null) {
      return Number(indicator[withCDField]) || 0;
    }
    // Fallback: for indicator 7, the baseField itself contains the numerator (with CD4)
    if (indicator[baseField] !== undefined && indicator[baseField] !== null) {
      return Number(indicator[baseField]) || 0;
    }
    return 0;
  };

  // Helper function to get "Receiving" values for prophylaxis indicators (8a, 8b)
  const getAgeGenderReceiving = (indicator, baseField) => {
    const receivingField = `${baseField}_Receiving`;
    // Check if _Receiving field exists (even if 0, it's a valid value)
    if (indicator[receivingField] !== undefined && indicator[receivingField] !== null) {
      return Number(indicator[receivingField]) || 0;
    }
    // Fallback: for indicators 8a and 8b, the baseField itself contains the numerator (receiving prophylaxis)
    if (indicator[baseField] !== undefined && indicator[baseField] !== null) {
      return Number(indicator[baseField]) || 0;
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
  function formatIndicatorName(name) {
    if (!name) return 'Unknown Indicator';
    // Remove leading numbers and make more user-friendly
    let formatted = name.replace(/^\d+[a-z]?\.\s*/, '');
    
    // Make EAC indicators use the backend title
    if (formatted.toLowerCase().includes('enhanced adherence counselling')) {
      return formatted;
    }
    if (formatted.toLowerCase().includes('follow-up vl')) {
      return formatted;
    }
    if (formatted.toLowerCase().includes('achieved viral suppression after')) {
      return formatted;
    }

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
    
    // Make TPT indicators more clear
    if (formatted.includes('received TPT') || formatted.includes('TPT Start')) {
      return 'TPT Received';
    }
    if (formatted.includes('completed TPT') || formatted.includes('TPT Complete')) {
      return 'TPT Completed';
    }
    if (formatted.includes('TPT')) {
      return 'TPT';
    }
    
    // Make VL indicators more clear
    // Check for 12e first (most specific)
    if (formatted.includes('VL test results received within 10 days') || formatted.includes('VL results within 10 days') || formatted.includes('12e')) {
      return 'VL Results Within 10 Days';
    }
    // Check for 12a (VL Testing Coverage)
    if (formatted.includes('VL test in past 12 months') || (formatted.includes('VL test') && formatted.includes('coverage'))) {
      return 'VL Testing Coverage';
    }
    if (formatted.includes('VL monitored at six months') || formatted.includes('VL monitored')) {
      return 'VL Monitored at 6 Months';
    }
    if (formatted.includes('VL <1000 copies/mL at 12 months') || formatted.includes('suppression at 12 months')) {
      return 'VL Suppression at 12 Months';
    }
    if (formatted.includes('suppressed viral load') || formatted.includes('VL suppression')) {
      return 'VL Suppression Overall';
    }
    if (formatted.trim().toUpperCase() === 'VL') {
      return 'VL';
    }
    
    if (formatted.includes('same-day') || formatted.includes('initiating ART')) {
      return 'Same-Day ART Initiation';
    }
    
    return formatted;
  }

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
    <>
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
                  {/* Table Header - Hide when any indicator is in chart view */}
                  {chartViewIndicators.size === 0 && (
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
                          ind.Indicator?.includes('MMD') ||
                          ind.Indicator?.includes('first line') ||
                          ind.Indicator?.includes('second line') ||
                          ind.Indicator?.includes('third line') ||
                          ind.Indicator?.includes('switch')
                        ) && (
                          <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-24">
                            %
                          </th>
                        )}
                      </tr>
                    </thead>
                  )}

                  {/* Table Body */}
                  <tbody className="bg-card divide-y divide-border">
                {indicators.map((indicator, index) => {
                  const mainValue = getIndicatorValue(indicator);
                  const percentage = indicator.Percentage;
                      const isReengagementIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('reengaged within 28 days') ||
                        indicator.Indicator.includes('reengaged after 28+ days')
                      );
                      const isLateReengagementIndicator = indicator.Indicator && indicator.Indicator.includes('reengaged after 28+ days');
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
                      const isTPTIndicator = indicator.Indicator && (
                        indicator.Indicator.includes('TPT') || 
                        indicator.Indicator.includes('tpt') ||
                        indicator.Indicator.includes('received TPT') ||
                        indicator.Indicator.includes('completed TPT')
                      );
                      const indicatorNameLower = (indicator.Indicator || '').toLowerCase();
                      const indicatorCodeMatch = (indicator.Indicator || '').trim().match(/^(\d+[a-z]?)/i);
                      const indicatorCode = indicatorCodeMatch ? indicatorCodeMatch[1].toLowerCase() : '';
                      const isEACIndicator = indicatorCode === '13a';
                      const isEACFollowupIndicator = indicatorCode === '13b';
                      const isEACSuppressionIndicator = indicatorCode === '13c';
                      const isSwitchingIndicator = indicatorCode === '14a' || indicatorCode === '14b';
                      const isRetentionIndicator = indicatorCode === '15';
                      const isVLIndicator = indicator.Indicator && (
                        !(isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) &&
                        (
                          indicator.Indicator.includes('VL') || 
                          indicator.Indicator.includes('viral load') ||
                          indicator.Indicator.includes('VL test') ||
                          indicator.Indicator.includes('VL tested') ||
                          indicator.Indicator.includes('VL monitored') ||
                          indicator.Indicator.includes('VL suppression') ||
                          indicator.Indicator.includes('VL results')
                        )
                      );
                  
                      // For MMD indicators, get totals first (denominator for percentage)
                      // Use _Total fields as denominators (total active patients by demographic)
                      const male014TotalMMD = isMMDIndicator ? (indicator.Male_0_14_Total || 0) : null;
                      const female014TotalMMD = isMMDIndicator ? (indicator.Female_0_14_Total || 0) : null;
                      const male15PlusTotalMMD = isMMDIndicator ? (indicator.Male_over_14_Total || 0) : null;
                      const female15PlusTotalMMD = isMMDIndicator ? (indicator.Female_over_14_Total || 0) : null;
                      
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
                      
                      // For TPT indicators, get TPT-specific counts and totals
                      const isTPTReceivedIndicator = isTPTIndicator && indicator.Indicator && indicator.Indicator.includes('received TPT');
                      const isTPTCompletedIndicator = isTPTIndicator && indicator.Indicator && indicator.Indicator.includes('completed TPT');
                      const male014TPT = isTPTIndicator ? (
                        indicator.Male_0_14_TPT_Received || 
                        indicator.Male_0_14_TPT_Completed || 
                        0
                      ) : null;
                      const female014TPT = isTPTIndicator ? (
                        indicator.Female_0_14_TPT_Received || 
                        indicator.Female_0_14_TPT_Completed || 
                        0
                      ) : null;
                      const male15PlusTPT = isTPTIndicator ? (
                        indicator.Male_over_14_TPT_Received || 
                        indicator.Male_over_14_TPT_Completed || 
                        0
                      ) : null;
                      const female15PlusTPT = isTPTIndicator ? (
                        indicator.Female_over_14_TPT_Received || 
                        indicator.Female_over_14_TPT_Completed || 
                        0
                      ) : null;
                      const male014TotalTPT = isTPTIndicator ? getAgeGenderValue(indicator, 'Male_0_14') : null;
                      const female014TotalTPT = isTPTIndicator ? getAgeGenderValue(indicator, 'Female_0_14') : null;
                      const male15PlusTotalTPT = isTPTIndicator ? getAgeGenderValue(indicator, 'Male_over_14') : null;
                      const female15PlusTotalTPT = isTPTIndicator ? getAgeGenderValue(indicator, 'Female_over_14') : null;
                      
                      // For EAC indicators (13a, 13b, 13c), extract the appropriate numerator counts
                      const male014EAC = isEACIndicator
                        ? (indicator.Male_0_14_Received ?? null)
                        : isEACFollowupIndicator
                          ? (indicator.Male_0_14_Followup ?? null)
                          : isEACSuppressionIndicator
                            ? (indicator.Male_0_14_Suppressed ?? null)
                            : null;
                      const female014EAC = isEACIndicator
                        ? (indicator.Female_0_14_Received ?? null)
                        : isEACFollowupIndicator
                          ? (indicator.Female_0_14_Followup ?? null)
                          : isEACSuppressionIndicator
                            ? (indicator.Female_0_14_Suppressed ?? null)
                            : null;
                      const male15PlusEAC = isEACIndicator
                        ? (indicator.Male_over_14_Received ?? null)
                        : isEACFollowupIndicator
                          ? (indicator.Male_over_14_Followup ?? null)
                          : isEACSuppressionIndicator
                            ? (indicator.Male_over_14_Suppressed ?? null)
                            : null;
                      const female15PlusEAC = isEACIndicator
                        ? (indicator.Female_over_14_Received ?? null)
                        : isEACFollowupIndicator
                          ? (indicator.Female_over_14_Followup ?? null)
                          : isEACSuppressionIndicator
                            ? (indicator.Female_over_14_Suppressed ?? null)
                            : null;
                      
                      // For VL indicators, get VL-specific counts and totals
                      const isVLTestingCoverageIndicator = isVLIndicator && indicator.Indicator && indicator.Indicator.includes('VL test in past 12 months');
                      const isVLMonitoredIndicator = isVLIndicator && indicator.Indicator && indicator.Indicator.includes('VL monitored at six months');
                      const isVLSuppression12MIndicator = isVLIndicator && indicator.Indicator && indicator.Indicator.includes('VL <1000 copies/mL at 12 months');
                      const isVLSuppressionOverallIndicator = isVLIndicator && indicator.Indicator && indicator.Indicator.includes('suppressed viral load');
                      const isVLResults10DaysIndicator = isVLIndicator && indicator.Indicator && indicator.Indicator.includes('VL test results received within 10 days');
                      
                      // Extract VL-specific counts based on indicator type
                      // Priority order: Suppressed (12c, 12d) > Monitored (12b) > Tested (12a) > Within_10_Days (12e)
                      const male014VL = isVLIndicator ? (
                        (isVLSuppression12MIndicator || isVLSuppressionOverallIndicator) ? (indicator.Male_0_14_Suppressed || 0) :
                        isVLMonitoredIndicator ? (indicator.Male_0_14_Monitored || 0) :
                        isVLResults10DaysIndicator ? (indicator.Male_0_14_Within_10_Days || 0) :
                        (indicator.Male_0_14_Tested || 0)
                      ) : null;
                      const female014VL = isVLIndicator ? (
                        (isVLSuppression12MIndicator || isVLSuppressionOverallIndicator) ? (indicator.Female_0_14_Suppressed || 0) :
                        isVLMonitoredIndicator ? (indicator.Female_0_14_Monitored || 0) :
                        isVLResults10DaysIndicator ? (indicator.Female_0_14_Within_10_Days || 0) :
                        (indicator.Female_0_14_Tested || 0)
                      ) : null;
                      const male15PlusVL = isVLIndicator ? (
                        (isVLSuppression12MIndicator || isVLSuppressionOverallIndicator) ? (indicator.Male_over_14_Suppressed || 0) :
                        isVLMonitoredIndicator ? (indicator.Male_over_14_Monitored || 0) :
                        isVLResults10DaysIndicator ? (indicator.Male_over_14_Within_10_Days || 0) :
                        (indicator.Male_over_14_Tested || 0)
                      ) : null;
                      const female15PlusVL = isVLIndicator ? (
                        (isVLSuppression12MIndicator || isVLSuppressionOverallIndicator) ? (indicator.Female_over_14_Suppressed || 0) :
                        isVLMonitoredIndicator ? (indicator.Female_over_14_Monitored || 0) :
                        isVLResults10DaysIndicator ? (indicator.Female_over_14_Within_10_Days || 0) :
                        (indicator.Female_over_14_Tested || 0)
                      ) : null;
                      const male014TotalVL = isVLIndicator ? getAgeGenderValue(indicator, 'Male_0_14') : null;
                      const female014TotalVL = isVLIndicator ? getAgeGenderValue(indicator, 'Female_0_14') : null;
                      const male15PlusTotalVL = isVLIndicator ? getAgeGenderValue(indicator, 'Male_over_14') : null;
                      const female15PlusTotalVL = isVLIndicator ? getAgeGenderValue(indicator, 'Female_over_14') : null;
                      
                      // For non-MMD, non-TLD, non-TPT, non-VL indicators, use the regular values
                      // For TLD indicators, display TLD counts (numerator)
                      // For MMD indicators, display category counts
                      // For TPT indicators, display TPT counts (numerator)
                      // For VL indicators, display VL counts (numerator)
                      // For baseline CD4 indicator (7), use "With CD4" values
                      // For prophylaxis indicators (8a, 8b), use "Receiving" values
                      // For late reengagement indicator (4), use eligible fields instead of total missed
                      const male014 = isVLIndicator ? (male014VL || 0)
                        : (isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) ? (Number(male014EAC ?? 0))
                        : isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Male_0_14')
                        : isProphylaxisIndicator ? getAgeGenderReceiving(indicator, 'Male_0_14')
                        : (isTPTIndicator ? (male014TPT || 0) : (isTLDIndicator ? (male014TLD || 0) : (isMMDIndicator ? (male014Category || 0) : (isLateReengagementIndicator ? (indicator.Male_0_14_Eligible || 0) : getAgeGenderValue(indicator, 'Male_0_14')))));
                      const female014 = isVLIndicator ? (female014VL || 0)
                        : (isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) ? (Number(female014EAC ?? 0))
                        : isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Female_0_14')
                        : isProphylaxisIndicator ? getAgeGenderReceiving(indicator, 'Female_0_14')
                        : (isTPTIndicator ? (female014TPT || 0) : (isTLDIndicator ? (female014TLD || 0) : (isMMDIndicator ? (female014Category || 0) : (isLateReengagementIndicator ? (indicator.Female_0_14_Eligible || 0) : getAgeGenderValue(indicator, 'Female_0_14')))));
                      const male15Plus = isVLIndicator ? (male15PlusVL || 0)
                        : (isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) ? (Number(male15PlusEAC ?? 0))
                        : isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Male_over_14')
                        : isProphylaxisIndicator ? getAgeGenderReceiving(indicator, 'Male_over_14')
                        : (isTPTIndicator ? (male15PlusTPT || 0) : (isTLDIndicator ? (male15PlusTLD || 0) : (isMMDIndicator ? (male15PlusCategory || 0) : (isLateReengagementIndicator ? (indicator.Male_over_14_Eligible || 0) : getAgeGenderValue(indicator, 'Male_over_14')))));
                      const female15Plus = isVLIndicator ? (female15PlusVL || 0)
                        : (isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) ? (Number(female15PlusEAC ?? 0))
                        : isBaselineCD4Indicator ? getAgeGenderWithCD4(indicator, 'Female_over_14')
                        : isProphylaxisIndicator ? getAgeGenderReceiving(indicator, 'Female_over_14')
                        : (isTPTIndicator ? (female15PlusTPT || 0) : (isTLDIndicator ? (female15PlusTLD || 0) : (isMMDIndicator ? (female15PlusCategory || 0) : (isLateReengagementIndicator ? (indicator.Female_over_14_Eligible || 0) : getAgeGenderValue(indicator, 'Female_over_14')))));
                      
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
                      let grandTotal = total014 + total15Plus;

                      if (isEACIndicator) {
                        grandTotal = Number(indicator.Received_Counseling || 0);
                      } else if (isEACFollowupIndicator) {
                        grandTotal = Number(indicator.Followup_Received || 0);
                      } else if (isEACSuppressionIndicator) {
                        grandTotal = Number(indicator.Achieved_Suppression || 0);
                      }
                      
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
                      
                      // For TLD Initiation indicator (10a), use Total_Newly_Initiated as denominator
                      // For TLD Cumulative indicator (10b), use Total_ART_Patients as denominator
                      const isTLDInitiationIndicator = isTLDIndicator && indicator.Indicator && indicator.Indicator.includes('newly initiating');
                      const isTLDCumulativeIndicator = isTLDIndicator && indicator.Indicator && indicator.Indicator.includes('cumulative');
                      
                      // For TLD Initiation: denominator is Total_Newly_Initiated from the same indicator
                      // For TLD Cumulative: denominator is Total_ART_Patients (all active ART patients)
                      const total014TLDInitiationDenominator = isTLDInitiationIndicator && indicator.Total_Newly_Initiated 
                        ? (Number(male014TotalTLD || 0) + Number(female014TotalTLD || 0))
                        : null;
                      const total15PlusTLDInitiationDenominator = isTLDInitiationIndicator && indicator.Total_Newly_Initiated
                        ? (Number(male15PlusTotalTLD || 0) + Number(female15PlusTotalTLD || 0))
                        : null;
                      const grandTotalTLDInitiationDenominator = isTLDInitiationIndicator && indicator.Total_Newly_Initiated
                        ? Number(indicator.Total_Newly_Initiated || 0)
                        : null;
                      
                      // For TLD Cumulative: use Total_ART_Patients as denominator
                      const total014TLDCumulativeDenominator = isTLDCumulativeIndicator && indicator.Total_ART_Patients
                        ? (Number(male014TotalTLD || 0) + Number(female014TotalTLD || 0))
                        : null;
                      const total15PlusTLDCumulativeDenominator = isTLDCumulativeIndicator && indicator.Total_ART_Patients
                        ? (Number(male15PlusTotalTLD || 0) + Number(female15PlusTotalTLD || 0))
                        : null;
                      const grandTotalTLDCumulativeDenominator = isTLDCumulativeIndicator && indicator.Total_ART_Patients
                        ? Number(indicator.Total_ART_Patients || 0)
                        : null;
                      
                      // For TPT indicators, use Total_ART_Patients as denominator
                      const total014TPTDenominator = isTPTIndicator && indicator.Total_ART_Patients
                        ? (Number(male014TotalTPT || 0) + Number(female014TotalTPT || 0))
                        : null;
                      const total15PlusTPTDenominator = isTPTIndicator && indicator.Total_ART_Patients
                        ? (Number(male15PlusTotalTPT || 0) + Number(female15PlusTotalTPT || 0))
                        : null;
                      const grandTotalTPTDenominator = isTPTIndicator && indicator.Total_ART_Patients
                        ? Number(indicator.Total_ART_Patients || 0)
                        : null;
                      
                      // For VL indicators, determine denominator based on indicator type
                      // 12a: Total_ART_Patients (all ART patients)
                      // 12b: Total_ART_Patients (all ART patients on ART >= 6 months)
                      // 12c: VL_Tested_12M (tested patients, not all eligible - use Male_0_14_Tested + Female_0_14_Tested)
                      // 12d: Total_ART_Patients (all ART patients on ART >= 6 months)
                      // 12e: Total_With_Dates (patients with VL test dates)
                      
                      // For 12c, extract tested counts for denominator
                      const male014Tested = isVLSuppression12MIndicator ? (indicator.Male_0_14_Tested || 0) : null;
                      const female014Tested = isVLSuppression12MIndicator ? (indicator.Female_0_14_Tested || 0) : null;
                      const male15PlusTested = isVLSuppression12MIndicator ? (indicator.Male_over_14_Tested || 0) : null;
                      const female15PlusTested = isVLSuppression12MIndicator ? (indicator.Female_over_14_Tested || 0) : null;
                      
                      const total014VLDenominator = isVLIndicator ? (
                        isVLSuppression12MIndicator ? (
                          // For 12c, use tested counts as denominator
                          (Number(male014Tested || 0) + Number(female014Tested || 0))
                        ) : (
                          // For other VL indicators, use total counts
                          (indicator.Total_ART_Patients || indicator.Total_Eligible_Patients || indicator.VL_Tested_12M || indicator.Total_With_Dates)
                            ? (Number(male014TotalVL || 0) + Number(female014TotalVL || 0))
                            : null
                        )
                      ) : null;
                      const total15PlusVLDenominator = isVLIndicator ? (
                        isVLSuppression12MIndicator ? (
                          // For 12c, use tested counts as denominator
                          (Number(male15PlusTested || 0) + Number(female15PlusTested || 0))
                        ) : (
                          // For other VL indicators, use total counts
                          (indicator.Total_ART_Patients || indicator.Total_Eligible_Patients || indicator.VL_Tested_12M || indicator.Total_With_Dates)
                            ? (Number(male15PlusTotalVL || 0) + Number(female15PlusTotalVL || 0))
                            : null
                        )
                      ) : null;
                      const grandTotalVLDenominator = isVLIndicator ? (
                        isVLSuppression12MIndicator ? (
                          // For 12c, use VL_Tested_12M as grand total denominator
                          Number(indicator.VL_Tested_12M || 0)
                        ) : (
                          // For other VL indicators, use the standard denominator
                          Number(indicator.Total_ART_Patients || indicator.Total_Eligible_Patients || indicator.VL_Tested_12M || indicator.Total_With_Dates || 0)
                        )
                      ) : null;
                      
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
                      const switchingConsecutiveTotal = isSwitchingIndicator
                        ? (indicator.Total_With_Consecutive_High_VL ?? indicator.Total_Second_Line_With_Consecutive_High_VL ?? null)
                        : null;
                  
                  const isChartView = chartViewIndicators.has(index);
                  const isFirstIndicator = index === 0;
                  const isDiedIndicator = indicator.Indicator?.toLowerCase().includes('died') || indicator.Indicator?.toLowerCase().includes('dead');
                  const shouldShowDetailsTable = isChartView && isFirstIndicator && isDiedIndicator;
                  
                  return (
                        <React.Fragment key={index}>
                          {isChartView ? (
                            <>
                            {/* Chart View - Single row spanning all columns */}
                            <tr className="border-b-2 border-primary/20 bg-muted/30 transition-colors">
                              <td colSpan={hasPercentageColumn(indicator) ? 6 : 5} className="px-6 py-6">
                                <div className="w-full space-y-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-foreground">
                                      {formatIndicatorName(indicator.Indicator || 'Unknown')}
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={() => toggleChartView(index)}
                                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                    >
                                      <Table2 className="h-3 w-3" />
                                      Back to table
                                    </button>
                                  </div>
                                  <div className="bg-background rounded-lg border border-border p-4">
                                    <IndicatorChart indicator={indicator} compact={true} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {/* Detail Table for Indicator 1 */}
                            {shouldShowDetailsTable && (
                              <tr className="border-b-2 border-primary/20 bg-muted/30 transition-colors">
                                <td colSpan={hasPercentageColumn(indicator) ? 6 : 5} className="px-6 py-6">
                                  <div className="w-full space-y-3">
                                    <h5 className="text-sm font-semibold text-foreground mb-3">Detail Records</h5>
                                    {detailsLoading ? (
                                      <div className="text-center py-4 text-muted-foreground">Loading details...</div>
                                    ) : detailsError ? (
                                      <div className="text-center py-4 text-destructive">{detailsError}</div>
                                    ) : indicatorDetails.length === 0 ? (
                                      <div className="text-center py-4 text-muted-foreground">No records found</div>
                                    ) : (
                                      <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-xs">
                                          <thead className="bg-primary text-primary-foreground">
                                            <tr>
                                              <th className="px-2 py-2 text-left border-r">Nº</th>
                                              <th className="px-2 py-2 text-left border-r">ClinicID</th>
                                              <th className="px-2 py-2 text-left border-r">ART</th>
                                              <th className="px-2 py-2 text-left border-r">Sex</th>
                                              <th className="px-2 py-2 text-left border-r">Age</th>
                                              <th className="px-2 py-2 text-left border-r">Date Report Died</th>
                                              <th className="px-2 py-2 text-left border-r">Died Place</th>
                                              <th className="px-2 py-2 text-left">Remark</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {indicatorDetails.slice(0, 10).map((record, idx) => (
                                              <tr key={idx} className="border-b hover:bg-muted/50">
                                                <td className="px-2 py-2 text-center border-r">{idx + 1}</td>
                                                <td className="px-2 py-2 border-r">{record.clinicid || 'N/A'}</td>
                                                <td className="px-2 py-2 border-r">{record.art_number || record.ART || 'N/A'}</td>
                                                <td className="px-2 py-2 border-r">
                                                  {record.sex_display === 'Male' ? 'M' : record.sex_display === 'Female' ? 'F' : record.sex_display || 'N/A'}
                                                </td>
                                                <td className="px-2 py-2 border-r">{record.age || 'N/A'}</td>
                                                <td className="px-2 py-2 border-r">
                                                  {record.death_date ? formatDateForTable(record.death_date) : 'N/A'}
                                                </td>
                                                <td className="px-2 py-2 border-r">{record.death_place || 'N/A'}</td>
                                                <td className="px-2 py-2">{record.death_reason || ''}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        {indicatorDetails.length > 10 && (
                                          <div className="text-center py-2 text-xs text-muted-foreground border-t">
                                            Showing 10 of {indicatorDetails.length} records. Click "View details" to see all.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                            </>
                          ) : (
                            <>
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
                              {(isSameDayIndicator || isArtInitiationIndicator || isTLDIndicator) && indicator.Total_Newly_Initiated !== undefined && (
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
                              {isTPTIndicator && indicator.Total_ART_Patients !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total ART Patients: {formatNumber(indicator.Total_ART_Patients || 0)}
                                </div>
                              )}
                              {(isEACIndicator || isEACFollowupIndicator || isEACSuppressionIndicator) && indicator.Eligible_Patients !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Eligible High VL: {formatNumber(indicator.Eligible_Patients || 0)}
                                </div>
                              )}
                              {isEACIndicator && indicator.Total_High_VL !== undefined && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Total High VL: {formatNumber(indicator.Total_High_VL || 0)}
                                </div>
                              )}
                              {isEACFollowupIndicator && indicator.Followup_Received !== undefined && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Follow-up VL Received: {formatNumber(indicator.Followup_Received || 0)}
                                </div>
                              )}
                              {isEACSuppressionIndicator && indicator.With_Followup_VL !== undefined && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  With Follow-up VL: {formatNumber(indicator.With_Followup_VL || 0)}
                                </div>
                              )}
                              {isEACSuppressionIndicator && indicator.Achieved_Suppression !== undefined && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Achieved Suppression: {formatNumber(indicator.Achieved_Suppression || 0)}
                                </div>
                              )}
                              {isSwitchingIndicator && indicator.Eligible_Patients !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Eligible For Switch: {formatNumber(indicator.Eligible_Patients || 0)}
                                </div>
                              )}
                              {isSwitchingIndicator && switchingConsecutiveTotal !== null && switchingConsecutiveTotal !== undefined && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Consecutive High VL: {formatNumber(switchingConsecutiveTotal || 0)}
                                </div>
                              )}
                              {isRetentionIndicator && (
                                <>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    TX_CURR Prior: {formatNumber(indicator.TX_CURR_Prior || 0)}
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    TX_NEW: {formatNumber(indicator.TX_NEW || 0)}
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    TX_CURR Current: {formatNumber(indicator.TX_CURR_Current || 0)}
                                  </div>
                                  {indicator.Retention_Annualized_Percentage !== undefined && (
                                    <div className="mt-1 text-xs font-semibold text-green-600">
                                      Annualized Retention: {formatNumber(indicator.Retention_Annualized_Percentage || 0)}%
                                    </div>
                                  )}
                                </>
                              )}
                              {isVLSuppression12MIndicator && indicator.VL_Tested_12M !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  VL Tested 12M: {formatNumber(indicator.VL_Tested_12M || 0)}
                                </div>
                              )}
                              {isVLIndicator && !isVLSuppression12MIndicator && indicator.Total_ART_Patients !== undefined && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total ART Patients: {formatNumber(indicator.Total_ART_Patients || 0)}
                                </div>
                              )}
                              {isVLIndicator && indicator.Total_Eligible_Patients !== undefined && indicator.Total_ART_Patients === undefined && !isVLSuppression12MIndicator && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total Eligible: {formatNumber(indicator.Total_Eligible_Patients || 0)}
                                </div>
                              )}
                              {isVLIndicator && indicator.Total_With_Dates !== undefined && indicator.Total_ART_Patients === undefined && indicator.Total_Eligible_Patients === undefined && !isVLSuppression12MIndicator && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Total Tested With Dates: {formatNumber(indicator.Total_With_Dates || 0)}
                                </div>
                              )}
                              {(isArtInitiationIndicator ? (calculatedPercentage !== null && calculatedPercentage !== undefined) : (percentage !== undefined && percentage !== null)) && (
                                <div className="mt-1 text-xs font-semibold text-green-600">
                                  {formatNumber(isArtInitiationIndicator ? calculatedPercentage : percentage)}%
                                </div>
                              )}
                              <div className="mt-3 space-y-2">
                                <button
                                  type="button"
                                  className="text-xs font-semibold text-primary hover:underline focus:outline-none transition-colors"
                                  onClick={() => handleIndicatorClick(indicator)}
                                >
                                  View details
                                </button>
                                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                                  <Table2 className={`h-3.5 w-3.5 transition-colors ${chartViewIndicators.has(index) ? 'text-muted-foreground' : 'text-primary'}`} />
                                  <Switch
                                    checked={chartViewIndicators.has(index)}
                                    onCheckedChange={() => toggleChartView(index)}
                                    className="scale-75"
                                    aria-label="Toggle chart view"
                                  />
                                  <BarChart3 className={`h-3.5 w-3.5 transition-colors ${chartViewIndicators.has(index) ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <span className="text-[10px] text-muted-foreground ml-1">
                                    {chartViewIndicators.has(index) ? 'Chart' : 'Table'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Age 0-14 */}
                            <td className="px-3 py-4 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border">
                              0-14
                            </td>

                            {/* Male 0-14 */}
                            <td className="px-3 py-4 text-right border-r border-border">
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : (isVLIndicator || isTPTIndicator ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400')}`}>
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
                              <div className={`text-lg font-normal ${isReengagementIndicator ? 'text-foreground' : (isVLIndicator || isTPTIndicator ? 'text-pink-600 dark:text-pink-400' : 'text-pink-600 dark:text-pink-400')}`}>
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

                            {/* Percentage column for reengagement, ART initiation, baseline CD4, prophylaxis, MMD, TLD, TPT, and VL indicators */}
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
                              ind.Indicator?.includes('TLD') ||
                              ind.Indicator?.includes('TPT') ||
                        ind.Indicator?.includes('VL') ||
                        ind.Indicator?.includes('retention') ||
                              ind.Indicator?.includes('first line') ||
                              ind.Indicator?.includes('second line') ||
                              ind.Indicator?.includes('third line') ||
                              ind.Indicator?.includes('switch')
                            ) && (
                              <td className="px-3 py-4 text-right">
                                {isReengagementIndicator && total014 > 0 && total014Reengaged !== null ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014Reengaged / total014) * 100)}%
                                  </div>
                                ) : isBaselineCD4Indicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {(() => {
                                      // For baseline CD4 indicator, calculate percentage using _Total fields as denominator
                                      const total014Denominator = (Number(indicator.Male_0_14_Total || 0) + Number(indicator.Female_0_14_Total || 0));
                                      return total014Denominator > 0 ? Math.round((total014 / total014Denominator) * 100) : 0;
                                    })()}%
                                  </div>
                                ) : isBaselineCD4Indicator ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isProphylaxisIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {(() => {
                                      // For prophylaxis indicators, calculate percentage using _Total fields as denominator
                                      const total014Denominator = (Number(indicator.Male_0_14_Total || 0) + Number(indicator.Female_0_14_Total || 0));
                                      return total014Denominator > 0 ? Math.round((total014 / total014Denominator) * 100) : 0;
                                    })()}%
                                  </div>
                                ) : isProphylaxisIndicator ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isMMDIndicator && total014MMD !== null && total014MMD > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014MMD) * 100)}%
                            </div>
                                ) : isMMDIndicator && total014MMD !== null && total014MMD > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isMMDIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTLDInitiationIndicator && total014TLDInitiationDenominator !== null && total014TLDInitiationDenominator > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014TLDInitiationDenominator) * 100)}%
                                  </div>
                                ) : isTLDInitiationIndicator && total014TLDInitiationDenominator !== null && total014TLDInitiationDenominator > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTLDCumulativeIndicator && total014TLDCumulativeDenominator !== null && total014TLDCumulativeDenominator > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014TLDCumulativeDenominator) * 100)}%
                                  </div>
                                ) : isTLDCumulativeIndicator && total014TLDCumulativeDenominator !== null && total014TLDCumulativeDenominator > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTLDIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTPTIndicator && total014TPTDenominator !== null && total014TPTDenominator > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014TPTDenominator) * 100)}%
                                  </div>
                                ) : isTPTIndicator && total014TPTDenominator !== null && total014TPTDenominator > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isTPTIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isVLIndicator && total014VLDenominator !== null && total014VLDenominator > 0 && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round((total014 / total014VLDenominator) * 100)}%
                                  </div>
                                ) : isVLIndicator && total014VLDenominator !== null && total014VLDenominator > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isVLIndicator && total014 > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                ) : isSwitchingIndicator && percentage !== null && percentage !== undefined ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round(percentage)}%
                                  </div>
                                ) : isRetentionIndicator && percentage !== null && percentage !== undefined ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {Math.round(percentage)}%
                                  </div>
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
                                ind.Indicator?.includes('MMD') ||
                                ind.Indicator?.includes('TLD') ||
                                ind.Indicator?.includes('TPT') ||
                                ind.Indicator?.includes('VL') ||
                                ind.Indicator?.includes('retention') ||
                                ind.Indicator?.includes('first line') ||
                                ind.Indicator?.includes('second line') ||
                                ind.Indicator?.includes('third line') ||
                                ind.Indicator?.includes('switch')
                              ) && (
                                <td className="px-3 py-3 text-right">
                                  {isReengagementIndicator && total15Plus > 0 && total15PlusReengaged !== null ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15PlusReengaged / total15Plus) * 100)}%
                                    </div>
                                  ) : isBaselineCD4Indicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {(() => {
                                        // For baseline CD4 indicator, calculate percentage using _Total fields as denominator
                                        const total15PlusDenominator = (Number(indicator.Male_over_14_Total || 0) + Number(indicator.Female_over_14_Total || 0));
                                        return total15PlusDenominator > 0 ? Math.round((total15Plus / total15PlusDenominator) * 100) : 0;
                                      })()}%
                                    </div>
                                  ) : isBaselineCD4Indicator ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isProphylaxisIndicator && total15Plus > 0 ? (
                                  <div className="text-sm font-semibold text-green-600">
                                    {(() => {
                                      // For prophylaxis indicators, calculate percentage using _Total fields as denominator
                                      const total15PlusDenominator = (Number(indicator.Male_over_14_Total || 0) + Number(indicator.Female_over_14_Total || 0));
                                      return total15PlusDenominator > 0 ? Math.round((total15Plus / total15PlusDenominator) * 100) : 0;
                                    })()}%
                                  </div>
                                ) : isProphylaxisIndicator ? (
                                  <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isMMDIndicator && total15PlusMMD !== null && total15PlusMMD > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusMMD) * 100)}%
                                    </div>
                                  ) : isMMDIndicator && total15PlusMMD !== null && total15PlusMMD > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isMMDIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTLDInitiationIndicator && total15PlusTLDInitiationDenominator !== null && total15PlusTLDInitiationDenominator > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusTLDInitiationDenominator) * 100)}%
                                    </div>
                                  ) : isTLDInitiationIndicator && total15PlusTLDInitiationDenominator !== null && total15PlusTLDInitiationDenominator > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTLDCumulativeIndicator && total15PlusTLDCumulativeDenominator !== null && total15PlusTLDCumulativeDenominator > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusTLDCumulativeDenominator) * 100)}%
                                    </div>
                                  ) : isTLDCumulativeIndicator && total15PlusTLDCumulativeDenominator !== null && total15PlusTLDCumulativeDenominator > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTLDIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTPTIndicator && total15PlusTPTDenominator !== null && total15PlusTPTDenominator > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusTPTDenominator) * 100)}%
                                    </div>
                                  ) : isTPTIndicator && total15PlusTPTDenominator !== null && total15PlusTPTDenominator > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isTPTIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isVLIndicator && total15PlusVLDenominator !== null && total15PlusVLDenominator > 0 && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round((total15Plus / total15PlusVLDenominator) * 100)}%
                                    </div>
                                  ) : isVLIndicator && total15PlusVLDenominator !== null && total15PlusVLDenominator > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isVLIndicator && total15Plus > 0 ? (
                                    <div className="text-sm font-semibold text-green-600">0%</div>
                                  ) : isSwitchingIndicator && percentage !== null && percentage !== undefined ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round(percentage)}%
                                    </div>
                                  ) : isRetentionIndicator && percentage !== null && percentage !== undefined ? (
                                    <div className="text-sm font-semibold text-green-600">
                                      {Math.round(percentage)}%
                                    </div>
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
                                ind.Indicator?.includes('MMD') ||
                                ind.Indicator?.includes('TLD') ||
                                ind.Indicator?.includes('TPT') ||
                                ind.Indicator?.includes('VL') ||
                                ind.Indicator?.includes('retention') ||
                                ind.Indicator?.includes('first line') ||
                                ind.Indicator?.includes('second line') ||
                                ind.Indicator?.includes('third line') ||
                                ind.Indicator?.includes('switch')
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
                                  ) : isTLDInitiationIndicator && grandTotalTLDInitiationDenominator !== null && grandTotalTLDInitiationDenominator > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalTLDInitiationDenominator) * 100)}%
                                    </div>
                                  ) : isTLDInitiationIndicator && grandTotalTLDInitiationDenominator !== null && grandTotalTLDInitiationDenominator > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTLDCumulativeIndicator && grandTotalTLDCumulativeDenominator !== null && grandTotalTLDCumulativeDenominator > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalTLDCumulativeDenominator) * 100)}%
                                    </div>
                                  ) : isTLDCumulativeIndicator && grandTotalTLDCumulativeDenominator !== null && grandTotalTLDCumulativeDenominator > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTLDIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTPTIndicator && grandTotalTPTDenominator !== null && grandTotalTPTDenominator > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalTPTDenominator) * 100)}%
                                    </div>
                                  ) : isTPTIndicator && grandTotalTPTDenominator !== null && grandTotalTPTDenominator > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isTPTIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isVLIndicator && grandTotalVLDenominator !== null && grandTotalVLDenominator > 0 && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round((grandTotal / grandTotalVLDenominator) * 100)}%
                                    </div>
                                  ) : isVLIndicator && grandTotalVLDenominator !== null && grandTotalVLDenominator > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isVLIndicator && grandTotal > 0 ? (
                                    <div className="text-lg font-bold text-green-700">0%</div>
                                  ) : isRetentionIndicator && percentage !== null && percentage !== undefined ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round(percentage)}%
                                    </div>
                                  ) : isSwitchingIndicator && percentage !== null && percentage !== undefined ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {Math.round(percentage)}%
                                    </div>
                                  ) : isArtInitiationIndicator && totalNewlyInitiated > 0 ? (
                                    <div className="text-lg font-bold text-green-700">
                                      {calculatedPercentage !== null && calculatedPercentage !== undefined ? calculatedPercentage : (grandTotal > 0 ? Math.round((grandTotal / totalNewlyInitiated) * 100) : 0)}%
                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">—</div>
                                  )}
                                </td>
                              )}
                            </tr>
                            </>
                          )}
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
      <IndicatorDetailsModal
        isOpen={showDetailsModal}
        onClose={handleModalClose}
        selectedIndicator={selectedIndicator}
        indicatorDetails={indicatorDetails}
        pagination={pagination}
        detailsLoading={detailsLoading}
        searchLoading={searchLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        currentFilters={currentFilters}
        selectedSite={selectedSite}
        dateRange={dateRange}
        error={detailsError}
        isSampleData={isSampleData}
        sampleDataInfo={sampleDataInfo}
      />
    </>
  );
};

export default MortalityRetentionIndicators;
