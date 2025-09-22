#!/usr/bin/env node

/**
 * Konfigürasyon Test Scripti
 * Development ve Production modlarını test eder
 */

const fs = require('fs');
const path = require('path');

// Renkli console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
  log('='.repeat(message.length));
}

// Test fonksiyonları
function testEnvironmentConfig() {
  logHeader('Environment Configuration Test');
  
  try {
    // Cache'i temizle
    delete require.cache[require.resolve('../config/environment.js')];
    
    const config = require('../config/environment.js');
    
    logInfo(`Environment: ${config.env}`);
    logInfo(`Frontend: ${config.frontend.url}`);
    logInfo(`Backend: ${config.backend.url}`);
    logInfo(`Database: ${config.database.host}:${config.database.port}`);
    
    // Test development config
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    delete require.cache[require.resolve('../config/environment.js')];
    const devConfig = require('../config/environment.js');
    
    if (devConfig.frontend.host === 'localhost' && 
        devConfig.backend.host === 'localhost' && 
        devConfig.database.host === '172.41.51.51') {
      logSuccess('Development configuration is correct');
    } else {
      logError('Development configuration is incorrect');
      logInfo(`Dev Frontend Host: ${devConfig.frontend.host}`);
      logInfo(`Dev Backend Host: ${devConfig.backend.host}`);
      logInfo(`Dev Database Host: ${devConfig.database.host}`);
    }
    
    // Test production config
    process.env.NODE_ENV = 'production';
    delete require.cache[require.resolve('../config/environment.js')];
    const prodConfig = require('../config/environment.js');
    
    if (prodConfig.frontend.host === '172.41.42.51' && 
        prodConfig.backend.host === '172.41.42.51' && 
        prodConfig.database.host === '172.41.51.51') {
      logSuccess('Production configuration is correct');
    } else {
      logError('Production configuration is incorrect');
      logInfo(`Prod Frontend Host: ${prodConfig.frontend.host}`);
      logInfo(`Prod Backend Host: ${prodConfig.backend.host}`);
      logInfo(`Prod Database Host: ${prodConfig.database.host}`);
    }
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    
    return true;
  } catch (error) {
    logError(`Environment config test failed: ${error.message}`);
    return false;
  }
}

function testPortsConfig() {
  logHeader('Ports Configuration Test');
  
  try {
    const portsConfig = require('../config/ports.json');
    
    // Test development ports
    const devConfig = portsConfig.development;
    if (devConfig.frontend.port === '3020' && 
        devConfig.backend.port === '3021' && 
        devConfig.database.port === '5433') {
      logSuccess('Development ports are correct');
    } else {
      logError('Development ports are incorrect');
      logInfo(`Dev Frontend Port: ${devConfig.frontend.port}`);
      logInfo(`Dev Backend Port: ${devConfig.backend.port}`);
      logInfo(`Dev Database Port: ${devConfig.database.port}`);
    }
    
    // Test production ports
    const prodConfig = portsConfig.production;
    if (prodConfig.frontend.port === '3020' && 
        prodConfig.backend.port === '3021' && 
        prodConfig.database.port === '5433') {
      logSuccess('Production ports are correct');
    } else {
      logError('Production ports are incorrect');
      logInfo(`Prod Frontend Port: ${prodConfig.frontend.port}`);
      logInfo(`Prod Backend Port: ${prodConfig.backend.port}`);
      logInfo(`Prod Database Port: ${prodConfig.database.port}`);
    }
    
    return true;
  } catch (error) {
    logError(`Ports config test failed: ${error.message}`);
    return false;
  }
}

function testFrontendConfig() {
  logHeader('Frontend Configuration Test');
  
  try {
    const frontendPorts = require('../kentkonut-frontend/src/config/ports.json');
    
    // Test development config
    const devConfig = frontendPorts.development;
    if (devConfig.frontend.url.includes('localhost:3020') && 
        devConfig.backend.url.includes('localhost:3021') && 
        devConfig.database.url.includes('172.41.51.51:5433')) {
      logSuccess('Frontend development config is correct');
    } else {
      logError('Frontend development config is incorrect');
      logInfo(`Dev Frontend URL: ${devConfig.frontend.url}`);
      logInfo(`Dev Backend URL: ${devConfig.backend.url}`);
      logInfo(`Dev Database URL: ${devConfig.database.url}`);
    }
    
    // Test production config
    const prodConfig = frontendPorts.production;
    if (prodConfig.frontend.url.includes('172.41.42.51:3020') && 
        prodConfig.backend.url.includes('172.41.42.51:3021') && 
        prodConfig.database.url.includes('172.41.51.51:5433')) {
      logSuccess('Frontend production config is correct');
    } else {
      logError('Frontend production config is incorrect');
      logInfo(`Prod Frontend URL: ${prodConfig.frontend.url}`);
      logInfo(`Prod Backend URL: ${prodConfig.backend.url}`);
      logInfo(`Prod Database URL: ${prodConfig.database.url}`);
    }
    
    return true;
  } catch (error) {
    logError(`Frontend config test failed: ${error.message}`);
    return false;
  }
}

