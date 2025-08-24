const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'transfer'],
    required: [true, 'Order type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  supplier: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
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

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    item.totalPrice = item.quantity * item.unitPrice;
    return total + item.totalPrice;
  }, 0);
  next();
});

// Generate order number if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const prefix = this.type.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `${prefix}-${timestamp}`;
  }
  next();
});

// Create indexes
orderSchema.index({ country: 1, restaurant: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ type: 1 });

module.exports = mongoose.model('Order', orderSchema);