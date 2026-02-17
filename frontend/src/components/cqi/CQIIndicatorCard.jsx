import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Eye, 
  Users,
  BarChart3
} from 'lucide-react';
import CQIDetailsModal from './CQIDetailsModal';

const CQIIndicatorCard = ({ indicator, dateRange, siteId }) => {
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPercentageBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const viewDetails = () => {
    setShowDetailsModal(true);
  };

  const viewTrends = () => {
    // For now, show details modal with info
    // Future: could add a separate trends modal
    setShowDetailsModal(true);
  };

  return (
    <Card className="">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium leading-tight">
            {indicator.indicator_name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {indicator.indicator_code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main Percentage */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${getPercentageColor(indicator.percentage || 0)}`}>
              {(indicator.percentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatNumber(indicator.numerator || 0)} / {formatNumber(indicator.denominator || 0)}
            </div>
          </div>
          <Badge className={getPercentageBadgeColor(indicator.percentage || 0)}>
            {indicator.percentage >= 90 ? 'Excellent' :
             indicator.percentage >= 80 ? 'Good' :
             indicator.percentage >= 70 ? 'Fair' : 'Needs Improvement'}
          </Badge>
        </div>

        {/* Demographics Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-medium text-blue-800">Children (0-14)</div>
            <div className="text-blue-600">
              {formatNumber((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0))} / {formatNumber(indicator.children_total || 0)}
            </div>
            <div className="text-blue-500">
              {indicator.children_total > 0 ? 
                (((indicator.male_0_14 || 0) + (indicator.female_0_14 || 0)) * 100 / indicator.children_total).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="font-medium text-purple-800">Adults (15+)</div>
            <div className="text-purple-600">
              {formatNumber((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0))} / {formatNumber(indicator.adults_total || 0)}
            </div>
            <div className="text-purple-500">
              {indicator.adults_total > 0 ? 
                (((indicator.male_over_14 || 0) + (indicator.female_over_14 || 0)) * 100 / indicator.adults_total).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Male:</span>
            <span className="font-medium">
              {formatNumber((indicator.male_0_14 || 0) + (indicator.male_over_14 || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Female:</span>
            <span className="font-medium">
              {formatNumber((indicator.female_0_14 || 0) + (indicator.female_over_14 || 0))}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={viewDetails}
            className="flex-1 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={viewTrends}
            className="flex-1 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Trends
          </Button>
        </div>
      </CardContent>

      {/* Details Modal */}
      <CQIDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        indicator={indicator}
        dateRange={dateRange}
        siteId={siteId}
      />
    </Card>
  );
};

export default CQIIndicatorCard;
