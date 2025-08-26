import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { 
  receivingController, 
  mockProductBatches, 
  mockReceivingDiscrepancies 
} from '../src/controllers/receivingController';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    recognize: jest.fn(() => Promise.resolve({
      data: { text: 'INVOICE #12345\nSupplier: Test Supplier\nTotal: $123.45' }
    })),
    terminate: jest.fn()
  }))
}));

// Mock Sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    grayscale: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(undefined)
  }));
});

const app = express();
app.use(express.json());

// Mock routes for testing
app.post('/api/receiving/barcode/validate', receivingController.validateBarcode);
app.post('/api/receiving/batches', receivingController.createProductBatch);
app.get('/api/receiving/batches', receivingController.getProductBatches);
app.post('/api/receiving/discrepancies', receivingController.reportDiscrepancy);
app.get('/api/receiving/discrepancies', receivingController.getDiscrepancies);

describe('Receiving Controller', () => {
  beforeEach(() => {
    // Clear any mock data before each test
    jest.clearAllMocks();
    
    // Clear mock data arrays
    mockProductBatches.length = 0;
    mockReceivingDiscrepancies.length = 0;
  });

  describe('Barcode Validation', () => {
    it('should validate a barcode successfully', async () => {
      const response = await request(app)
        .post('/api/receiving/barcode/validate')
        .send({
          code: 'ITM12345',
          format: 'CODE128'
        });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.data.code).toBe('ITM12345');
      expect(response.body.data.format).toBe('CODE128');
    });

    it('should return error for missing barcode', async () => {
      const response = await request(app)
        .post('/api/receiving/barcode/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Barcode code is required');
    });

    it('should identify item barcodes', async () => {
      const response = await request(app)
        .post('/api/receiving/barcode/validate')
        .send({
          code: 'ITM12345',
          format: 'CODE128'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.itemId).toBe('ITM12345');
    });

    it('should identify batch barcodes', async () => {
      const response = await request(app)
        .post('/api/receiving/barcode/validate')
        .send({
          code: 'BTH67890',
          format: 'QR'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.batchNumber).toBe('BTH67890');
      expect(response.body.data.expirationDate).toBe('2024-12-31');
    });
  });

  describe('Product Batch Management', () => {
    it('should create a product batch', async () => {
      const batchData = {
        itemId: 'ITM001',
        batchNumber: 'BATCH001',
        receivedQuantity: 100,
        expirationDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/receiving/batches')
        .send(batchData);

      expect(response.status).toBe(201);
      expect(response.body.itemId).toBe('ITM001');
      expect(response.body.batchNumber).toBe('BATCH001');
      expect(response.body.currentQuantity).toBe(100);
    });

    it('should get product batches', async () => {
      // Create a batch first
      await request(app)
        .post('/api/receiving/batches')
        .send({
          itemId: 'ITM001',
          batchNumber: 'BATCH001',
          receivedQuantity: 100
        });

      const response = await request(app)
        .get('/api/receiving/batches');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].batchNumber).toBe('BATCH001');
    });

    it('should filter batches by itemId', async () => {
      // Create batches for different items
      await request(app)
        .post('/api/receiving/batches')
        .send({
          itemId: 'ITM001',
          batchNumber: 'BATCH001',
          receivedQuantity: 100
        });

      await request(app)
        .post('/api/receiving/batches')
        .send({
          itemId: 'ITM002',
          batchNumber: 'BATCH002',
          receivedQuantity: 50
        });

      const response = await request(app)
        .get('/api/receiving/batches?itemId=ITM001');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].itemId).toBe('ITM001');
    });
  });

  describe('Discrepancy Management', () => {
    it('should report a discrepancy', async () => {
      const discrepancyData = {
        purchaseOrderId: 'PO001',
        itemId: 'ITM001',
        discrepancyType: 'quantity',
        expectedValue: '100',
        actualValue: '95',
        description: 'Received 5 units less than expected'
      };

      const response = await request(app)
        .post('/api/receiving/discrepancies')
        .send(discrepancyData);

      expect(response.status).toBe(201);
      expect(response.body.purchaseOrderId).toBe('PO001');
      expect(response.body.discrepancyType).toBe('quantity');
      expect(response.body.status).toBe('open');
    });

    it('should get discrepancies', async () => {
      // Create a discrepancy first
      await request(app)
        .post('/api/receiving/discrepancies')
        .send({
          purchaseOrderId: 'PO001',
          itemId: 'ITM001',
          discrepancyType: 'quantity',
          expectedValue: '100',
          actualValue: '95',
          description: 'Test discrepancy'
        });

      const response = await request(app)
        .get('/api/receiving/discrepancies');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].description).toBe('Test discrepancy');
    });

    it('should filter discrepancies by status', async () => {
      // Create discrepancies with different statuses would require resolving them
      await request(app)
        .post('/api/receiving/discrepancies')
        .send({
          purchaseOrderId: 'PO001',
          itemId: 'ITM001',
          discrepancyType: 'quantity',
          expectedValue: '100',
          actualValue: '95',
          description: 'Open discrepancy'
        });

      const response = await request(app)
        .get('/api/receiving/discrepancies?status=open');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('open');
    });

    it('should filter discrepancies by purchaseOrderId', async () => {
      // Create discrepancies for different POs
      await request(app)
        .post('/api/receiving/discrepancies')
        .send({
          purchaseOrderId: 'PO001',
          itemId: 'ITM001',
          discrepancyType: 'quantity',
          expectedValue: '100',
          actualValue: '95',
          description: 'PO001 discrepancy'
        });

      await request(app)
        .post('/api/receiving/discrepancies')
        .send({
          purchaseOrderId: 'PO002',
          itemId: 'ITM002',
          discrepancyType: 'price',
          expectedValue: '$10.00',
          actualValue: '$12.00',
          description: 'PO002 discrepancy'
        });

      const response = await request(app)
        .get('/api/receiving/discrepancies?purchaseOrderId=PO001');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].purchaseOrderId).toBe('PO001');
    });
  });

  describe('OCR Data Extraction', () => {
    it('should extract document number from OCR text', () => {
      const text = 'INVOICE #12345\nSupplier: Test Supplier\nTotal: $123.45';
      const ocrData = receivingController.extractDataFromOCR(text);

      expect(ocrData.documentNumber).toBe('12345');
      expect(ocrData.rawText).toBe(text);
    });

    it('should extract supplier name from OCR text', () => {
      const text = 'Test Supplier Inc\nINVOICE #12345\nDate: 01/01/2024';
      const ocrData = receivingController.extractDataFromOCR(text);

      expect(ocrData.supplierName).toBe('Test Supplier Inc');
    });

    it('should extract total amount from OCR text', () => {
      const text = 'INVOICE #12345\nItems...\nTOTAL: $123.45';
      const ocrData = receivingController.extractDataFromOCR(text);

      expect(ocrData.totalAmount).toBe(123.45);
    });

    it('should extract date from OCR text', () => {
      const text = 'INVOICE #12345\nDate: 01/15/2024\nSupplier: Test';
      const ocrData = receivingController.extractDataFromOCR(text);

      expect(ocrData.date).toBe('01/15/2024');
    });

    it('should handle text without extractable data', () => {
      const text = 'Random text without structured data';
      const ocrData = receivingController.extractDataFromOCR(text);

      expect(ocrData.documentNumber).toBeUndefined();
      expect(ocrData.totalAmount).toBeUndefined();
      expect(ocrData.rawText).toBe(text);
      expect(ocrData.confidence).toBe(0.8);
      // Note: supplierName might still extract the first meaningful line
    });
  });
});