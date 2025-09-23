const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Enhanced RichTextEditor with FloatImage Integration...\n');

// Check if the enhanced RichTextEditor has FloatImage support
const richTextEditorPath = path.join(__dirname, '..', 'components/ui/rich-text-editor-tiptap.tsx');

try {
  if (fs.existsSync(richTextEditorPath)) {
    const content = fs.readFileSync(richTextEditorPath, 'utf8');
    
    console.log('📋 Checking RichTextEditor enhancements:');
    
    // Check for FloatImage node
    if (content.includes('const FloatImage = Node.create')) {
      console.log('✅ FloatImage node definition found');
    } else {
      console.log('❌ FloatImage node definition missing');
    }
    
    // Check for ReactNodeViewRenderer
    if (content.includes('ReactNodeViewRenderer')) {
      console.log('✅ ReactNodeViewRenderer import found');
    } else {
      console.log('❌ ReactNodeViewRenderer import missing');
    }
    
    // Check for FloatImageNodeView
    if (content.includes('const FloatImageNodeView')) {
      console.log('✅ FloatImageNodeView component found');
    } else {
      console.log('❌ FloatImageNodeView component missing');
    }
    
    // Check for floating controls
    if (content.includes('float-image-controls')) {
      console.log('✅ Floating image controls found');
    } else {
      console.log('❌ Floating image controls missing');
    }
    
    // Check for ensureAbsoluteUrl import
    if (content.includes("from '@/lib/url-utils'")) {
      console.log('✅ URL utils import found');
    } else {
      console.log('❌ URL utils import missing');
    }
    
    // Check for floating image insertion logic
    if (content.includes('type: \'floatImage\'')) {
      console.log('✅ FloatImage insertion logic found');
    } else {
      console.log('❌ FloatImage insertion logic missing');
    }
    
    // Check for floating alignment options
    if (content.includes('float-left') && content.includes('float-right')) {
      console.log('✅ Floating alignment options found');
    } else {
      console.log('❌ Floating alignment options missing');
    }
    
    // Check for CSS styles
    if (content.includes('.float-image-container')) {
      console.log('✅ Floating image CSS styles found');
    } else {
      console.log('❌ Floating image CSS styles missing');
    }
    
    console.log('\n📊 Integration Summary:');
    
    const checks = [
      content.includes('const FloatImage = Node.create'),
      content.includes('ReactNodeViewRenderer'),
      content.includes('const FloatImageNodeView'),
      content.includes('float-image-controls'),
      content.includes("from '@/lib/url-utils'"),
      content.includes('type: \'floatImage\''),
      content.includes('float-left') && content.includes('float-right'),
      content.includes('.float-image-container')
    ];
    
    const passedChecks = checks.filter(check => check).length;
    const totalChecks = checks.length;
    
    console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 All floating image features successfully integrated!');
      console.log('\n🔧 Next steps:');
      console.log('1. Start the development server: npm run dev');
      console.log('2. Navigate to /dashboard/pages');
      console.log('3. Create or edit a page with TEXT content');
      console.log('4. Test the floating image functionality');
      console.log('5. Verify Turkish character support');
    } else {
      console.log('⚠️  Some floating image features may be missing');
    }
    
  } else {
    console.log('❌ RichTextEditor file not found');
  }
} catch (error) {
  console.error('❌ Error reading RichTextEditor file:', error.message);
}

console.log('\n🧪 Test Content Examples:');
console.log('- Sol float: <img src="..." data-float="left" style="width: 300px;">');
console.log('- Sağ float: <img src="..." data-float="right" style="width: 250px;">');
console.log('- Merkez: <img src="..." data-float="none" style="width: 400px;">');
console.log('- Türkçe: "Şişli\'de güzel bir çiçek bahçesi gördük."');
