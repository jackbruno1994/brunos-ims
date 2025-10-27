// Example data models/interfaces for Bruno's IMS
// These will be replaced with Prisma-generated types once the client is available

// Basic model types (will be replaced with Prisma types)
export interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  managerId: string;
  status: RestaurantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  restaurantId?: string;
  country: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  restaurantId: string;
  availability: boolean;
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  restaurantId: string;
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  unitPrice: number;
  minStock: number;
  maxStock?: number;
  currentStock: number;
  restaurantId: string;
  supplierId?: string;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  createdBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum ItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

// Extended types with relations
export interface RestaurantWithUsers extends Restaurant {
  users: User[];
}

export interface UserWithRestaurant extends User {
  restaurant?: Restaurant;
}

export interface InventoryItemWithSupplier extends InventoryItem {
  supplier?: Supplier;
  restaurant: Restaurant;
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: (PurchaseOrderItem & { item: InventoryItem })[];
  supplier: Supplier;
  restaurant: Restaurant;
  creator: User;
}

export interface StockMovementWithItem extends StockMovement {
  item: InventoryItem;
  user: User;
}

// Input types for API endpoints
export type CreateRestaurantInput = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;

export type CreateMenuItemInput = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export type CreateSupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

export type CreateInventoryItemInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;

export type CreateStockMovementInput = Omit<StockMovement, 'id' | 'createdAt'>;
export type CreatePurchaseOrderInput = Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePurchaseOrderInput = Partial<CreatePurchaseOrderInput>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
  version?: string;
  uptime?: number;
}
