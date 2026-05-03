import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const STORAGE_BASE_URL = process.env.STORAGE_BASE_URL || 'https://klb-media-production.up.railway.app';
const STORAGE_API_KEY = process.env.STORAGE_API_KEY || 'ac91e0de11f091043c6fb6f5f62ce56de8deb4321c9e8ed8188d76770091e6e7';

export class MediaService {
  static async uploadFile(filePath: string, fileName: string) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('fileName', fileName);

      const response = await axios.post(`${STORAGE_BASE_URL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': STORAGE_API_KEY,
        },
      });

      return response.data.url; // Assuming the API returns { url: "..." }
    } catch (error) {
      console.error('Media upload failed:', error);
      throw new Error('Failed to upload media');
    }
  }
}
