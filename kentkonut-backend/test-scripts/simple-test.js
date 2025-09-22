console.log('Test başlıyor...');

fetch('http://172.41.42.51:3021/api/hafriyat-sahalar')
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
