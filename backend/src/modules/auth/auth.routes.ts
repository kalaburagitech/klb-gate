import { Router } from 'express';
import { AuthController } from './auth.controller';

import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/otp/send', AuthController.sendOTP);
router.post('/otp/verify', AuthController.verifyOTP);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
