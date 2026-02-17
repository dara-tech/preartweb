import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, User } from 'lucide-react';
import api from '../../services/api';

const CQIDemographicsChart = ({ indicator, dateRange, siteId }) => {
  const [demographicsData, setDemographicsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    loadDemographicsData();
  }, [indicator.indicator_code, dateRange, siteId]);

  const loadDemographicsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        siteId: siteId === 'all' ? null : siteId
      };

      const response = await api.get(`/apiv1/cqi-indicators/${indicator.indicator_code}/demographics`, { params });

      if (response.data.success) {
        setDemographicsData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load demographics data');
      }
    } catch (err) {
      console.error('Error loading demographics data:', err);
      setError('Failed to connect to CQI service');
    } finally {
      setLoading(false);
    }
  };

  const prepareBarChartData = () => {
    if (!demographicsData) return [];

    return [
      {
        category: 'Children (0-14)',
        Male: demographicsData.demographics.children.male.percentage,
        Female: demographicsData.demographics.children.female.percentage,
        MaleCount: demographicsData.demographics.children.male.numerator,
        FemaleCount: demographicsData.demographics.children.female.numerator,
        MaleTotal: demographicsData.demographics.children.male.denominator,
        FemaleTotal: demographicsData.demographics.children.female.denominator
      },
      {
        category: 'Adults (15+)',
        Male: demographicsData.demographics.adults.male.percentage,
        Female: demographicsData.demographics.adults.female.percentage,
        MaleCount: demographicsData.demographics.adults.male.numerator,
        FemaleCount: demographicsData.demographics.adults.female.numerator,
        MaleTotal: demographicsData.demographics.adults.male.denominator,
        FemaleTotal: demographicsData.demographics.adults.female.denominator
      }
    ];
  };

  const preparePieChartData = () => {
    if (!demographicsData) return [];

    return [
      {
        name: 'Male Children (0-14)',
        value: demographicsData.demographics.children.male.numerator,
        percentage: demographicsData.demographics.children.male.percentage,
        total: demographicsData.demographics.children.male.denominator,
        color: '#3b82f6'
      },
      {
        name: 'Female Children (0-14)',
        value: demographicsData.demographics.children.female.numerator,
        percentage: demographicsData.demographics.children.female.percentage,
        total: demographicsData.demographics.children.female.denominator,
        color: '#ec4899'
      },
      {
        name: 'Male Adults (15+)',
        value: demographicsData.demographics.adults.male.numerator,
        percentage: demographicsData.demographics.adults.male.percentage,
        total: demographicsData.demographics.adults.male.denominator,
        color: '#10b981'
      },
      {
        name: 'Female Adults (15+)',
        value: demographicsData.demographics.adults.female.numerator,
        percentage: demographicsData.demographics.adults.female.percentage,
        total: demographicsData.demographics.adults.female.denominator,
        color: '#f59e0b'
      }
    ];
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="mb-1">
              <p style={{ color: entry.color }}>
                {entry.dataKey}: {entry.value.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                ({entry.payload[`${entry.dataKey}Count`]} / {entry.payload[`${entry.dataKey}Total`]})
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            {data.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {data.value} / {data.total}
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
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <Button onClick={loadDemographicsData} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!demographicsData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No demographics data available
      </div>
    );
  }

  const barData = prepareBarChartData();
  const pieData = preparePieChartData();

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Children (0-14)</span>
          </div>
          <div className="text-blue-600">
            {demographicsData.demographics.children.total.numerator} / {demographicsData.demographics.children.total.denominator}
          </div>
          <div className="text-lg font-bold text-blue-700">
            {demographicsData.demographics.children.total.percentage.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">Adults (15+)</span>
          </div>
          <div className="text-purple-600">
            {demographicsData.demographics.adults.total.numerator} / {demographicsData.demographics.adults.total.denominator}
          </div>
          <div className="text-lg font-bold text-purple-700">
            {demographicsData.demographics.adults.total.percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <Tabs value={chartType} onValueChange={setChartType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar dataKey="Male" fill="#3b82f6" name="Male" />
                <Bar dataKey="Female" fill="#ec4899" name="Female" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="pie" className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Male Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Children (0-14):</span>
              <span className="font-medium">
                {demographicsData.demographics.children.male.numerator} / {demographicsData.demographics.children.male.denominator}
                ({demographicsData.demographics.children.male.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adults (15+):</span>
              <span className="font-medium">
                {demographicsData.demographics.adults.male.numerator} / {demographicsData.demographics.adults.male.denominator}
                ({demographicsData.demographics.adults.male.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Female Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Children (0-14):</span>
              <span className="font-medium">
                {demographicsData.demographics.children.female.numerator} / {demographicsData.demographics.children.female.denominator}
                ({demographicsData.demographics.children.female.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Adults (15+):</span>
              <span className="font-medium">
                {demographicsData.demographics.adults.female.numerator} / {demographicsData.demographics.adults.female.denominator}
                ({demographicsData.demographics.adults.female.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CQIDemographicsChart;
