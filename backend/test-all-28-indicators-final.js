#!/usr/bin/env node

require('dotenv').config();
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 TESTING ALL 28 MORTALITY RETENTION INDICATORS');
console.log('================================================');

// Use site code 1705 for testing
const siteCode = '1705';
console.log(`🎯 Testing with site code: ${siteCode}`);

// Complete parameters for all indicators
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

async function testAllIndicators() {
  console.log('\n📋 Available Indicators:');
  const availableIndicators = mortalityRetentionIndicators.getAvailableIndicators();
  console.log(`Found ${availableIndicators.length} indicators`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  console.log('\n🔍 Testing each indicator individually...');
  console.log('==========================================');

  for (const indicator of availableIndicators) {
    try {
      console.log(`\n📊 Testing: ${indicator.id}`);
      
      const result = await mortalityRetentionIndicators.executeIndicator(
        siteCode, 
        indicator.id, 
        params, 
        false // Don't use cache for testing
      );
      
      if (result.success && result.data) {
        const data = result.data;
        const hasData = data && Object.values(data).some(val => 
          val !== null && val !== undefined && val !== 0 && val !== 'N/A'
        );
        
        console.log(`✅ ${indicator.id}: SUCCESS`);
        console.log(`   Execution time: ${result.executionTime}ms`);
        console.log(`   Has data: ${hasData ? 'YES' : 'NO'}`);
        
        if (hasData) {
          // Show key values
          const keyFields = ['Percentage', 'Total_ART', 'Deaths', 'Value', 'Total_Retained'];
          keyFields.forEach(field => {
            if (data[field] !== undefined && data[field] !== null) {
              console.log(`   ${field}: ${data[field]}`);
            }
          });
        }
        
        successCount++;
        results.push({
          id: indicator.id,
          success: true,
          hasData,
          executionTime: result.executionTime
        });
      } else {
        console.log(`❌ ${indicator.id}: FAILED - No data returned`);
        errorCount++;
        results.push({
          id: indicator.id,
          success: false,
          error: 'No data returned'
        });
      }
    } catch (error) {
      console.log(`❌ ${indicator.id}: ERROR - ${error.message}`);
      errorCount++;
      results.push({
        id: indicator.id,
        success: false,
        error: error.message
      });
    }
  }

  console.log('\n📈 FINAL RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Successful indicators: ${successCount}`);
  console.log(`❌ Failed indicators: ${errorCount}`);
  console.log(`📊 Total indicators: ${availableIndicators.length}`);
  console.log(`🎯 Success rate: ${((successCount / availableIndicators.length) * 100).toFixed(1)}%`);

  // Show indicators with data
  const indicatorsWithData = results.filter(r => r.success && r.hasData);
  console.log(`\n📋 Indicators with real data: ${indicatorsWithData.length}`);
  indicatorsWithData.forEach(r => {
    console.log(`   ✅ ${r.id} (${r.executionTime}ms)`);
  });

  // Show failed indicators
  const failedIndicators = results.filter(r => !r.success);
  if (failedIndicators.length > 0) {
    console.log(`\n❌ Failed indicators: ${failedIndicators.length}`);
    failedIndicators.forEach(r => {
      console.log(`   ❌ ${r.id}: ${r.error}`);
    });
  }

  // Test the executeAllIndicators method
  console.log('\n🚀 Testing executeAllIndicators method...');
  console.log('==========================================');
  
  try {
    const allResults = await mortalityRetentionIndicators.executeAllIndicators(
      siteCode, 
      params, 
      false // Don't use cache
    );
    
    console.log(`✅ executeAllIndicators: SUCCESS`);
    console.log(`   Total execution time: ${allResults.executionTime}ms`);
    console.log(`   Successful indicators: ${allResults.successCount}`);
    console.log(`   Failed indicators: ${allResults.errorCount}`);
    console.log(`   Average time per indicator: ${allResults.averageTimePerIndicator}ms`);
    console.log(`   Total results: ${allResults.results.length}`);
    
    // Show some sample results
    const sampleResults = allResults.results.slice(0, 3);
    console.log('\n📋 Sample results:');
    sampleResults.forEach(result => {
      if (result.success && result.data) {
        console.log(`   ${result.indicatorId}: ${result.data.Indicator || 'N/A'}`);
      }
    });
    
  } catch (error) {
    console.log(`❌ executeAllIndicators: ERROR - ${error.message}`);
  }

  console.log('\n🎉 ALL TESTS COMPLETED!');
  console.log('======================');
  
  if (successCount === availableIndicators.length) {
    console.log('🎯 ALL INDICATORS ARE WORKING PERFECTLY! 🎯');
  } else {
    console.log(`⚠️  ${errorCount} indicators need attention`);
  }
}

// Run the tests
testAllIndicators().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});