function testBackendConfig() {
  logHeader('Backend Configuration Test');
  
  try {
    // Backend config dosyasını kontrol et
    const backendConfigPath = path.join(__dirname, '../kentkonut-backend/config/ports.ts');
    if (!fs.existsSync(backendConfigPath)) {
      logError('Backend config file not found');
      return false;
    }
    
    // Prisma schema dosyasını kontrol et
    const prismaSchemaPath = path.join(__dirname, '../kentkonut-backend/prisma/schema.prisma');
    if (!fs.existsSync(prismaSchemaPath)) {
      logError('Prisma schema file not found');
      return false;
    }
    
    const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
    if (prismaSchema.includes('172.41.51.51:5433')) {
      logSuccess('Prisma schema database URL is correct');
    } else {
      logError('Prisma schema database URL is incorrect');
    }
    
    logSuccess('Backend configuration files exist');
    return true;
  } catch (error) {
    logError(`Backend config test failed: ${error.message}`);
    return false;
  }
}

function testDockerConfig() {
  logHeader('Docker Configuration Test');
  
  try {
    const dockerComposePath = path.join(__dirname, '../docker-compose.production.yml');
    if (!fs.existsSync(dockerComposePath)) {
      logError('Docker compose file not found');
      return false;
    }
    
    const dockerCompose = fs.readFileSync(dockerComposePath, 'utf8');
    
    // Test if database URL is correct
    if (dockerCompose.includes('172.41.51.51:5433')) {
      logSuccess('Docker database URL is correct');
    } else {
      logError('Docker database URL is incorrect');
    }
    
    // Test if frontend port is correct
    if (dockerCompose.includes('"3020:3020"')) {
      logSuccess('Docker frontend port mapping is correct');
    } else {
      logError('Docker frontend port mapping is incorrect');
    }
    
    // Test if backend port is correct
    if (dockerCompose.includes('"3021:3021"')) {
      logSuccess('Docker backend port mapping is correct');
    } else {
      logError('Docker backend port mapping is incorrect');
    }
    
    return true;
  } catch (error) {
    logError(`Docker config test failed: ${error.message}`);
    return false;
  }
}

function testEnvironmentFiles() {
  logHeader('Environment Files Test');
  
  try {
    // Check if example files exist
    const devExample = fs.existsSync(path.join(__dirname, '../env.development.example'));
    const prodExample = fs.existsSync(path.join(__dirname, '../env.production.example'));
    
    if (devExample) {
      logSuccess('Development environment example file exists');
    } else {
      logWarning('Development environment example file missing');
    }
    
    if (prodExample) {
      logSuccess('Production environment example file exists');
    } else {
      logWarning('Production environment example file missing');
    }
    
    return devExample && prodExample;
  } catch (error) {
    logError(`Environment files test failed: ${error.message}`);
    return false;
  }
}

// Ana test fonksiyonu
function runAllTests() {
  logHeader('KentKonut Configuration Test Suite');
  logInfo('Testing all configuration files and settings...\n');
  
  const tests = [
    { name: 'Environment Config', fn: testEnvironmentConfig },
    { name: 'Ports Config', fn: testPortsConfig },
    { name: 'Frontend Config', fn: testFrontendConfig },
    { name: 'Backend Config', fn: testBackendConfig },
    { name: 'Docker Config', fn: testDockerConfig },
    { name: 'Environment Files', fn: testEnvironmentFiles }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`${test.name} test failed with error: ${error.message}`);
      failed++;
    }
  });
  
  logHeader('Test Results Summary');
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  
  if (failed === 0) {
    logSuccess('All tests passed! Configuration is correct.');
    process.exit(0);
  } else {
    logError('Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testEnvironmentConfig,
  testPortsConfig,
  testFrontendConfig,
  testBackendConfig,
  testDockerConfig,
  testEnvironmentFiles,
  runAllTests
};
