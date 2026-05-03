import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

import { UnitController } from './unit.controller';

const router = Router();

router.use(authenticate);

// Public/Shared Admin Endpoints (Guards can search units/residents)
router.get('/users/search', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'GUARD'), UnitController.search);
router.get('/units/search', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'GUARD'), UnitController.search); // Alias for backward compatibility
router.get('/organizations', authorize('SUPER_ADMIN'), AdminController.listOrganizations);
router.post('/organizations', authorize('SUPER_ADMIN'), AdminController.createOrganization);
router.put('/organizations/:id', authorize('SUPER_ADMIN'), AdminController.updateOrganization);
router.delete('/organizations/:id', authorize('SUPER_ADMIN'), AdminController.deleteOrganization);

// Regions
router.get('/regions', authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'), AdminController.listRegions);
router.post('/regions', authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'), AdminController.createRegion);
router.put('/regions/:id', authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'), AdminController.updateRegion);
router.delete('/regions/:id', authorize('SUPER_ADMIN', 'ORG_ADMIN'), AdminController.deleteRegion);

router.get('/tenants', authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'), AdminController.listTenants);
router.post('/tenants', authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'), AdminController.createTenant);
router.put('/tenants/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.updateTenant);
router.delete('/tenants/:id', authorize('SUPER_ADMIN', 'ORG_ADMIN'), AdminController.deleteTenant);

// Tenant Admin or higher
router.get('/users', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.listUsers);
router.get('/stats', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.getDashboardStats);
router.post('/users', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.createUser);
router.put('/users/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.updateUser);
router.delete('/users/:id', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), AdminController.deleteUser);
router.get('/units', authorize('SUPER_ADMIN', 'TENANT_ADMIN', 'ORG_ADMIN'), UnitController.list);
router.post('/tenants/:tenantId/units', authorize('SUPER_ADMIN', 'TENANT_ADMIN'), AdminController.addUnit);

export default router;
