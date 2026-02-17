import React from 'react';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList, LineChart, Line, ComposedChart } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

// Configuration for each indicator: chart type, data preparation, and labels
const INDICATOR_CONFIG = {
  // BAR CHART INDICATORS (demographic breakdown)
  'died': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Total Deaths', denominator: 'Total Active Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Deaths',
      'Female_0_14': 'Female_0_14_Deaths',
      'Male_over_14': 'Male_over_14_Deaths',
      'Female_over_14': 'Female_over_14_Deaths'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_ART',
    useDemographicDenominators: true // Indicator 1 has demographic-specific denominators
  },
  'lost to follow-up': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Total Lost', denominator: 'Total Active Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Lost',
      'Female_0_14': 'Female_0_14_Lost',
      'Male_over_14': 'Male_over_14_Lost',
      'Female_over_14': 'Female_over_14_Lost'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_ART',
    useDemographicDenominators: true // Indicator 2 has demographic-specific denominators
  },
  'reengaged': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Reengaged', denominator: 'Total Missed' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Reengaged',
      'Female_0_14': 'Female_0_14_Reengaged',
      'Male_over_14': 'Male_over_14_Reengaged',
      'Female_over_14': 'Female_over_14_Reengaged'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    overallDenominatorField: 'Total_Lost',
    useDemographicDenominators: true // Reengagement has demographic-specific denominators
  },
  'late visits': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Late Visits', denominator: 'Total Visits' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Visits',
    useDemographicDenominators: true // Visit indicators have demographic-specific denominators
  },
  'visits on schedule': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'On Schedule', denominator: 'Total Visits' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Visits',
    useDemographicDenominators: true // Visit indicators have demographic-specific denominators
  },
  'early visits': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Early Visits', denominator: 'Total Visits' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Visits',
    useDemographicDenominators: true // Visit indicators have demographic-specific denominators
  },
  'initiating art': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Newly Initiated', denominator: 'Total Newly Initiated' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Newly_Initiated',
    useDemographicDenominators: true // ART initiation indicators have demographic-specific denominators
  },
  'mmd': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'MMD Patients', denominator: 'Eligible for MMD' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Patients',
    useDemographicDenominators: true // MMD indicators have demographic-specific denominators
  },
  'tld': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'TLD Patients', denominator: 'Eligible Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Newly_Initiated', // Default for 10a, will be overridden for 10b
    useDemographicDenominators: true // TLD indicators have demographic-specific denominators
  },
  'tpt': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'TPT Patients', denominator: 'Active ART Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_ART_Patients',
    useDemographicDenominators: true // TPT indicators have demographic-specific denominators
  },
  'switching to second line': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Switched', denominator: 'Eligible Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Switched',
      'Female_0_14': 'Female_0_14_Switched',
      'Male_over_14': 'Male_over_14_Switched',
      'Female_over_14': 'Female_over_14_Switched'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Eligible_Patients',
    useDemographicDenominators: true
  },
  'switching to third line': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Switched', denominator: 'Eligible Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Switched',
      'Female_0_14': 'Female_0_14_Switched',
      'Male_over_14': 'Male_over_14_Switched',
      'Female_over_14': 'Female_over_14_Switched'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Eligible_Patients',
    useDemographicDenominators: true
  },
  'vl': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'VL Patients', denominator: 'Total ART Patients' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_ART_Patients', // Default for 12a, 12b, 12d, will be overridden for 12c and 12e
    useDemographicDenominators: true,
    exclude: ['within 10 days', 'adherence', 'counseling', 'enhanced adherence', 'follow-up vl after', 'suppression after', 'switching to second line', 'switching to third line', 'first line', 'second line', 'third line'] // Exclude EAC indicators (13a, 13b, 13c), ART line switching (14a, 14b), and 12e
  },
  'retention rate': {
    chartType: 'bar',
    dataType: 'demographic',
    labels: { numerator: 'Current Patients', denominator: null }
  },

  // BAR CHART INDICATORS (numerator/denominator with demographic breakdown)
  'baseline cd4': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'With Baseline CD4', denominator: 'Total Newly Initiated' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_With_CD4',
      'Female_0_14': 'Female_0_14_With_CD4',
      'Male_over_14': 'Male_over_14_With_CD4',
      'Female_over_14': 'Female_over_14_With_CD4'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_Newly_Initiated',
    useDemographicDenominators: true // Baseline CD4 has demographic-specific denominators
  },

  // PIE CHART INDICATORS (comparison: achieved vs not achieved)
  'cotrimoxazole': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Receiving CTX', denominator: 'Total CD4 < 350' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Receiving',
      'Female_0_14': 'Female_0_14_Receiving',
      'Male_over_14': 'Male_over_14_Receiving',
      'Female_over_14': 'Female_over_14_Receiving'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_CD4_Low_350',
    useDemographicDenominators: true // Cotrimoxazole has demographic-specific denominators
  },
  'fluconazole': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Receiving FLU', denominator: 'Total CD4 < 100' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Receiving',
      'Female_0_14': 'Female_0_14_Receiving',
      'Male_over_14': 'Male_over_14_Receiving',
      'Female_over_14': 'Female_over_14_Receiving'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_CD4_Low_100',
    useDemographicDenominators: true // Fluconazole has demographic-specific denominators
  },
  'within 10 days': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Within 10 Days', denominator: 'Total VL Tests' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14',
      'Female_0_14': 'Female_0_14',
      'Male_over_14': 'Male_over_14',
      'Female_over_14': 'Female_over_14'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_With_Dates',
    useDemographicDenominators: true
  },
  'enhanced adherence': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Received Counseling', denominator: 'Total High VL' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Received',
      'Female_0_14': 'Female_0_14_Received',
      'Male_over_14': 'Male_over_14_Received',
      'Female_over_14': 'Female_over_14_Received'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_High_VL',
    useDemographicDenominators: true
  },
  'follow-up vl after': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Follow-up Received', denominator: 'Total High VL Counseled' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Followup',
      'Female_0_14': 'Female_0_14_Followup',
      'Male_over_14': 'Male_over_14_Followup',
      'Female_over_14': 'Female_over_14_Followup'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'Total_High_VL_Counseled',
    useDemographicDenominators: true
  },
  'suppression after': {
    chartType: 'bar',
    dataType: 'numerator_denominator',
    labels: { numerator: 'Achieved Suppression', denominator: 'With Follow-up VL' },
    numeratorFields: {
      'Male_0_14': 'Male_0_14_Suppressed',
      'Female_0_14': 'Female_0_14_Suppressed',
      'Male_over_14': 'Male_over_14_Suppressed',
      'Female_over_14': 'Female_over_14_Suppressed'
    },
    denominatorFields: {
      'Male_0_14': 'Male_0_14_Total',
      'Female_0_14': 'Female_0_14_Total',
      'Male_over_14': 'Male_over_14_Total',
      'Female_over_14': 'Female_over_14_Total'
    },
    overallDenominatorField: 'With_Followup_VL',
    useDemographicDenominators: true
  }
};

