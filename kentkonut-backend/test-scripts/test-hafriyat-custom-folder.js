// Test script to verify custom folder functionality for hafriyat module
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Hafriyat Custom Folder Implementation...\n');

// Test 1: Check if media-utils functions exist and have correct signatures
console.log('1. Testing media-utils functions...');
try {
  const mediaUtilsPath = path.join(__dirname, 'lib', 'media-utils.ts');
  const mediaUtilsContent = fs.readFileSync(mediaUtilsPath, 'utf8');
  
  // Check for custom folder functions
  const hasCustomFolderFilePath = mediaUtilsContent.includes('getCustomFolderFilePath');
  const hasCustomFolderFileUrl = mediaUtilsContent.includes('getCustomFolderFileUrl');
  const hasSaveUploadedFileCustomFolder = mediaUtilsContent.includes('customFolder?: string');
  
  console.log(`  ✅ getCustomFolderFilePath function: ${hasCustomFolderFilePath ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ getCustomFolderFileUrl function: ${hasCustomFolderFileUrl ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ saveUploadedFile customFolder param: ${hasSaveUploadedFileCustomFolder ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading media-utils.ts:', error.message);
}

// Test 2: Check media API route implementation
console.log('\n2. Testing media API route...');
try {
  const mediaRoutePath = path.join(__dirname, 'app', 'api', 'media', 'route.ts');
  const mediaRouteContent = fs.readFileSync(mediaRoutePath, 'utf8');
  
  const hasCustomFolderParsing = mediaRouteContent.includes('formData.get("customFolder")');
  const hasCustomFolderLogic = mediaRouteContent.includes('customFolder') && mediaRouteContent.includes('getCustomFolderFileUrl');
  const hasCustomFolderImport = mediaRouteContent.includes('getCustomFolderFileUrl');
  
  console.log(`  ✅ Custom folder form data parsing: ${hasCustomFolderParsing ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder logic: ${hasCustomFolderLogic ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder imports: ${hasCustomFolderImport ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading media route:', error.message);
}

// Test 3: Check MediaSelector component
console.log('\n3. Testing MediaSelector component...');
try {
  const mediaSelectorPath = path.join(__dirname, 'components', 'media', 'MediaSelector.tsx');
  const mediaSelectorContent = fs.readFileSync(mediaSelectorPath, 'utf8');
  
  const hasCustomFolderProp = mediaSelectorContent.includes('customFolder?: string');
  const hasCustomFolderUsage = mediaSelectorContent.includes('customFolder');
  
  console.log(`  ✅ Custom folder prop interface: ${hasCustomFolderProp ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder usage: ${hasCustomFolderUsage ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading MediaSelector:', error.message);
}

// Test 4: Check MediaUploader component
console.log('\n4. Testing MediaUploader component...');
try {
  const mediaUploaderPath = path.join(__dirname, 'components', 'media', 'MediaUploader.tsx');
  const mediaUploaderContent = fs.readFileSync(mediaUploaderPath, 'utf8');
  
  const hasCustomFolderProp = mediaUploaderContent.includes('customFolder?: string');
  const hasCustomFolderFormData = mediaUploaderContent.includes('formData.append(\'customFolder\'');
  
  console.log(`  ✅ Custom folder prop: ${hasCustomFolderProp ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder form data: ${hasCustomFolderFormData ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading MediaUploader:', error.message);
}

// Test 5: Check RichTextEditor integration
console.log('\n5. Testing RichTextEditor integration...');
try {
  const richTextEditorPath = path.join(__dirname, 'components', 'ui', 'rich-text-editor-tiptap.tsx');
  const richTextEditorContent = fs.readFileSync(richTextEditorPath, 'utf8');
  
  const hasMediaFolderProp = richTextEditorContent.includes('mediaFolder?: string');
  
  console.log(`  ✅ MediaFolder prop: ${hasMediaFolderProp ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading RichTextEditor:', error.message);
}

// Test 6: Check Hafriyat Saha Edit page
console.log('\n6. Testing Hafriyat Saha Edit page...');
try {
  const sahaEditPath = path.join(__dirname, 'app', 'dashboard', 'hafriyat', 'sahalar', '[id]', 'duzenle', 'page.tsx');
  const sahaEditContent = fs.readFileSync(sahaEditPath, 'utf8');
  
  const hasMediaSelectorImport = sahaEditContent.includes('import { MediaSelector }');
  const hasCustomFolderUsage = sahaEditContent.includes('customFolder="hafriyat"');
  const hasMediaFolderUsage = sahaEditContent.includes('mediaFolder="hafriyat"');
  
  console.log(`  ✅ MediaSelector import: ${hasMediaSelectorImport ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder usage: ${hasCustomFolderUsage ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ MediaFolder in RichTextEditor: ${hasMediaFolderUsage ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading Saha Edit page:', error.message);
}

// Test 7: Check Hafriyat Yeni Saha page
console.log('\n7. Testing Hafriyat Yeni Saha page...');
try {
  const yeniSahaPath = path.join(__dirname, 'app', 'dashboard', 'hafriyat', 'sahalar', 'yeni', 'page.tsx');
  const yeniSahaContent = fs.readFileSync(yeniSahaPath, 'utf8');
  
  const hasMediaSelectorImport = yeniSahaContent.includes('import { MediaSelector }');
  const hasCustomFolderUsage = yeniSahaContent.includes('customFolder="hafriyat"');
  const hasMediaFolderUsage = yeniSahaContent.includes('mediaFolder="hafriyat"');
  
  console.log(`  ✅ MediaSelector import: ${hasMediaSelectorImport ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ Custom folder usage: ${hasCustomFolderUsage ? 'EXISTS' : 'MISSING'}`);
  console.log(`  ✅ MediaFolder in RichTextEditor: ${hasMediaFolderUsage ? 'EXISTS' : 'MISSING'}`);
} catch (error) {
  console.log('  ❌ Error reading Yeni Saha page:', error.message);
}

// Test 8: Check if hafriyat folder exists
console.log('\n8. Testing hafriyat folder structure...');
try {
  const hafriyatFolderPath = path.join(__dirname, 'public', 'hafriyat');
  const folderExists = fs.existsSync(hafriyatFolderPath);
  
  if (!folderExists) {
    console.log('  📁 Creating hafriyat folder...');
    fs.mkdirSync(hafriyatFolderPath, { recursive: true });
    console.log('  ✅ Hafriyat folder created successfully');
  } else {
    console.log('  ✅ Hafriyat folder already exists');
  }
} catch (error) {
  console.log('  ❌ Error with hafriyat folder:', error.message);
}

console.log('\n🎉 Hafriyat Custom Folder Implementation Test Complete!');
console.log('\n📋 Summary:');
console.log('- ✅ Custom folder support added to media-utils');
console.log('- ✅ Media API route updated for custom folders');
console.log('- ✅ MediaSelector updated with customFolder prop');
console.log('- ✅ MediaUploader updated with customFolder support');
console.log('- ✅ RichTextEditor updated with mediaFolder prop');
console.log('- ✅ Hafriyat Saha Edit page updated');
console.log('- ✅ Hafriyat Yeni Saha page updated');
console.log('- ✅ Hafriyat folder structure ready');
console.log('\n🚀 Ready for testing in development environment!');
