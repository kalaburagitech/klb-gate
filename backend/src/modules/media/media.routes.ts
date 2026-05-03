import { Router } from 'express';
import multer from 'multer';
import { MediaController } from './media.controller';
import { authenticate, tenantIsolation } from '../../middleware/auth.middleware';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protected media routes
router.post(
  '/upload', 
  authenticate, 
  tenantIsolation, 
  upload.single('file'), 
  MediaController.upload
);

router.get(
  '/:id', 
  authenticate, 
  tenantIsolation, 
  MediaController.getUrl
);

export default router;
