// Test script to run all 28 mortality retention indicators and verify they get data
const { siteDatabaseManager } = require('./src/config/siteDatabase');
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 TESTING ALL 28 MORTALITY RETENTION INDICATORS');
console.log('=' .repeat(60));

async function testAll28Indicators() {
  try {
    console.log('📋 Step 1: Getting available sites...');
    
    // Get available sites
    const sites = await siteDatabaseManager.getAllSites();
    console.log(`✅ Found ${sites.length} sites`);
    
    if (sites.length === 0) {
      console.log('❌ NO SITES FOUND - Cannot test indicators');
      console.log('💡 You need to create sites first');
      return;
    }
    
    // Use hardcoded site code 1705 for testing
    const siteCode = '1705';
    console.log(`🎯 Testing with site code: ${siteCode}`);
    
    // Complete parameters for all indicators (matching SQL parameter names)
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
    
    console.log('\n📊 Step 2: Testing all 28 indicators...');
    console.log('Parameters:', JSON.stringify(params, null, 2));
    
    // All 28 indicators
    const allIndicators = [
      // 5.7.1 Mortality indicators and re-engage into care indicators (4)
      { id: '1_percentage_died', name: 'Percentage of ART patients who died' },
      { id: '2_percentage_lost_to_followup', name: 'Percentage of ART patients who were lost to follow-up' },
      { id: '3_reengaged_within_28_days', name: 'Percentage reengaged within 28 days' },
      { id: '4_reengaged_over_28_days', name: 'Percentage reengaged over 28 days' },
      
      // 5.7.2 Visit status indicators (4)
      { id: '5a_late_visits_beyond_buffer', name: 'Late visits beyond ARV supply buffer date' },
      { id: '5b_late_visits_within_buffer', name: 'Late visits within ARV supply buffer date' },
      { id: '5c_visits_on_schedule', name: 'Visits on schedule among ART patients' },
      { id: '5d_early_visits', name: 'Early visits among ART patients' },
      
      // 5.7.3 Treatment and preventive therapeutic indicators (8)
      { id: '6_same_day_art_initiation', name: 'Same-day ART initiation' },
      { id: '7_baseline_cd4_before_art', name: 'Baseline CD4 count before ART' },
      { id: '8a_cotrimoxazole_prophylaxis', name: 'Cotrimoxazole prophylaxis (CD4<350)' },
      { id: '8b_fluconazole_prophylaxis', name: 'Fluconazole prophylaxis (CD4<100)' },
      { id: '9_mmd_3_months', name: 'MMD ≥ 3 months' },
      { id: '10a_tld_new_initiation', name: 'TLD as 1st line (new initiation)' },
      { id: '10b_tld_cumulative', name: 'TLD as 1st line (cumulative)' },
      { id: '11a_tpt_received', name: 'TPT received (cumulative)' },
      { id: '11b_tpt_completed', name: 'TPT completed (cumulative)' },
      
      // 5.7.4 Viral load indicators (5)
      { id: '12a_vl_testing_coverage', name: 'VL testing coverage (past 12 months)' },
      { id: '12b_vl_monitored_six_months', name: 'VL monitored at six months' },
      { id: '12c_vl_suppression_12_months', name: 'VL suppression at 12 months' },
      { id: '12d_vl_suppression_overall', name: 'Overall VL suppression' },
      { id: '12e_vl_results_10_days', name: 'VL results within 10 days' },
      
      // 5.7.5 Enhanced adherence counseling indicators (3)
      { id: '13a_enhanced_adherence_counseling', name: 'Enhanced adherence counseling' },
      { id: '13b_followup_vl_after_counseling', name: 'Follow-up VL after counseling' },
      { id: '13c_vl_suppression_after_counseling', name: 'VL suppression after counseling' },
      
      // 5.7.6 Switching regimen and Retention indicators (3)
      { id: '14a_first_line_to_second_line', name: 'First line to second line switching' },
      { id: '14b_second_line_to_third_line', name: 'Second line to third line switching' },
      { id: '15_retention_rate', name: 'Retention rate' }
    ];
    
    console.log(`\n🎯 Testing ${allIndicators.length} indicators...`);
    
    let successCount = 0;
    let errorCount = 0;
    let noDataCount = 0;
    const results = [];
    
    for (let i = 0; i < allIndicators.length; i++) {
      const indicator = allIndicators[i];
      console.log(`\n[${i + 1}/28] Testing: ${indicator.name}`);
      console.log(`   ID: ${indicator.id}`);
      
      try {
        const result = await mortalityRetentionIndicators.executeIndicator(
          siteCode,
          indicator.id,
          params,
          false // Don't use cache
        );
        
        if (result.data && result.data.length > 0) {
          const data = result.data[0];
          console.log(`   ✅ SUCCESS - Has data`);
          console.log(`   📊 Indicator: ${data.Indicator || indicator.name}`);
          
          // Show key metrics
          if (data.Total_Died !== undefined) console.log(`      Total Died: ${data.Total_Died}`);
          if (data.Total_ART_Patients !== undefined) console.log(`      Total ART Patients: ${data.Total_ART_Patients}`);
          if (data.Percentage !== undefined) console.log(`      Percentage: ${data.Percentage}%`);
          if (data.Male_0_14 !== undefined) console.log(`      Male 0-14: ${data.Male_0_14}`);
          if (data.Female_0_14 !== undefined) console.log(`      Female 0-14: ${data.Female_0_14}`);
          if (data.Male_over_14 !== undefined) console.log(`      Male 15+: ${data.Male_over_14}`);
          if (data.Female_over_14 !== undefined) console.log(`      Female 15+: ${data.Female_over_14}`);
          if (data.TOTAL !== undefined) console.log(`      Total: ${data.TOTAL}`);
          
          successCount++;
          results.push({
            indicator: indicator.name,
            id: indicator.id,
            status: 'SUCCESS',
            hasData: true,
            data: data,
            executionTime: result.executionTime
          });
        } else {
          console.log(`   ⚠️  NO DATA - No matching records found`);
          console.log(`      This could mean:`);
          console.log(`      - No patients match the criteria`);
          console.log(`      - Database tables are empty`);
          console.log(`      - Date range has no data`);
          
          noDataCount++;
          results.push({
            indicator: indicator.name,
            id: indicator.id,
            status: 'NO_DATA',
            hasData: false,
            data: null,
            executionTime: result.executionTime
          });
        }
        
        console.log(`   ⏱️  Execution time: ${result.executionTime}ms`);
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        errorCount++;
        results.push({
          indicator: indicator.name,
          id: indicator.id,
          status: 'ERROR',
          hasData: false,
          error: error.message,
          executionTime: 0
        });
      }
    }
    
    // Summary Report
    console.log('\n📊 FINAL RESULTS SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ SUCCESS (Has Data): ${successCount}/28`);
    console.log(`⚠️  NO DATA: ${noDataCount}/28`);
    console.log(`❌ ERRORS: ${errorCount}/28`);
    console.log(`📈 SUCCESS RATE: ${Math.round((successCount / 28) * 100)}%`);
    
    // Results by category
    console.log('\n📋 RESULTS BY CATEGORY:');
    console.log('=' .repeat(40));
    
    const categories = {
      '5.7.1 Mortality & Re-engage (4 indicators)': results.slice(0, 4),
      '5.7.2 Visit Status (4 indicators)': results.slice(4, 8),
      '5.7.3 Treatment & Preventive (8 indicators)': results.slice(8, 16),
      '5.7.4 Viral Load (5 indicators)': results.slice(16, 21),
      '5.7.5 Adherence Counseling (3 indicators)': results.slice(21, 24),
      '5.7.6 Switching & Retention (3 indicators)': results.slice(24, 28)
    };
    
    Object.entries(categories).forEach(([category, categoryResults]) => {
      const success = categoryResults.filter(r => r.status === 'SUCCESS').length;
      const noData = categoryResults.filter(r => r.status === 'NO_DATA').length;
      const errors = categoryResults.filter(r => r.status === 'ERROR').length;
      
      console.log(`\n${category}:`);
      console.log(`   ✅ Success: ${success}/${categoryResults.length}`);
      console.log(`   ⚠️  No Data: ${noData}/${categoryResults.length}`);
      console.log(`   ❌ Errors: ${errors}/${categoryResults.length}`);
    });
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('=' .repeat(60));
    results.forEach((result, index) => {
      const status = result.status === 'SUCCESS' ? '✅' : result.status === 'NO_DATA' ? '⚠️' : '❌';
      console.log(`${index + 1}. ${status} ${result.indicator} (${result.id})`);
      if (result.status === 'ERROR') {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('=' .repeat(60));
    
    if (successCount === 28) {
      console.log('🎉 PERFECT! All 28 indicators are working and returning data!');
    } else if (successCount > 20) {
      console.log('✅ GOOD! Most indicators are working. Some may not have data due to:');
      console.log('   - No patients in the selected date range');
      console.log('   - Empty database tables');
      console.log('   - Specific criteria not met');
    } else if (successCount > 10) {
      console.log('⚠️  PARTIAL SUCCESS. Some indicators work, others need attention:');
      console.log('   - Check database for missing tables/columns');
      console.log('   - Verify patient data exists');
      console.log('   - Check SQL queries for errors');
    } else {
      console.log('❌ MAJOR ISSUES FOUND:');
      console.log('   - Most indicators are not working');
      console.log('   - Check database connection');
      console.log('   - Verify site configuration');
      console.log('   - Check for missing tables');
    }
    
    if (errorCount > 0) {
      console.log('\n❌ INDICATORS WITH ERRORS:');
      results.filter(r => r.status === 'ERROR').forEach(result => {
        console.log(`   - ${result.indicator}: ${result.error}`);
      });
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('=' .repeat(40));
    console.log('1. If success rate < 80%: Check database and site configuration');
    console.log('2. If no data: Import patient data or check date ranges');
    console.log('3. If errors: Fix SQL queries or database issues');
    console.log('4. Test in frontend: http://localhost:5173 > Analytics > Mortality & Retention');
    
  } catch (error) {
    console.log('❌ FATAL ERROR:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Run the test
testAll28Indicators().catch(console.error);
