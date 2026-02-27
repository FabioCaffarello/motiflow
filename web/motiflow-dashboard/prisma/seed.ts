import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample epic
  const epic = await prisma.epic.create({
    data: {
      title: 'User Authentication System',
      description: 'Complete user authentication and authorization system',
      status: 'ACTIVE',
      priority: 'HIGH',
    },
  });

  console.log('Created epic:', epic);

  // Create sample story
  const story = await prisma.story.create({
    data: {
      title: 'User Login',
      description: 'Allow users to login with email and password',
      as: 'user',
      iWant: 'to login with email and password',
      soThat: 'I can access my account',
      storyPoints: 5,
      status: 'BACKLOG',
      priority: 'HIGH',
      epicId: epic.id,
      acceptanceCriteria: {
        create: [
          {
            description: 'User can login with valid credentials',
            testable: true,
            satisfied: false,
            order: 0,
          },
          {
            description: 'User receives error for invalid credentials',
            testable: true,
            satisfied: false,
            order: 1,
          },
        ],
      },
    },
  });

  console.log('Created story:', story);

  // Create sample task
  const task = await prisma.task.create({
    data: {
      title: 'Create login API endpoint',
      description: 'Implement POST /api/auth/login endpoint',
      status: 'TODO',
      priority: 'HIGH',
      estimate: 4,
      storyId: story.id,
    },
  });

  console.log('Created task:', task);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
