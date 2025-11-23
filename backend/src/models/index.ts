// Example data models/interfaces for Bruno's IMS
// Updated to integrate with RBAC system

import { RBACUser } from '../types/rbac';

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

// Updated User interface to extend RBACUser for consistency
export interface User extends RBACUser {
  // Add any additional user-specific properties here
  // The RBAC properties are inherited from RBACUser
}

// Legacy User interface for backward compatibility
export interface LegacyUser {
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

// Helper function to convert legacy user to RBAC user
export function convertLegacyUserToRBACUser(legacyUser: LegacyUser): User {
  return {
    id: legacyUser.id,
    firstName: legacyUser.firstName,
    lastName: legacyUser.lastName,
    email: legacyUser.email,
    status: legacyUser.status,
    country: legacyUser.country,
    createdAt: legacyUser.createdAt,
    updatedAt: legacyUser.updatedAt,
    roles: [], // To be populated from RBAC system
    permissions: [], // To be populated from RBAC system
    ...(legacyUser.restaurantId && { restaurantId: legacyUser.restaurantId }),
  };
}
