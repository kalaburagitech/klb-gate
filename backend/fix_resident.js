const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const updated = await prisma.user.update({
      where: { id: '28e9ea56-3b2b-40c4-8758-66d4e8ace430' },
      data: { unitNumber: '100' }
    });
    console.log('✅ Resident updated successfully:', updated.firstName, updated.unitNumber);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
