import DatabaseService from '../database/connection';
import { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RoleFilters,
  PaginatedResponse,
  ApiResponse,
  ActionType
} from '../types/rbac';
import { AuditService } from './audit.service';

export class RoleService {
  private db: DatabaseService;
  private auditService: AuditService;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.auditService = new AuditService();
  }

  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<Role>> {
    try {
      const query = `
        INSERT INTO roles (role_name, description, created_by)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        roleData.roleName,
        roleData.description || null,
        roleData.createdBy || null
      ]);

      const newRole = this.mapDbRowToRole(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.CREATE,
        tableName: 'roles',
        recordId: newRole.id,
        newValue: newRole,
        ipAddress
      });

      return {
        success: true,
        data: newRole,
        message: 'Role created successfully'
      };
    } catch (error: any) {
      console.error('Error creating role:', error);
      return {
        success: false,
        error: error.message || 'Failed to create role'
      };
    }
  }

  /**
   * Get all roles with optional filtering and pagination
   */
  async getRoles(filters: RoleFilters = {}): Promise<PaginatedResponse<Role>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        isActive,
        search
      } = filters;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (isActive !== undefined) {
        whereClause += ` AND is_active = $${++paramCount}`;
        params.push(isActive);
      }

      if (search) {
        whereClause += ` AND (role_name ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
        params.push(`%${search}%`, `%${search}%`);
        paramCount++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM roles ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT * FROM roles 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;
      params.push(limit, offset);

      const result = await this.db.query(dataQuery, params);
      const roles = result.rows.map((row: any) => this.mapDbRowToRole(row));

      return {
        success: true,
        data: roles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch roles'
      };
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    try {
      const query = 'SELECT * FROM roles WHERE id = $1';
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const role = this.mapDbRowToRole(result.rows[0]);
      return {
        success: true,
        data: role
      };
    } catch (error: any) {
      console.error('Error fetching role:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch role'
      };
    }
  }

  /**
   * Update role
   */
  async updateRole(id: number, updates: UpdateRoleRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<Role>> {
    try {
      // Get existing role for audit
      const existingRole = await this.getRoleById(id);
      if (!existingRole.success) {
        return existingRole;
      }

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (updates.roleName !== undefined) {
        updateFields.push(`role_name = $${++paramCount}`);
        params.push(updates.roleName);
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${++paramCount}`);
        params.push(updates.description);
      }

      if (updates.isActive !== undefined) {
        updateFields.push(`is_active = $${++paramCount}`);
        params.push(updates.isActive);
      }

      if (updates.updatedBy !== undefined) {
        updateFields.push(`updated_by = $${++paramCount}`);
        params.push(updates.updatedBy);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length === 1) { // Only timestamp update
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      const query = `
        UPDATE roles 
        SET ${updateFields.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING *
      `;
      params.push(id);

      const result = await this.db.query(query, params);
      const updatedRole = this.mapDbRowToRole(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.UPDATE,
        tableName: 'roles',
        recordId: id,
        oldValue: existingRole.data,
        newValue: updatedRole,
        ipAddress
      });

      return {
        success: true,
        data: updatedRole,
        message: 'Role updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating role:', error);
      return {
        success: false,
        error: error.message || 'Failed to update role'
      };
    }
  }

  /**
   * Delete (deactivate) role
   */
  async deleteRole(id: number, userId?: number, ipAddress?: string): Promise<ApiResponse<void>> {
    try {
      // Get existing role for audit
      const existingRole = await this.getRoleById(id);
      if (!existingRole.success) {
        return {
          success: false,
          error: existingRole.error
        };
      }

      const query = `
        UPDATE roles 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await this.db.query(query, [id]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.DELETE,
        tableName: 'roles',
        recordId: id,
        oldValue: existingRole.data,
        newValue: { ...existingRole.data, isActive: false },
        ipAddress
      });

      return {
        success: true,
        message: 'Role deactivated successfully'
      };
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete role'
      };
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(roleName: string): Promise<ApiResponse<Role>> {
    try {
      const query = 'SELECT * FROM roles WHERE role_name = $1 AND is_active = true';
      const result = await this.db.query(query, [roleName]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const role = this.mapDbRowToRole(result.rows[0]);
      return {
        success: true,
        data: role
      };
    } catch (error: any) {
      console.error('Error fetching role by name:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch role'
      };
    }
  }

  /**
   * Check if role name exists
   */
  async roleNameExists(roleName: string, excludeId?: number): Promise<boolean> {
    try {
      let query = 'SELECT id FROM roles WHERE role_name = $1';
      const params = [roleName];

      if (excludeId) {
        query += ' AND id != $2';
        params.push(excludeId);
      }

      const result = await this.db.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking role name existence:', error);
      return false;
    }
  }

  /**
   * Map database row to Role interface
   */
  private mapDbRowToRole(row: any): Role {
    return {
      id: row.id,
      roleName: row.role_name,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    };
  }
}