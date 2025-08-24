import mongoose, { Schema, Document, Types } from 'mongoose';
import { RoleChangeLog as IRoleChangeLog } from '../types';

export interface RoleChangeLogDocument extends Omit<IRoleChangeLog, 'userId' | 'changedBy'>, Document {
  userId: Types.ObjectId;
  changedBy: Types.ObjectId;
}

const roleChangeLogSchema = new Schema<RoleChangeLogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  oldRole: {
    type: String,
    required: true,
  },
  newRole: {
    type: String,
    required: true,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Index for better query performance
roleChangeLogSchema.index({ userId: 1 });
roleChangeLogSchema.index({ timestamp: -1 });
roleChangeLogSchema.index({ changedBy: 1 });

export const RoleChangeLog = mongoose.model<RoleChangeLogDocument>('RoleChangeLog', roleChangeLogSchema);