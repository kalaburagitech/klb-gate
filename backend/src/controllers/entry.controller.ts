import { Response, NextFunction } from 'express';
import { EntryService } from '../services/entry.service';
import { VisitorService } from '../services/visitor.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export class EntryController {
  static async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { visitorName, visitorPhone, visitorEmail, purpose, photoUrl } = req.body;
      const tenantId = req.user?.tenantId;
      const handledById = req.user?.userId;

      if (!tenantId || !handledById) {
        throw new AppError('Tenant or User context missing', 400);
      }

      // 1. Create or Find Visitor
      const visitor = await VisitorService.createVisitor({
        name: visitorName,
        phone: visitorPhone,
        email: visitorEmail,
        tenantId,
      });

      // 2. Create Entry
      const entry = await EntryService.checkIn({
        visitorId: visitor.id,
        tenantId,
        handledById,
        purpose,
        photoUrl,
      });

      res.status(201).json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) throw new AppError('Tenant context missing', 400);

      const entry = await EntryService.checkOut(id, tenantId);

      res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new AppError('Tenant context missing', 400);

      const entries = await EntryService.getEntries(tenantId);

      res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }
}
