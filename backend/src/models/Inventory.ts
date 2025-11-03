// Temporary model interfaces until Prisma client is available
export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  type: 'WAREHOUSE' | 'STORE' | 'SUPPLIER';
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Temporary implementations for build compatibility
export const Item = {
  find: async () => [],
  findById: async (_id: string) => null,
  create: async (_data: any) => null,
  update: async (_id: string, _data: any) => null,
  delete: async (_id: string) => null,
};

export const StockMovement = {
  find: async () => [],
  create: async (_data: any) => null,
};

export const Location = {
  find: async () => [],
  findById: async (_id: string) => null,
  create: async (_data: any) => null,
  update: async (_id: string, _data: any) => null,
  delete: async (_id: string) => null,
};

export const Category = {
  find: async () => [],
  create: async (_data: any) => null,
  update: async (_id: string, _data: any) => null,
  delete: async (_id: string) => null,
};