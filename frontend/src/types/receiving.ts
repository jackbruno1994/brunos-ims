// Frontend types for Purchase Order receiving functionality

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'partially_received' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScannedDocument {
  id: string;
  purchaseOrderId?: string;
  documentType: 'delivery_note' | 'invoice' | 'packing_slip';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  ocrData?: string;
  isProcessed: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  processedAt?: Date;
}

export interface ProductBatch {
  id: string;
  itemId: string;
  batchNumber: string;
  lotNumber?: string;
  expirationDate?: Date;
  manufactureDate?: Date;
  receivedQuantity: number;
  currentQuantity: number;
  supplierBatchId?: string;
  receiptId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivingDiscrepancy {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  discrepancyType: 'quantity' | 'price' | 'quality' | 'missing_item' | 'extra_item';
  expectedValue: string;
  actualValue: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'cancelled';
  resolution?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface OCRData {
  documentNumber?: string;
  supplierName?: string;
  date?: string;
  items?: Array<{
    sku?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  totalAmount?: number;
  confidence?: number;
  rawText?: string;
}

export interface BarcodeData {
  code: string;
  format: 'CODE128' | 'EAN13' | 'UPC' | 'QR' | 'DATAMATRIX' | 'MANUAL' | 'UNKNOWN';
  itemId?: string;
  batchNumber?: string;
  expirationDate?: string;
  lotNumber?: string;
  additionalData?: Record<string, any>;
}

export interface CameraPermission {
  granted: boolean;
  error?: string;
}

export interface ScanResult {
  success: boolean;
  data?: BarcodeData;
  error?: string;
}