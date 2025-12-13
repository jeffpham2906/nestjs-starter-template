import { Logger } from '@nestjs/common';
import { PrismaService } from './db/prismaService';

export async function setup() {
  try {
    const prisma = new PrismaService();
    const logger = new Logger('Application Setup');
    await prisma.$connect();
    logger.log('Database connected successfully');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}
