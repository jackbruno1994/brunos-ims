import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo categories
  const categoryKitchen = await prisma.category.upsert({
    where: { name: 'Kitchen Equipment' },
    update: {},
    create: {
      name: 'Kitchen Equipment',
      description: 'Kitchen tools and equipment',
    },
  });

  const categoryIngredients = await prisma.category.upsert({
    where: { name: 'Ingredients' },
    update: {},
    create: {
      name: 'Ingredients',
      description: 'Food ingredients and supplies',
    },
  });

  console.log('✅ Categories created');

  // Create demo suppliers
  const supplierAcme = await prisma.supplier.upsert({
    where: { name: 'ACME Food Supplies' },
    update: {},
    create: {
      name: 'ACME Food Supplies',
      email: 'orders@acmefood.com',
      phone: '+1-555-0123',
      address: '123 Supply St, Food City, FC 12345',
      status: 'ACTIVE',
    },
  });

  const supplierFresh = await prisma.supplier.upsert({
    where: { name: 'Fresh Ingredients Co' },
    update: {},
    create: {
      name: 'Fresh Ingredients Co',
      email: 'sales@freshingredients.com',
      phone: '+1-555-0456',
      address: '456 Fresh Ave, Green Valley, GV 67890',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Suppliers created');

  // Create demo locations
  const warehouseLocation = await prisma.location.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: {
      name: 'Main Warehouse',
      type: 'WAREHOUSE',
      active: true,
    },
  });

  const kitchenLocation = await prisma.location.upsert({
    where: { name: 'Main Kitchen' },
    update: {},
    create: {
      name: 'Main Kitchen',
      type: 'KITCHEN',
      active: true,
    },
  });

  const coolerLocation = await prisma.location.upsert({
    where: { name: 'Walk-in Cooler' },
    update: {},
    create: {
      name: 'Walk-in Cooler',
      type: 'COOLER',
      active: true,
    },
  });

  console.log('✅ Locations created');

  // Create demo items with UOM conversions
  const flour = await prisma.item.upsert({
    where: { sku: 'FLOUR-001' },
    update: {},
    create: {
      name: 'All-Purpose Flour',
      description: 'Premium all-purpose flour for baking',
      sku: 'FLOUR-001',
      baseUom: 'kg',
      categoryId: categoryIngredients.id,
      supplierId: supplierAcme.id,
      status: 'ACTIVE',
    },
  });

  // Add UOM conversions for flour
  await prisma.uomConversion.upsert({
    where: { 
      itemId_fromUom_toUom: {
        itemId: flour.id,
        fromUom: 'kg',
        toUom: 'g',
      }
    },
    update: {},
    create: {
      itemId: flour.id,
      fromUom: 'kg',
      toUom: 'g',
      factor: 1000,
    },
  });

  await prisma.uomConversion.upsert({
    where: { 
      itemId_fromUom_toUom: {
        itemId: flour.id,
        fromUom: 'kg',
        toUom: 'lb',
      }
    },
    update: {},
    create: {
      itemId: flour.id,
      fromUom: 'kg',
      toUom: 'lb',
      factor: 2.20462,
    },
  });

  const sugar = await prisma.item.upsert({
    where: { sku: 'SUGAR-001' },
    update: {},
    create: {
      name: 'Granulated Sugar',
      description: 'White granulated sugar',
      sku: 'SUGAR-001',
      baseUom: 'kg',
      categoryId: categoryIngredients.id,
      supplierId: supplierFresh.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Items and conversions created');

  // Create demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brunos-ims.com' },
    update: {},
    create: {
      email: 'admin@brunos-ims.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created');

  // Create demo recipe
  const breadRecipe = await prisma.recipe.upsert({
    where: { name: 'Basic White Bread' },
    update: {},
    create: {
      name: 'Basic White Bread',
      description: 'Simple white bread recipe',
      yieldUom: 'loaf',
      yieldQtyBase: 1,
      status: 'ACTIVE',
    },
  });

  // Add recipe items
  await prisma.recipeItem.upsert({
    where: { 
      recipeId_itemId: {
        recipeId: breadRecipe.id,
        itemId: flour.id,
      }
    },
    update: {},
    create: {
      recipeId: breadRecipe.id,
      itemId: flour.id,
      qtyBase: 0.5, // 500g flour
      lossPct: 2,
    },
  });

  await prisma.recipeItem.upsert({
    where: { 
      recipeId_itemId: {
        recipeId: breadRecipe.id,
        itemId: sugar.id,
      }
    },
    update: {},
    create: {
      recipeId: breadRecipe.id,
      itemId: sugar.id,
      qtyBase: 0.05, // 50g sugar
      lossPct: 1,
    },
  });

  console.log('✅ Recipe created');

  // Create initial stock movements (receiving items)
  await prisma.stockMovement.create({
    data: {
      itemId: flour.id,
      qtyBase: 10, // 10kg flour received
      costPerBase: 2.50, // $2.50 per kg
      toLocationId: warehouseLocation.id,
      reason: 'PURCHASE_RECEIPT',
      reference: 'PO-001',
      createdById: adminUser.id,
    },
  });

  await prisma.stockMovement.create({
    data: {
      itemId: sugar.id,
      qtyBase: 5, // 5kg sugar received
      costPerBase: 1.80, // $1.80 per kg
      toLocationId: warehouseLocation.id,
      reason: 'PURCHASE_RECEIPT',
      reference: 'PO-001',
      createdById: adminUser.id,
    },
  });

  console.log('✅ Initial stock movements created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });