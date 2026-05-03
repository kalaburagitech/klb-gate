import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export class EntryService {
  static async checkIn(data: {
    visitorId: string;
    tenantId: string;
    handledById: string;
    purpose?: string;
    photoUrl?: string;
  }) {
    // Check if visitor is already checked in
    const activeEntry = await prisma.entry.findFirst({
      where: {
        visitorId: data.visitorId,
        tenantId: data.tenantId,
        status: 'CHECKED_IN',
      },
    });

    if (activeEntry) {
      throw new AppError('Visitor is already checked in', 400);
    }

    return await prisma.entry.create({
      data: {
        ...data,
        status: 'CHECKED_IN',
        checkInTime: new Date(),
      },
      include: {
        visitor: true,
        handledBy: true,
      },
    });
  }

  static async checkOut(entryId: string, tenantId: string) {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.tenantId !== tenantId) {
      throw new AppError('Entry not found', 404);
    }

    if (entry.status === 'CHECKED_OUT') {
      throw new AppError('Visitor already checked out', 400);
    }

    return await prisma.entry.update({
      where: { id: entryId },
      data: {
        status: 'CHECKED_OUT',
        checkOutTime: new Date(),
      },
    });
  }

  static async getEntries(tenantId: string) {
    return await prisma.entry.findMany({
      where: { tenantId },
      include: {
        visitor: true,
        handledBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });
  }
}
