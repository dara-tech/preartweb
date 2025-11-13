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

console.log('🔍 Testing each indicator individually to identify failures...');

async function testEachIndicator() {
  const indicators = mortalityRetentionIndicators.getAvailableIndicators();
  let successCount = 0;
  let failureCount = 0;
  const failures = [];
  
  console.log(`\n📋 Testing ${indicators.length} indicators...`);
  
  for (const indicator of indicators) {
    try {
      console.log(`Testing: ${indicator.id}`);
      const result = await mortalityRetentionIndicators.executeIndicator('1705', indicator.id, params, false);
      if (result.success) {
        console.log(`✅ ${indicator.id}: SUCCESS`);
        successCount++;
      } else {
        console.log(`❌ ${indicator.id}: FAILED - No data returned`);
        failureCount++;
        failures.push({ id: indicator.id, error: 'No data returned' });
      }
    } catch (error) {
      console.log(`❌ ${indicator.id}: ERROR - ${error.message}`);
      failureCount++;
      failures.push({ id: indicator.id, error: error.message });
    }
  }
  
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`🎯 Success rate: ${((successCount / indicators.length) * 100).toFixed(1)}%`);
  
  if (failures.length > 0) {
    console.log('\n❌ Failed indicators:');
    failures.forEach(f => {
      console.log(`   ${f.id}: ${f.error}`);
    });
  } else {
    console.log('\n🎉 ALL INDICATORS ARE WORKING!');
  }
}

testEachIndicator().catch(error => {
  console.error('Test failed:', error.message);
});



