#!/usr/bin/env node

require('dotenv').config();
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 COMPREHENSIVE TEST - ALL 28 MORTALITY RETENTION INDICATORS');
console.log('============================================================');

const siteCode = '1705';
const params = {
  StartDate: '2024-01-01',
  EndDate: '2024-12-31',
  PreviousEndDate: '2023-12-31',
  lost_code: 0,
  dead_code: 1,
  transfer_out_code: 3,
  transfer_in_code: 1,
  mmd_eligible_code: 0,
  mmd_drug_quantity: 60,
  vl_suppression_threshold: 1000,
  tld_regimen_formula: '3TC + DTG + TDF',
  tpt_drug_list: "'Isoniazid','3HP','6H'",
  buffer_days: 30,
  cd4_threshold_350: 350,
  cd4_threshold_100: 100
};

console.log(`🎯 Testing with site code: ${siteCode}`);
console.log(`📅 Date range: ${params.StartDate} to ${params.EndDate}`);

async function runComprehensiveTest() {
  try {
    console.log('\n📋 Available Indicators:');
    const availableIndicators = mortalityRetentionIndicators.getAvailableIndicators();
    console.log(`Found ${availableIndicators.length} indicators`);
    
    console.log('\n🔍 Testing executeAllIndicators method...');
    
    const result = await mortalityRetentionIndicators.executeAllIndicators(
      siteCode, 
      params, 
      false // Don't use cache for testing
    );
    
    console.log('\n📈 RESULTS SUMMARY');
    console.log('==================');
    console.log(`✅ Total execution time: ${result.executionTime}ms`);
    console.log(`✅ Successful indicators: ${result.successCount}`);
    console.log(`❌ Failed indicators: ${result.errorCount}`);
    console.log(`📊 Total indicators: ${result.results.length}`);
    console.log(`🎯 Success rate: ${((result.successCount / result.results.length) * 100).toFixed(1)}%`);
    console.log(`⚡ Average time per indicator: ${result.averageTimePerIndicator}ms`);
    
    // Count indicators with real data
    const withData = result.results.filter(r => {
      if (!r.success || !r.data) return false;
      const values = Object.values(r.data);
      return values.some(val => val !== null && val !== undefined && val !== 0 && val !== 'N/A' && val !== '');
    });
    
    console.log(`📋 Indicators with real data: ${withData.length}`);
    
    // Show successful indicators with data
    if (withData.length > 0) {
      console.log('\n✅ Indicators with real data:');
      withData.slice(0, 10).forEach(r => {
        const indicatorName = r.data.Indicator || r.indicatorId;
        console.log(`   📊 ${r.indicatorId}: ${indicatorName}`);
      });
      if (withData.length > 10) {
        console.log(`   ... and ${withData.length - 10} more`);
      }
    }
    
    // Show failed indicators
    const failed = result.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ Failed indicators:');
      failed.forEach(r => {
        console.log(`   ❌ ${r.indicatorId}: ${r.error || 'Unknown error'}`);
      });
    }
    
    // Final status
    console.log('\n🎉 FINAL STATUS');
    console.log('===============');
    if (result.errorCount === 0) {
      console.log('🎯 ALL 28 INDICATORS ARE WORKING PERFECTLY! 🎯');
      console.log('🚀 System is ready for production use!');
    } else {
      console.log(`⚠️  ${result.errorCount} indicators need attention`);
      console.log('🔧 Please review the failed indicators above');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

runComprehensiveTest();



