// Comprehensive diagnostic script to identify why no data is showing
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 DIAGNOSTIC: Why No Data is Showing');
console.log('=' .repeat(60));

// Test 1: Check if the system is accessible
console.log('\n🌐 Test 1: System Accessibility');
const testSystemAccess = () => {
  return new Promise((resolve) => {
    exec('curl -s http://localhost:3001/health', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Backend server not accessible');
        resolve(false);
        return;
      }
      
      try {
        const healthData = JSON.parse(stdout);
        if (healthData.status === 'OK') {
          console.log('✅ Backend server is running');
          resolve(true);
        } else {
          console.log('❌ Backend server not healthy');
          resolve(false);
        }
      } catch (parseError) {
        console.log('❌ Cannot parse health response');
        resolve(false);
      }
    });
  });
};

// Test 2: Check if frontend is accessible
console.log('\n🎨 Test 2: Frontend Accessibility');
const testFrontendAccess = () => {
  return new Promise((resolve) => {
    exec('curl -I http://localhost:5173 2>/dev/null | head -n 1', (error, stdout, stderr) => {
      if (stdout.includes('200 OK')) {
        console.log('✅ Frontend is accessible');
        resolve(true);
      } else {
        console.log('❌ Frontend not accessible');
        resolve(false);
      }
    });
  });
};

