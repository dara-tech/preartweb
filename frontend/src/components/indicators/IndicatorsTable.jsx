import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle } from 'lucide-react';

// Function to get bilingual indicator names (Khmer/English)
const getDisplayIndicatorName = (backendName) => {
  const nameMap = {
    // Original numbered versions
    '1. Active ART patients in previous quarter': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
    '2. Active Pre-ART patients in previous quarter': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
    '3. Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
    '4. Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
    '5. Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
    '5.1.1. New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
    '5.1.2. New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
    '5.1.3. New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
    '5.2. New ART started with TLD': '5.2. ចំនួនអ្នកជំងឹចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
    '6. Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
    '7. Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
    '7.1. In the same ART site': '7.1. នៅក្នុងសេវា ART តែមួយ (In the same ART site)',
    '7.2. From other ART site': '7.2. មកពីសេវា ART ផ្សេង (From other ART site)',
    '8. TPT Start (new start)': '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ថ្មីក្នុងត្រីមាស (TPT Start – new start in period)',
    '8.2. Dead': '8.2. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
    '8.3. Lost to follow up (LTFU)': '8.3. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
    '8.4. Transfer-out': '8.4. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
    '9. Active Pre-ART': '9. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active Pre-ART patients in this quarter)',
    '10. Active ART patients in this quarter': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
    '10.1. Eligible MMD': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសំរាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
    '10.2. MMD': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
    '10.3. TLD': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
    '10.4. TPT Start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
    '10.5. TPT Complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
    '10.6. Eligible for VL test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
    '10.7. VL tested in 12M': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
    '10.8. VL suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)',
    
    // Non-numbered versions (from analytics data)
    'Active ART patients in previous quarter': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
    'Active Pre-ART patients in previous quarter': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
    'Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
    'Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
    'Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
    'New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
    'New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
    'New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
    'New ART started with TLD': '5.2. ចំនួនអ្នកជំងឹចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
    'Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
    'Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
    'TPT Start (new start)': '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ថ្មីក្នុងត្រីមាស (TPT Start – new start in period)',
    'Dead': '8.2. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
    'Lost to follow up (LTFU)': '8.3. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
    'Transfer-out': '8.4. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
    'Active Pre-ART': '9. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active Pre-ART patients in this quarter)',
    'Active ART patients in this quarter': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
    'Eligible MMD': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសំរាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
    'MMD': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
    'TLD': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
    'TPT Start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
    'TPT Complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
    'Eligible for VL test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
    'VL tested in 12M': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
    'VL suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)',
    
    // Database-generated names (from backend processing)
    'active art previous': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
    'active pre art previous': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
    'newly enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
    'retested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
    'newly initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
    'art same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
    'art 1 7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
    'art over 7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
    'art with tld': '5.2. ចំនួនអ្នកជំងឹចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
    'transfer in': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
    'lost and return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
    'tpt start (new start)': '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ថ្មីក្នុងត្រីមាស (TPT Start – new start in period)',
    'dead': '8.2. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
    'lost to followup': '8.3. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
    'transfer out': '8.4. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
    'active pre art': '9. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active Pre-ART patients in this quarter)',
    'active art current': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
    'eligible mmd': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសំរាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
    'mmd': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
    'tld': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
    'tpt start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
    'tpt complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
    'eligible vl test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
    'vl tested 12m': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
    'vl suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)'
  };
  return nameMap[backendName] || backendName;
};

