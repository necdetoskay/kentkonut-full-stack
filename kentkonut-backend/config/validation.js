const { z } = require('zod');

/**
 * Environment validation schema using Zod
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server Configuration
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3021'),
  HOST: z.string().default('172.41.42.51'),
  
  // Database Configuration
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // Redis Configuration
  REDIS_HOST: z.string().default('172.41.42.51'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // NextAuth Configuration
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),
  NEXTAUTH_URL_INTERNAL: z.string().url('Invalid NEXTAUTH_URL_INTERNAL').optional(),
  
  // Auth Settings
  SESSION_MAX_AGE: z.string().transform(Number).pipe(z.number().positive()).default('2592000'), // 30 days
  USE_SECURE_COOKIES: z.string().transform(val => val === 'true').default('false'),
  SKIP_CSRF_CHECK: z.string().transform(val => val === 'true').default('false'),
  TRUST_HOST: z.string().transform(val => val === 'true').default('true'),
  
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL').optional(),
  API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('10000'),
  API_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(0).max(10)).default('3'),
  API_RETRY_DELAY: z.string().transform(Number).pipe(z.number().positive()).default('1000'),
  
  // CORS Configuration
  CORS_ALLOWED_ORIGIN: z.string().optional(),
  
  // Upload Configuration
  UPLOAD_MAX_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  
  // Analytics Configuration
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Admin Configuration
  ADMIN_EMAIL: z.string().email('Invalid admin email'),
  ADMIN_PASSWORD: z.string().min(8, 'Admin password must be at least 8 characters'),
  
  // Default Configuration
  DEFAULT_BASE_URL: z.string().url('Invalid default base URL').default('https://kentkonut.com'),
  
  // Debug Configuration
  DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
});

/**
 * Validates environment variables and throws on validation errors
 * @param {Record<string, string | undefined>} env - Environment variables object
 * @returns {object} Validated environment variables
 */
function validateEnv(env) {
  try {
    const result = envSchema.parse(env);
    console.log('✅ Environment validation successful');
    return result;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Environment validation failed. Please check your environment variables.');
  }
}

/**
 * Feature-specific validators for modular validation
 */
const featureValidators = {
  /**
   * Validates database-related environment variables
   */
  database: (env) => {
    const dbSchema = envSchema.pick({ DATABASE_URL: true });
    return dbSchema.parse(env);
  },
  
  /**
   * Validates Redis-related environment variables
   */
  redis: (env) => {
    const redisSchema = envSchema.pick({ 
      REDIS_HOST: true, 
      REDIS_PORT: true, 
      REDIS_PASSWORD: true 
    });
    return redisSchema.parse(env);
  },
  
  /**
   * Validates authentication-related environment variables
   */
  auth: (env) => {
    const authSchema = envSchema.pick({ 
      NEXTAUTH_SECRET: true, 
      NEXTAUTH_URL: true, 
      NEXTAUTH_URL_INTERNAL: true,
      SESSION_MAX_AGE: true,
      USE_SECURE_COOKIES: true,
      SKIP_CSRF_CHECK: true,
      TRUST_HOST: true
    });
    return authSchema.parse(env);
  },
  
  /**
   * Validates API-related environment variables
   */
  api: (env) => {
    const apiSchema = envSchema.pick({ 
      NEXT_PUBLIC_API_URL: true, 
      API_TIMEOUT: true, 
      API_RETRY_ATTEMPTS: true, 
      API_RETRY_DELAY: true 
    });
    return apiSchema.parse(env);
  },
};

/**
 * Client-side environment schema (only NEXT_PUBLIC_ variables)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL').optional(),
}).partial();

/**
 * Validates environment variables with detailed warnings instead of throwing
 * @param {Record<string, string | undefined>} env - Environment variables object
 * @returns {object} Validated environment variables with defaults applied
 */
function validateEnvWithWarnings(env) {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Client-side validation - only validate NEXT_PUBLIC_ variables
    try {
      const clientEnv = {};
      Object.keys(env || {}).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          clientEnv[key] = env[key];
        }
      });
      
      const result = clientEnvSchema.parse(clientEnv);
      console.log('✅ Client-side environment validation successful');
      return { ...env, ...result };
    } catch (error) {
      console.warn('⚠️  Client-side environment validation warnings:', error);
      // Return env as-is for client-side to prevent blocking
      return env || {};
    }
  }
  
  // Server-side validation
  try {
    const result = envSchema.parse(env);
    console.log('✅ Environment validation successful');
    return result;
  } catch (error) {
    console.warn('⚠️  Environment validation warnings:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.warn(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    // Try to parse with defaults and continue
    try {
      const safeResult = envSchema.safeParse(env);
      if (safeResult.success) {
        console.log('✅ Using default values for missing environment variables');
        return safeResult.data;
      }
    } catch (fallbackError) {
      console.error('❌ Critical environment validation error:', fallbackError);
    }
    
    throw new Error('Environment validation failed. Please check your environment variables.');
  }
}

module.exports = {
  envSchema,
  validateEnv,
  featureValidators,
  validateEnvWithWarnings,
};