// Test 3: Check API endpoints
console.log('\n🔌 Test 3: API Endpoints');
const testAPIEndpoints = () => {
  return new Promise((resolve) => {
    const endpoints = [
      '/apiv1/site-operations/sites',
      '/apiv1/mortality-retention-indicators/indicators'
    ];
    
    let workingEndpoints = 0;
    let totalEndpoints = endpoints.length;
    
    endpoints.forEach((endpoint, index) => {
      exec(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3001${endpoint}`, (error, stdout, stderr) => {
        const statusCode = stdout.trim();
        
        if (statusCode === '401') {
          workingEndpoints++;
          console.log(`✅ ${endpoint}: Working (401 - Auth required)`);
        } else {
          console.log(`❌ ${endpoint}: Not working (${statusCode})`);
        }
        
        if (index === endpoints.length - 1) {
          console.log(`📊 API Endpoints: ${workingEndpoints}/${totalEndpoints} working`);
          resolve(workingEndpoints === totalEndpoints);
        }
      });
    });
  });
};

// Test 4: Check if SQL files exist and are valid
console.log('\n📁 Test 4: SQL Files');
const testSQLFiles = () => {
  const indicatorsPath = path.join(__dirname, 'backend', 'src', 'queries', 'mortality_retention_indicators');
  
  try {
    const files = fs.readdirSync(indicatorsPath);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    
    console.log(`✅ Found ${sqlFiles.length} SQL files`);
    
    // Test a few key files
    const keyFiles = ['1_percentage_died.sql', '2_percentage_lost_to_followup.sql'];
    let validFiles = 0;
    
    keyFiles.forEach(file => {
      const filePath = path.join(indicatorsPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('SELECT') && content.includes('FROM')) {
          validFiles++;
          console.log(`✅ ${file}: Valid SQL`);
        } else {
          console.log(`❌ ${file}: Invalid SQL`);
        }
      } else {
        console.log(`❌ ${file}: Missing`);
      }
    });
    
    console.log(`📊 Key SQL Files: ${validFiles}/${keyFiles.length} valid`);
    return validFiles === keyFiles.length;
    
  } catch (error) {
    console.log('❌ Error checking SQL files:', error.message);
    return false;
  }
};

// Test 5: Check database tables (indirect test)
console.log('\n🗄️  Test 5: Database Structure');
const testDatabaseStructure = () => {
  // We can't directly test the database without credentials,
  // but we can check if the server started successfully
  return new Promise((resolve) => {
    exec('curl -s http://localhost:3001/health', (error, stdout, stderr) => {
      if (!error) {
        try {
          const healthData = JSON.parse(stdout);
          if (healthData.status === 'OK') {
            console.log('✅ Database connection: Healthy (server started successfully)');
            console.log('💡 Note: This means database is connected, but may not have data');
            resolve(true);
          } else {
            console.log('❌ Database connection: Server not healthy');
            resolve(false);
          }
        } catch (parseError) {
          console.log('❌ Database connection: Cannot verify');
          resolve(false);
        }
      } else {
        console.log('❌ Database connection: Server not accessible');
        resolve(false);
      }
    });
  });
};

// Test 6: Check frontend code
console.log('\n🎨 Test 6: Frontend Code');
const testFrontendCode = () => {
  const pagePath = path.join(__dirname, 'frontend', 'src', 'pages', 'MortalityRetentionIndicators.jsx');
  
  if (!fs.existsSync(pagePath)) {
    console.log('❌ MortalityRetentionIndicators page missing');
    return false;
  }
  
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  const requiredComponents = [
    'siteApi.getAllSites()',
    'fetchMortalityRetentionIndicators',
    'ReportConfiguration',
    'selectedSite'
  ];
  
  let componentsFound = 0;
  requiredComponents.forEach(component => {
    if (pageContent.includes(component)) {
      componentsFound++;
      console.log(`✅ ${component}: Found`);
    } else {
      console.log(`❌ ${component}: Missing`);
    }
  });
  
  console.log(`📊 Frontend Components: ${componentsFound}/${requiredComponents.length} found`);
  return componentsFound === requiredComponents.length;
};

// Run all diagnostics
const runDiagnostics = async () => {
  console.log('\n🧪 Running Diagnostics...');
  console.log('=' .repeat(50));
  
  const results = {
    systemAccess: await testSystemAccess(),
    frontendAccess: await testFrontendAccess(),
    apiEndpoints: await testAPIEndpoints(),
    sqlFiles: testSQLFiles(),
    databaseStructure: await testDatabaseStructure(),
    frontendCode: testFrontendCode()
  };
  
  // Calculate overall health
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result === true).length;
  const healthScore = Math.round((passedTests / totalTests) * 100);
  
  // Display results
  console.log('\n📊 DIAGNOSTIC RESULTS:');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  console.log(`\n🎯 System Health: ${healthScore}%`);
  
  // Provide specific guidance based on results
  console.log('\n💡 TROUBLESHOOTING GUIDE:');
  console.log('=' .repeat(50));
  
  if (!results.systemAccess) {
    console.log('❌ Backend Issue:');
    console.log('   1. Start backend server: cd backend && npm start');
    console.log('   2. Check if port 3001 is available');
    console.log('   3. Verify database connection');
  }
  
  if (!results.frontendAccess) {
    console.log('❌ Frontend Issue:');
    console.log('   1. Start frontend: cd frontend && npm run dev');
    console.log('   2. Check if port 5173 is available');
  }
  
  if (!results.apiEndpoints) {
    console.log('❌ API Issue:');
    console.log('   1. Check backend server is running');
    console.log('   2. Verify route registration in server.js');
  }
  
  if (!results.sqlFiles) {
    console.log('❌ SQL Files Issue:');
    console.log('   1. Verify mortality retention indicators folder exists');
    console.log('   2. Check SQL files are properly formatted');
  }
  
  if (!results.databaseStructure) {
    console.log('❌ Database Issue:');
    console.log('   1. Check database connection settings');
    console.log('   2. Verify database server is running');
    console.log('   3. Check database credentials');
  }
  
  if (!results.frontendCode) {
    console.log('❌ Frontend Code Issue:');
    console.log('   1. Check MortalityRetentionIndicators.jsx file');
    console.log('   2. Verify siteApi integration');
  }
  
  // Most likely reasons for "no data"
  console.log('\n🔍 MOST LIKELY REASONS FOR "NO DATA":');
  console.log('=' .repeat(50));
  console.log('1. 📊 No Patient Data in Database:');
  console.log('   - The system is working correctly');
  console.log('   - But there are no patient records in the database');
  console.log('   - Solution: Import patient data or add test data');
  console.log('');
  console.log('2. 🔐 Authentication Issues:');
  console.log('   - User not logged in properly');
  console.log('   - Token expired or invalid');
  console.log('   - Solution: Logout and login again');
  console.log('');
  console.log('3. 🏥 No Sites Available:');
  console.log('   - No sites configured in the system');
  console.log('   - Solution: Check site configuration');
  console.log('');
  console.log('4. 📅 Date Range Issues:');
  console.log('   - Selected date range has no data');
  console.log('   - Solution: Try different date ranges');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('=' .repeat(50));
  console.log('1. Access: http://localhost:5173');
  console.log('2. Login to the application');
  console.log('3. Navigate to: Analytics & Reports > Mortality & Retention');
  console.log('4. Check browser console for errors (F12)');
  console.log('5. Verify sites are loading in dropdown');
  console.log('6. Try different date ranges');
  console.log('7. Check if you have patient data in your database');
  
  if (healthScore >= 80) {
    console.log('\n✅ System is healthy - likely no data in database');
  } else if (healthScore >= 60) {
    console.log('\n⚠️  System has minor issues - check failed components');
  } else {
    console.log('\n❌ System has major issues - fix failed components first');
  }
};

runDiagnostics().catch(console.error);



