import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async sendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber } = req.body;
      const result = await AuthService.sendOTP(phoneNumber);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, otp } = req.body;
      const result = await AuthService.verifyOTP(phoneNumber, otp);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.validateUser(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const user = await (require('../../utils/prisma').default).user.findUnique({
        where: { id: userId },
        include: { tenant: { include: { region: true } }, organization: true }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenant: user.tenant,
          organization: user.organization,
          tenantId: user.tenantId,
          organizationId: user.organizationId
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
