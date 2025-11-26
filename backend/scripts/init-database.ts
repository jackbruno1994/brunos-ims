#!/usr/bin/env ts-node

/**
 * Database initialization script
 * This script handles the complete database setup including migration and seeding
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function initializeDatabase() {
  console.log('🚀 Initializing Bruno\'s IMS Database...\n');

  try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    const { stdout: generateOutput } = await execAsync('npx prisma generate');
    console.log(generateOutput);
    console.log('✅ Prisma Client generated successfully\n');

    // Step 2: Run database migrations
    console.log('🔄 Running database migrations...');
    const { stdout: migrateOutput } = await execAsync('npx prisma migrate dev --name initial_setup');
    console.log(migrateOutput);
    console.log('✅ Database migrations completed successfully\n');

    // Step 3: Seed the database
    console.log('🌱 Seeding database with initial data...');
    const { stdout: seedOutput } = await execAsync('npm run db:seed');
    console.log(seedOutput);
    console.log('✅ Database seeded successfully\n');

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Your database is ready with:');
    console.log('   - Complete schema with all tables and relationships');
    console.log('   - Demo categories, suppliers, and locations');
    console.log('   - Sample items with UOM conversions');
    console.log('   - Admin user account');
    console.log('   - Sample recipe and stock movements');
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running and accessible');
    console.log('2. Verify DATABASE_URL in your .env file is correct');
    console.log('3. Ensure the database specified in DATABASE_URL exists');
    console.log('4. Check that the database user has proper permissions');
    
    process.exit(1);
  }
}

// Check if database is accessible before running
async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...');
    await execAsync('npx prisma db pull --print');
    console.log('✅ Database connection successful\n');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('📋 Please ensure:');
    console.log('   - PostgreSQL is running');
    console.log('   - DATABASE_URL is correctly configured in .env');
    console.log('   - Database exists and is accessible');
    console.log('\n🔗 Current DATABASE_URL:', process.env.DATABASE_URL || 'Not set');
    return false;
  }
}

async function main() {
  const isConnected = await checkDatabaseConnection();
  
  if (isConnected) {
    await initializeDatabase();
  } else {
    console.log('\n⏸️  Database initialization skipped due to connection issues');
    console.log('🚀 You can run this script again once PostgreSQL is properly configured');
    process.exit(1);
  }
}

main().catch(console.error);