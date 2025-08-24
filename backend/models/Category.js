const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
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
  timestamps: true
});

// Create compound index for unique category per restaurant
categorySchema.index({ name: 1, restaurant: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);