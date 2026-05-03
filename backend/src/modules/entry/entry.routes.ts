import { Router } from 'express';
import { VisitorController } from '../visitor/visitor.controller';
import { authenticate, tenantIsolation } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post('/request', VisitorController.createEntry);
router.post('/approve', VisitorController.updateApproval);
router.post('/checkin', VisitorController.checkIn);
router.post('/:entryId/checkin', VisitorController.checkIn);
router.post('/checkout', VisitorController.checkOut);

router.get('/pending', VisitorController.listPending);
router.get('/my-unit', VisitorController.listByUnit);
router.get('/unit/:unitNumber', VisitorController.listByUnit);
router.get('/all', VisitorController.listAll);

export default router;
