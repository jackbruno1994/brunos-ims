import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { 
    PurchaseOrder, 
    ScannedDocument, 
    ProductBatch, 
    ReceivingDiscrepancy, 
    OCRData,
    BarcodeData 
} from '../models/PurchaseOrder';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/documents/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Mock data stores - in a real app these would be database operations
const mockPurchaseOrders: PurchaseOrder[] = [];
const mockScannedDocuments: ScannedDocument[] = [];
const mockProductBatches: ProductBatch[] = [];
const mockReceivingDiscrepancies: ReceivingDiscrepancy[] = [];
// Note: mockReceipts would be used for receipt management functionality

export const receivingController = {
    // Upload middleware
    uploadMiddleware: upload.single('document'),

    // Document scanning and OCR processing
    async uploadDocument(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const scannedDocument: ScannedDocument = {
                id: Date.now().toString(),
                purchaseOrderId: req.body.purchaseOrderId,
                documentType: req.body.documentType || 'delivery_note',
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                isProcessed: false,
                uploadedBy: req.user?.id || 'unknown',
                uploadedAt: new Date(),
            };

            mockScannedDocuments.push(scannedDocument);

            // Start OCR processing asynchronously
            receivingController.processDocumentOCR(scannedDocument.id);

            return res.status(201).json({ 
                message: 'Document uploaded successfully', 
                document: scannedDocument 
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading document', error });
        }
    },

    async processDocumentOCR(documentId: string) {
        try {
            const document = mockScannedDocuments.find(d => d.id === documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Process image with Sharp for better OCR results
            const processedImagePath = document.filePath.replace(/\.[^/.]+$/, '_processed.png');
            await sharp(document.filePath)
                .grayscale()
                .normalize()
                .png()
                .toFile(processedImagePath);

            // Initialize Tesseract worker
            const worker = await createWorker('eng');
            
            // Perform OCR
            const { data: { text } } = await worker.recognize(processedImagePath);
            
            // Extract structured data from OCR text
            const ocrData = this.extractDataFromOCR(text);
            
            // Update document with OCR results
            document.ocrData = JSON.stringify(ocrData);
            document.isProcessed = true;
            document.processedAt = new Date();

            await worker.terminate();

            console.log(`OCR processing completed for document ${documentId}`);
        } catch (error) {
            console.error(`OCR processing failed for document ${documentId}:`, error);
        }
    },

    extractDataFromOCR(text: string): OCRData {
        // Simple extraction logic - in a real implementation this would be more sophisticated
        const lines = text.split('\n').filter(line => line.trim());
        
        const ocrData: OCRData = {
            rawText: text,
            confidence: 0.8, // Default confidence
        };

        // Extract document number
        const docNumberMatch = text.match(/(?:DOC|INVOICE|ORDER)[#\s]*:?\s*([A-Z0-9-]+)/i);
        if (docNumberMatch) {
            ocrData.documentNumber = docNumberMatch[1];
        }

        // Extract supplier name (usually in first few lines)
        const supplierMatch = lines.slice(0, 5).find(line => 
            line.length > 5 && line.length < 50 && /^[A-Z]/.test(line)
        );
        if (supplierMatch) {
            ocrData.supplierName = supplierMatch.trim();
        }

        // Extract date
        const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (dateMatch) {
            ocrData.date = dateMatch[1];
        }

        // Extract total amount
        const totalMatch = text.match(/(?:TOTAL|AMOUNT)[:\s]*\$?([\d,]+\.?\d*)/i);
        if (totalMatch) {
            ocrData.totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
        }

        // Extract items (simplified pattern)
        const items: Array<{sku?: string; description?: string; quantity?: number; unitPrice?: number; totalPrice?: number}> = [];
        const itemLines = lines.filter(line => 
            /\d+/.test(line) && (line.includes('$') || /\d+\.\d{2}/.test(line))
        );

        itemLines.forEach(line => {
            const item: any = {};
            
            // Look for quantity (number at start)
            const qtyMatch = line.match(/^(\d+)/);
            if (qtyMatch) {
                item.quantity = parseInt(qtyMatch[1]);
            }

            // Look for prices
            const priceMatches = line.match(/\$?([\d,]+\.?\d{2})/g);
            if (priceMatches) {
                if (priceMatches.length >= 1) {
                    item.unitPrice = parseFloat(priceMatches[0].replace(/[$,]/g, ''));
                }
                if (priceMatches.length >= 2) {
                    item.totalPrice = parseFloat(priceMatches[1].replace(/[$,]/g, ''));
                }
            }

            // Description is the remaining text
            item.description = line.replace(/^\d+/, '').replace(/\$?[\d,]+\.?\d{2}/g, '').trim();
            
            if (item.description) {
                items.push(item);
            }
        });

        ocrData.items = items;

        return ocrData;
    },

    async getDocumentOCRData(req: Request, res: Response) {
        try {
            const { documentId } = req.params;
            const document = mockScannedDocuments.find(d => d.id === documentId);
            
            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }

            if (!document.isProcessed) {
                return res.status(202).json({ 
                    message: 'Document is still being processed',
                    isProcessed: false 
                });
            }

            const ocrData = document.ocrData ? JSON.parse(document.ocrData) : null;
            return res.json({ 
                document, 
                ocrData 
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving OCR data', error });
        }
    },

    // Barcode scanning and validation
    async validateBarcode(req: Request, res: Response) {
        try {
            const { code, format } = req.body;
            
            if (!code) {
                return res.status(400).json({ message: 'Barcode code is required' });
            }

            // Simulate barcode lookup - in real implementation, query database
            const barcodeData: BarcodeData = {
                code,
                format: format || 'CODE128',
            };

            // Mock validation logic
            if (code.startsWith('ITM')) {
                barcodeData.itemId = code;
            } else if (code.startsWith('BTH')) {
                barcodeData.batchNumber = code;
                barcodeData.expirationDate = '2024-12-31'; // Mock expiration
            }

            return res.json({ 
                valid: true, 
                data: barcodeData 
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error validating barcode', error });
        }
    },

    // Batch tracking
    async createProductBatch(req: Request, res: Response) {
        try {
            const batch: ProductBatch = {
                id: Date.now().toString(),
                ...req.body,
                currentQuantity: req.body.receivedQuantity,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockProductBatches.push(batch);
            return res.status(201).json(batch);
        } catch (error) {
            return res.status(400).json({ message: 'Error creating product batch', error });
        }
    },

    async getProductBatches(req: Request, res: Response) {
        try {
            const { itemId } = req.query;
            let batches = mockProductBatches;

            if (itemId) {
                batches = batches.filter(b => b.itemId === itemId);
            }

            // Sort by expiration date
            batches.sort((a, b) => {
                if (!a.expirationDate) return 1;
                if (!b.expirationDate) return -1;
                return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            });

            return res.json(batches);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching product batches', error });
        }
    },

    async updateBatchQuantity(req: Request, res: Response) {
        try {
            const { batchId } = req.params;
            const { quantityChange, reason } = req.body;

            const batch = mockProductBatches.find(b => b.id === batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Batch not found' });
            }

            batch.currentQuantity += quantityChange;
            batch.updatedAt = new Date();
            batch.notes = (batch.notes || '') + `\n${new Date().toISOString()}: ${reason} (${quantityChange > 0 ? '+' : ''}${quantityChange})`;

            return res.json(batch);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating batch quantity', error });
        }
    },

    // Discrepancy management
    async reportDiscrepancy(req: Request, res: Response) {
        try {
            const discrepancy: ReceivingDiscrepancy = {
                id: Date.now().toString(),
                ...req.body,
                status: 'open',
                reportedBy: req.user?.id || 'unknown',
                reportedAt: new Date(),
            };

            mockReceivingDiscrepancies.push(discrepancy);
            return res.status(201).json(discrepancy);
        } catch (error) {
            return res.status(400).json({ message: 'Error reporting discrepancy', error });
        }
    },

    async getDiscrepancies(req: Request, res: Response) {
        try {
            const { status, purchaseOrderId } = req.query;
            let discrepancies = mockReceivingDiscrepancies;

            if (status) {
                discrepancies = discrepancies.filter(d => d.status === status);
            }

            if (purchaseOrderId) {
                discrepancies = discrepancies.filter(d => d.purchaseOrderId === purchaseOrderId);
            }

            // Sort by reported date (newest first)
            discrepancies.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

            return res.json(discrepancies);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching discrepancies', error });
        }
    },

    async resolveDiscrepancy(req: Request, res: Response) {
        try {
            const { discrepancyId } = req.params;
            const { resolution } = req.body;

            const discrepancy = mockReceivingDiscrepancies.find(d => d.id === discrepancyId);
            if (!discrepancy) {
                return res.status(404).json({ message: 'Discrepancy not found' });
            }

            discrepancy.status = 'resolved';
            discrepancy.resolution = resolution;
            discrepancy.resolvedBy = req.user?.id || 'unknown';
            discrepancy.resolvedAt = new Date();

            return res.json(discrepancy);
        } catch (error) {
            return res.status(500).json({ message: 'Error resolving discrepancy', error });
        }
    },

    // Purchase Order comparison
    async comparePOWithDelivery(req: Request, res: Response) {
        try {
            const { purchaseOrderId, documentId } = req.body;

            const po = mockPurchaseOrders.find(p => p.id === purchaseOrderId);
            const document = mockScannedDocuments.find(d => d.id === documentId);

            if (!po) {
                return res.status(404).json({ message: 'Purchase Order not found' });
            }

            if (!document || !document.isProcessed) {
                return res.status(400).json({ message: 'Document not found or not processed' });
            }

            const ocrData: OCRData = JSON.parse(document.ocrData || '{}');
            
            // Compare and identify discrepancies
            const comparison = {
                poNumber: po.poNumber,
                documentNumber: ocrData.documentNumber,
                supplierMatch: true, // Simplified logic
                discrepancies: [] as Array<{
                    type: string;
                    description: string;
                    expected: any;
                    actual: any;
                }>,
            };

            // In a real implementation, this would compare PO items with OCR extracted items
            // For now, just return the comparison structure
            return res.json(comparison);
        } catch (error) {
            return res.status(500).json({ message: 'Error comparing PO with delivery', error });
        }
    },
};