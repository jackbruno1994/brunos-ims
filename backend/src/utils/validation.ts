import Joi from 'joi';

// Base validation schemas
const idSchema = Joi.string().min(1).max(50);
const nameSchema = Joi.string().min(1).max(255);
const emailSchema = Joi.string().email();
const phoneSchema = Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/);
const decimalSchema = Joi.number().precision(6).positive();
const quantitySchema = Joi.number().precision(3).min(0);
const moneySchema = Joi.number().precision(2).min(0);

// Supplier validation schemas
export const createSupplierSchema = Joi.object({
  name: nameSchema.required(),
  contactEmail: emailSchema.optional().allow(null),
  contactPhone: phoneSchema.optional().allow(null),
  address: Joi.string().max(500).optional().allow(null),
  country: Joi.string().max(100).optional().allow(null),
  active: Joi.boolean().default(true),
});

export const updateSupplierSchema = Joi.object({
  name: nameSchema.optional(),
  contactEmail: emailSchema.optional().allow(null),
  contactPhone: phoneSchema.optional().allow(null),
  address: Joi.string().max(500).optional().allow(null),
  country: Joi.string().max(100).optional().allow(null),
  active: Joi.boolean().optional(),
});

// UOM validation schemas
export const createUOMSchema = Joi.object({
  name: nameSchema.required(),
  abbreviation: Joi.string().min(1).max(10).required(),
  type: Joi.string().valid('weight', 'volume', 'count', 'length', 'area', 'time').required(),
  baseUnit: Joi.boolean().default(false),
});

export const updateUOMSchema = Joi.object({
  name: nameSchema.optional(),
  abbreviation: Joi.string().min(1).max(10).optional(),
  type: Joi.string().valid('weight', 'volume', 'count', 'length', 'area', 'time').optional(),
  baseUnit: Joi.boolean().optional(),
});

// Conversion validation schemas
export const createConversionSchema = Joi.object({
  fromUomId: idSchema.required(),
  toUomId: idSchema.required(),
  factor: decimalSchema.required(),
});

export const updateConversionSchema = Joi.object({
  fromUomId: idSchema.optional(),
  toUomId: idSchema.optional(),
  factor: decimalSchema.optional(),
});

// Location validation schemas
export const createLocationSchema = Joi.object({
  name: nameSchema.required(),
  description: Joi.string().max(500).optional().allow(null),
  locationType: Joi.string().valid('warehouse', 'kitchen', 'prep', 'storage', 'freezer', 'cooler', 'dry').required(),
  active: Joi.boolean().default(true),
});

export const updateLocationSchema = Joi.object({
  name: nameSchema.optional(),
  description: Joi.string().max(500).optional().allow(null),
  locationType: Joi.string().valid('warehouse', 'kitchen', 'prep', 'storage', 'freezer', 'cooler', 'dry').optional(),
  active: Joi.boolean().optional(),
});

// Item validation schemas
export const createItemSchema = Joi.object({
  name: nameSchema.required(),
  description: Joi.string().max(1000).optional().allow(null),
  sku: Joi.string().max(50).optional().allow(null),
  category: Joi.string().max(100).optional().allow(null),
  uomId: idSchema.required(),
  minStock: quantitySchema.optional().allow(null),
  maxStock: quantitySchema.optional().allow(null),
  costPerBase: moneySchema.optional().allow(null),
  active: Joi.boolean().default(true),
});

export const updateItemSchema = Joi.object({
  name: nameSchema.optional(),
  description: Joi.string().max(1000).optional().allow(null),
  sku: Joi.string().max(50).optional().allow(null),
  category: Joi.string().max(100).optional().allow(null),
  uomId: idSchema.optional(),
  minStock: quantitySchema.optional().allow(null),
  maxStock: quantitySchema.optional().allow(null),
  costPerBase: moneySchema.optional().allow(null),
  active: Joi.boolean().optional(),
});

// Purchase Order validation schemas
export const createPurchaseOrderSchema = Joi.object({
  orderNumber: Joi.string().min(1).max(100).required(),
  supplierId: idSchema.required(),
  status: Joi.string().valid('pending', 'ordered', 'received', 'cancelled').default('pending'),
  orderDate: Joi.date().default(() => new Date()),
  expectedDate: Joi.date().optional().allow(null),
  totalAmount: moneySchema.optional().allow(null),
  notes: Joi.string().max(1000).optional().allow(null),
});

export const updatePurchaseOrderSchema = Joi.object({
  orderNumber: Joi.string().min(1).max(100).optional(),
  supplierId: idSchema.optional(),
  status: Joi.string().valid('pending', 'ordered', 'received', 'cancelled').optional(),
  orderDate: Joi.date().optional(),
  expectedDate: Joi.date().optional().allow(null),
  totalAmount: moneySchema.optional().allow(null),
  notes: Joi.string().max(1000).optional().allow(null),
});

// Receipt validation schemas
export const createReceiptSchema = Joi.object({
  purchaseOrderId: idSchema.required(),
  receiptNumber: Joi.string().min(1).max(100).required(),
  receivedDate: Joi.date().default(() => new Date()),
  receivedBy: Joi.string().max(100).optional().allow(null),
  notes: Joi.string().max(1000).optional().allow(null),
});

