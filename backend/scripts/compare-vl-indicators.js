const mortalityRetentionIndicators = require('../src/services/mortalityRetentionIndicators');

async function compareVLIndicators() {
    const siteCode = '2101';
    const params = {
        StartDate: '2025-07-01',
        EndDate: '2025-09-30',
        PreviousEndDate: '2025-06-30'
    };

    console.log('🔍 Comparing VL Indicators: 12b, 12c, 12d\n');
    console.log('📍 Site:', siteCode);
    console.log('📅 Date Range:', params.StartDate, 'to', params.EndDate);
    console.log('='.repeat(80) + '\n');

    const indicators = [
        { id: '12b_vl_monitored_six_months', name: '12b. VL Monitored at 6 Months' },
        { id: '12c_vl_suppression_12_months', name: '12c. VL Suppression at 12 Months' },
        { id: '12d_vl_suppression_overall', name: '12d. VL Suppression Overall' }
    ];

    const results = {};

    for (const indicator of indicators) {
        console.log(`\n📊 Testing: ${indicator.name} (${indicator.id})`);
        console.log('-'.repeat(80));
        
        try {
            const result = await mortalityRetentionIndicators.executeIndicator(
                siteCode,
                indicator.id,
                params
            );

            if (result && result.data && result.data.length > 0) {
                const data = result.data[0];
                results[indicator.id] = data;
                
                console.log(`✅ Success`);
                console.log(`   TOTAL: ${data.TOTAL || data.VL_Tested_12M || data.VL_Monitored_6M || data.VL_Suppressed_Overall || 0}`);
                console.log(`   Percentage: ${data.Percentage || 0}%`);
                console.log(`   Demographics:`);
                console.log(`     Male 0-14: ${data.Male_0_14 || 0}`);
                console.log(`     Female 0-14: ${data.Female_0_14 || 0}`);
                console.log(`     Male >14: ${data.Male_over_14 || 0}`);
                console.log(`     Female >14: ${data.Female_over_14 || 0}`);
                
                // Show specific fields for each indicator
                if (data.VL_Monitored_6M !== undefined) {
                    console.log(`   VL_Monitored_6M: ${data.VL_Monitored_6M}`);
                    console.log(`   Total_ART_Patients: ${data.Total_ART_Patients || 0}`);
                }
                if (data.VL_Suppressed_12M !== undefined) {
                    console.log(`   VL_Suppressed_12M: ${data.VL_Suppressed_12M}`);
                    console.log(`   VL_Tested_12M: ${data.VL_Tested_12M}`);
                }
                if (data.VL_Suppressed_Overall !== undefined) {
                    console.log(`   VL_Suppressed_Overall: ${data.VL_Suppressed_Overall}`);
                    console.log(`   Total_ART_Patients: ${data.Total_ART_Patients || 0}`);
                }
            } else {
                console.log(`⚠️  No data returned`);
                results[indicator.id] = null;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            results[indicator.id] = { error: error.message };
        }
    }

    // Comparison
    console.log('\n' + '='.repeat(80));
    console.log('📈 COMPARISON SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log('Field-by-field comparison:');
    console.log('-'.repeat(80));
    console.log('Indicator'.padEnd(35) + 'TOTAL'.padEnd(12) + 'Percentage'.padEnd(12) + 'Male>14'.padEnd(12) + 'Female>14');
    console.log('-'.repeat(80));
    
    for (const indicator of indicators) {
        const data = results[indicator.id];
        if (data && !data.error) {
            const total = data.TOTAL || data.VL_Tested_12M || data.VL_Monitored_6M || data.VL_Suppressed_Overall || 0;
            const pct = (data.Percentage || 0).toString();
            const m14 = (data.Male_over_14 || 0).toString();
            const f14 = (data.Female_over_14 || 0).toString();
            console.log(
                indicator.name.substring(0, 34).padEnd(35) + 
                total.toString().padEnd(12) + 
                pct.padEnd(12) + 
                m14.padEnd(12) + 
                f14
            );
        } else {
            console.log(
                indicator.name.substring(0, 34).padEnd(35) + 
                'ERROR'.padEnd(12) + 
                'N/A'.padEnd(12) + 
                'N/A'.padEnd(12) + 
                'N/A'
            );
        }
    }

    // Specific comparisons
    console.log('\n' + '-'.repeat(80));
    console.log('Key Observations:');
    console.log('-'.repeat(80));
    
    if (results['12b_vl_monitored_six_months'] && !results['12b_vl_monitored_six_months'].error) {
        const b = results['12b_vl_monitored_six_months'];
        console.log(`12b: VL Monitored 6M = ${b.VL_Monitored_6M || 0} / Total ART >6M = ${b.Total_ART_Patients || 0}`);
    }
    
    if (results['12c_vl_suppression_12_months'] && !results['12c_vl_suppression_12_months'].error) {
        const c = results['12c_vl_suppression_12_months'];
        console.log(`12c: VL Suppressed 12M = ${c.VL_Suppressed_12M || 0} / VL Tested 12M = ${c.VL_Tested_12M || 0}`);
    }
    
    if (results['12d_vl_suppression_overall'] && !results['12d_vl_suppression_overall'].error) {
        const d = results['12d_vl_suppression_overall'];
        console.log(`12d: VL Suppressed Overall = ${d.VL_Suppressed_Overall || 0} / Total ART >6M = ${d.Total_ART_Patients || 0}`);
    }
    
    console.log('\n' + '='.repeat(80));
}

// Run the comparison
compareVLIndicators()
    .then(() => {
        console.log('\n✅ Comparison completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error running comparison:', error);
        process.exit(1);
    });

