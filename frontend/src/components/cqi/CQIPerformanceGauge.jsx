import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

const CQIPerformanceGauge = ({ indicator, target = 90 }) => {
  const percentage = indicator.percentage || 0;
  const numerator = indicator.numerator || 0;
  const denominator = indicator.denominator || 0;

  // Calculate performance status
  const getPerformanceStatus = () => {
    if (percentage >= target) return 'Above Target';
    if (percentage >= target * 0.9) return 'Near Target';
    if (percentage >= target * 0.8) return 'Below Target';
    return 'Well Below Target';
  };

  const getPerformanceColor = () => {
    const status = getPerformanceStatus();
    switch (status) {
      case 'Above Target': return '#10b981'; // green
      case 'Near Target': return '#f59e0b'; // yellow
      case 'Below Target': return '#f97316'; // orange
      case 'Well Below Target': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getPerformanceIcon = () => {
    const status = getPerformanceStatus();
    switch (status) {
      case 'Above Target': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Near Target': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'Below Target': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'Well Below Target': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  // Prepare data for the gauge (semi-circle)
  const gaugeData = [
    {
      name: 'Achieved',
      value: Math.min(percentage, 100),
      color: getPerformanceColor()
    },
    {
      name: 'Remaining',
      value: Math.max(100 - percentage, 0),
      color: '#e5e7eb'
    }
  ];

  // Target marker data
  const targetMarkerData = [
    {
      name: 'Target',
      value: target,
      color: '#374151'
    },
    {
      name: 'Rest',
      value: 100 - target,
      color: 'transparent'
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-4">
      {/* Gauge Chart */}
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Main gauge */}
            <Pie
              data={gaugeData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            
            {/* Target marker */}
            <Pie
              data={targetMarkerData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="#374151"
              strokeWidth={2}
              fill="transparent"
            >
              {targetMarkerData.map((entry, index) => (
                <Cell key={`target-${index}`} fill={entry.color} stroke={index === 0 ? '#374151' : 'transparent'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <div className="text-3xl font-bold" style={{ color: getPerformanceColor() }}>
            {percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">
            {formatNumber(numerator)} / {formatNumber(denominator)}
          </div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="flex items-center justify-center gap-2">
        {getPerformanceIcon()}
        <Badge 
          className="text-white"
          style={{ backgroundColor: getPerformanceColor() }}
        >
          {getPerformanceStatus()}
        </Badge>
      </div>

      {/* Target Information */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-gray-900">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-gray-500">Current</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {target}%
          </div>
          <div className="text-gray-500">Target</div>
        </div>
        <div>
          <div className={`font-medium ${percentage >= target ? 'text-green-600' : 'text-red-600'}`}>
            {percentage >= target ? '+' : ''}{(percentage - target).toFixed(1)}%
          </div>
          <div className="text-gray-500">Gap</div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-50 p-3 rounded text-sm">
        <div className="font-medium mb-1">Performance Insight:</div>
        <div className="text-gray-600">
          {percentage >= target && (
            <>
              <span className="text-green-600 font-medium">Excellent performance!</span> This indicator is meeting or exceeding the target of {target}%.
            </>
          )}
          {percentage < target && percentage >= target * 0.9 && (
            <>
              <span className="text-yellow-600 font-medium">Close to target.</span> Only {(target - percentage).toFixed(1)} percentage points away from the {target}% target.
            </>
          )}
          {percentage < target * 0.9 && percentage >= target * 0.8 && (
            <>
              <span className="text-orange-600 font-medium">Below target.</span> Needs improvement to reach the {target}% target. Gap: {(target - percentage).toFixed(1)} percentage points.
            </>
          )}
          {percentage < target * 0.8 && (
            <>
              <span className="text-red-600 font-medium">Significant improvement needed.</span> Currently {(target - percentage).toFixed(1)} percentage points below the {target}% target.
            </>
          )}
        </div>
      </div>

      {/* Demographic Performance */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-50 p-2 rounded">
          <div className="font-medium text-blue-800">Children (0-14)</div>
          <div className="text-blue-600">
            {((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0))} / {indicator.children_total || 0}
          </div>
          <div className="text-blue-700 font-medium">
            {indicator.children_total > 0 ? 
              (((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0)) * 100 / indicator.children_total).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <div className="font-medium text-purple-800">Adults (15+)</div>
          <div className="text-purple-600">
            {((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0))} / {indicator.adults_total || 0}
          </div>
          <div className="text-purple-700 font-medium">
            {indicator.adults_total > 0 ? 
              (((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0)) * 100 / indicator.adults_total).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default CQIPerformanceGauge;
