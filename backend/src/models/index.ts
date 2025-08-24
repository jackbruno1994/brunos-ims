// Data models/interfaces for Bruno's IMS

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

// RBAC Types
export type PermissionType = 'read' | 'write' | 'hide';
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'chef' | 'kitchen_staff' | 'inventory_manager' | 'cost_controller' | 'trainee';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for security
  role: UserRole;
  restaurantId?: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  isSystem: boolean; // Cannot be deleted if true
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureGroup {
  id: string;
  name: string;
  displayName: string;
  description: string;
  parentId?: string; // For hierarchical features
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  roleId: string;
  featureGroupId: string;
  permissionType: PermissionType;
  isGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  role: UserRole;
  featureGroup: string;
  permissions: {
    read: boolean;
    write: boolean;
    hide: boolean;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
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