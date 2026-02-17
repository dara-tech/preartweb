import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, RefreshCw, Eye, Printer, Calendar, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import SiteFilter from '../common/SiteFilter';

const REPORT_TYPE_OPTIONS = [
  { value: '/reports/adult-child', label: 'Adult and Child' },
  { value: '/reports/infants', label: 'Infants' },
  { value: '/reports/pntt', label: 'PNTT' },
];

function pathToReportValue(pathname) {
  if (pathname === '/reports/adult-child' || pathname === '/indicators') return '/reports/adult-child';
  if (pathname === '/reports/infants' || pathname === '/infant-report') return '/reports/infants';
  if (pathname === '/reports/pntt') return '/reports/pntt';
  return '/reports/adult-child';
}

const ReportConfiguration = ({
  sites,
  selectedSite,
  onSiteChange,
  sitesLoading,
  selectedYear,
  selectedQuarter,
  onYearChange,
  onQuarterChange,
  availableYears,
  availableQuarters,
  onRefresh,
  onExport,
  onPreview,
  onPrint,
  loading,
  isSuperAdmin,
  isViewer
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [currentDecade, setCurrentDecade] = useState(Math.floor(parseInt(selectedYear) / 10) * 10);
  const pickerRef = useRef(null);
  const reportTypeValue = pathToReportValue(location.pathname);

  // Smart year navigation functions
  const navigateToPreviousYear = () => {
    const currentYear = parseInt(selectedYear);
    const previousYear = currentYear - 1;
    
    // Check if previous year is available
    if (availableYears.includes(previousYear)) {
      onYearChange(previousYear.toString());
    } else {
      // Find the closest available previous year
      const availablePreviousYears = availableYears.filter(year => year < currentYear);
      if (availablePreviousYears.length > 0) {
        const closestYear = Math.max(...availablePreviousYears);
        onYearChange(closestYear.toString());
      }
    }
  };

  const navigateToNextYear = () => {
    const currentYear = parseInt(selectedYear);
    const nextYear = currentYear + 1;
    
    // Check if next year is available
    if (availableYears.includes(nextYear)) {
      onYearChange(nextYear.toString());
    } else {
      // Find the closest available next year
      const availableNextYears = availableYears.filter(year => year > currentYear);
      if (availableNextYears.length > 0) {
        const closestYear = Math.min(...availableNextYears);
        onYearChange(closestYear.toString());
      }
    }
  };

  const navigateToPreviousDecade = () => {
    const newDecade = currentDecade - 10;
    setCurrentDecade(newDecade);
    
    // If current year is not in the new decade, find the closest available year
    const currentYear = parseInt(selectedYear);
    if (currentYear < newDecade || currentYear > newDecade + 9) {
      const decadeYears = generateDecadeYears(newDecade);
      const availableDecadeYears = decadeYears.filter(year => availableYears.includes(year));
      if (availableDecadeYears.length > 0) {
        // Find the year closest to current year in the new decade
        const closestYear = availableDecadeYears.reduce((closest, year) => 
          Math.abs(year - currentYear) < Math.abs(closest - currentYear) ? year : closest
        );
        onYearChange(closestYear.toString());
      }
    }
  };

  const navigateToNextDecade = () => {
    const newDecade = currentDecade + 10;
    setCurrentDecade(newDecade);
    
    // If current year is not in the new decade, find the closest available year
    const currentYear = parseInt(selectedYear);
    if (currentYear < newDecade || currentYear > newDecade + 9) {
      const decadeYears = generateDecadeYears(newDecade);
      const availableDecadeYears = decadeYears.filter(year => availableYears.includes(year));
      if (availableDecadeYears.length > 0) {
        // Find the year closest to current year in the new decade
        const closestYear = availableDecadeYears.reduce((closest, year) => 
          Math.abs(year - currentYear) < Math.abs(closest - currentYear) ? year : closest
        );
        onYearChange(closestYear.toString());
      }
    }
  };

  // Check if navigation buttons should be disabled
  const canNavigatePreviousYear = availableYears.some(year => year < parseInt(selectedYear));
  const canNavigateNextYear = availableYears.some(year => year > parseInt(selectedYear));
  const canNavigatePreviousDecade = availableYears.some(year => year < currentDecade);
  const canNavigateNextDecade = availableYears.some(year => year > currentDecade + 9);

  // Generate years for current decade
  const generateDecadeYears = (decade) => {
    const years = [];
    for (let year = decade - 1; year <= decade + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const decadeYears = generateDecadeYears(currentDecade);
  const isYearAvailable = (year) => availableYears.includes(year);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isPeriodPickerOpen) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) {
            navigateToPreviousDecade();
          } else {
            navigateToPreviousYear();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) {
            navigateToNextDecade();
          } else {
            navigateToNextYear();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateToPreviousDecade();
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateToNextDecade();
          break;
        case 'Escape':
          event.preventDefault();
          setIsPeriodPickerOpen(false);
          setShowYearGrid(false);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          setShowYearGrid(!showYearGrid);
          break;
      }
    };

    if (isPeriodPickerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPeriodPickerOpen, showYearGrid, selectedYear, availableYears]);

  return (

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4 lg:gap-3">
          {/* Report type (viewer only) — left with period selector */}
          {isViewer && (
            <div className="flex items-center gap-2 shrink-0">
            
              <Select value={reportTypeValue} onValueChange={(value) => value && navigate(value)}>
                <SelectTrigger className="w-[200px] border border-border rounded-md bg-background h-10 sm:h-11">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  {REPORT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Health Facility Selection */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1 sm:space-y-2">
              <SiteFilter
                sites={sites}
                selectedSite={selectedSite}
                onSiteChange={onSiteChange}
                disabled={sitesLoading}
                showAllOption={!isViewer}
                className="w-full h-10 sm:h-11 text-sm border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-md"
              />
            </div>
          </div>

          {/* Time Period */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1 sm:space-y-2">
              <div className="relative">
                {/* Combined Year-Quarter Display */}
                <div className="relative">
                  <input
                    type="text"
                    value={`${selectedYear}-Q${selectedQuarter}`}
                    readOnly
                    className="w-full h-10 sm:h-11 px-3 pr-10 text-sm border border-input rounded-md focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer transition-colors"
                    onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* Custom Period Picker Panel */}
                {isPeriodPickerOpen && (
                  <div ref={pickerRef} className="absolute bg-card top-full left-0 right-0 z-50 mt-2 border border-border rounded-md p-6 min-w-[320px]">
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        type="button"
                        onClick={navigateToPreviousYear}
                        variant="ghost"
                        size="sm"
                        disabled={!canNavigatePreviousYear}
                        className={`p-2 rounded-md transition-colors ${
                          canNavigatePreviousYear 
                            ? 'hover:text-primary' 
                            : 'text-muted-foreground cursor-not-allowed'
                        }`}
                        title={canNavigatePreviousYear ? "Previous year (Shift+Click for decade)" : "No previous year available"}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (canNavigatePreviousDecade) {
                            navigateToPreviousDecade();
                          }
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => setShowYearGrid(!showYearGrid)}
                        variant="ghost"
                        className="px-4 py-2 text-base font-semibold hover:text-primary rounded-md transition-colors cursor-pointer"
                        title="Click to show year grid"
                      >
                        {selectedYear}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={navigateToNextYear}
                        variant="ghost"
                        size="sm"
                        disabled={!canNavigateNextYear}
                        className={`p-2 rounded-md transition-colors ${
                          canNavigateNextYear 
                            ? 'hover:text-primary' 
                            : 'text-muted-foreground cursor-not-allowed'
                        }`}
                        title={canNavigateNextYear ? "Next year (Shift+Click for decade)" : "No next year available"}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (canNavigateNextDecade) {
                            navigateToNextDecade();
                          }
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Year Grid - Conditionally Visible */}
                    {showYearGrid && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {decadeYears.map((year) => {
                          const isSelected = year === parseInt(selectedYear);
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
                                  setShowYearGrid(false);
                                }
                              }}
                              disabled={!isAvailable}
                              variant={isSelected ? "default" : "ghost"}
                              size="sm"
                              className={`
                                px-3 py-2 text-sm rounded-md transition-all duration-200 relative
                                ${isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : isCurrentYear && isAvailable && isInCurrentDecade
                                  ? 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                                  : isAvailable && isInCurrentDecade
                                  ? 'text-muted-foreground hover:bg-muted hover:border-border'
                                  : isAvailable && !isInCurrentDecade
                                  ? 'text-muted-foreground hover:bg-muted/80'
                                  : 'text-muted-foreground/60 cursor-not-allowed'
                                }
                              `}
                            >
                              {year}
                              {isCurrentYear && isAvailable && !isSelected && isInCurrentDecade && (
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary/60 rounded-full"></div>
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
                          onClick={() => {
                            onQuarterChange(quarter.value.toString());
                            setIsPeriodPickerOpen(false);
                            setShowYearGrid(false);
                          }}
                          disabled={quarter.disabled}
                          variant={selectedQuarter === quarter.value ? "default" : "outline"}
                          size="sm"
                          className={`
                            px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium
                            ${selectedQuarter === quarter.value
                              ? 'bg-primary text-primary-foreground'
                              : quarter.disabled
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2 self-stretch sm:self-end">
            <Button 
              onClick={onRefresh} 
              disabled={loading} 
              variant="outline" 
              size="sm" 
              className="h-10 sm:h-11 w-10 sm:w-11 p-0 border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 group rounded-md"
              title={loading ? 'Refreshing...' : 'Refresh'}
            >
              <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            </Button>
          
            <Button 
              onClick={onExport} 
              variant="outline" 
              size="sm" 
              className="h-10 sm:h-11 w-10 sm:w-11 p-0 border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10 transition-all duration-200 group rounded-md"
              disabled={loading}
              title="Download"
            >
              <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </Button>
            {isSuperAdmin && (
              <>
                <Button 
                  onClick={onPreview} 
                  variant="outline" 
                  size="sm" 
                  className="h-10 sm:h-11 w-10 sm:w-11 p-0 border-border text-muted-foreground hover:bg-muted transition-all duration-200 group rounded-md"
                  disabled={loading}
                  title="Preview"
                >
                  <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                </Button>
                {/* <Button 
                  onClick={onPrint} 
                  size="sm" 
                  className="h-10 sm:h-11 w-10 sm:w-11 p-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 group rounded-md"
                  disabled={loading}
                  title="Print"
                >
                  <Printer className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                </Button> */}
              </>
            )}
          </div>
        </div>
  
  );
};

export default ReportConfiguration;