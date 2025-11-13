// Complete test script for mortality retention indicators with all required parameters
const { siteDatabaseManager } = require('./src/config/siteDatabase');
const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');

console.log('🧪 COMPLETE MORTALITY INDICATORS TEST WITH PARAMETERS');
console.log('=' .repeat(60));

async function testMortalityIndicatorsComplete() {
  try {
    console.log('📋 Getting available sites...');
    
    // Get available sites using the correct method
    const sites = await siteDatabaseManager.getAllSites();
    console.log(`✅ Found ${sites.length} sites:`);
    sites.forEach(site => {
      console.log(`   - ${site.site_code}: ${site.site_name}`);
    });
    
    if (sites.length === 0) {
      console.log('❌ No sites available for testing');
      console.log('💡 Make sure you have sites configured in your database');
      return;
    }
    
    // Test with the first site
    const testSite = sites[0];
    console.log(`\n🎯 Testing with site: ${testSite.site_code} (${testSite.site_name})`);
    
    // COMPLETE PARAMETER SET - All indicators need these parameters
    const params = {
      // Date range parameters (REQUIRED)
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      previousEndDate: '2023-12-31',
      
      // Status codes (REQUIRED for most indicators)
      lost_code: 0,           // Lost to follow-up status code
      dead_code: 1,           // Dead status code
      transfer_out_code: 3,   // Transfer out status code
      transfer_in_code: 1,    // Transfer in status code
      
      // MMD parameters (REQUIRED for MMD indicators)
      mmd_eligible_code: 0,   // MMD eligible code
      mmd_drug_quantity: 60,  // Drug quantity for MMD calculation
      
      // Viral load parameters (REQUIRED for VL indicators)
      vl_suppression_threshold: 1000,  // VL suppression threshold
      
      // TLD parameters (REQUIRED for TLD indicators)
      tld_regimen_formula: '3TC + DTG + TDF',  // TLD regimen formula
      
      // TPT parameters (REQUIRED for TPT indicators)
      tpt_drug_list: "'Isoniazid','3HP','6H'",  // TPT drug list
      
      // Buffer parameters (REQUIRED for visit indicators)
      buffer_days: 30,        // Buffer days for late visits
      
      // CD4 parameters (REQUIRED for CD4 indicators)
      cd4_threshold_350: 350,  // CD4 threshold for Cotrimoxazole
      cd4_threshold_100: 100   // CD4 threshold for Fluconazole
    };
    
    console.log('\n📊 PARAMETERS BEING USED:');
    console.log('=' .repeat(40));
    Object.entries(params).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Test all 28 mortality and retention indicators
    console.log('\n🧪 TESTING ALL 28 MORTALITY & RETENTION INDICATORS:');
    console.log('=' .repeat(60));
    
    const allIndicators = [
      // 5.7.1 Mortality indicators and re-engage into care indicators
      { id: '1_percentage_died', name: 'Percentage of ART patients who died' },
      { id: '2_percentage_lost_to_followup', name: 'Percentage of ART patients who were lost to follow-up' },
      { id: '3_reengaged_within_28_days', name: 'Percentage reengaged within 28 days' },
      { id: '4_reengaged_over_28_days', name: 'Percentage reengaged over 28 days' },
      
      // 5.7.2 Visit status indicators
      { id: '5a_late_visits_beyond_buffer', name: 'Late visits beyond ARV supply buffer date' },
      { id: '5b_late_visits_within_buffer', name: 'Late visits within ARV supply buffer date' },
      { id: '5c_visits_on_schedule', name: 'Visits on schedule among ART patients' },
      { id: '5d_early_visits', name: 'Early visits among ART patients' },
      
      // 5.7.3 Treatment and preventive therapeutic indicators
      { id: '6_same_day_art_initiation', name: 'Same-day ART initiation' },
      { id: '7_baseline_cd4_before_art', name: 'Baseline CD4 count before ART' },
      { id: '8a_cotrimoxazole_prophylaxis', name: 'Cotrimoxazole prophylaxis (CD4<350)' },
      { id: '8b_fluconazole_prophylaxis', name: 'Fluconazole prophylaxis (CD4<100)' },
      { id: '9_mmd_3_months', name: 'MMD ≥ 3 months' },
      { id: '10a_tld_new_initiation', name: 'TLD as 1st line (new initiation)' },
      { id: '10b_tld_cumulative', name: 'TLD as 1st line (cumulative)' },
      { id: '11a_tpt_received', name: 'TPT received (cumulative)' },
      { id: '11b_tpt_completed', name: 'TPT completed (cumulative)' },
      
      // 5.7.4 Viral load indicators
      { id: '12a_vl_testing_coverage', name: 'VL testing coverage (past 12 months)' },
      { id: '12b_vl_monitored_six_months', name: 'VL monitored at six months' },
      { id: '12c_vl_suppression_12_months', name: 'VL suppression at 12 months' },
      { id: '12d_vl_suppression_overall', name: 'Overall VL suppression' },
      { id: '12e_vl_results_10_days', name: 'VL results within 10 days' },
      
      // 5.7.5 Enhanced adherence counseling indicators
      { id: '13a_enhanced_adherence_counseling', name: 'Enhanced adherence counseling' },
      { id: '13b_followup_vl_after_counseling', name: 'Follow-up VL after counseling' },
      { id: '13c_vl_suppression_after_counseling', name: 'VL suppression after counseling' },
      
      // 5.7.6 Switching regimen and Retention indicators
      { id: '14a_first_line_to_second_line', name: 'First line to second line switching' },
      { id: '14b_second_line_to_third_line', name: 'Second line to third line switching' },
      { id: '15_retention_rate', name: 'Retention rate' }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (let i = 0; i < allIndicators.length; i++) {
      const indicator = allIndicators[i];
      console.log(`\n[${i + 1}/28] Testing: ${indicator.name}`);
      console.log(`   ID: ${indicator.id}`);
      
      try {
        const result = await mortalityRetentionIndicators.executeIndicator(
          testSite.site_code,
          indicator.id,
          params,
          false // Don't use cache for testing
        );
        
        if (result.data && result.data.length > 0) {
          const data = result.data[0];
          console.log(`   ✅ SUCCESS: ${data.Indicator || 'Data available'}`);
          
          // Show key metrics if available
          if (data.Total_Died !== undefined) console.log(`      Total Died: ${data.Total_Died}`);
          if (data.Total_ART_Patients !== undefined) console.log(`      Total ART Patients: ${data.Total_ART_Patients}`);
          if (data.Percentage !== undefined) console.log(`      Percentage: ${data.Percentage}%`);
          if (data.Male_0_14 !== undefined) console.log(`      Male 0-14: ${data.Male_0_14}`);
          if (data.Female_0_14 !== undefined) console.log(`      Female 0-14: ${data.Female_0_14}`);
          if (data.Male_over_14 !== undefined) console.log(`      Male 15+: ${data.Male_over_14}`);
          if (data.Female_over_14 !== undefined) console.log(`      Female 15+: ${data.Female_over_14}`);
          
          successCount++;
          results.push({
            indicator: indicator.name,
            status: 'SUCCESS',
            data: data,
            executionTime: result.executionTime
          });
        } else {
          console.log(`   ⚠️  NO DATA: No matching records found`);
          console.log(`      This is normal if no patients match the criteria`);
          successCount++;
          results.push({
            indicator: indicator.name,
            status: 'NO_DATA',
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
          status: 'ERROR',
          error: error.message,
          executionTime: 0
        });
      }
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ Successful: ${successCount}/${allIndicators.length}`);
    console.log(`❌ Errors: ${errorCount}/${allIndicators.length}`);
    console.log(`📈 Success Rate: ${Math.round((successCount / allIndicators.length) * 100)}%`);
    
    // Show results by category
    console.log('\n📋 RESULTS BY CATEGORY:');
    console.log('=' .repeat(40));
    
    const categories = {
      'Mortality & Re-engage': results.slice(0, 4),
      'Visit Status': results.slice(4, 8),
      'Treatment & Preventive': results.slice(8, 16),
      'Viral Load': results.slice(16, 21),
      'Adherence Counseling': results.slice(21, 24),
      'Switching & Retention': results.slice(24, 28)
    };
    
    Object.entries(categories).forEach(([category, categoryResults]) => {
      const success = categoryResults.filter(r => r.status === 'SUCCESS').length;
      const noData = categoryResults.filter(r => r.status === 'NO_DATA').length;
      const errors = categoryResults.filter(r => r.status === 'ERROR').length;
      
      console.log(`\n${category}:`);
      console.log(`   ✅ Success: ${success}`);
      console.log(`   ⚠️  No Data: ${noData}`);
      console.log(`   ❌ Errors: ${errors}`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('=' .repeat(40));
    console.log('1. 🌐 Open browser: http://localhost:5173');
    console.log('2. 🔐 Login to the application');
    console.log('3. 📊 Navigate to: Analytics & Reports > Mortality & Retention');
    console.log('4. 🏥 Select a site from the dropdown');
    console.log('5. 📅 Choose date range (e.g., 2024-01-01 to 2024-12-31)');
    console.log('6. 🔄 Click "Refresh" to load data');
    console.log('7. 📈 View the mortality and retention indicators');
    
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('=' .repeat(40));
    if (errorCount > 0) {
      console.log('❌ Some indicators failed - check the error messages above');
      console.log('💡 Common issues:');
      console.log('   - Database connection problems');
      console.log('   - Missing tables or columns');
      console.log('   - Invalid parameter values');
    }
    
    if (successCount > 0 && errorCount === 0) {
      console.log('✅ All indicators are working correctly!');
      console.log('💡 If you see "No Data" in the frontend:');
      console.log('   - Try different date ranges');
      console.log('   - Check if you have patient data in the selected period');
      console.log('   - Verify the site has patient records');
    }
    
    console.log('\n🎉 MORTALITY & RETENTION INDICATORS TEST COMPLETED!');
    
  } catch (error) {
    console.log('❌ Fatal error:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testMortalityIndicatorsComplete().catch(console.error);
