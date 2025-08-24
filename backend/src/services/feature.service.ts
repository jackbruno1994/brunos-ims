import DatabaseService from '../database/connection';
import { 
  Feature, 
  FeatureGroup,
  CreateFeatureRequest, 
  UpdateFeatureRequest,
  CreateFeatureGroupRequest,
  UpdateFeatureGroupRequest,
  FeatureFilters,
  PaginatedResponse,
  ApiResponse,
  ActionType,
  FeatureWithGroup,
  FeatureGroupWithFeatures
} from '../types/rbac';
import { AuditService } from './audit.service';

export class FeatureService {
  private db: DatabaseService;
  private auditService: AuditService;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.auditService = new AuditService();
  }

  // Feature Group Management

  /**
   * Create a new feature group
   */
  async createFeatureGroup(groupData: CreateFeatureGroupRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<FeatureGroup>> {
    try {
      const query = `
        INSERT INTO feature_groups (group_name, description, parent_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        groupData.groupName,
        groupData.description || null,
        groupData.parentId || null,
        groupData.createdBy || null
      ]);

      const newGroup = this.mapDbRowToFeatureGroup(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.CREATE,
        tableName: 'feature_groups',
        recordId: newGroup.id,
        newValue: newGroup,
        ipAddress
      });

      return {
        success: true,
        data: newGroup,
        message: 'Feature group created successfully'
      };
    } catch (error: any) {
      console.error('Error creating feature group:', error);
      return {
        success: false,
        error: error.message || 'Failed to create feature group'
      };
    }
  }

  /**
   * Get all feature groups
   */
  async getFeatureGroups(): Promise<ApiResponse<FeatureGroupWithFeatures[]>> {
    try {
      const query = `
        SELECT 
          fg.*,
          json_agg(
            CASE WHEN f.id IS NOT NULL THEN
              json_build_object(
                'id', f.id,
                'featureName', f.feature_name,
                'description', f.description,
                'groupId', f.group_id,
                'createdAt', f.created_at,
                'createdBy', f.created_by,
                'updatedAt', f.updated_at,
                'updatedBy', f.updated_by
              )
            END
          ) FILTER (WHERE f.id IS NOT NULL) as features
        FROM feature_groups fg
        LEFT JOIN features f ON fg.id = f.group_id
        GROUP BY fg.id, fg.group_name, fg.description, fg.parent_id, fg.created_at, fg.created_by, fg.updated_at, fg.updated_by
        ORDER BY fg.group_name
      `;
      
      const result = await this.db.query(query);
      const groups = result.rows.map((row: any) => ({
        ...this.mapDbRowToFeatureGroup(row),
        features: row.features || [],
        children: [] // Will be populated in a separate query if needed
      }));

      return {
        success: true,
        data: groups
      };
    } catch (error: any) {
      console.error('Error fetching feature groups:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch feature groups'
      };
    }
  }

  /**
   * Get feature group by ID
   */
  async getFeatureGroupById(id: number): Promise<ApiResponse<FeatureGroup>> {
    try {
      const query = 'SELECT * FROM feature_groups WHERE id = $1';
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Feature group not found'
        };
      }

      const group = this.mapDbRowToFeatureGroup(result.rows[0]);
      return {
        success: true,
        data: group
      };
    } catch (error: any) {
      console.error('Error fetching feature group:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch feature group'
      };
    }
  }

  /**
   * Update feature group
   */
  async updateFeatureGroup(id: number, updates: UpdateFeatureGroupRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<FeatureGroup>> {
    try {
      // Get existing group for audit
      const existingGroup = await this.getFeatureGroupById(id);
      if (!existingGroup.success) {
        return existingGroup;
      }

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (updates.groupName !== undefined) {
        updateFields.push(`group_name = $${++paramCount}`);
        params.push(updates.groupName);
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${++paramCount}`);
        params.push(updates.description);
      }

      if (updates.parentId !== undefined) {
        updateFields.push(`parent_id = $${++paramCount}`);
        params.push(updates.parentId);
      }

      if (updates.updatedBy !== undefined) {
        updateFields.push(`updated_by = $${++paramCount}`);
        params.push(updates.updatedBy);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length === 1) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      const query = `
        UPDATE feature_groups 
        SET ${updateFields.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING *
      `;
      params.push(id);

      const result = await this.db.query(query, params);
      const updatedGroup = this.mapDbRowToFeatureGroup(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.UPDATE,
        tableName: 'feature_groups',
        recordId: id,
        oldValue: existingGroup.data,
        newValue: updatedGroup,
        ipAddress
      });

      return {
        success: true,
        data: updatedGroup,
        message: 'Feature group updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating feature group:', error);
      return {
        success: false,
        error: error.message || 'Failed to update feature group'
      };
    }
  }

  // Feature Management

  /**
   * Create a new feature
   */
  async createFeature(featureData: CreateFeatureRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<Feature>> {
    try {
      const query = `
        INSERT INTO features (feature_name, description, group_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await this.db.query(query, [
        featureData.featureName,
        featureData.description || null,
        featureData.groupId || null,
        featureData.createdBy || null
      ]);

      const newFeature = this.mapDbRowToFeature(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.CREATE,
        tableName: 'features',
        recordId: newFeature.id,
        newValue: newFeature,
        ipAddress
      });

      return {
        success: true,
        data: newFeature,
        message: 'Feature created successfully'
      };
    } catch (error: any) {
      console.error('Error creating feature:', error);
      return {
        success: false,
        error: error.message || 'Failed to create feature'
      };
    }
  }

  /**
   * Get all features with optional filtering and pagination
   */
  async getFeatures(filters: FeatureFilters = {}): Promise<PaginatedResponse<FeatureWithGroup>> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'feature_name',
        sortOrder = 'ASC',
        groupId,
        search
      } = filters;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (groupId !== undefined) {
        whereClause += ` AND f.group_id = $${++paramCount}`;
        params.push(groupId);
      }

      if (search) {
        whereClause += ` AND (f.feature_name ILIKE $${++paramCount} OR f.description ILIKE $${++paramCount})`;
        params.push(`%${search}%`, `%${search}%`);
        paramCount++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM features f ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results with group information
      const offset = (page - 1) * limit;
      const dataQuery = `
        SELECT 
          f.*,
          fg.group_name,
          fg.description as group_description
        FROM features f
        LEFT JOIN feature_groups fg ON f.group_id = fg.id
        ${whereClause}
        ORDER BY f.${sortBy} ${sortOrder}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;
      params.push(limit, offset);

      const result = await this.db.query(dataQuery, params);
      const features = result.rows.map((row: any) => ({
        ...this.mapDbRowToFeature(row),
        group: row.group_name ? {
          id: row.group_id,
          groupName: row.group_name,
          description: row.group_description,
          parentId: null,
          createdAt: new Date(),
          createdBy: null,
          updatedAt: null,
          updatedBy: null
        } : null
      }));

      return {
        success: true,
        data: features,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      console.error('Error fetching features:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch features'
      };
    }
  }

  /**
   * Get feature by ID
   */
  async getFeatureById(id: number): Promise<ApiResponse<Feature>> {
    try {
      const query = 'SELECT * FROM features WHERE id = $1';
      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Feature not found'
        };
      }

      const feature = this.mapDbRowToFeature(result.rows[0]);
      return {
        success: true,
        data: feature
      };
    } catch (error: any) {
      console.error('Error fetching feature:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch feature'
      };
    }
  }

  /**
   * Update feature
   */
  async updateFeature(id: number, updates: UpdateFeatureRequest, userId?: number, ipAddress?: string): Promise<ApiResponse<Feature>> {
    try {
      // Get existing feature for audit
      const existingFeature = await this.getFeatureById(id);
      if (!existingFeature.success) {
        return existingFeature;
      }

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      if (updates.featureName !== undefined) {
        updateFields.push(`feature_name = $${++paramCount}`);
        params.push(updates.featureName);
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${++paramCount}`);
        params.push(updates.description);
      }

      if (updates.groupId !== undefined) {
        updateFields.push(`group_id = $${++paramCount}`);
        params.push(updates.groupId);
      }

      if (updates.updatedBy !== undefined) {
        updateFields.push(`updated_by = $${++paramCount}`);
        params.push(updates.updatedBy);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updateFields.length === 1) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      const query = `
        UPDATE features 
        SET ${updateFields.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING *
      `;
      params.push(id);

      const result = await this.db.query(query, params);
      const updatedFeature = this.mapDbRowToFeature(result.rows[0]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.UPDATE,
        tableName: 'features',
        recordId: id,
        oldValue: existingFeature.data,
        newValue: updatedFeature,
        ipAddress
      });

      return {
        success: true,
        data: updatedFeature,
        message: 'Feature updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating feature:', error);
      return {
        success: false,
        error: error.message || 'Failed to update feature'
      };
    }
  }

  /**
   * Delete feature
   */
  async deleteFeature(id: number, userId?: number, ipAddress?: string): Promise<ApiResponse<void>> {
    try {
      // Get existing feature for audit
      const existingFeature = await this.getFeatureById(id);
      if (!existingFeature.success) {
        return {
          success: false,
          error: existingFeature.error
        };
      }

      // Check if feature is used in permissions
      const permissionQuery = 'SELECT COUNT(*) FROM permissions WHERE feature_id = $1';
      const permissionResult = await this.db.query(permissionQuery, [id]);
      const permissionCount = parseInt(permissionResult.rows[0].count);

      if (permissionCount > 0) {
        return {
          success: false,
          error: `Cannot delete feature: it is used in ${permissionCount} permission(s)`
        };
      }

      const query = 'DELETE FROM features WHERE id = $1';
      await this.db.query(query, [id]);

      // Log audit
      await this.auditService.logAction({
        userId,
        actionType: ActionType.DELETE,
        tableName: 'features',
        recordId: id,
        oldValue: existingFeature.data,
        ipAddress
      });

      return {
        success: true,
        message: 'Feature deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting feature:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete feature'
      };
    }
  }

  /**
   * Get feature by name
   */
  async getFeatureByName(featureName: string): Promise<ApiResponse<Feature>> {
    try {
      const query = 'SELECT * FROM features WHERE feature_name = $1';
      const result = await this.db.query(query, [featureName]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Feature not found'
        };
      }

      const feature = this.mapDbRowToFeature(result.rows[0]);
      return {
        success: true,
        data: feature
      };
    } catch (error: any) {
      console.error('Error fetching feature by name:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch feature'
      };
    }
  }

  /**
   * Map database row to FeatureGroup interface
   */
  private mapDbRowToFeatureGroup(row: any): FeatureGroup {
    return {
      id: row.id,
      groupName: row.group_name,
      description: row.description,
      parentId: row.parent_id,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    };
  }

  /**
   * Map database row to Feature interface
   */
  private mapDbRowToFeature(row: any): Feature {
    return {
      id: row.id,
      featureName: row.feature_name,
      description: row.description,
      groupId: row.group_id,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    };
  }
}