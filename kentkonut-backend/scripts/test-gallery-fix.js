console.log('🔧 Testing Gallery Fix...');

const fetch = require('node-fetch');

async function testGalleryFix() {
  try {
    console.log('📄 Fetching page content...');
    const response = await fetch('http://localhost:3010/api/pages/cmd72line002h7cx5kxcu0ypl');
    const page = await response.json();
    
    console.log('Page Title:', page.title);
    
    const content = JSON.parse(page.content);
    console.log('Blocks Count:', content.blocks.length);
    
    content.blocks.forEach((block, index) => {
      console.log(`Block ${index + 1}: Type=${block.type}, Title=${block.title || 'No title'}`);
      if (block.type === 'gallery' && block.config?.images) {
        console.log(`  Gallery Images: ${block.config.images.length}`);
        block.config.images.forEach((img, imgIndex) => {
          console.log(`    ${imgIndex + 1}. ${img.alt} - ${img.url}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGalleryFix();
