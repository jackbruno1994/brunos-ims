import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create categories
  console.log('Creating categories...');
  const dryGoodsCategory = await prisma.category.upsert({
    where: { name: 'Dry Goods' },
    update: {},
    create: {
      name: 'Dry Goods',
    },
  });

  const freshProduceCategory = await prisma.category.upsert({
    where: { name: 'Fresh Produce' },
    update: {},
    create: {
      name: 'Fresh Produce',
    },
  });

  const proteinCategory = await prisma.category.upsert({
    where: { name: 'Protein' },
    update: {},
    create: {
      name: 'Protein',
    },
  });

  // Create locations
  console.log('Creating locations...');
  const mainKitchen = await prisma.location.upsert({
    where: { name: 'Main Kitchen' },
    update: {},
    create: {
      name: 'Main Kitchen',
      description: 'Primary kitchen storage area',
    },
  });

  await prisma.location.upsert({
    where: { name: 'Freezer' },
    update: {},
    create: {
      name: 'Freezer',
      description: 'Frozen goods storage',
    },
  });

  const dryStorage = await prisma.location.upsert({
    where: { name: 'Dry Storage' },
    update: {},
    create: {
      name: 'Dry Storage',
      description: 'Dry goods storage area',
    },
  });

  // Create suppliers
  console.log('Creating suppliers...');
  const freshMarket = await prisma.supplier.upsert({
    where: { name: 'Fresh Market Suppliers' },
    update: {},
    create: {
      name: 'Fresh Market Suppliers',
      contactInfo: {
        email: 'orders@freshmarket.com',
        phone: '+1-555-0123',
        address: '123 Market Street, City, State 12345',
      },
    },
  });

  await prisma.supplier.upsert({
    where: { name: 'Quality Meats Co.' },
    update: {},
    create: {
      name: 'Quality Meats Co.',
      contactInfo: {
        email: 'sales@qualitymeats.com',
        phone: '+1-555-0456',
        address: '456 Butcher Lane, City, State 12345',
      },
    },
  });

  // Create items with conversions
  console.log('Creating items...');
  const flour = await prisma.item.upsert({
    where: { sku: 'FLOUR-001' },
    update: {},
    create: {
      name: 'All-Purpose Flour',
      description: 'Premium all-purpose flour for baking',
      sku: 'FLOUR-001',
      baseUom: 'kg',
      categoryId: dryGoodsCategory.id,
    },
  });

  const chicken = await prisma.item.upsert({
    where: { sku: 'CHICKEN-001' },
    update: {},
    create: {
      name: 'Chicken Breast',
      description: 'Fresh boneless chicken breast',
      sku: 'CHICKEN-001',
      baseUom: 'kg',
      categoryId: proteinCategory.id,
    },
  });

  const tomatoes = await prisma.item.upsert({
    where: { sku: 'TOMATO-001' },
    update: {},
    create: {
      name: 'Roma Tomatoes',
      description: 'Fresh Roma tomatoes',
      sku: 'TOMATO-001',
      baseUom: 'kg',
      categoryId: freshProduceCategory.id,
    },
  });

  // Create UOM conversions
  console.log('Creating UOM conversions...');
  await prisma.uomConversion.upsert({
    where: { itemId_fromUom: { itemId: flour.id, fromUom: 'bag' } },
    update: {},
    create: {
      itemId: flour.id,
      fromUom: 'bag',
      toUom: 'kg',
      factor: 25, // 1 bag = 25 kg
    },
  });

  await prisma.uomConversion.upsert({
    where: { itemId_fromUom: { itemId: chicken.id, fromUom: 'case' } },
    update: {},
    create: {
      itemId: chicken.id,
      fromUom: 'case',
      toUom: 'kg',
      factor: 10, // 1 case = 10 kg
    },
  });

  // Create a recipe with sub-ingredients
  console.log('Creating recipes...');
  const breadRecipe = await prisma.recipe.upsert({
    where: { name: 'Basic Bread' },
    update: {},
    create: {
      name: 'Basic Bread',
      description: 'Simple white bread recipe',
      yieldUom: 'loaf',
      yieldQtyBase: 2, // Makes 2 loaves
    },
  });

  // Add recipe items
  await prisma.recipeItem.upsert({
    where: { recipeId_itemId: { recipeId: breadRecipe.id, itemId: flour.id } },
    update: {},
    create: {
      recipeId: breadRecipe.id,
      itemId: flour.id,
      qtyBase: 1, // 1 kg flour
      lossPct: 5, // 5% loss
    },
  });

  // Create a purchase order
  console.log('Creating purchase orders...');
  const po = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2024-001',
      supplierId: freshMarket.id,
      status: 'sent',
      items: {
        create: [
          {
            itemId: flour.id,
            qtyOrdered: 50, // 50 kg
            costPerBase: 2.50, // $2.50 per kg
          },
          {
            itemId: tomatoes.id,
            qtyOrdered: 25, // 25 kg
            costPerBase: 3.00, // $3.00 per kg
          },
        ],
      },
    },
  });

  // Create a receipt
  console.log('Creating receipts...');
  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber: 'REC-2024-001',
      purchaseOrderId: po.id,
      items: {
        create: [
          {
            itemId: flour.id,
            qtyReceived: 50, // Received full order
            costPerBase: 2.50,
          },
          {
            itemId: tomatoes.id,
            qtyReceived: 24, // 1 kg short
            costPerBase: 3.00,
          },
        ],
      },
    },
  });

  // Create stock movements from receipt
  console.log('Creating stock movements...');
  await prisma.stockMovement.createMany({
    data: [
      {
        itemId: flour.id,
        qtyBase: 50,
        costPerBase: 2.50,
        dest: dryStorage.id,
        reason: 'purchase',
        reference: receipt.id,
      },
      {
        itemId: tomatoes.id,
        qtyBase: 24,
        costPerBase: 3.00,
        dest: mainKitchen.id,
        reason: 'purchase',
        reference: receipt.id,
      },
    ],
  });

  // Create a small production run
  console.log('Creating production batch...');
  const batch = await prisma.batch.create({
    data: {
      batchNumber: 'BATCH-2024-001',
      recipeId: breadRecipe.id,
      producedQtyBase: 10, // Produced 10 loaves
      status: 'completed',
      notes: 'First production batch of the day',
    },
  });

  // Create stock movements for production (consumption and production)
  await prisma.stockMovement.createMany({
    data: [
      {
        itemId: flour.id,
        qtyBase: -5, // Consumed 5 kg flour
        source: dryStorage.id,
        reason: 'production_out',
        reference: batch.id,
      },
    ],
  });

  // Create some stock counts
  console.log('Creating stock counts...');
  await prisma.count.createMany({
    data: [
      {
        locationId: dryStorage.id,
        itemId: flour.id,
        qtyBase: 45, // Count shows 45 kg (50 received - 5 used)
        notes: 'Weekly stock take',
      },
      {
        locationId: mainKitchen.id,
        itemId: tomatoes.id,
        qtyBase: 22, // Count shows 22 kg (24 received - 2 used)
        notes: 'Weekly stock take',
      },
    ],
  });

  console.log('Database seeding completed successfully!');
  console.log('Created:');
  console.log('- 3 categories (Dry Goods, Fresh Produce, Protein)');
  console.log('- 3 locations (Main Kitchen, Freezer, Dry Storage)');
  console.log('- 2 suppliers (Fresh Market, Quality Meats)');
  console.log('- 3 items with UOM conversions');
  console.log('- 1 recipe with ingredients');
  console.log('- 1 purchase order with 2 items');
  console.log('- 1 receipt with stock movements');
  console.log('- 1 production batch');
  console.log('- Stock counts for audit trail');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });