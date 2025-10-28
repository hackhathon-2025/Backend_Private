const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data (optional, for development)
  await prisma.prediction.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared existing data.');

  const users = [];
  for (let i = 0; i < 5; i++) {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: password,
      },
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }

  const groups = [];
  for (let i = 0; i < 3; i++) {
    const owner = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const group = await prisma.group.create({
      data: {
        name: faker.lorem.words(2),
        isPublic: faker.datatype.boolean(),
        ownerId: owner.id,
      },
    });
    groups.push(group);
    console.log(`Created group: ${group.name} owned by ${owner.username}`);

    // Add owner as a member
    await prisma.groupMember.create({
      data: {
        userId: owner.id,
        groupId: group.id,
      },
    });

    // Add some other random users to the group
    const numMembers = faker.number.int({ min: 1, max: users.length - 1 });
    for (let j = 0; j < numMembers; j++) {
      const member = users[faker.number.int({ min: 0, max: users.length - 1 })];
      if (member.id !== owner.id) { // Ensure owner is not added twice
        try {
          await prisma.groupMember.create({
            data: {
              userId: member.id,
              groupId: group.id,
            },
          });
        } catch (e) {
          // Ignore unique constraint errors if member already exists
        }
      }
    }
  }

  // Create some predictions
  for (let i = 0; i < 10; i++) {
    const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const group = groups[faker.number.int({ min: 0, max: groups.length - 1 })];
    const matchId = faker.number.int({ min: 1, max: 100 });
    const winnerId = faker.number.int({ min: 1, max: 2 }); // Assuming 2 players per match

    try {
      await prisma.prediction.create({
        data: {
          userId: user.id,
          groupId: group.id,
          matchId: matchId,
          winnerId: winnerId,
        },
      });
    } catch (e) {
      // Ignore unique constraint errors if prediction already exists
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
