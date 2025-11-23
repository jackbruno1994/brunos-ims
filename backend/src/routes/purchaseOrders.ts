import { Router } from 'express';
import { purchaseOrderController } from '../controllers/purchaseOrderController';

const router = Router();

// Purchase Order routes
router.get('/purchase-orders', purchaseOrderController.getAllPurchaseOrders);
router.get('/purchase-orders/:id', purchaseOrderController.getPurchaseOrder);
router.post('/purchase-orders', purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:id', purchaseOrderController.updatePurchaseOrder);
router.delete('/purchase-orders/:id', purchaseOrderController.deletePurchaseOrder);

// PO Receiving specific routes
router.post('/purchase-orders/:id/receive', purchaseOrderController.markAsReceived);

// Document management routes
router.get('/purchase-orders/:poId/documents', purchaseOrderController.getDocumentsByPO);
router.post('/purchase-orders/:poId/documents', purchaseOrderController.uploadDocument);

// Product batch routes
router.get('/purchase-orders/:poId/batches', purchaseOrderController.getBatchesByPO);
router.post('/purchase-orders/:poId/batches', purchaseOrderController.createProductBatch);

export default router;