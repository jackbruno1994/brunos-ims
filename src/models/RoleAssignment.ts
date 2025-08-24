import mongoose, { Schema, Document, Types } from 'mongoose';
import { RoleAssignment as IRoleAssignment } from '../types';

export interface RoleAssignmentDocument extends Omit<IRoleAssignment, 'userId' | 'roleId' | 'assignedBy'>, Document {
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  assignedBy: Types.ObjectId;
}

const roleAssignmentSchema = new Schema<RoleAssignmentDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
roleAssignmentSchema.index({ userId: 1 });
roleAssignmentSchema.index({ roleId: 1 });
roleAssignmentSchema.index({ isActive: 1 });
roleAssignmentSchema.index({ startDate: 1 });

export const RoleAssignment = mongoose.model<RoleAssignmentDocument>('RoleAssignment', roleAssignmentSchema);