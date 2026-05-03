import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { logger } from '../config/logger';

export interface JWTPayload {
  id: string;
  userId: string;
  role: string;
  tenantId: string;
  organizationId: string;
  unitNumber?: string;
  unitId?: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(`[AuthMiddleware] Incoming request: ${req.method} ${req.path}`);
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn(`[AuthMiddleware] Missing or invalid token for ${req.path}`);
      throw new AppError('Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    logger.warn(`Auth failure: ${error.message}`);
    next(new AppError('Unauthorized', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Access forbidden: insufficient permissions', 403);
    }
    next();
  };
};

export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  const tenantIdFromHeader = req.headers['x-tenant-id'];
  
  // Super Admin can bypass tenant isolation
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user?.tenantId) {
    return next(new AppError('Tenant context missing', 403));
  }

  // Cross-verify header tenant with token tenant if provided
  if (tenantIdFromHeader && tenantIdFromHeader !== req.user.tenantId) {
    logger.error(`Tenant mismatch attempt! User ${req.user.userId} tried to access tenant ${tenantIdFromHeader}`);
    return next(new AppError('Tenant isolation violation', 403));
  }

  next();
};
