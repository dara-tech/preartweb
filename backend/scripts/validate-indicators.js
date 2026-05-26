const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration for site-specific testing
const siteCode = '1705'; // Test with site 0201 (Battambang PH)
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: `preart_${siteCode}`, // Use site-specific database
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test parameters (using correct SQL parameter names and Q2 2025 date range)
const TEST_PARAMS = {
  StartDate: '2025-04-01',
  EndDate: '2025-06-30',
  PreviousEndDate: '2025-03-31',
  SiteCode: siteCode,
  lost_code: 0,
  dead_code: 1,
  transfer_out_code: 3,
  transfer_in_code: 1,
  mmd_eligible_code: 0,
  mmd_drug_quantity: 60,
  vl_suppression_threshold: 1000,
  tpt_start_code: 0,
  tpt_complete_code: 1,
  tld_regimen_formula: '3TC + DTG + TDF',
  tpt_drug_list: "'Isoniazid','3HP','6H'"
};

const { INDICATOR_FILE_MAP: INDICATOR_MAP } = require('../src/config/nchadsIndicatorRegistry');

// Load and execute a query
async function executeQuery(queryFile, params) {
  try {
    const queryPath = path.join(__dirname, '../src/queries/indicators', `${queryFile}.sql`);
    
    if (!fs.existsSync(queryPath)) {
      throw new Error(`Query file not found: ${queryPath}`);
    }

    const query = fs.readFileSync(queryPath, 'utf8');
    
    const results = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    return results;
  } catch (error) {
    console.error(`❌ Error executing ${queryFile}:`, error.message);
    throw error;
  }
}

// Compare aggregate vs detail counts
async function compareIndicator(indicatorId, indicatorName) {
  console.log(`\n🔍 Testing Indicator ${indicatorId}: ${indicatorName}`);
  console.log('='.repeat(60));

  try {
    // Run aggregate query
    console.log('📊 Running aggregate query...');
    const aggregateResults = await executeQuery(indicatorName, TEST_PARAMS);
    const aggregateData = aggregateResults[0] || {};

    // Run detail query
    console.log('📋 Running detail query...');
    const detailResults = await executeQuery(`${indicatorName}_details`, TEST_PARAMS);

    // Extract counts
    const aggregateTotal = parseInt(aggregateData.TOTAL || 0);
    const detailCount = detailResults.length;

    // Calculate demographic breakdowns from detail results using typepatients field
    let detailMale014 = 0;
    let detailFemale014 = 0;
    let detailMale15Plus = 0;
    let detailFemale15Plus = 0;

    detailResults.forEach(record => {
      const sex = record.sex;
      const typepatients = record.typepatients;
      
      if (sex === 1) { // Male
        if (typepatients === '≤14') {
          detailMale014++;
        } else if (typepatients === '15+') {
          detailMale15Plus++;
        }
      } else if (sex === 0) { // Female
        if (typepatients === '≤14') {
          detailFemale014++;
        } else if (typepatients === '15+') {
          detailFemale15Plus++;
        }
      }
    });

    // Compare results
    const totalMatch = aggregateTotal === detailCount;
    const male014Match = parseInt(aggregateData.Male_0_14 || 0) === detailMale014;
    const female014Match = parseInt(aggregateData.Female_0_14 || 0) === detailFemale014;
    const male15PlusMatch = parseInt(aggregateData.Male_over_14 || 0) === detailMale15Plus;
    const female15PlusMatch = parseInt(aggregateData.Female_over_14 || 0) === detailFemale15Plus;

    // Display results
    console.log('\n📈 AGGREGATE RESULTS:');
    console.log(`  Total: ${aggregateTotal}`);
    console.log(`  Male 0-14: ${aggregateData.Male_0_14 || 0}`);
    console.log(`  Female 0-14: ${aggregateData.Female_0_14 || 0}`);
    console.log(`  Male 15+: ${aggregateData.Male_over_14 || 0}`);
    console.log(`  Female 15+: ${aggregateData.Female_over_14 || 0}`);

    console.log('\n📋 DETAIL RESULTS:');
    console.log(`  Total Records: ${detailCount}`);
    console.log(`  Male 0-14: ${detailMale014}`);
    console.log(`  Female 0-14: ${detailFemale014}`);
    console.log(`  Male 15+: ${detailMale15Plus}`);
    console.log(`  Female 15+: ${detailFemale15Plus}`);

    console.log('\n✅ COMPARISON:');
    console.log(`  Total Match: ${totalMatch ? '✅' : '❌'} (${aggregateTotal} vs ${detailCount})`);
    console.log(`  Male 0-14 Match: ${male014Match ? '✅' : '❌'} (${aggregateData.Male_0_14 || 0} vs ${detailMale014})`);
    console.log(`  Female 0-14 Match: ${female014Match ? '✅' : '❌'} (${aggregateData.Female_0_14 || 0} vs ${detailFemale014})`);
    console.log(`  Male 15+ Match: ${male15PlusMatch ? '✅' : '❌'} (${aggregateData.Male_over_14 || 0} vs ${detailMale15Plus})`);
    console.log(`  Female 15+ Match: ${female15PlusMatch ? '✅' : '❌'} (${aggregateData.Female_over_14 || 0} vs ${detailFemale15Plus})`);

    const allMatch = totalMatch && male014Match && female014Match && male15PlusMatch && female15PlusMatch;
    console.log(`\n🎯 OVERALL RESULT: ${allMatch ? '✅ ALL MATCH' : '❌ MISMATCH DETECTED'}`);

    return {
      indicatorId,
      indicatorName,
      allMatch,
      aggregateTotal,
      detailCount,
      aggregateData,
      detailCounts: {
        male014: detailMale014,
        female014: detailFemale014,
        male15Plus: detailMale15Plus,
        female15Plus: detailFemale15Plus
      }
    };

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return {
      indicatorId,
      indicatorName,
      allMatch: false,
      error: error.message
    };
  }
}

