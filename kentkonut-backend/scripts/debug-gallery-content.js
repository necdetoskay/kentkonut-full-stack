const fetch = require('node-fetch');

async function debugGalleryContent() {
  console.log('🔍 Debugging Gallery Block Issue...\n');

  try {
    // Fetch the page content
    const response = await fetch('http://localhost:3010/api/pages/cmd72line002h7cx5kxcu0ypl');
    const page = await response.json();

    console.log('📄 Page Title:', page.title);
    console.log('📄 Page ID:', page.id);

    // Parse the content
    const content = JSON.parse(page.content);
    console.log('\n📋 Content Structure:');
    console.log('- Version:', content.version);
    console.log('- Blocks Count:', content.blocks.length);

    // Show all blocks first
    console.log('\n📋 All Blocks:');
    content.blocks.forEach((block, index) => {
      console.log(`  ${index + 1}. Type: ${block.type}, ID: ${block.id}, Title: ${block.title || 'No title'}, Active: ${block.isActive}`);
    });

    // Find gallery blocks
    const galleryBlocks = content.blocks.filter(block => block.type === 'gallery');
    console.log('\n🖼️ Gallery Blocks Found:', galleryBlocks.length);

    if (galleryBlocks.length > 0) {
      galleryBlocks.forEach((block, index) => {
        console.log(`\n🖼️ Gallery Block ${index + 1}:`);
        console.log('- Block ID:', block.id);
        console.log('- Block Title:', block.title || 'No title');
        console.log('- Block Active:', block.isActive);
        console.log('- Block Order:', block.order);

        // Show the full block structure for debugging
        console.log('\n📋 Full Block Structure:');
        console.log(JSON.stringify(block, null, 2));

        if (block.config && block.config.images) {
          console.log('\n📸 Images in Gallery:');
          console.log('- Images Count:', block.config.images.length);
          console.log('- Layout:', block.config.layout || 'grid');
          console.log('- Columns:', block.config.columns || 3);
          console.log('- Spacing:', block.config.spacing || 'normal');

          block.config.images.forEach((image, imgIndex) => {
            console.log(`\n  📸 Image ${imgIndex + 1}:`);
            console.log(`    - URL: ${image.url}`);
            console.log(`    - Alt: ${image.alt || 'No alt text'}`);
            console.log(`    - Caption: ${image.caption || 'No caption'}`);
            console.log(`    - Full Image Object:`, JSON.stringify(image, null, 4));
          });

          // Check if there are any issues with the image array
          if (block.config.images.length === 0) {
            console.log('\n⚠️ WARNING: Gallery block has no images in config.images array!');
          } else if (block.config.images.length < 3) {
            console.log(`\n⚠️ WARNING: Expected 3 images but found ${block.config.images.length} images!`);
          } else {
            console.log('\n✅ SUCCESS: All 3 images found in gallery block configuration!');
          }
        } else {
          console.log('\n❌ ERROR: No images configuration found in gallery block!');
          console.log('- block.config exists:', !!block.config);
          if (block.config) {
            console.log('- block.config.images exists:', !!block.config.images);
            console.log('- block.config keys:', Object.keys(block.config));
          }
        }
      });
    } else {
      console.log('\n⚠️ No gallery blocks found in content');

      // Show all blocks for debugging
      console.log('\n📋 All Blocks:');
      content.blocks.forEach((block, index) => {
        console.log(`  ${index + 1}. Type: ${block.type}, ID: ${block.id}, Title: ${block.title || 'No title'}`);
        if (block.type === 'text') {
          // Count images in text content
          const imageMatches = (block.content || '').match(/<img[^>]*>/g);
          const imageCount = imageMatches ? imageMatches.length : 0;
          console.log(`    - Contains ${imageCount} image(s) in text content`);
        }
      });

      console.log('\n💡 SOLUTION:');
      console.log('To create a proper gallery with multiple images:');
      console.log('1. In the page editor, click "İçerik Bloğu Ekle" (Add Content Block)');
      console.log('2. Select "Galeri Bloğu" (Gallery Block) from the block types');
      console.log('3. Use the "Görsel Ekle" button in the gallery block to add multiple images');
      console.log('4. Configure layout, columns, and spacing in the gallery settings');
      console.log('\nCurrently you are using individual images in a text block, not a gallery block.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugGalleryContent();
