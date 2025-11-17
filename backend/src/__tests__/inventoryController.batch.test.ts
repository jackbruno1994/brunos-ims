import { Request, Response } from 'express';
import { inventoryController } from '../controllers/inventoryController';

describe('Inventory Batch Processing', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    
    mockResponse = {
      json: responseJson,
      status: responseStatus,
    };
    
    mockRequest = {
      body: {},
      user: { id: 'test-user-123' },
    };
  });

  describe('batchStockMovement', () => {
    it('should process batch stock movements with default batch size 100', async () => {
      const movements = Array.from({ length: 150 }, (_, i) => ({
        itemId: `item-${i}`,
        locationId: 'location-1',
        type: 'IN',
        quantity: 10,
      }));

      mockRequest.body = { movements };

      await inventoryController.batchStockMovement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalled();
      
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(150);
      expect(result.results.processed).toBe(150);
      expect(result.results.failed).toBe(0);
      expect(result.results.batches).toHaveLength(2); // 100 + 50
    });

    it('should process batch with custom batch size', async () => {
      const movements = Array.from({ length: 250 }, (_, i) => ({
        itemId: `item-${i}`,
        locationId: 'location-1',
        type: 'IN',
        quantity: 5,
      }));

      mockRequest.body = { movements, batchSize: 100 };

      await inventoryController.batchStockMovement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(250);
      expect(result.results.batches).toHaveLength(3); // 100 + 100 + 50
    });

    it('should handle empty movements array', async () => {
      mockRequest.body = { movements: [] };

      await inventoryController.batchStockMovement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(0);
      expect(result.results.batches).toHaveLength(0);
    });

    it('should return error for invalid request without movements array', async () => {
      mockRequest.body = {};

      await inventoryController.batchStockMovement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Invalid request: movements array is required',
      });
    });

    it('should handle batch processing errors gracefully', async () => {
      // Create movements with some invalid data that would fail
      const movements = [
        { itemId: 'item-1', locationId: 'loc-1', type: 'IN', quantity: 10 },
        { itemId: '', locationId: '', type: 'IN', quantity: -1 }, // Invalid
        { itemId: 'item-3', locationId: 'loc-3', type: 'IN', quantity: 5 },
      ];

      mockRequest.body = { movements };

      await inventoryController.batchStockMovement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(3);
      expect(result.results.processed).toBeGreaterThanOrEqual(2);
    });
  });

  describe('batchCreateItems', () => {
    it('should process batch item creation with default batch size 100', async () => {
      const items = Array.from({ length: 120 }, (_, i) => ({
        name: `Item ${i}`,
        sku: `SKU-${i}`,
        unit: 'piece',
        reorderLevel: 10,
        currentStock: 50,
      }));

      mockRequest.body = { items };

      await inventoryController.batchCreateItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalled();
      
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(120);
      expect(result.results.processed).toBe(120);
      expect(result.results.failed).toBe(0);
      expect(result.results.batches).toHaveLength(2); // 100 + 20
    });

    it('should process batch with custom batch size', async () => {
      const items = Array.from({ length: 300 }, (_, i) => ({
        name: `Item ${i}`,
        sku: `SKU-${i}`,
        unit: 'piece',
        reorderLevel: 5,
        currentStock: 100,
      }));

      mockRequest.body = { items, batchSize: 100 };

      await inventoryController.batchCreateItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(300);
      expect(result.results.batches).toHaveLength(3); // 100 + 100 + 100
    });

    it('should return error for invalid request without items array', async () => {
      mockRequest.body = {};

      await inventoryController.batchCreateItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Invalid request: items array is required',
      });
    });

    it('should handle single item batch', async () => {
      const items = [
        {
          name: 'Single Item',
          sku: 'SKU-001',
          unit: 'piece',
          reorderLevel: 10,
          currentStock: 50,
        },
      ];

      mockRequest.body = { items };

      await inventoryController.batchCreateItems(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.total).toBe(1);
      expect(result.results.processed).toBe(1);
      expect(result.results.batches).toHaveLength(1);
    });
  });

  describe('Batch Processing Performance', () => {
    it('should efficiently process 100 items in a single batch', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        name: `Item ${i}`,
        sku: `SKU-${i}`,
        unit: 'piece',
        reorderLevel: 10,
        currentStock: 50,
      }));

      mockRequest.body = { items, batchSize: 100 };

      const startTime = Date.now();
      
      await inventoryController.batchCreateItems(
        mockRequest as Request,
        mockResponse as Response
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(responseStatus).toHaveBeenCalledWith(201);
      const result = responseJson.mock.calls[0][0];
      expect(result.results.processed).toBe(100);
      expect(result.results.batches).toHaveLength(1);
      
      // Should complete reasonably fast (under 1 second for 100 items)
      expect(executionTime).toBeLessThan(1000);
    });
  });
});
