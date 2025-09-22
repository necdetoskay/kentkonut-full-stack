// Test script to verify the custom folder upload flow
const path = require('path');

// Mock the functions from media-utils.ts
function getCategorySubdirectory(categoryName) {
  const normalizedName = categoryName.toLowerCase();

  switch (normalizedName) {
    case 'bannerlar':
      return 'bannerlar';
    case 'haberler':
      return 'haberler';
    case 'projeler':
      return 'projeler';
    default:
      return 'custom';
  }
}

function getMediaFileUrl(filename, categoryName) {
  const subdirectory = getCategorySubdirectory(categoryName);
  return `/uploads/media/${subdirectory}/${filename}`;
}

function getCustomFolderFileUrl(filename, customFolder) {
  return `/${customFolder}/${filename}`;
}

function getCustomFolderFilePath(filename, customFolder) {
  return path.join(process.cwd(), 'public', customFolder, filename);
}

function getMediaFilePath(filename, categoryName) {
  const subdirectory = getCategorySubdirectory(categoryName);
  return path.join(process.cwd(), 'public', 'uploads', 'media', subdirectory, filename);
}

// Test the logic
console.log('=== Testing Custom Folder Logic ===');

const filename = 'test-image.jpg';
const categoryName = 'Bannerlar';
const customFolder = 'hafriyat';

console.log('\n1. Category-based URL (no custom folder):');
console.log('Category:', categoryName);
console.log('Subdirectory:', getCategorySubdirectory(categoryName));
console.log('URL:', getMediaFileUrl(filename, categoryName));
console.log('Path:', getMediaFilePath(filename, categoryName));

console.log('\n2. Custom folder URL:');
console.log('Custom folder:', customFolder);
console.log('URL:', getCustomFolderFileUrl(filename, customFolder));
console.log('Path:', getCustomFolderFilePath(filename, customFolder));

console.log('\n3. API Route Logic Simulation:');
const url = customFolder 
  ? getCustomFolderFileUrl(filename, customFolder)
  : getMediaFileUrl(filename, categoryName);

console.log('Final URL:', url);

console.log('\n4. Expected vs Actual:');
console.log('Expected URL: /hafriyat/test-image.jpg');
console.log('Actual URL:', url);
console.log('Match:', url === '/hafriyat/test-image.jpg');
