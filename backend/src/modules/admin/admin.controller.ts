import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import { AppError } from '../../middleware/error.middleware';

export class AdminController {
  // Organizations
  static async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug } = req.body;
      const org = await prisma.organization.create({
        data: { name, slug }
      });
      res.status(201).json({ success: true, data: org });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('An organization with this slug already exists', 400));
      }
      next(error);
    }
  }

  static async listOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const orgs = await prisma.organization.findMany({
        include: { 
          regions: {
            include: { _count: { select: { tenants: true } } }
          },
          _count: { select: { regions: true } } 
        }
      });

      // Map to include total tenant count
      const formatted = orgs.map(org => {
        const totalTenants = org.regions.reduce((sum, region) => sum + region._count.tenants, 0);
        return {
          ...org,
          _count: {
            regions: org._count.regions,
            tenants: totalTenants
          }
        };
      });

      res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, slug, logoUrl } = req.body;
      const org = await prisma.organization.update({
        where: { id },
        data: { name, slug, logoUrl }
      });
      res.status(200).json({ success: true, data: org });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('An organization with this slug already exists', 400));
      }
      next(error);
    }
  }

  static async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check for regions
      const regionsCount = await prisma.region.count({ where: { organizationId: id } });
      if (regionsCount > 0) {
        throw new AppError('Cannot delete organization with active regions', 400);
      }

      await prisma.organization.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Organization deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Regions
  static async createRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, organizationId: bodyOrgId } = req.body;
      let organizationId = req.user?.organizationId || bodyOrgId || null;

      // Inference for legacy admins or tenant-scoped admins
      if (!organizationId && req.user?.tenantId) {
        const tenant = await (require('../../utils/prisma').default).tenant.findUnique({ where: { id: req.user.tenantId } });
        organizationId = tenant?.organizationId || null;
      }

      if (!organizationId) throw new AppError('Organization context required', 400);

      const region = await prisma.region.create({
        data: { name, organizationId }
      });
      res.status(201).json({ success: true, data: region });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('A region with this name already exists in this organization', 400));
      }
      next(error);
    }
  }

  static async listRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId || req.query.organizationId;
      const tenantId = req.user?.tenantId;
      const role = req.user?.role;

      let orgId = organizationId;

      // Inference for organization-less admins
      if (!orgId && role === 'TENANT_ADMIN' && tenantId) {
        const tenant = await (require('../../utils/prisma').default).tenant.findUnique({ where: { id: tenantId } });
        orgId = tenant?.organizationId || null;
      }

      let where: any = orgId ? { organizationId: String(orgId) } : {};

      const regions = await prisma.region.findMany({
        where,
        include: { 
          _count: { select: { tenants: true } },
          organization: true
        }
      });
      res.status(200).json({ success: true, data: regions });
    } catch (error) {
      next(error);
    }
  }

  // Create User (Guard/Officer/Resident)
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, phoneNumber, unitId, tenantId, password } = req.body;
      const adminRole = req.user?.role;
      const adminOrgId = req.user?.organizationId;

      // 0. Security Check: Ensure admin is managing within their organization
      if (adminRole !== 'SUPER_ADMIN' && tenantId) {
        const targetTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (targetTenant?.organizationId !== adminOrgId) {
          throw new AppError('Access forbidden: Cannot move user to a different organization', 403);
        }
      }

      // 1. Get existing user to check unit change
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) throw new AppError('User not found', 404);

      // 2. Validate unit belongs to tenant if both provided
      if (unitId && tenantId) {
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        if (unit && unit.tenantId !== tenantId) {
          throw new AppError('Selected unit does not belong to the selected society', 400);
        }
      }

      // 3. Get Unit Number if unitId changed
      let unitNumber = existingUser.unitNumber;
      if (unitId !== existingUser.unitId) {
        if (unitId) {
          const unit = await prisma.unit.findUnique({ where: { id: unitId } });
          unitNumber = unit?.unitNumber || null;
        } else {
          unitNumber = null;
        }
      }

      const updateData: any = {
        firstName,
        lastName,
        role,
        phoneNumber,
        unitId: unitId || null,
        unitNumber,
        tenantId: tenantId || null
      };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // 4. Update User
      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      // 4. Handle Unit Occupancy Changes
      if (existingUser.unitId !== unitId) {
        // Clear old unit
        if (existingUser.unitId) {
          await prisma.unit.update({
            where: { id: existingUser.unitId },
            data: { isOccupied: false }
          });
        }
        // Mark new unit as occupied
        if (unitId) {
          await prisma.unit.update({
            where: { id: unitId },
            data: { isOccupied: true }
          });
        }
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;
      const adminRole = req.user?.role;
      const adminOrgId = req.user?.organizationId;

      if (id === adminId) {
        throw new AppError('You cannot delete your own account', 400);
      }
      
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new AppError('User not found', 404);

      // Security Check: Non-super admins can only delete users in their own organization
      if (adminRole !== 'SUPER_ADMIN') {
        if (user.organizationId !== adminOrgId) {
          throw new AppError('Access forbidden: user belongs to a different organization', 403);
        }
      }

      // Clear unit occupancy if it was a resident
      if (user.unitId) {
        await prisma.unit.update({
          where: { id: user.unitId },
          data: { isOccupied: false }
        });
      }

      await prisma.user.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, role, phoneNumber, idProofUrl, unitId, tenantId: bodyTenantId, organizationId: bodyOrgId } = req.body;
      const tenantId = req.user?.tenantId;
      const adminRole = req.user?.role;

      console.log(`[AdminController] Creating user: ${email} (Role: ${role}, AdminRole: ${adminRole})`);

      // Only SUPER_ADMIN can create ORG_ADMIN/TENANT_ADMIN
      // TENANT_ADMIN can create GUARD/OFFICER/RESIDENT for their tenant
      if (adminRole !== 'SUPER_ADMIN' && adminRole !== 'ORG_ADMIN' && !tenantId) {
        throw new AppError('Tenant context required', 403);
      }

      // Determine the target tenant
      let targetTenantId = bodyTenantId || tenantId;
      
      // Security Check: Tenant Admin and Org Admin can only manage users within their organization
      if ((adminRole === 'TENANT_ADMIN' || adminRole === 'ORG_ADMIN') && targetTenantId) {
        const targetTenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } });
        if (targetTenant?.organizationId !== req.user?.organizationId) {
          throw new AppError('Access forbidden: Target society belongs to a different organization', 403);
        }
      }

      // Role-specific validation
      if ((role === 'GUARD' || role === 'OFFICER') && !idProofUrl) {
        throw new AppError('ID Proof document is mandatory for Security Personnel', 400);
      }
      if (role === 'RESIDENT' && !unitId) {
        throw new AppError('Unit assignment is mandatory for Residents', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Determine Organization ID
      let targetOrgId = req.user?.organizationId || bodyOrgId || null;
      if (!targetOrgId && targetTenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } });
        targetOrgId = tenant?.organizationId || null;
      }

      // Get unit number if unitId provided
      let unitNumber = null;
      if (unitId) {
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        unitNumber = unit?.unitNumber || null;
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
          phoneNumber,
          idProofId: idProofUrl, // Map incoming idProofUrl to idProofId schema field
          unitId: unitId || null,
          unitNumber,
          tenantId: role === 'SUPER_ADMIN' ? null : targetTenantId,
          organizationId: targetOrgId
        }
      });

      // Mark unit as occupied if resident
      if (role === 'RESIDENT' && unitId) {
        await prisma.unit.update({
          where: { id: unitId },
          data: { isOccupied: true }
        });
      }

      res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error(`[AdminController] CreateUser Error: ${error.message}`);
      if (error.code === 'P2002') {
        return next(new AppError('A user with this email or phone already exists', 400));
      }
      next(error);
    }
  }

  static async updateRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, organizationId } = req.body;
      const region = await prisma.region.update({
        where: { id },
        data: { name, organizationId }
      });
      res.status(200).json({ success: true, data: region });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('A region with this name already exists in this organization', 400));
      }
      next(error);
    }
  }

  static async deleteRegion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check for tenants
      const tenantsCount = await prisma.tenant.count({ where: { regionId: id } });
      if (tenantsCount > 0) {
        throw new AppError('Cannot delete region with active societies', 400);
      }

      await prisma.region.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Region deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Create Tenant
  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, address, organizationId: bodyOrgId, regionId, startUnit, endUnit } = req.body;
      let organizationId = req.user?.organizationId || bodyOrgId || null;

      // Inference for legacy admins or tenant-scoped admins
      if (!organizationId && req.user?.tenantId) {
        const tenant = await (require('../../utils/prisma').default).tenant.findUnique({ where: { id: req.user.tenantId } });
        organizationId = tenant?.organizationId || null;
      }

      if (!organizationId) throw new AppError('Organization context required', 400);

      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          address,
          organizationId,
          regionId: regionId || null
        }
      });

      // Auto-generate units if range provided
      if (startUnit && endUnit) {
        const units = [];
        for (let i = parseInt(startUnit); i <= parseInt(endUnit); i++) {
          units.push({
            unitNumber: String(i),
            tenantId: tenant.id,
            isOccupied: false
          });
        }
        await prisma.unit.createMany({ data: units });
      }

      res.status(201).json({ success: true, data: tenant });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('A society with this slug already exists', 400));
      }
      next(error);
    }
  }

  static async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, slug, address, organizationId, regionId } = req.body;
      const tenant = await prisma.tenant.update({
        where: { id },
        data: { name, slug, address, organizationId, regionId }
      });
      res.status(200).json({ success: true, data: tenant });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('A society with this slug already exists', 400));
      }
      next(error);
    }
  }

  static async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Check for users
      const usersCount = await prisma.user.count({ where: { tenantId: id } });
      if (usersCount > 0) {
        throw new AppError('Cannot delete society with registered residents/staff', 400);
      }

      // Delete units first
      await prisma.unit.deleteMany({ where: { tenantId: id } });
      await prisma.tenant.delete({ where: { id } });
      
      res.status(200).json({ success: true, message: 'Society deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Add Unit to Tenant
  static async addUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { unitNumber } = req.body;

      const unit = await prisma.unit.create({
        data: {
          unitNumber,
          tenantId
        }
      });

      res.status(201).json({ success: true, data: unit });
    } catch (error) {
      next(error);
    }
  }

  // Listing Methods
  static async listTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId || req.query.organizationId;
      const tenantId = req.user?.tenantId;
      const role = req.user?.role;

      let orgId = organizationId;

      // Inference for organization-less admins
      if (!orgId && role === 'TENANT_ADMIN' && tenantId) {
        const tenant = await (require('../../utils/prisma').default).tenant.findUnique({ where: { id: tenantId } });
        orgId = tenant?.organizationId || null;
      }

      let where: any = {};
      
      if (role === 'SUPER_ADMIN') {
        if (orgId) where.organizationId = String(orgId);
      } else if (role === 'ORG_ADMIN' || role === 'TENANT_ADMIN') {
        where.organizationId = req.user?.organizationId;
      }

      const tenants = await prisma.tenant.findMany({
        where,
        include: { 
          _count: { select: { users: true, units: true } },
          region: true,
          organization: true
        }
      });
      res.status(200).json({ success: true, data: tenants });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const role = req.user?.role;

      const users = await prisma.user.findMany({
        where: role === 'SUPER_ADMIN' ? {} : { tenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phoneNumber: true,
          unitNumber: true,
          unitId: true,
          tenantId: true,
          createdAt: true,
          tenant: { select: { id: true, name: true, region: { select: { name: true } } } },
          organization: { select: { name: true } }
        }
      });
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, tenantId, organizationId } = req.user!;

      const stats: any = {};

      if (role === 'SUPER_ADMIN') {
        const [orgs, regions, tenants, users, visitors] = await Promise.all([
          prisma.organization.count(),
          prisma.region.count(),
          prisma.tenant.count(),
          prisma.user.count({ where: { role: 'RESIDENT' } }),
          prisma.entry.count()
        ]);
        stats.totalOrganizations = orgs;
        stats.totalRegions = regions;
        stats.totalSocieties = tenants;
        stats.totalResidents = users;
        stats.totalVisitorEntries = visitors;
      } else if (role === 'ORG_ADMIN') {
        const [regions, tenants, users] = await Promise.all([
          prisma.region.count({ where: { organizationId } }),
          prisma.tenant.count({ where: { organizationId } }),
          prisma.user.count({ where: { organizationId, role: 'RESIDENT' } })
        ]);
        stats.totalRegions = regions;
        stats.totalSocieties = tenants;
        stats.totalResidents = users;
      } else if (role === 'TENANT_ADMIN' || role === 'GUARD' || role === 'OFFICER') {
        const [users, units, visitors] = await Promise.all([
          prisma.user.count({ where: { tenantId } }),
          prisma.unit.count({ where: { tenantId } }),
          prisma.entry.count({ where: { tenantId } })
        ]);
        stats.totalUsers = users;
        stats.totalUnits = units;
        stats.totalVisitorEntries = visitors;
      }

      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
