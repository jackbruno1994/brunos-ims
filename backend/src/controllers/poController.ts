import { Request, Response } from 'express';
import { POService } from '../services/poService';
import { createPOSchema, updatePOSchema } from '../validation/poValidation';

export class POController {
  static async createPO(req: Request, res: Response): Promise<void> {
    try {
      // Validate request data
      const { error, value } = createPOSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      // TODO: Get user ID from authentication middleware
      const createdBy = 'user-123'; // Mock user ID for now
      
      const purchaseOrder = await POService.createPO({
        ...value,
        createdBy
      });

      res.status(201).json({
        message: 'Purchase Order created successfully',
        data: purchaseOrder
      });
    } catch (error) {
      console.error('Error creating PO:', error);
      res.status(500).json({
        error: 'Failed to create Purchase Order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPO(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const purchaseOrder = await POService.getPOById(id);
      if (!purchaseOrder) {
        res.status(404).json({
          error: 'Purchase Order not found'
        });
        return;
      }

      // Get associated documents
      const documents = await POService.getDocumentsByPOId(id);

      res.status(200).json({
        message: 'Purchase Order retrieved successfully',
        data: {
          ...purchaseOrder,
          documents
        }
      });
    } catch (error) {
      console.error('Error fetching PO:', error);
      res.status(500).json({
        error: 'Failed to fetch Purchase Order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePO(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate request data
      const { error, value } = updatePOSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const updatedPO = await POService.updatePO(id, value);
      if (!updatedPO) {
        res.status(404).json({
          error: 'Purchase Order not found'
        });
        return;
      }

      res.status(200).json({
        message: 'Purchase Order updated successfully',
        data: updatedPO
      });
    } catch (error) {
      console.error('Error updating PO:', error);
      res.status(500).json({
        error: 'Failed to update Purchase Order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async uploadDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if PO exists
      const purchaseOrder = await POService.getPOById(id);
      if (!purchaseOrder) {
        res.status(404).json({
          error: 'Purchase Order not found'
        });
        return;
      }

      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          error: 'No files uploaded'
        });
        return;
      }

      // TODO: Get user ID from authentication middleware
      const uploadedBy = 'user-123'; // Mock user ID for now
      
      const documents = [];
      for (const file of req.files as Express.Multer.File[]) {
        const document = await POService.addDocument(id, {
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          uploadedBy
        });
        documents.push(document);
      }

      res.status(201).json({
        message: 'Documents uploaded successfully',
        data: documents
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      res.status(500).json({
        error: 'Failed to upload documents',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Additional helper endpoints for testing
  static async getAllPOs(_req: Request, res: Response): Promise<void> {
    try {
      const pos = POService.getAllPOs();
      res.status(200).json({
        message: 'All Purchase Orders retrieved successfully',
        data: pos
      });
    } catch (error) {
      console.error('Error fetching all POs:', error);
      res.status(500).json({
        error: 'Failed to fetch Purchase Orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}