// Bu dosya, frontend uygulamasının API URL'sini güncellemek için kullanılacak
// Sunucuda çalıştırılması gereken JavaScript kodu

// API URL'sini 172.41.42.51:3021 olarak ayarla
window.API_BASE_URL = 'http://172.41.42.51:3021';

// localStorage'a kaydet
localStorage.setItem('API_BASE_URL', 'http://172.41.42.51:3021');

console.log('API URL başarıyla güncellendi!');