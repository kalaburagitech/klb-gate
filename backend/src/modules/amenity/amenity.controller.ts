import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/error.middleware';

export class AmenityController {
  // List all amenities for a tenant
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new AppError('Tenant context missing', 403);

      const amenities = await prisma.amenity.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' }
      });

      res.status(200).json({ success: true, data: amenities });
    } catch (error) {
      next(error);
    }
  }

  // Create a booking
  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { amenityId, date, startTime, endTime } = req.body;
      const userId = req.user?.id as string;
      const tenantId = req.user?.tenantId;

      if (!userId || !tenantId) throw new AppError('Unauthorized', 401);

      // Check for overlap (Simple check for now)
      const existing = await prisma.booking.findFirst({
        where: {
          amenityId,
          date: new Date(date),
          status: 'CONFIRMED',
          OR: [
            { startTime: { lte: startTime }, endTime: { gte: startTime } },
            { startTime: { lte: endTime }, endTime: { gte: endTime } }
          ]
        }
      });

      if (existing) {
        throw new AppError('This slot is already booked', 400);
      }

      const booking = await prisma.booking.create({
        data: {
          amenityId,
          userId,
          tenantId,
          date: new Date(date),
          startTime,
          endTime,
          status: 'CONFIRMED'
        },
        include: { amenity: true }
      });

      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  // List user's bookings
  static async listMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      if (!userId) throw new AppError('Unauthorized', 401);

      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { amenity: true },
        orderBy: { date: 'desc' }
      });

      res.status(200).json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  }

  // Cancel booking
  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.id as string;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId as string }
      });

      if (!booking || booking.userId !== userId) {
        throw new AppError('Booking not found or unauthorized', 404);
      }

      await prisma.booking.update({
        where: { id: bookingId as string },
        data: { status: 'CANCELLED' }
      });

      res.status(200).json({ success: true, message: 'Booking cancelled' });
    } catch (error) {
      next(error);
    }
  }
}
