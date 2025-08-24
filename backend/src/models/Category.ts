import { Schema, model } from 'mongoose';
import { Category } from '@brunos-ims/shared';

const categorySchema = new Schema<Category>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ restaurantId: 1 });
categorySchema.index({ name: 1, restaurantId: 1 }, { unique: true });

export const CategoryModel = model<Category>('Category', categorySchema);