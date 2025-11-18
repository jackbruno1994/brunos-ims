import request from 'supertest';
import app from '../src/server';
import { POService } from '../src/services/poService';

describe('PO API Integration Tests', () => {
  beforeEach(() => {
    // Clear all data before each test
    POService.clearAll();
  });

  describe('POST /api/po/create', () => {
    it('should create a new purchase order', async () => {
      const poData = {
        supplierId: 'supplier-123',
        supplierName: 'Fresh Foods Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Fresh Tomatoes',
            quantity: 50,
            unitPrice: 2.50
          }
        ],
        notes: 'Urgent delivery required'
      };

      const response = await request(app)
        .post('/api/po/create')
        .send(poData)
        .expect(201);

      expect(response.body.message).toBe('Purchase Order created successfully');
      expect(response.body.data.poNumber).toMatch(/^PO-\d{6}$/);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.totalAmount).toBe(137.5); // (50 * 2.50) + 10% tax
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        supplierId: 'supplier-123',
        // Missing required fields
        lineItems: []
      };

      const response = await request(app)
        .post('/api/po/create')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('"supplierName" is required');
    });
  });

  describe('GET /api/po/:id', () => {
    it('should retrieve purchase order by ID', async () => {
      // First create a PO
      const createResponse = await request(app)
        .post('/api/po/create')
        .send({
          supplierId: 'supplier-123',
          supplierName: 'Test Supplier',
          restaurantId: 'restaurant-456',
          lineItems: [
            {
              itemId: 'item-1',
              itemName: 'Test Item',
              quantity: 10,
              unitPrice: 5.00
            }
          ]
        })
        .expect(201);

      const poId = createResponse.body.data.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/po/${poId}`)
        .expect(200);

      expect(response.body.message).toBe('Purchase Order retrieved successfully');
      expect(response.body.data.id).toBe(poId);
      expect(response.body.data.documents).toEqual([]);
    });

    it('should return 404 for non-existent PO', async () => {
      const response = await request(app)
        .get('/api/po/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Purchase Order not found');
    });
  });

  describe('PUT /api/po/:id/update', () => {
    it('should update purchase order status', async () => {
      // Create a PO first
      const createResponse = await request(app)
        .post('/api/po/create')
        .send({
          supplierId: 'supplier-123',
          supplierName: 'Test Supplier',
          restaurantId: 'restaurant-456',
          lineItems: [
            {
              itemId: 'item-1',
              itemName: 'Test Item',
              quantity: 10,
              unitPrice: 5.00
            }
          ]
        })
        .expect(201);

      const poId = createResponse.body.data.id;

      // Update the status
      const response = await request(app)
        .put(`/api/po/${poId}/update`)
        .send({ status: 'submitted' })
        .expect(200);

      expect(response.body.message).toBe('Purchase Order updated successfully');
      expect(response.body.data.status).toBe('submitted');
    });

    it('should reject invalid status transitions', async () => {
      // Create a PO first
      const createResponse = await request(app)
        .post('/api/po/create')
        .send({
          supplierId: 'supplier-123',
          supplierName: 'Test Supplier',
          restaurantId: 'restaurant-456',
          lineItems: [
            {
              itemId: 'item-1',
              itemName: 'Test Item',
              quantity: 10,
              unitPrice: 5.00
            }
          ]
        })
        .expect(201);

      const poId = createResponse.body.data.id;

      // Try invalid status transition (DRAFT -> PROCESSED)
      const response = await request(app)
        .put(`/api/po/${poId}/update`)
        .send({ status: 'processed' })
        .expect(500);

      expect(response.body.error).toBe('Failed to update Purchase Order');
      expect(response.body.message).toContain('Invalid status transition');
    });
  });

  describe('Complete PO Workflow', () => {
    it('should support complete PO lifecycle', async () => {
      // 1. Create PO
      const createResponse = await request(app)
        .post('/api/po/create')
        .send({
          supplierId: 'supplier-123',
          supplierName: 'Test Supplier',
          restaurantId: 'restaurant-456',
          lineItems: [
            {
              itemId: 'item-1',
              itemName: 'Test Item',
              quantity: 10,
              unitPrice: 5.00
            }
          ]
        })
        .expect(201);

      const poId = createResponse.body.data.id;
      expect(createResponse.body.data.status).toBe('draft');

      // 2. Submit for approval
      await request(app)
        .put(`/api/po/${poId}/update`)
        .send({ status: 'submitted' })
        .expect(200);

      // 3. Approve
      await request(app)
        .put(`/api/po/${poId}/update`)
        .send({ status: 'approved' })
        .expect(200);

      // 4. Process
      const finalResponse = await request(app)
        .put(`/api/po/${poId}/update`)
        .send({ status: 'processed' })
        .expect(200);

      expect(finalResponse.body.data.status).toBe('processed');

      // 5. Verify final state
      const getResponse = await request(app)
        .get(`/api/po/${poId}`)
        .expect(200);

      expect(getResponse.body.data.status).toBe('processed');
    });
  });
});