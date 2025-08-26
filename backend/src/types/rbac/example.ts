// Example usage of RBAC types - this file demonstrates the types work correctly
import { Role, Permission, UserRole, RolePermission, RBACUser } from './index';

// Example role
const adminRole: Role = {
  id: 'role-admin',
  name: 'admin',
  description: 'System administrator with full access',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example permission
const readUsersPermission: Permission = {
  id: 'perm-read-users',
  name: 'read-users',
  description: 'Read user information',
  resource: 'users',
  action: 'read',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example relationship
const userRoleAssignment: UserRole = {
  userId: 'user-123',
  roleId: adminRole.id,
  assignedAt: new Date()
};

const rolePermissionAssignment: RolePermission = {
  roleId: adminRole.id,
  permissionId: readUsersPermission.id,
  assignedAt: new Date()
};

// Example RBAC user
const exampleUser: RBACUser = {
  id: 'user-123',
  roles: [adminRole],
  permissions: [readUsersPermission],
  hasRole: (roleName: string): boolean => {
    return exampleUser.roles.some(role => role.name === roleName);
  },
  hasPermission: (permissionName: string): boolean => {
    return exampleUser.permissions.some(permission => permission.name === permissionName);
  }
};

// Type validation examples
export {
  adminRole,
  readUsersPermission,
  userRoleAssignment,
  rolePermissionAssignment,
  exampleUser
};