import { Request, Response, NextFunction } from 'express';
import { MediaService } from './media.service';
import { AppError } from '../../middleware/error.middleware';

export class MediaController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }

      const tag = (req.body.tag as string) || 'visitor_photo';
      const result = await MediaService.uploadMedia(req.file, tag);

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { width, quality } = req.query;

      const url = await MediaService.getMediaUrl(id, {
        width: width ? parseInt(width as string) : undefined,
        quality: quality ? parseInt(quality as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
}
