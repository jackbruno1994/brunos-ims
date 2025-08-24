const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const productValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('sku').trim().isLength({ min: 2, max: 50 }).withMessage('SKU must be between 2 and 50 characters'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('stock.current').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('stock.minimum').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('stock.maximum').optional().isInt({ min: 0 }).withMessage('Maximum stock must be a non-negative integer'),
  body('unit').isIn(['piece', 'kg', 'liter', 'gram', 'ml', 'box', 'pack']).withMessage('Invalid unit')
];

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by user's restaurant and country
    const filter = {
      restaurant: req.user.restaurant,
      country: req.user.country
    };

    // Additional filters
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'low-stock') {
        filter.$expr = { $lte: ['$stock.current', '$stock.minimum'] };
      } else if (req.query.stockStatus === 'out-of-stock') {
        filter['stock.current'] = 0;
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    }).populate('category', 'name description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Manager/Admin)
router.post('/', protect, authorize('manager', 'admin'), productValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, sku, category, price, cost, stock, unit } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Verify category exists and belongs to user's restaurant
    const categoryExists = await Category.findOne({
      _id: category,
      restaurant: req.user.restaurant,
      country: req.user.country,
      isActive: true
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found or not accessible'
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      sku: sku.toUpperCase(),
      category,
      price,
      cost,
      stock,
      unit,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    // Populate category before sending response
    await product.populate('category', 'name description');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Manager/Admin)
router.put('/:id', protect, authorize('manager', 'admin'), productValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, sku, category, price, cost, stock, unit, isActive } = req.body;

    // Find product
    const product = await Product.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if new SKU conflicts with existing product
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({
        sku: sku.toUpperCase(),
        _id: { $ne: req.params.id }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Verify category if changing
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findOne({
        _id: category,
        restaurant: req.user.restaurant,
        country: req.user.country,
        isActive: true
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found or not accessible'
        });
      }
    }

    // Update fields
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (sku) product.sku = sku.toUpperCase();
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (cost !== undefined) product.cost = cost;
    if (stock) product.stock = { ...product.stock, ...stock };
    if (unit) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    await product.populate('category', 'name description');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { adjustment, reason } = req.body;

    if (!adjustment || typeof adjustment !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Stock adjustment amount is required and must be a number'
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newStock = product.stock.current + adjustment;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    product.stock.current = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          stockStatus: product.stockStatus
        },
        adjustment,
        reason
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating stock'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

module.exports = router;