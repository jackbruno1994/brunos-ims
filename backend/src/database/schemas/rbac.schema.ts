import { Schema, model } from 'mongoose';
import { Permission, Role, UserRole } from '../../types/rbac.types';

const PermissionSchema = new Schema<Permission>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  resource: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const RoleSchema = new Schema<Role>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserRoleSchema = new Schema<UserRole>({
  userId: { type: String, required: true },
  roleId: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { type: String, required: true }
});

// Indexes for optimized queries
UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
RoleSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const PermissionModel = model<Permission>('Permission', PermissionSchema);
export const RoleModel = model<Role>('Role', RoleSchema);
export const UserRoleModel = model<UserRole>('UserRole', UserRoleSchema);