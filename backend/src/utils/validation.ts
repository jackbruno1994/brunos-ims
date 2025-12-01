import Joi from 'joi';

// Restaurant validation schemas
export const createRestaurantSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  location: Joi.string().required().min(2).max(100),
  country: Joi.string().required().min(2).max(50),
  address: Joi.string().required().min(10).max(200),
  phone: Joi.string().required().pattern(/^[\+]?[1-9][\d]{0,15}$/),
  email: Joi.string().email().required(),
  managerId: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'MAINTENANCE').default('ACTIVE'),
});

export const updateRestaurantSchema = createRestaurantSchema.fork(
  ['name', 'location', 'country', 'address', 'phone', 'email', 'managerId'],
  (schema) => schema.optional()
);

// User validation schemas
export const createUserSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  passwordHash: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'STAFF').default('STAFF'),
  restaurantId: Joi.string().optional().allow(null),
  country: Joi.string().required().min(2).max(50),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

export const updateUserSchema = createUserSchema.fork(
  ['firstName', 'lastName', 'email', 'passwordHash', 'country'],
  (schema) => schema.optional()
);

// Supplier validation schemas
export const createSupplierSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  contactName: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().required().pattern(/^[\+]?[1-9][\d]{0,15}$/),
  address: Joi.string().required().min(10).max(200),
  country: Joi.string().required().min(2).max(50),
  restaurantId: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE'),
});

export const updateSupplierSchema = createSupplierSchema.fork(
  ['name', 'contactName', 'email', 'phone', 'address', 'country', 'restaurantId'],
  (schema) => schema.optional()
);

// Inventory Item validation schemas
export const createInventoryItemSchema = Joi.object({
  sku: Joi.string().required().min(3).max(50),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  category: Joi.string().required().min(2).max(50),
  unit: Joi.string().required().min(1).max(20),
  unitPrice: Joi.number().positive().precision(2).required(),
  minStock: Joi.number().integer().min(0).default(0),
  maxStock: Joi.number().integer().min(0).optional().allow(null),
  currentStock: Joi.number().integer().min(0).default(0),
  restaurantId: Joi.string().required(),
  supplierId: Joi.string().optional().allow(null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DISCONTINUED').default('ACTIVE'),
});

export const updateInventoryItemSchema = createInventoryItemSchema.fork(
  ['sku', 'name', 'category', 'unit', 'unitPrice', 'restaurantId'],
  (schema) => schema.optional()
);

// Stock Movement validation schemas
export const createStockMovementSchema = Joi.object({
  itemId: Joi.string().required(),
  type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').required(),
  quantity: Joi.number().integer().positive().required(),
  reason: Joi.string().optional().max(200),
  reference: Joi.string().optional().max(100),
  createdBy: Joi.string().required(),
});

// Purchase Order validation schemas
export const createPurchaseOrderSchema = Joi.object({
  orderNumber: Joi.string().required().min(3).max(50),
  supplierId: Joi.string().required(),
  restaurantId: Joi.string().required(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED').default('PENDING'),
  totalAmount: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).default('USD'),
  orderDate: Joi.date().default(Date.now),
  expectedDate: Joi.date().greater('now').optional().allow(null),
  receivedDate: Joi.date().optional().allow(null),
  createdBy: Joi.string().required(),
  notes: Joi.string().optional().max(500),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.fork(
  ['orderNumber', 'supplierId', 'restaurantId', 'totalAmount', 'createdBy'],
  (schema) => schema.optional()
);

// Purchase Order Item validation schemas
export const createPurchaseOrderItemSchema = Joi.object({
  orderId: Joi.string().required(),
  itemId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  unitPrice: Joi.number().positive().precision(2).required(),
  totalPrice: Joi.number().positive().precision(2).required(),
  receivedQty: Joi.number().integer().min(0).default(0),
});

// Menu Item validation schemas
export const createMenuItemSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  price: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).default('USD'),
  category: Joi.string().required().min(2).max(50),
  restaurantId: Joi.string().required(),
  availability: Joi.boolean().default(true),
  allergens: Joi.array().items(Joi.string()).default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.fork(
  ['name', 'price', 'category', 'restaurantId'],
  (schema) => schema.optional()
);

// Common validation helpers
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

// Validation middleware helper
export const validateSchema = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Parameter validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    req.params = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Query validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    req.query = value;
    next();
  };
};