// Main validation function
async function validateAllIndicators() {
  console.log('🚀 Starting Indicator Validation');
  console.log('================================');
  console.log(`Test Parameters: ${JSON.stringify(TEST_PARAMS, null, 2)}`);
  console.log('');

  const results = [];
  const mismatches = [];

  // Test each indicator
  for (const [indicatorId, indicatorName] of Object.entries(INDICATOR_MAP)) {
    const result = await compareIndicator(indicatorId, indicatorName);
    results.push(result);
    
    if (!result.allMatch && !result.error) {
      mismatches.push(result);
    }
  }

  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=====================');
  
  const totalIndicators = results.length;
  const successfulTests = results.filter(r => !r.error).length;
  const matchingIndicators = results.filter(r => r.allMatch).length;
  const mismatchedIndicators = mismatches.length;

  console.log(`Total Indicators: ${totalIndicators}`);
  console.log(`Successful Tests: ${successfulTests}`);
  console.log(`Matching Indicators: ${matchingIndicators}`);
  console.log(`Mismatched Indicators: ${mismatchedIndicators}`);
  console.log(`Errors: ${totalIndicators - successfulTests}`);

  if (mismatches.length > 0) {
    console.log('\n❌ MISMATCHED INDICATORS:');
    console.log('========================');
    mismatches.forEach(mismatch => {
      console.log(`  ${mismatch.indicatorId}: ${mismatch.indicatorName}`);
      console.log(`    Aggregate Total: ${mismatch.aggregateTotal}`);
      console.log(`    Detail Count: ${mismatch.detailCount}`);
    });
  }

  if (matchingIndicators === successfulTests) {
    console.log('\n🎉 ALL INDICATORS MATCH! Data consistency verified.');
  } else {
    console.log('\n⚠️  Some indicators have mismatches. Review the details above.');
  }

  return results;
}

// Run the validation
if (require.main === module) {
  validateAllIndicators()
    .then(() => {
      console.log('\n✅ Validation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateAllIndicators, compareIndicator };
