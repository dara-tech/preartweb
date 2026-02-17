import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  XCircle, 
  RefreshCw,
  Database,
  Activity,
  Users,
  Heart,
  Shield,
  Pill,
  TestTube,
  Download,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BarChart3,
  HeartPulse
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import CQIIndicatorCard from '../components/cqi/CQIIndicatorCard';
import CQITrendChart from '../components/cqi/CQITrendChart';
import CQIDemographicsChart from '../components/cqi/CQIDemographicsChart';
import CQIDemographicsChartSimple from '../components/cqi/CQIDemographicsChartSimple';
import CQIPerformanceGauge from '../components/cqi/CQIPerformanceGauge';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CQIDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    to: new Date() // Today
  });
  const [selectedSite, setSelectedSite] = useState('all');
  const [sites, setSites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [populateProgress, setPopulateProgress] = useState(null);
  const [showPopulateDialog, setShowPopulateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSites();
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedSite]);

  const loadSites = async () => {
    try {
      const response = await api.get('/apiv1/site-operations/sites');
      if (response.data.success) {
        setSites(response.data.sites || []);
      }
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        siteId: selectedSite === 'all' ? null : selectedSite
      };

      const response = await api.get('/apiv1/cqi-indicators/dashboard', { params });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to connect to CQI service');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed');
  };

  const populateData = async () => {
    try {
      setPopulating(true);
      setPopulateProgress({ stage: 'starting', message: 'Initializing data population...' });
      
      const params = {
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        siteId: selectedSite === 'all' ? null : selectedSite
      };

      console.log('🔵 Populating data with params:', params);
      console.log('🔵 Current selectedSite state:', selectedSite);

      // Show progress toast
      const toastId = toast.loading(`Populating CQI indicators for ${selectedSite === 'all' ? 'All Sites' : selectedSite}...`, {
        description: 'This may take a few moments'
      });

      setPopulateProgress({ stage: 'processing', message: 'Processing indicators...' });
      
      const response = await api.post('/apiv1/cqi-indicators/populate', params);
      
      if (response.data.success) {
        const result = response.data;
        
        setPopulateProgress({ 
          stage: 'completed', 
          message: 'Data population completed successfully',
          stats: result.stats || result.data
        });
        
        // Dismiss loading toast
        toast.dismiss(toastId);
        
        // Show success toast with details
        toast.success('CQI Indicators Populated Successfully!', {
          description: result.stats ? 
            `Processed ${result.stats.total_processed || 0} indicators` :
            'All indicators have been updated',
          duration: 5000
        });
        
        // Reload dashboard data
        setPopulateProgress({ stage: 'refreshing', message: 'Refreshing dashboard...' });
        await loadDashboardData();
        
      } else {
        toast.dismiss(toastId);
        toast.error('Failed to populate data', {
          description: response.data.message || 'Unknown error occurred'
        });
        setPopulateProgress({ 
          stage: 'error', 
          message: response.data.message || 'Failed to populate data'
        });
      }
    } catch (error) {
      console.error('Error populating data:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to connect to CQI service';
      
      toast.error('Population Failed', {
        description: errorMessage,
        duration: 5000
      });
      
      setPopulateProgress({ 
        stage: 'error', 
        message: errorMessage
      });
    } finally {
      setPopulating(false);
      
      // Clear progress after 3 seconds if completed or errored
      setTimeout(() => {
        if (populateProgress?.stage === 'completed' || populateProgress?.stage === 'error') {
          setPopulateProgress(null);
        }
      }, 3000);
    }
  };

  const handlePopulateClick = () => {
    console.log('🔵 Opening populate dialog for site:', selectedSite);
    setShowPopulateDialog(true);
  };
  
  const confirmPopulate = () => {
    console.log('✅ Confirming populate for site:', selectedSite);
    setShowPopulateDialog(false);
    populateData();
  };

  const resetIndicators = async () => {
    try {
      setResetting(true);
      
      const params = {
        siteId: selectedSite === 'all' ? null : selectedSite
      };

      const response = await api.delete('/apiv1/cqi-indicators/reset', { params });
      
      if (response.data.success) {
        toast.success('CQI indicators reset successfully', {
          description: params.siteId 
            ? `All data cleared for site ${params.siteId}` 
            : 'All indicators cleared and auto-increment reset to 1'
        });
        await loadDashboardData();
      } else {
        toast.error(response.data.message || 'Failed to reset indicators');
      }
    } catch (error) {
      console.error('Error resetting indicators:', error);
      toast.error('Failed to reset CQI indicators');
    } finally {
      setResetting(false);
      setShowResetDialog(false);
    }
  };

  const exportData = async () => {
    try {
      const params = {
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        siteId: selectedSite === 'all' ? null : selectedSite,
        format: 'summary'
      };

      const response = await api.get('/apiv1/cqi-indicators/export', { params });
      
      if (response.data.success) {
        // Create and download file
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cqi-indicators-${params.startDate}-to-${params.endDate}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Above Target': return 'bg-green-500';
      case 'Near Target': return 'bg-yellow-500';
      case 'Below Target': return 'bg-orange-500';
      case 'Well Below Target': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    return trend.direction === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      trend.direction === 'down' ? 
        <TrendingDown className="h-4 w-4 text-red-500" /> : 
        <Activity className="h-4 w-4 text-gray-500" />;
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading CQI Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reset CQI Indicators
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-red-700 font-semibold">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p>
                This will permanently delete all CQI indicator data for the selected scope.
              </p>
              <div className="bg-red-50 border border-destructive/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Scope:</span>
                  <span className="font-semibold text-red-700">
                    {selectedSite === 'all' 
                      ? '🚨 ALL SITES - ENTIRE DATABASE' 
                      : `Site: ${sites.find(s => s.code === selectedSite)?.name || selectedSite} (${selectedSite})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Action:</span>
                  <span className="text-red-700">Delete all indicator records</span>
                </div>
                {selectedSite === 'all' && (
                  <div className="flex justify-between">
                    <span className="font-medium">Auto-increment:</span>
                    <span className="text-red-700">Reset to 1</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                After resetting, you'll need to click "Populate Data" to regenerate indicators.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={resetIndicators}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {resetting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reset Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Populate Confirmation Dialog */}
      <AlertDialog open={showPopulateDialog} onOpenChange={setShowPopulateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Populate CQI Indicators
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will populate/recalculate all CQI indicators for the selected date range and site.
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date Range:</span>
                  <span>{dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Site:</span>
                  <span className="font-semibold text-primary">
                    {selectedSite === 'all' ? 'All Sites' : sites.find(s => s.code === selectedSite)?.name || selectedSite}
                    {selectedSite !== 'all' && <span className="ml-2 text-xs">({selectedSite})</span>}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 border border-primary/50 p-3 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">📊 Data Will Be Populated For:</p>
                <p>
                  {selectedSite === 'all' 
                    ? 'All available site databases will be processed.' 
                    : `Only site "${selectedSite}" will be processed. Other sites will not be affected.`}
                </p>
              </div>
              <p className="text-amber-600 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>This process may take several minutes depending on the amount of data.</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={populating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPopulate}
              disabled={populating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {populating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Populate Data'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Population Progress Card */}
      {populateProgress && (
        <Card className={`border-2 ${
          populateProgress.stage === 'completed' ? 'border-success bg-success/10' :
          populateProgress.stage === 'error' ? 'border-destructive bg-destructive/10' :
          'border-primary bg-primary/10'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {populateProgress.stage === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : populateProgress.stage === 'error' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              )}
              
              <div className="flex-1">
                <p className={`font-medium ${
                  populateProgress.stage === 'completed' ? 'text-green-900' :
                  populateProgress.stage === 'error' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  {populateProgress.message}
                </p>
                
                {populateProgress.stats && (
                  <div className="mt-2 flex gap-4 text-sm">
                    {populateProgress.stats.total_processed && (
                      <span className="text-green-700">
                        ✓ {populateProgress.stats.total_processed} processed
                      </span>
                    )}
                    {populateProgress.stats.successful && (
                      <span className="text-green-700">
                        ✓ {populateProgress.stats.successful} successful
                      </span>
                    )}
                    {populateProgress.stats.failed > 0 && (
                      <span className="text-red-700">
                        ✗ {populateProgress.stats.failed} failed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('cqi.dashboard')}</h1>
          <p className="text-gray-600">{t('cqi.title')}</p>
          {selectedSite && selectedSite !== 'all' && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <HeartPulse className="h-4 w-4" />
              <span>{t('cqi.viewingSite')}: {sites.find(s => s.code === selectedSite)?.name || selectedSite}</span>
              <Badge variant="secondary" className="text-xs">{selectedSite}</Badge>
            </div>
          )}
          {selectedSite === 'all' && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              <span>{t('cqi.viewingAllSites')}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing || populating}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('cqi.refresh')}
          </Button>
          <Button 
            onClick={handlePopulateClick} 
            disabled={refreshing || populating || resetting}
            variant="default"
            className="bg-blue-800 hover:bg-blue-700"
          >
            {populating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                {t('cqi.populateData')}
              </>
            )}
          </Button>
          <Button 
            onClick={() => setShowResetDialog(true)} 
            disabled={refreshing || populating || resetting}
            variant="destructive"
          >
            {resetting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                {t('cqi.resetData')}
              </>
            )}
          </Button>
          <Button 
            onClick={exportData}
            variant="outline"
            disabled={populating}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('cqi.export')}
          </Button>
          <Button 
            onClick={() => navigate('/cqi-comparison')}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Activity className="h-4 w-4 mr-2" />
            {t('cqi.comparePeriodsButton')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.code} value={site.code}>
                      {site.name} ({site.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {dashboardData?.key_metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.key_metrics.mortality_rate && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.key_metrics.mortality_rate.current.toFixed(2)}%
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getTrendIcon(dashboardData.key_metrics.mortality_rate.trend)}
                  {dashboardData.key_metrics.mortality_rate.trend && (
                    <span>
                      {dashboardData.key_metrics.mortality_rate.trend.percent_change > 0 ? '+' : ''}
                      {dashboardData.key_metrics.mortality_rate.trend.percent_change.toFixed(1)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {dashboardData.key_metrics.ltf_rate && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lost to Follow-up</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.key_metrics.ltf_rate.current.toFixed(2)}%
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getTrendIcon(dashboardData.key_metrics.ltf_rate.trend)}
                  {dashboardData.key_metrics.ltf_rate.trend && (
                    <span>
                      {dashboardData.key_metrics.ltf_rate.trend.percent_change > 0 ? '+' : ''}
                      {dashboardData.key_metrics.ltf_rate.trend.percent_change.toFixed(1)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {dashboardData.key_metrics.retention_rate && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.key_metrics.retention_rate.current.toFixed(2)}%
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getTrendIcon(dashboardData.key_metrics.retention_rate.trend)}
                  {dashboardData.key_metrics.retention_rate.trend && (
                    <span>
                      {dashboardData.key_metrics.retention_rate.trend.percent_change > 0 ? '+' : ''}
                      {dashboardData.key_metrics.retention_rate.trend.percent_change.toFixed(1)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {dashboardData.key_metrics.vl_suppression_rate && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VL Suppression</CardTitle>
                <TestTube className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.key_metrics.vl_suppression_rate.current.toFixed(2)}%
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getTrendIcon(dashboardData.key_metrics.vl_suppression_rate.trend)}
                  {dashboardData.key_metrics.vl_suppression_rate.trend && (
                    <span>
                      {dashboardData.key_metrics.vl_suppression_rate.trend.percent_change > 0 ? '+' : ''}
                      {dashboardData.key_metrics.vl_suppression_rate.trend.percent_change.toFixed(1)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mortality">Mortality & Retention</TabsTrigger>
          <TabsTrigger value="treatment">Treatment & Care</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring & VL</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardData?.current_period?.data && (
            <div className="space-y-6">
              {Object.entries(dashboardData.current_period.data).map(([category, indicators]) => (
                <Card key={category} className="border-2">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        {category === 'Mortality & Re-engagement' && <Heart className="h-6 w-6 text-red-500" />}
                        {category === 'Visit Status' && <Clock className="h-6 w-6 text-blue-500" />}
                        {category === 'Treatment & Prevention' && <Pill className="h-6 w-6 text-green-500" />}
                        {category === 'Multi-Month Dispensing' && <Activity className="h-6 w-6 text-purple-500" />}
                        {category === 'Treatment Optimization' && <Shield className="h-6 w-6 text-orange-500" />}
                        {category === 'Viral Load Monitoring' && <TestTube className="h-6 w-6 text-cyan-500" />}
                        {category === 'Treatment Switching' && <RefreshCw className="h-6 w-6 text-yellow-500" />}
                        {category === 'Retention' && <Users className="h-6 w-6 text-indigo-500" />}
                        <span className="font-bold">{category}</span>
                      </CardTitle>
                      <Badge variant="secondary" className="text-sm font-semibold">
                        {indicators.length} indicator{indicators.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {indicators.map((indicator, idx) => (
                        <CQIIndicatorCard 
                          key={`${category}-${indicator.indicator_code}-${idx}`}
                          indicator={indicator}
                          dateRange={dateRange}
                          siteId={selectedSite}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mortality" className="space-y-4">
          {dashboardData?.current_period?.data?.['Mortality & Re-engagement'] && (
            <>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-destructive p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Mortality & Re-engagement Indicators</h3>
                    <p className="text-sm text-red-700">Critical indicators for patient retention and care quality</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.current_period.data['Mortality & Re-engagement'].map((indicator, idx) => (
                  <Card key={`mortality-${indicator.indicator_code}-${idx}`} className="border-2">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">{indicator.indicator_name}</CardTitle>
                        <Badge variant="outline">{indicator.indicator_code}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CQIDemographicsChart 
                        indicator={indicator}
                        dateRange={dateRange}
                        siteId={selectedSite}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          {dashboardData?.current_period?.data?.['Treatment & Prevention'] && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-success p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Pill className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-green-900">Treatment & Prevention Indicators</h3>
                    <p className="text-sm text-green-700">ART initiation, prophylaxis, and baseline assessments</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.current_period.data['Treatment & Prevention'].map((indicator, idx) => (
                  <Card key={`treatment-${indicator.indicator_code}-${idx}`} className="border-2">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">{indicator.indicator_name}</CardTitle>
                        <Badge variant="outline">{indicator.indicator_code}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CQIPerformanceGauge 
                        indicator={indicator}
                        target={indicator.indicator_code.startsWith('6') ? 95 : 90}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {dashboardData?.current_period?.data?.['Viral Load Monitoring'] && (
            <>
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <TestTube className="h-6 w-6 text-cyan-600" />
                  <div>
                    <h3 className="text-lg font-bold text-cyan-900">Viral Load Monitoring Indicators</h3>
                    <p className="text-sm text-cyan-700">VL testing coverage, suppression rates, and adherence counseling</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dashboardData.current_period.data['Viral Load Monitoring'].map((indicator, idx) => (
                    <Card key={`vl-${indicator.indicator_code}-${idx}`} className="border-2">
                      <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">{indicator.indicator_name}</CardTitle>
                          <Badge variant="outline">{indicator.indicator_code}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <CQIDemographicsChartSimple 
                          indicator={indicator}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {dashboardData?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.summary.total_indicators}
                </div>
                <p className="text-sm text-gray-600">Total Indicators</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.summary.indicators_with_data}
                </div>
                <p className="text-sm text-gray-600">With Data</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.summary.last_updated ? 
                    new Date(dashboardData.summary.last_updated).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
                <p className="text-sm text-gray-600">Last Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CQIDashboard;
