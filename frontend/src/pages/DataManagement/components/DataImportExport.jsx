import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Database,
  Eye,
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  Users,
  Layers,
  ArrowUpRight,
  Sparkles,
  Target,
  Globe
} from 'lucide-react';
import api from "../../../services/api";
import toastService from "../../../services/toastService";

import ImportTab from './ImportTab';
import DataViewer from './DataViewer';

const DataImportExport = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastImport: null,
    successRate: 0,
    activeSites: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showMessage = (type, message) => {
    if (type === 'success') {
      toastService.success('Success', message);
    } else if (type === 'error') {
      toastService.error('Error', message);
    } else if (type === 'warning') {
      toastService.warning('Warning', message);
    } else if (type === 'info') {
      toastService.info('Info', message);
    }
  };

  const getActiveSites = () => {
    return sites.filter(site => site.status === 1);
  };

  const calculateStats = () => {
    const activeSites = getActiveSites().length;
    const totalSize = sites.reduce((acc, site) => acc + (site.fileSize || 0), 0);
    const successRate = sites.length > 0 ? Math.round((sites.filter(site => site.status === 1).length / sites.length) * 100) : 0;
    
    setStats({
      totalFiles: sites.length,
      totalSize: totalSize,
      lastImport: sites.length > 0 ? new Date().toISOString() : null,
      successRate,
      activeSites
    });
  };


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSites();
    calculateStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    console.log('DataImportExport useEffect triggered');
    fetchSites();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [sites]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      console.log('Fetching sites...');
      const response = await api.get('/apiv1/lookups/sites-registry');
      console.log('Response data:', response.data);
      
      if (Array.isArray(response.data)) {
        const activeSites = response.data.filter(site => site.status === 1);
        console.log('Sites loaded:', activeSites.length, 'out of', response.data.length);
        setSites(activeSites);
        toastService.success('Sites Loaded', `Successfully loaded ${activeSites.length} active sites`);
      } else {
        console.error('API returned unexpected format:', response.data);
        showMessage('error', 'Failed to load sites: Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching sites from sites-registry:', error);
      
      try {
        console.log('Trying fallback sites endpoint...');
        const fallbackResponse = await api.get('/apiv1/sites');
        console.log('Fallback response data:', fallbackResponse.data);
        
        if (fallbackResponse.data.success && Array.isArray(fallbackResponse.data.sites)) {
          const activeSites = fallbackResponse.data.sites.filter(site => site.status === 1);
          console.log('Sites loaded from fallback:', activeSites.length, 'out of', fallbackResponse.data.sites.length);
          setSites(activeSites);
          toastService.info('Sites Loaded', `Loaded ${activeSites.length} active sites from fallback endpoint`);
        } else {
          showMessage('error', 'Failed to load sites from both endpoints');
          setSites([]);
        }
      } catch (fallbackError) {
        console.error('Error fetching sites from fallback:', fallbackError);
        showMessage('error', 'Failed to load sites. Please check your connection and try again.');
        setSites([]);
      }
    } finally {
      setLoading(false);
    }
  };

  console.log('DataImportExport component rendered');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-4 md:space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-none blur-3xl" />
          <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-none md:rounded-none p-4 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-none md:rounded-none blur-lg opacity-30" />
                    <div className="relative p-3 md:p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-none md:rounded-none border border-primary/20">
                      <Database className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-4xl font-bold text-primary">
                      Data Management
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground mt-1 md:mt-2">
                      Advanced data import, export & analytics platform
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <Badge variant="outline" className="px-2 py-1 md:px-3 text-xs md:text-sm text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Enterprise Grade</span>
                    <span className="sm:hidden">Enterprise</span>
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 md:px-3 text-xs md:text-sm bg-secondary/10 text-secondary border-secondary/20">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Real-time Sync</span>
                    <span className="sm:hidden">Sync</span>
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 md:px-3 text-xs md:text-sm bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.successRate}% Success
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"

                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 text-xs md:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button className=" bg-primary  text-xs md:text-sm px-3 md:px-4">
                  <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Export All</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 transition-all duration-300">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400">Total Sites</p>
                  <p className="text-xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeSites}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Active sites</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-500 rounded-none md:rounded-none flex-shrink-0">
                  <Globe className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 transition-all duration-300">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">Data Files</p>
                  <p className="text-xl md:text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalFiles}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Imported files</p>
                </div>
                <div className="p-2 md:p-3 bg-green-500 rounded-none md:rounded-none flex-shrink-0">
                  <FileText className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 transition-all duration-300">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-400">Success Rate</p>
                  <p className="text-xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.successRate}%</p>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-none h-1 md:h-2 mt-1 md:mt-2">
                    <div 
                      className="bg-purple-500 h-1 md:h-2 rounded-none transition-all duration-500"
                      style={{ width: `${stats.successRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-2 md:p-3 bg-purple-500 rounded-none md:rounded-none flex-shrink-0">
                  <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 transition-all duration-300">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-orange-600 dark:text-orange-400">Last Import</p>
                  <p className="text-sm md:text-lg font-bold text-orange-900 dark:text-orange-100">
                    {stats.lastImport ? new Date(stats.lastImport).toLocaleTimeString() : 'Never'}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Recent activity</p>
                </div>
                <div className="p-2 md:p-3 bg-orange-500 rounded-none md:rounded-none flex-shrink-0">
                  <Clock className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <Tabs defaultValue="import" className="w-full">
          <div className="relative">
            <div className="absolute  bg-gradient-to-r from-primary/5 to-secondary/5 rounded-none md:rounded-none blur-xl" />
            <div className="relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-none md:rounded-none">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger 
                  value="import" 
                  className="flex items-center space-x-1 md:space-x-2 data-[state=active]: data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Upload className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Import Data</span>
                  <span className="sm:hidden">Import</span>
              
                </TabsTrigger>
                <TabsTrigger 
                  value="viewer" 
                  className="flex items-center space-x-1 md:space-x-2 data-[state=active]: data-[state=active]:text-primary-foreground transition-all duration-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">View Data</span>
                  <span className="sm:hidden">View</span>

                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="import" className="space-y-4 md:space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/50 p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 rounded-none">
                    <Upload className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold">Data Import Center</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Upload and process your data files with advanced validation</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ImportTab
                  sites={getActiveSites()}
                  loading={loading}
                  setLoading={setLoading}
                  showMessage={showMessage}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="viewer" className="space-y-4 md:space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 border-b border-border/50 p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 bg-secondary/10 rounded-none">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold">Data Analytics Dashboard</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Explore and analyze your imported data with powerful visualizations</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataViewer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataImportExport;