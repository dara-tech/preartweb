// Test single indicator with site 1705
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 TESTING SINGLE INDICATOR WITH SITE 1705');
console.log('=' .repeat(50));

async function testSingleIndicator() {
  try {
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

    console.log(`🎯 Testing site: ${siteCode}`);
    console.log(`📊 Testing indicator: 1_percentage_died`);
    
    const result = await mortalityRetentionIndicators.executeIndicator(
      siteCode,
      '1_percentage_died',
      params,
      false
    );
    
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.length > 0) {
      console.log('🎉 SUCCESS! Indicator returned data');
    } else {
      console.log('⚠️  No data returned - this is normal if no patients died in the period');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSingleIndicator();
