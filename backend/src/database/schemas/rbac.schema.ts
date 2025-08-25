import { Schema, model, Document, Types } from 'mongoose';
import { Permission, Role, UserRole } from '../../types/rbac.types';

// Interface for Mongoose documents
export interface PermissionDocument extends Omit<Permission, 'id'>, Document {
  id: string;
}

export interface RoleDocument extends Omit<Role, 'id' | 'permissions'>, Document {
  id: string;
  permissions: Types.ObjectId[];
}

export interface UserRoleDocument extends UserRole, Document {}

// Permission Schema
const permissionSchema = new Schema<PermissionDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  resource: { type: String, required: true },
  action: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

// Role Schema
const roleSchema = new Schema<RoleDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

// User Role Schema
const userRoleSchema = new Schema<UserRoleDocument>({
  userId: { type: String, required: true },
  roleId: { type: String, required: true },
  assignedBy: { type: String, required: true },
  assignedAt: { type: Date, required: true }
});

// Create indexes for better performance
permissionSchema.index({ id: 1 });
permissionSchema.index({ resource: 1, action: 1 });

roleSchema.index({ id: 1 });
roleSchema.index({ name: 1 });

userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export const PermissionModel = model<PermissionDocument>('Permission', permissionSchema);
export const RoleModel = model<RoleDocument>('Role', roleSchema);
export const UserRoleModel = model<UserRoleDocument>('UserRole', userRoleSchema);