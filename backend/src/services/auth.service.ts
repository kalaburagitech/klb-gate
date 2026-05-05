import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true, organization: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        unitId: user.unitId,
        unitNumber: user.unitNumber,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant,
        organization: user.organization,
      },
    };
  }
}
