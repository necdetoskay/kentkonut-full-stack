// Jest setup file
import { PrismaClient } from '@prisma/client';

// Global test setup
beforeAll(async () => {
  // Test veritabanı bağlantısını kontrol et
  console.log('🧪 Jest test setup initialized');
});

afterAll(async () => {
  // Test sonrası temizlik
  console.log('🧪 Jest test cleanup completed');
});
