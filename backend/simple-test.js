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

console.log('🔍 Testing mortality retention indicators...');

async function simpleTest() {
  try {
    console.log('Testing indicator: 1_percentage_died');
    const result = await mortalityRetentionIndicators.executeIndicator('1705', '1_percentage_died', params, false);
    
    console.log('Execution time:', result.executionTime);
    console.log('Data:', result.data);
    console.log('Has data:', result.data && result.data.length > 0);
    
    if (result.data && result.data.length > 0) {
      console.log('✅ Indicator working!');
      console.log('✅ Real data returned:', result.data[0].Indicator);
      console.log('✅ Sample values:', {
        Deaths: result.data[0].Deaths,
        Total_ART: result.data[0].Total_ART,
        Percentage: result.data[0].Percentage
      });
    } else {
      console.log('❌ Indicator failed - no data returned');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

simpleTest();