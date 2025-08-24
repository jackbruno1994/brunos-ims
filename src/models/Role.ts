import mongoose, { Schema, Document, Types } from 'mongoose';
import { Role as IRole } from '../types';

export interface RoleDocument extends IRole, Document {
  _id: Types.ObjectId;
}

const roleSchema = new Schema<RoleDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  permissions: [{
    type: String,
    required: true,
  }],
  hierarchyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 10,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for better query performance
roleSchema.index({ name: 1 });
roleSchema.index({ hierarchyLevel: 1 });
roleSchema.index({ isActive: 1 });

// Validate permissions array is not empty
roleSchema.pre('save', function(next) {
  if (!this.permissions || this.permissions.length === 0) {
    next(new Error('Role must have at least one permission'));
  } else {
    next();
  }
});

export const Role = mongoose.model<RoleDocument>('Role', roleSchema);