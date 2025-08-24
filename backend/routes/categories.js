const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const categoryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters')
];

// @desc    Get all categories
// @route   GET /api/categories
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

    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    const categories = await Category.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Category.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category'
    });
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Manager/Admin)
router.post('/', protect, authorize('manager', 'admin'), categoryValidation, async (req, res) => {
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

    const { name, description } = req.body;

    // Check if category already exists in this restaurant
    const existingCategory = await Category.findOne({
      name: name.trim(),
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists in your restaurant'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating category'
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Manager/Admin)
router.put('/:id', protect, authorize('manager', 'admin'), categoryValidation, async (req, res) => {
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

    const { name, description, isActive } = req.body;

    // Find category
    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        restaurant: req.user.restaurant,
        country: req.user.country,
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists in your restaurant'
        });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating category'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant,
      country: req.user.country
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
});

module.exports = router;