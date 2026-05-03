import { Router } from 'express';
import { VisitorController } from './visitor.controller';
import { authenticate, tenantIsolation } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(tenantIsolation);

router.post('/entries', VisitorController.createEntry);
router.get('/entries', VisitorController.listAll);
router.get('/entries/pending', VisitorController.listPending);
router.get('/entries/my-unit', VisitorController.listByUnit);
router.get('/entries/unit/:unitNumber', VisitorController.listByUnit);
router.post('/entries/:entryId/checkin', VisitorController.checkIn);
router.post('/entries/checkout', VisitorController.checkOut);
router.patch('/entries/:entryId/approval', VisitorController.updateApproval);

// Pre-approvals
router.post('/pre-approved', VisitorController.createPreApprovedVisit);
router.get('/pre-approved', VisitorController.listPreApproved);
router.get('/pre-approved/verify/:code', VisitorController.verifyPreApprovedVisit);

export default router;
