import { Response } from 'express';
import { validationResult } from 'express-validator';
import { ProductModel } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const product = new ProductModel(req.body);
    await product.save();

    const populatedProduct = await ProductModel
      .findById(product._id)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.restaurantId) {
      filter.restaurantId = req.query.restaurantId;
    }
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    const products = await ProductModel
      .find(filter)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ProductModel.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getLowStockProducts = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantId = req.query.restaurantId;
    const filter: any = {
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    };

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    const products = await ProductModel
      .find(filter)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name')
      .sort({ currentStock: 1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel
      .findById(id)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel
      .findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};