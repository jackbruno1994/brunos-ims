// Example data models/interfaces for Bruno's IMS

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// PO Receiving System Models

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'fully_received' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  totalAmount: number;
  currency: string;
  items: PurchaseOrderItem[];
  notes?: string;
  restaurantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  uom: string; // unit of measure
}

export interface ScannedDocument {
  id: string;
  poId: string;
  documentType: 'delivery_note' | 'invoice' | 'packing_slip' | 'receipt' | 'other';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  scanDate: Date;
  status: 'pending' | 'processed' | 'archived';
  extractedData?: Record<string, any>;
  notes?: string;
  scannedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBatch {
  id: string;
  poId: string;
  productId: string;
  batchNumber: string;
  lotNumber?: string;
  quantity: number;
  uom: string;
  expiryDate?: Date;
  manufacturingDate?: Date;
  receivedDate: Date;
  status: 'received' | 'in_stock' | 'partially_used' | 'fully_used' | 'expired' | 'returned';
  location?: string;
  notes?: string;
  receivedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
