// Inventory-related type definitions
// TODO: Sync with backend models once database is implemented

export interface Item {
    id: string;
    sku: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface Location {
    id: string;
    name: string;
    type: string;
    active: boolean;
}

export interface StockMovement {
    id: string;
    itemId: string;
    quantity: number;
    type: 'IN' | 'OUT';
    locationId: string;
    createdAt: Date;
    createdBy: string;
}
