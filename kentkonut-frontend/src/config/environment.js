/**
 * Merkezi Konfigürasyon Sistemi
 * Bu dosya, uygulama genelinde kullanılacak ortam değişkenlerini ve konfigürasyonları yönetir.
 */

// Environment konfigürasyonu
const NODE_ENV = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development';

console.log('ENVIRONMENT.JS - Current NODE_ENV:', NODE_ENV);

// Environment-based konfigürasyon
const FRONTEND_HOST = import.meta.env.VITE_FRONTEND_HOST || (NODE_ENV === 'development' ? 'localhost' : '172.41.42.51');
const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT || '3020';
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || (NODE_ENV === 'development' ? 'localhost' : '172.41.42.51');
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '3021';
const DB_HOST = import.meta.env.VITE_DB_HOST || '172.41.42.51';
const DB_PORT = import.meta.env.VITE_DB_PORT || '5433';

console.log('ENVIRONMENT.JS - Using API URL:', `http://${BACKEND_HOST}:${BACKEND_PORT}`);

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
export default config;

// API Base URL'i belirleme
export const getApiBaseUrl = () => {
  return config.backend.url;
};

// API_BASE_URL sabitini doğrudan dışa aktar
export const API_BASE_URL = config.backend.url;
