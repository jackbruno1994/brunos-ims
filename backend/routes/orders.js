const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const orderValidation = [
  body('type').isIn(['purchase', 'sale', 'transfer']).withMessage('Order type must be purchase, sale, or transfer'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number')
];

// @desc    Get all orders
// @route   GET /api/orders
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
    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.orderDate = {};
      if (req.query.dateFrom) {
        filter.orderDate.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.orderDate.$lte = new Date(req.query.dateTo);
      }
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name sku unit')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ orderDate: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    })
      .populate('items.product', 'name sku unit category')
      .populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Manager/Admin)
router.post('/', protect, authorize('manager', 'admin'), orderValidation, async (req, res) => {
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

    const { type, items, supplier, customer, notes, expectedDeliveryDate } = req.body;

    // Verify all products exist and belong to user's restaurant
    const productIds = items.map(item => item.product);
    const products = await Product.find({
      _id: { $in: productIds },
      restaurant: req.user.restaurant,
      country: req.user.country,
      isActive: true
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found or not accessible'
      });
    }

    // Validate items and check stock for sales
    const validatedItems = [];
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      
      // For sales, check if we have enough stock
      if (type === 'sale' && product.stock.current < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock.current}, Requested: ${item.quantity}`
        });
      }

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      });
    }

    const order = await Order.create({
      type,
      items: validatedItems,
      supplier,
      customer,
      notes,
      expectedDeliveryDate,
      createdBy: req.user._id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    // Update stock for sales and purchases
    if (type === 'sale') {
      // Decrease stock for sales
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { 'stock.current': -item.quantity } }
        );
      }
    } else if (type === 'purchase') {
      // Increase stock for purchases
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { 'stock.current': item.quantity } }
        );
      }
    }

    // Populate the created order
    await order.populate('items.product', 'name sku unit');
    await order.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Manager/Admin)
router.patch('/:id/status', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, confirmed, shipped, delivered, cancelled)'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    }).populate('items.product', 'name sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;

    // Set delivery date if status is delivered
    if (status === 'delivered' && !order.actualDeliveryDate) {
      order.actualDeliveryDate = new Date();
    }

    // Handle stock reversal for cancelled orders
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      if (order.type === 'sale') {
        // Restore stock for cancelled sales
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { 'stock.current': item.quantity } }
          );
        }
      } else if (order.type === 'purchase') {
        // Reduce stock for cancelled purchases
        for (const item of order.items) {
          const product = await Product.findById(item.product._id);
          const newStock = product.stock.current - item.quantity;
          if (newStock >= 0) {
            await Product.findByIdAndUpdate(
              item.product._id,
              { $inc: { 'stock.current': -item.quantity } }
            );
          }
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent deletion of confirmed/shipped/delivered orders
    if (['confirmed', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete orders that are confirmed, shipped, or delivered'
      });
    }

    // Reverse stock changes if order was processed
    if (order.status !== 'cancelled') {
      if (order.type === 'sale') {
        // Restore stock for sales
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { 'stock.current': item.quantity } }
          );
        }
      } else if (order.type === 'purchase') {
        // Reduce stock for purchases
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          const newStock = product.stock.current - item.quantity;
          if (newStock >= 0) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { 'stock.current': -item.quantity } }
            );
          }
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting order'
    });
  }
});

module.exports = router;