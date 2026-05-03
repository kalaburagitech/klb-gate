import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/error.middleware';

export class UnitController {
  // Search for unit/resident by number or phone
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) throw new AppError('Tenant context missing', 403);
      if (!q) throw new AppError('Search query required', 400);

      const queryStr = String(q);

      // Search for Residents
      const residents = await prisma.user.findMany({
        where: {
          tenantId,
          role: 'RESIDENT',
          OR: [
            { firstName: { contains: queryStr, mode: 'insensitive' } },
            { lastName: { contains: queryStr, mode: 'insensitive' } },
            { phoneNumber: { contains: queryStr } },
            { unit: { unitNumber: { contains: queryStr } } }
          ]
        },
        include: {
          unit: true
        },
        take: 10
      });

      // Map to a clean list for the Guard UI
      const formatted = residents.map(r => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        phone: r.phoneNumber,
        unitNumber: r.unit?.unitNumber || 'N/A',
        unitId: r.unitId
      }));

      res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  }

  // List all units for a tenant
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId: queryTenantId } = req.query;
      const tenantId = (queryTenantId as string) || req.user?.tenantId;

      if (!tenantId) throw new AppError('Tenant context required', 400);

      const units = await prisma.unit.findMany({
        where: { tenantId },
        orderBy: { unitNumber: 'asc' }
      });
      res.status(200).json({ success: true, data: units });
    } catch (error) {
      next(error);
    }
  }
}
