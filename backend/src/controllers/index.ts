import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

// Example controller for restaurant management
export class RestaurantController {
  static async getAllRestaurants(req: Request, res: Response) {
    try {
      // TODO: Implement database query
      res.status(200).json({
        message: 'Get all restaurants',
        data: []
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch restaurants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createRestaurant(req: Request, res: Response) {
    try {
      // TODO: Implement restaurant creation
      res.status(201).json({
        message: 'Restaurant created successfully',
        data: req.body
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Order Controller
export class OrderController {
  static async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = OrderService.getAllOrders(page, limit);

      res.status(200).json({
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = OrderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          error: 'Order not found',
          message: `No order found with ID: ${id}`
        });
        return;
      }

      res.status(200).json({
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const validation = OrderService.validateOrderData(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          error: 'Invalid order data',
          message: 'Please fix the following errors',
          errors: validation.errors
        });
        return;
      }

      // Calculate total price for each item
      const orderData = {
        ...req.body,
        items: req.body.items.map((item: any) => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      const newOrder = OrderService.createOrder(orderData);

      res.status(201).json({
        message: 'Order created successfully',
        data: newOrder
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // For updates, we typically only allow status changes or minor modifications
      const allowedUpdates = ['status', 'notes'];
      const updateData: any = {};

      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: 'No valid fields to update',
          message: 'Allowed fields: status, notes'
        });
        return;
      }

      const updatedOrder = OrderService.updateOrder(id, updateData);

      if (!updatedOrder) {
        res.status(404).json({
          error: 'Order not found',
          message: `No order found with ID: ${id}`
        });
        return;
      }

      res.status(200).json({
        message: 'Order updated successfully',
        data: updatedOrder
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cancelledOrder = OrderService.cancelOrder(id);

      if (!cancelledOrder) {
        res.status(404).json({
          error: 'Order not found',
          message: `No order found with ID: ${id}`
        });
        return;
      }

      res.status(200).json({
        message: 'Order cancelled successfully',
        data: cancelledOrder
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to cancel order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}