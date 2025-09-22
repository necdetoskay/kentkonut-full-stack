/**
 * Mod Geçiş Scripti
 * Bu script, uygulama modunu development ve production arasında değiştirir.
 * 
 * Kullanım:
 * node scripts/switch-mode.js dev    # Development moduna geçiş
 * node scripts/switch-mode.js prod   # Production moduna geçiş
 * node scripts/switch-mode.js dev --restart   # Development moduna geçiş ve servisleri otomatik başlat
 * node scripts/switch-mode.js prod --restart  # Production moduna geçiş ve servisleri otomatik başlat
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const mode = args[0]?.toLowerCase();
const autoRestart = args.includes('--restart');

// Geçerli mod kontrolü
if (mode !== 'dev' && mode !== 'prod' && mode !== 'development' && mode !== 'production') {
  console.error('Hata: Geçerli bir mod belirtmelisiniz (development/dev veya production/prod)');
  console.log('Kullanım: node scripts/switch-mode.js development|production|dev|prod [--restart]');
  process.exit(1);
}

// Kısa isimleri tam isimlere dönüştür
const normalizedMode = mode === 'dev' ? 'development' : (mode === 'prod' ? 'production' : mode);

// Proje kök dizini
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(rootDir, 'kentkonut-backend');

// Kaynak ve hedef dosya yolları
const sourceEnvFile = path.resolve(rootDir, normalizedMode === 'development' ? '.env.development' : '.env.production');
const targetEnvFile = path.resolve(rootDir, '.env');

// Backend .env dosyaları
const backendSourceEnvFile = path.resolve(backendDir, normalizedMode === 'development' ? '.env.development' : '.env.production');
const backendTargetEnvFile = path.resolve(backendDir, '.env');

// Backend .env dosyalarını güncelleme fonksiyonu
function updateBackendEnvFiles() {
  try {
    // Backend .env dosyasını kopyala
    if (fs.existsSync(backendSourceEnvFile)) {
      fs.copyFileSync(backendSourceEnvFile, backendTargetEnvFile);
      console.log(`✅ Backend ${normalizedMode} .env dosyası kopyalandı`);
    }
    
    // Development modunda backend .env.development dosyasını localhost olarak güncelle
    if (normalizedMode === 'development') {
      const backendDevEnvPath = path.resolve(backendDir, '.env.development');
      if (fs.existsSync(backendDevEnvPath)) {
        let envContent = fs.readFileSync(backendDevEnvPath, 'utf8');
        
        // NEXTAUTH URL'lerini localhost olarak güncelle
        envContent = envContent.replace(/NEXTAUTH_URL=http:\/\/172\.41\.42\.51:3021/g, 'NEXTAUTH_URL=http://localhost:3021');
        envContent = envContent.replace(/NEXTAUTH_URL_INTERNAL=http:\/\/172\.41\.42\.51:3021/g, 'NEXTAUTH_URL_INTERNAL=http://localhost:3021');
        envContent = envContent.replace(/NEXT_PUBLIC_API_URL=http:\/\/172\.41\.42\.51:3021/g, 'NEXT_PUBLIC_API_URL=http://localhost:3021');
        
        fs.writeFileSync(backendDevEnvPath, envContent);
        console.log('✅ Backend development .env dosyası localhost olarak güncellendi');
      }
    }
    
    // Production modunda backend .env.production dosyasını IP adresi olarak güncelle
    if (normalizedMode === 'production') {
      const backendProdEnvPath = path.resolve(backendDir, '.env.production');
      if (fs.existsSync(backendProdEnvPath)) {
        let envContent = fs.readFileSync(backendProdEnvPath, 'utf8');
        
        // NEXTAUTH URL'lerini IP adresi olarak güncelle
        envContent = envContent.replace(/NEXTAUTH_URL=http:\/\/localhost:3021/g, 'NEXTAUTH_URL=http://172.41.42.51:3021');
        envContent = envContent.replace(/NEXTAUTH_URL_INTERNAL=http:\/\/localhost:3021/g, 'NEXTAUTH_URL_INTERNAL=http://172.41.42.51:3021');
        envContent = envContent.replace(/NEXT_PUBLIC_API_URL=http:\/\/localhost:3021/g, 'NEXT_PUBLIC_API_URL=http://172.41.42.51:3021');
        
        fs.writeFileSync(backendProdEnvPath, envContent);
        console.log('✅ Backend production .env dosyası IP adresi olarak güncellendi');
      }
    }
  } catch (error) {
    console.error(`❌ Backend .env dosyası güncelleme hatası: ${error.message}`);
  }
}

// Servisleri başlatma fonksiyonu
function startServices() {
  console.log('\n🚀 Servisler başlatılıyor...');
  
  try {
    // Frontend servisini başlat
    console.log('\n📱 Frontend servisi başlatılıyor...');
    const frontendPath = path.resolve(rootDir, 'kentkonut-frontend');
    process.chdir(frontendPath);
    execSync('npm run dev', { stdio: 'inherit' });
    
    // Backend servisini başlat
    console.log('\n⚙️ Backend servisi başlatılıyor...');
    const backendPath = path.resolve(rootDir, 'kentkonut-backend');
    process.chdir(backendPath);
    execSync('npm run dev', { stdio: 'inherit' });
    
    console.log('\n✅ Tüm servisler başlatıldı!');
  } catch (error) {
    console.error(`\n❌ Servis başlatma hatası: ${error.message}`);
  }
}

// Servisleri ayrı pencerede başlatma fonksiyonu
function startServicesInSeparateWindows() {
  console.log('\n🚀 Servisler ayrı pencerelerde başlatılıyor...');
  
  try {
    // Frontend servisini başlat
    const frontendPath = path.resolve(rootDir, 'kentkonut-frontend');
    spawn('cmd.exe', ['/c', 'cd', frontendPath, '&&', 'npm', 'run', 'dev'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
      shell: true
    }).unref();
    console.log('📱 Frontend servisi başlatıldı');
    
    // Backend servisini başlat
    const backendPath = path.resolve(rootDir, 'kentkonut-backend');
    spawn('cmd.exe', ['/c', 'cd', backendPath, '&&', 'npm', 'run', 'dev'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
      shell: true
    }).unref();
    console.log('⚙️ Backend servisi başlatıldı');
    
    console.log('\n✅ Tüm servisler ayrı pencerelerde başlatıldı!');
  } catch (error) {
    console.error(`\n❌ Servis başlatma hatası: ${error.message}`);
  }
}

try {
  // .env dosyasını kopyala
  if (fs.existsSync(sourceEnvFile)) {
    fs.copyFileSync(sourceEnvFile, targetEnvFile);
    console.log(`✅ ${normalizedMode} .env dosyası kopyalandı`);
  } else {
    console.error(`❌ Kaynak .env dosyası bulunamadı: ${sourceEnvFile}`);
    process.exit(1);
  }

  // Backend .env dosyalarını güncelle
  updateBackendEnvFiles();

  // Mod değişikliği hakkında bilgi ver
  console.log(`\n🔄 Uygulama ${mode === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION'} moduna geçirildi`);
  
  if (mode === 'dev') {
    console.log('\n📋 Development Modu Bilgileri:');
    console.log('   - Frontend: http://localhost:3020');
    console.log('   - Backend: http://localhost:3021');
    console.log('   - Database: 172.41.42.51:5433');
  } else {
    console.log('\n📋 Production Modu Bilgileri:');
    console.log('   - Frontend: http://172.41.42.51:3020');
    console.log('   - Backend: http://172.41.42.51:3021');
    console.log('   - Database: 172.41.42.51:5433');
  }

  // Otomatik yeniden başlatma kontrolü
  if (autoRestart) {
    startServicesInSeparateWindows();
  } else {
    // Servisleri yeniden başlatma talimatları
    console.log('\n⚠️ Değişikliklerin etkili olması için servisleri yeniden başlatmanız gerekiyor:');
    console.log('   npm run restart:frontend');
    console.log('   npm run restart:backend');
    console.log('\n💡 İpucu: Servisleri otomatik başlatmak için --restart parametresini kullanabilirsiniz:');
    console.log(`   node scripts/switch-mode.js ${mode} --restart`);
  }

} catch (error) {
  console.error(`❌ Hata: ${error.message}`);
  process.exit(1);
}