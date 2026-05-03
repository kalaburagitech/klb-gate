import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../middleware/error.middleware';
import { redisConnection } from '../../config/redis';
import prisma from '../../utils/prisma';

export class AuthService {
  static async sendOTP(phoneNumber: string) {
    // Clean phone number (strip +91 and spaces)
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10})/, '');
    
    console.log(`[AuthService] Attempting OTP for cleaned number: ${cleanPhone}`);

    // 1. Check if user exists with this phone (Flexible search)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: cleanPhone },
          { phoneNumber: `+91${cleanPhone}` },
          { phoneNumber: `91${cleanPhone}` }
        ]
      }
    });

    if (!user) {
      console.warn(`[AuthService] Number ${cleanPhone} not found in DB`);
      throw new AppError('Phone number not registered. Please contact your society admin.', 404);
    }

    // 2. Generate 6-digit OTP (Default 123456 for easy testing)
    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Store in Redis (Expires in 5 minutes)
    await redisConnection.set(`otp:${phoneNumber}`, otp, 'EX', 300);

    // 4. Mock sending SMS (Highly visible in console for testing)
    console.log('\n' + '='.repeat(40));
    console.log(`🔑 OTP GENERATED: ${otp}`);
    console.log(`📱 TARGET: ${phoneNumber}`);
    console.log('='.repeat(40) + '\n');
    
    return { 
      success: true, 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    };
  }

  static async verifyOTP(phoneNumber: string, otp: string) {
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91(?=\d{10})/, '');
    const storedOtp = await redisConnection.get(`otp:${cleanPhone}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Clear OTP after success
    await redisConnection.del(`otp:${cleanPhone}`);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: cleanPhone },
          { phoneNumber: `+91${cleanPhone}` },
          { phoneNumber: `91${cleanPhone}` }
        ]
      },
      include: { tenant: { include: { region: true } }, organization: true }
    });

    if (!user) throw new AppError('User not found', 404);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        unitNumber: user.unitNumber,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' } // Longer session for mobile
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        unitNumber: user.unitNumber,
        tenant: user.tenant,
        organization: user.organization
      },
    };
  }

  static async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: { include: { region: true } }, organization: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
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
        unitNumber: user.unitNumber
      },
    };
  }
}
