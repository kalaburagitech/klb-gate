import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KLB Connect Enterprise System...');

  // 1. Create Super Admin
  const superAdminPassword = await bcrypt.hash('Admin@123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@klbconnect.com' },
    update: {},
    create: {
      email: 'superadmin@klbconnect.com',
      password: superAdminPassword,
      firstName: 'KLB',
      lastName: 'SuperAdmin',
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'klb-global' },
    update: {},
    create: {
      name: 'KLB Global Security',
      slug: 'klb-global',
    },
  });
  console.log('✅ Organization created:', org.name);

  // 3. Create Regions
  const regions = ['Bangalore North', 'Bangalore South', 'Mumbai West'];
  const regionIds: string[] = [];
  for (const rName of regions) {
    const region = await prisma.region.create({
      data: {
        name: rName,
        organizationId: org.id,
      }
    });
    regionIds.push(region.id);
  }
  console.log('✅ Regions created:', regions.join(', '));

  // 4. Create Sample Tenant (Society) under Bangalore North
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'forest-hills' },
    update: { regionId: regionIds[0] },
    create: {
      name: 'Forest Hills Residency',
      slug: 'forest-hills',
      organizationId: org.id,
      regionId: regionIds[0],
      address: '123 Green Valley, Bangalore',
    },
  });
  console.log('✅ Sample Tenant created:', tenant.name);

  // 5. Create Tenant Admin
  const tenantAdminPassword = await bcrypt.hash('Tenant@123', 10);
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@foresthills.com' },
    update: {},
    create: {
      email: 'admin@foresthills.com',
      password: tenantAdminPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: Role.TENANT_ADMIN,
      tenantId: tenant.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Tenant Admin created:', tenantAdmin.email);

  // 6. Create Resident (for testing mobile)
  const residentPassword = await bcrypt.hash('Resident@123', 10);
  const resident = await prisma.user.upsert({
    where: { email: 'rahul@gmail.com' },
    update: { unitNumber: '12345', tenantId: tenant.id },
    create: {
      email: 'rahul@gmail.com',
      password: residentPassword,
      firstName: 'Rahul',
      lastName: 'Balbatti',
      role: Role.RESIDENT,
      phoneNumber: '9108080161',
      unitNumber: '12345',
      tenantId: tenant.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Resident created:', resident.email);

  // 7. Create Sample Units
  const units = ['12345', 'A-101', 'A-102', 'B-201', 'B-202'];
  for (const u of units) {
    await prisma.unit.upsert({
      where: { unitNumber_tenantId: { unitNumber: u, tenantId: tenant.id } },
      update: {},
      create: {
        unitNumber: u,
        tenantId: tenant.id,
      },
    });
  }
  console.log('✅ Sample Units created:', units.join(', '));

  // 8. Create Amenities
  const amenities = [
    { name: 'Swimming Pool', openTime: '06:00', closeTime: '21:00', capacity: 20 },
    { name: 'Gymnasium', openTime: '05:00', closeTime: '23:00', capacity: 15 },
    { name: 'Clubhouse', openTime: '09:00', closeTime: '22:00', capacity: 50 },
    { name: 'Tennis Court', openTime: '06:00', closeTime: '19:00', capacity: 4 },
  ];
  for (const a of amenities) {
    await prisma.amenity.create({
      data: {
        ...a,
        tenantId: tenant.id,
      }
    });
  }
  console.log('✅ Sample Amenities created');

  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
