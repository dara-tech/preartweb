// Test mortality retention indicators with real data
const { siteDatabaseManager } = require('./src/config/siteDatabase');
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 TESTING MORTALITY INDICATORS WITH DATA');
console.log('=' .repeat(50));

async function testWithData() {
  try {
    console.log('📋 Testing with available sites...');
    
    // Get available sites
    const sites = await siteDatabaseManager.getAvailableSites();
    console.log(`✅ Found ${sites.length} sites:`);
    sites.forEach(site => {
      console.log(`   - ${site.site_code}: ${site.site_name}`);
    });
    
    if (sites.length === 0) {
      console.log('❌ No sites available for testing');
      return;
    }
    
    // Test with the first site
    const testSite = sites[0];
    console.log(`\n🎯 Testing with site: ${testSite.site_code} (${testSite.site_name})`);
    
    // Test parameters
    const params = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      previousEndDate: '2023-12-31',
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      mmd_eligible_code: 0,
      mmd_drug_quantity: 60,
      vl_suppression_threshold: 1000,
      tld_regimen_formula: '3TC + DTG + TDF',
      transfer_in_code: 1,
      tpt_drug_list: "'Isoniazid','3HP','6H'"
    };
    
    console.log('\n📊 Testing first mortality indicator...');
    
    // Test the first indicator (percentage died)
    const result = await mortalityRetentionIndicators.executeIndicator(
      testSite.site_code,
      '1_percentage_died',
      params,
      false // Don't use cache for testing
    );
    
    console.log('✅ Indicator executed successfully!');
    console.log('📈 Results:');
    
    if (result.data && result.data.length > 0) {
      const indicatorData = result.data[0];
      console.log(`   Indicator: ${indicatorData.Indicator}`);
      console.log(`   Total Died: ${indicatorData.Total_Died}`);
      console.log(`   Total ART Patients: ${indicatorData.Total_ART_Patients}`);
      console.log(`   Percentage: ${indicatorData.Percentage}%`);
      console.log(`   Male 0-14: ${indicatorData.Male_0_14}`);
      console.log(`   Female 0-14: ${indicatorData.Female_0_14}`);
      console.log(`   Male 15+: ${indicatorData.Male_over_14}`);
      console.log(`   Female 15+: ${indicatorData.Female_over_14}`);
    } else {
      console.log('   No data returned - this means no patients died in the specified period');
    }
    
    console.log(`\n⏱️  Execution time: ${result.executionTime}ms`);
    console.log(`📅 Timestamp: ${result.timestamp}`);
    
    // Test a few more indicators
    console.log('\n📊 Testing additional indicators...');
    const testIndicators = [
      '2_percentage_lost_to_followup',
      '12a_vl_testing_coverage',
      '15_retention_rate'
    ];
    
    for (const indicatorId of testIndicators) {
      try {
        console.log(`\n🔍 Testing ${indicatorId}...`);
        const indicatorResult = await mortalityRetentionIndicators.executeIndicator(
          testSite.site_code,
          indicatorId,
          params,
          false
        );
        
        if (indicatorResult.data && indicatorResult.data.length > 0) {
          const data = indicatorResult.data[0];
          console.log(`   ✅ ${indicatorId}: ${data.Indicator || 'Data available'}`);
          console.log(`   📊 Results: ${JSON.stringify(data, null, 2)}`);
        } else {
          console.log(`   ⚠️  ${indicatorId}: No data (normal if no matching records)`);
        }
        
        console.log(`   ⏱️  Time: ${indicatorResult.executionTime}ms`);
        
      } catch (error) {
        console.log(`   ❌ ${indicatorId}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ MORTALITY INDICATORS TEST COMPLETED!');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Go to: http://localhost:5173');
    console.log('   2. Login to the application');
    console.log('   3. Navigate to: Analytics & Reports > Mortality & Retention');
    console.log('   4. Select a site and date range');
    console.log('   5. You should now see data!');
    
  } catch (error) {
    console.log('❌ Error testing mortality indicators:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testWithData().catch(console.error);
