import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, TrendingUp, TrendingDown, Info, Sparkles } from 'lucide-react';
import { FaMale, FaFemale, FaChild, FaUser } from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import CQIDetailsModal from './CQIDetailsModal';

// Color coding by category
const getCategoryColor = (indicatorCode) => {
  if (indicatorCode.startsWith('6')) return 'border-l-sky-500 bg-sky-50/30'; // ART Initiation
  if (indicatorCode.startsWith('7')) return 'border-l-emerald-500 bg-emerald-50/30'; // Baseline CD4
  if (indicatorCode.startsWith('8')) return 'border-l-teal-500 bg-teal-50/30'; // Prophylaxis
  if (indicatorCode.startsWith('10')) return 'border-l-orange-500 bg-orange-50/30'; // TLD
  if (indicatorCode.startsWith('11')) return 'border-l-purple-500 bg-purple-50/30'; // TPT
  return 'border-l-blue-500 bg-blue-50/30';
};

// Get performance status
const getPerformanceStatus = (percentage, target = 90) => {
  if (percentage >= target) return { label: 'Above Target', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '🟢' };
  if (percentage >= target * 0.9) return { label: 'Near Target', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡' };
  if (percentage >= target * 0.8) return { label: 'Below Target', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟠' };
  return { label: 'Well Below Target', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' };
};

// Generate sparkline data (trend simulation)
const generateSparklineData = (currentValue) => {
  const data = [];
  let value = currentValue - 5 + Math.random() * 3;
  for (let i = 0; i < 12; i++) {
    value += (Math.random() - 0.4) * 2;
    value = Math.max(0, Math.min(100, value));
    data.push({ value });
  }
  data[data.length - 1].value = currentValue;
  return data;
};

const CQIInsightCard = ({ indicator, dateRange, siteId, target = 90 }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const percentage = indicator.percentage || 0;
  const status = getPerformanceStatus(percentage, target);
  const trend = (percentage - target).toFixed(1);
  const sparklineData = generateSparklineData(percentage);
  const categoryColor = getCategoryColor(indicator.indicator_code);
  
  return (
    <>
      <Card className={` transition-all duration-300 rounded-xl overflow-hidden border-l-4 ${categoryColor} group`}>
        <CardContent className="p-6">
          {/* Top: Large Percentage + Status Badge */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-5xl font-bold text-foreground mb-1">
                {percentage.toFixed(1)}
                <span className="text-2xl text-muted-foreground">%</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                      <span>{indicator.numerator?.toLocaleString() || 0} / {indicator.denominator?.toLocaleString() || 0}</span>
                      <Info className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-semibold">Numerator / Denominator</p>
                    <p className="text-xs">{indicator.numerator?.toLocaleString()} patients met criteria</p>
                    <p className="text-xs">out of {indicator.denominator?.toLocaleString()} eligible</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-right">
              <Badge className={`${status.color} border font-semibold px-3 py-1 mb-2`}>
                {status.icon} {status.label}
              </Badge>
              <div className={`text-sm font-semibold flex items-center gap-1 ${
                parseFloat(trend) >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {parseFloat(trend) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(parseFloat(trend))}% {parseFloat(trend) >= 0 ? 'above' : 'below'} target
              </div>
            </div>
          </div>

          {/* Indicator Name */}
          <h3 className="text-sm font-semibold text-foreground mb-3 leading-tight">
            {indicator.indicator_name}
          </h3>

          {/* Sparkline */}
          <div className="h-12 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Demographics - Compact */}
          <div className="flex items-center justify-between text-xs mb-4 bg-muted/30 p-2 rounded-lg">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <FaChild className="h-3 w-3 text-blue-600" />
                    <span className="font-semibold">{((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0)).toLocaleString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">Children (0-14)</p>
                  <p className="text-xs"><FaMale className="inline h-3 w-3" /> Male: {indicator.male_0_14 || 0}</p>
                  <p className="text-xs"><FaFemale className="inline h-3 w-3" /> Female: {indicator.female_0_14 || 0}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="text-muted-foreground">•</div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <FaUser className="h-3 w-3 text-purple-600" />
                    <span className="font-semibold">{((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0)).toLocaleString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">Adults (15+)</p>
                  <p className="text-xs"><FaMale className="inline h-3 w-3" /> Male: {indicator.male_over_14 || 0}</p>
                  <p className="text-xs"><FaFemale className="inline h-3 w-3" /> Female: {indicator.female_over_14 || 0}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="text-muted-foreground">•</div>

            <div className="flex items-center gap-1">
              <FaMale className="h-3 w-3 text-blue-600" />
              <span className="font-medium">{((indicator.male_0_14 || 0) + (indicator.male_over_14 || 0)).toLocaleString()}</span>
            </div>

            <div className="text-muted-foreground">•</div>

            <div className="flex items-center gap-1">
              <FaFemale className="h-3 w-3 text-pink-600" />
              <span className="font-medium">{((indicator.female_0_14 || 0) + (indicator.female_over_14 || 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Button - Minimal */}
          <Button 
            onClick={() => setShowDetailsModal(true)}
            variant="ghost" 
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Eye className="h-3.5 w-3.5 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <CQIDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        indicator={indicator}
        dateRange={dateRange}
        siteId={siteId}
      />
    </>
  );
};

export default CQIInsightCard;

