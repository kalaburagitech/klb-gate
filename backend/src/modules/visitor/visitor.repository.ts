import prisma from '../../utils/prisma';

export class VisitorRepository {
  static async findByPhoneAndTenant(phone: string, tenantId: string) {
    return prisma.visitor.findUnique({
      where: {
        phone_tenantId: { phone, tenantId },
      },
    });
  }

  static async create(data: { name: string; phone: string; type?: any; photoId?: string; tenantId: string; createdBy?: string }) {
    // Filter out fields not in the Prisma schema for Visitor (like createdBy)
    const { createdBy, ...validData } = data;
    return prisma.visitor.create({
      data: validData as any,
    });
  }

  static async listByTenant(tenantId: string) {
    return prisma.visitor.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
