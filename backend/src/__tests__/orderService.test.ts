import { OrderService } from '../services/orderService';
import { OrderStatus, OrderPriority, OrderType } from '../models';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  afterEach(() => {
    orderService.removeAllListeners();
  });

  describe('createOrder', () => {
    it('should create a new order with generated ID and order number', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerId: 'test-customer-id',
        customerInfo: {
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com'
        },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [
          {
            id: 'item-1',
            menuItemId: 'menu-item-1',
            quantity: 2,
            unitPrice: 10.99,
            totalPrice: 21.98
          }
        ],
        subtotal: 21.98,
        tax: 1.76,
        deliveryFee: 0,
        totalAmount: 23.74,
        currency: 'USD',
        estimatedPrepTime: 15,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const order = await orderService.createOrder(orderData);

      expect(order.id).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD-/);
      expect(order.restaurantId).toBe(orderData.restaurantId);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.items).toEqual(orderData.items);
      expect(order.totalAmount).toBe(orderData.totalAmount);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should emit orderCreated event when order is created', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const eventSpy = jest.fn();
      orderService.on('orderCreated', eventSpy);

      await orderService.createOrder(orderData);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        restaurantId: orderData.restaurantId,
        status: OrderStatus.PENDING
      }));
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status and emit event', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const order = await orderService.createOrder(orderData);
      
      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const eventSpy = jest.fn();
      orderService.on('orderStatusUpdated', eventSpy);

      const updatedOrder = await orderService.updateOrderStatus(order.id, OrderStatus.CONFIRMED);

      expect(updatedOrder!.status).toBe(OrderStatus.CONFIRMED);
      expect(updatedOrder!.updatedAt.getTime()).toBeGreaterThanOrEqual(order.updatedAt.getTime());
      expect(eventSpy).toHaveBeenCalledWith({
        orderId: order.id,
        status: OrderStatus.CONFIRMED,
        previousStatus: OrderStatus.PENDING
      });
    });

    it('should throw error for non-existent order', async () => {
      await expect(orderService.updateOrderStatus('non-existent-id', OrderStatus.CONFIRMED))
        .rejects.toThrow('Order with ID non-existent-id not found');
    });

    it('should set completedAt when order is delivered', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const order = await orderService.createOrder(orderData);
      const updatedOrder = await orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);

      expect(updatedOrder!.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getOrder', () => {
    it('should retrieve order by ID', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const createdOrder = await orderService.createOrder(orderData);
      const retrievedOrder = await orderService.getOrder(createdOrder.id);

      expect(retrievedOrder).toEqual(createdOrder);
    });

    it('should return null for non-existent order', async () => {
      const result = await orderService.getOrder('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getOrdersByRestaurant', () => {
    it('should return orders for specific restaurant', async () => {
      const restaurant1Id = 'restaurant-1';
      const restaurant2Id = 'restaurant-2';

      const orderData1 = {
        restaurantId: restaurant1Id,
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const orderData2 = { ...orderData1, restaurantId: restaurant2Id };

      await orderService.createOrder(orderData1);
      await orderService.createOrder(orderData2);
      await orderService.createOrder(orderData1); // Another order for restaurant 1

      const restaurant1Orders = await orderService.getOrdersByRestaurant(restaurant1Id);
      const restaurant2Orders = await orderService.getOrdersByRestaurant(restaurant2Id);

      expect(restaurant1Orders).toHaveLength(2);
      expect(restaurant2Orders).toHaveLength(1);
      expect(restaurant1Orders.every(order => order.restaurantId === restaurant1Id)).toBe(true);
      expect(restaurant2Orders.every(order => order.restaurantId === restaurant2Id)).toBe(true);
    });
  });

  describe('getAverageProcessingTime', () => {
    it('should calculate average processing time for completed orders', async () => {
      const orderData = {
        restaurantId: 'test-restaurant-id',
        customerInfo: { name: 'John Doe' },
        type: OrderType.DINE_IN,
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        items: [{
          id: 'item-1',
          menuItemId: 'menu-item-1',
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10
        }],
        subtotal: 10,
        tax: 0,
        deliveryFee: 0,
        totalAmount: 10,
        currency: 'USD',
        estimatedPrepTime: 10,
        source: 'pos',
        paymentStatus: 'pending' as const
      };

      const order1 = await orderService.createOrder(orderData);
      const order2 = await orderService.createOrder(orderData);
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await orderService.updateOrderStatus(order1.id, OrderStatus.DELIVERED);
      await orderService.updateOrderStatus(order2.id, OrderStatus.DELIVERED);

      const avgTime = await orderService.getAverageProcessingTime('test-restaurant-id');
      
      expect(avgTime).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for restaurants with no completed orders', async () => {
      const avgTime = await orderService.getAverageProcessingTime('non-existent-restaurant');
      expect(avgTime).toBe(0);
    });
  });
});