const IndicatorsTable = ({ indicators, loading, onIndicatorClick, selectedSite, selectedYear, selectedQuarter, isViewer }) => {
  if (loading) {
    return (
      <div className="border border-border p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            {/* Animated Icon Container */}
            <div className="relative">
              <div className="absolute inset-0  rounded-none animate-ping"></div>
              <div className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-none border border-primary/20">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 max-w-md">
              <h3 className="text-lg sm:text-xl font-bold text-foreground bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                No Indicators Available
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                No indicators were found for the selected reporting period and applied filters. 
                Try adjusting your search criteria or selecting a different time range.
              </p>
            </div>

            {/* Suggestions */}
            <div className="mt-4 p-4 bg-muted/50 rounded-none border border-border/50 w-full max-w-md">
              <h4 className="text-sm font-semibold text-foreground mb-2">Suggestions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-none"></div>
                  Check if data exists for the selected period
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-none"></div>
                  Verify site and filter selections
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-none"></div>
                  Try expanding the date range
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default Table View - Matching the image format exactly
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Indicators Table - Matching the image layout */}
      <div className="bg-card overflow-hidden rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-blue-800 border-b border-muted">
              <tr>
                <th className="px-4 py-4 text-center text-sm font-bold text-white border-r border-muted">
                  សុចនាករ Indicator
                </th>
                <th className="px-3 py-4 text-right text-sm font-bold text-white w-32 border-r border-muted">
                  អាយុ Age
                </th>
                <th className="px-3 py-4 text-right text-sm font-bold text-white w-24 border-r border-muted">
                  ប្រុស Male
                </th>
                <th className="px-3 py-4 text-right text-sm font-bold text-white w-32 border-r border-muted">
                  ស្រី Female
                </th>
                <th className="px-3 py-4 text-right text-sm font-bold text-white w-24">
                  សរុប Total
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-card divide-y divide-border/50">
              {indicators.map((indicator, index) => (
                <React.Fragment key={index}>
                  {/* Indicator Header Row with Name */}
                  <tr 
                    className="border-b border-border/50"
                  >
                    {/* Indicator Name - spans 3 rows */}
                    <td className="px-4 py-4 text-sm text-foreground align-middle text-left border-r border-border/50" rowSpan="3">
                      <div 
                        className={`font-medium leading-tight text-left transition-colors ${
                          (indicator.TOTAL || 0) > 0 
                            ? 'cursor-pointer hover:text-primary hover:underline' 
                            : 'cursor-not-allowed text-muted-foreground'
                        }`}
                        onClick={() => (indicator.TOTAL || 0) > 0 && onIndicatorClick && onIndicatorClick(indicator)}
                        title={(indicator.TOTAL || 0) > 0 ? "Click to view all patients for this indicator" : "No data available for this indicator"}
                      >
                        {getDisplayIndicatorName(indicator.Indicator)}
                      </div>
                      {indicator.error && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Error: {indicator.error}
                        </Badge>
                      )}
                    </td>

                    {/* Age 0-14 */}
                    <td className="px-3 py-4 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border/50 hover:bg-muted/70 hover:font-bold transition-all duration-200">
                      0-14
                    </td>

                    {/* Male 0-14 */}
                    <td className="px-3 py-4 text-right border-r border-border/50">
                      <div 
                        className={`text-lg font-normal underline transition-colors ${
                          (indicator.Male_0_14 || 0) > 0 
                            ? 'text-blue-600 cursor-pointer hover:text-blue-800' 
                            : 'text-blue-600/60 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          (indicator.Male_0_14 || 0) > 0 && onIndicatorClick && onIndicatorClick(indicator, { gender: 'male', ageGroup: '0-14' });
                        }}
                        title={(indicator.Male_0_14 || 0) > 0 ? "Click to view detailed list of male patients aged 0-14" : "No male patients aged 0-14"}
                      >
                        {(indicator.Male_0_14 || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Female 0-14 */}
                    <td className="px-3 py-4 text-right border-r border-border/50">
                      <div 
                        className={`text-lg font-normal underline transition-colors ${
                          (indicator.Female_0_14 || 0) > 0 
                            ? 'text-pink-600 cursor-pointer hover:text-pink-800' 
                            : 'text-pink-600/60 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          (indicator.Female_0_14 || 0) > 0 && onIndicatorClick && onIndicatorClick(indicator, { gender: 'female', ageGroup: '0-14' });
                        }}
                        title={(indicator.Female_0_14 || 0) > 0 ? "Click to view detailed list of female patients aged 0-14" : "No female patients aged 0-14"}
                      >
                        {(indicator.Female_0_14 || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Total 0-14 — no underline, dark text */}
                    <td className="px-3 py-4 text-right">
                      <div className="text-lg text-foreground">
                        {(Number(indicator.Male_0_14 || 0) + Number(indicator.Female_0_14 || 0)).toLocaleString()}
                      </div>
                    </td>

                  </tr>

                  {/* 15+ Age Group Row */}
                  <tr className="bg-muted border-b border-border/50">
                    <td className="px-3 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/50 border-r border-border/50 hover:bg-muted/70 hover:font-bold transition-all duration-200">
                      {'>'}14
                    </td>
                    <td className="px-3 py-3 text-right border-r border-border/50">
                      <div 
                        className={`text-lg font-normal underline transition-colors ${
                          (indicator.Male_over_14 || 0) > 0 
                            ? 'text-blue-600 cursor-pointer hover:text-blue-800' 
                            : 'text-blue-600/60 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          (indicator.Male_over_14 || 0) > 0 && onIndicatorClick && onIndicatorClick(indicator, { gender: 'male', ageGroup: '>14' });
                        }}
                        title={(indicator.Male_over_14 || 0) > 0 ? "Click to view detailed list of male patients aged 15+" : "No male patients aged 15+"}
                      >
                        {(indicator.Male_over_14 || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right border-r border-border/50">
                      <div 
                        className={`text-lg font-normal underline transition-colors ${
                          (indicator.Female_over_14 || 0) > 0 
                            ? 'text-pink-600 cursor-pointer hover:text-pink-800' 
                            : 'text-pink-600/60 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          (indicator.Female_over_14 || 0) > 0 && onIndicatorClick && onIndicatorClick(indicator, { gender: 'female', ageGroup: '>14' });
                        }}
                        title={(indicator.Female_over_14 || 0) > 0 ? "Click to view detailed list of female patients aged 15+" : "No female patients aged 15+"}
                      >
                        {(indicator.Female_over_14 || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="text-lg text-foreground">
                        {(Number(indicator.Male_over_14 || 0) + Number(indicator.Female_over_14 || 0)).toLocaleString()}
                      </div>
                    </td>
                  </tr>

                  {/* Sub-Total Row — Male/Female blue/pink + underline; Total bold + underline */}
                  <tr className="bg-muted border-b border-border/50 font-bold">
                    <td className="px-3 py-3 text-center text-sm font-bold text-muted-foreground bg-muted/50 border-r border-border/50 hover:bg-muted/70 hover:font-bold transition-all duration-200">
                      សរុប
                    </td>
                    <td className="px-3 py-3 text-right border-r border-border/50">
                      <div className="text-lg font-bold text-blue-600 underline">
                        {(Number(indicator.Male_0_14 || 0) + Number(indicator.Male_over_14 || 0)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right border-r border-border/50">
                      <div className="text-lg font-bold text-pink-600 underline">
                        {(Number(indicator.Female_0_14 || 0) + Number(indicator.Female_over_14 || 0)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="text-xl font-bold text-foreground underline hover:text-primary cursor-pointer" onClick={() => onIndicatorClick && onIndicatorClick(indicator)}>
                        {(indicator.TOTAL || 0).toLocaleString()}
                      </div>
                    </td>
                  </tr>

                </React.Fragment>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Report Footer */}
      <div className="bg-muted border border-border rounded-none p-4 sm:p-6 mt-6 sm:mt-8">
        <div className="text-right text-muted-foreground">
          <p className="text-xs sm:text-sm">
            This report contains {indicators.length} indicator{indicators.length !== 1 ? 's' : ''} 
            {' '}with a total of {indicators.reduce((sum, ind) => sum + (ind.TOTAL || 0), 0).toLocaleString()} patient records.
          </p>
          <p className="text-xs mt-2 text-muted-foreground">
            Data accuracy and completeness may vary by indicator. Please verify critical decisions with source data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsTable;
