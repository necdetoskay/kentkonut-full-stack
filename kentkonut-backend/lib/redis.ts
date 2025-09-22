import { createClient } from 'redis';

// Redis client configuration
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('REDIS_URL environment variable is not set');
}

// Create Redis client
const redis = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Too many reconnection attempts, giving up');
        return false;
      }
      const delay = Math.min(retries * 100, 3000);
      console.log(`Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    }
  }
});

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Redis: Connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis: Ready to accept commands');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error.message);
});

redis.on('end', () => {
  console.log('⚠️ Redis: Connection ended');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

// Enhanced Redis cache class
export class RedisCache {
  private client = redis;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        this.isConnected = true;
      }
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client.isOpen) {
        await this.client.disconnect();
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.client.isOpen;
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

// Export raw client for advanced usage
export { redis };

// Test Redis connection function
export async function testRedisConnection(): Promise<{
  connected: boolean;
  error?: string;
  latency?: number;
}> {
  const startTime = Date.now();
  
  try {
    const cache = new RedisCache();
    const pingResult = await cache.ping();
    const latency = Date.now() - startTime;
    
    if (pingResult) {
      return { connected: true, latency };
    } else {
      return { connected: false, error: 'Ping failed' };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency
    };
  }
}