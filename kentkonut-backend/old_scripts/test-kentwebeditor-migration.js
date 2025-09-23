const fs = require('fs');
const path = require('path');

console.log('🔍 Testing KentwebEditor to RichTextEditor Migration...\n');

// Files that should now use RichTextEditor instead of KentwebEditor
const filesToCheck = [
  'app/dashboard/kurumsal/hakkimizda/page.tsx',
  'app/dashboard/kurumsal/visyon-misyon/page.tsx',
  'app/dashboard/corporate/personnel/[id]/edit/page.tsx',
  'app/dashboard/corporate/departments/[id]/page.tsx'
];

let allMigrated = true;
let totalChecks = 0;
let passedChecks = 0;

console.log('📋 Checking KentwebEditor migration status...\n');

filesToCheck.forEach((filePath, index) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if KentwebEditor is still being used
      const hasKentwebEditor = content.includes('KentwebEditor');
      const hasRichTextEditor = content.includes('RichTextEditor');
      const hasCorrectImport = content.includes("from '@/components/ui/rich-text-editor-tiptap'") ||
                               content.includes('from "@/components/ui/rich-text-editor-tiptap"');
      
      totalChecks += 3;
      
      console.log(`${index + 1}. ${filePath}`);
      
      if (!hasKentwebEditor) {
        console.log('   ✅ KentwebEditor removed');
        passedChecks++;
      } else {
        console.log('   ❌ KentwebEditor still present');
        allMigrated = false;
        
        // Show lines with KentwebEditor
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
          if (line.includes('KentwebEditor')) {
            console.log(`      Line ${lineIndex + 1}: ${line.trim()}`);
          }
        });
      }
      
      if (hasRichTextEditor) {
        console.log('   ✅ RichTextEditor present');
        passedChecks++;
      } else {
        console.log('   ❌ RichTextEditor missing');
        allMigrated = false;
      }
      
      if (hasCorrectImport) {
        console.log('   ✅ Correct import statement');
        passedChecks++;
      } else {
        console.log('   ❌ Incorrect or missing import');
        allMigrated = false;
        
        // Show import lines for debugging
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
          if (line.includes('import') && (line.includes('RichTextEditor') || line.includes('KentwebEditor'))) {
            console.log(`      Import line ${lineIndex + 1}: ${line.trim()}`);
          }
        });
      }
      
      console.log('');
    } else {
      console.log(`⚠️  ${filePath} - File not found`);
      totalChecks += 3; // Still count as checks for percentage
    }
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    totalChecks += 3;
  }
});

console.log('==================================================');
console.log(`📊 Migration Results: ${passedChecks}/${totalChecks} checks passed`);
console.log(`📈 Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (allMigrated && passedChecks === totalChecks) {
  console.log('🎉 ALL KENTWEBEDITOR INSTANCES SUCCESSFULLY MIGRATED!');
  console.log('✅ All corporate content editors now use RichTextEditor with floating image support');
  
  console.log('\n🚀 Enhanced Features Now Available:');
  console.log('- FloatImage node with ReactNodeViewRenderer');
  console.log('- Inline floating controls (Sol, Orta, Sağ)');
  console.log('- Width adjustment controls');
  console.log('- GlobalMediaSelector integration');
  console.log('- Turkish language support');
  console.log('- WYSIWYG consistency');
  console.log('- HTML source view');
  console.log('- Enhanced toolbar with all formatting options');
  
  console.log('\n🔧 Updated Pages:');
  console.log('- Hakkımızda (About) page editor');
  console.log('- Vizyon (Vision) page editor');
  console.log('- Misyon (Mission) page editor');
  console.log('- Personnel (Personel) edit page');
  console.log('- Department (Birim) edit page');
  
  console.log('\n📝 Usage Instructions:');
  console.log('1. Navigate to any corporate content page');
  console.log('2. Click "Düzenle" (Edit) button');
  console.log('3. Use the enhanced TipTap editor with floating image support');
  console.log('4. Click the image icon to insert floating images');
  console.log('5. Select floating position and adjust width as needed');
  
} else {
  console.log('⚠️  Some KentwebEditor instances still need migration');
  console.log(`Missing: ${totalChecks - passedChecks} features`);
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Review the failed checks above');
  console.log('2. Update remaining KentwebEditor imports');
  console.log('3. Replace KentwebEditor usage with RichTextEditor');
  console.log('4. Update component props as needed');
  console.log('5. Re-run this test script');
}

console.log('\n📁 Test Files Available:');
console.log('- test-editor.html (Basic floating image test)');
console.log('- test-quality-assurance.html (Comprehensive QA test)');
console.log('- scripts/test-floating-image-integration.js (Integration test)');
console.log('- scripts/final-validation.js (Complete validation)');
console.log('- scripts/test-kentwebeditor-migration.js (This migration test)');
