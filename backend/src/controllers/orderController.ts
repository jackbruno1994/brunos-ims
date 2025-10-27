import { Request, Response } from 'express';
import { OrderService, OrderItemService, SupplierService } from '../models/Order';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const orderController = {
    // Order Controllers
    async getAllOrders(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, status, type, supplierId, startDate, endDate } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            
            const where: any = {};
            if (status) {
                where.status = status;
            }
            if (type) {
                where.type = type;
            }
            if (supplierId) {
                where.supplierId = supplierId as string;
            }
            if (startDate || endDate) {
                where.orderDate = {};
                if (startDate) {
                    where.orderDate.gte = new Date(startDate as string);
                }
                if (endDate) {
                    where.orderDate.lte = new Date(endDate as string);
                }
            }

            const [orders, total] = await Promise.all([
                OrderService.findMany(where, { orderDate: 'desc' }, Number(limit), skip),
                OrderService.count(where),
            ]);

            res.json({
                orders,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching orders', error });
        }
    },

    async createOrder(req: AuthenticatedRequest, res: Response) {
        try {
            const { items, ...orderData } = req.body;
            
            // Create the order
            const order = await OrderService.create(orderData);
            
            // Create order items if provided
            if (items && items.length > 0) {
                const orderItems = items.map((item: any) => ({
                    ...item,
                    orderId: order.id,
                    totalPrice: item.quantity * item.unitPrice,
                }));
                
                await OrderItemService.bulkCreate(orderItems);
                
                // Update order total amount
                const totalAmount = orderItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
                await OrderService.update(order.id, { totalAmount });
            }

            // Fetch the complete order with items
            const completeOrder = await OrderService.findById(order.id);
            
            res.status(201).json(completeOrder);
        } catch (error) {
            res.status(400).json({ message: 'Error creating order', error });
        }
    },

    async getOrder(req: Request, res: Response): Promise<void> {
        try {
            const order = await OrderService.findById(req.params.id);
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order', error });
        }
    },

    async updateOrder(req: Request, res: Response): Promise<void> {
        try {
            const order = await OrderService.update(req.params.id, req.body);
            res.json(order);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating order', error });
        }
    },

    async deleteOrder(req: Request, res: Response): Promise<void> {
        try {
            await OrderService.delete(req.params.id);
            res.json({ message: 'Order deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting order', error });
        }
    },

    async updateOrderStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.body;
            const order = await OrderService.updateStatus(req.params.id, status);
            res.json(order);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating order status', error });
        }
    },

    // Order Item Controllers
    async getOrderItems(req: Request, res: Response) {
        try {
            const orderItems = await OrderItemService.findByOrderId(req.params.orderId);
            res.json(orderItems);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching order items', error });
        }
    },

    async addOrderItem(req: Request, res: Response) {
        try {
            const orderItemData = {
                ...req.body,
                orderId: req.params.orderId,
                totalPrice: req.body.quantity * req.body.unitPrice,
            };
            
            const orderItem = await OrderItemService.create(orderItemData);
            res.status(201).json(orderItem);
        } catch (error) {
            res.status(400).json({ message: 'Error adding order item', error });
        }
    },

    async updateOrderItem(req: Request, res: Response): Promise<void> {
        try {
            const updateData = { ...req.body };
            if (req.body.quantity && req.body.unitPrice) {
                updateData.totalPrice = req.body.quantity * req.body.unitPrice;
            }
            
            const orderItem = await OrderItemService.update(req.params.itemId, updateData);
            res.json(orderItem);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Order item not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating order item', error });
        }
    },

    async deleteOrderItem(req: Request, res: Response): Promise<void> {
        try {
            await OrderItemService.delete(req.params.itemId);
            res.json({ message: 'Order item deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Order item not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting order item', error });
        }
    },

    // Supplier Controllers
    async getAllSuppliers(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search, status } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            
            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { contactName: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                ];
            }
            if (status) {
                where.status = status;
            }

            const [suppliers, total] = await Promise.all([
                SupplierService.findMany(where, { name: 'asc' }, Number(limit), skip),
                SupplierService.count(where),
            ]);

            res.json({
                suppliers,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching suppliers', error });
        }
    },

    async createSupplier(req: Request, res: Response) {
        try {
            const supplier = await SupplierService.create(req.body);
            res.status(201).json(supplier);
        } catch (error) {
            res.status(400).json({ message: 'Error creating supplier', error });
        }
    },

    async getSupplier(req: Request, res: Response): Promise<void> {
        try {
            const supplier = await SupplierService.findById(req.params.id);
            if (!supplier) {
                res.status(404).json({ message: 'Supplier not found' });
                return;
            }
            res.json(supplier);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching supplier', error });
        }
    },

    async updateSupplier(req: Request, res: Response): Promise<void> {
        try {
            const supplier = await SupplierService.update(req.params.id, req.body);
            res.json(supplier);
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Supplier not found' });
                return;
            }
            res.status(400).json({ message: 'Error updating supplier', error });
        }
    },

    async deleteSupplier(req: Request, res: Response): Promise<void> {
        try {
            await SupplierService.delete(req.params.id);
            res.json({ message: 'Supplier deleted successfully' });
        } catch (error: any) {
            if (error.code === 'P2025') {
                res.status(404).json({ message: 'Supplier not found' });
                return;
            }
            res.status(500).json({ message: 'Error deleting supplier', error });
        }
    },
};