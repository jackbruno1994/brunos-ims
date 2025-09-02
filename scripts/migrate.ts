import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

async function manageMigration() {
  try {
    // Create migration
    console.log('Creating migration...');
    execSync('npx prisma migrate dev', { stdio: 'inherit' });

    // Verify database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Database connection verified');

    // Run any seed data if needed
    await seedInitialData(prisma);

    await prisma.$disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function seedInitialData(prisma: PrismaClient) {
  // Add initial roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        create: [
          { name: 'MANAGE_USERS' },
          { name: 'MANAGE_INVENTORY' },
          { name: 'VIEW_REPORTS' }
        ]
      }
    }
  });

  // Add initial admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      roleId: adminRole.id
    }
  });
}

manageMigration().catch(console.error);