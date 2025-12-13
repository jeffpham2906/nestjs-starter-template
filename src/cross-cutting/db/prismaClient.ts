import { Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from 'generated/prisma/client';

export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger: Logger;
  constructor(options: Prisma.PrismaClientOptions) {
    super(options);
    this.logger = new Logger('PrismaService');
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to the database successfully.');
    } catch (error) {
      this.logger.error('Failed to connect to the database.', error);
      throw error;
    }
  }
}
