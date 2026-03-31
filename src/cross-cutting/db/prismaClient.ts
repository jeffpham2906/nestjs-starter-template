import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger;
  constructor(options: Prisma.PrismaClientOptions) {
    super(options);
    this.logger = new Logger('PrismaService');
  }
  async onModuleInit() {
    try {
      await this.$connect().then(() => {
        this.logger.log('Database connection established.');
      });
    } catch (error) {
      this.logger.error('Failed to connect to the database.', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
