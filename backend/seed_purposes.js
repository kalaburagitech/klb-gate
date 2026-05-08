const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaultPurposes = [
    'Delivery', 'Friend', 'Relative', 'Meeting', 'Maintenance', 
    'Food Delivery', 'Courier', 'Maid', 'Milk', 'Newspaper', 
    'Water Can', 'Electrician', 'Plumber', 'Other'
  ];

  console.log('Seeding purposes...');
  for (const name of defaultPurposes) {
    await prisma.visitorPurpose.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
