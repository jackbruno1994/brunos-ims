import { Response } from 'express';
import { validationResult } from 'express-validator';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const { type, products, restaurantId } = req.body;
    const userId = req.user!._id;

    // Calculate total amount and update stock for sales
    let totalAmount = 0;
    const updatedProducts = [];

    for (const item of products) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.productId} not found`
        });
      }

      totalAmount += item.quantity * item.price;

      // Update stock based on order type
      if (type === 'sale') {
        if (product.currentStock < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for product ${product.name}`
          });
        }
        product.currentStock -= item.quantity;
      } else if (type === 'purchase') {
        product.currentStock += item.quantity;
      }

      await product.save();
      updatedProducts.push(item);
    }

    const order = new OrderModel({
      type,
      products: updatedProducts,
      totalAmount,
      restaurantId,
      userId
    });

    await order.save();

    const populatedOrder = await OrderModel
      .findById(order._id)
      .populate('products.productId', 'name unit')
      .populate('restaurantId', 'name')
      .populate('userId', 'username');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.restaurantId) {
      filter.restaurantId = req.query.restaurantId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const orders = await OrderModel
      .find(filter)
      .populate('products.productId', 'name unit')
      .populate('restaurantId', 'name')
      .populate('userId', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await OrderModel.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await OrderModel
      .findById(id)
      .populate('products.productId', 'name unit')
      .populate('restaurantId', 'name')
      .populate('userId', 'username');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderModel
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate('products.productId', 'name unit')
      .populate('restaurantId', 'name')
      .populate('userId', 'username');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getOrderReports = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, startDate, endDate } = req.query;

    const filter: any = {};
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const orders = await OrderModel.find(filter);

    // Calculate summary statistics
    const summary = {
      totalOrders: orders.length,
      totalSales: orders.filter(o => o.type === 'sale').reduce((sum, o) => sum + o.totalAmount, 0),
      totalPurchases: orders.filter(o => o.type === 'purchase').reduce((sum, o) => sum + o.totalAmount, 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: {
        summary,
        orders
      }
    });
  } catch (error) {
    console.error('Get order reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};