const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const vet = await prisma.user.upsert({
    where: { email: 'vet@example.com' },
    update: {},
    create: {
      email: 'vet@example.com',
      name: 'Dr. Smith',
      password,
      role: 'VET',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'John Doe',
      password,
      role: 'OWNER',
    },
  });

  const pet = await prisma.pet.create({
    data: {
      name: 'Fluffy',
      species: 'Cat',
      ownerId: owner.id,
    },
  });

  console.log('Seed successful:', { vetEmail: vet.email, ownerEmail: owner.email, petName: pet.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
