import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const prisma = new PrismaClient();

export default prisma;
