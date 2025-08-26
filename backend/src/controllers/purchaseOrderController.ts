import { Request, Response } from 'express';

// In-memory storage for demo purposes
// TODO: Replace with actual database implementation
let purchaseOrders: any[] = [];
let scannedDocuments: any[] = [];
let productBatches: any[] = [];

export const purchaseOrderController = {
  // Purchase Order CRUD operations
  async getAllPurchaseOrders(_req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: purchaseOrders,
        count: purchaseOrders.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching purchase orders', 
        error 
      });
    }
  },

  async getPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const po = purchaseOrders.find(po => po.id === id);
      
      if (!po) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      res.json({
        success: true,
        data: po
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching purchase order', 
        error 
      });
    }
  },

  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const newPO = {
        id: `po_${Date.now()}`,
        poNumber: req.body.poNumber || `PO-${Date.now()}`,
        supplierId: req.body.supplierId,
        supplierName: req.body.supplierName,
        status: req.body.status || 'draft',
        orderDate: new Date(req.body.orderDate || Date.now()),
        expectedDeliveryDate: req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : undefined,
        actualDeliveryDate: undefined,
        totalAmount: req.body.totalAmount || 0,
        currency: req.body.currency || 'USD',
        items: req.body.items || [],
        notes: req.body.notes,
        restaurantId: req.body.restaurantId,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      purchaseOrders.push(newPO);

      res.status(201).json({
        success: true,
        data: newPO,
        message: 'Purchase order created successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Error creating purchase order', 
        error 
      });
    }
  },

  async updatePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const poIndex = purchaseOrders.findIndex(po => po.id === id);
      
      if (poIndex === -1) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      const updatedPO = {
        ...purchaseOrders[poIndex],
        ...req.body,
        updatedAt: new Date()
      };

      purchaseOrders[poIndex] = updatedPO;

      res.json({
        success: true,
        data: updatedPO,
        message: 'Purchase order updated successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Error updating purchase order', 
        error 
      });
    }
  },

  async deletePurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const poIndex = purchaseOrders.findIndex(po => po.id === id);
      
      if (poIndex === -1) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      purchaseOrders.splice(poIndex, 1);

      res.json({
        success: true,
        message: 'Purchase order deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting purchase order', 
        error 
      });
    }
  },

  // Scanned Documents operations
  async getDocumentsByPO(req: Request, res: Response): Promise<void> {
    try {
      const { poId } = req.params;
      const documents = scannedDocuments.filter(doc => doc.poId === poId);

      res.json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching documents', 
        error 
      });
    }
  },

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { poId } = req.params;
      
      // Check if PO exists
      const poExists = purchaseOrders.some(po => po.id === poId);
      if (!poExists) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      const newDocument = {
        id: `doc_${Date.now()}`,
        poId,
        documentType: req.body.documentType || 'other',
        fileName: req.body.fileName,
        filePath: req.body.filePath || `/uploads/${req.body.fileName}`,
        fileSize: req.body.fileSize || 0,
        mimeType: req.body.mimeType || 'application/octet-stream',
        scanDate: new Date(),
        status: 'pending',
        extractedData: req.body.extractedData,
        notes: req.body.notes,
        scannedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      scannedDocuments.push(newDocument);

      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Error uploading document', 
        error 
      });
    }
  },

  // Product Batches operations
  async getBatchesByPO(req: Request, res: Response): Promise<void> {
    try {
      const { poId } = req.params;
      const batches = productBatches.filter(batch => batch.poId === poId);

      res.json({
        success: true,
        data: batches,
        count: batches.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching product batches', 
        error 
      });
    }
  },

  async createProductBatch(req: Request, res: Response): Promise<void> {
    try {
      const { poId } = req.params;
      
      // Check if PO exists
      const poExists = purchaseOrders.some(po => po.id === poId);
      if (!poExists) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      const newBatch = {
        id: `batch_${Date.now()}`,
        poId,
        productId: req.body.productId,
        batchNumber: req.body.batchNumber,
        lotNumber: req.body.lotNumber,
        quantity: req.body.quantity,
        uom: req.body.uom,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        manufacturingDate: req.body.manufacturingDate ? new Date(req.body.manufacturingDate) : undefined,
        receivedDate: new Date(req.body.receivedDate || Date.now()),
        status: req.body.status || 'received',
        location: req.body.location,
        notes: req.body.notes,
        receivedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      productBatches.push(newBatch);

      res.status(201).json({
        success: true,
        data: newBatch,
        message: 'Product batch created successfully'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Error creating product batch', 
        error 
      });
    }
  },

  // Receiving operations
  async markAsReceived(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const poIndex = purchaseOrders.findIndex(po => po.id === id);
      
      if (poIndex === -1) {
        res.status(404).json({ 
          success: false, 
          message: 'Purchase order not found' 
        });
        return;
      }

      purchaseOrders[poIndex] = {
        ...purchaseOrders[poIndex],
        status: 'fully_received',
        actualDeliveryDate: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: purchaseOrders[poIndex],
        message: 'Purchase order marked as received'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: 'Error updating purchase order status', 
        error 
      });
    }
  }
};