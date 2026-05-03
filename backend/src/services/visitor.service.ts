import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export class VisitorService {
  static async createVisitor(data: { name: string; phone: string; email?: string; tenantId: string }) {
    // Check if visitor already exists in this tenant
    const existing = await prisma.visitor.findUnique({
      where: {
        phone_tenantId: {
          phone: data.phone,
          tenantId: data.tenantId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return await prisma.visitor.create({
      data,
    });
  }

  static async getVisitors(tenantId: string) {
    return await prisma.visitor.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
