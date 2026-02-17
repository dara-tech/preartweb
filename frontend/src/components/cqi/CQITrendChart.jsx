import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const CQITrendChart = ({ indicatorCode, dateRange, siteId }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodType, setPeriodType] = useState('quarterly');
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Only load if we have valid inputs
    if (indicatorCode && dateRange?.from && dateRange?.to) {
      // Reset attempt flag when inputs change
      if (!hasAttempted) {
    loadTrendData();
      }
    } else {
      setLoading(false);
      setError('Invalid date range provided');
    }
  }, [indicatorCode, dateRange, siteId, periodType]);

  const generatePeriods = () => {
    try {
    const periods = [];
      
      // Validate dateRange
      if (!dateRange || !dateRange.from || !dateRange.to) {
        console.warn('CQITrendChart: Invalid dateRange:', dateRange);
        return [];
      }
      
    const endDate = new Date(dateRange.to);
    const startDate = new Date(dateRange.from);
      
      // Validate dates
      if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
        console.warn('CQITrendChart: Invalid dates in dateRange');
        return [];
      }
    
    if (periodType === 'quarterly') {
      // Generate quarterly periods for the past 2 years
      const currentYear = endDate.getFullYear();
      const startYear = Math.max(currentYear - 1, startDate.getFullYear());
      
      for (let year = startYear; year <= currentYear; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterStart = new Date(year, (quarter - 1) * 3, 1);
          const quarterEnd = new Date(year, quarter * 3, 0);
          
          // Only include periods that are within our date range and not in the future
          if (quarterEnd <= endDate && quarterStart >= startDate) {
            periods.push({
              startDate: quarterStart.toISOString().split('T')[0],
              endDate: quarterEnd.toISOString().split('T')[0],
              label: `Q${quarter} ${year}`
            });
          }
        }
      }
    } else if (periodType === 'monthly') {
      // Generate monthly periods for the past year
      const currentDate = new Date(endDate);
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
        
        if (monthEnd <= endDate && monthStart >= startDate) {
          periods.push({
            startDate: monthStart.toISOString().split('T')[0],
            endDate: monthEnd.toISOString().split('T')[0],
            label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          });
        }
      }
    }
    
    return periods;
    } catch (err) {
      console.error('CQITrendChart: Error generating periods:', err);
      return [];
    }
  };

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasAttempted(true);

      const periods = generatePeriods();
      if (periods.length === 0) {
        setTrendData([]);
        setLoading(false);
        setError('No historical periods available for trend analysis');
        return;
      }

      // Validate periods array
      if (!periods || periods.length === 0 || !periods[0]?.startDate) {
        console.warn('CQITrendChart: Invalid periods array');
        setTrendData([]);
        setLoading(false);
        setError('Unable to generate valid time periods');
        return;
      }

      const response = await api.post(`/apiv1/cqi-indicators/${indicatorCode}/trend`, {
        periods: periods.map(p => ({ 
          startDate: p.startDate, 
          endDate: p.endDate 
        })),
        siteId: siteId === 'all' ? null : siteId
      });

      if (response.data.success) {
        const trendWithLabels = response.data.data.map((item, index) => ({
          ...item,
          label: periods[index]?.label || `Period ${index + 1}`,
          period_start: item.period?.start_date || item.start_date,
          period_end: item.period?.end_date || item.end_date
        }));
        
        setTrendData(trendWithLabels);
        setError(null); // Clear any previous errors
      } else {
        console.warn('CQITrendChart: API returned non-success:', response.data.message);
        setError(response.data.message || 'Failed to load trend data');
        setTrendData([]); // Set empty array to prevent retries
      }
    } catch (err) {
      console.error('Error loading trend data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to connect to CQI service';
      
      // Only log detailed error once
      if (!hasAttempted) {
        console.error('CQITrendChart Error Details:', {
          indicatorCode,
          status: err.response?.status,
          message: errorMessage,
          details: err.response?.data?.details
        });
      }
      
      setError(errorMessage);
      setTrendData([]); // Set empty array to prevent infinite retries
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (trendData.length < 2) return null;
    
    const firstValue = trendData[0].percentage;
    const lastValue = trendData[trendData.length - 1].percentage;
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const trend = calculateTrend();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Percentage: {data.percentage.toFixed(2)}%
          </p>
          <p className="text-gray-600">
            {data.numerator} / {data.denominator}
          </p>
          <p className="text-sm text-gray-500">
            {data.period_start} to {data.period_end}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Activity className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm text-muted-foreground mb-1">Trend analysis unavailable</p>
        <p className="text-xs text-gray-400">{error}</p>
        <Button 
          onClick={() => {
            setHasAttempted(false);
            setError(null);
            loadTrendData();
          }} 
          size="sm"
          variant="outline"
          className="mt-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (trendData.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Activity className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">No trend data available</p>
        <p className="text-xs text-gray-400 mt-2">Trend analysis requires data from multiple reporting periods.</p>
        <p className="text-xs text-gray-400">Please populate data for additional periods to see trends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {trend.direction === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
            <span className={`font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.change > 0 ? '+' : ''}{trend.change}% 
              ({trend.percentChange > 0 ? '+' : ''}{trend.percentChange}%)
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-gray-900">
            {trendData.length > 0 ? trendData[trendData.length - 1].percentage.toFixed(2) : 0}%
          </div>
          <div className="text-gray-500">Current</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {trendData.length > 0 ? (trendData.reduce((sum, item) => sum + item.percentage, 0) / trendData.length).toFixed(2) : 0}%
          </div>
          <div className="text-gray-500">Average</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {trendData.length > 0 ? Math.max(...trendData.map(item => item.percentage)).toFixed(2) : 0}%
          </div>
          <div className="text-gray-500">Peak</div>
        </div>
      </div>
    </div>
  );
};

export default CQITrendChart;
