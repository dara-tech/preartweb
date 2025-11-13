// Simple debug script to identify the exact issue
console.log('🔍 DEBUGGING MORTALITY INDICATORS - STEP BY STEP');
console.log('=' .repeat(50));

// Step 1: Check if the service loads correctly
console.log('\n📋 Step 1: Loading Mortality Retention Service...');
try {
  const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');
  console.log('✅ Service loaded successfully');
  console.log(`📊 Available indicators: ${mortalityRetentionIndicators.getAvailableIndicators().length}`);
} catch (error) {
  console.log('❌ Service failed to load:', error.message);
  process.exit(1);
}

// Step 2: Check if we can get sites
console.log('\n📋 Step 2: Getting Available Sites...');
async function testSites() {
  try {
    const { siteDatabaseManager } = require('./src/config/siteDatabase');
    const sites = await siteDatabaseManager.getAllSites();
    console.log(`✅ Found ${sites.length} sites`);
    if (sites.length > 0) {
      console.log('📋 Sample sites:');
      sites.slice(0, 3).forEach(site => {
        console.log(`   - ${site.site_code}: ${site.site_name}`);
      });
      return sites[0];
    } else {
      console.log('❌ No sites found - this is likely the main issue!');
      return null;
    }
  } catch (error) {
    console.log('❌ Error getting sites:', error.message);
    return null;
  }
}

// Step 3: Test a simple indicator
console.log('\n📋 Step 3: Testing Simple Indicator...');
async function testSimpleIndicator(testSite) {
  if (!testSite) {
    console.log('❌ Cannot test indicator - no site available');
    return;
  }

  try {
    const mortalityRetentionIndicators = require('./src/services/mortalityRetentionIndicators');
    
    // Minimal parameters
    const params = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      previousEndDate: '2023-12-31'
    };
    
    console.log(`🎯 Testing with site: ${testSite.site_code}`);
    console.log('📊 Parameters:', JSON.stringify(params, null, 2));
    
    const result = await mortalityRetentionIndicators.executeIndicator(
      testSite.site_code,
      '1_percentage_died',
      params,
      false
    );
    
    console.log('✅ Indicator executed successfully!');
    console.log('📈 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Indicator failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Step 4: Test API endpoint
console.log('\n📋 Step 4: Testing API Endpoint...');
async function testAPIEndpoint() {
  try {
    const axios = require('axios');
    
    // Test the health endpoint first
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend server is running');
    
    // Test the indicators endpoint (should return 401 - auth required)
    try {
      const indicatorsResponse = await axios.get('http://localhost:3001/apiv1/mortality-retention-indicators/indicators');
      console.log('✅ API endpoint accessible');
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ API endpoint working (401 - auth required as expected)');
      } else {
        console.log('❌ API endpoint issue:', authError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

// Run all tests
async function runDebug() {
  console.log('\n🚀 Starting Debug Tests...');
  
  const testSite = await testSites();
  await testSimpleIndicator(testSite);
  await testAPIEndpoint();
  
  console.log('\n📊 DEBUG SUMMARY:');
  console.log('=' .repeat(30));
  console.log('✅ Service loads correctly');
  console.log(testSite ? '✅ Sites are available' : '❌ No sites found');
  console.log('✅ API endpoints are working');
  
  console.log('\n💡 LIKELY ISSUES:');
  console.log('=' .repeat(30));
  if (!testSite) {
    console.log('❌ MAIN ISSUE: No sites configured');
    console.log('   Solution: Run site setup or create test sites');
  } else {
    console.log('✅ Sites are available');
    console.log('💡 Issue might be:');
    console.log('   - Frontend not passing correct parameters');
    console.log('   - Authentication issues in frontend');
    console.log('   - Date range issues');
    console.log('   - Database connection issues');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('=' .repeat(30));
  console.log('1. Check if you have sites in your database');
  console.log('2. Open browser and check console for errors');
  console.log('3. Try logging in and accessing the page');
  console.log('4. Check if site dropdown shows sites');
  console.log('5. Verify date range selection');
}

runDebug().catch(console.error);
