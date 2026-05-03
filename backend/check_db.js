const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT' },
      select: { id: true, firstName: true, unitNumber: true, tenantId: true }
    });
    console.log('--- RESIDENTS IN DB ---');
    console.log(JSON.stringify(residents, null, 2));

    const entries = await prisma.entry.findMany({
      where: { unitNumber: '100' },
      select: { id: true, unitNumber: true, tenantId: true, status: true }
    });
    console.log('\n--- ENTRIES FOR UNIT 100 ---');
    console.log(JSON.stringify(entries, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
