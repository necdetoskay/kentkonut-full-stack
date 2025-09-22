/**
 * Test script to verify left spacing fix for executive form
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Left Spacing Fix\n');

function testLeftSpacingFix() {
  console.log('Test: Checking left spacing optimization...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  
  if (!fs.existsSync(formPath)) {
    console.log('❌ Executive form page not found');
    return false;
  }
  
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check for optimized spacing
  const hasOptimizedSpacing = content.includes('py-4 pl-6 pr-4 max-w-5xl space-y-6');
  
  // Check that old centered layout is removed
  const hasOldCenteredLayout = content.includes('container mx-auto') || 
                              content.includes('max-w-6xl');
  
  if (!hasOptimizedSpacing) {
    console.log('❌ Optimized left spacing not found');
    return false;
  }
  
  if (hasOldCenteredLayout) {
    console.log('❌ Old centered layout still present');
    return false;
  }
  
  console.log('✅ Left spacing optimized successfully');
  console.log('✅ Content moved closer to left sidebar');
  console.log('✅ Removed unnecessary centering');
  
  return true;
}

// Run the test
if (require.main === module) {
  console.log('🧪 LEFT SPACING OPTIMIZATION VERIFICATION');
  console.log('========================================\n');
  
  if (testLeftSpacingFix()) {
    console.log('\n🎉 SUCCESS! Left spacing has been optimized!');
    console.log('\n📝 Applied changes:');
    console.log('   ✅ Removed container mx-auto centering');
    console.log('   ✅ Added pl-6 for left padding from sidebar');
    console.log('   ✅ Reduced max-width to max-w-5xl');
    console.log('   ✅ Maintained pr-4 for right padding');
    console.log('\n🎯 Benefits:');
    console.log('   • Content closer to left sidebar');
    console.log('   • Reduced unnecessary whitespace');
    console.log('   • Better space utilization');
    console.log('   • More compact, professional layout');
    console.log('\n✨ The executive form now has optimized spacing!');
  } else {
    console.log('\n❌ Left spacing optimization may have issues.');
  }
}

module.exports = { testLeftSpacingFix };
