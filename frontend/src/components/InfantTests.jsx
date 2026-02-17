import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  TestTube,
  AlertCircle,
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
  Baby,
  Dna,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
  XCircle,
  Minus,
  FileText,
  User,
  Heart,
  Weight
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
import infantTestApi from '../services/infantTestApi';
import siteApi from '../services/siteApi';
import labTestApi from '../services/labTestApi';

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

// Lab Data Comparison Component
const LabDataComparison = ({ infantTests, labData, filters }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonPage, setComparisonPage] = useState(1);
  const [comparisonPageSize] = useState(20);
  const [sortField, setSortField] = useState('clinicId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Compare lab data with infant test data
  useEffect(() => {
    if (!infantTests || !labData) return;

    const comparison = [];
    
    // Process lab data
    labData.forEach(labResult => {
      const labClinicId = labResult.clinic_id?.trim();
      if (!labClinicId) return;

      // Find matching infant test
      const matchingInfantTest = infantTests.find(infant => 
        infant.ClinicID?.trim() === labClinicId
      );

      const comparisonItem = {
        clinicId: labClinicId,
        labData: labResult,
        infantData: matchingInfantTest || null,
        dataEntryStatus: {
          databaseEntry: !!matchingInfantTest,
          resultIssued: !!labResult.issued_dt,
          bloodCollected: !!labResult.collect_blood_dt,
          bloodReceived: !!labResult.receive_blood_dt,
          validated: !!labResult.validated_dt,
          tested: !!labResult.test_blood_dt
        },
        missingFields: [],
        resultComparison: {
          labResult: labResult.result2,
          infantResult: matchingInfantTest?.testResultDesc,
          resultsMatch: false
        }
      };

      // Check for missing workflow fields
      if (!labResult.collect_blood_dt) comparisonItem.missingFields.push('Blood Collection Date');
      if (!labResult.receive_blood_dt) comparisonItem.missingFields.push('Blood Received Date');
      if (!labResult.validated_dt) comparisonItem.missingFields.push('Validation Date');
      if (!labResult.test_blood_dt) comparisonItem.missingFields.push('Test Date');
      if (!labResult.issued_dt) comparisonItem.missingFields.push('Result Issued Date');

      // Compare results
      if (matchingInfantTest && labResult.result2) {
        const labResultValue = labResult.result2.toLowerCase();
        const infantResultValue = matchingInfantTest.testResultDesc?.toLowerCase();
        
        if (labResultValue === 'not detected' && infantResultValue === 'negative') {
          comparisonItem.resultComparison.resultsMatch = true;
        } else if (labResultValue !== 'not detected' && infantResultValue === 'positive') {
          comparisonItem.resultComparison.resultsMatch = true;
        }
      }

      comparison.push(comparisonItem);
    });

    // Add infant tests that don't have lab data
    infantTests.forEach(infant => {
      if (infant.ClinicID && !labData.some(lab => lab.clinic_id?.trim() === infant.ClinicID?.trim())) {
        comparison.push({
          clinicId: infant.ClinicID,
          labData: null,
          infantData: infant,
          dataEntryStatus: {
            databaseEntry: true,
            resultIssued: false,
            bloodCollected: false,
            bloodReceived: false,
            validated: false,
            tested: false
          },
          missingFields: ['Lab Data'],
          resultComparison: {
            labResult: null,
            infantResult: infant.testResultDesc,
            resultsMatch: false
          }
        });
      }
    });

    setComparisonData(comparison);
    setComparisonPage(1);
  }, [infantTests, labData]);

  // Filter comparison data
  const getFilteredComparisonData = () => {
    return comparisonData.filter(item => {
      switch (statusFilter) {
        case 'complete':
          return item.dataEntryStatus.databaseEntry && 
                 item.dataEntryStatus.resultIssued &&
                 item.missingFields.length === 0;
        case 'incomplete':
          return item.missingFields.length > 0 && item.labData;
        case 'missing_lab':
          return !item.labData && item.infantData;
        case 'mismatch':
          return item.resultComparison.labResult && 
                 item.resultComparison.infantResult &&
                 !item.resultComparison.resultsMatch;
        default:
          return true;
      }
    });
  };

  // Sort comparison data
  const getSortedComparisonData = () => {
    const filtered = getFilteredComparisonData();
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'clinicId':
          aValue = a.clinicId || '';
          bValue = b.clinicId || '';
          break;
        case 'labResult':
          aValue = a.resultComparison.labResult || '';
          bValue = b.resultComparison.labResult || '';
          break;
        case 'infantResult':
          aValue = a.resultComparison.infantResult || '';
          bValue = b.resultComparison.infantResult || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  // Calculate metrics
  const totalLabRecords = comparisonData.filter(item => item.labData).length;
  const totalInfantRecords = comparisonData.filter(item => item.infantData).length;
  const completeEntries = comparisonData.filter(item => 
    item.dataEntryStatus.databaseEntry && 
    item.dataEntryStatus.resultIssued &&
    item.missingFields.length === 0
  ).length;
  const incompleteEntries = comparisonData.filter(item => 
    item.missingFields.length > 0 && item.labData
  ).length;
  const missingLabWorkflow = comparisonData.filter(item => 
    !item.labData && item.infantData
  ).length;
  const resultMismatches = comparisonData.filter(item => 
    item.resultComparison.labResult && 
    item.resultComparison.infantResult &&
    !item.resultComparison.resultsMatch
  ).length;

  // Sortable Table Head Component
  const SortableTableHead = ({ field, children }) => {
    const isSorted = sortField === field;
    const Icon = isSorted 
      ? (sortDirection === 'asc' ? ArrowUp : ArrowDown)
      : ArrowUpDown;

    return (
      <TableHead 
        className="cursor-pointer select-none"
        onClick={() => {
          if (isSorted) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          } else {
            setSortField(field);
            setSortDirection('asc');
          }
        }}
      >
        <div className="flex items-center gap-1">
          {children}
          <Icon className="h-3 w-3" />
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Lab Records</p>
                <p className="text-2xl font-bold">{totalLabRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Baby className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Database Records</p>
                <p className="text-2xl font-bold">{totalInfantRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Complete</p>
                <p className="text-2xl font-bold">{completeEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-warning-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold">{incompleteEntries + missingLabWorkflow + resultMismatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setStatusFilter('all');
            setComparisonPage(1);
          }}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          All Records
          <Badge variant="secondary" className="ml-1">
            {comparisonData.length}
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
            {completeEntries}
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
            {incompleteEntries}
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
            {missingLabWorkflow}
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
          <AlertCircle className="h-4 w-4" />
          Result Mismatches
          <Badge variant="secondary" className="ml-1 bg-destructive/10 text-destructive">
            {resultMismatches}
          </Badge>
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead field="clinicId">Clinic ID</SortableTableHead>
              <SortableTableHead field="labResult">Lab Result</SortableTableHead>
              <SortableTableHead field="infantResult">Database Result</SortableTableHead>
              <TableHead>Status</TableHead>
              <TableHead>Missing Fields</TableHead>
              <TableHead>Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedComparisonData()
              .slice((comparisonPage - 1) * comparisonPageSize, comparisonPage * comparisonPageSize)
              .map((item, index) => (
                <TableRow key={`${item.clinicId}-${index}`}>
                  <TableCell className="font-medium">{item.clinicId}</TableCell>
                  <TableCell>
                    {item.resultComparison.labResult || '-'}
                  </TableCell>
                  <TableCell>
                    {item.resultComparison.infantResult || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {item.dataEntryStatus.databaseEntry && (
                        <Badge variant="secondary" className="text-xs">DB Entry</Badge>
                      )}
                      {item.dataEntryStatus.resultIssued && (
                        <Badge variant="secondary" className="text-xs">Issued</Badge>
                      )}
                      {!item.labData && (
                        <Badge variant="destructive" className="text-xs">No Lab Data</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.missingFields.length > 0 ? (
                      <div className="text-xs text-warning-foreground">
                        {item.missingFields.slice(0, 2).join(', ')}
                        {item.missingFields.length > 2 && ` +${item.missingFields.length - 2} more`}
                      </div>
                    ) : (
                      <span className="text-xs text-primary">Complete</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.resultComparison.labResult && item.resultComparison.infantResult ? (
                      <Badge 
                        variant={item.resultComparison.resultsMatch ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.resultComparison.resultsMatch ? 'Match' : 'Mismatch'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {Math.ceil(getFilteredComparisonData().length / comparisonPageSize) > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((comparisonPage - 1) * comparisonPageSize) + 1} to{' '}
            {Math.min(comparisonPage * comparisonPageSize, getFilteredComparisonData().length)} of{' '}
            {getFilteredComparisonData().length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonPage(Math.max(1, comparisonPage - 1))}
              disabled={comparisonPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonPage(comparisonPage + 1)}
              disabled={comparisonPage >= Math.ceil(getFilteredComparisonData().length / comparisonPageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const InfantTests = () => {
  const [infantTests, setInfantTests] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('visitDate');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSortField, setTableSortField] = useState('visitDate');
  const [tableSortDirection, setTableSortDirection] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [labTestStats, setLabTestStats] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState(null);
  const [performance, setPerformance] = useState(null);
  
  // Enhanced UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickViewDrawer, setQuickViewDrawer] = useState({
    isOpen: false,
    data: null
  });
  const [visibleColumns, setVisibleColumns] = useState({
    clinic_id: true,
    visit_date: true,
    age: true,
    sex: true,
    weight: true,
    height: true,
    test_types: true,
    result: true,
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

  const [filters, setFilters] = useState(() => {
    const fiscalQuarter = getCurrentFiscalQuarter();
    return {
      site: 'all',
      startDate: fiscalQuarter.startDate,
      endDate: fiscalQuarter.endDate,
      testType: 'dna',
      clinicId: '',
      selectedQuarter: 'current'
    };
  });

  // Quarter functionality
  const [selectedQuarterNum, setSelectedQuarterNum] = useState(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    if (currentMonth >= 0 && currentMonth <= 2) return 1;
    if (currentMonth >= 3 && currentMonth <= 5) return 2;
    if (currentMonth >= 6 && currentMonth <= 8) return 3;
    return 4;
  });

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() => {
    return new Date().getFullYear();
  });

  // Period picker state
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [currentDecade, setCurrentDecade] = useState(Math.floor(new Date().getFullYear() / 10) * 10);
  const pickerRef = useRef(null);

  // Get quarter dates based on quarter selection
  const getQuarterDates = (quarterValue) => {
    if (!quarterValue || quarterValue === 'custom') {
      return null;
    }

    // Handle current quarter
    if (quarterValue === 'current') {
      return getCurrentFiscalQuarter();
    }

    // Parse quarter value like "Q1-2025"
    const [quarter, year] = quarterValue.split('-');
    const quarterNum = parseInt(quarter.replace('Q', ''));
    const yearNum = parseInt(year);

    let quarterStartMonth, quarterEndMonth;

    switch (quarterNum) {
      case 1:
        quarterStartMonth = 0; // January
        quarterEndMonth = 2;   // March
        break;
      case 2:
        quarterStartMonth = 3; // April
        quarterEndMonth = 5;   // June
        break;
      case 3:
        quarterStartMonth = 6; // July
        quarterEndMonth = 8;   // September
        break;
      case 4:
        quarterStartMonth = 9; // October
        quarterEndMonth = 11;  // December
        break;
      default:
        return getCurrentFiscalQuarter();
    }

    const startDate = `${yearNum}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(yearNum, quarterEndMonth + 1, 0).getDate();
    const endDate = `${yearNum}-${String(quarterEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return { startDate, endDate };
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
      newYear = selectedFiscalYear - 1;
    }

    navigateToQuarter(newQuarter, newYear);
  };

  // Navigate to next quarter
  const goToNextQuarter = () => {
    let newQuarter = selectedQuarterNum + 1;
    let newYear = selectedFiscalYear;

    if (newQuarter > 4) {
      newQuarter = 1;
      newYear = selectedFiscalYear + 1;
    }

    navigateToQuarter(newQuarter, newYear);
  };

  // Navigate to current quarter
  const goToCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    let quarter;

    const month = now.getMonth();
    if (month >= 0 && month <= 2) {
      quarter = 1;
    } else if (month >= 3 && month <= 5) {
      quarter = 2;
    } else if (month >= 6 && month <= 8) {
      quarter = 3;
    } else {
      quarter = 4;
    }

    navigateToQuarter(quarter, year);
  };

  // Navigate to first quarter of year
  const goToFirstQuarter = (year) => {
    navigateToQuarter(1, year);
  };

  // Check if we're on current quarter
  const isCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    let currentQuarter;

    const month = now.getMonth();
    if (month >= 0 && month <= 2) {
      currentQuarter = 1;
    } else if (month >= 3 && month <= 5) {
      currentQuarter = 2;
    } else if (month >= 6 && month <= 8) {
      currentQuarter = 3;
    } else {
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

  // Parse quarter string to get quarter number and year
  const parseQuarterValue = (quarterValue) => {
    if (quarterValue === 'current' || quarterValue === 'custom') {
      return null;
    }
    const [quarter, year] = quarterValue.split('-');
    return { quarter: parseInt(quarter.replace('Q', '')), year: parseInt(year) };
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

  // Fetch infant tests
  const fetchInfantTests = useCallback(async () => {
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

      const response = await infantTestApi.getInfantTests(params);
      
      if (response.success) {
        setInfantTests(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch infant tests');
      }
    } catch (error) {
      console.error('Error fetching infant tests:', error);
      setError('Failed to fetch infant tests');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, filters]);

  // Generate comprehensive insights
  const generateInsights = (data, stats) => {
    if (!data || !stats) return null;

    const totalTests = data.length;
    const positiveTests = data.filter(test => test.testResultDesc === 'Positive').length;
    const negativeTests = data.filter(test => test.testResultDesc === 'Negative').length;
    const confirmedTests = data.filter(test => test.isConfirmedTest).length;
    const oiTests = data.filter(test => test.hasOISymptom).length;
    
    // Calculate positivity rate
    const positivityRate = totalTests > 0 ? (positiveTests / totalTests * 100).toFixed(1) : 0;
    
    // Calculate confirmation rate
    const confirmationRate = totalTests > 0 ? (confirmedTests / totalTests * 100).toFixed(1) : 0;
    
    // Calculate OI rate
    const oiRate = totalTests > 0 ? (oiTests / totalTests * 100).toFixed(1) : 0;
    
    // Age analysis
    const ageGroups = {
      '0-3 months': data.filter(test => {
        const age = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
        return age >= 0 && age <= 3;
      }).length,
      '4-6 months': data.filter(test => {
        const age = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
        return age >= 4 && age <= 6;
      }).length,
      '7-12 months': data.filter(test => {
        const age = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
        return age >= 7 && age <= 12;
      }).length,
      '12+ months': data.filter(test => {
        const age = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
        return age > 12;
      }).length
    };

    // Test type distribution
    const testTypeDistribution = {
      'At Birth': data.filter(test => test.dnaTestTypeDesc === 'At Birth').length,
      '4-6 Weeks': data.filter(test => test.dnaTestTypeDesc === '4-6 Weeks').length,
      '6 Weeks After Stopped Breastfeeding': data.filter(test => test.dnaTestTypeDesc === '6 Weeks After Stopped Breastfeeding').length,
      'Confirm': data.filter(test => test.dnaTestTypeDesc === 'Confirm').length,
      '9 Months': data.filter(test => test.dnaTestTypeDesc === '9 Months').length,
      'Other': data.filter(test => test.dnaTestTypeDesc === 'Other').length
    };

    // Site performance
    const sitePerformance = data.reduce((acc, test) => {
      const site = test.siteCode || 'Unknown';
      if (!acc[site]) {
        acc[site] = { total: 0, positive: 0, confirmed: 0, oi: 0 };
      }
      acc[site].total++;
      if (test.testResultDesc === 'Positive') acc[site].positive++;
      if (test.isConfirmedTest) acc[site].confirmed++;
      if (test.hasOISymptom) acc[site].oi++;
      return acc;
    }, {});

    // Calculate site performance metrics
    Object.keys(sitePerformance).forEach(site => {
      const siteData = sitePerformance[site];
      siteData.positivityRate = siteData.total > 0 ? (siteData.positive / siteData.total * 100).toFixed(1) : 0;
      siteData.confirmationRate = siteData.total > 0 ? (siteData.confirmed / siteData.total * 100).toFixed(1) : 0;
      siteData.oiRate = siteData.total > 0 ? (siteData.oi / siteData.total * 100).toFixed(1) : 0;
    });

    return {
      positivityRate: parseFloat(positivityRate),
      confirmationRate: parseFloat(confirmationRate),
      oiRate: parseFloat(oiRate),
      ageGroups,
      testTypeDistribution,
      sitePerformance,
      keyMetrics: {
        totalTests,
        positiveTests,
        negativeTests,
        confirmedTests,
        oiTests,
        positivityRate: parseFloat(positivityRate),
        confirmationRate: parseFloat(confirmationRate),
        oiRate: parseFloat(oiRate)
      }
    };
  };

  // Generate trend analysis
  const generateTrends = (data) => {
    if (!data || data.length === 0) return null;

    // Group by month
    const monthlyData = data.reduce((acc, test) => {
      if (!test.visitDate) return acc;
      const date = new Date(test.visitDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          positive: 0,
          negative: 0,
          confirmed: 0,
          oi: 0
        };
      }
      
      acc[monthKey].total++;
      if (test.testResultDesc === 'Positive') acc[monthKey].positive++;
      if (test.testResultDesc === 'Negative') acc[monthKey].negative++;
      if (test.isConfirmedTest) acc[monthKey].confirmed++;
      if (test.hasOISymptom) acc[monthKey].oi++;
      
      return acc;
    }, {});

    // Convert to array and sort by month
    const trendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate month-over-month growth
    const growthRates = trendData.map((month, index) => {
      if (index === 0) return { ...month, growthRate: 0 };
      const prevMonth = trendData[index - 1];
      const growthRate = prevMonth.total > 0 ? ((month.total - prevMonth.total) / prevMonth.total * 100).toFixed(1) : 0;
      return { ...month, growthRate: parseFloat(growthRate) };
    });

    return {
      monthlyTrends: growthRates,
      averageMonthlyTests: trendData.length > 0 ? (trendData.reduce((sum, month) => sum + month.total, 0) / trendData.length).toFixed(1) : 0,
      peakMonth: trendData.reduce((peak, month) => month.total > peak.total ? month : peak, { total: 0 }),
      lowestMonth: trendData.reduce((low, month) => month.total < low.total ? month : low, { total: Infinity })
    };
  };

  // Generate performance metrics
  const generatePerformance = (data, labData) => {
    if (!data || data.length === 0) return null;

    // Test turnaround analysis
    const turnaroundData = data.filter(test => test.arrivalDate && test.resultDate).map(test => {
      const arrival = new Date(test.arrivalDate);
      const result = new Date(test.resultDate);
      const turnaroundDays = Math.ceil((result - arrival) / (1000 * 60 * 60 * 24));
      return {
        ...test,
        turnaroundDays
      };
    });

    const avgTurnaround = turnaroundData.length > 0 
      ? (turnaroundData.reduce((sum, test) => sum + test.turnaroundDays, 0) / turnaroundData.length).toFixed(1)
      : 0;

    // Quality metrics
    const qualityMetrics = {
      testsWithResults: data.filter(test => test.testResultDesc && test.testResultDesc !== 'Not Tested').length,
      testsWithLabId: data.filter(test => test.labId && test.labId.trim() !== '').length,
      testsWithCompleteData: data.filter(test => 
        test.testResultDesc && test.testResultDesc !== 'Not Tested' && 
        test.labId && test.labId.trim() !== '' &&
        test.arrivalDate && test.resultDate
      ).length
    };

    // Lab comparison metrics
    let labComparison = null;
    if (labData && labData.length > 0) {
      const matchedTests = data.filter(test => 
        labData.some(lab => lab.clinic_id?.trim() === test.ClinicID?.trim())
      );
      
      labComparison = {
        totalLabTests: labData.length,
        matchedTests: matchedTests.length,
        matchRate: data.length > 0 ? ((matchedTests.length / data.length) * 100).toFixed(1) : 0,
        unmatchedLabTests: labData.length - matchedTests.length,
        unmatchedInfantTests: data.length - matchedTests.length
      };
    }

    return {
      avgTurnaround: parseFloat(avgTurnaround),
      qualityMetrics,
      labComparison,
      turnaroundDistribution: {
        '0-3 days': turnaroundData.filter(t => t.turnaroundDays <= 3).length,
        '4-7 days': turnaroundData.filter(t => t.turnaroundDays >= 4 && t.turnaroundDays <= 7).length,
        '8-14 days': turnaroundData.filter(t => t.turnaroundDays >= 8 && t.turnaroundDays <= 14).length,
        '15+ days': turnaroundData.filter(t => t.turnaroundDays >= 15).length
      }
    };
  };

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

      const response = await infantTestApi.getTestStats(params);
      
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Stats API error:', response);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [filters]);

  // Fetch lab test comparison data
  const fetchLabTestComparison = useCallback(async () => {
    try {
      setComparisonLoading(true);
      
      // Only fetch lab test comparison if we have a specific site selected
      if (filters.site === 'all' || !filters.site) {
        setLabTestStats(null);
        setComparisonLoading(false);
        return;
      }
      
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        siteCode: filters.site,
        type: 'dna'
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Fetch DNA lab test results for comparison
      const response = await labTestApi.getTestResults(params);
      
      if (response.success) {
        const labData = response.data;
        const labTestCount = Array.isArray(labData) ? labData.length : 0;
        
        setLabTestStats({
          totalTests: labTestCount,
          testType: 'DNA Lab Tests',
          labData: labData || []
        });
      } else {
        console.error('Lab test comparison API error:', response);
        setLabTestStats(null);
      }
    } catch (error) {
      console.error('Error fetching lab test comparison:', error);
      setLabTestStats(null);
    } finally {
      setComparisonLoading(false);
    }
  }, [filters]);

  // Load data when sites are available
  useEffect(() => {
    if (sites.length > 0) {
      fetchInfantTests();
      fetchStats();
      fetchLabTestComparison();
    }
  }, [sites.length, fetchInfantTests, fetchStats, fetchLabTestComparison]);

  // Generate insights when data changes
  useEffect(() => {
    if (infantTests && stats) {
      const newInsights = generateInsights(infantTests, stats);
      setInsights(newInsights);
    }
  }, [infantTests, stats]);

  // Generate trends when data changes
  useEffect(() => {
    if (infantTests) {
      const newTrends = generateTrends(infantTests);
      setTrends(newTrends);
    }
  }, [infantTests]);

  // Generate performance metrics when data changes
  useEffect(() => {
    if (infantTests) {
      const newPerformance = generatePerformance(infantTests, labTestStats?.labData);
      setPerformance(newPerformance);
    }
  }, [infantTests, labTestStats]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInfantTests();
    fetchStats();
    fetchLabTestComparison();
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

  // Get sorted infant tests
  const getSortedInfantTests = () => {
    return [...infantTests].sort((a, b) => {
      let aValue, bValue;

      switch (tableSortField) {
        case 'clinicId':
          aValue = a.clinicId || '';
          bValue = b.clinicId || '';
          break;
        case 'visitDate':
          aValue = a.visitDate ? new Date(a.visitDate).getTime() : 0;
          bValue = b.visitDate ? new Date(b.visitDate).getTime() : 0;
          break;
        case 'age':
          aValue = parseInt(a.age) || 0;
          bValue = parseInt(b.age) || 0;
          break;
        case 'weight':
          aValue = parseFloat(a.weight) || 0;
          bValue = parseFloat(b.weight) || 0;
          break;
        case 'height':
          aValue = parseFloat(a.height) || 0;
          bValue = parseFloat(b.height) || 0;
          break;
        case 'testTypes':
          aValue = a.testTypes || '';
          bValue = b.testTypes || '';
          break;
        case 'result':
          aValue = a.dnaTestTypeDesc || '';
          bValue = b.dnaTestTypeDesc || '';
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

  // Export test results to CSV
  const exportResults = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL data for export
      let allData = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const params = {
          page,
          limit: 100,
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

        const response = await infantTestApi.getInfantTests(params);
        
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
        'Clinic ID',
        'Visit Date',
        'Age (Months)',
        'Sex',
        'Weight (kg)',
        'Height (cm)',
        'Test Types',
        'DNA Test Type',
        'Test Result',
        'OI Symptom',
        'Arrival Date',
        'Result Date',
        'Lab ID',
        'Test Results',
        'Site Code'
      ];

      // CSV Rows
      const rows = allData.map(test => [
        test.ClinicID || '',
        test.visitDate || '',
        test.age || '',
        test.patientSex === 1 ? 'Male' : test.patientSex === 0 ? 'Female' : '',
        test.weight || '',
        test.height || '',
        test.testTypes || '',
        test.dnaTestTypeDesc || '',
        test.testResultDesc || '',
        test.hasOISymptom ? 'Yes' : 'No',
        test.arrivalDate || '',
        test.resultDate || '',
        test.labId || '',
        `${test.dnaTestTypeDesc || 'N/A'}, ${test.testResultDesc || 'N/A'}, ${test.hasOISymptom ? 'OI' : 'No OI'}`,
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
      link.download = `infant-tests-${siteName}-${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${allData.length} records to CSV`);
      if (!isViewerUser()) {
        toast.success(`Successfully exported ${allData.length} records to CSV`);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (!isViewerUser()) {
        toast.error('Failed to export data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Classify test result with visual indicators
  const classifyTestResult = (testResultDesc) => {
    if (!testResultDesc || testResultDesc === 'Not Tested') {
      return { label: 'Not Tested', color: 'gray', bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: Minus };
    }
    
    const result = testResultDesc.toLowerCase();
    if (result === 'positive') {
      return { label: 'Positive', color: 'red', bgColor: 'bg-destructive/10', textColor: 'text-destructive', icon: XCircle };
    }
    if (result === 'negative') {
      return { label: 'Negative', color: 'green', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: CheckCircle };
    }
    return { label: testResultDesc, color: 'gray', bgColor: 'bg-muted', textColor: 'text-muted-foreground', icon: Minus };
  };
  
  // Calculate enhanced summary statistics
  const calculateEnhancedStats = () => {
    if (!infantTests || infantTests.length === 0) {
      return {
        total: 0,
        positive: 0,
        negative: 0,
        dnaTests: 0,
        oiTests: 0,
        confirmed: 0,
        avgAge: 0,
        positivityRate: 0
      };
    }
    
    let positive = 0;
    let negative = 0;
    let dnaTests = 0;
    let oiTests = 0;
    let confirmed = 0;
    let ageSum = 0;
    let ageCount = 0;
    
    infantTests.forEach(test => {
      // Count test results
      if (test.testResultDesc === 'Positive') positive++;
      if (test.testResultDesc === 'Negative') negative++;
      
      // Count test types
      if (test.dnaTestType !== null && test.dnaTestType !== -1) dnaTests++;
      if (test.hasOISymptom) oiTests++;
      if (test.isConfirmedTest) confirmed++;
      
      // Calculate average age
      const age = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
      if (age !== null) {
        ageSum += age;
        ageCount++;
      }
    });
    
    const avgAge = ageCount > 0 ? Math.round(ageSum / ageCount) : 0;
    const positivityRate = infantTests.length > 0 ? ((positive / infantTests.length) * 100).toFixed(1) : 0;
    
    return {
      total: infantTests.length,
      positive,
      negative,
      dnaTests,
      oiTests,
      confirmed,
      avgAge,
      positivityRate
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

  // Helper function to calculate age in months
  const calculateAgeInMonths = (dateOfBirth, visitDate) => {
    if (!dateOfBirth || !visitDate) return null;
    
    try {
      const birthDate = new Date(dateOfBirth);
      const visit = new Date(visitDate);
      
      if (isNaN(birthDate.getTime()) || isNaN(visit.getTime())) return null;
      
      const yearDiff = visit.getFullYear() - birthDate.getFullYear();
      const monthDiff = visit.getMonth() - birthDate.getMonth();
      
      return yearDiff * 12 + monthDiff;
    } catch (error) {
      return null;
    }
  };

  const getTestTypeBadge = (test) => {
    const types = [];
    if (test.dnaTestType !== null && test.dnaTestType !== -1) types.push('DNA PCR');
    if (test.hasOISymptom) types.push('OI');
    if (test.isConfirmedTest) types.push('Confirm');
    
    return types.length > 0 ? types.join(', ') : 'No Tests';
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
              Filter infant test results by various criteria
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
              <SelectContent>
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
              <SelectContent>
                <SelectItem value="all">All test types</SelectItem>
                <SelectItem value="dna">DNA PCR Test</SelectItem>
                <SelectItem value="oi">OI Symptom</SelectItem>
                <SelectItem value="confirmed">Confirmed Test</SelectItem>
                <SelectItem value="positive">Positive Result</SelectItem>
                <SelectItem value="negative">Negative Result</SelectItem>
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
                <div ref={pickerRef} className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-md p-6 min-w-[320px]">
                  {/* Year Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      type="button"
                      onClick={() => setCurrentDecade(currentDecade - 10)}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-md hover: transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-primary" />
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setShowYearGrid(!showYearGrid)}
                      variant="ghost"
                      className="px-4 py-2 text-base font-semibold hover:text-primary rounded-md transition-colors cursor-pointer"
                    >
                      FY {selectedFiscalYear}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setCurrentDecade(currentDecade + 10)}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-md hover: transition-colors text-primary"
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
                              px-3 py-2 text-sm rounded-md transition-all duration-200 relative
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
                          px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium
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
                    testType: 'dna',
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
          </div>
          
          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2 duration-300">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filtering Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Test Result Filter */}
                <div className="space-y-2">
                  <Label>Test Result</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="not_tested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Age Range */}
                <div className="space-y-2">
                  <Label>Age Range (Months)</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="0-3">0-3 months</SelectItem>
                      <SelectItem value="4-6">4-6 months</SelectItem>
                      <SelectItem value="7-12">7-12 months</SelectItem>
                      <SelectItem value="12+">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Gender */}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
                <p className="text-xs text-muted-foreground mt-1">Infants tested</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Baby className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Positive Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive</p>
                <h3 className="text-3xl font-bold text-destructive mt-2">{enhancedStats.positive}</h3>
                <p className="text-xs text-destructive font-medium mt-1">{enhancedStats.positivityRate}% rate</p>
              </div>
              <div className="h-12 w-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Negative Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Negative</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{enhancedStats.negative}</h3>
                <p className="text-xs text-primary mt-1">HIV Negative</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* DNA PCR Tests */}
        <Card className="transition-all duration-300 border-l-4 border-l-info">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">DNA PCR</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">{enhancedStats.dnaTests}</h3>
                <p className="text-xs text-purple-600 mt-1">Tests done</p>
              </div>
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                <Dna className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* OI Symptoms */}
        <Card className="transition-all duration-300 border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OI Symptoms</p>
                <h3 className="text-3xl font-bold text-warning-foreground mt-2">{enhancedStats.oiTests}</h3>
                <p className="text-xs text-warning-foreground mt-1">Avg age: {enhancedStats.avgAge}m</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-warning-foreground" />
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
              <Baby className="h-8 w-8 text-primary" />
              Infant Test Results
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage infant laboratory test results including DNA PCR, OI symptoms, and confirmed tests
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={exportResults}
              disabled={infantTests.length === 0 || loading}
              className="gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
            <Button variant="outline" onClick={fetchInfantTests} disabled={loading} className="gap-2">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
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
                    disabled={infantTests.length === 0 || loading}
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
                  <Button variant="outline" onClick={fetchInfantTests} disabled={loading}>
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
                      placeholder="🔍 Search by Clinic ID, Lab ID, or Test ID..."
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
                ) : infantTests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No infant test results found
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted z-10">
                        <TableRow className="hover:bg-muted">
                          {visibleColumns.clinic_id && <TestResultTableHead field="clinicId">Clinic ID</TestResultTableHead>}
                          {visibleColumns.visit_date && <TestResultTableHead field="visitDate">Visit Date</TestResultTableHead>}
                          {visibleColumns.age && <TestResultTableHead field="age">Age (Months)</TestResultTableHead>}
                          {visibleColumns.sex && <TestResultTableHead field="sex">Sex</TestResultTableHead>}
                          {visibleColumns.weight && <TestResultTableHead field="weight">Weight (kg)</TestResultTableHead>}
                          {visibleColumns.height && <TestResultTableHead field="height">Height (cm)</TestResultTableHead>}
                          {visibleColumns.test_types && <TestResultTableHead field="testTypes">Test Types</TestResultTableHead>}
                          {visibleColumns.result && <TableHead className="font-semibold">Test Results</TableHead>}
                          <TableHead className="font-semibold">Status</TableHead>
                          {visibleColumns.actions && <TableHead className="font-semibold">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSortedInfantTests().map((test, index) => {
                          const classification = classifyTestResult(test.testResultDesc);
                          const StatusIcon = classification.icon;
                          const hasAnomalies = test.hasOISymptom || test.testResultDesc === 'Positive';
                          const ageInMonths = calculateAgeInMonths(test.dateOfBirth, test.visitDate);
                          
                          return (
                            <TableRow 
                              key={`${test.ClinicID}-${test.visitDate}`}
                              className={`
                                ${classification.bgColor}
                                hover:brightness-95
                                transition-all duration-200
                                cursor-pointer
                                ${index % 2 === 0 ? 'bg-opacity-30' : 'bg-opacity-50'}
                                ${hasAnomalies ? 'border-l-4 border-l-destructive' : ''}
                              `}
                              onClick={() => setQuickViewDrawer({ isOpen: true, data: test })}
                            >
                              {visibleColumns.clinic_id && (
                                <TableCell className="font-medium font-mono text-sm">
                                  {test.ClinicID}
                                </TableCell>
                              )}
                              {visibleColumns.visit_date && (
                                <TableCell className="text-sm">
                                  {test.visitDate ? new Date(test.visitDate).toLocaleDateString() : '-'}
                                </TableCell>
                              )}
                              {visibleColumns.age && (
                                <TableCell className="font-semibold">
                                  <div className="flex items-center gap-2">
                                    <Baby className="h-4 w-4 text-primary" />
                                    {formatTestValue(ageInMonths)} mo
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.sex && (
                                <TableCell>
                                  <Badge variant="outline" className={test.patientSex === 1 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>
                                    {test.patientSex === 1 ? '👦 Male' : test.patientSex === 0 ? '👧 Female' : '-'}
                                  </Badge>
                                </TableCell>
                              )}
                              {visibleColumns.weight && (
                                <TableCell className="font-semibold">
                                  <div className="flex items-center gap-1">
                                    <Weight className="h-3 w-3 text-muted-foreground" />
                                    {formatTestValue(test.weight, 'number')}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.height && (
                                <TableCell className="font-semibold">
                                  {formatTestValue(test.height, 'number')} cm
                                </TableCell>
                              )}
                              {visibleColumns.test_types && (
                                <TableCell>
                                  <Badge variant="outline" className="font-medium">
                                    {getTestTypeBadge(test)}
                                  </Badge>
                                </TableCell>
                              )}
                              {visibleColumns.result && (
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {test.dnaTestTypeDesc && test.dnaTestTypeDesc !== 'Not Tested' && (
                                      <Badge variant={test.dnaTestTypeDesc === 'Confirm' ? 'default' : 'secondary'} className="text-xs w-fit">
                                        {test.dnaTestTypeDesc}
                                      </Badge>
                                    )}
                                    {test.hasOISymptom && (
                                      <Badge className="text-xs w-fit bg-warning/10 text-warning-foreground border-0">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        OI Symptom
                                      </Badge>
                                    )}
                                    {(!test.dnaTestTypeDesc || test.dnaTestTypeDesc === 'Not Tested') && 
                                     (!test.testResultDesc || test.testResultDesc === 'Not Tested') && 
                                     !test.hasOISymptom && (
                                      <span className="text-xs text-muted-foreground">No Results</span>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <Badge className={`${classification.bgColor} ${classification.textColor} border-0 gap-1 font-medium`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {classification.label}
                                </Badge>
                              </TableCell>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Infant Test Analytics & Comparison
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of infant test results and comparison with lab tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Comparison Cards */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Lab Tests Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-primary" />
                        Lab Tests Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {comparisonLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">Loading comparison data...</p>
                        </div>
                      ) : labTestStats ? (
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-primary/10 rounded-md">
                            <div className="text-3xl font-bold text-primary">
                              {labTestStats.totalTests?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-primary">{labTestStats.testType}</div>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            DNA lab tests for the same period and site
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No lab test comparison data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats ? (
                      <div className="space-y-4">
                        <div className={`grid grid-cols-1 ${labTestStats ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                          <div className="text-center p-4 bg-primary/10 rounded-md">
                            <div className="text-2xl font-bold text-primary">
                              {stats.dnaTests || 0}
                            </div>
                                <div className="text-sm text-primary">Infant DNA PCR Tests</div>
                          </div>
                          {labTestStats ? (
                            <>
                              <div className="text-center p-4 bg-primary/10 rounded-md">
                                <div className="text-2xl font-bold text-primary">
                                  {labTestStats.totalTests || 0}
                                </div>
                                <div className="text-sm text-primary">Lab DNA Tests</div>
                              </div>
                              <div className="text-center p-4 bg-muted rounded-md">
                                <div className="text-2xl font-bold text-purple-600">
                                  {((stats.dnaTests || 0) + (labTestStats.totalTests || 0)).toLocaleString()}
                                </div>
                                <div className="text-sm text-purple-600">Total DNA Tests</div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4 bg-muted rounded-md">
                              <div className="text-2xl font-bold text-muted-foreground">
                                {stats.dnaTests || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Infant DNA PCR Tests</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 p-4 bg-muted/50 rounded-md">
                          <h4 className="font-medium mb-2">Key Insights:</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Infant DNA PCR tests: {stats.dnaTests || 0} tests performed</li>
                            {labTestStats ? (
                              <>
                                <li>• Lab DNA tests: {labTestStats.totalTests || 0} tests performed</li>
                                <li>• Total DNA testing volume: {((stats.dnaTests || 0) + (labTestStats.totalTests || 0)).toLocaleString()} tests</li>
                              </>
                            ) : (
                              <li>• Lab test comparison not available (select a specific site to enable)</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Loading analysis data...</p>
                        <p className="text-sm">This will show comparison between infant and lab DNA PCR tests.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lab Data Entry Comparison */}
                {labTestStats && labTestStats.labData && labTestStats.labData.length > 0 && (
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
                      <LabDataComparison 
                        infantTests={infantTests}
                        labData={labTestStats.labData}
                        filters={filters}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-md">
                      <div className="text-2xl font-bold text-primary">
                        {insights.positivityRate}%
                      </div>
                      <div className="text-sm text-primary">Positivity Rate</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-md">
                      <div className="text-2xl font-bold text-primary">
                        {insights.confirmationRate}%
                      </div>
                      <div className="text-sm text-primary">Confirmation Rate</div>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-md">
                      <div className="text-2xl font-bold text-warning-foreground">
                        {insights.oiRate}%
                      </div>
                      <div className="text-sm text-warning-foreground">OI Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-2xl font-bold text-purple-600">
                        {insights.keyMetrics.totalTests}
                      </div>
                      <div className="text-sm text-purple-600">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Age Group Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(insights.ageGroups).map(([ageGroup, count]) => (
                      <div key={ageGroup} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{ageGroup}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-md h-2">
                            <div 
                              className="bg-primary/100 h-2 rounded-md" 
                              style={{ width: `${(count / insights.keyMetrics.totalTests) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Test Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(insights.testTypeDistribution).map(([testType, count]) => (
                      <div key={testType} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{testType}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-md h-2">
                            <div 
                              className="bg-primary/100 h-2 rounded-md" 
                              style={{ width: `${(count / insights.keyMetrics.totalTests) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Site Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Site Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(insights.sitePerformance)
                      .sort(([,a], [,b]) => b.total - a.total)
                      .slice(0, 10)
                      .map(([site, data]) => (
                      <div key={site} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{site}</span>
                          <span className="text-sm text-muted-foreground">{data.total} tests</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-primary">{data.positivityRate}%</div>
                            <div className="text-muted-foreground">Positive</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-primary">{data.confirmationRate}%</div>
                            <div className="text-muted-foreground">Confirmed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-warning-foreground">{data.oiRate}%</div>
                            <div className="text-muted-foreground">OI</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trends Analysis */}
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/10 rounded-md">
                    <div className="text-2xl font-bold text-primary">
                      {trends.averageMonthlyTests}
                    </div>
                    <div className="text-sm text-primary">Avg Monthly Tests</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-md">
                    <div className="text-2xl font-bold text-primary">
                      {trends.peakMonth.total}
                    </div>
                    <div className="text-sm text-primary">Peak Month ({trends.peakMonth.month})</div>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-md">
                    <div className="text-2xl font-bold text-warning-foreground">
                      {trends.lowestMonth.total}
                    </div>
                    <div className="text-sm text-warning-foreground">Lowest Month ({trends.lowestMonth.month})</div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trends.monthlyTrends.slice(-6).map((month) => (
                    <div key={month.month} className="flex justify-between items-center p-2 border rounded-md">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{month.total} tests</span>
                        <span className={`text-sm ${month.growthRate >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {month.growthRate >= 0 ? '+' : ''}{month.growthRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Turnaround Time</h4>
                    <div className="text-center p-4 bg-primary/10 rounded-md">
                      <div className="text-2xl font-bold text-primary">
                        {performance.avgTurnaround} days
                      </div>
                      <div className="text-sm text-primary">Average Turnaround</div>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(performance.turnaroundDistribution).map(([range, count]) => (
                        <div key={range} className="flex justify-between items-center">
                          <span className="text-sm">{range}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Data Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tests with Results</span>
                        <span className="font-bold">{performance.qualityMetrics.testsWithResults}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tests with Lab ID</span>
                        <span className="font-bold">{performance.qualityMetrics.testsWithLabId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Complete Data</span>
                        <span className="font-bold">{performance.qualityMetrics.testsWithCompleteData}</span>
                      </div>
                    </div>
                    
                    {performance.labComparison && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <h5 className="font-medium mb-2">Lab Data Integration</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Match Rate:</span>
                            <span className="font-bold">{performance.labComparison.matchRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Matched Tests:</span>
                            <span className="font-bold">{performance.labComparison.matchedTests}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!insights && !trends && !performance && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading insights data...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default InfantTests;
