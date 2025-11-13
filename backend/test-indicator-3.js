// Test indicator 3: Reengaged within 28 days
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 TESTING INDICATOR 3: Reengaged within 28 days');
console.log('=' .repeat(60));

async function testIndicator3() {
  try {
    const siteCode = process.argv[2] || '1705';
    const startDate = process.argv[3] || '2024-01-01';
    const endDate = process.argv[4] || '2024-12-31';
    
    const params = {
      StartDate: startDate,
      EndDate: endDate,
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
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    console.log(`📊 Testing indicator: 3_reengaged_within_28_days\n`);
    
    const result = await mortalityRetentionIndicators.executeIndicator(
      siteCode,
      '3_reengaged_within_28_days',
      params,
      false // Don't use cache
    );
    
    console.log('📋 RESULT:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data && result.data.length > 0) {
      const data = result.data[0];
      console.log('\n✅ SUCCESS! Indicator returned data:');
      console.log(`   Indicator: ${data.Indicator}`);
      console.log(`   Total Missed: ${data.Total_Lost}`);
      console.log(`   Reengaged Within 28 Days: ${data.Reengaged_Within_28}`);
      console.log(`   Percentage: ${data.Percentage}%`);
      console.log(`   Male 0-14: ${data.Male_0_14} (Reengaged: ${data.Male_0_14_Reengaged})`);
      console.log(`   Female 0-14: ${data.Female_0_14} (Reengaged: ${data.Female_0_14_Reengaged})`);
      console.log(`   Male 15+: ${data.Male_over_14} (Reengaged: ${data.Male_over_14_Reengaged})`);
      console.log(`   Female 15+: ${data.Female_over_14} (Reengaged: ${data.Female_over_14_Reengaged})`);
    } else {
      console.log('\n⚠️  No data returned');
      console.log('   This could mean:');
      console.log('   - No missed appointments in the period, OR');
      console.log('   - No patients reengaged within 28 days, OR');
      console.log('   - Query issue');
    }
    
    if (result.error) {
      console.log(`\n❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
  }
}

testIndicator3();

