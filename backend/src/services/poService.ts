import { PurchaseOrder, POStatus, POLineItem, Document } from '../models';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes (will be replaced with database)
let purchaseOrders: PurchaseOrder[] = [];
let documents: Document[] = [];
let poCounter = 1000;

export class POService {
  static generatePONumber(): string {
    return `PO-${String(++poCounter).padStart(6, '0')}`;
  }

  static calculateLineItemTotal(lineItem: Omit<POLineItem, 'id' | 'totalPrice'>): number {
    return lineItem.quantity * lineItem.unitPrice;
  }

  static calculatePOTotals(lineItems: POLineItem[]): { subtotal: number; tax: number; totalAmount: number } {
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% tax for demo
    const totalAmount = subtotal + tax;
    
    return { subtotal, tax, totalAmount };
  }

  static async createPO(poData: {
    supplierId: string;
    supplierName: string;
    restaurantId: string;
    lineItems: Omit<POLineItem, 'id' | 'totalPrice'>[];
    requestedDeliveryDate?: Date;
    notes?: string;
    createdBy: string;
  }): Promise<PurchaseOrder> {
    const id = uuidv4();
    const poNumber = this.generatePONumber();
    
    // Process line items
    const lineItems: POLineItem[] = poData.lineItems.map(item => ({
      ...item,
      id: uuidv4(),
      totalPrice: this.calculateLineItemTotal(item)
    }));
    
    // Calculate totals
    const { subtotal, tax, totalAmount } = this.calculatePOTotals(lineItems);
    
    const purchaseOrder: PurchaseOrder = {
      id,
      poNumber,
      supplierId: poData.supplierId,
      supplierName: poData.supplierName,
      restaurantId: poData.restaurantId,
      status: POStatus.DRAFT,
      lineItems,
      subtotal,
      tax,
      totalAmount,
      createdBy: poData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(poData.requestedDeliveryDate && { requestedDeliveryDate: poData.requestedDeliveryDate }),
      ...(poData.notes && { notes: poData.notes })
    };
    
    purchaseOrders.push(purchaseOrder);
    return purchaseOrder;
  }

  static async getPOById(id: string): Promise<PurchaseOrder | null> {
    return purchaseOrders.find(po => po.id === id) || null;
  }

  static async updatePO(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const poIndex = purchaseOrders.findIndex(po => po.id === id);
    if (poIndex === -1) return null;
    
    const currentPO = purchaseOrders[poIndex];
    
    // Validate status transitions
    if (updates.status && !this.isValidStatusTransition(currentPO.status, updates.status)) {
      throw new Error(`Invalid status transition from ${currentPO.status} to ${updates.status}`);
    }
    
    // Recalculate totals if line items changed
    let calculatedUpdates = { ...updates };
    if (updates.lineItems) {
      const lineItems = updates.lineItems.map(item => ({
        ...item,
        totalPrice: item.totalPrice || this.calculateLineItemTotal(item)
      }));
      const { subtotal, tax, totalAmount } = this.calculatePOTotals(lineItems);
      calculatedUpdates = {
        ...calculatedUpdates,
        lineItems,
        subtotal,
        tax,
        totalAmount
      };
    }
    
    const updatedPO = {
      ...currentPO,
      ...calculatedUpdates,
      updatedAt: new Date()
    };
    
    purchaseOrders[poIndex] = updatedPO;
    return updatedPO;
  }

  static isValidStatusTransition(currentStatus: POStatus, newStatus: POStatus): boolean {
    const allowedTransitions: Record<POStatus, POStatus[]> = {
      [POStatus.DRAFT]: [POStatus.SUBMITTED, POStatus.CANCELLED],
      [POStatus.SUBMITTED]: [POStatus.APPROVED, POStatus.REJECTED, POStatus.CANCELLED],
      [POStatus.APPROVED]: [POStatus.PROCESSED, POStatus.CANCELLED],
      [POStatus.REJECTED]: [POStatus.DRAFT],
      [POStatus.PROCESSED]: [],
      [POStatus.CANCELLED]: []
    };
    
    return allowedTransitions[currentStatus].includes(newStatus);
  }

  static async addDocument(poId: string, documentData: {
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedBy: string;
  }): Promise<Document> {
    const document: Document = {
      id: uuidv4(),
      purchaseOrderId: poId,
      ...documentData,
      uploadedAt: new Date()
    };
    
    documents.push(document);
    return document;
  }

  static async getDocumentsByPOId(poId: string): Promise<Document[]> {
    return documents.filter(doc => doc.purchaseOrderId === poId);
  }

  // For testing/demo purposes
  static getAllPOs(): PurchaseOrder[] {
    return purchaseOrders;
  }

  static clearAll(): void {
    purchaseOrders = [];
    documents = [];
    poCounter = 1000;
  }
}