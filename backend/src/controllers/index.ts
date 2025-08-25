import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { OrderStatus, OrderPriority, OrderType } from '../models';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const orderData = {
        ...req.body,
        status: OrderStatus.PENDING,
        priority: req.body.priority || OrderPriority.NORMAL,
        paymentStatus: 'pending' as const
      };

      const order = await orderService.createOrder(orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order status'
        });
      }

      const order = await orderService.updateOrderStatus(orderId, status);
      
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrdersByRestaurant(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { status } = req.query;
      
      let orders = await orderService.getOrdersByRestaurant(restaurantId);
      
      if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
        orders = orders.filter(order => order.status === status);
      }

      res.status(200).json({
        success: true,
        data: orders,
        total: orders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrderQueue(req: Request, res: Response) {
    try {
      const { restaurantId } = req.query;
      const queue = await orderService.getOrderQueue(restaurantId as string);
      
      res.status(200).json({
        success: true,
        data: queue,
        total: queue.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order queue',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrderMetrics(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate, days } = req.query;
      
      let start: Date, end: Date;
      
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else {
        const daysCount = parseInt(days as string) || 7;
        end = new Date();
        start = new Date();
        start.setDate(start.getDate() - daysCount);
      }

      const metrics = await orderService.getOrderMetrics(restaurantId, start, end);
      const avgProcessingTime = await orderService.getAverageProcessingTime(restaurantId, 7);
      const volumeAnalytics = await orderService.getOrderVolumeAnalytics(restaurantId, 7);
      
      res.status(200).json({
        success: true,
        data: {
          metrics,
          averageProcessingTime: avgProcessingTime,
          volumeAnalytics,
          period: { startDate: start, endDate: end }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrderAnalytics(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      const { days } = req.query;
      
      const daysCount = parseInt(days as string) || 7;
      const analytics = await orderService.getOrderVolumeAnalytics(restaurantId, daysCount);
      const avgProcessingTime = await orderService.getAverageProcessingTime(restaurantId, daysCount);
      
      res.status(200).json({
        success: true,
        data: {
          ...analytics,
          averageProcessingTime: avgProcessingTime
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

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