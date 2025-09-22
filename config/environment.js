/**
 * Merkezi Konfigürasyon Sistemi
 * Bu dosya, uygulama genelinde kullanılacak ortam değişkenlerini ve konfigürasyonları yönetir.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env dosyasını yükle (varsa)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Ortam değişkenlerinden veya varsayılan değerlerden al
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_HOST = process.env.FRONTEND_HOST || (NODE_ENV === 'development' ? 'localhost' : '172.41.42.51');
const FRONTEND_PORT = process.env.FRONTEND_PORT || '3020';
const BACKEND_HOST = process.env.BACKEND_HOST || (NODE_ENV === 'development' ? 'localhost' : '172.41.42.51');
const BACKEND_PORT = process.env.BACKEND_PORT || '3021';
// Database host'u sabit tut - her iki modda da aynı
const DB_HOST = '172.41.42.51';
const DB_PORT = process.env.DB_PORT || '5433';

// Konfigürasyon nesnesi
const config = {
  env: NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  frontend: {
    host: FRONTEND_HOST,
    port: FRONTEND_PORT,
    url: `http://${FRONTEND_HOST}:${FRONTEND_PORT}`
  },
  backend: {
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    url: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
    cors: {
      origin: [`http://${FRONTEND_HOST}:${FRONTEND_PORT}`],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true
    }
  },
  database: {
    host: DB_HOST,
    port: DB_PORT,
    url: `postgresql://postgres:P@ssw0rd@${DB_HOST}:${DB_PORT}/kentkonutdb`
  }
};

// Konfigürasyonu dışa aktar
module.exports = config;

// Bilgi mesajı
console.log(`[CONFIG] Uygulama ${NODE_ENV} modunda çalışıyor`);
console.log(`[CONFIG] Frontend: ${config.frontend.url}`);
console.log(`[CONFIG] Backend: ${config.backend.url}`);
console.log(`[CONFIG] Database: ${DB_HOST}:${DB_PORT}`);