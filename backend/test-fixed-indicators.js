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

console.log('🧪 Testing the 2 fixed indicators (8a and 8b)...');

async function testFixedIndicators() {
  const indicatorsToTest = ['8a_cotrimoxazole_prophylaxis', '8b_fluconazole_prophylaxis'];
  
  for (const indicatorId of indicatorsToTest) {
    try {
      console.log(`\n🔍 Testing: ${indicatorId}`);
      const result = await mortalityRetentionIndicators.executeIndicator('1705', indicatorId, params, false);
      
      if (result.data && result.data.length > 0) {
        console.log(`✅ ${indicatorId}: WORKING`);
        console.log(`   Execution time: ${result.executionTime}ms`);
        console.log(`   Data:`, JSON.stringify(result.data[0], null, 2));
      } else {
        console.log(`❌ ${indicatorId}: FAILED - No data returned`);
      }
    } catch (error) {
      console.log(`❌ ${indicatorId}: ERROR - ${error.message.substring(0, 100)}...`);
    }
  }
}

testFixedIndicators().catch(error => {
  console.error('❌ Test failed:', error.message);
});



