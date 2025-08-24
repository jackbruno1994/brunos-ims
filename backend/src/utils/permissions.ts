import { UserRole, PermissionType } from '../models';
import { DEFAULT_ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../config/rbac';

export class PermissionService {
  // Check if a role has permission for a feature group
  static hasPermission(
    role: UserRole, 
    featureGroup: string, 
    permissionType: PermissionType
  ): boolean {
    // Find the permission for this role and feature group
    const permission = DEFAULT_ROLE_PERMISSIONS.find(
      p => p.role === role && p.featureGroup === featureGroup
    );

    if (!permission) {
      return false;
    }

    switch (permissionType) {
      case 'read':
        return permission.permissions.read;
      case 'write':
        return permission.permissions.write && permission.permissions.read;
      case 'hide':
        return permission.permissions.hide;
      default:
        return false;
    }
  }

  // Check if a role has any of the specified permissions
  static hasAnyPermission(
    role: UserRole, 
    featureGroup: string, 
    permissionTypes: PermissionType[]
  ): boolean {
    return permissionTypes.some(type => this.hasPermission(role, featureGroup, type));
  }

  // Check if a role has all of the specified permissions
  static hasAllPermissions(
    role: UserRole, 
    featureGroup: string, 
    permissionTypes: PermissionType[]
  ): boolean {
    return permissionTypes.every(type => this.hasPermission(role, featureGroup, type));
  }

  // Get all permissions for a role
  static getRolePermissions(role: UserRole): { [featureGroup: string]: { read: boolean, write: boolean, hide: boolean } } {
    const permissions: { [featureGroup: string]: { read: boolean, write: boolean, hide: boolean } } = {};
    
    DEFAULT_ROLE_PERMISSIONS
      .filter(p => p.role === role)
      .forEach(p => {
        permissions[p.featureGroup] = p.permissions;
      });

    return permissions;
  }

  // Check if role is higher in hierarchy than another role
  static isHigherRole(role: UserRole, comparedRole: UserRole): boolean {
    const hierarchy = ROLE_HIERARCHY[comparedRole];
    return hierarchy.includes(role);
  }

  // Get accessible feature groups for a role (not hidden)
  static getAccessibleFeatureGroups(role: UserRole): string[] {
    return DEFAULT_ROLE_PERMISSIONS
      .filter(p => p.role === role && !p.permissions.hide)
      .map(p => p.featureGroup);
  }

  // Check if feature group should be hidden from role
  static isFeatureHidden(role: UserRole, featureGroup: string): boolean {
    return this.hasPermission(role, featureGroup, 'hide');
  }

  // Get all available roles
  static getAllRoles(): UserRole[] {
    return ['super_admin', 'admin', 'manager', 'chef', 'kitchen_staff', 'inventory_manager', 'cost_controller', 'trainee'];
  }

  // Get role display name
  static getRoleDisplayName(role: UserRole): string {
    const displayNames: { [key in UserRole]: string } = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      chef: 'Chef',
      kitchen_staff: 'Kitchen Staff',
      inventory_manager: 'Inventory Manager',
      cost_controller: 'Cost Controller',
      trainee: 'Trainee'
    };
    return displayNames[role];
  }
}