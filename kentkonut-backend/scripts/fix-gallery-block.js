const fetch = require('node-fetch');

async function fixGalleryBlock() {
  console.log('🔧 Fixing Gallery Block Issue...\n');

  const pageId = 'cmd72line002h7cx5kxcu0ypl';
  const apiUrl = `http://localhost:3010/api/pages/${pageId}`;

  try {
    // 1. Fetch current page content
    console.log('📄 Fetching current page content...');
    const response = await fetch(apiUrl);
    const page = await response.json();
    
    console.log('✅ Page fetched:', page.title);
    
    // 2. Parse current content
    const currentContent = JSON.parse(page.content);
    console.log('📋 Current blocks:', currentContent.blocks.length);
    
    // 3. Create gallery block with the 3 uploaded images
    const galleryBlock = {
      id: `gallery-${Date.now()}`,
      type: 'gallery',
      title: 'Galeri',
      order: 1, // Place after the text block
      isActive: true,
      config: {
        images: [
          {
            url: '/media/1752740427788_gllqt7lx5n.png',
            alt: 'X4 Complete Universe Map Dark',
            caption: 'X4 Complete Universe Map Dark'
          },
          {
            url: '/media/1752740427795_oupecco0fnp.jpg',
            alt: 'Hakkımızda',
            caption: 'Hakkımızda'
          },
          {
            url: '/media/1752740427782_e5p7jxe52h.png',
            alt: 'Prompt',
            caption: 'Prompt'
          }
        ],
        layout: 'grid',
        columns: 3,
        spacing: 'normal'
      }
    };

    // 4. Add gallery block to content
    const newContent = {
      ...currentContent,
      blocks: [
        ...currentContent.blocks,
        galleryBlock
      ],
      updatedAt: new Date().toISOString()
    };

    console.log('🖼️ Created gallery block with 3 images');
    console.log('📸 Images:');
    galleryBlock.config.images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.alt} - ${img.url}`);
    });

    // 5. Update page content
    console.log('\n💾 Updating page content...');
    const updateResponse = await fetch(`${apiUrl}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: JSON.stringify(newContent)
      })
    });

    if (updateResponse.ok) {
      console.log('✅ Gallery block added successfully!');
      console.log('\n🎉 SOLUTION APPLIED:');
      console.log('- Added a proper gallery block to your page');
      console.log('- Included all 3 uploaded images');
      console.log('- Set to grid layout with 3 columns');
      console.log('- Gallery block is active and will display');
      
      console.log('\n📋 Updated Content Structure:');
      newContent.blocks.forEach((block, index) => {
        console.log(`  ${index + 1}. Type: ${block.type}, Title: ${block.title || 'No title'}, Active: ${block.isActive}`);
        if (block.type === 'gallery' && block.config?.images) {
          console.log(`     - Images: ${block.config.images.length}`);
        }
      });
      
      console.log('\n🔗 You can now view your page to see the gallery with all 3 images!');
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ Failed to update page:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixGalleryBlock();
