import { validateEnvWithWarnings, type ValidatedEnv } from './validation';

// Validate and parse environment variables with warnings
const env: ValidatedEnv = validateEnvWithWarnings(process.env as Record<string, string | undefined>);

// Helper function to get allowed CORS origins
function getAllowedOrigins(): string[] {
  if (env.NODE_ENV === 'development') {
    // Development: Allow common frontend ports
    return [
      `http://${env.HOST}:3000`,
      `http://${env.HOST}:3001`, 
      `http://${env.HOST}:3002`,
      `http://${env.HOST}:3020`,
      'http://localhost:3020'
    ];
  }

  // Production: Use environment variable
  if (env.CORS_ALLOWED_ORIGIN) {
    return env.CORS_ALLOWED_ORIGIN.split(',').map(origin => origin.trim());
  }

  // Fallback
  return [`http://${env.HOST}:${env.PORT}`];
}

// Merkezi konfigürasyon objesi
export const ENV_CONFIG = {
  // Environment
  NODE_ENV: env.NODE_ENV,
  IS_DEVELOPMENT: env.NODE_ENV === 'development',
  IS_PRODUCTION: env.NODE_ENV === 'production',
  
  // Server Configuration
  SERVER: {
    HOST: env.HOST,
    PORT: env.PORT,
    FRONTEND_URL: env.NODE_ENV === 'development' 
      ? `http://localhost:3020`
      : `http://${env.HOST}:3020`,
  },
  
  // Database Configuration
  DATABASE: {
    URL: env.DATABASE_URL,
  },
  
  // Redis Configuration
  REDIS: {
    URL: env.REDIS_PASSWORD 
      ? `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`
      : `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
  },
  
  // NextAuth Configuration
  AUTH: {
    SECRET: env.NEXTAUTH_SECRET,
    URL: env.NEXTAUTH_URL,
    URL_INTERNAL: env.NEXTAUTH_URL_INTERNAL || env.NEXTAUTH_URL,
    SESSION_MAX_AGE: env.SESSION_MAX_AGE,
    USE_SECURE_COOKIES: env.USE_SECURE_COOKIES,
    SKIP_CSRF_CHECK: env.SKIP_CSRF_CHECK,
    TRUST_HOST: env.TRUST_HOST,
  },
  
  // API Configuration
  API: {
    BASE_URL: env.NEXT_PUBLIC_API_URL,
    TIMEOUT: env.API_TIMEOUT,
    RETRY_ATTEMPTS: env.API_RETRY_ATTEMPTS,
    RETRY_DELAY: env.API_RETRY_DELAY,
  },
  
  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: getAllowedOrigins(),
  },
  
  // File Upload Configuration
  UPLOAD: {
    MAX_SIZE: env.UPLOAD_MAX_SIZE,
    ALLOWED_TYPES: env.UPLOAD_ALLOWED_TYPES ? env.UPLOAD_ALLOWED_TYPES.split(',') : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  
  // Analytics Configuration
  ANALYTICS: {
    GOOGLE_ID: env.GOOGLE_ANALYTICS_ID,
  },
  
  // Admin Configuration
  ADMIN: {
    EMAIL: env.ADMIN_EMAIL,
    PASSWORD: env.ADMIN_PASSWORD,
  },
  
  // Default URLs
  DEFAULTS: {
    BASE_URL: env.DEFAULT_BASE_URL,
  },
  
  // Debug Configuration
  DEBUG: {
    MODE: env.DEBUG_MODE,
  },
};

// Export validated env for direct access if needed
export { env };



// Port configuration helper (backward compatibility)
export const PORT_CONFIG = {
  FRONTEND_PORT: '3020',
  BACKEND_PORT: env.PORT ? env.PORT.toString() : '3021',
  DATABASE_PORT: '5433',
  REDIS_PORT: env.REDIS_PORT ? env.REDIS_PORT.toString() : '6379',
  PGADMIN_PORT: '8080', // Static port for pgAdmin
};

// Environment info helper functions
export function isDevelopment(): boolean {
  return ENV_CONFIG.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return ENV_CONFIG.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return ENV_CONFIG.NODE_ENV === 'test';
}

// API base URL helper (backward compatibility)
export function getApiBaseUrl(): string {
  return ENV_CONFIG.API.BASE_URL;
}

// Database URL helper (backward compatibility)
export function getDatabaseUrl(): string {
  return ENV_CONFIG.DATABASE.URL;
}

// NextAuth URL helper (backward compatibility)
export function getNextAuthUrl(): string {
  return ENV_CONFIG.AUTH.URL;
}

// Redis URL helper (backward compatibility)
export function getRedisUrl(): string {
  return ENV_CONFIG.REDIS.CONNECTION_STRING;
}

// Environment info helper (backward compatibility)
export function getEnvironmentInfo() {
  return {
    nodeEnv: ENV_CONFIG.NODE_ENV,
    isDevelopment: ENV_CONFIG.isDevelopment,
    isProduction: ENV_CONFIG.isProduction,
    serverHost: ENV_CONFIG.SERVER.HOST,
    serverPort: ENV_CONFIG.SERVER.PORT,
    frontendPort: ENV_CONFIG.SERVER.FRONTEND_PORT,
    databaseUrl: ENV_CONFIG.DATABASE.URL,
    redisUrl: ENV_CONFIG.REDIS.CONNECTION_STRING,
    apiBaseUrl: ENV_CONFIG.API.BASE_URL,
  };
}

// Export default configuration
export default ENV_CONFIG;