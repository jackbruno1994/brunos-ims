import { UserRole, FeatureGroup, RolePermission } from '../models';

// Feature Groups Definition
export const FEATURE_GROUPS: Omit<FeatureGroup, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Recipe Management
  { name: 'recipe_management', displayName: 'Recipe Management', description: 'Recipe management features', order: 1, isActive: true },
  { name: 'recipe_library', displayName: 'Recipe Library', description: 'Recipe library access', parentId: 'recipe_management', order: 1, isActive: true },
  { name: 'recipe_components', displayName: 'Recipe Components', description: 'Recipe ingredients and instructions', parentId: 'recipe_management', order: 2, isActive: true },
  { name: 'recipe_tools', displayName: 'Recipe Tools', description: 'Recipe scaling and cost tools', parentId: 'recipe_management', order: 3, isActive: true },

  // Inventory Control
  { name: 'inventory_control', displayName: 'Inventory Control', description: 'Inventory management features', order: 2, isActive: true },
  { name: 'stock_management', displayName: 'Stock Management', description: 'Stock tracking and updates', parentId: 'inventory_control', order: 1, isActive: true },
  { name: 'supplier_management', displayName: 'Supplier Management', description: 'Supplier and order management', parentId: 'inventory_control', order: 2, isActive: true },
  { name: 'inventory_reports', displayName: 'Inventory Reports', description: 'Inventory reporting and analytics', parentId: 'inventory_control', order: 3, isActive: true },

  // Financial Management
  { name: 'financial_management', displayName: 'Financial Management', description: 'Financial management features', order: 3, isActive: true },
  { name: 'cost_control', displayName: 'Cost Control', description: 'Cost tracking and analysis', parentId: 'financial_management', order: 1, isActive: true },
  { name: 'financial_reports', displayName: 'Financial Reports', description: 'Financial reporting and analytics', parentId: 'financial_management', order: 2, isActive: true },
  { name: 'billing', displayName: 'Billing', description: 'Invoicing and payment management', parentId: 'financial_management', order: 3, isActive: true },

  // Quality Control
  { name: 'quality_control', displayName: 'Quality Control', description: 'Quality management features', order: 4, isActive: true },
  { name: 'quality_standards', displayName: 'Quality Standards', description: 'Guidelines and procedures', parentId: 'quality_control', order: 1, isActive: true },
  { name: 'quality_monitoring', displayName: 'Quality Monitoring', description: 'Inspections and compliance', parentId: 'quality_control', order: 2, isActive: true },
  { name: 'quality_reports', displayName: 'Quality Reports', description: 'Quality reporting and audits', parentId: 'quality_control', order: 3, isActive: true },

  // Training & Documentation
  { name: 'training_documentation', displayName: 'Training & Documentation', description: 'Training and documentation features', order: 5, isActive: true },
  { name: 'training_materials', displayName: 'Training Materials', description: 'Courses and assessments', parentId: 'training_documentation', order: 1, isActive: true },
  { name: 'documentation', displayName: 'Documentation', description: 'Manuals and procedures', parentId: 'training_documentation', order: 2, isActive: true },
  { name: 'progress_tracking', displayName: 'Progress Tracking', description: 'Training progress and certifications', parentId: 'training_documentation', order: 3, isActive: true },

  // System Administration
  { name: 'system_administration', displayName: 'System Administration', description: 'System administration features', order: 6, isActive: true },
  { name: 'user_management', displayName: 'User Management', description: 'User and role management', parentId: 'system_administration', order: 1, isActive: true },
  { name: 'system_settings', displayName: 'System Settings', description: 'System configuration', parentId: 'system_administration', order: 2, isActive: true },
  { name: 'audit', displayName: 'Audit', description: 'Audit logs and security', parentId: 'system_administration', order: 3, isActive: true },
];

// Default Role Permissions Configuration
export const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
  // Super Admin - Full access to everything
  {
    role: 'super_admin',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'super_admin',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'super_admin',
    featureGroup: 'financial_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'super_admin',
    featureGroup: 'quality_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'super_admin',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'super_admin',
    featureGroup: 'system_administration',
    permissions: { read: true, write: true, hide: false }
  },

  // Admin - Full access to assigned modules
  {
    role: 'admin',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'admin',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'admin',
    featureGroup: 'financial_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'admin',
    featureGroup: 'quality_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'admin',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'admin',
    featureGroup: 'system_administration',
    permissions: { read: true, write: false, hide: true }
  },

  // Manager - Operational access with limited financial
  {
    role: 'manager',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'manager',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'manager',
    featureGroup: 'financial_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'manager',
    featureGroup: 'quality_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'manager',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'manager',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },

  // Chef - Full recipe access, limited inventory and costs
  {
    role: 'chef',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'chef',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'chef',
    featureGroup: 'financial_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'chef',
    featureGroup: 'quality_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'chef',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'chef',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },

  // Kitchen Staff - Limited access
  {
    role: 'kitchen_staff',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'kitchen_staff',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'kitchen_staff',
    featureGroup: 'financial_management',
    permissions: { read: false, write: false, hide: true }
  },
  {
    role: 'kitchen_staff',
    featureGroup: 'quality_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'kitchen_staff',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'kitchen_staff',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },

  // Inventory Manager - Full inventory access
  {
    role: 'inventory_manager',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'inventory_manager',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'inventory_manager',
    featureGroup: 'financial_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'inventory_manager',
    featureGroup: 'quality_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'inventory_manager',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'inventory_manager',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },

  // Cost Controller - Full financial access
  {
    role: 'cost_controller',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'cost_controller',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'cost_controller',
    featureGroup: 'financial_management',
    permissions: { read: true, write: true, hide: false }
  },
  {
    role: 'cost_controller',
    featureGroup: 'quality_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'cost_controller',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'cost_controller',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },

  // Trainee - Read-only basic access
  {
    role: 'trainee',
    featureGroup: 'recipe_management',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'trainee',
    featureGroup: 'inventory_control',
    permissions: { read: true, write: false, hide: true }
  },
  {
    role: 'trainee',
    featureGroup: 'financial_management',
    permissions: { read: false, write: false, hide: true }
  },
  {
    role: 'trainee',
    featureGroup: 'quality_control',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'trainee',
    featureGroup: 'training_documentation',
    permissions: { read: true, write: false, hide: false }
  },
  {
    role: 'trainee',
    featureGroup: 'system_administration',
    permissions: { read: false, write: false, hide: true }
  },
];

// Role hierarchy for inheritance
export const ROLE_HIERARCHY: { [key in UserRole]: UserRole[] } = {
  super_admin: [],
  admin: ['super_admin'],
  manager: ['admin', 'super_admin'],
  chef: ['manager', 'admin', 'super_admin'],
  kitchen_staff: ['chef', 'manager', 'admin', 'super_admin'],
  inventory_manager: ['manager', 'admin', 'super_admin'],
  cost_controller: ['admin', 'super_admin'],
  trainee: ['kitchen_staff', 'chef', 'manager', 'admin', 'super_admin'],
};