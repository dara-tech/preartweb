import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Download,
  BarChart3,
  ArrowLeft,
  Calendar,
  Activity,
  FlaskConical,
  UserCheck,
  UserX,
  Users,
  Pill,
  LineChart as LineChartIcon,
  Table as TableIcon,
  HeartPulse,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  FaChartLine, 
  FaHeartBroken, 
  FaUserSlash, 
  FaUserCheck, 
  FaCalendarAlt, 
  FaPills,
  FaVirus,
  FaUsers
} from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'sonner';

const CQIPeriodComparisonPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [comparisonType, setComparisonType] = useState('quarterly');
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1), // Start from Jan 1, 2024 to include all populated data
    to: new Date()
  });
  const [selectedSite, setSelectedSite] = useState('0401'); // Default to site with data
  const [sites, setSites] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState(['1', '2', '15', '12d']);

  const availableIndicators = [
    { code: '1', name: 'Mortality Rate', category: 'Critical', color: '#ef4444', icon: FaHeartBroken },
    { code: '2', name: 'Lost to Follow-up', category: 'Critical', color: '#f97316', icon: FaUserSlash },
    { code: '3', name: 'Reengagement <28 days', category: 'Re-engagement', color: '#84cc16', icon: FaUserCheck },
    { code: '4', name: 'Reengagement >28 days', category: 'Re-engagement', color: '#22c55e', icon: FaUserCheck },
    { code: '6a', name: 'Same-day ART', category: 'Initiation', color: '#3b82f6', icon: HeartPulse },
    { code: '6b', name: 'ART 1-7 days', category: 'Initiation', color: '#6366f1', icon: HeartPulse },
    { code: '9b', name: 'MMD 3 months', category: 'MMD', color: '#8b5cf6', icon: FaCalendarAlt },
    { code: '9e', name: 'MMD 6+ months', category: 'MMD', color: '#a855f7', icon: FaCalendarAlt },
    { code: '10a', name: 'TLD Initiation', category: 'Treatment', color: '#f59e0b', icon: FaPills },
    { code: '10b', name: 'TLD Cumulative', category: 'Treatment', color: '#d97706', icon: FaPills },
    { code: '11a', name: 'TPT Received', category: 'Prevention', color: '#14b8a6', icon: Pill },
    { code: '11b', name: 'TPT Completed', category: 'Prevention', color: '#0d9488', icon: Pill },
    { code: '12a', name: 'VL Testing Coverage', category: 'VL', color: '#06b6d4', icon: FaVirus },
    { code: '12c', name: 'VL Suppression 12M', category: 'VL', color: '#0891b2', icon: FaVirus },
    { code: '12d', name: 'VL Suppression Overall', category: 'VL', color: '#0e7490', icon: FaVirus },
    { code: '15', name: 'Retention Rate', category: 'Retention', color: '#10b981', icon: FaUsers }
  ];

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    generatePeriods();
  }, [comparisonType, dateRange]);

  useEffect(() => {
    if (periods.length > 0) {
      loadComparisonData();
    }
  }, [periods, selectedIndicators, selectedSite]);

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

  const generatePeriods = () => {
    const generated = [];
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();
    
    if (comparisonType === 'quarterly') {
      // Generate last 8 quarters with EXACT quarter boundaries
      // Q1: Jan 1 - Mar 31, Q2: Apr 1 - Jun 30, Q3: Jul 1 - Sep 30, Q4: Oct 1 - Dec 31
      
      const currentYear = endDate.getFullYear();
      const currentMonth = endDate.getMonth(); // 0-11
      const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
      
      for (let i = 7; i >= 0; i--) {
        // Calculate quarter and year going backwards
        let q = currentQuarter - i;
        let y = currentYear;
        
        while (q <= 0) {
          q += 4;
          y -= 1;
        }
        
        // Create quarter boundaries using date strings (avoid timezone issues)
        let startDate, endDate;
        if (q === 1) {
          startDate = `${y}-01-01`;
          endDate = `${y}-03-31`;
        } else if (q === 2) {
          startDate = `${y}-04-01`;
          endDate = `${y}-06-30`;
        } else if (q === 3) {
          startDate = `${y}-07-01`;
          endDate = `${y}-09-30`;
        } else { // q === 4
          startDate = `${y}-10-01`;
          endDate = `${y}-12-31`;
        }
        
        generated.push({
          label: `Q${q} ${y}`,
          startDate: startDate,
          endDate: endDate
        });
      }
    } else if (comparisonType === 'monthly') {
      // Generate last 12 months with exact month boundaries
      const currentYear = endDate.getFullYear();
      const currentMonth = endDate.getMonth(); // 0-11
      
      for (let i = 11; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        
        while (m < 0) {
          m += 12;
          y -= 1;
        }
        
        // Get last day of month
        const lastDay = new Date(y, m + 1, 0).getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        generated.push({
          label: `${monthNames[m]} ${y}`,
          startDate: `${y}-${String(m + 1).padStart(2, '0')}-01`,
          endDate: `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        });
      }
    } else if (comparisonType === 'yearly') {
      const currentYear = endDate.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        generated.push({
          label: year.toString(),
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`
        });
      }
    }
    
    setPeriods(generated);
  };

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      
      const results = {};
      
      for (const indicator of selectedIndicators) {
        results[indicator] = [];
        
        for (const period of periods) {
          try {
            const response = await api.get('/apiv1/cqi-indicators/summary', {
              params: {
                startDate: period.startDate,
                endDate: period.endDate,
                siteId: selectedSite === 'all' ? null : selectedSite
              }
            });
            
            if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
              const indicatorData = response.data.data.find(d => d.indicator_code === indicator);
              
              results[indicator].push({
                period: period.label,
                percentage: indicatorData?.percentage || 0,
                numerator: indicatorData?.numerator || 0,
                denominator: indicatorData?.denominator || 0,
                male_0_14: indicatorData?.male_0_14 || 0,
                female_0_14: indicatorData?.female_0_14 || 0,
                male_over_14: indicatorData?.male_over_14 || 0,
                female_over_14: indicatorData?.female_over_14 || 0
              });
            } else {
              results[indicator].push({
                period: period.label,
                percentage: 0,
                numerator: 0,
                denominator: 0
              });
            }
          } catch (err) {
            console.error(`❌ Error loading data for ${indicator} ${period.label}:`, err);
            results[indicator].push({
              period: period.label,
              percentage: 0,
              numerator: 0,
              denominator: 0,
              error: true
            });
          }
        }
      }
      
      setComparisonData(results);
    } catch (error) {
      console.error('Error loading comparison data:', error);
      toast.error('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { change: 0, direction: 'stable' };
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      isPositive: change > 0
    };
  };

  const prepareChartData = () => {
    if (!comparisonData) return [];
    
    return periods.map(period => {
      const dataPoint = { period: period.label };
      selectedIndicators.forEach(indicator => {
        const indicatorData = comparisonData[indicator]?.find(d => d.period === period.label);
        dataPoint[indicator] = indicatorData?.percentage || 0;
      });
      return dataPoint;
    });
  };

  const exportComparison = () => {
    const csv = ['Period,' + selectedIndicators.map(ind => 
      availableIndicators.find(i => i.code === ind)?.name || ind
    ).join(',')];
    
    const chartData = prepareChartData();
    chartData.forEach(row => {
      const values = [row.period];
      selectedIndicators.forEach(ind => values.push(row[ind]));
      csv.push(values.join(','));
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cqi-comparison-${comparisonType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Comparison data exported successfully');
  };

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6 space-y-6">
      {/* Modern Header with Shadow */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/cqi-dashboard')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('comparison.back')}
            </Button>
            <div className="h-8 w-px bg-border"></div>
            <div>
              {/* Compact Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <BarChart3 className="h-3 w-3" />
                <span>{t('comparison.breadcrumbAnalytics')}</span>
                <ChevronRight className="h-3 w-3" />
                <HeartPulse className="h-3 w-3" />
                <span>{t('comparison.breadcrumbCQI')}</span>
                <ChevronRight className="h-3 w-3" />
                <FaChartLine className="h-3 w-3" />
                <span className="text-foreground font-medium">{t('comparison.breadcrumbComparison')}</span>
              </div>
              
              {/* Title with Icon */}
              <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaChartLine className="h-6 w-6 text-primary" />
                </div>
                {t('comparison.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {t('comparison.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={loadComparisonData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('comparison.refresh')}
            </Button>
            <Button onClick={exportComparison} variant="outline" size="sm" disabled={!comparisonData || loading}>
              <Download className="h-4 w-4 mr-2" />
              {t('comparison.export')}
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Modern Filter Bar (Apple/Google Style) */}
      <Card className="">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Comparison Type */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={comparisonType} onValueChange={setComparisonType}>
                <SelectTrigger className="w-[200px] rounded-full border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">📅 {t('comparison.quarterly')}</SelectItem>
                  <SelectItem value="monthly">📆 {t('comparison.monthly')}</SelectItem>
                  <SelectItem value="yearly">🗓️ {t('comparison.yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-8 w-px bg-border"></div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>

            <div className="h-8 w-px bg-border"></div>

            {/* Site Filter */}
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[200px] rounded-full border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cqi.allSites')}</SelectItem>
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

      {/* Modern Indicator Selection with Category Grouping */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              {t('comparison.selectIndicators')}
            </CardTitle>
            <Badge variant="default" className="rounded-full px-3 py-1 text-sm font-semibold bg-primary">
              {selectedIndicators.length} {t('comparison.selected')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Group by Category */}
          {Object.entries(
            availableIndicators.reduce((acc, ind) => {
              if (!acc[ind.category]) acc[ind.category] = [];
              acc[ind.category].push(ind);
              return acc;
            }, {})
          ).map(([category, indicators]) => (
            <div key={category} className="mb-4 last:mb-0">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {indicators.map(ind => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndicators.includes(ind.code);
                  
                  return (
                    <button
                      key={ind.code}
                      onClick={() => {
                        setSelectedIndicators(prev => 
                          prev.includes(ind.code) 
                            ? prev.filter(c => c !== ind.code)
                            : [...prev, ind.code]
                        );
                      }}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-primary bg-primary text-primary-foreground scale-105' 
                          : 'border-border bg-card hover:border-primary/50 '
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : ''}`} style={!isSelected ? { color: ind.color } : {}} />
                      <span className="text-sm font-medium">
                        <span className="font-mono font-semibold">{ind.code}</span>: {ind.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {loading ? (
        <Card className="">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground">{t('comparison.loadingComparison')}</p>
              <p className="text-sm text-muted-foreground">{t('comparison.analyzingIndicators', { count: selectedIndicators.length, periods: periods.length })}</p>
            </div>
          </CardContent>
        </Card>
      ) : comparisonData ? (
        <Tabs defaultValue="line" className="space-y-6">
          {/* Modern Segmented Control */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-muted rounded-full border">
              <TabsList className="bg-transparent gap-1">
                <TabsTrigger 
                  value="line"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  transition-all"
                >
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  {t('comparison.lineChart')}
                </TabsTrigger>
                <TabsTrigger 
                  value="bar"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  transition-all"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('comparison.barChart')}
                </TabsTrigger>
                <TabsTrigger 
                  value="table"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  transition-all"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  {t('comparison.table')}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Line Chart - Modern Container */}
          <TabsContent value="line">
            <Card className="rounded-xl bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LineChartIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">{t('comparison.trendComparison')}</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {t('comparison.quarterlyAnalysis')} • {selectedIndicators.length} {t('comparison.indicators')}
                      </div>
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {periods.length} {t('comparison.periods')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 13, fill: '#6b7280' }}
                        stroke="#9ca3af"
                        angle={comparisonType === 'monthly' ? -45 : 0}
                        textAnchor={comparisonType === 'monthly' ? 'end' : 'middle'}
                        height={comparisonType === 'monthly' ? 80 : 60}
                      />
                      <YAxis 
                        tick={{ fontSize: 13, fill: '#6b7280' }}
                        domain={[0, 100]}
                        label={{ 
                          value: 'Percentage (%)', 
                          angle: -90, 
                          position: 'insideLeft', 
                          style: { fontSize: 14, fill: '#6b7280', fontWeight: 500 } 
                        }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: '30px', 
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                        iconType="line"
                      />
                      {selectedIndicators.map((ind) => {
                        const indicatorInfo = availableIndicators.find(i => i.code === ind);
                        return (
                          <Line 
                            key={ind}
                            type="monotone" 
                            dataKey={ind} 
                            stroke={indicatorInfo?.color || '#3b82f6'}
                            strokeWidth={3}
                            name={indicatorInfo?.name || ind}
                            dot={{ r: 5, strokeWidth: 2, fill: indicatorInfo?.color }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bar Chart - Modern Container */}
          <TabsContent value="bar">
            <Card className="rounded-xl bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">Bar Chart Comparison</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        Side-by-side comparison • {selectedIndicators.length} indicators
                      </div>
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {periods.length} periods
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 13 }}
                        angle={comparisonType === 'monthly' ? -45 : 0}
                        textAnchor={comparisonType === 'monthly' ? 'end' : 'middle'}
                        height={comparisonType === 'monthly' ? 80 : 60}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Legend wrapperStyle={{ paddingTop: '30px' }} />
                      {selectedIndicators.map((ind) => {
                        const indicatorInfo = availableIndicators.find(i => i.code === ind);
                        return (
                          <Bar 
                            key={ind}
                            dataKey={ind}
                            fill={indicatorInfo?.color || '#3b82f6'}
                            name={indicatorInfo?.name || ind}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table View - Modern Cards */}
          <TabsContent value="table" className="space-y-6">
            {selectedIndicators.map(indicatorCode => {
              const indicatorInfo = availableIndicators.find(i => i.code === indicatorCode);
              const Icon = indicatorInfo?.icon;
              const data = comparisonData[indicatorCode] || [];
              
              return (
                <Card key={indicatorCode} className="rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/20 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-lg text-white"
                            style={{ backgroundColor: indicatorInfo?.color }}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline"
                                className="font-mono font-semibold text-xs"
                              >
                                {indicatorCode}
                              </Badge>
                              <span className="font-bold">{indicatorInfo?.name}</span>
                            </div>
                            <div className="text-xs font-normal text-muted-foreground mt-0.5">
                              {indicatorInfo?.category}
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Period</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Percentage</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Numerator</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Denominator</th>
                            <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Change</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Male 0-14</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Female 0-14</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Male 15+</th>
                            <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wide text-muted-foreground bg-muted/50">Female 15+</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((periodData, index) => {
                            const previousData = index > 0 ? data[index - 1] : null;
                            const change = previousData ? calculateChange(periodData.percentage, previousData.percentage) : null;
                            
                            return (
                              <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-6 font-semibold text-foreground">{periodData.period}</td>
                                <td className="text-right py-4 px-6">
                                  <span className="text-2xl font-bold text-primary">{periodData.percentage.toFixed(1)}%</span>
                                </td>
                                <td className="text-right py-4 px-6 text-muted-foreground font-medium">
                                  {periodData.numerator.toLocaleString()}
                                </td>
                                <td className="text-right py-4 px-6 text-muted-foreground font-medium">
                                  {periodData.denominator.toLocaleString()}
                                </td>
                                <td className="text-center py-4 px-6">
                                  {change ? (
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm ${
                                      change.direction === 'up' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                      change.direction === 'down' ? 'bg-destructive/10 text-destructive border border-destructive/30' :
                                      'bg-muted text-muted-foreground border border-border'
                                    }`}>
                                      {change.direction === 'up' ? <TrendingUp className="h-4 w-4" /> :
                                       change.direction === 'down' ? <TrendingDown className="h-4 w-4" /> :
                                       <Minus className="h-4 w-4" />}
                                      <span>{change.change}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                  )}
                                </td>
                                <td className="text-right py-4 px-6 text-sm font-medium text-blue-600">{periodData.male_0_14 || 0}</td>
                                <td className="text-right py-4 px-6 text-sm font-medium text-pink-600">{periodData.female_0_14 || 0}</td>
                                <td className="text-right py-4 px-6 text-sm font-medium text-blue-700">{periodData.male_over_14 || 0}</td>
                                <td className="text-right py-4 px-6 text-sm font-medium text-pink-700">{periodData.female_over_14 || 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="">
          <CardContent className="flex flex-col items-center justify-center h-96 text-center p-12">
            {/* Empty State Illustration */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                <FaChartLine className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Select Indicators to Begin
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Choose at least one CQI indicator from the list above to compare trends across different time periods.
            </p>
            
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Select comparison type (Quarterly, Monthly, or Yearly)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Choose indicators by clicking the badges above</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>View trends as line charts, bar charts, or detailed tables</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CQIPeriodComparisonPage;

