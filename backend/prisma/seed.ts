import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default countries
  const usa = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      name: 'United States',
      code: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  const canada = await prisma.country.upsert({
    where: { code: 'CA' },
    update: {},
    create: {
      name: 'Canada',
      code: 'CA',
      currency: 'CAD',
      timezone: 'America/Toronto',
    },
  });

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
      permissions: {
        all: true,
        users: ['create', 'read', 'update', 'delete'],
        restaurants: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        orders: ['create', 'read', 'update', 'delete'],
        reports: ['read'],
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Restaurant manager with operational access',
      permissions: {
        users: ['read', 'update'],
        restaurants: ['read', 'update'],
        inventory: ['create', 'read', 'update'],
        orders: ['create', 'read', 'update'],
        reports: ['read'],
      },
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff',
      description: 'Restaurant staff with limited access',
      permissions: {
        inventory: ['read'],
        orders: ['create', 'read', 'update'],
      },
    },
  });

  // Create sample restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-1' },
    update: {},
    create: {
      id: 'sample-restaurant-1',
      name: "Bruno's Main Location",
      address: '123 Main Street, New York, NY 10001',
      phone: '+1-555-0123',
      email: 'main@brunos-restaurant.com',
      countryId: usa.id,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        taxRate: 0.08,
        serviceCharge: 0.15,
      },
    },
  });

  // Create sample locations within restaurant
  const kitchen = await prisma.location.upsert({
    where: { id: 'location-kitchen-1' },
    update: {},
    create: {
      id: 'location-kitchen-1',
      name: 'Main Kitchen',
      description: 'Primary kitchen storage and prep area',
      restaurantId: restaurant.id,
    },
  });

  const bar = await prisma.location.upsert({
    where: { id: 'location-bar-1' },
    update: {},
    create: {
      id: 'location-bar-1',
      name: 'Bar Area',
      description: 'Bar storage and service area',
      restaurantId: restaurant.id,
    },
  });

  // Create sample categories
  const beverages = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: {
      name: 'Beverages',
      description: 'All drinks and liquid refreshments',
      color: '#3B82F6',
    },
  });

  const proteins = await prisma.category.upsert({
    where: { name: 'Proteins' },
    update: {},
    create: {
      name: 'Proteins',
      description: 'Meat, fish, and protein sources',
      color: '#EF4444',
    },
  });

  const vegetables = await prisma.category.upsert({
    where: { name: 'Vegetables' },
    update: {},
    create: {
      name: 'Vegetables',
      description: 'Fresh vegetables and produce',
      color: '#10B981',
    },
  });

  // Create sample supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 'supplier-food-co-1' },
    update: {},
    create: {
      id: 'supplier-food-co-1',
      name: 'Fresh Food Co.',
      contactName: 'John Smith',
      email: 'orders@freshfoodco.com',
      phone: '+1-555-0456',
      address: '456 Supply Street, New York, NY 10002',
    },
  });

  // Create sample admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brunos-restaurant.com' },
    update: {},
    create: {
      email: 'admin@brunos-restaurant.com',
      username: 'admin',
      firstName: 'Bruno',
      lastName: 'Administrator',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeQYz7p0.c7Z.Qw0C', // hashed "password123"
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Link admin user to restaurant
  await prisma.restaurantUser.upsert({
    where: {
      userId_restaurantId: {
        userId: adminUser.id,
        restaurantId: restaurant.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      restaurantId: restaurant.id,
    },
  });

  // Create sample menu categories
  const appetizers = await prisma.menuCategory.upsert({
    where: { name: 'Appetizers' },
    update: {},
    create: {
      name: 'Appetizers',
      description: 'Small plates to start your meal',
      sortOrder: 1,
    },
  });

  const entrees = await prisma.menuCategory.upsert({
    where: { name: 'Entrees' },
    update: {},
    create: {
      name: 'Entrees',
      description: 'Main course dishes',
      sortOrder: 2,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin user: admin@brunos-restaurant.com (password: password123)');
  console.log('🏪 Sample restaurant created:', restaurant.name);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });