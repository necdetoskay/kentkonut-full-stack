// Test script for hafriyat form changes
const testFormFields = async () => {
  console.log('🧪 Testing hafriyat form field changes...\n');

  try {
    // Test 1: Create new saha with minimal required fields
    console.log('📝 Test 1: Creating saha with minimal required fields');
    const minimalSaha = {
      ad: "Test Saha Minimal",
      konumAdi: "Test Konum",
      durum: "DEVAM_EDIYOR",
      ilerlemeyuzdesi: 25,
      tonBasiUcret: 75,
      kdvOrani: 20,
      bolgeId: "1", // Assuming we have a region with ID 1
      enlem: 40.7589,
      boylam: 29.9176
    };

    const response1 = await fetch('http://localhost:3000/api/hafriyat-sahalar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalSaha)
    });

    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Minimal saha created successfully:', result1.data.id);
      
      // Test 2: Create saha with optional fields
      console.log('\n📝 Test 2: Creating saha with optional fields');
      const fullSaha = {
        ad: "Test Saha Full",
        konumAdi: "Test Konum Full",
        durum: "DEVAM_EDIYOR",
        ilerlemeyuzdesi: 50,
        tonBasiUcret: 85,
        kdvOrani: 20,
        bolgeId: "1",
        enlem: 40.7589,
        boylam: 29.9176,
        toplamTon: 1000,
        tamamlananTon: 500,
        baslangicTarihi: new Date('2024-01-15').toISOString(),
        tahminibitisTarihi: new Date('2024-12-31').toISOString(),
        aciklama: "Test açıklama"
      };

      const response2 = await fetch('http://localhost:3000/api/hafriyat-sahalar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSaha)
      });

      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Full saha created successfully:', result2.data.id);

        // Test 3: Update saha with partial data
        console.log('\n📝 Test 3: Updating saha with partial data');
        const updateData = {
          ilerlemeyuzdesi: 75,
          tamamlananTon: 750
        };

        const response3 = await fetch(`http://localhost:3000/api/hafriyat-sahalar/${result2.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        if (response3.ok) {
          const result3 = await response3.json();
          console.log('✅ Saha updated successfully');
          console.log('   Progress:', result3.data.ilerlemeyuzdesi + '%');
          console.log('   Completed tons:', result3.data.tamamlananTon);
        } else {
          console.log('❌ Failed to update saha:', await response3.text());
        }

        // Cleanup: Delete test sahalar
        console.log('\n🧹 Cleaning up test data...');
        await fetch(`http://localhost:3000/api/hafriyat-sahalar/${result1.data.id}`, {
          method: 'DELETE'
        });
        await fetch(`http://localhost:3000/api/hafriyat-sahalar/${result2.data.id}`, {
          method: 'DELETE'
        });
        console.log('✅ Test data cleaned up');

      } else {
        console.log('❌ Failed to create full saha:', await response2.text());
      }
    } else {
      console.log('❌ Failed to create minimal saha:', await response1.text());
    }

    // Test 4: Check that NaN values are handled correctly
    console.log('\n📝 Test 4: Testing NaN handling');
    const nanTestSaha = {
      ad: "Test NaN Handling",
      konumAdi: "Test Konum NaN",
      durum: "DEVAM_EDIYOR",
      ilerlemeyuzdesi: 0,
      tonBasiUcret: 65,
      kdvOrani: 20,
      bolgeId: "1",
      enlem: 40.7589,
      boylam: 29.9176,
      toplamTon: 0, // This should be handled gracefully
      tamamlananTon: 0
    };

    const response4 = await fetch('http://localhost:3000/api/hafriyat-sahalar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nanTestSaha)
    });

    if (response4.ok) {
      const result4 = await response4.json();
      console.log('✅ NaN handling test passed, saha created:', result4.data.id);
      
      // Cleanup
      await fetch(`http://localhost:3000/api/hafriyat-sahalar/${result4.data.id}`, {
        method: 'DELETE'
      });
    } else {
      console.log('❌ NaN handling test failed:', await response4.text());
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }

  console.log('\n🏁 Form field tests completed!');
};

// Check if we have any regions first
const checkPrerequisites = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/hafriyat-bolgeler?aktif=true');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        console.log(`✅ Found ${data.data.length} active regions for testing`);
        return true;
      }
    }
    console.log('❌ No active regions found. Please create a region first.');
    return false;
  } catch (error) {
    console.log('❌ Could not check regions:', error.message);
    return false;
  }
};

// Run tests
checkPrerequisites().then(canRunTests => {
  if (canRunTests) {
    testFormFields();
  }
});
