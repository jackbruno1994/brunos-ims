import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config';
import { UserService } from '../models/User';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({ message: 'Access token required' });
            return;
        }

        const decoded = jwt.verify(token, appConfig.jwtSecret) as JwtPayload;
        
        // Verify user still exists and is active
        const user = await UserService.findById(decoded.id);
        if (!user || user.status !== 'ACTIVE') {
            res.status(401).json({ message: 'Invalid or inactive user' });
            return;
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(500).json({ message: 'Error authenticating token', error });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ 
                message: 'Insufficient permissions',
                required: roles,
                current: req.user.role,
            });
            return;
        }

        next();
    };
};

// Specific role middleware functions
export const requireAdmin = authorizeRoles('SUPER_ADMIN', 'ADMIN');
export const requireManager = authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER');
export const requireStaff = authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF');

// Rate limiting middleware (basic implementation)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const rateLimitLogin = (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const attempts = loginAttempts.get(ip);
    
    if (attempts) {
        // Reset if window has passed
        if (now - attempts.lastAttempt > windowMs) {
            loginAttempts.delete(ip);
        } else if (attempts.count >= maxAttempts) {
            res.status(429).json({ 
                message: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil((attempts.lastAttempt + windowMs - now) / 1000),
            });
            return;
        }
    }

    // Track this attempt
    const currentAttempts = attempts ? attempts.count + 1 : 1;
    loginAttempts.set(ip, { count: currentAttempts, lastAttempt: now });

    next();
};

// Request validation middleware
export const validateRequest = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            res.status(400).json({
                message: 'Missing required fields',
                missingFields,
            });
            return;
        }

        next();
    };
};