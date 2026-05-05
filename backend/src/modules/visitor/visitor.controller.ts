import { Request, Response, NextFunction } from 'express';
import { EntryService } from './entry.service';
import { EntryRepository } from './entry.repository';
import { AppError } from '../../middleware/error.middleware';
import prisma from '../../utils/prisma';
import { MediaService } from '../media/media.service';
import { EntryStatus } from '@prisma/client';

export class VisitorController {
  // Guard creates entry
  static async createEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const handledById = req.user?.userId;

      if (!tenantId || !handledById) throw new AppError('Context missing', 403);

      // Map photoUrl from body to photoId for the service
      const { photoUrl, ...rest } = req.body;
      const entry = await EntryService.processNewEntry({
        ...rest,
        photoId: photoUrl, // Using photoUrl from body as photoId
        tenantId,
        handledById
      });

      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  // Resident Approves/Rejects
  static async updateApproval(req: Request, res: Response, next: NextFunction) {
    try {
      // Support entryId from both params (RESTful) and body (Mobile payload)
      const entryId = req.params.entryId || req.body.entryId;
      const { status } = req.body;

      if (!entryId) {
        throw new AppError('Entry ID is required', 400);
      }

      const allowedStatuses: string[] = [EntryStatus.APPROVED, EntryStatus.REJECTED];
      if (!allowedStatuses.includes(status)) throw new AppError('Invalid status', 400);

      const entry = await EntryService.approveEntry(entryId, status);

      res.status(200).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  // Guard Check-in (Physical entry)
  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const entryId = req.params.entryId || req.body.entryId;
      const handledById = req.user?.userId;

      if (!handledById) throw new AppError('Unauthorized', 401);
      if (!entryId) throw new AppError('Entry ID is required', 400);

      const entry = await EntryService.checkIn(entryId, handledById);

      res.status(200).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  // List Pending for Guard
  static async listPending(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new AppError('Context missing', 403);

      const pending = await EntryRepository.findPendingApprovals(tenantId);

      // Transform photoId from ID to full URL
      const formattedPending = await Promise.all(pending.map(async (e: any) => ({
        ...e,
        photoUrl: e.photoId ? await MediaService.getMediaUrl(e.photoId) : null,
        visitor: {
          ...e.visitor,
          photoUrl: e.visitor?.photoId ? await MediaService.getMediaUrl(e.visitor.photoId) : null
        }
      })));

      res.status(200).json({ success: true, data: formattedPending });
    } catch (error) {
      next(error);
    }
  }

  // List for Resident (Unit-specific)
  static async listByUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { unitNumber: paramUnit } = req.params;
      const tenantId = req.user?.tenantId;
      const role = req.user?.role;
      const userUnitId = req.user?.unitId;

      console.log(`🔍 [VisitorController] listByUnit - Role: ${role}, UserUnit: ${userUnitId}, ParamUnit: ${paramUnit}, Tenant: ${tenantId}`);

      if (!tenantId) throw new AppError('Context missing', 403);

      // Residents view their own unit; Guards/Admins can view by param
      let unitNumber = role === 'RESIDENT' ? req.user?.unitNumber : paramUnit;

      if (!unitNumber) {
        console.warn(`⚠️ [VisitorController] No unitNumber found for user ${req.user?.userId}`);
        return res.status(200).json({ success: true, data: [] });
      }

      const entries = await prisma.entry.findMany({
        where: { 
          tenantId: tenantId as string, 
          unitNumber: unitNumber as string 
        },
        include: { visitor: true },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`✅ [VisitorController] Found ${entries.length} entries for unit ${unitId}`);

      // Transform photoId from ID to full URL
      const formattedEntries = await Promise.all(entries.map(async (e: any) => ({
        ...e,
        photoUrl: e.photoId ? await MediaService.getMediaUrl(e.photoId) : null,
        visitor: {
          ...e.visitor,
          photoUrl: e.visitor?.photoId ? await MediaService.getMediaUrl(e.visitor.photoId) : null
        }
      })));

      res.status(200).json({ success: true, data: formattedEntries });
    } catch (error) {
      next(error);
    }
  }

  // List all entries for a tenant (Dashboard)
  static async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new AppError('Context missing', 403);

