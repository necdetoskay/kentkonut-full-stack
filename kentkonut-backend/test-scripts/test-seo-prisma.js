const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSeoFieldsDirectly() {
  console.log('=== PRISMA DIRECT SEO TEST ===\n');
  
  try {
    // Get the first saha
    const sahas = await prisma.hafriyatSaha.findMany({
      take: 1,
      include: {
        bolge: true
      }
    });
    
    if (sahas.length === 0) {
      console.log('❌ No sahas found in database');
      return;
    }
    
    const saha = sahas[0];
    console.log('📋 Found saha:', saha.ad);
    console.log('📋 Current SEO fields:');
    console.log('- seoTitle:', saha.seoTitle || 'null');
    console.log('- seoDescription:', saha.seoDescription || 'null');
    console.log('- seoKeywords:', saha.seoKeywords || 'null');
    console.log('- seoLink:', saha.seoLink || 'null');
    console.log('- seoCanonicalUrl:', saha.seoCanonicalUrl || 'null');
    
    // Update with SEO fields
    const updatedSaha = await prisma.hafriyatSaha.update({
      where: { id: saha.id },
      data: {
        seoTitle: 'Test Direct Update SEO Title',
        seoDescription: 'Test direct update SEO description for verification',
        seoKeywords: 'test, direct, update, keywords',
        seoLink: 'test-direct-update',
        seoCanonicalUrl: 'https://kentkonut.com/hafriyat/test-direct-update'
      }
    });
    
    console.log('\n✅ PRISMA UPDATE completed');
    console.log('📊 Updated SEO fields:');
    console.log('- seoTitle:', updatedSaha.seoTitle || 'null');
    console.log('- seoDescription:', updatedSaha.seoDescription || 'null');
    console.log('- seoKeywords:', updatedSaha.seoKeywords || 'null');
    console.log('- seoLink:', updatedSaha.seoLink || 'null');
    console.log('- seoCanonicalUrl:', updatedSaha.seoCanonicalUrl || 'null');
    
    // Verify with fresh query
    const verifiedSaha = await prisma.hafriyatSaha.findUnique({
      where: { id: saha.id }
    });
    
    console.log('\n🔍 VERIFICATION (fresh query):');
    console.log('- seoTitle:', verifiedSaha.seoTitle || 'null');
    console.log('- seoDescription:', verifiedSaha.seoDescription || 'null');
    console.log('- seoKeywords:', verifiedSaha.seoKeywords || 'null');
    console.log('- seoLink:', verifiedSaha.seoLink || 'null');
    console.log('- seoCanonicalUrl:', verifiedSaha.seoCanonicalUrl || 'null');
    
    const allFieldsCorrect = [
      verifiedSaha.seoTitle === 'Test Direct Update SEO Title',
      verifiedSaha.seoDescription === 'Test direct update SEO description for verification',
      verifiedSaha.seoKeywords === 'test, direct, update, keywords',
      verifiedSaha.seoLink === 'test-direct-update',
      verifiedSaha.seoCanonicalUrl === 'https://kentkonut.com/hafriyat/test-direct-update'
    ];
    
    if (allFieldsCorrect.every(correct => correct)) {
      console.log('\n🎉 ALL SEO FIELDS SAVED CORRECTLY IN DATABASE!');
      console.log('✅ Problem is NOT in database schema or Prisma');
      console.log('🔍 Problem might be in API validation or frontend');
    } else {
      console.log('\n❌ Some SEO fields not saved correctly');
      console.log('❌ Database schema issue detected');
    }
    
  } catch (error) {
    console.error('\n💥 Direct Prisma test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSeoFieldsDirectly();
