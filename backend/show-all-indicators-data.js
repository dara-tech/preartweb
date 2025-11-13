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

console.log('🎯 MORTALITY & RETENTION INDICATORS - ALL DATA');
console.log('='.repeat(80));

async function showAllIndicatorsData() {
  const indicators = mortalityRetentionIndicators.getAvailableIndicators();
  
  for (let i = 0; i < indicators.length; i++) {
    const indicator = indicators[i];
    try {
      console.log(`\n${i + 1}. ${indicator.name}`);
      console.log('-'.repeat(60));
      
      const result = await mortalityRetentionIndicators.executeIndicator('1705', indicator.id, params, false);
      
      if (result.data && result.data.length > 0) {
        const data = result.data[0];
        console.log(`✅ Status: WORKING (${result.executionTime}ms)`);
        console.log(`📊 Data:`);
        
        // Show key metrics
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            console.log(`   ${key}: ${data[key]}`);
          }
        });
      } else {
        console.log(`❌ Status: FAILED - No data returned`);
      }
    } catch (error) {
      console.log(`❌ Status: ERROR - ${error.message.substring(0, 50)}...`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 COMPLETE! All 28 mortality and retention indicators tested.');
}

showAllIndicatorsData().catch(error => {
  console.error('❌ Test failed:', error.message);
});



