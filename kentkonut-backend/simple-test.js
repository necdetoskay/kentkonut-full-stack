// Basit Test Script
console.log('🧪 Starting Simple Tests...\n');

// Test 1: Veritabanı bağlantısı
console.log('Test 1: Database connection...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // Basit bir sorgu çalıştır
  prisma.project.findMany({ take: 1 }).then(() => {
    console.log('✅ Database connection successful');
    
    // Test 2: Yeni tabloları kontrol et
    console.log('\nTest 2: Checking new tables...');
    return prisma.projectGallery.findMany({ take: 1 });
  }).then(() => {
    console.log('✅ ProjectGallery table exists');
    return prisma.projectGalleryMedia.findMany({ take: 1 });
  }).then(() => {
    console.log('✅ ProjectGalleryMedia table exists');
    console.log('\n🎉 All basic tests passed!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
