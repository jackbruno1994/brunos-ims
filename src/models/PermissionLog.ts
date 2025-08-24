import mongoose, { Schema, Document, Types } from 'mongoose';
import { PermissionLog as IPermissionLog } from '../types';

export interface PermissionLogDocument extends Omit<IPermissionLog, 'roleId' | 'updatedBy'>, Document {
  roleId: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

const permissionLogSchema = new Schema<PermissionLogDocument>({
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  permission: {
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['added', 'removed'],
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
permissionLogSchema.index({ roleId: 1 });
permissionLogSchema.index({ timestamp: -1 });
permissionLogSchema.index({ updatedBy: 1 });

export const PermissionLog = mongoose.model<PermissionLogDocument>('PermissionLog', permissionLogSchema);