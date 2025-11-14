const mortalityRetentionIndicators = require('../src/services/mortalityRetentionIndicators');

async function testIndicator12c() {
  try {
    console.log('🧪 Testing indicator 12c (VL Suppression at 12 Months)...\n');

    const params = {
      StartDate: '2025-07-01',
      EndDate: '2025-09-30',
      PreviousEndDate: '2025-06-30',
      lost_code: 0,
      dead_code: 1,
      transfer_out_code: 3,
      transfer_in_code: 1
    };

    const indicatorId = '12c_vl_suppression_12_months';
    const siteCode = '2101'; // Test site (Takeo)

    console.log(`\n📊 Testing: ${indicatorId}`);
    console.log(`📍 Site: ${siteCode}`);
    console.log(`📅 Date Range: ${params.StartDate} to ${params.EndDate}`);
    console.log('-'.repeat(60));
    
    // Check if indicator is loaded
    const availableIndicators = await mortalityRetentionIndicators.getAvailableIndicators();
    const found = availableIndicators.find(ind => ind.id === indicatorId);
    
    if (!found) {
      console.log(`❌ Indicator ${indicatorId} not found in available indicators`);
      console.log(`   Available indicators: ${availableIndicators.map(ind => ind.id).join(', ')}`);
      process.exit(1);
    }
    
    console.log(`✅ Indicator found: ${found.name} (${found.is_active ? 'Active' : 'Inactive'})`);
    
    // Execute the indicator
    console.log('\n🔄 Executing query...');
    const startTime = Date.now();
    const result = await mortalityRetentionIndicators.executeIndicator(siteCode, indicatorId, params);
    const executionTime = Date.now() - startTime;
    
    if (result.data && result.data.length > 0) {
      const data = result.data[0];
      console.log(`✅ Execution successful (${executionTime}ms)`);
      console.log(`\n📈 Results:`);
      console.log(`   Indicator: ${data.Indicator || 'N/A'}`);
      console.log(`   VL_Suppressed_12M: ${data.VL_Suppressed_12M || 0}`);
      console.log(`   VL_Tested_12M: ${data.VL_Tested_12M || 0}`);
      console.log(`   TOTAL: ${data.TOTAL || 0}`);
      console.log(`   Percentage: ${data.Percentage || 0}%`);
      console.log(`\n   Demographics - Tested at 12 Months:`);
      console.log(`   Male 0-14: ${data.Male_0_14 || 0}`);
      console.log(`   Female 0-14: ${data.Female_0_14 || 0}`);
      console.log(`   Male >14: ${data.Male_over_14 || 0}`);
      console.log(`   Female >14: ${data.Female_over_14 || 0}`);
      console.log(`\n   Demographics - Suppressed:`);
      console.log(`   Male 0-14 Suppressed: ${data.Male_0_14_Suppressed || 0}`);
      console.log(`   Female 0-14 Suppressed: ${data.Female_0_14_Suppressed || 0}`);
      console.log(`   Male >14 Suppressed: ${data.Male_over_14_Suppressed || 0}`);
      console.log(`   Female >14 Suppressed: ${data.Female_over_14_Suppressed || 0}`);
      
      // Calculate percentage breakdown
      if (data.VL_Tested_12M > 0) {
        const suppressionRate = ((data.VL_Suppressed_12M / data.VL_Tested_12M) * 100).toFixed(2);
        console.log(`\n   Suppression Rate: ${data.VL_Suppressed_12M} / ${data.VL_Tested_12M} = ${suppressionRate}%`);
      } else {
        console.log(`\n   ⚠️  No patients tested at 12 months in this period`);
      }
    } else {
      console.log(`⚠️  No data returned (this might be normal if no patients match the criteria)`);
      console.log(`\n   This could mean:`);
      console.log(`   - No patients started ART 11-13 months before EndDate`);
      console.log(`   - No VL tests found in the 11-13 month window after ART start`);
      console.log(`   - All VL tests occurred after EndDate`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error.message) {
      console.error(`   Error message: ${error.message}`);
    }
    if (error.stack) {
      console.error(`   Stack trace:`, error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
}

testIndicator12c();

