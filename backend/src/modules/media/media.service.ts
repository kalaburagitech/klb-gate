import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/error.middleware';

export class MediaService {
  private static readonly BASE_URL = 'https://klb-media-production.up.railway.app';
  private static readonly API_KEY = process.env.STORAGE_API_KEY || 'ac91e0de11f091043c6fb6f5f62ce56de8deb4321c9e8ed8188d76770091e6e7';

  /**
   * Uploads a file to the KLB Media Production Service.
   * @param file - Express Multer file object
   */
  static async uploadMedia(file: Express.Multer.File, tag: string = 'visitor_photo'): Promise<{ id: string, url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('media_tag', tag);

      logger.info(`MediaService: Uploading ${file.originalname} to KLB Production Service`);

      const response = await axios.post(`${this.BASE_URL}/api/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': this.API_KEY
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data || !response.data.id) {
        logger.error('MediaService: Invalid Response from Production Service:', response.data);
        throw new Error('Upload failed: Production service did not return an asset ID');
      }

      const assetId = response.data.id;
      const mediaUrl = `${this.BASE_URL}/api/media/${assetId}`;

      logger.info(`MediaService: Successfully uploaded asset ${assetId}`);

      return {
        id: assetId,
        url: mediaUrl,
      };
    } catch (error: any) {
      if (error.response) {
        logger.error('MediaService: KLB Media Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new AppError('Failed to process media upload through KLB Media Production', 502);
    }
  }

  /**
   * Retrieves media metadata or optimized URL.
   * @param id - Asset ID
   */
  static async getMediaUrl(id: string, options?: { width?: number, quality?: number }): Promise<string> {
    let url = `${this.BASE_URL}/api/media/${id}`;
    
    if (options) {
      const params = new URLSearchParams();
      if (options.width) params.append('width', options.width.toString());
      if (options.quality) params.append('quality', options.quality.toString());
      url += `?${params.toString()}`;
    }

    return url;
  }
}
