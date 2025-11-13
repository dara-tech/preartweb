#!/usr/bin/env node

require('dotenv').config();
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

const params = { 
  StartDate: '2024-01-01', 
  EndDate: '2024-12-31', 
  PreviousEndDate: '2023-12-31', 
  lost_code: 0, 
  dead_code: 1, 
  transfer_out_code: 3, 
  transfer_in_code: 1 
};

console.log('🧪 Testing ALL 28 mortality retention indicators...');

async function testAllIndicators() {
  const indicators = mortalityRetentionIndicators.getAvailableIndicators();
  console.log(`\n📋 Found ${indicators.length} indicators to test`);
  
  let workingCount = 0;
  let failingCount = 0;
  const working = [];
  const failing = [];
  
  for (const indicator of indicators) {
    try {
      console.log(`\n🔍 Testing: ${indicator.id}`);
      const result = await mortalityRetentionIndicators.executeIndicator('1705', indicator.id, params, false);
      
      if (result.data && result.data.length > 0) {
        console.log(`✅ ${indicator.id}: WORKING`);
        console.log(`   Data: ${result.data[0].Indicator || 'No indicator name'}`);
        console.log(`   Execution time: ${result.executionTime}ms`);
        
        // Check if it has meaningful data (not all zeros)
        const hasRealData = Object.values(result.data[0]).some(val => 
          val !== null && val !== undefined && val !== 0 && val !== '0' && val !== 'N/A' && val !== ''
        );
        
        if (hasRealData) {
          console.log(`   📊 Has real data: YES`);
          working.push({ id: indicator.id, hasData: true });
        } else {
          console.log(`   📊 Has real data: NO (all zeros/N/A)`);
          working.push({ id: indicator.id, hasData: false });
        }
        workingCount++;
      } else {
        console.log(`❌ ${indicator.id}: FAILED - No data returned`);
        failing.push({ id: indicator.id, error: 'No data returned' });
        failingCount++;
      }
    } catch (error) {
      console.log(`❌ ${indicator.id}: ERROR - ${error.message.substring(0, 100)}...`);
      failing.push({ id: indicator.id, error: error.message });
      failingCount++;
    }
  }
  
  console.log('\n📈 FINAL RESULTS');
  console.log('================');
  console.log(`✅ Working indicators: ${workingCount}`);
  console.log(`❌ Failing indicators: ${failingCount}`);
  console.log(`📊 Total indicators: ${indicators.length}`);
  console.log(`🎯 Success rate: ${((workingCount / indicators.length) * 100).toFixed(1)}%`);
  
  // Show working indicators with real data
  const withRealData = working.filter(w => w.hasData);
  console.log(`\n✅ Indicators with real data: ${withRealData.length}`);
  withRealData.forEach(w => {
    console.log(`   📊 ${w.id}`);
  });
  
  // Show working indicators without real data
  const withoutRealData = working.filter(w => !w.hasData);
  console.log(`\n⚠️  Working indicators without real data: ${withoutRealData.length}`);
  withoutRealData.forEach(w => {
    console.log(`   📊 ${w.id}`);
  });
  
  // Show failing indicators
  if (failing.length > 0) {
    console.log(`\n❌ Failing indicators: ${failing.length}`);
    failing.forEach(f => {
      console.log(`   ❌ ${f.id}: ${f.error}`);
    });
  }
  
  console.log('\n🎯 SUMMARY:');
  if (failingCount === 0) {
    console.log('🎉 ALL INDICATORS ARE WORKING!');
    if (withRealData.length === workingCount) {
      console.log('🚀 ALL INDICATORS HAVE REAL DATA!');
    } else {
      console.log(`⚠️  ${withoutRealData.length} indicators working but no data (may be normal for test site)`);
    }
  } else {
    console.log(`⚠️  ${failingCount} indicators need fixing`);
  }
}

testAllIndicators().catch(error => {
  console.error('❌ Test failed:', error.message);
});



