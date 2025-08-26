/**
 * RBAC Repository
 * 
 * This repository handles all database operations for the RBAC system.
 * It provides methods for managing roles, permissions, and their assignments.
 */

import { 
  Role, 
  Permission, 
  UserRole, 
  RolePermission,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
  RoleWithPermissions,
  UserWithRoles,
  PermissionCheck
} from '../schemas/rbac.schema';

// Database connection interface (to be implemented based on chosen DB library)
interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  transaction(callback: (conn: DatabaseConnection) => Promise<any>): Promise<any>;
}

export class RbacRepository {
  constructor(private db: DatabaseConnection) {}

  // Role management methods
  
  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleDto): Promise<Role> {
    const query = `
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at
    `;
    const result = await this.db.query(query, [roleData.name, roleData.description]);
    return result.rows[0];
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM roles
      WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM roles
      WHERE name = $1
    `;
    const result = await this.db.query(query, [name]);
    return result.rows[0] || null;
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM roles
      ORDER BY name
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * Update a role
   */
  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Role | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (roleData.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(roleData.name);
    }

    if (roleData.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      values.push(roleData.description);
    }

    if (setParts.length === 0) {
      return this.getRoleById(id);
    }

    values.push(id);
    const query = `
      UPDATE roles
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<boolean> {
    const query = `DELETE FROM roles WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  // Permission management methods

  /**
   * Create a new permission
   */
  async createPermission(permissionData: CreatePermissionDto): Promise<Permission> {
    const query = `
      INSERT INTO permissions (name, description, resource, action)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, resource, action, created_at, updated_at
    `;
    const result = await this.db.query(query, [
      permissionData.name,
      permissionData.description,
      permissionData.resource,
      permissionData.action
    ]);
    return result.rows[0];
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(id: string): Promise<Permission | null> {
    const query = `
      SELECT id, name, description, resource, action, created_at, updated_at
      FROM permissions
      WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get permissions by resource and action
   */
  async getPermissionByResourceAction(resource: string, action: string): Promise<Permission | null> {
    const query = `
      SELECT id, name, description, resource, action, created_at, updated_at
      FROM permissions
      WHERE resource = $1 AND action = $2
    `;
    const result = await this.db.query(query, [resource, action]);
    return result.rows[0] || null;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const query = `
      SELECT id, name, description, resource, action, created_at, updated_at
      FROM permissions
      ORDER BY resource, action
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * Update a permission
   */
  async updatePermission(id: string, permissionData: UpdatePermissionDto): Promise<Permission | null> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (permissionData.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(permissionData.name);
    }

    if (permissionData.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      values.push(permissionData.description);
    }

    if (permissionData.resource !== undefined) {
      setParts.push(`resource = $${paramIndex++}`);
      values.push(permissionData.resource);
    }

    if (permissionData.action !== undefined) {
      setParts.push(`action = $${paramIndex++}`);
      values.push(permissionData.action);
    }

    if (setParts.length === 0) {
      return this.getPermissionById(id);
    }

    values.push(id);
    const query = `
      UPDATE permissions
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, resource, action, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: string): Promise<boolean> {
    const query = `DELETE FROM permissions WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  // User-Role assignment methods

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    const query = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING user_id, role_id, assigned_at
    `;
    const result = await this.db.query(query, [userId, roleId]);
    return result.rows[0];
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const query = `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`;
    const result = await this.db.query(query, [userId, roleId]);
    return result.rowCount > 0;
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<UserWithRoles> {
    const query = `
      SELECT r.id, r.name, r.description, r.created_at, r.updated_at
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY r.name
    `;
    const result = await this.db.query(query, [userId]);
    return {
      user_id: userId,
      roles: result.rows
    };
  }

  /**
   * Get all users with a specific role
   */
  async getUsersWithRole(roleId: string): Promise<string[]> {
    const query = `
      SELECT user_id
      FROM user_roles
      WHERE role_id = $1
      ORDER BY assigned_at
    `;
    const result = await this.db.query(query, [roleId]);
    return result.rows.map((row: any) => row.user_id);
  }

  // Role-Permission assignment methods

  /**
   * Assign a permission to a role
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const query = `
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ($1, $2)
      ON CONFLICT (role_id, permission_id) DO NOTHING
      RETURNING role_id, permission_id, assigned_at
    `;
    const result = await this.db.query(query, [roleId, permissionId]);
    return result.rows[0];
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const query = `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2`;
    const result = await this.db.query(query, [roleId, permissionId]);
    return result.rowCount > 0;
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<RoleWithPermissions | null> {
    const roleQuery = `
      SELECT id, name, description, created_at, updated_at
      FROM roles
      WHERE id = $1
    `;
    const roleResult = await this.db.query(roleQuery, [roleId]);
    
    if (roleResult.rows.length === 0) {
      return null;
    }

    const permissionsQuery = `
      SELECT p.id, p.name, p.description, p.resource, p.action, p.created_at, p.updated_at
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.resource, p.action
    `;
    const permissionsResult = await this.db.query(permissionsQuery, [roleId]);

    return {
      ...roleResult.rows[0],
      permissions: permissionsResult.rows
    };
  }

  /**
   * Get all roles that have a specific permission
   */
  async getRolesWithPermission(permissionId: string): Promise<Role[]> {
    const query = `
      SELECT r.id, r.name, r.description, r.created_at, r.updated_at
      FROM roles r
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      WHERE rp.permission_id = $1
      ORDER BY r.name
    `;
    const result = await this.db.query(query, [permissionId]);
    return result.rows;
  }

  // Permission checking methods

  /**
   * Check if a user has a specific permission
   */
  async userHasPermission(userId: string, resource: string, action: string): Promise<PermissionCheck> {
    const query = `
      SELECT COUNT(*) as count
      FROM user_roles ur
      INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1 
        AND p.resource = $2 
        AND (p.action = $3 OR p.action = 'manage')
    `;
    const result = await this.db.query(query, [userId, resource, action]);
    const count = parseInt(result.rows[0].count);

    return {
      resource,
      action,
      allowed: count > 0
    };
  }

  /**
   * Get all permissions for a user (through their roles)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const query = `
      SELECT DISTINCT p.id, p.name, p.description, p.resource, p.action, p.created_at, p.updated_at
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY p.resource, p.action
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }
}