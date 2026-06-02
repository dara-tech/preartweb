import React, { useEffect, useMemo, useState, Fragment } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Loader2,
  Search,
  RefreshCw,
  XCircle,
  History,
  Trash2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Play,
  Clock,
  Power,
  PowerOff,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { NCHADS_INDICATOR_KHMER } from '../config/nchadsIndicatorLabels';
import analyticsApi from '../services/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CountryAnalyticsPage() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('country');
  
  // Single period key selection state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  // Data state
  const [countryRows, setCountryRows] = useState([]);
  const [provinceRows, setProvinceRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastLoadedPeriod, setLastLoadedPeriod] = useState(null);

  // ETL warehouse status state
  const [statusLoading, setStatusLoading] = useState(false);
  const [warehouseStatus, setWarehouseStatus] = useState({
    hasData: false,
    lastRefreshed: null,
    etlRunning: false,
    etlProgress: null,
    recentHistory: []
  });
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Clean Warehouse state
  const [cleanModalOpen, setCleanModalOpen] = useState(false);
  const [cleanAllOption, setCleanAllOption] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Search & Expand state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndicators, setExpandedIndicators] = useState(new Set());

  // Derived current period label matching database warehouse format
  const currentPeriod = useMemo(() => {
    return {
      periodType: 'quarter',
      year: String(selectedYear),
      quarter: String(selectedQuarter),
      periodLabel: `${selectedYear}-Q${selectedQuarter}`
    };
  }, [selectedYear, selectedQuarter]);

  // Fetch Warehouse status & ETL status
  const fetchWarehouseStatus = async (silent = false) => {
    if (!silent) setStatusLoading(true);
    try {
      const res = await analyticsApi.getAnalyticsStatus(currentPeriod);
      if (res.success) {
        setWarehouseStatus({
          hasData: res.hasData,
          lastRefreshed: res.lastRefreshed,
          etlRunning: res.etlRunning,
          etlProgress: res.etlProgress,
          recentHistory: res.recentHistory || []
        });
      }
    } catch (e) {
      console.error('Failed to fetch warehouse status:', e);
    } finally {
      if (!silent) setStatusLoading(false);
    }
  };

  // Poll ETL status if ETL is running
  useEffect(() => {
    fetchWarehouseStatus();
  }, [currentPeriod.periodLabel]);

  useEffect(() => {
    let timer = null;
    if (warehouseStatus.etlRunning) {
      timer = setInterval(() => {
        fetchWarehouseStatus(true);
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [warehouseStatus.etlRunning, currentPeriod.periodLabel]);

  // Fetch report data
  const runAnalytics = async () => {
    setLoading(true);
    setExpandedIndicators(new Set());
    try {
      await fetchWarehouseStatus(true);

      const [countryData, provinceData] = await Promise.all([
        analyticsApi.getCountryAnalytics(currentPeriod),
        analyticsApi.getProvinceAnalytics(currentPeriod)
      ]);

      if (countryData.success && provinceData.success) {
        setCountryRows(countryData.data || []);
        setProvinceRows(provinceData.data || []);
        setLastLoadedPeriod(currentPeriod.periodLabel);
        if (countryData.data?.length === 0) {
          toast.info('No pre-aggregated warehouse data found for this period. Try refreshing the warehouse.');
        } else {
          toast.success('Analytics data loaded successfully.');
        }
      } else {
        toast.error('Failed to parse analytics datasets.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual ETL warehouse refresh
  const handleRefreshWarehouse = async () => {
    if (warehouseStatus.etlRunning) {
      toast.warning('Refresh already in progress.');
      return;
    }
    try {
      const res = await analyticsApi.triggerAnalyticsRefresh(currentPeriod);
      if (res.success) {
        toast.success(res.message || 'Warehouse pre-aggregation started.');
        setWarehouseStatus(prev => ({ ...prev, etlRunning: true }));
      } else {
        toast.error('Could not initiate warehouse refresh.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Refresh failed');
    }
  };

  // Clear analytics database data
  const handleClearAnalytics = async () => {
    setClearing(true);
    try {
      const res = await analyticsApi.clearAnalyticsData({
        ...currentPeriod,
        clearAll: cleanAllOption
      });
      if (res.success) {
        toast.success(res.message || 'Analytics warehouse data cleared successfully.');
        
        // If we cleared the current period or everything, reset loaded tables on screen
        if (cleanAllOption || currentPeriod.periodLabel === lastLoadedPeriod) {
          setCountryRows([]);
          setProvinceRows([]);
          setLastLoadedPeriod(null);
        }
        
        // Update the warehouse status instantly
        await fetchWarehouseStatus(true);
        setCleanModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to clear warehouse analytics.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'An error occurred during clearing.');
    } finally {
      setClearing(false);
    }
  };

  // Load ETL logs history
  const loadEtlHistory = async () => {
    try {
      const res = await analyticsApi.getEtlHistory({ limit: 15 });
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load ETL log history.');
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadEtlHistory();
    }
  }, [showHistory]);

  const toggleAll = () => {
    if (expandedIndicators.size === filteredRows.length) {
      setExpandedIndicators(new Set());
    } else {
      setExpandedIndicators(new Set(filteredRows.map(r => r.indicator)));
    }
  };

  const toggleRow = (indicator) => {
    const next = new Set(expandedIndicators);
    if (next.has(indicator)) {
      next.delete(indicator);
    } else {
      next.add(indicator);
    }
    setExpandedIndicators(next);
  };

  const splitIndicatorLabel = (label) => {
    const text = String(label || '').trim();
    const match = text.match(/^(.*)\s\(([^()]*)\)\s*$/);
    if (!match) return { khmerPart: text, englishPart: '' };
    return { khmerPart: match[1].trim(), englishPart: match[2].trim() };
  };

  const getTranslatedLabel = (indicator) => {
    return NCHADS_INDICATOR_KHMER[indicator] || indicator || '-';
  };

  const formatVal = (v) => {
    if (v == null || v === '') return '0';
    const num = Number(v);
    return Number.isNaN(num) ? '0' : num.toLocaleString();
  };

  // Calculate totals and statistics
  const kpiStats = useMemo(() => {
    const stats = {
      activeArt: 0,
      newlyInitiated: 0,
      tptStart: 0,
      vlTested: 0,
      vlSuppressed: 0
    };

    countryRows.forEach(row => {
      const ind = String(row.indicator).toLowerCase();
      const total = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);

      if (ind.includes('active art patients') && ind.includes('end of this quarter')) {
        stats.activeArt = total;
      } else if (ind.includes('5. newly initiated')) {
        stats.newlyInitiated = total;
      } else if (ind.includes('11.4. tpt start') || ind.includes('tpt start')) {
        stats.tptStart = total;
      } else if (ind.includes('11.7. vl tested in 12m') || ind.includes('vl tested in 12m')) {
        stats.vlTested = total;
      } else if (ind.includes('11.8. vl suppression') || ind.includes('vl suppression')) {
        stats.vlSuppressed = total;
      }
    });

    const suppressionRate = stats.vlTested > 0 ? (stats.vlSuppressed / stats.vlTested) * 100 : 0;

    return {
      activeArt: stats.activeArt,
      newlyInitiated: stats.newlyInitiated,
      tptStart: stats.tptStart,
      suppressionRate
    };
  }, [countryRows]);

  const filteredRows = useMemo(() => {
    return countryRows.filter(row => {
      const label = getTranslatedLabel(row.indicator).toLowerCase();
      const rawLabel = String(row.indicator).toLowerCase();
      const q = searchQuery.toLowerCase();
      return label.includes(q) || rawLabel.includes(q);
    });
  }, [countryRows, searchQuery]);

  const handleExportCSV = () => {
    if (!countryRows.length) {
      toast.warning('No data to export.');
      return;
    }
    
    const cols = ['Indicator', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14', 'Grand_Total', 'Site_Count'];
    const exportData = countryRows.map(row => {
      const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
      return {
        Indicator: getTranslatedLabel(row.indicator),
        Male_0_14: row.Male_0_14,
        Female_0_14: row.Female_0_14,
        Male_over_14: row.Male_over_14,
        Female_over_14: row.Female_over_14,
        Grand_Total: grandTotal,
        Site_Count: row.site_count
      };
    });

    const csvContent = [
      cols.join(','),
      ...exportData.map(row => cols.map(c => `"${String(row[c] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `warehouse-analytics-${currentPeriod.periodLabel}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate lists of available years
  const availableYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-background p-4 space-y-4">
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center bg-card p-2 border border-border rounded-none shadow-sm shrink-0 mb-4">
          <TabsList className="grid grid-cols-2 max-w-sm rounded-none bg-muted/50 p-1">
            <TabsTrigger value="country" className="rounded-none text-xs font-semibold py-1.5 px-4 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Country Analytics</TabsTrigger>
            <TabsTrigger value="name_analytic" className="rounded-none text-xs font-semibold py-1.5 px-4 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Name Analytic</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="country" className="flex-1 flex flex-col min-h-0 space-y-4 data-[state=inactive]:hidden">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-bold text-foreground">វិភាគឃ្លាំងទិន្នន័យ (Country Warehouse Analytics)</h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={loading}
            className="bg-background border border-border text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Quarter selector */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
            disabled={loading}
            className="bg-background border border-border text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
          >
            <option value="1">Quarter 1</option>
            <option value="2">Quarter 2</option>
            <option value="3">Quarter 3</option>
            <option value="4">Quarter 4</option>
          </select>

          {/* Run button */}
          <Button
            size="sm"
            onClick={runAnalytics}
            disabled={loading}
            className="h-8 text-xs font-semibold px-3 gap-1 rounded-none"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
            ទាញទិន្នន័យ (Run)
          </Button>

          {/* Export CSV button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || countryRows.length === 0}
            className="h-8 text-xs font-semibold px-3 gap-1 rounded-none border-border"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            CSV
          </Button>

          {/* Sync / Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshWarehouse}
            disabled={warehouseStatus.etlRunning || statusLoading}
            className="h-8 text-xs font-semibold px-3 gap-1 rounded-none border-border"
          >
            {warehouseStatus.etlRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
            )}
            សមកាលកម្ម (Sync)
          </Button>

          {/* Clean warehouse button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCleanAllOption(false);
              setCleanModalOpen(true);
            }}
            disabled={loading || statusLoading || warehouseStatus.etlRunning}
            className="h-8 text-xs font-semibold px-3 gap-1 rounded-none text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-border"
          >
            <Trash2 className="h-3.5 w-3.5" />
            សម្អាត
          </Button>
        </div>
      </div>

      {/* Sync Status Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground bg-card p-3 border border-border">
        <div>
          {warehouseStatus.lastRefreshed ? (
            <>ឃ្លាំងសមកាលកម្មចុងក្រោយ (Last sync): <strong className="text-foreground">{new Date(warehouseStatus.lastRefreshed).toLocaleString()}</strong></>
          ) : (
            <span>No pre-aggregated records for {currentPeriod.periodLabel} in warehouse.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(h => !h)}
            className="text-[10px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground border border-border hover:bg-muted/50 rounded-none"
          >
            <History className="h-3 w-3" />
            Sync Logs history
          </Button>
          <div className="inline-flex items-center gap-1.5 text-[10px]">
            <span className={`inline-block h-2 w-2 rounded-full ${warehouseStatus.etlRunning ? 'bg-amber-500 animate-pulse' : warehouseStatus.hasData ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>
              {warehouseStatus.etlRunning ? 'Syncing...' : warehouseStatus.hasData ? 'Warehouse Sync OK' : 'Empty Warehouse'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time progress bar panel if ETL is active */}
      {warehouseStatus.etlProgress && warehouseStatus.etlProgress.active && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-none space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
              កំពុងសមកាលកម្មទិន្នន័យឃ្លាំងសូចនាករ (Indicator Warehouse Synchronization in Progress...)
            </span>
            <span className="tabular-nums font-extrabold text-amber-700">
              {warehouseStatus.etlProgress.totalSites > 0
                ? `${Math.round((warehouseStatus.etlProgress.completedSites / warehouseStatus.etlProgress.totalSites) * 100)}%`
                : '0%'}
            </span>
          </div>

          <div className="w-full bg-amber-100 h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{
                width: `${warehouseStatus.etlProgress.totalSites > 0
                  ? (warehouseStatus.etlProgress.completedSites / warehouseStatus.etlProgress.totalSites) * 100
                  : 0}%`
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] text-amber-800/95 gap-2 font-medium">
            <div>
              មន្ទីរពេទ្យបានបញ្ចប់ (Sites Completed): <strong className="text-amber-950 font-bold">{warehouseStatus.etlProgress.completedSites} / {warehouseStatus.etlProgress.totalSites}</strong>
            </div>
            <div>
              ទិន្នន័យសរុប (Total rows upserted): <strong className="text-amber-950 font-bold">{formatVal(warehouseStatus.etlProgress.processedRows)}</strong>
            </div>
            <div className="truncate max-w-sm">
              កំពុងដំណើរការ (Last site): <strong className="text-amber-950 font-bold animate-pulse">{warehouseStatus.etlProgress.lastProcessedSite || 'Initializing...'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Sync Logs list collapse panel */}
      {showHistory && (
        <div className="bg-muted/20 border p-3 rounded-none overflow-hidden transition-all">
          <div className="text-[11px] font-bold text-muted-foreground mb-2">Recent Synchronizations</div>
          {historyList.length === 0 ? (
            <div className="text-[10px] text-muted-foreground py-1">No log records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="border-b bg-muted/40 text-left font-semibold text-muted-foreground">
                    <th className="p-1.5">Triggered At</th>
                    <th className="p-1.5">Period</th>
                    <th className="p-1.5 text-right">Facilities</th>
                    <th className="p-1.5 text-right">Records</th>
                    <th className="p-1.5 text-right">Duration</th>
                    <th className="p-1.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.slice(0, 5).map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="p-1.5 tabular-nums">{new Date(log.started_at).toLocaleString()}</td>
                      <td className="p-1.5">{log.period_label}</td>
                      <td className="p-1.5 text-right tabular-nums">{log.site_count}</td>
                      <td className="p-1.5 text-right tabular-nums">{log.row_count}</td>
                      <td className="p-1.5 text-right tabular-nums">{(log.duration_ms / 1000).toFixed(1)}s</td>
                      <td className="p-1.5 text-center">
                        {log.status === 'success' ? (
                          <span className="text-emerald-600 font-semibold">Success</span>
                        ) : log.status === 'failed' ? (
                          <span className="text-destructive font-semibold" title={log.error_msg}>Failed</span>
                        ) : (
                          <span className="text-amber-500 font-semibold animate-pulse">Running</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Row */}
      {countryRows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-none border shadow-sm">
            <CardContent className="p-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Active ART Patients</div>
              <div className="mt-2 text-lg font-black text-violet-600 tracking-tight">{formatVal(kpiStats.activeArt)}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Sustained this quarter</div>
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-sm">
            <CardContent className="p-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Newly Initiated</div>
              <div className="mt-2 text-lg font-black text-emerald-600 tracking-tight">{formatVal(kpiStats.newlyInitiated)}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Newly enrolled in ARV</div>
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-sm">
            <CardContent className="p-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">TPT Initiations</div>
              <div className="mt-2 text-lg font-black text-sky-600 tracking-tight">{formatVal(kpiStats.tptStart)}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Started TB prophylaxis</div>
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-sm">
            <CardContent className="p-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Viral Load Suppression</div>
              <div className="mt-2 text-lg font-black text-amber-600 tracking-tight">
                {kpiStats.suppressionRate > 0 ? `${kpiStats.suppressionRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">VL suppression rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Details and Table */}
      <div className="border border-border bg-card rounded-none overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center md:justify-between bg-muted/15">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកសូចនាករ... (Search indicators by code or label)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-none pl-8 pr-3 h-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              disabled={filteredRows.length === 0}
              className="text-[11px] h-8 px-2.5 rounded-none font-medium bg-background border-border"
            >
              {expandedIndicators.size === filteredRows.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {loading && !countryRows.length ? (
            <div className="flex h-64 items-center justify-center p-8 text-center text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              Loading reports...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-[11px] text-muted-foreground p-8 text-center">
              {countryRows.length === 0 ? (
                <div>
                  No warehouse analytics records loaded for <strong className="text-foreground">{currentPeriod.periodLabel}</strong>.<br />
                  Select period parameters and click <strong>ទាញទិន្នន័យ (Run)</strong> inside toolbar.
                </div>
              ) : (
                'No indicators match your filter query.'
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b bg-muted/40 text-left font-bold text-foreground">
                  <th className="p-2.5 w-8"></th>
                  <th className="p-2.5 min-w-[280px]">សូចនាករ (Indicator Name)</th>
                  <th className="p-2.5 text-right">ប្រុស ០-១៤</th>
                  <th className="p-2.5 text-right">ស្រី ០-១៤</th>
                  <th className="p-2.5 text-right">ប្រុស &gt;១៤</th>
                  <th className="p-2.5 text-right">ស្រី &gt;១៤</th>
                  <th className="p-2.5 text-right font-black">សរុប (Total)</th>
                  <th className="p-2.5 text-right pr-4">មន្ទីរពេទ្យ (Sites)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRows.map((row, idx) => {
                  const isExpanded = expandedIndicators.has(row.indicator);
                  const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
                  
                  // Filter matching province records for drill down
                  const matchingProvinces = provinceRows.filter(p => p.indicator === row.indicator);

                  return (
                    <Fragment key={`${row.indicator}-${idx}`}>
                      <tr
                        onClick={() => toggleRow(row.indicator)}
                        className="hover:bg-muted/15 transition-all cursor-pointer group border-b"
                      >
                        <td className="p-2.5 text-center">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-primary transition" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-foreground">
                          {(() => {
                            const translated = getTranslatedLabel(row.indicator);
                            const { khmerPart, englishPart } = splitIndicatorLabel(translated);
                            return (
                              <div className="leading-snug text-left">
                                <div className="text-foreground group-hover:text-primary transition-colors">{khmerPart}</div>
                                {englishPart && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">({englishPart})</div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-report-male/85 font-medium">{formatVal(row.Male_0_14)}</td>
                        <td className="p-2.5 text-right tabular-nums text-report-female/85 font-medium">{formatVal(row.Female_0_14)}</td>
                        <td className="p-2.5 text-right tabular-nums text-report-male/95 font-medium">{formatVal(row.Male_over_14)}</td>
                        <td className="p-2.5 text-right tabular-nums text-report-female/95 font-medium">{formatVal(row.Female_over_14)}</td>
                        <td className="p-2.5 text-right tabular-nums font-black text-foreground underline decoration-border/60 bg-muted/5">{formatVal(grandTotal)}</td>
                        <td className="p-2.5 text-right tabular-nums font-medium text-muted-foreground">{formatVal(row.site_count)}</td>
                      </tr>

                      {/* Province Drill-Down Row */}
                      {isExpanded && (
                        <tr className="bg-muted/5">
                          <td colSpan={8} className="p-3 border-t border-b bg-muted/5">
                            <div className="px-4 py-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                  Province Breakdown for: {row.indicator.includes('. ') ? row.indicator.split('. ')[1] : row.indicator}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  Proportion of total metrics reported per province
                                </div>
                              </div>

                              {matchingProvinces.length === 0 ? (
                                <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-none bg-background text-center">
                                  No province details loaded. Ensure ETL sync completed successfully.
                                </div>
                              ) : (
                                <div className="border rounded-none overflow-hidden bg-background shadow-inner">
                                  <table className="w-full text-[10px] border-collapse">
                                    <thead>
                                      <tr className="border-b bg-muted/20 text-left font-bold text-muted-foreground">
                                        <th className="p-2 pl-3">Province</th>
                                        <th className="p-2 text-right">Male 0-14</th>
                                        <th className="p-2 text-right">Female 0-14</th>
                                        <th className="p-2 text-right">Male &gt;14</th>
                                        <th className="p-2 text-right">Female &gt;14</th>
                                        <th className="p-2 text-right font-bold text-foreground">Total</th>
                                        <th className="p-2 text-right">Share (%)</th>
                                        <th className="p-2 text-right pr-3">Reporting Sites</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                      {matchingProvinces.map((prov, pIdx) => {
                                        const provTotal = Number(prov.Male_0_14 || 0) + Number(prov.Female_0_14 || 0) + Number(prov.Male_over_14 || 0) + Number(prov.Female_over_14 || 0);
                                        const pct = grandTotal > 0 ? (provTotal / grandTotal) * 100 : 0;
                                        return (
                                          <tr key={`${prov.province_id}-${pIdx}`} className="hover:bg-muted/5 transition-colors">
                                            <td className="p-2 pl-3 font-semibold text-foreground text-left">{prov.province_name || `Province ${prov.province_id}`}</td>
                                            <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_0_14)}</td>
                                            <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_0_14)}</td>
                                            <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_over_14)}</td>
                                            <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_over_14)}</td>
                                            <td className="p-2 text-right tabular-nums font-bold text-foreground bg-muted/5">{formatVal(provTotal)}</td>
                                            <td className="p-2 text-right tabular-nums font-semibold text-primary">{pct.toFixed(1)}%</td>
                                            <td className="p-2 text-right tabular-nums pr-3 text-muted-foreground">{formatVal(prov.site_count)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {lastLoadedPeriod && (
          <div className="p-2 bg-muted/20 border-t flex items-center justify-between text-[11px] text-muted-foreground">
            <div>
              Currently displaying pre-aggregated warehouse data for period: <strong className="text-foreground">{lastLoadedPeriod}</strong>
            </div>
            <div>
              Total indicators: <strong className="text-foreground">{filteredRows.length}</strong>
            </div>
          </div>
        )}
      </div>
      </TabsContent>

      <TabsContent value="name_analytic" className="flex-1 space-y-4 data-[state=inactive]:hidden overflow-auto">
        {/* Sub tabs from Admin Analytics */}
        <Tabs defaultValue="data_view" className="space-y-4">
          <TabsList className="grid grid-cols-2 max-w-[280px] rounded-none bg-muted/35 p-1">
            <TabsTrigger value="data_view" className="rounded-none text-xs font-semibold py-1 px-3">Analytics Data</TabsTrigger>
            <TabsTrigger value="yearly_control" className="rounded-none text-xs font-semibold py-1 px-3">Yearly Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data_view" className="space-y-4 data-[state=inactive]:hidden">
            <Card className="border border-border bg-card rounded-none shadow-none">
              <CardHeader className="pb-3 border-b border-border bg-muted/10">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <CardTitle className="text-xs font-bold text-foreground">Data Filters (Mock UI)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Indicator</label>
                    <select disabled className="w-full bg-background border border-border text-xs px-2 py-1.5 rounded-none cursor-not-allowed">
                      <option>All Indicators</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Site</label>
                    <select disabled className="w-full bg-background border border-border text-xs px-2 py-1.5 rounded-none cursor-not-allowed">
                      <option>All Sites</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Period</label>
                    <input type="text" readOnly value="2025-Q1" className="w-full bg-background border border-border text-xs px-2 py-1.5 rounded-none cursor-not-allowed" />
                  </div>

                  <div className="flex items-end space-x-2">
                    <Button disabled className="h-8 text-xs font-semibold px-3 gap-1 rounded-none flex-1">
                      <RefreshCw className="h-3.5 w-3.5" /> Apply Filters
                    </Button>
                    <Button disabled variant="outline" className="h-8 text-xs font-semibold px-3 gap-1 rounded-none text-rose-500 border-border">
                      <Trash2 className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border border-border shadow-none rounded-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 border-b border-border text-left font-bold text-foreground">
                      <tr>
                        <th className="px-3 py-2.5">សុចនាករ Indicator</th>
                        <th className="px-3 py-2.5">កន្លែង Site</th>
                        <th className="px-3 py-2.5">រយៈពេល Period</th>
                        <th className="px-3 py-2.5 text-right">សរុប Total</th>
                        <th className="px-3 py-2.5 text-center">ស្ថានភាព Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="border-b bg-background">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">1. Active ART patients in previous quarter</div>
                          <div className="text-[10px] text-muted-foreground">01_active_art_previous</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">All Sites</div>
                          <div className="text-[10px] text-muted-foreground">all</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">quarterly 2025</div>
                          <div className="text-[10px] text-primary">Q1</div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="text-xs font-black text-foreground">66,339</div>
                          <div className="text-[10px] text-muted-foreground">M: 35,799 | F: 30,540</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className="text-[9px] font-medium bg-primary/10 text-primary rounded-none">completed</Badge>
                        </td>
                      </tr>
                      <tr className="border-b bg-background">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">2. Active Pre-ART patients in previous quarter</div>
                          <div className="text-[10px] text-muted-foreground">02_active_pre_art_previous</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">All Sites</div>
                          <div className="text-[10px] text-muted-foreground">all</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">quarterly 2025</div>
                          <div className="text-[10px] text-primary">Q1</div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="text-xs font-black text-foreground">13</div>
                          <div className="text-[10px] text-muted-foreground">M: 9 | F: 4</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className="text-[9px] font-medium bg-primary/10 text-primary rounded-none">completed</Badge>
                        </td>
                      </tr>
                      <tr className="border-b bg-background">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">3. Newly Enrolled</div>
                          <div className="text-[10px] text-muted-foreground">03_newly_enrolled</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">All Sites</div>
                          <div className="text-[10px] text-muted-foreground">all</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">quarterly 2025</div>
                          <div className="text-[10px] text-primary">Q1</div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="text-xs font-black text-foreground">1,249</div>
                          <div className="text-[10px] text-muted-foreground">M: 929 | F: 320</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className="text-[9px] font-medium bg-primary/10 text-primary rounded-none">completed</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yearly_control" className="space-y-4 data-[state=inactive]:hidden">
            {/* Engine Control */}
            <Card className="border border-border shadow-none rounded-none">
              <CardHeader className="pb-3 border-b border-border bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Database className="h-4 w-4 text-primary" />
                  Analytics Engine Control (Mock UI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary rounded-none text-[10px]">Enabled</Badge>
                  <span className="text-xs text-muted-foreground">Analytics engine is running</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled className="flex items-center gap-1 text-[11px] rounded-none border-border">
                    <Power className="h-3.5 w-3.5" /> Enable
                  </Button>
                  <Button size="sm" variant="outline" disabled className="flex items-center gap-1 text-[11px] rounded-none border-border">
                    <PowerOff className="h-3.5 w-3.5" /> Disable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Yearly Analytics Selection */}
            <Card className="border border-border shadow-none rounded-none">
              <CardHeader className="pb-3 border-b border-border bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Yearly Analytics (Mock UI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Select Year</label>
                    <select disabled className="w-full bg-background border border-border text-xs px-2 py-1.5 rounded-none cursor-not-allowed">
                      <option>2025</option>
                      <option>2026</option>
                    </select>
                  </div>
                  <div className="pt-5">
                    <Button disabled size="sm" className="flex items-center gap-1 rounded-none text-xs font-semibold h-8 px-3">
                      <Play className="h-3.5 w-3.5" /> Run Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mock Real-Time Log Viewer */}
            <Card className="border border-border shadow-none rounded-none">
              <CardHeader className="pb-3 border-b border-border bg-muted/10">
                <CardTitle className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Real-Time Execution Logs (Mock UI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-zinc-950 font-mono text-[10px] text-zinc-300 space-y-1.5 rounded-none h-48 overflow-y-auto">
                <div className="text-zinc-500">[2026-06-02 07:05:10] [info] Starting yearly ETL run for 2025...</div>
                <div className="text-zinc-350">[2026-06-02 07:05:12] [info] Processing site: Siemreap (1209)... success</div>
                <div className="text-zinc-350">[2026-06-02 07:05:15] [info] Processing site: Battambang (1201)... success</div>
                <div className="text-zinc-350">[2026-06-02 07:05:18] [info] Processing site: Phnom Penh (1212)... success</div>
                <div className="text-emerald-500">[2026-06-02 07:05:22] [success] Yearly analytics aggregation completed. 35,400 rows processed.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>

      {/* Clean Confirmation Modal */}
      {cleanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(88vh,42rem)] w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl border">
            {/* Modal Header */}
            <div className="flex shrink-0 items-start gap-3 border-b border-border/80 bg-muted/35 px-5 py-3 justify-between">
              <h2 className="text-xs font-bold text-foreground">សម្អាតទិន្នន័យឃ្លាំងវិភាគ (Clean Warehouse Analytics)</h2>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setCleanModalOpen(false)}
                disabled={clearing}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[11px] leading-relaxed">
              <p className="text-muted-foreground">
                ការសម្អាតទិន្នន័យឃ្លាំងវិភាគ នឹងលុបទិន្នន័យដែលបានសមកាលកម្មរួចជាបណ្តោះអាសន្ន។ អ្នកអាចទាញសមកាលកម្មឡើងវិញបានគ្រប់ពេល។
                <br />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  (Clearing analytics warehouse data deletes previously pre-aggregated values. You can run synchronization again at any time.)
                </span>
              </p>

              <div className="space-y-2 border border-border/80 p-3 bg-muted/10">
                <label className="flex items-center gap-3 cursor-pointer font-semibold text-foreground py-1">
                  <input
                    type="radio"
                    name="cleanOption"
                    checked={!cleanAllOption}
                    onChange={() => setCleanAllOption(false)}
                    disabled={clearing}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="text-left">
                    <div>សម្អាតតែគ្រានេះ (Clean Selected Period)</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      លុបទិន្នន័យសរុបសម្រាប់តែរយៈពេល <strong>{currentPeriod.periodLabel}</strong> នេះប៉ុណ្ណោះ។
                    </div>
                  </div>
                </label>

                <Separator className="my-2" />

                <label className="flex items-center gap-3 cursor-pointer font-semibold text-foreground py-1">
                  <input
                    type="radio"
                    name="cleanOption"
                    checked={cleanAllOption}
                    onChange={() => setCleanAllOption(true)}
                    disabled={clearing}
                    className="h-4 w-4 accent-rose-500"
                  />
                  <div className="text-left">
                    <div className="text-destructive font-bold">សម្អាតឃ្លាំងទាំងមូល (Clean All Data)</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      លុបទិន្នន័យសរុបទាំងអស់ពីតារាងឃ្លាំងវិភាគ (Truncate table)។
                    </div>
                  </div>
                </label>
              </div>

              {cleanAllOption && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-850 text-[10px] leading-snug">
                  <strong>⚠️ ព្រមាន (Warning):</strong> ជម្រើសនេះនឹងលុបគ្រប់ត្រីមាស និងគ្រប់ខែទាំងអស់ពីឃ្លាំងទិន្នន័យ។
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 justify-end gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCleanModalOpen(false)}
                disabled={clearing}
                className="text-[11px] h-8 rounded-none px-3 font-medium bg-background"
              >
                បោះបង់ (Cancel)
              </Button>
              <Button
                variant={cleanAllOption ? 'destructive' : 'default'}
                size="sm"
                onClick={handleClearAnalytics}
                disabled={clearing}
                className="text-[11px] h-8 rounded-none px-3 font-semibold gap-1"
              >
                {clearing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    កំពុងសម្អាត...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    យល់ព្រមសម្អាត (Confirm)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
