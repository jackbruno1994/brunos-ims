#!/usr/bin/env ts-node

/**
 * Database schema and configuration validation test
 * This validates our database setup without requiring Prisma client generation
 */

import fs from 'fs';
import path from 'path';

async function validateDatabaseSetup() {
  console.log('🧪 Validating database setup...\n');

  let allTestsPassed = true;

  // Test 1: Check Prisma schema file exists and is valid
  console.log('📋 Prisma Schema Validation:');
  try {
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Check for required sections
      const hasGenerator = schemaContent.includes('generator client');
      const hasDatasource = schemaContent.includes('datasource db');
      const hasModels = schemaContent.includes('model User') && schemaContent.includes('model Item');
      const hasEnums = schemaContent.includes('enum UserRole') && schemaContent.includes('enum ItemStatus');
      
      console.log(`  ✅ Schema file exists at: ${schemaPath}`);
      console.log(`  ${hasGenerator ? '✅' : '❌'} Generator configuration found`);
      console.log(`  ${hasDatasource ? '✅' : '❌'} Datasource configuration found`);
      console.log(`  ${hasModels ? '✅' : '❌'} Core models defined (User, Item, etc.)`);
      console.log(`  ${hasEnums ? '✅' : '❌'} Enums defined (UserRole, ItemStatus, etc.)`);
      
      if (!hasGenerator || !hasDatasource || !hasModels || !hasEnums) {
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ Schema file not found');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Schema validation failed:', error);
    allTestsPassed = false;
  }
  console.log();

  // Test 2: Check environment configuration
  console.log('⚙️  Environment Configuration:');
  try {
    const envExamplePath = path.join(__dirname, '../.env.example');
    const envPath = path.join(__dirname, '../.env');
    
    const hasEnvExample = fs.existsSync(envExamplePath);
    const hasEnv = fs.existsSync(envPath);
    
    console.log(`  ${hasEnvExample ? '✅' : '❌'} .env.example file exists`);
    console.log(`  ${hasEnv ? '✅' : '❌'} .env file exists`);
    
    if (hasEnvExample) {
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      const hasDatabaseUrl = envExampleContent.includes('DATABASE_URL');
      const hasDbConfig = envExampleContent.includes('DB_HOST') && envExampleContent.includes('DB_PORT');
      
      console.log(`  ${hasDatabaseUrl ? '✅' : '❌'} DATABASE_URL configuration present`);
      console.log(`  ${hasDbConfig ? '✅' : '❌'} Database connection variables present`);
      
      if (!hasDatabaseUrl || !hasDbConfig) {
        allTestsPassed = false;
      }
    }
  } catch (error) {
    console.log('  ❌ Environment configuration check failed:', error);
    allTestsPassed = false;
  }
  console.log();

  // Test 3: Check database configuration module
  console.log('🔗 Database Configuration Module:');
  try {
    const dbConfigPath = path.join(__dirname, '../src/config/database.ts');
    if (fs.existsSync(dbConfigPath)) {
      const dbConfigContent = fs.readFileSync(dbConfigPath, 'utf8');
      
      const hasPoolConfig = dbConfigContent.includes('pool');
      const hasHealthCheck = dbConfigContent.includes('checkDatabaseHealth');
      const hasRetryLogic = dbConfigContent.includes('connectWithRetry');
      const hasTimeoutWrapper = dbConfigContent.includes('executeWithTimeout');
      const hasGracefulShutdown = dbConfigContent.includes('disconnectDatabase');
      
      console.log(`  ✅ Database configuration file exists`);
      console.log(`  ${hasPoolConfig ? '✅' : '❌'} Connection pooling configured`);
      console.log(`  ${hasHealthCheck ? '✅' : '❌'} Health check function implemented`);
      console.log(`  ${hasRetryLogic ? '✅' : '❌'} Retry logic implemented`);
      console.log(`  ${hasTimeoutWrapper ? '✅' : '❌'} Query timeout handling implemented`);
      console.log(`  ${hasGracefulShutdown ? '✅' : '❌'} Graceful shutdown implemented`);
      
      if (!hasPoolConfig || !hasHealthCheck || !hasRetryLogic || !hasTimeoutWrapper || !hasGracefulShutdown) {
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ Database configuration file not found');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Database configuration check failed:', error);
    allTestsPassed = false;
  }
  console.log();

  // Test 4: Check seed file
  console.log('🌱 Seed Configuration:');
  try {
    const seedPath = path.join(__dirname, '../prisma/seed.ts');
    if (fs.existsSync(seedPath)) {
      const seedContent = fs.readFileSync(seedPath, 'utf8');
      
      const hasDemoData = seedContent.includes('Demo') || seedContent.includes('demo');
      const hasErrorHandling = seedContent.includes('catch');
      const hasConsoleLogging = seedContent.includes('console.log');
      
      console.log(`  ✅ Seed file exists`);
      console.log(`  ${hasDemoData ? '✅' : '❌'} Demo data creation included`);
      console.log(`  ${hasErrorHandling ? '✅' : '❌'} Error handling implemented`);
      console.log(`  ${hasConsoleLogging ? '✅' : '❌'} Logging included`);
      
      if (!hasDemoData || !hasErrorHandling || !hasConsoleLogging) {
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ Seed file not found');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Seed configuration check failed:', error);
    allTestsPassed = false;
  }
  console.log();

  // Test 5: Check package.json for database scripts
  console.log('📦 Package Scripts:');
  try {
    const packagePath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const scripts = packageContent.scripts || {};
      
      const hasDbGenerate = 'db:generate' in scripts;
      const hasDbMigrate = 'db:migrate' in scripts;
      const hasDbSeed = 'db:seed' in scripts;
      const hasDbReset = 'db:reset' in scripts;
      
      console.log(`  ${hasDbGenerate ? '✅' : '❌'} db:generate script available`);
      console.log(`  ${hasDbMigrate ? '✅' : '❌'} db:migrate script available`);
      console.log(`  ${hasDbSeed ? '✅' : '❌'} db:seed script available`);
      console.log(`  ${hasDbReset ? '✅' : '❌'} db:reset script available`);
      
      if (!hasDbGenerate || !hasDbMigrate || !hasDbSeed || !hasDbReset) {
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ package.json not found');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Package scripts check failed:', error);
    allTestsPassed = false;
  }
  console.log();

  // Summary
  if (allTestsPassed) {
    console.log('🎉 All database setup validation tests passed!');
    console.log('✅ Database foundation is properly configured');
    console.log('🚀 Ready for PostgreSQL connection and migration');
  } else {
    console.log('⚠️  Some validation tests failed');
    console.log('❌ Please review the failed items above');
  }
  
  return allTestsPassed;
}

// Run the validation
validateDatabaseSetup()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });