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
  Download,
  RefreshCw,
  Zap,
  Shield,
  Users,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import api from "../../../services/api";

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

  const showMessage = () => {};

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
      

        <Tabs defaultValue="import" className="w-full">
          <div className="relative">
            <div className="absolute  bg-gradient-to-r from-primary/5 to-secondary/5 rounded-md md:rounded-md blur-xl" />
            <div className="relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-md md:rounded-md">
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
                  <div className="p-2 rounded-md">
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
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 bg-secondary/10 rounded-md">
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