import { Router } from 'express';
import { POController } from '../controllers/poController';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';

const router = Router();

// Purchase Order routes
router.post('/create', POController.createPO);
router.get('/:id', POController.getPO);
router.put('/:id/update', POController.updatePO);
router.post('/:id/documents', 
  uploadMiddleware.array('documents', 5), // Allow up to 5 files
  handleUploadError,
  POController.uploadDocuments
);

// Additional helper routes for testing/admin
router.get('/', POController.getAllPOs);

export default router;