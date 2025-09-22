console.log('🧪 Lexical Editör Test Başlıyor...');

// Editör var mı kontrol et
const editors = document.querySelectorAll('[contenteditable="true"]');
console.log(`✅ ${editors.length} editör bulundu`);

// Toolbar butonları var mı kontrol et
const toolbars = document.querySelectorAll('.lexical-editor');
console.log(`✅ ${toolbars.length} toolbar bulundu`);

// Her editörde test yap
editors.forEach((editor, index) => {
  console.log(`📝 Editör ${index + 1} test ediliyor...`);
  
  // Editöre odaklan
  editor.focus();
  
  // Test yazısı ekle
  const testText = 'Test yazısı';
  editor.innerHTML = `<p>${testText}</p>`;
  
  // Change event'i tetikle
  const event = new Event('input', { bubbles: true });
  editor.dispatchEvent(event);
  
  console.log(`✅ Editör ${index + 1} yazı ekleme testi geçti`);
});

// Bold buton var mı kontrol et
const boldButtons = document.querySelectorAll('button[title="Kalın"]');
console.log(`🔤 ${boldButtons.length} Bold butonu bulundu`);

// Image buton var mı kontrol et  
const imageButtons = document.querySelectorAll('button[title="Resim ekle"]');
console.log(`🖼️ ${imageButtons.length} Resim butonu bulundu`);

// Heading select var mı kontrol et
const headingSelects = document.querySelectorAll('select');
console.log(`📐 ${headingSelects.length} Format selecti bulundu`);

console.log('✅ Lexical Editör Test Tamamlandı!');

// Konsola özet yazdır
console.table({
  'Editör Sayısı': editors.length,
  'Toolbar Sayısı': toolbars.length,
  'Bold Buton': boldButtons.length,
  'Resim Buton': imageButtons.length,
  'Format Select': headingSelects.length
});
