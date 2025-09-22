import { config } from 'dotenv';
import fetch from 'node-fetch'; // node-fetch'i import et
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent } from 'http-cookie-agent/http';

// .env dosyasını yükle
config({ path: './kentkonut-backend/.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3021';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@example.com'; // Test admin email'i
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password'; // Test admin şifresi

async function testFooterApi() {
  console.log('API Testi Başlıyor: Footer Yönetimi');
  console.log(`API Base URL: ${API_BASE_URL}`);

  const cookieJar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar: cookieJar } });

  try {
    // Adım 1: next-auth ile oturum açma
    console.log('1. Adım: Oturum açılıyor...');
    const signInResponse = await fetch(`${API_BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      agent: agent, // Çerezleri yakalamak için agent kullan
    });

    if (!signInResponse.ok) {
      const errorText = await signInResponse.text();
      throw new Error(`Oturum açma başarısız: ${signInResponse.status} - ${errorText}`);
    }

    console.log('Oturum açma başarılı. Çerezler alındı.');

    // Adım 2: Yetkilendirilmiş API isteği gönderme
    console.log('2. Adım: /api/admin/footer adresine GET isteği gönderiliyor...');
    const footerApiResponse = await fetch(`${API_BASE_URL}/api/admin/footer`, {
      method: 'GET',
      agent: agent, // Oturum çerezlerini göndermek için agent kullan
    });

    console.log(`API Yanıt Durumu: ${footerApiResponse.status}`);
    const responseData = await footerApiResponse.json();

    if (footerApiResponse.ok) {
      console.log('✅ API Testi Başarılı!');
      console.log('Yanıt Verisi:', JSON.stringify(responseData, null, 2));
    } else {
      console.error('❌ API Testi Başarısız!');
      console.error('Hata Yanıtı:', JSON.stringify(responseData, null, 2));
    }

  } catch (error) {
    console.error('Test sırasında beklenmeyen bir hata oluştu:', error);
  }
}

testFooterApi();
