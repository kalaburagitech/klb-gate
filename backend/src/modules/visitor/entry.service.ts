import { EntryRepository } from './entry.repository';
import { VisitorRepository } from './visitor.repository';
import { AppError } from '../../middleware/error.middleware';
import { EntryStatus, VisitorType } from '@prisma/client';
import { notificationQueue } from '../notification/notification.queue';
import prisma from '../../utils/prisma';

export class EntryService {
  static async processNewEntry(data: {
    name: string;
    phone: string;
    type: VisitorType;
    unitNumber: string;
    tenantId: string;
    photoId?: string;
    purpose?: string;
    verificationCode?: string; // For Pre-approved
    handledById: string;
  }) {
    // 1. Get or Create Visitor
    let visitor = await VisitorRepository.findByPhoneAndTenant(data.phone, data.tenantId);
    if (!visitor) {
      visitor = await VisitorRepository.create({
        name: data.name,
        phone: data.phone,
        type: data.type,
        tenantId: data.tenantId,
        photoId: data.photoId,
        createdBy: data.handledById
      });
    }

    // 2. Logic based on type
    let status: EntryStatus = EntryStatus.PENDING_APPROVAL;

    if (data.type === VisitorType.PRE_APPROVED) {
      if (!data.verificationCode) throw new AppError('Verification code required', 400);
      const preApproved = await EntryRepository.findPreApproved(data.tenantId, data.verificationCode);
      
      if (!preApproved) throw new AppError('Invalid or expired verification code', 400);
      
      status = EntryStatus.APPROVED;
      await EntryRepository.markPreApprovedAsUsed(preApproved.id);
    } 
    else if (data.type === VisitorType.DAILY_SERVICE) {
      // In a real system, we'd check if this visitor is registered as a daily service for this tenant/unit
      status = EntryStatus.APPROVED;
    }

    // 3. Create Entry
    const entry = await EntryRepository.createEntry({
      visitorId: visitor.id,
      tenantId: data.tenantId,
      unitNumber: data.unitNumber,
      purpose: data.purpose,
      photoId: data.photoId,
      status,
      handledById: data.handledById
    });

    // 4. Trigger Notification for Residents
    try {
      const residents = await prisma.user.findMany({
        where: { 
          tenantId: data.tenantId,
          unit: { unitNumber: data.unitNumber },
          role: 'RESIDENT'
        },
        select: { id: true }
      });
      
      for (const res of residents) {
        await notificationQueue.add('visitor_alert', {
          userId: res.id,
          message: `${data.name} is at the gate for your unit.`,
          type: 'VISITOR_APPROVAL',
          entryId: entry.id
        });
      }
    } catch (e) {
      console.error('Failed to queue notifications', e);
    }

    return entry;
  }

  static async approveEntry(entryId: string, status: EntryStatus) {
    if (![EntryStatus.APPROVED, EntryStatus.REJECTED].includes(status)) {
      throw new AppError('Invalid status update', 400);
    }

    return EntryRepository.updateStatus(entryId, status);
  }

  static async checkIn(entryId: string, handledById: string) {
    const entry = await EntryRepository.updateStatus(entryId, EntryStatus.CHECKED_IN, handledById);
    return entry;
  }

  static async checkOut(entryId: string, handledById: string) {
    const entry = await EntryRepository.updateStatus(entryId, EntryStatus.CHECKED_OUT, handledById);
    return entry;
  }
}
