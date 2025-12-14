import { Module } from '@nestjs/common';
import { PrismaService } from './prismaClient';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const adapter = new PrismaPg({ connectionString });
        const prismaService = new PrismaService({ adapter });
        return prismaService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
