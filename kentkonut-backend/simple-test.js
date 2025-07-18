console.log('Test başlıyor...');

fetch('http://localhost:3000/api/hafriyat-sahalar')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Success:', data.success);
    if (data.success) {
      console.log('✅ API erişilebilir!');
    } else {
      console.log('❌ API hatası:', data.message);
    }
  })
  .catch(error => {
    console.log('❌ Bağlantı hatası:', error.message);
    console.log('Sunucu çalışıyor mu kontrol edin.');
  });
