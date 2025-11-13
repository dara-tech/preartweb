const mortalityRetentionIndicators = require('../src/services/mortalityRetentionIndicators');

async function testIndicator6() {
  try {
    console.log('🧪 Testing indicators 6a, 6b, 6c...\n');

    const params = {
      StartDate: '2025-01-01',
      EndDate: '2025-03-31',
      PreviousEndDate: '2024-12-31',
      transfer_in_code: 1
    };

    const indicators = ['6a_same_day_art_initiation', '6b_art_initiation_1_7_days', '6c_art_initiation_over_7_days'];
    const siteCode = '1705'; // Test site

    for (const indicatorId of indicators) {
      console.log(`\n📊 Testing: ${indicatorId}`);
      console.log('-'.repeat(60));
      
      try {
        // Check if indicator is loaded
        const availableIndicators = await mortalityRetentionIndicators.getAvailableIndicators();
        const found = availableIndicators.find(ind => ind.id === indicatorId);
        
        if (!found) {
          console.log(`❌ Indicator ${indicatorId} not found in available indicators`);
          console.log(`   Available indicators: ${availableIndicators.map(ind => ind.id).join(', ')}`);
          continue;
        }
        
        console.log(`✅ Indicator found: ${found.name} (${found.is_active ? 'Active' : 'Inactive'})`);
        
        // Execute the indicator
        const result = await mortalityRetentionIndicators.executeIndicator(siteCode, indicatorId, params);
        
        if (result.data && result.data.length > 0) {
          const data = result.data[0];
          console.log(`✅ Execution successful (${result.executionTime}ms)`);
          console.log(`📈 Results:`);
          console.log(`   Indicator: ${data.Indicator || 'N/A'}`);
          console.log(`   TOTAL: ${data.TOTAL || 0}`);
          console.log(`   Male_0_14: ${data.Male_0_14 || 0}`);
          console.log(`   Female_0_14: ${data.Female_0_14 || 0}`);
          console.log(`   Male_over_14: ${data.Male_over_14 || 0}`);
          console.log(`   Female_over_14: ${data.Female_over_14 || 0}`);
        } else {
          console.log(`⚠️  No data returned (this might be normal if no patients match the criteria)`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[1]}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testIndicator6();

