import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../cross-cutting/db/prisma.module';
import { SpecimenCommandRepositoryPrisma } from './infrastructure/adapters/specimen.command-repository.prisma';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SpecimenCommandRepositoryPrisma],
  exports: [SpecimenCommandRepositoryPrisma],
})
export class SpecimenManagementSharedModule {}
