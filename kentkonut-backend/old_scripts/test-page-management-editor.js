const fs = require('fs');
const path = require('path');

// Test script to verify TipTap editor integration in page management
console.log('🔍 Testing Page Management TipTap Editor Integration...\n');

// Check if all TipTapEditor imports have been replaced with RichTextEditor
const filesToCheck = [
  'app/dashboard/pages/[id]/edit/content/[contentId]/components/ContentFormFields.tsx',
  'app/dashboard/pages/[id]/edit/content/[contentId]/page.tsx',
  'app/dashboard/pages/[id]/edit/content/[contentId]/page-optimized.tsx',
  'app/dashboard/pages/[id]/edit/NewContentEditor.tsx',
  'app/dashboard/pages/[id]/edit/ContentBlock.tsx',
  'app/dashboard/pages/[id]/content/[contentId]/edit/page.tsx',
  'app/dashboard/simple-pages/new/page.tsx',
  'app/dashboard/simple-pages/[id]/edit/page.tsx',
  'components/projects/TabbedProjectForm.tsx'
];

let allFixed = true;

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('TipTapEditor')) {
        console.log(`❌ ${filePath} still contains TipTapEditor references`);
        allFixed = false;
        
        // Show lines with TipTapEditor
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('TipTapEditor')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`);
          }
        });
      } else {
        console.log(`✅ ${filePath} - TipTapEditor references fixed`);
      }
        // Check if RichTextEditor is imported properly
      if (content.includes('RichTextEditor')) {
        // Check for correct import
        if (content.includes("from '@/components/ui/rich-text-editor-tiptap'") ||
            content.includes('from "@/components/ui/rich-text-editor-tiptap"')) {
          console.log(`✅ ${filePath} - RichTextEditor imported correctly`);
        } else {
          console.log(`⚠️  ${filePath} - RichTextEditor used but import might be missing`);
          // Show import lines for debugging
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('RichTextEditor') && line.includes('import')) {
              console.log(`   Import line ${index + 1}: ${line.trim()}`);
            }
          });
          allFixed = false;
        }
      }
    } else {
      console.log(`⚠️  ${filePath} - File not found`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${filePath}: ${error.message}`);
    allFixed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFixed) {
  console.log('🎉 All TipTapEditor references have been successfully replaced!');
  console.log('🔧 The RichTextEditor with floating image support should now be available in page management.');
  console.log('\n📝 To test:');
  console.log('1. Go to Dashboard → Sayfalar');
  console.log('2. Edit an existing page or create a new one');
  console.log('3. Add or edit a TEXT content block');
  console.log('4. Verify that the image icon is visible in the editor toolbar');
  console.log('5. Test the floating image functionality');
} else {
  console.log('❌ Some issues found. Please review the files above.');
}

console.log('\n🔗 Page Management URLs to test:');
console.log('- /dashboard/pages (Page list)');
console.log('- /dashboard/pages/new (Create new page)');
console.log('- /dashboard/pages/[id]/edit (Edit page content)');
console.log('- /dashboard/simple-pages (Simple pages)');

console.log('\n📋 Features to verify:');
console.log('- Image icon visible in TipTap toolbar');
console.log('- Image insertion dialog opens');
console.log('- Floating image options available');
console.log('- GlobalMediaSelector integration works');
console.log('- Live preview shows floating images correctly');
