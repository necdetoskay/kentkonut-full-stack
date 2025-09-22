// Test script for floating image functionality in the TipTap editor
// Enhanced version with new floating styles

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestHTMLFile() {
  const fs = require('fs');
  const path = require('path');
  
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Floating Image Test - TipTap Editor</title>
      <style>
        /* CSS stilleri - globals.css'den kopyalanan floating stiller */
        .tiptap-image-container {
          display: block;
          margin: 16px 0;
          position: relative;
          width: fit-content;
        }
        
        .tiptap-image-container.tiptap-image-float-left {
          float: left;
          clear: left;
          margin: 0 16px 16px 0;
          max-width: 50%;
        }
        
        .tiptap-image-container.tiptap-image-float-right {
          float: right;
          clear: right;
          margin: 0 0 16px 16px;
          max-width: 50%;
        }
        
        .tiptap-image-container.tiptap-image-float-none {
          float: none;
          clear: both;
          display: block;
          margin: 16px auto;
        }
        
        .tiptap-image-container img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: block;
        }
        
        p:after {
          content: "";
          display: table;
          clear: both;
        }
        
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🖼️ TipTap Editor - Floating Resim Testi</h1>
        
        <h2>1. Sol Float Resim (Text Sarması)</h2>
        <div class="tiptap-image-container tiptap-image-float-left">
          <img src="https://via.placeholder.com/200x150/3b82f6/ffffff?text=Sol+Float" alt="Sol float resim" />
        </div>
        <p>
          Bu paragraf sol tarafa float edilmiş resmin yanında yer alıyor. 
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
          eu fugiat nulla pariatur.
        </p>
        <p>
          Bu ikinci paragraf da aynı şekilde resmin yanında yer alıyor. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
          deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus 
          error sit voluptatem accusantium doloremque laudantium.
        </p>
        
        <h2>2. Sağ Float Resim (Text Sarması)</h2>
        <div class="tiptap-image-container tiptap-image-float-right">
          <img src="https://via.placeholder.com/200x150/10b981/ffffff?text=Sag+Float" alt="Sağ float resim" />
        </div>
        <p>
          Bu paragraf sağ tarafa float edilmiş resmin yanında yer alıyor. 
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
          eu fugiat nulla pariatur.
        </p>
        <p>
          Bu ikinci paragraf da aynı şekilde resmin yanında yer alıyor. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
          deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus 
          error sit voluptatem accusantium doloremque laudantium.
        </p>
        
        <h2>3. Normal Blok Resim (Float Yok)</h2>
        <div class="tiptap-image-container tiptap-image-float-none">
          <img src="https://via.placeholder.com/400x200/f59e0b/ffffff?text=Normal+Blok" alt="Normal blok resim" />
        </div>
        <p>
          Bu paragraf normal blok resmin altında yer alıyor. Resim float özelliği 
          olmadığı için text resmin etrafına sarılmıyor. Bu standart blok seviyesi 
          davranıştır.
        </p>
        
        <h2>4. Test Sonuçları</h2>
        <ul>
          <li>✅ Sol float: Text resmin sağ tarafına sarılıyor</li>
          <li>✅ Sağ float: Text resmin sol tarafına sarılıyor</li>
          <li>✅ Normal blok: Text resmin altında devam ediyor</li>
          <li>✅ Clearfix: Floating sonrası düzgün temizlik</li>
        </ul>
        
        <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <h3>🎯 Editörde Test Etmek İçin:</h3>
          <ol>
            <li>Yeni departman oluşturun</li>
            <li>İçerik alanına text yazın</li>
            <li>Resim ekle butonuna tıklayın</li>
            <li>"Sol Float (Text Sarması)" veya "Sağ Float (Text Sarması)" seçin</li>
            <li>Resmi ekleyin ve text'in etrafına sarıldığını gözlemleyin</li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const outputPath = path.join(__dirname, '..', 'public', 'floating-test.html');
  
  try {
    fs.writeFileSync(outputPath, testHTML);
    console.log('✅ Test HTML dosyası oluşturuldu: /floating-test.html');
    console.log('   Tarayıcıda görüntülemek için: http://localhost:3001/floating-test.html');
    return true;
  } catch (error) {
    console.error('❌ Test dosyası oluşturulamadı:', error.message);
    return false;
  }
}

async function main() {
  console.log('🖼️  Floating Resim Özelliği Test Scripti');
  console.log('==========================================\n');
  
  try {
    console.log('✅ TipTap Editor Floating Özellikleri:');
    console.log('   - Sol Float (Text Sarması): float-left');
    console.log('   - Sağ Float (Text Sarması): float-right');
    console.log('   - Normal Blok: float-none');
    console.log('   - Merkez/Sol/Sağ Blok hizalamaları\n');
    
    // Test HTML dosyası oluştur
    const testFileCreated = await createTestHTMLFile();
    
    if (testFileCreated) {
      console.log('\n🎉 Test dosyası başarıyla oluşturuldu!');
      console.log('\n📋 Test Adımları:');
      console.log('   1. Tarayıcıda ziyaret edin: http://localhost:3001/floating-test.html');
      console.log('   2. Floating stillerin çalıştığını doğrulayın');
      console.log('   3. Editörde test edin:');
      console.log('      - http://localhost:3001/dashboard/corporate/departments/new');
      console.log('      - İçerik alanına text yazın');
      console.log('      - Resim ekle → Float seçeneklerini deneyin');
      console.log('   4. Text sarmasını gözlemleyin\n');
      
      console.log('🎯 Yeni Float Seçenekleri:');
      console.log('   - "Sol Float (Text Sarması)"');
      console.log('   - "Sağ Float (Text Sarması)"');
      console.log('   - Geleneksel blok hizalamaları da korundu\n');
    } else {
      console.log('❌ Test dosyası oluşturulamadı!');
    }
    
  } catch (error) {
    console.error('❌ Test sırasında hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
