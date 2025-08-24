import { Schema, model } from 'mongoose';
import { Product } from '@brunos-ims/shared';

const productSchema = new Schema<Product>({
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
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  unit: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better performance
productSchema.index({ restaurantId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ name: 1, restaurantId: 1 }, { unique: true });

export const ProductModel = model<Product>('Product', productSchema);