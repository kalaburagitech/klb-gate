const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const pre = await prisma.preApprovedVisit.findMany();
    console.log('--- PRE-APPROVED VISITS ---');
    console.log(JSON.stringify(pre, null, 2));
  } catch (e) {
    console.error('ERROR CHECKING PRE-APPROVED VISITS:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
