const fs = require('fs');
const path = require('path');

// Kaynak ve hedef dizinleri
const sourceDir = path.join(__dirname, '..', 'public', 'haberler');
const targetDir = path.join(__dirname, '..', 'public', 'uploads', 'haberler');

// Hedef dizini oluştur
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Created target directory:', targetDir);
}

// Kaynak dizini kontrol et
if (!fs.existsSync(sourceDir)) {
  console.log('⚠️ Source directory does not exist:', sourceDir);
  process.exit(0);
}

// Dosyaları taşı
fs.readdirSync(sourceDir).forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    // Dosyayı taşı
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ Moved: ${file}`);
  } catch (error) {
    // Taşıma başarısız olursa kopyala
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied: ${file}`);
    } catch (copyError) {
      console.error(`❌ Failed to move/copy: ${file}`, copyError);
    }
  }
});

console.log('✅ Media file fix completed!'); 