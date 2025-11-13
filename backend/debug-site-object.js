// Quick debug to see what the site object actually contains
const { siteDatabaseManager } = require('./src/config/siteDatabase');

async function debugSiteObject() {
  try {
    console.log('🔍 DEBUGGING SITE OBJECT');
    console.log('=' .repeat(30));
    
    const sites = await siteDatabaseManager.getAllSites();
    console.log(`Found ${sites.length} sites`);
    
    if (sites.length > 0) {
      const site = sites[0];
      console.log('\n📋 Site object properties:');
      console.log(JSON.stringify(site, null, 2));
      
      console.log('\n🔑 Available properties:');
      Object.keys(site).forEach(key => {
        console.log(`   ${key}: ${site[key]}`);
      });
    } else {
      console.log('❌ No sites found');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugSiteObject();