      const entries = await prisma.entry.findMany({
        where: { tenantId },
        include: { 
          visitor: true,
          handledBy: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform photoId from ID to full URL
      const formattedEntries = await Promise.all(entries.map(async (e: any) => ({
        ...e,
        photoUrl: e.photoId ? await MediaService.getMediaUrl(e.photoId) : null,
        visitor: {
          ...e.visitor,
          photoUrl: e.visitor?.photoId ? await MediaService.getMediaUrl(e.visitor.photoId) : null
        }
      })));

      res.status(200).json({ success: true, data: formattedEntries });
    } catch (error) {
      next(error);
    }
  }

  // Resident creates pre-approved visit
  static async createPreApprovedVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { visitorName, phoneNumber, expectedDate } = req.body;
      const residentId = req.user?.userId;
      const tenantId = req.user?.tenantId;

      console.log(`[Resident] Creating pre-approval for resident ${residentId} in tenant ${tenantId}`);
      console.log('Body:', req.body);

      if (!residentId || !tenantId) throw new AppError('Unauthorized', 401);

      // Generate 6-digit random alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const preApproved = await prisma.preApprovedVisit.create({
        data: {
          tenantId,
          residentId,
          visitorName,
          phoneNumber,
          code,
          expectedDate: new Date(expectedDate as string),
          isUsed: false
        }
      });

      res.status(201).json({ success: true, data: preApproved });
    } catch (error) {
      next(error);
    }
  }

  // Security guard approves a pre‑approved visit and creates an Entry record
  static async approvePreApprovedVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // pre‑approved visit ID
      const guardId = req.user?.userId;
      const tenantId = req.user?.tenantId;

      if (!guardId || !tenantId) throw new AppError('Unauthorized', 401);

      const pre = await prisma.preApprovedVisit.findUnique({ 
        where: { id: id as string },
        include: { resident: true }
      });
      if (!pre) throw new AppError('Pre‑approved visit not found', 404);
      if (pre.isUsed) throw new AppError('Visit already used', 400);

      // Resolve resident unit number
      const resident = await prisma.user.findUnique({ where: { id: pre.residentId } });
      const unitNumber = resident?.unitNumber;

      // Create Entry record linked to the pre‑approved visit
      // Create Entry record linked to the pre‑approved visit
      // Note: PreApprovedVisit doesn't have a visitorId yet because it's a "pre-approval"
      // We should create/find the visitor record now.
      let visitor = await prisma.visitor.findFirst({
        where: { phone: pre.phoneNumber || '', tenantId }
      });

      if (!visitor) {
        visitor = await prisma.visitor.create({
          data: {
            name: pre.visitorName,
            phone: pre.phoneNumber || '',
            tenantId,
            type: 'GUEST'
          }
        });
      }

      const entry = await prisma.entry.create({
        data: {
          tenantId: tenantId as string,
          unitNumber: unitNumber || '',
          visitorId: visitor.id,
          purpose: 'Pre-approved visit',
          status: 'APPROVED',
          handledById: guardId,
        }
      });

      // Mark the pre‑approved visit as used
      await prisma.preApprovedVisit.update({ where: { id: id as string }, data: { isUsed: true } });

      res.status(200).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }


  // List Pre-approved
  static async listPreApproved(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, userId: residentId, tenantId } = req.user!;

      if (!tenantId) throw new AppError('Unauthorized: Tenant context required', 401);

      let where: any = { 
        tenantId,
        isUsed: false // Only show unused pre-approvals
      };

      // Residents only see their own. Guards/Admins see all for the society.
      if (role === 'RESIDENT') {
        where.residentId = residentId;
      }

      const list = await prisma.preApprovedVisit.findMany({
        where,
        include: {
          resident: {
            select: {
              firstName: true,
              lastName: true,
              unitNumber: true
            }
          }
        },
        orderBy: { expectedDate: 'asc' }
      });

      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  // Verify Pre-approved code and return details
  static async verifyPreApprovedVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new AppError('Tenant context missing', 403);

      const preApproved = await prisma.preApprovedVisit.findFirst({
        where: {
          tenantId,
          code: (code as string).toUpperCase(),
          isUsed: false
        },
        include: {
          resident: {
            select: {
              firstName: true,
              lastName: true,
              unitNumber: true
            }
          }
        }
      });

      if (!preApproved) {
        throw new AppError('Invalid or expired code', 404);
      }

      res.status(200).json({ success: true, data: preApproved });
    } catch (error) {
      next(error);
    }
  }

  // Guard Check-out
  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { entryId } = req.body;
      const handledById = req.user?.userId;

      if (!handledById) throw new AppError('Unauthorized', 401);

      const entry = await EntryService.checkOut(entryId, handledById);

      res.status(200).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }
}
