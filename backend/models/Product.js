const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  stock: {
    current: {
      type: Number,
      required: [true, 'Current stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    minimum: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock cannot be negative'],
      default: 0
    },
    maximum: {
      type: Number,
      min: [0, 'Maximum stock cannot be negative']
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'kg', 'liter', 'gram', 'ml', 'box', 'pack'],
    default: 'piece'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  restaurant: {
    type: String,
    required: [true, 'Restaurant is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock.current <= 0) return 'out-of-stock';
  if (this.stock.current <= this.stock.minimum) return 'low-stock';
  return 'in-stock';
});

// Virtual field for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.cost === 0) return 0;
  return ((this.price - this.cost) / this.cost * 100).toFixed(2);
});

// Create indexes for better performance
productSchema.index({ country: 1, restaurant: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);