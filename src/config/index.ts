import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/brunos-ims',
    name: process.env.DATABASE_NAME || 'brunos-ims',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'jackbruno1994',
    email: process.env.ADMIN_EMAIL || 'admin@brunos-ims.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
};

export const permissions = {
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Staff permissions
  VIEW_STAFF: 'view_staff',
  MANAGE_STAFF: 'manage_staff',
  
  // Order permissions
  VIEW_ORDERS: 'view_orders',
  MANAGE_ORDERS: 'manage_orders',
  
  // Reports permissions
  VIEW_REPORTS: 'view_reports',
  MANAGE_REPORTS: 'manage_reports',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ANALYTICS: 'manage_analytics',
  
  // Location permissions
  VIEW_LOCATIONS: 'view_locations',
  VIEW_ALL_LOCATIONS: 'view_all_locations',
  MANAGE_LOCATIONS: 'manage_locations',
  
  // Role permissions
  VIEW_ROLES: 'view_roles',
  MANAGE_ROLES: 'manage_roles',
  
  // User permissions
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  
  // System permissions
  SYSTEM_ADMIN: 'system_admin',
  ALL: 'all',
};

export const predefinedRoles = [
  {
    name: 'Admin',
    description: 'System administrator with full access',
    permissions: [permissions.ALL],
    hierarchyLevel: 100,
  },
  {
    name: 'Manager',
    description: 'Location manager with comprehensive access',
    permissions: [
      permissions.VIEW_INVENTORY,
      permissions.MANAGE_INVENTORY,
      permissions.VIEW_STAFF,
      permissions.MANAGE_STAFF,
      permissions.VIEW_REPORTS,
      permissions.VIEW_ORDERS,
      permissions.MANAGE_ORDERS,
    ],
    hierarchyLevel: 50,
  },
  {
    name: 'Staff',
    description: 'Basic staff member with limited access',
    permissions: [
      permissions.VIEW_INVENTORY,
      permissions.VIEW_ORDERS,
    ],
    hierarchyLevel: 10,
  },
];