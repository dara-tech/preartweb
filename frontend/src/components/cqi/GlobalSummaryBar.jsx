import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FaSkull, FaUserSlash, FaUserCheck, FaVirus } from 'react-icons/fa';

const GlobalSummaryBar = ({ dashboardData }) => {
  if (!dashboardData?.key_metrics) return null;

  const metrics = [
    {
      title: 'Mortality',
      value: dashboardData.key_metrics.mortality_rate?.current,
      icon: FaSkull,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: dashboardData.key_metrics.mortality_rate?.trend,
      isInverse: true
    },
    {
      title: 'LTFU',
      value: dashboardData.key_metrics.ltf_rate?.current,
      icon: FaUserSlash,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: dashboardData.key_metrics.ltf_rate?.trend,
      isInverse: true
    },
    {
      title: 'Retention',
      value: dashboardData.key_metrics.retention_rate?.current,
      icon: FaUserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: dashboardData.key_metrics.retention_rate?.trend,
      isInverse: false
    },
    {
      title: 'VL Suppression',
      value: dashboardData.key_metrics.vl_suppression_rate?.current,
      icon: FaVirus,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      trend: dashboardData.key_metrics.vl_suppression_rate?.trend,
      isInverse: false
    }
  ];

  const getTrendIcon = (trend, isInverse) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    const isPositive = isInverse ? trend.direction === 'down' : trend.direction === 'up';
    return isPositive ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (trend, isInverse) => {
    if (!trend) return 'text-gray-500';
    const isPositive = isInverse ? trend.direction === 'down' : trend.direction === 'up';
    return isPositive ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-card via-card to-muted/20 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="font-semibold">
            🌐 System Summary
          </Badge>
          <span className="text-xs text-muted-foreground">Key Performance Indicators</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl ${metric.bgColor} border border-border/50  transition-all`}
              >
                <div className={`p-3 rounded-lg bg-white ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value?.toFixed(1) || '0.0'}
                      <span className="text-lg">%</span>
                    </span>
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(metric.trend, metric.isInverse)}`}>
                      {getTrendIcon(metric.trend, metric.isInverse)}
                      {Math.abs(metric.trend.percent_change).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default GlobalSummaryBar;

