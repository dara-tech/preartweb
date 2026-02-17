import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import siteApi from '../../services/siteApi';
import reportingApi from '../../services/reportingApi';
import { IndicatorDetailsModal } from '../../components/modals';
import { useAuth } from '../../contexts/AuthContext';
import {
  ReportHeader,
  ReportConfiguration,
  IndicatorsTable,
  ReportPreview,
  generateAvailableYears,
  generateAvailableQuarters,
  getDateRangeForYearQuarter,
  calculateSummaryStats,
  validateDataConsistency,
  generateReportHTML
} from '../../components/indicators';

const IndicatorsReport = () => {
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
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    previousEndDate: '2024-12-31'
  });
  const [activeTab, setActiveTab] = useState('all');
  
  // Year and Quarter selection
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    // If we're in Q1 (months 0-2), show previous year for Q4
    return currentQuarter === 1 ? currentYear - 1 : currentYear;
  });
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    // Always show the last completed quarter
    // If we're in Q1 (months 0-2), show Q4 of previous year
    // If we're in Q2 (months 3-5), show Q1
    // If we're in Q3 (months 6-8), show Q2
    // If we're in Q4 (months 9-11), show Q3
    return currentQuarter === 1 ? 4 : currentQuarter - 1;
  });
  
  // Site filtering
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [sitesLoading, setSitesLoading] = useState(false);
  
  // Auto-select first site when sites are loaded
  // "All Sites" functionality is disabled
  
  // Enterprise-level state
  const [summaryStats, setSummaryStats] = useState({
    activePatients: 0,
    newEnrolled: 0,
    viralSuppressed: 0,
    tptCompleted: 0
  });
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorDetails, setIndicatorDetails] = useState([]);
  const [pagination, setPagination] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [detailsError, setDetailsError] = useState(null);
  const [isSampleData, setIsSampleData] = useState(false);
  const [sampleDataInfo, setSampleDataInfo] = useState(null);

  // Debug modal state changes (only when modal opens with data)
  useEffect(() => {
    if (showDetailsModal && indicatorDetails.length > 0) {
      // Modal opened with data
    }
  }, [showDetailsModal, selectedIndicator, indicatorDetails]);


  // Generate available years and quarters
  const availableYears = generateAvailableYears();
  const availableQuarters = generateAvailableQuarters(selectedYear);


  // Handle year change
  const handleYearChange = (year) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    
    // Always use the last completed quarter logic
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const lastCompletedQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    
    // If selecting current year, use last completed quarter
    // If selecting previous year, allow any quarter
    if (newYear === currentYear) {
      setSelectedQuarter(lastCompletedQuarter);
      const dateRange = getDateRangeForYearQuarter(newYear, lastCompletedQuarter);
      setDateRange(dateRange);
    } else {
      const dateRange = getDateRangeForYearQuarter(newYear, selectedQuarter);
      setDateRange(dateRange);
    }
  };

  // Handle quarter change
  const handleQuarterChange = (quarter) => {
    const newQuarter = parseInt(quarter);
    setSelectedQuarter(newQuarter);
    
    const dateRange = getDateRangeForYearQuarter(selectedYear, newQuarter);
    setDateRange(dateRange);
  };


  const fetchIndicators = useCallback(async (category = 'all') => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const params = { 
        ...dateRange,
        useCache: true
      };
      
      // Only add siteCode if a specific site is selected (not "All Sites")
      if (selectedSite) {
        params.siteCode = selectedSite.code;
      }
      
      // Always get all indicators, filtering will be done on frontend
      const response = await reportingApi.getAllIndicators(params);
      
      if (response.success) {
        // Process the data based on whether it's site-specific or all sites
        let indicatorsData = [];
        
        if (selectedSite) {
          // Site-specific data: response.data is an array of indicator objects
          indicatorsData = response.data.map(indicatorData => ({
            Indicator: indicatorData.Indicator,
            TOTAL: Number(indicatorData.TOTAL || 0),
            Male_0_14: Number(indicatorData.Male_0_14 || 0),
            Female_0_14: Number(indicatorData.Female_0_14 || 0),
            Male_over_14: Number(indicatorData.Male_over_14 || 0),
            Female_over_14: Number(indicatorData.Female_over_14 || 0),
            error: indicatorData.error || null
          }));
        } else {
          // All sites data: response.data is an array of indicator objects (already aggregated by backend)
          indicatorsData = response.data.map(indicatorData => ({
            Indicator: indicatorData.Indicator,
            TOTAL: Number(indicatorData.TOTAL || 0),
            Male_0_14: Number(indicatorData.Male_0_14 || 0),
            Female_0_14: Number(indicatorData.Female_0_14 || 0),
            Male_over_14: Number(indicatorData.Male_over_14 || 0),
            Female_over_14: Number(indicatorData.Female_over_14 || 0),
            error: indicatorData.error || null
          }));
        }
        
        // Filter indicators to show only 1-10.8 range and sort them properly
        const filteredIndicators = indicatorsData.filter(indicator => {
          if (!indicator.Indicator) return false;
          
          // First try to extract number from the beginning (e.g., "1. Active ART...")
          let match = indicator.Indicator.match(/^(\d+(?:\.\d+)*)/);
          if (match) {
            const indicatorNum = parseFloat(match[1]);
            return indicatorNum >= 1 && indicatorNum <= 10.8;
          }
          
          // If no number prefix, check if it's a known indicator by name
          const knownIndicators = [
            'Active ART patients in previous quarter',
            'Active Pre-ART patients in previous quarter', 
            'Newly Enrolled',
            'Re-tested positive',
            'Newly Initiated',
            'New ART started: Same day',
            'New ART started: 1-7 days',
            'New ART started: >7 days',
            'New ART started with TLD',
            'Transfer-in patients',
            'Lost and Return',
            'Dead',
            'Lost to follow up (LTFU)',
            'Transfer-out',
            'Active Pre-ART',
            'Active ART patients in this quarter',
            'Eligible MMD',
            'MMD',
            'TLD',
            'TPT Start',
            'TPT Complete',
            'Eligible for VL test',
            'VL tested in 12M',
            'VL suppression'
          ];
          
          return knownIndicators.includes(indicator.Indicator);
        }).sort((a, b) => {
          // Sort indicators in the correct order 1-10.8
          const getIndicatorNumber = (indicator) => {
            // First try to extract number from the beginning
            const match = indicator.Indicator.match(/^(\d+(?:\.\d+)*)/);
            if (match) {
              return parseFloat(match[1]);
            }
            
            // Map indicator names to their numbers for sorting
            const nameToNumber = {
              'Active ART patients in previous quarter': 1,
              'Active Pre-ART patients in previous quarter': 2,
              'Newly Enrolled': 3,
              'Re-tested positive': 4,
              'Newly Initiated': 5,
              'New ART started: Same day': 5.1,
              'New ART started: 1-7 days': 5.1,
              'New ART started: >7 days': 5.1,
              'New ART started with TLD': 5.2,
              'Transfer-in patients': 6,
              'Lost and Return': 7,
              'Dead': 8.1,
              'Lost to follow up (LTFU)': 8.2,
              'Transfer-out': 8.3,
              'Active Pre-ART': 9,
              'Active ART patients in this quarter': 10,
              'Eligible MMD': 10.1,
              'MMD': 10.2,
              'TLD': 10.3,
              'TPT Start': 10.4,
              'TPT Complete': 10.5,
              'Eligible for VL test': 10.6,
              'VL tested in 12M': 10.7,
              'VL suppression': 10.8
            };
            
            return nameToNumber[indicator.Indicator] || 999; // Put unknown indicators at the end
          };
          
          return getIndicatorNumber(a) - getIndicatorNumber(b);
        });
        
        setIndicators(filteredIndicators);
        
        // Calculate and update summary statistics
        const stats = calculateSummaryStats(filteredIndicators);
        setSummaryStats(stats);
        
        // Validate data consistency
        const validationResults = validateDataConsistency(stats, filteredIndicators);
        if (validationResults.hasMismatches) {
          console.warn('Data consistency issues found:', validationResults.mismatches);
        }
        
        setIsInitialLoad(false);
      } else {
        setError(response.data.message || 'Failed to fetch indicators');
      }
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setError(err.response?.data?.message || 'Failed to fetch indicators');
    } finally {
      // Add minimum loading time to prevent flashing
      setTimeout(() => {
        setLoading(false);
        isLoadingRef.current = false;
      }, 500);
    }
  }, [dateRange, selectedSite]);

  // Load sites on component mount
  const loadSites = useCallback(async () => {
    try {
      setSitesLoading(true);
      const response = await siteApi.getAllSites();
      
      // Handle the response structure properly
      const sitesData = response.sites || response.data || response;
      
      // Backend now returns only active sites (status = 1)
      setSites(sitesData);
      
      // Auto-select first site if none is selected
      if (sitesData && sitesData.length > 0 && !selectedSite) {
        setSelectedSite(sitesData[0]);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
      // Fallback to all sites if the new endpoint fails
      try {
        const fallbackResponse = await siteApi.getAllSites();
        const fallbackSites = fallbackResponse.sites || fallbackResponse.data || fallbackResponse;
        // Remove duplicates based on site code (backend now filters for active sites)
        const uniqueSites = fallbackSites.filter((site, index, self) => 
          index === self.findIndex(s => s.code === site.code)
        );
        setSites(uniqueSites);
        
        // Auto-select first site if none is selected
        if (uniqueSites && uniqueSites.length > 0 && !selectedSite) {
          setSelectedSite(uniqueSites[0]);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback sites:', fallbackError);
        setSites([]);
      }
    } finally {
      setSitesLoading(false);
    }
  }, []);

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Initialize date range on component mount
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    // Always use the last completed quarter
    const initialYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    const initialQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const initialDateRange = getDateRangeForYearQuarter(initialYear, initialQuarter);
    setDateRange(initialDateRange);
  }, []);

  useEffect(() => {
    // Debounce the request to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      fetchIndicators(activeTab);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab, dateRange.startDate, dateRange.endDate, dateRange.previousEndDate, fetchIndicators]);

  // Fetch data when site selection changes
  useEffect(() => {
    if (!isInitialLoad) {
      const timeoutId = setTimeout(() => {
        fetchIndicators(activeTab);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedSite, fetchIndicators, activeTab, isInitialLoad]);


  const handleRefresh = () => {
    // Clear any cached data and force fresh fetch
    setIndicators([]);
    setSummaryStats({
      activePatients: 0,
      newEnrolled: 0,
      viralSuppressed: 0,
      tptCompleted: 0
    });
    fetchIndicators(activeTab);
  };

  // Modal handlers
  const handleIndicatorClick = async (indicator, filters = {}) => {
    setSelectedIndicator(indicator);
    setCurrentFilters(filters);
    setShowDetailsModal(true);
    setSearchTerm('');
    setDetailsError(null);
    
    await fetchIndicatorDetails(indicator, 1, '', filters);
  };

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setSelectedIndicator(null);
    setIndicatorDetails([]);
    setPagination({});
    setSearchTerm('');
    setCurrentFilters({});
    setDetailsError(null);
    setIsSampleData(false);
    setSampleDataInfo(null);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSearch = async (page = 1, search = searchTerm) => {
    if (!selectedIndicator) return;
    setSearchLoading(true);
    await fetchIndicatorDetails(selectedIndicator, page, search, currentFilters);
    setSearchLoading(false);
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    if (selectedIndicator) {
      await fetchIndicatorDetails(selectedIndicator, 1, '', currentFilters);
    }
  };

  const handlePageChange = async (page) => {
    if (!selectedIndicator) return;
    await fetchIndicatorDetails(selectedIndicator, page, searchTerm, currentFilters);
  };

  const fetchIndicatorDetails = async (indicator, page = 1, search = '', filters = {}) => {
    if (!indicator) {
      return;
    }
    
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      // Map indicator names to their corresponding SQL file names
      // Handle both numbered and non-numbered indicator names
      const indicatorMap = {
        // Numbered versions (from original data)
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
        
        // Non-numbered versions (from analytics data)
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

      const indicatorKey = indicatorMap[indicator.Indicator] || indicator.Indicator;
      
      // For details queries, use the same date range as the aggregate
      // This ensures consistency between aggregate display and detail modal
      const detailsDateRange = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        previousEndDate: dateRange.previousEndDate
      };
      
      // Build filter parameters
      const filterParams = {
        ...detailsDateRange,
        page,
        limit: 100,
        search, // Use 'search' parameter name
        _t: Date.now() // Cache busting
      };

      // Add gender and age group filters if provided
      if (filters.gender) {
        filterParams.gender = filters.gender;
      }
      if (filters.ageGroup) {
        filterParams.ageGroup = filters.ageGroup;
      }

      const response = await reportingApi.getIndicatorDetails(indicatorKey, {
        ...filterParams,
        siteCode: selectedSite?.code
      });

      if (response.success) {
        setIndicatorDetails(response.data || []);
        setPagination(response.pagination || {});
        setDetailsError(null);
        
        // Check if this is sample data or aggregated data
        if (response.isSampleData) {
          setIsSampleData(true);
          setSampleDataInfo({
            sampleSite: response.sampleSite,
            message: response.message
          });
        } else if (response.isAggregatedData) {
          setIsSampleData(false);
          setSampleDataInfo({
            isAggregated: true,
            sourceSites: response.sourceSites,
            message: response.message
          });
        } else {
          setIsSampleData(false);
          setSampleDataInfo(null);
        }
      } else {
        console.error('Failed to fetch details:', response.message);
        setIndicatorDetails([]);
        setPagination({});
        setDetailsError(response.message || 'Failed to fetch indicator details');
      }
    } catch (error) {
      console.error('Error fetching indicator details:', error);
      setIndicatorDetails([]);
      setPagination({});
      setDetailsError(error.message || 'Failed to fetch indicator details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const exportToCSV = useCallback(() => {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportTitle = `National ART Indicators Report - ${dateRange.startDate} to ${dateRange.endDate}`;
    
    const csvContent = [
      [reportTitle],
      [`Generated on: ${new Date().toLocaleString()}`],
      [''],
      ['EXECUTIVE SUMMARY'],
      ['Active ART Patients', summaryStats.activePatients.toLocaleString()],
      ['Newly Enrolled', summaryStats.newEnrolled.toLocaleString()],
      ['Viral Suppressed', summaryStats.viralSuppressed.toLocaleString()],
      ['TPT Completed', summaryStats.tptCompleted.toLocaleString()],
      [''],
      ['DETAILED INDICATORS'],
      ['Indicator', 'Total', 'Male 0-14', 'Female 0-14', 'Male 15+', 'Female 15+'],
      ...indicators.map(indicator => [
        indicator.Indicator || '',
        indicator.TOTAL || 0,
        indicator.Male_0_14 || 0,
        indicator.Female_0_14 || 0,
        indicator.Male_over_14 || 0,
        indicator.Female_over_14 || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `national-art-report-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [dateRange, summaryStats, indicators]);

  // Allow global viewer download button to trigger export
  useEffect(() => {
    if (!isViewer) return
    const handle = () => {
      exportToCSV()
    }
    window.addEventListener('viewer-download', handle)
    return () => {
      window.removeEventListener('viewer-download', handle)
    }
  }, [isViewer, exportToCSV]);

  // Helper functions for print
  const getProvinceName = (site) => {
    if (!site) return 'Unknown';
    
    // If site has province field, use it directly
    if (site.province) {
      return site.province;
    }
    
    // Fallback to site code parsing if province not available
    if (site.code) {
      const provinceCode = site.code.substring(0, 2);
      return `${provinceCode}. Unknown Province`;
    }
    
    return 'Unknown Province';
  };

  const getOperationalDistrict = (site) => {
    if (!site || !site.code) return 'Unknown';
    
    const districtCode = site.code.substring(0, 4);
    const siteName = site.name || '';
    
    // Extract district name from site name (usually the second part after province)
    const nameParts = siteName.split(' ');
    const districtName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : siteName;
    
    return `OD ${districtCode}. ${districtName}`;
  };

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
      '6. Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
      '7. Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
      '7.1. In the same ART site': '7.1. នៅក្នុងសេវា ART តែមួយ (In the same ART site)',
      '7.2. From other ART site': '7.2. មកពីសេវា ART ផ្សេង (From other ART site)',
      '8.1. Dead': '8.1. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
      '8.2. Lost to follow up (LTFU)': '8.2. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
      '8.3. Transfer-out': '8.3. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
      '9. Active Pre-ART': '9. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active Pre-ART patients in this quarter)',
      '10. Active ART patients in this quarter': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
      '10.1. Eligible MMD': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសំរាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
      '10.2. MMD': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
      '10.3. TLD': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
      '10.4. TPT Start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
      '10.5. TPT Complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
      '10.6. Eligible for VL test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
      '10.7. VL tested in 12M': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
      '10.8. VL suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)'
    };
    return nameMap[backendName] || backendName;
  };

  const generateReportHTMLContent = () => {
    return generateReportHTML(indicators, selectedSite, selectedYear, selectedQuarter, sites);
   };

   const previewReport = () => {
     const htmlContent = generateReportHTMLContent();
     setPreviewContent(htmlContent);
     setShowPreview(true);
   };

   const printToPDF = () => {
     // Create a new window for printing
     const printWindow = window.open('', '_blank');
     const htmlContent = generateReportHTMLContent();
     
     // Write content to the new window
     printWindow.document.write(htmlContent);
     printWindow.document.close();
     
     // Wait for content to load, then trigger print
     printWindow.onload = () => {
       printWindow.focus();
       printWindow.print();
       printWindow.close();
     };
   };


  return (
    <div className="min-h-screen bg-background mx-auto lg:max-w-[300mm] px-4 sm:px-6 py-4 sm:py-6">
      <div className="space-y-4">
        {/* Report Configuration Panel */}
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
          onPreview={previewReport}
          onPrint={printToPDF}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
          isViewer={isViewer}
        />

        {/* Executive Summary Dashboard */}
        {/* <ExecutiveSummary summaryStats={summaryStats} /> */}
        <ReportHeader 
          selectedSite={selectedSite}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
        />

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Indicators Table */}
        <div className="bg-card border border-border overflow-hidden rounded-none">
          <div className="p-0">
              <IndicatorsTable 
                indicators={indicators} 
                loading={loading} 
                onIndicatorClick={handleIndicatorClick}
                selectedSite={selectedSite}
                selectedYear={selectedYear}
                selectedQuarter={selectedQuarter}
                isViewer={isViewer}
              />
          </div>
        </div>

        {/* Indicator Details Modal */}
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
          onClearSearch={handleClearSearch}
          onPageChange={handlePageChange}
          currentFilters={currentFilters}
          selectedSite={selectedSite}
          dateRange={dateRange}
          error={detailsError}
          isSampleData={isSampleData}
          sampleDataInfo={sampleDataInfo}
        />

        {/* Preview Modal */}
        <ReportPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          previewContent={previewContent}
          onPrint={printToPDF}
                />
              </div>
            </div>
  );
};



export default IndicatorsReport;
