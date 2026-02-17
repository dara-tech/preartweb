import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, Baby } from 'lucide-react';
import { FaMale, FaFemale } from 'react-icons/fa';

const CQIDemographicsChartSimple = ({ indicator }) => {
  const [chartType, setChartType] = useState('bar');

  // Prepare data directly from indicator prop
  const prepareBarChartData = () => {
    const male0_14 = indicator.male_0_14 || 0;
    const female0_14 = indicator.female_0_14 || 0;
    const male_over_14 = indicator.male_over_14 || 0;
    const female_over_14 = indicator.female_over_14 || 0;

    return [
      {
        category: 'Children 0-14',
        Male: male0_14,
        Female: female0_14,
        total: male0_14 + female0_14
      },
      {
        category: 'Adults 15+',
        Male: male_over_14,
        Female: female_over_14,
        total: male_over_14 + female_over_14
      }
    ];
  };

  const preparePieChartData = () => {
    const male0_14 = indicator.male_0_14 || 0;
    const female0_14 = indicator.female_0_14 || 0;
    const male_over_14 = indicator.male_over_14 || 0;
    const female_over_14 = indicator.female_over_14 || 0;

    const data = [
      { name: 'Male Children (0-14)', value: male0_14, color: '#3b82f6' },
      { name: 'Female Children (0-14)', value: female0_14, color: '#ec4899' },
      { name: 'Male Adults (15+)', value: male_over_14, color: '#10b981' },
      { name: 'Female Adults (15+)', value: female_over_14, color: '#f59e0b' }
    ];

    // Filter out zero values for cleaner pie chart
    return data.filter(item => item.value > 0);
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total;
      return (
        <div className="bg-white p-3 border rounded-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="mb-1">
              <p style={{ color: entry.color }} className="font-semibold">
                {entry.dataKey}: {entry.value.toLocaleString()}
              </p>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm font-semibold text-gray-700">Total: {total.toLocaleString()}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = indicator.male_0_14 + indicator.female_0_14 + indicator.male_over_14 + indicator.female_over_14;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white p-3 border rounded-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-lg font-bold">
            {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const barData = prepareBarChartData();
  const pieData = preparePieChartData();
  
  const totalPatients = (indicator.male_0_14 || 0) + (indicator.female_0_14 || 0) + 
                       (indicator.male_over_14 || 0) + (indicator.female_over_14 || 0);

  // If no demographics data, show simple message
  if (totalPatients === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Users className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">No demographic data available</p>
        <p className="text-xs text-gray-400 mt-1">Demographics will appear after data population</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats - Gender & Age Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">Children (0-14)</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-blue-700">
                <FaMale className="h-3 w-3" /> Male
              </span>
              <span className="font-bold text-blue-900">{(indicator.male_0_14 || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-pink-700">
                <FaFemale className="h-3 w-3" /> Female
              </span>
              <span className="font-bold text-pink-900">{(indicator.female_0_14 || 0).toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t border-border">
              <div className="text-lg font-bold text-blue-900">
                {((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0)).toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">Total Children</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900 text-sm">Adults (15+)</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-blue-700">
                <FaMale className="h-3 w-3" /> Male
              </span>
              <span className="font-bold text-blue-900">{(indicator.male_over_14 || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-pink-700">
                <FaFemale className="h-3 w-3" /> Female
              </span>
              <span className="font-bold text-pink-900">{(indicator.female_over_14 || 0).toLocaleString()}</span>
            </div>
            <div className="pt-1 border-t border-border">
              <div className="text-lg font-bold text-purple-900">
                {((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0)).toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">Total Adults</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Percentage Display */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Performance</p>
            <p className="text-3xl font-bold text-primary">{(indicator.percentage || 0).toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{(indicator.numerator || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of {(indicator.denominator || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <Tabs value={chartType} onValueChange={setChartType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="pie">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar dataKey="Male" fill="#3b82f6" name="Male" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Female" fill="#ec4899" name="Female" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="pie" className="mt-4">
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data to display
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Total Summary */}
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">
              {((indicator.male_0_14 || 0) + (indicator.male_over_14 || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <FaMale className="h-3 w-3" /> All Males
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-600">
              {((indicator.female_0_14 || 0) + (indicator.female_over_14 || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <FaFemale className="h-3 w-3" /> All Females
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-primary">
              {totalPatients.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> Grand Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CQIDemographicsChartSimple;

