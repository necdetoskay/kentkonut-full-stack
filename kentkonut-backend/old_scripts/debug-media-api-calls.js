const fetch = require('node-fetch');

async function debugMediaAPICalls() {
  console.log('🔍 Debugging Media API Calls...\n');

  try {
    // Test different API call variations to see which one returns data
    
    console.log('1️⃣ Testing API call WITHOUT customFolder (old way):');
    const response1 = await fetch('http://localhost:3010/api/media?page=1&limit=20&sortBy=createdAt&sortOrder=desc&categoryId=5');
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   ✅ Status: ${response1.status}`);
      console.log(`   📊 Results: ${data1.data?.length || 0} items, Total: ${data1.pagination?.total || 0}`);
      if (data1.data && data1.data.length > 0) {
        console.log(`   📸 First item: ${data1.data[0].originalName} - ${data1.data[0].url}`);
      }
    } else {
      console.log(`   ❌ Status: ${response1.status}`);
    }

    console.log('\n2️⃣ Testing API call WITH customFolder=media (new way):');
    const response2 = await fetch('http://localhost:3010/api/media?page=1&limit=20&sortBy=createdAt&sortOrder=desc&categoryId=5&customFolder=media');
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`   ✅ Status: ${response2.status}`);
      console.log(`   📊 Results: ${data2.data?.length || 0} items, Total: ${data2.pagination?.total || 0}`);
      if (data2.data && data2.data.length > 0) {
        console.log(`   📸 First item: ${data2.data[0].originalName} - ${data2.data[0].url}`);
      }
    } else {
      console.log(`   ❌ Status: ${response2.status}`);
    }

    console.log('\n3️⃣ Testing API call with ALL categories (no filter):');
    const response3 = await fetch('http://localhost:3010/api/media?page=1&limit=20&sortBy=createdAt&sortOrder=desc');
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`   ✅ Status: ${response3.status}`);
      console.log(`   📊 Results: ${data3.data?.length || 0} items, Total: ${data3.pagination?.total || 0}`);
      if (data3.data && data3.data.length > 0) {
        console.log(`   📸 First item: ${data3.data[0].originalName} - ${data3.data[0].url} (Category: ${data3.data[0].categoryId})`);
        
        // Show category distribution
        const categoryCount = {};
        data3.data.forEach(item => {
          categoryCount[item.categoryId] = (categoryCount[item.categoryId] || 0) + 1;
        });
        console.log(`   📂 Category distribution:`, categoryCount);
      }
    } else {
      console.log(`   ❌ Status: ${response3.status}`);
    }

    console.log('\n4️⃣ Testing API call with customFolder but no category filter:');
    const response4 = await fetch('http://localhost:3010/api/media?page=1&limit=20&sortBy=createdAt&sortOrder=desc&customFolder=media');
    if (response4.ok) {
      const data4 = await response4.json();
      console.log(`   ✅ Status: ${response4.status}`);
      console.log(`   📊 Results: ${data4.data?.length || 0} items, Total: ${data4.pagination?.total || 0}`);
      if (data4.data && data4.data.length > 0) {
        console.log(`   📸 First item: ${data4.data[0].originalName} - ${data4.data[0].url} (Category: ${data4.data[0].categoryId})`);
      }
    } else {
      console.log(`   ❌ Status: ${response4.status}`);
    }

    console.log('\n🔍 ANALYSIS:');
    console.log('- If test 1 returns data but test 2 doesn\'t: customFolder filter is too restrictive');
    console.log('- If test 3 returns data but tests 1&2 don\'t: category filter is the issue');
    console.log('- If test 4 returns data but test 2 doesn\'t: combination of filters is the issue');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMediaAPICalls();
