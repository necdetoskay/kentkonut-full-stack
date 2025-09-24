import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUser() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('Found user ID:', user.id);
    } else {
      console.log('No users found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();
