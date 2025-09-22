import { z } from 'zod';

/**
 * Environment validation schema using Zod
 * Ensures all required environment variables are present and valid
 */
export const envSchema = z.object({
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
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
  API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('10000'),
  API_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(0).max(10)).default('3'),
  API_RETRY_DELAY: z.string().transform(Number).pipe(z.number().positive()).default('1000'),
  
  // CORS Configuration
  CORS_ALLOWED_ORIGIN: z.string().optional(),
  
  // File Upload Configuration
  UPLOAD_MAX_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  
  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Admin Configuration
  ADMIN_EMAIL: z.string().email('Invalid admin email'),
  ADMIN_PASSWORD: z.string().min(8, 'Admin password must be at least 8 characters'),
  
  // Default URLs
  DEFAULT_BASE_URL: z.string().url('Invalid default base URL').default('https://kentkonut.com'),
  
  // Debug Configuration
  DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
});

/**
 * Validates environment variables and returns typed configuration
 * @param env - Process environment variables
 * @returns Validated and typed environment configuration
 * @throws Error if validation fails
 */
export function validateEnv(env: Record<string, string | undefined>) {
  try {
    const result = envSchema.parse(env);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Type for validated environment configuration
 */
export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates required environment variables for specific features
 */
export const featureValidators = {
  /**
   * Validates database-related environment variables
   */
  database: (env: Record<string, string | undefined>) => {
    const dbSchema = z.object({
      DATABASE_URL: z.string().url('Invalid database URL'),
    });
    return dbSchema.parse(env);
  },
  
  /**
   * Validates Redis-related environment variables
   */
  redis: (env: Record<string, string | undefined>) => {
    const redisSchema = z.object({
      REDIS_HOST: z.string(),
      REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
      REDIS_PASSWORD: z.string().optional(),
    });
    return redisSchema.parse(env);
  },
  
  /**
   * Validates authentication-related environment variables
   */
  auth: (env: Record<string, string | undefined>) => {
    const authSchema = z.object({
      NEXTAUTH_SECRET: z.string().min(32),
      NEXTAUTH_URL: z.string().url(),
      ADMIN_EMAIL: z.string().email(),
      ADMIN_PASSWORD: z.string().min(8),
    });
    return authSchema.parse(env);
  },
  
  /**
   * Validates API-related environment variables
   */
  api: (env: Record<string, string | undefined>) => {
    const apiSchema = z.object({
      NEXT_PUBLIC_API_URL: z.string().url(),
      API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()),
      API_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(0)),
    });
    return apiSchema.parse(env);
  },
};

/**
 * Environment validation middleware for development
 * Logs warnings for missing optional variables
 */
export function validateEnvWithWarnings(env: Record<string, string | undefined>) {
  const validated = validateEnv(env);
  
  // Check for optional but recommended variables
  const warnings: string[] = [];
  
  if (!env.GOOGLE_ANALYTICS_ID && env.NODE_ENV === 'production') {
    warnings.push('GOOGLE_ANALYTICS_ID is not set for production environment');
  }
  
  if (!env.REDIS_PASSWORD && env.NODE_ENV === 'production') {
    warnings.push('REDIS_PASSWORD is not set for production environment');
  }
  
  if (!env.CORS_ALLOWED_ORIGIN && env.NODE_ENV === 'production') {
    warnings.push('CORS_ALLOWED_ORIGIN is not set for production environment');
  }
  
  if (warnings.length > 0) {
    console.warn('Environment validation warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return validated;
}