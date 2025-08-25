// Purchase Order and Receiving models for Bruno's IMS

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

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  uom: string; // Unit of measure
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// New models for receiving process
export interface ScannedDocument {
  id: string;
  purchaseOrderId?: string;
  documentType: 'delivery_note' | 'invoice' | 'packing_slip';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  ocrData?: string; // JSON string containing extracted OCR data
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
  expectedValue: string; // JSON string for flexible value storage
  actualValue: string; // JSON string for flexible value storage
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'cancelled';
  resolution?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  receivedDate: Date;
  receivedBy: string;
  status: 'partial' | 'complete' | 'over_delivery';
  notes?: string;
  deliveryNoteNumber?: string;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  itemId: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  condition: 'good' | 'damaged' | 'expired' | 'short_dated';
  notes?: string;
  batchId?: string;
}

// OCR extraction data structure
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
  confidence?: number; // OCR confidence score
  rawText?: string;
}

// Barcode/QR code data structure
export interface BarcodeData {
  code: string;
  format: 'CODE128' | 'EAN13' | 'UPC' | 'QR' | 'DATAMATRIX';
  itemId?: string;
  batchNumber?: string;
  expirationDate?: string;
  lotNumber?: string;
  additionalData?: Record<string, any>;
}