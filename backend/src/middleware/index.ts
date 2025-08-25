import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

// Configure logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'brunos-ims' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Create logs directory
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs');
}

// Rate limiting middleware
export const orderRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.details || err.message
    });
  }

  // Handle duplicate key errors (MongoDB/Database)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      message: 'Resource already exists'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Please login again'
    });
  }

  // Handle cast errors (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

// Validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return next();
};

// Order validation rules
export const orderValidationRules = [
  body('restaurantId').isUUID().withMessage('Restaurant ID must be a valid UUID'),
  body('type').isIn(['dine_in', 'takeaway', 'delivery', 'catering']).withMessage('Invalid order type'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menuItemId').isUUID().withMessage('Menu item ID must be a valid UUID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('customerInfo.name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
  body('customerInfo.phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('customerInfo.email').optional().isEmail().withMessage('Invalid email address'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a non-negative number'),
  body('estimatedPrepTime').isInt({ min: 1 }).withMessage('Estimated prep time must be a positive integer')
];

// Restaurant validation rules
export const restaurantValidationRules = [
  body('name').trim().isLength({ min: 1 }).withMessage('Restaurant name is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('country').trim().isLength({ min: 2 }).withMessage('Country is required'),
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('phone').isMobilePhone('any').withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('managerId').isUUID().withMessage('Manager ID must be a valid UUID')
];

// Audit logging middleware
export const auditLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful operations
      if (res.statusCode < 400) {
        logger.info({
          action,
          userId: (req as any).user?.id || 'anonymous',
          method: req.method,
          url: req.url,
          ip: req.ip,
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Simple RBAC middleware (placeholder for future implementation)
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement proper JWT verification and role checking
    // For now, just pass through
    // const user = (req as any).user;
    // if (!user || !roles.includes(user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Forbidden',
    //     message: 'Insufficient permissions'
    //   });
    // }
    next();
  };
};

// Health check middleware
export const healthCheck = (req: Request, res: Response) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(healthInfo);
};