// Helper to find matching config for an indicator
const getIndicatorConfig = (indicatorName) => {
  if (!indicatorName) return null;

  const nameLower = indicatorName.toLowerCase();

  // Check for exact matches first (most specific)
  for (const [key, config] of Object.entries(INDICATOR_CONFIG)) {
    if (nameLower.includes(key)) {
      // Check exclusions (e.g., "vl" but not "within 10 days")
      if (config.exclude) {
        const hasExclusion = config.exclude.some(ex => nameLower.includes(ex));
        if (hasExclusion) continue;
      }
      return { ...config, matchedKey: key };
    }
  }

  return null;
};

const IndicatorChart = ({ indicator, viewType = 'bar', compact = false }) => {
  if (!indicator) return null;

  const config = getIndicatorConfig(indicator.Indicator);

  // State for chart view toggle: 'all', 'children', 'adults'
  const [ageViewType, setAgeViewType] = React.useState('all');

  // Determine TLD indicator type and set denominator field/label
  const indicatorNameLower = (indicator.Indicator || '').toLowerCase();
  let overallDenominatorField = config?.overallDenominatorField;
  let denominatorLabel = config?.labels?.denominator || 'Total';
  if (config?.useDemographicDenominators && indicatorNameLower.includes('tld')) {
    if (indicatorNameLower.includes('newly initiating') || indicator.Total_Newly_Initiated !== undefined) {
      overallDenominatorField = 'Total_Newly_Initiated';
      denominatorLabel = 'Newly Initiated Patients';
    } else if (indicatorNameLower.includes('cumulative') || indicator.Total_ART_Patients !== undefined) {
      overallDenominatorField = 'Total_ART_Patients';
      denominatorLabel = 'Active ART Patients';
    }
  }
  // Determine VL indicator type and set denominator field/label
  if (config?.useDemographicDenominators && indicatorNameLower.includes('vl')) {
    if (indicatorNameLower.includes('suppression') && indicatorNameLower.includes('12 months') && indicator.VL_Tested_12M !== undefined) {
      // 12c: denominator is VL tested patients
      overallDenominatorField = 'VL_Tested_12M';
      denominatorLabel = 'VL Tested Patients';
    } else if (indicatorNameLower.includes('within 10 days') || indicator.Total_With_Dates !== undefined) {
      // 12e: denominator is total VL tests
      overallDenominatorField = 'Total_With_Dates';
      denominatorLabel = 'Total VL Tests';
    } else if (indicator.Total_ART_Patients !== undefined) {
      // 12a, 12b, 12d: denominator is total ART patients
      overallDenominatorField = 'Total_ART_Patients';
      denominatorLabel = 'Total ART Patients';
    }
  }
  // Determine EAC indicator type and set denominator label
  if (config?.useDemographicDenominators && (indicatorNameLower.includes('adherence') || indicatorNameLower.includes('counseling') || indicatorNameLower.includes('suppression after') || indicatorNameLower.includes('follow-up vl after'))) {
    // Use the denominator label from config for EAC indicators
    if (config?.labels?.denominator) {
      denominatorLabel = config.labels.denominator;
    }
  }
  // Determine ART line switching indicator type and set denominator label
  if (config?.useDemographicDenominators && (indicatorNameLower.includes('switching to second line') || indicatorNameLower.includes('switching to third line') || indicatorNameLower.includes('first line') || indicatorNameLower.includes('second line') || indicatorNameLower.includes('third line'))) {
    // Use the denominator label from config for ART line switching indicators
    if (config?.labels?.denominator) {
      denominatorLabel = config.labels.denominator;
    }
  }

  // Prepare data for bar chart (demographic breakdown)
  const prepareBarChartData = (currentAgeViewType = 'all') => {
    const isNumeratorDenominator = config?.dataType === 'numerator_denominator';
    
    const overallDenominator = isNumeratorDenominator ? (indicator[overallDenominatorField] || 0) : null;

    let demographicGroups = [];

    if (currentAgeViewType === 'children') {
      // Children (0-14) only
      demographicGroups = [
        {
          key: 'Children_All',
          name: 'All Children',
          color: '#8b5cf6',
          numeratorKeys: ['Male_0_14', 'Female_0_14'],
          denominatorKeys: ['Male_0_14', 'Female_0_14'],
          ageGroup: 'children'
        },
        {
          key: 'Male_0_14',
          name: 'Male 0-14',
          color: '#3b82f6',
          numeratorKeys: ['Male_0_14'],
          denominatorKeys: ['Male_0_14'],
          ageGroup: 'children'
        },
        {
          key: 'Female_0_14',
          name: 'Female 0-14',
          color: '#ec4899',
          numeratorKeys: ['Female_0_14'],
          denominatorKeys: ['Female_0_14'],
          ageGroup: 'children'
        }
      ];
    } else if (currentAgeViewType === 'adults') {
      // Adults (15+) only
      demographicGroups = [
        {
          key: 'Adults_All',
          name: 'All Adults',
          color: '#8b5cf6',
          numeratorKeys: ['Male_over_14', 'Female_over_14'],
          denominatorKeys: ['Male_over_14', 'Female_over_14'],
          ageGroup: 'adults'
        },
        {
          key: 'Male_over_14',
          name: 'Male 15+',
          color: '#10b981',
          numeratorKeys: ['Male_over_14'],
          denominatorKeys: ['Male_over_14'],
          ageGroup: 'adults'
        },
        {
          key: 'Female_over_14',
          name: 'Female 15+',
          color: '#f59e0b',
          numeratorKeys: ['Female_over_14'],
          denominatorKeys: ['Female_over_14'],
          ageGroup: 'adults'
        }
      ];
    } else {
      // Show all: Always show "All", "All Children", and "All Adults" for all bar charts
      demographicGroups = [
        {
          key: 'All',
          name: 'All',
          color: '#8b5cf6',
          numeratorKeys: ['Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14'],
          denominatorKeys: ['Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14'],
          ageGroup: 'all'
        },
        {
          key: 'Children_All',
          name: 'All Children',
          color: '#3b82f6',
          numeratorKeys: ['Male_0_14', 'Female_0_14'],
          denominatorKeys: ['Male_0_14', 'Female_0_14'],
          ageGroup: 'children'
        },
        {
          key: 'Adults_All',
          name: 'All Adults',
          color: '#10b981',
          numeratorKeys: ['Male_over_14', 'Female_over_14'],
          denominatorKeys: ['Male_over_14', 'Female_over_14'],
          ageGroup: 'adults'
        }
      ];
    }

    const data = demographicGroups.map(group => {
      let value = 0;
      let total = null;
      let percentage = 0;

      if (isNumeratorDenominator) {
        // Numerator/Denominator: aggregate numerator across keys
        group.numeratorKeys?.forEach(key => {
          const numeratorField = config.numeratorFields?.[key] || key;
          const fieldValue = indicator[numeratorField];
          // Handle null, undefined, empty string, and 0 values correctly
          if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            value += Number(fieldValue) || 0;
          }
        });
        
        // Special handling for visit indicators (5a, 5b, 5c, 5d), reengagement indicators, baseline CD4, ART initiation (6a, 6b, 6c), prophylaxis (8a, 8b), MMD (9a-9e), TLD (10a, 10b), EAC (13a, 13b, 13c), and indicators 1 & 2
        const isVisitIndicator = overallDenominatorField === 'Total_Visits';
        const isReengagementIndicator = overallDenominatorField === 'Total_Lost';
        const isLateReengagementIndicator = isReengagementIndicator && (indicatorNameLower.includes('after 28') || indicatorNameLower.includes('over 28') || indicatorNameLower.includes('28+'));
        const isBaselineCD4Indicator = overallDenominatorField === 'Total_Newly_Initiated' && config.useDemographicDenominators && !indicatorNameLower.includes('initiating art') && !indicatorNameLower.includes('tld');
        const isARTInitiationIndicator = overallDenominatorField === 'Total_Newly_Initiated' && config.useDemographicDenominators && indicatorNameLower.includes('initiating art');
        const isProphylaxisIndicator = (overallDenominatorField === 'Total_CD4_Low_350' || overallDenominatorField === 'Total_CD4_Low_100') && config.useDemographicDenominators;
        const isMMDIndicator = overallDenominatorField === 'Total_Patients' && config.useDemographicDenominators && indicatorNameLower.includes('mmd');
        const isTLDIndicator = config.useDemographicDenominators && indicatorNameLower.includes('tld');
        const isTLDNewInitiation = isTLDIndicator && (overallDenominatorField === 'Total_Newly_Initiated' || indicatorNameLower.includes('newly initiating'));
        const isTLDCumulative = isTLDIndicator && (overallDenominatorField === 'Total_ART_Patients' || indicatorNameLower.includes('cumulative'));
        const isTPTIndicator = config.useDemographicDenominators && indicatorNameLower.includes('tpt');
        const isDiedIndicator = overallDenominatorField === 'Total_ART' && config.useDemographicDenominators;
        const isEACIndicator = config.useDemographicDenominators && (indicatorNameLower.includes('adherence') || indicatorNameLower.includes('counseling') || indicatorNameLower.includes('suppression after') || indicatorNameLower.includes('follow-up vl after'));
        
        // Fallback: If numerator is 0 but we have an overall numerator field, use it for "All" group
        // This handles cases where demographic breakdowns might not be available
        if (value === 0 && group.key === 'All' && isEACIndicator) {
          // Try to get overall numerator from common EAC fields
          const overallNumerator = indicator.Received_Counseling || 
                                   indicator.Followup_Received || 
                                   indicator.Achieved_Suppression;
          if (overallNumerator !== null && overallNumerator !== undefined && overallNumerator !== '') {
            value = Number(overallNumerator) || 0;
          }
        }
        const isVLIndicator = config.useDemographicDenominators && (indicatorNameLower.includes('vl') || indicatorNameLower.includes('within 10 days'));
        const isARTLineSwitchingIndicator = config.useDemographicDenominators && (indicatorNameLower.includes('switching to second line') || indicatorNameLower.includes('switching to third line') || indicatorNameLower.includes('first line') || indicatorNameLower.includes('second line') || indicatorNameLower.includes('third line'));
        const useDemographicDenominators = config.useDemographicDenominators || false;
        
        // For indicators with demographic-specific denominators: use Children_Total and Adults_Total
        if (useDemographicDenominators && (isVisitIndicator || isReengagementIndicator || isBaselineCD4Indicator || isARTInitiationIndicator || isProphylaxisIndicator || isMMDIndicator || isTLDIndicator || isTPTIndicator || isDiedIndicator || isEACIndicator || isVLIndicator || isARTLineSwitchingIndicator)) {
          if (group.key === 'Children_All') {
            // For late reengagement indicator (4), use eligible fields directly from backend (transparent - no calculation)
            if (isLateReengagementIndicator) {
              total = (indicator.Male_0_14_Eligible || 0) + (indicator.Female_0_14_Eligible || 0);
            } else if (indicator.Children_Total !== undefined && indicator.Children_Total !== null) {
              // Always use Children_Total from backend if it exists (even if 0)
              total = Number(indicator.Children_Total);
            } else {
              // Fallback: calculate from individual denominator fields
              total = 0;
              group.denominatorKeys?.forEach(key => {
                const denomField = config.denominatorFields?.[key] || key;
                const fieldValue = indicator[denomField];
                if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                  total += Number(fieldValue) || 0;
                }
              });
            }
          } else if (group.key === 'Adults_All') {
            // For late reengagement indicator (4), use eligible fields directly from backend (transparent - no calculation)
            if (isLateReengagementIndicator) {
              total = (indicator.Male_over_14_Eligible || 0) + (indicator.Female_over_14_Eligible || 0);
            } else if (indicator.Adults_Total !== undefined && indicator.Adults_Total !== null) {
              // Always use Adults_Total from backend if it exists (even if 0)
              total = Number(indicator.Adults_Total);
            } else {
              // Fallback: calculate from individual denominator fields
              total = 0;
              group.denominatorKeys?.forEach(key => {
                const denomField = config.denominatorFields?.[key] || key;
                const fieldValue = indicator[denomField];
                if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                  total += Number(fieldValue) || 0;
                }
              });
            }
          } else if (group.key === 'All') {
            // For "All", prioritize Children_Total + Adults_Total for indicators with demographic denominators
            // This ensures consistency between "All" and the sum of "All Children" + "All Adults"
            if (isEACIndicator || isVLIndicator || isTPTIndicator || isTLDIndicator || isMMDIndicator || isProphylaxisIndicator || isBaselineCD4Indicator || isARTInitiationIndicator || isReengagementIndicator || isVisitIndicator || isDiedIndicator || isARTLineSwitchingIndicator) {
              // For late reengagement indicator (4), use Total_Eligible directly from backend (transparent - no calculation)
              if (isLateReengagementIndicator) {
                total = indicator.Total_Eligible || 0;
              } else {
                // For indicators with demographic denominators, use sum of Children_Total + Adults_Total
                total = (indicator.Children_Total || 0) + (indicator.Adults_Total || 0);
                // If still 0, try to sum individual _Total fields
                if (total === 0) {
                  total = (indicator.Male_0_14_Total || 0) + (indicator.Female_0_14_Total || 0) +
                          (indicator.Male_over_14_Total || 0) + (indicator.Female_over_14_Total || 0);
                }
              }
            } else {
              // For other indicators, use overall denominator
              // If overallDenominator is 0 or null, try to calculate from demographic totals
              if (overallDenominator && overallDenominator > 0) {
                total = overallDenominator;
              } else {
                // Fallback: sum all demographic totals
                total = (indicator.Children_Total || 0) + (indicator.Adults_Total || 0);
                // If still 0, try to sum individual _Total fields
                if (total === 0) {
                  total = (indicator.Male_0_14_Total || 0) + (indicator.Female_0_14_Total || 0) +
                          (indicator.Male_over_14_Total || 0) + (indicator.Female_over_14_Total || 0);
                }
              }
            }
          } else {
            // For individual demographics, use the denominator field from config
            total = 0;
            let hasData = false;
            group.denominatorKeys?.forEach(key => {
              // For late reengagement indicator (4), use eligible fields directly from backend (transparent - no calculation)
              if (isLateReengagementIndicator) {
                const eligibleField = `${key}_Eligible`; // e.g., 'Male_0_14' -> 'Male_0_14_Eligible'
                const fieldValue = indicator[eligibleField];
                if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                  const numValue = Number(fieldValue);
                  if (!isNaN(numValue)) {
                    total += numValue;
                    hasData = true;
                  }
                }
              } else {
                // For ART initiation indicators, always use the _Total field from config
                const denomField = config.denominatorFields?.[key];
                if (!denomField) {
                  // Fallback: try to construct the field name (e.g., 'Male_0_14' -> 'Male_0_14_Total')
                  const totalField = `${key}_Total`;
                  const fieldValue = indicator[totalField];
                  if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                    const numValue = Number(fieldValue);
                    if (!isNaN(numValue)) {
                      total += numValue;
                      hasData = true;
                    }
                  }
                } else {
                  // Use the mapped denominator field (e.g., 'Male_0_14_Total')
                  const fieldValue = indicator[denomField];
                  if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                    const numValue = Number(fieldValue);
                    if (!isNaN(numValue)) {
                      total += numValue;
                      hasData = true;
                    }
                  }
                }
              }
            });
            if (!hasData || total === 0) {
              // If no denominator data found, don't calculate percentage (set to null)
              total = null;
            }
          }
        }
        // For visit indicators without demographic denominators: use same Total_Visits for all groups
        else if (isVisitIndicator && !useDemographicDenominators) {
          total = overallDenominator;
        }
        // For other indicators: try to get demographic-specific totals
        else {
          // For denominator: try to get demographic-specific totals
          let groupDenominator = 0;
          group.denominatorKeys?.forEach(key => {
            // Try to find demographic total field (e.g., Male_0_14_Total, Female_0_14_Total)
            const totalField = `${key}_Total`;
            if (indicator[totalField] !== undefined && indicator[totalField] !== null) {
              groupDenominator += indicator[totalField] || 0;
            } else if (config.denominatorFields?.[key]) {
              // Use the denominator field mapping (e.g., 'Male_0_14' -> indicator.Male_0_14_Total)
              const denomField = config.denominatorFields[key];
              if (indicator[denomField] !== undefined && indicator[denomField] !== null) {
                groupDenominator += Number(indicator[denomField]) || 0;
              }
            }
          });

          if (groupDenominator > 0) {
            total = groupDenominator;
          } else if (group.key === 'All') {
            // For "All" category, use overall denominator
            total = overallDenominator;
          } else if (group.key === 'Children_All' || group.key === 'Adults_All') {
            // For grouped Children/Adults, use overall denominator as fallback
            total = overallDenominator;
          } else {
            // For individual demographics, try to use denominator field if it exists
            // Otherwise fallback to overall denominator
            const firstKey = group.denominatorKeys?.[0];
            if (firstKey && config.denominatorFields?.[firstKey]) {
              const denomField = config.denominatorFields[firstKey];
              if (indicator[denomField] !== undefined && indicator[denomField] !== null) {
                total = Number(indicator[denomField]) || 0;
              } else {
                total = overallDenominator;
              }
            } else {
              total = overallDenominator;
            }
          }
        }

        // For numerator-denominator indicators, always calculate percentage per group
        // Only calculate if we have a valid total (not null and > 0)
        if (total !== null && total !== undefined && total > 0) {
          percentage = (value / total) * 100;
        } else {
          percentage = null; // Don't show percentage if denominator is missing
        }
      } else {
        // Standard demographic: aggregate across keys for numerator
        group.numeratorKeys?.forEach(key => {
          value += indicator[key] || 0;
        });
        
        // For denominator: calculate total from all demographic groups
        // For "All", use TOTAL field if available, otherwise sum all demographics
        if (group.key === 'All') {
          if (indicator.TOTAL !== undefined && indicator.TOTAL !== null) {
            total = Number(indicator.TOTAL) || 0;
          } else {
            // Sum all demographic values
            total = (indicator.Male_0_14 || 0) + (indicator.Female_0_14 || 0) + 
                    (indicator.Male_over_14 || 0) + (indicator.Female_over_14 || 0);
          }
        } else if (group.key === 'Children_All') {
          // Sum children demographics
          total = (indicator.Male_0_14 || 0) + (indicator.Female_0_14 || 0);
        } else if (group.key === 'Adults_All') {
          // Sum adults demographics
          total = (indicator.Male_over_14 || 0) + (indicator.Female_over_14 || 0);
        } else {
          // For individual demographics, use the value itself as denominator
          total = value;
        }
        
        // For standard demographic indicators, use overall percentage for all groups
        // This shows the overall percentage as a reference line across all demographic groups
        if (indicator.Percentage !== null && indicator.Percentage !== undefined) {
          percentage = indicator.Percentage;
        } else if (total > 0) {
          // Calculate percentage if we have a denominator
          percentage = (value / total) * 100;
        } else {
          percentage = 0;
        }
      }

      return {
        name: group.name,
        value,
        total,
        percentage,
        color: group.color,
        ageGroup: group.ageGroup
      };
    });

    // Always show "All" category if it exists, filter others
    return data.filter(item =>
      item.name === 'All' ||
      item.name === 'All Children' ||
      item.name === 'All Adults' ||
      item.value > 0 ||
      (item.total && item.total > 0)
    );
  };

  const preparePieChartData = () => {
    const data = [];
    if (indicator.Male_0_14) data.push({ name: 'Male 0-14', value: indicator.Male_0_14 });
    if (indicator.Female_0_14) data.push({ name: 'Female 0-14', value: indicator.Female_0_14 });
    if (indicator.Male_over_14) data.push({ name: 'Male 15+', value: indicator.Male_over_14 });
    if (indicator.Female_over_14) data.push({ name: 'Female 15+', value: indicator.Female_over_14 });
    return data;
  };

  const prepareComparisonData = () => {
    if (!config || config.dataType !== 'comparison') return [];
    
    const numerator = indicator[config.numeratorField] || 0;
    const denominator = indicator[config.denominatorField] || 0;
    const notAchieved = denominator - numerator;

    return [
      {
        name: config.labels.achieved,
        value: numerator,
        color: '#10b981'
      },
      {
        name: config.labels.notAchieved,
        value: notAchieved,
        color: '#ef4444'
      }
    ].filter(item => item.value > 0);
  };

  const barData = prepareBarChartData(ageViewType);
  const pieData = preparePieChartData();
  const comparisonData = prepareComparisonData();

  // Handle empty data state
  if (barData.length === 0 && pieData.length === 0 && comparisonData.length === 0) {
    return (
      <div className={`w-full ${compact ? 'h-[200px]' : 'h-[300px]'} flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20`}>
        <div className="text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data available for visualization</p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    value: {
      label: 'Count',
      color: 'hsl(var(--chart-1))',
    },
    'Male 0-14': { label: 'Male 0-14', color: '#3b82f6' },
    'Female 0-14': { label: 'Female 0-14', color: '#ec4899' },
    'Male 15+': { label: 'Male 15+', color: '#10b981' },
    'Female 15+': { label: 'Female 15+', color: '#f59e0b' },
    'All': { label: 'All', color: '#8b5cf6' },
    'All Children': { label: 'All Children', color: '#8b5cf6' },
    'All Adults': { label: 'All Adults', color: '#8b5cf6' },
    Achieved: { label: 'Achieved', color: '#10b981' },
    'Not Achieved': { label: 'Not Achieved', color: '#ef4444' },
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Determine chart type based on configuration
  const isPieChartIndicator = config?.chartType === 'pie';
  const isBarChartIndicator = config?.chartType === 'bar';

  const hasComparisonData = comparisonData.length > 0;
  const hasDemographicData = barData.length > 0;

  // Use pie chart for comparison indicators (Achieved vs Not Achieved)
  if (isPieChartIndicator && hasComparisonData) {
    const outerRadius = compact ? 80 : 120;
    const customLabels = config?.labels;
    return (
      <div className={`w-full ${compact ? 'h-[300px]' : 'h-[400px]'}`}>
        <ChartContainer config={chartConfig} className="h-full">
          <PieChart>
            <Pie
              data={comparisonData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [formatNumber(value), name]}
            />
            <Legend />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {indicator.Percentage !== null && indicator.Percentage !== undefined && (
            <div className="text-lg font-semibold text-foreground">
              Overall: {formatNumber(indicator.Percentage)}%
            </div>
          )}
          {customLabels && (
            <div className="mt-1 text-xs">
              {customLabels.achieved}: {formatNumber(comparisonData.find(d => d.name === customLabels.achieved)?.value || 0)} / {formatNumber(comparisonData.reduce((sum, d) => sum + d.value, 0))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Use bar chart for demographic breakdown indicators (better for comparing values across categories)
  if (isBarChartIndicator && hasDemographicData) {
    const isReengagementIndicator = config?.overallDenominatorField === 'Total_Lost';
    const isNumeratorDenominator = config?.dataType === 'numerator_denominator';
    const hasTotalData = barData.some(item => item.total !== null && item.total !== undefined);
    const hasPercentage = indicator.Percentage !== null && indicator.Percentage !== undefined;
    const hasPercentageData = barData.some(item => item.percentage !== null && item.percentage !== undefined && item.percentage >= 0);
    // Show percentage line for all bar charts if they have percentage data
    const shouldShowPercentageLine = hasPercentageData || hasPercentage;

    return (
      <div className="w-full max-w-full">
        {/* Toggle buttons for view type - show for all bar charts */}
        {isBarChartIndicator && (
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAgeViewType('all')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                ageViewType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setAgeViewType('children')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                ageViewType === 'children'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Children (0-14)
            </button>
            <button
              type="button"
              onClick={() => setAgeViewType('adults')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                ageViewType === 'adults'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Adults (15+)
            </button>
          </div>
        )}
        <ChartContainer config={chartConfig} className={`w-full ${compact ? 'h-[400px]' : 'h-[500px]'}`}>
          <ComposedChart 
            data={barData} 
            barCategoryGap="20%"
            margin={{ top: 50, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            {/* Left Y-axis for counts (N and D) */}
            <YAxis 
              yAxisId="left"
              label={{ value: isNumeratorDenominator ? 'Count' : 'Value', angle: -90, position: 'insideLeft' }}
            />
            {/* Right Y-axis for percentage */}
            {shouldShowPercentageLine && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, (dataMin, dataMax) => {
                  // Add extra space at the top for labels (approximately 20% of max value)
                  const maxValue = Math.max(
                    dataMax || 0,
                    ...barData.map(d => d.percentage || 0),
                    indicator.Percentage || 0
                  );
                  return maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;
                }]}
                label={{ value: 'Percentage (%)', angle: 90, position: 'insideRight' }}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
              />
            )}
            <ChartTooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                
                const data = payload[0]?.payload;
                const total = data?.total;
                const percentage = data?.percentage;
                
                return (
                  <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm px-3 py-2">
                    <div className="mb-2 font-semibold text-sm text-foreground">{label}</div>
                    <div className="space-y-1 text-xs">
                      {total !== null && total !== undefined && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">D:</span>
                          <span className="font-medium text-foreground">{formatNumber(total)}</span>
                        </div>
                      )}
                      {payload.map((item, index) => {
                        if (item.dataKey === 'total') {
                          return null; // Skip, we show it above
                        }
                        if (item.dataKey === 'value') {
                          return (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <span className="text-muted-foreground">N:</span>
                              <span className="font-medium text-foreground">{formatNumber(item.value)}</span>
                            </div>
                          );
                        }
                        if (item.dataKey === 'percentage') {
                          return (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <span className="text-red-500 font-medium">%:</span>
                              <span className="font-medium text-red-500">{formatNumber(item.value)}%</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              }}
            />
            {/* Denominator bar (D) - shown for all bar charts */}
            {hasTotalData && (
              <Bar 
                yAxisId="left"
                dataKey="total" 
                radius={[4, 4, 0, 0]}
                name="Denominator (D)"
                strokeWidth={1}
                barSize={60}
                fill="rgba(156, 163, 175, 0.3)"
                stroke="rgba(156, 163, 175, 0.5)"
              />
            )}
            {/* Numerator bar (N) */}
            <Bar 
              yAxisId="left"
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              name="Numerator (N)"
              strokeWidth={1}
              barSize={60}
            >
              {barData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke={entry.color || COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            {/* Line chart for percentage trend */}
            {shouldShowPercentageLine && (
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 7 }}
                name={`% ${config.labels?.numerator || 'Percentage'}`}
                label={(props) => {
                  const { x, y, value } = props;
                  if (value === null || value === undefined) return null;
                  
                  const formatted = typeof value === 'number' ? value.toFixed(2) : formatNumber(value);
                  const labelText = `%: ${formatted}%`;
                  
                  return (
                    <g>
                      <text
                        x={x}
                        y={y - 10}
                        fill="#ef4444"
                        fontSize={11}
                        fontWeight="normal"
                        textAnchor="middle"
                        dominantBaseline="bottom"
                        className="pointer-events-none"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                }}
              />
            )}
            {/* Reference line showing overall percentage */}
            {shouldShowPercentageLine && indicator.Percentage !== null && indicator.Percentage !== undefined && (
              <ReferenceLine
                yAxisId="right"
                y={indicator.Percentage}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Overall: ${formatNumber(indicator.Percentage)}%`,
                  position: 'right',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 'bold',
                  offset: 10
                }}
              />
            )}
          </ComposedChart>
        </ChartContainer>
        {/* Combined Legend and Summary below chart - show for all bar charts */}
        {isBarChartIndicator && hasTotalData && (
          <div className="mt-3 w-full">
            <div className="flex items-center justify-center gap-6 text-sm">
              {/* Numerator (N) with blue box - show for all bar charts */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-muted-foreground">
                  <span className="font-semibold">{config.labels?.numerator || 'Total'}</span> {formatNumber(
                    (() => {
                      // For late reengagement indicator (4), use Reengaged_Over_28 specifically
                      const indicatorNameLower = (indicator.Indicator || '').toLowerCase();
                      const isLateReengagement = indicatorNameLower.includes('after 28') || indicatorNameLower.includes('over 28') || indicatorNameLower.includes('28+');
                      
                      if (isLateReengagement) {
                        return indicator.Reengaged_Over_28 || 0;
                      }
                      
                      // For other indicators, use the standard field chain
                      return indicator.Deaths ||
                        indicator.Lost_to_Followup ||
                        indicator.Reengaged_Within_28 ||
                        indicator.Reengaged_Over_28 ||
                        indicator.Late_Visits_Beyond_Buffer ||
                        indicator.Late_Visits_Within_Buffer ||
                        indicator.On_Schedule_Visits ||
                        indicator.Early_Visits ||
                        indicator.With_Baseline_CD4 ||
                        indicator.Received_Counseling ||
                        indicator.Followup_Received ||
                        indicator.Achieved_Suppression ||
                        indicator.Switched_To_Second_Line ||
                        indicator.Switched_To_Third_Line ||
                        indicator.TOTAL ||
                        (indicator.Male_0_14 || 0) + (indicator.Female_0_14 || 0) + 
                        (indicator.Male_over_14 || 0) + (indicator.Female_over_14 || 0);
                    })()
                  )} <span className="text-xs">(N)</span>
                </span>
              </div>
              {/* Denominator (D) with gray box - show for all bar charts */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 opacity-50 rounded"></div>
                <span className="text-muted-foreground">
                  <span className="font-semibold">{denominatorLabel}</span> {formatNumber(
                    (() => {
                      // For late reengagement indicator (4), use Total_Eligible directly from backend (transparent - no calculation)
                      const indicatorNameLower = (indicator.Indicator || '').toLowerCase();
                      const isLateReengagement = indicatorNameLower.includes('after 28') || indicatorNameLower.includes('over 28') || indicatorNameLower.includes('28+');
                      
                      if (isLateReengagement) {
                        // Use Total_Eligible directly from backend, with fallback to sum of demographic eligible fields
                        if (indicator.Total_Eligible !== undefined && indicator.Total_Eligible !== null) {
                          return indicator.Total_Eligible;
                        }
                        // Fallback: sum demographic eligible fields
                        return (indicator.Male_0_14_Eligible || 0) + 
                               (indicator.Female_0_14_Eligible || 0) + 
                               (indicator.Male_over_14_Eligible || 0) + 
                               (indicator.Female_over_14_Eligible || 0);
                      }
                      
                      // For other indicators with demographic denominators, prefer sum of Children_Total + Adults_Total
                      return (config?.useDemographicDenominators && indicator.Children_Total !== undefined && indicator.Adults_Total !== undefined) 
                        ? ((indicator.Children_Total || 0) + (indicator.Adults_Total || 0))
                        : (indicator[overallDenominatorField] ||
                           indicator.TOTAL ||
                           (indicator.Male_0_14 || 0) + (indicator.Female_0_14 || 0) + 
                           (indicator.Male_over_14 || 0) + (indicator.Female_over_14 || 0));
                    })()
                  )} <span className="text-xs">(D)</span>
                </span>
              </div>
              {/* Percentage with red line - show for all indicators with percentage */}
              {indicator.Percentage !== null && indicator.Percentage !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500"></div>
                  <span className="text-foreground font-semibold">
                    <span className="font-semibold">Percentage</span>: {formatNumber(indicator.Percentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback 1: If pie chart indicator but no comparison data, try demographic pie
  if (isPieChartIndicator && pieData.length > 0) {
    const outerRadius = compact ? 80 : 120;
    return (
      <div className={`w-full ${compact ? 'h-[300px]' : 'h-[400px]'}`}>
        <ChartContainer config={chartConfig} className="h-full">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, value }) => `${name}\n${formatNumber(value)} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [formatNumber(value), name]}
            />
            <Legend />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {indicator.Percentage !== null && indicator.Percentage !== undefined && (
            <div className="text-lg font-semibold text-foreground">
              Overall: {formatNumber(indicator.Percentage)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback 2: If bar chart indicator but no demographic data, try comparison pie
  if (isBarChartIndicator && hasComparisonData) {
    const outerRadius = compact ? 80 : 120;
    return (
      <div className={`w-full ${compact ? 'h-[300px]' : 'h-[400px]'}`}>
        <ChartContainer config={chartConfig} className="h-full">
          <PieChart>
            <Pie
              data={comparisonData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [formatNumber(value), name]}
            />
            <Legend />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {indicator.Percentage !== null && indicator.Percentage !== undefined && (
            <div className="text-lg font-semibold text-foreground">
              Overall: {formatNumber(indicator.Percentage)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback 3: Default to bar chart if we have demographic data
  if (hasDemographicData) {
    return (
      <div className={`w-full ${compact ? 'h-[300px]' : 'h-[400px]'}`}>
        <ChartContainer config={chartConfig} className="h-full">
          <BarChart data={barData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [formatNumber(value), name]}
            />
            <Legend />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} strokeWidth={1}>
              {barData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke={entry.color || COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {indicator.Percentage !== null && indicator.Percentage !== undefined && (
            <div className="text-lg font-semibold text-foreground">
              Overall Percentage: {formatNumber(indicator.Percentage)}%
            </div>
          )}
          {indicator.TOTAL !== undefined && (
            <div className="mt-1">
              Total: {formatNumber(indicator.TOTAL)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Should not reach here due to empty state check, but return null as fallback
  return null;
};

export default IndicatorChart;

