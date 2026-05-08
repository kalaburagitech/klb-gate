import prisma from '../../utils/prisma';
import { EntryStatus, VisitorType } from '@prisma/client';

export class EntryRepository {
  static async createEntry(data: {
    visitorId: string;
    tenantId: string;
    residentId?: string;
    unitNumber: string;
    purpose?: string;
    comment?: string;
    photoId?: string;
    status: EntryStatus;
    handledById?: string;
    media?: { fileUrl: string, type: string }[];
  }) {
    const { media, ...entryData } = data;
    return prisma.entry.create({
      data: {
        ...entryData,
        checkInTime: data.status === 'CHECKED_IN' ? new Date() : null,
        media: media ? {
          create: media.map(m => ({
            fileUrl: m.fileUrl,
            type: m.type,
            visitorId: data.visitorId
          }))
        } : undefined
      },
      include: { media: true, visitor: true }
    });
  }

  static async findPendingApprovals(tenantId: string) {
    return prisma.entry.findMany({
      where: {
        tenantId,
        status: 'PENDING_APPROVAL'
      },
      include: {
        visitor: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(entryId: string, status: EntryStatus, handledById?: string) {
    return prisma.entry.update({
      where: { id: entryId },
      data: {
        status,
        handledById,
        checkInTime: status === 'CHECKED_IN' ? new Date() : undefined,
        checkOutTime: status === 'CHECKED_OUT' ? new Date() : undefined,
      }
    });
  }

  static async findPreApproved(tenantId: string, code: string) {
    return prisma.preApprovedVisit.findFirst({
      where: {
        tenantId,
        code,
        isUsed: false,
        expectedDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });
  }

  static async markPreApprovedAsUsed(id: string) {
    return prisma.preApprovedVisit.update({
      where: { id },
      data: { isUsed: true }
    });
  }
}
