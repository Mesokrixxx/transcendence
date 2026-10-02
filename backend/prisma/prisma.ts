import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

// Change to '../generated/prisma/client'
import { PrismaClient } from '@prisma/client/extension';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

export { prisma };
