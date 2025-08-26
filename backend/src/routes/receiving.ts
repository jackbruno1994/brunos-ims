import express from 'express';
import { receivingController } from '../controllers/receivingController';

const router = express.Router();

// Document scanning endpoints
router.post('/documents/upload', 
    receivingController.uploadMiddleware,
    receivingController.uploadDocument
);

router.get('/documents/:documentId/ocr', 
    receivingController.getDocumentOCRData
);

// Barcode scanning endpoints
router.post('/barcode/validate', 
    receivingController.validateBarcode
);

// Batch tracking endpoints
router.post('/batches', 
    receivingController.createProductBatch
);

router.get('/batches', 
    receivingController.getProductBatches
);

router.patch('/batches/:batchId/quantity', 
    receivingController.updateBatchQuantity
);

// Discrepancy management endpoints
router.post('/discrepancies', 
    receivingController.reportDiscrepancy
);

router.get('/discrepancies', 
    receivingController.getDiscrepancies
);

router.patch('/discrepancies/:discrepancyId/resolve', 
    receivingController.resolveDiscrepancy
);

// Purchase Order comparison
router.post('/compare', 
    receivingController.comparePOWithDelivery
);

export default router;