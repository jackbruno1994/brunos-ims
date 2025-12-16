import { POService } from '../src/services/poService';
import { POStatus } from '../src/models';

describe('POService', () => {
  beforeEach(() => {
    // Clear all data before each test
    POService.clearAll();
  });

  describe('createPO', () => {
    it('should create a new purchase order with correct data', async () => {
      const poData = {
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item',
            quantity: 10,
            unitPrice: 5.50
          }
        ],
        createdBy: 'user-123'
      };

      const po = await POService.createPO(poData);

      expect(po.id).toBeDefined();
      expect(po.poNumber).toMatch(/^PO-\d{6}$/);
      expect(po.status).toBe(POStatus.DRAFT);
      expect(po.supplierId).toBe(poData.supplierId);
      expect(po.lineItems).toHaveLength(1);
      expect(po.lineItems[0].totalPrice).toBe(55); // 10 * 5.50
      expect(po.subtotal).toBe(55);
      expect(po.tax).toBe(5.5); // 10% of subtotal
      expect(po.totalAmount).toBe(60.5); // subtotal + tax
    });

    it('should handle multiple line items correctly', async () => {
      const poData = {
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item 1',
            quantity: 10,
            unitPrice: 5.00
          },
          {
            itemId: 'item-2',
            itemName: 'Test Item 2',
            quantity: 5,
            unitPrice: 12.00
          }
        ],
        createdBy: 'user-123'
      };

      const po = await POService.createPO(poData);

      expect(po.lineItems).toHaveLength(2);
      expect(po.subtotal).toBe(110); // (10*5) + (5*12)
      expect(po.totalAmount).toBe(121); // 110 + 11 (tax)
    });
  });

  describe('updatePO', () => {
    it('should update PO status with valid transition', async () => {
      const po = await POService.createPO({
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item',
            quantity: 10,
            unitPrice: 5.50
          }
        ],
        createdBy: 'user-123'
      });

      const updated = await POService.updatePO(po.id, {
        status: POStatus.SUBMITTED
      });

      expect(updated).toBeDefined();
      expect(updated!.status).toBe(POStatus.SUBMITTED);
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(po.createdAt.getTime());
    });

    it('should reject invalid status transitions', async () => {
      const po = await POService.createPO({
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item',
            quantity: 10,
            unitPrice: 5.50
          }
        ],
        createdBy: 'user-123'
      });

      await expect(POService.updatePO(po.id, {
        status: POStatus.PROCESSED
      })).rejects.toThrow('Invalid status transition');
    });

    it('should return null for non-existent PO', async () => {
      const result = await POService.updatePO('non-existent', {
        status: POStatus.SUBMITTED
      });

      expect(result).toBeNull();
    });
  });

  describe('getPOById', () => {
    it('should return PO by ID', async () => {
      const created = await POService.createPO({
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item',
            quantity: 10,
            unitPrice: 5.50
          }
        ],
        createdBy: 'user-123'
      });

      const found = await POService.getPOById(created.id);

      expect(found).toEqual(created);
    });

    it('should return null for non-existent PO', async () => {
      const result = await POService.getPOById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('addDocument', () => {
    it('should add document to existing PO', async () => {
      const po = await POService.createPO({
        supplierId: 'supplier-123',
        supplierName: 'Test Supplier',
        restaurantId: 'restaurant-456',
        lineItems: [
          {
            itemId: 'item-1',
            itemName: 'Test Item',
            quantity: 10,
            unitPrice: 5.50
          }
        ],
        createdBy: 'user-123'
      });

      const document = await POService.addDocument(po.id, {
        fileName: 'test-doc.pdf',
        originalName: 'test document.pdf',
        mimeType: 'application/pdf',
        size: 12345,
        path: '/uploads/test-doc.pdf',
        uploadedBy: 'user-123'
      });

      expect(document.id).toBeDefined();
      expect(document.purchaseOrderId).toBe(po.id);
      expect(document.fileName).toBe('test-doc.pdf');
      expect(document.uploadedAt).toBeInstanceOf(Date);
    });
  });

  describe('status transitions', () => {
    it('should validate all allowed status transitions', () => {
      expect(POService.isValidStatusTransition(POStatus.DRAFT, POStatus.SUBMITTED)).toBe(true);
      expect(POService.isValidStatusTransition(POStatus.DRAFT, POStatus.CANCELLED)).toBe(true);
      expect(POService.isValidStatusTransition(POStatus.SUBMITTED, POStatus.APPROVED)).toBe(true);
      expect(POService.isValidStatusTransition(POStatus.SUBMITTED, POStatus.REJECTED)).toBe(true);
      expect(POService.isValidStatusTransition(POStatus.APPROVED, POStatus.PROCESSED)).toBe(true);
      expect(POService.isValidStatusTransition(POStatus.REJECTED, POStatus.DRAFT)).toBe(true);
      
      // Invalid transitions
      expect(POService.isValidStatusTransition(POStatus.DRAFT, POStatus.PROCESSED)).toBe(false);
      expect(POService.isValidStatusTransition(POStatus.PROCESSED, POStatus.DRAFT)).toBe(false);
      expect(POService.isValidStatusTransition(POStatus.CANCELLED, POStatus.APPROVED)).toBe(false);
    });
  });
});