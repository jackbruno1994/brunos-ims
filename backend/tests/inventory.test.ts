import request from 'supertest';
import app from '../src/server';

describe('Inventory API', () => {
  let itemId: string;
  let locationId: string;

  beforeAll(async () => {
    // Wait a bit for the server to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test('should get all inventory items', async () => {
    const response = await request(app)
      .get('/api/inventory/items')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Store the first item for later tests
    if (response.body.length > 0) {
      itemId = response.body[0].id;
    }
  });

  test('should get all inventory locations', async () => {
    const response = await request(app)
      .get('/api/inventory/locations')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Store the first location for later tests
    if (response.body.length > 0) {
      locationId = response.body[0].id;
    }
  });

  test('should create a new inventory item', async () => {
    const newItem = {
      name: 'Test Item',
      description: 'Test item description',
      sku: 'TEST-001',
      categoryId: '1',
      unit: 'piece',
      minStockLevel: 1,
      maxStockLevel: 10,
      reorderPoint: 5,
      cost: 9.99,
      currency: 'USD',
      active: true
    };

    const response = await request(app)
      .post('/api/inventory/items')
      .send(newItem)
      .expect(201);

    expect(response.body).toMatchObject({
      name: newItem.name,
      description: newItem.description,
      sku: newItem.sku,
      unit: newItem.unit,
      cost: newItem.cost,
      currency: newItem.currency,
      active: newItem.active
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  test('should record a stock movement', async () => {
    if (!itemId || !locationId) {
      // Skip if we don't have required IDs
      return;
    }

    const stockMovement = {
      itemId: itemId,
      locationId: locationId,
      type: 'IN',
      quantity: 50,
      reason: 'Test stock in',
      notes: 'Testing stock movement'
    };

    const response = await request(app)
      .post('/api/inventory/stock-movements')
      .send(stockMovement)
      .expect(201);

    expect(response.body).toMatchObject({
      itemId: stockMovement.itemId,
      locationId: stockMovement.locationId,
      type: stockMovement.type,
      quantity: stockMovement.quantity,
      reason: stockMovement.reason,
      notes: stockMovement.notes
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.createdBy).toBeDefined();
  });

  test('should get stock levels', async () => {
    const response = await request(app)
      .get('/api/inventory/stock-levels')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // If there are stock movements, we should have stock levels
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('_id');
      expect(response.body[0]).toHaveProperty('totalStock');
      expect(typeof response.body[0].totalStock).toBe('number');
    }
  });

  test('should get stock history', async () => {
    const response = await request(app)
      .get('/api/inventory/stock-history')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    // Check if stock movements are sorted by date (newest first)
    if (response.body.length > 1) {
      const first = new Date(response.body[0].createdAt).getTime();
      const second = new Date(response.body[1].createdAt).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    }
  });

  test('should get all categories', async () => {
    const response = await request(app)
      .get('/api/inventory/categories')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Check if sample category exists
    const foodCategory = response.body.find((cat: any) => cat.name === 'Food');
    expect(foodCategory).toBeDefined();
    expect(foodCategory.active).toBe(true);
  });
});