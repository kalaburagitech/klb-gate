import prisma from '../../utils/prisma';

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { 
        tenant: true, 
        organization: true 
      },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
