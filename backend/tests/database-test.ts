#!/usr/bin/env ts-node

/**
 * Database connectivity test script
 * This tests the database configuration and connection logic without requiring a real database
 */

import { checkDatabaseHealth } from '../src/config/database';

async function testDatabaseConfig() {
  console.log('🧪 Testing database configuration...\n');

  // Test 1: Check environment variables
  console.log('📋 Environment Configuration:');
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT || '5432'}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME || 'brunos_ims'}`);
  console.log(`  DB_USER: ${process.env.DB_USER ? '✅ Set' : '❌ Missing'}`);
  console.log();

  // Test 2: Check database configuration object
  console.log('⚙️  Database Configuration:');
  try {
    const { dbConfig } = await import('../src/config/index');
    console.log(`  Host: ${dbConfig.host}`);
    console.log(`  Port: ${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}`);
    console.log(`  Pool max connections: ${dbConfig.pool.max}`);
    console.log(`  Retry attempts: ${dbConfig.retry.max}`);
    console.log('  ✅ Configuration loaded successfully');
  } catch (error) {
    console.log('  ❌ Configuration loading failed:', error);
  }
  console.log();

  // Test 3: Test health check function (will fail without real DB, but should not crash)
  console.log('🏥 Health Check Function Test:');
  try {
    const health = await checkDatabaseHealth();
    console.log(`  Status: ${health.status}`);
    console.log(`  Message: ${health.message}`);
    console.log(`  Timestamp: ${health.timestamp}`);
    if (health.status === 'healthy') {
      console.log('  ✅ Database connection successful');
    } else {
      console.log('  ⚠️  Database connection failed (expected in test environment)');
    }
  } catch (error) {
    console.log('  ⚠️  Health check failed (expected without real database)');
    console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log();

  // Test 4: Test Prisma client instantiation
  console.log('🔗 Prisma Client Test:');
  try {
    const { default: prisma } = await import('../src/config/database');
    console.log('  ✅ Prisma client instantiated successfully');
    console.log('  📊 Available models:', Object.keys(prisma).filter(key => 
      key.charAt(0) === key.charAt(0).toLowerCase() && 
      !key.startsWith('$') && 
      key !== 'then'
    ).slice(0, 5).join(', ') + '...');
  } catch (error) {
    console.log('  ❌ Prisma client instantiation failed:', error);
  }
  console.log();

  console.log('🎉 Database configuration test completed!');
  console.log('🚀 Ready for database migration and seeding once PostgreSQL is available.');
}

// Run the test
testDatabaseConfig().catch(console.error);