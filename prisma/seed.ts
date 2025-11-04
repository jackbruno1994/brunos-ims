import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { email: 'demo@brunos-ims.com' },
    update: {},
    create: {
      name: 'Bruno\'s Demo Restaurant',
      location: 'Downtown',
      country: 'US',
      address: '123 Main St, City, State 12345',
      phone: '+1-555-0123',
      email: 'demo@brunos-ims.com',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Demo restaurant created:', restaurant.name);

  // Create demo locations
  const storageLocation = await prisma.location.upsert({
    where: { id: 'storage-main' },
    update: {},
    create: {
      id: 'storage-main',
      name: 'Main Storage',
      type: 'STORAGE',
      restaurantId: restaurant.id,
    },
  });

  const kitchenLocation = await prisma.location.upsert({
    where: { id: 'kitchen-main' },
    update: {},
    create: {
      id: 'kitchen-main',
      name: 'Main Kitchen',
      type: 'KITCHEN',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Demo locations created');

  // Create demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brunos-ims.com' },
    update: {},
    create: {
      email: 'admin@brunos-ims.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Demo admin user created:', adminUser.email);

  // Create demo items
  const items = [
    {
      name: 'Tomatoes',
      description: 'Fresh Roma tomatoes',
      sku: 'TOMATO-001',
      category: 'Vegetables',
      baseUnit: 'lb',
      costPerUnit: 2.50,
    },
    {
      name: 'Ground Beef',
      description: '80/20 ground beef',
      sku: 'BEEF-001',
      category: 'Meat',
      baseUnit: 'lb',
      costPerUnit: 8.99,
    },
    {
      name: 'Mozzarella Cheese',
      description: 'Whole milk mozzarella',
      sku: 'CHEESE-001',
      category: 'Dairy',
      baseUnit: 'lb',
      costPerUnit: 6.50,
    },
  ];

  for (const itemData of items) {
    const item = await prisma.item.upsert({
      where: { sku: itemData.sku },
      update: {},
      create: {
        ...itemData,
        restaurantId: restaurant.id,
      },
    });

    // Create stock levels for each item
    await prisma.stockLevel.upsert({
      where: {
        itemId_locationId: {
          itemId: item.id,
          locationId: storageLocation.id,
        },
      },
      update: {},
      create: {
        itemId: item.id,
        locationId: storageLocation.id,
        quantity: 50,
        minLevel: 10,
        maxLevel: 100,
      },
    });

    console.log(`✅ Demo item created: ${item.name}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });