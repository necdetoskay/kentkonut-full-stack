const { getCustomFolderFilePath, getCustomFolderFileUrl, getCategorySubdirectory, getMediaFilePath, getMediaFileUrl } = require('./lib/media-utils');

console.log('🧪 Testing Media Utils Functions\n');

// Test scenario 1: Custom folder (hafriyat)
const filename = 'test-image.jpg';
const customFolder = 'hafriyat';
const categoryName = 'Bannerlar';

console.log('📁 Custom Folder Path Test:');
console.log('customFolder:', customFolder);
console.log('filename:', filename);
console.log('getCustomFolderFilePath:', getCustomFolderFilePath(filename, customFolder));
console.log('getCustomFolderFileUrl:', getCustomFolderFileUrl(filename, customFolder));

console.log('\n📁 Category Path Test:');
console.log('categoryName:', categoryName);
console.log('getCategorySubdirectory:', getCategorySubdirectory(categoryName));
console.log('getMediaFilePath:', getMediaFilePath(filename, categoryName));
console.log('getMediaFileUrl:', getMediaFileUrl(filename, categoryName));

console.log('\n🔍 Normalized Category Name Test:');
console.log('categoryName.toLowerCase():', categoryName.toLowerCase());

// Test all categories
const categories = ['Bannerlar', 'Haberler', 'Projeler', 'Birimler', 'İçerik Resimleri', 'Kurumsal'];
console.log('\n📋 All Category Subdirectory Tests:');
categories.forEach(cat => {
  console.log(`${cat} -> ${getCategorySubdirectory(cat)}`);
});