// Stock Move validation schemas
export const createStockMoveSchema = Joi.object({
  itemId: idSchema.required(),
  qtyBase: quantitySchema.required(),
  costPerBase: moneySchema.optional().allow(null),
  source: Joi.string().max(100).optional().allow(null),
  destination: Joi.string().max(100).optional().allow(null),
  reason: Joi.string().valid(
    'received', 'transferred', 'consumed', 'adjustment', 'waste', 'production', 'sale'
  ).required(),
  reference: Joi.string().max(100).optional().allow(null),
  locationId: idSchema.optional().allow(null),
});

// Recipe validation schemas
export const createRecipeSchema = Joi.object({
  name: nameSchema.required(),
  description: Joi.string().max(1000).optional().allow(null),
  yieldUom: Joi.string().max(50).required(),
  yieldQtyBase: quantitySchema.required(),
  instructions: Joi.string().max(5000).optional().allow(null),
  active: Joi.boolean().default(true),
});

export const updateRecipeSchema = Joi.object({
  name: nameSchema.optional(),
  description: Joi.string().max(1000).optional().allow(null),
  yieldUom: Joi.string().max(50).optional(),
  yieldQtyBase: quantitySchema.optional(),
  instructions: Joi.string().max(5000).optional().allow(null),
  active: Joi.boolean().optional(),
});

// Recipe Item validation schemas
export const createRecipeItemSchema = Joi.object({
  recipeId: idSchema.required(),
  itemId: idSchema.required(),
  qtyBase: quantitySchema.required(),
  lossPct: Joi.number().min(0).max(100).precision(2).default(0),
});

// Batch validation schemas
export const createBatchSchema = Joi.object({
  recipeId: idSchema.required(),
  batchNumber: Joi.string().min(1).max(100).required(),
  producedQtyBase: quantitySchema.required(),
  productionDate: Joi.date().default(() => new Date()),
  notes: Joi.string().max(1000).optional().allow(null),
});

// Count validation schemas
export const createCountSchema = Joi.object({
  locationId: idSchema.required(),
  itemId: idSchema.required(),
  qtyBase: quantitySchema.required(),
  countDate: Joi.date().default(() => new Date()),
  countedBy: Joi.string().max(100).optional().allow(null),
  variance: quantitySchema.optional().allow(null),
  notes: Joi.string().max(1000).optional().allow(null),
});

// Wastage Log validation schemas
export const createWastageLogSchema = Joi.object({
  itemId: idSchema.required(),
  qtyBase: quantitySchema.required(),
  reason: Joi.string().valid(
    'expired', 'damaged', 'contaminated', 'overproduction', 'preparation_loss', 'spillage', 'other'
  ).required(),
  cost: moneySchema.optional().allow(null),
  wasteDate: Joi.date().default(() => new Date()),
  notes: Joi.string().max(1000).optional().allow(null),
});

// Query parameter validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const itemFiltersSchema = paginationSchema.keys({
  category: Joi.string().max(100).optional(),
  active: Joi.boolean().optional(),
  search: Joi.string().max(255).optional(),
  uomId: idSchema.optional(),
});

export const stockMoveFiltersSchema = paginationSchema.keys({
  itemId: idSchema.optional(),
  locationId: idSchema.optional(),
  reason: Joi.string().valid(
    'received', 'transferred', 'consumed', 'adjustment', 'waste', 'production', 'sale'
  ).optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
});

export const purchaseOrderFiltersSchema = paginationSchema.keys({
  supplierId: idSchema.optional(),
  status: Joi.string().valid('pending', 'ordered', 'received', 'cancelled').optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
});

// ID parameter validation
export const idParamSchema = Joi.object({
  id: idSchema.required(),
});

// Database URL validation
export const databaseUrlSchema = Joi.string().pattern(
  /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+(\?.+)?$/
).required();

// Environment validation schema
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  DATABASE_URL: databaseUrlSchema,
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
  DB_POOL_MIN: Joi.number().integer().min(0).default(2),
  DB_POOL_MAX: Joi.number().integer().min(1).default(20),
  DB_POOL_IDLE_TIMEOUT: Joi.number().integer().min(1000).default(30000),
  DB_CONNECTION_TIMEOUT: Joi.number().integer().min(1000).default(5000),
  DB_MAX_RETRIES: Joi.number().integer().min(1).default(3),
  JWT_SECRET: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_TO_FILE: Joi.boolean().default(false),
});

/**
 * Validate data against a schema and return formatted result
 */
export function validateData<T>(data: any, schema: Joi.Schema): { isValid: boolean; value?: T; errors?: string[] } {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
    };
  }
  
  return {
    isValid: true,
    value: value as T,
  };
}

/**
 * Middleware to validate request parameters
 */
export function validateParams(schema: Joi.Schema) {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.details.map(detail => detail.message),
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
}

/**
 * Middleware to validate request body
 */
export function validateBody(schema: Joi.Schema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.details.map(detail => detail.message),
        timestamp: new Date().toISOString(),
      });
    }
    req.body = value; // Use validated and potentially transformed data
    next();
  };
}

/**
 * Middleware to validate query parameters
 */
export function validateQuery(schema: Joi.Schema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.details.map(detail => detail.message),
        timestamp: new Date().toISOString(),
      });
    }
    req.query = value; // Use validated and potentially transformed data
    next();
  };
}